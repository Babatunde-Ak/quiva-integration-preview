// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "https://github.com/hashgraph/hedera-smart-contracts/blob/main/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";

interface IComicCoreMarketplace {
    function tokenToEpisode(address tokenAddress) external view returns (string memory);
    function grantReadingAccess(address tokenAddress, address user) external;
    function revokeReadingAccess(address tokenAddress, address user) external;
}

/**
 * @title QuivaComicMarketplaceV2
 * @notice Secondary marketplace with fixed-price sales and atomic offers.
 *
 * This is a replacement deployment for the immutable Marketplace contract.
 * Offers reference active listings, so the Marketplace already has custody of
 * the NFT when an offer is accepted.
 */
contract QuivaComicMarketplaceV2 is HederaTokenService {
    uint256 public constant FEE_DENOMINATOR = 10_000;

    IComicCoreMarketplace public comicCore;
    address public owner;
    address payable public feeCollector;
    uint256 public platformFeePercent = 250;
    uint256 public listingCounter;
    uint256 public offerCounter;
    uint256 private locked = 1;

    struct Listing {
        address tokenAddress;
        int64 serialNumber;
        address seller;
        uint256 price;
        bool isActive;
    }

    struct Offer {
        uint256 listingId;
        address payable buyer;
        uint256 amount;
        uint256 createdAt;
        uint256 expiresAt;
        bool isActive;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer) public offers;
    mapping(address => mapping(int64 => address)) public nftOwner;

    event NFTListed(
        uint256 indexed listingId,
        address indexed tokenAddress,
        int64 serialNumber,
        address indexed seller,
        uint256 price
    );
    event NFTSold(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 price);
    event ListingCancelled(uint256 indexed listingId, address indexed seller);
    event ListingPriceUpdated(uint256 indexed listingId, uint256 newPrice);
    event OfferCreated(
        uint256 indexed offerId,
        uint256 indexed listingId,
        address indexed buyer,
        uint256 amount,
        uint256 expiresAt
    );
    event OfferCancelled(uint256 indexed offerId, address indexed buyer);
    event OfferRejected(uint256 indexed offerId, address indexed seller);
    event OfferExpired(uint256 indexed offerId, address indexed buyer);
    event OfferAccepted(uint256 indexed offerId, uint256 indexed listingId, address indexed buyer, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier nonReentrant() {
        require(locked == 1, "Reentrant call");
        locked = 2;
        _;
        locked = 1;
    }

    modifier activeListing(uint256 listingId) {
        require(listingId < listingCounter, "Listing does not exist");
        require(listings[listingId].isActive, "Listing not active");
        _;
    }

    modifier activeOffer(uint256 offerId) {
        require(offerId < offerCounter, "Offer does not exist");
        require(offers[offerId].isActive, "Offer not active");
        require(block.timestamp < offers[offerId].expiresAt, "Offer expired");
        _;
    }

    constructor(address _comicCore, address payable _feeCollector) {
        require(_comicCore != address(0), "Invalid core");
        require(_feeCollector != address(0), "Invalid fee collector");
        comicCore = IComicCoreMarketplace(_comicCore);
        owner = msg.sender;
        feeCollector = _feeCollector;
    }

    function depositAndListForResale(
        address tokenAddress,
        int64 serialNumber,
        uint256 price
    ) external returns (uint256 listingId) {
        require(price > 0, "Price must be > 0");
        require(bytes(comicCore.tokenToEpisode(tokenAddress)).length > 0, "Invalid comic token");

        int responseCode = HederaTokenService.transferNFT(
            tokenAddress,
            msg.sender,
            address(this),
            serialNumber
        );
        require(responseCode == HederaResponseCodes.SUCCESS, "Transfer failed");

        listingId = listingCounter++;
        listings[listingId] = Listing(tokenAddress, serialNumber, msg.sender, price, true);
        nftOwner[tokenAddress][serialNumber] = msg.sender;
        emit NFTListed(listingId, tokenAddress, serialNumber, msg.sender, price);
    }

    function purchaseNFT(uint256 listingId) external payable nonReentrant activeListing(listingId) {
        Listing storage listing = listings[listingId];
        require(msg.value >= listing.price, "Insufficient payment");

        uint256 salePrice = listing.price;
        address seller = listing.seller;
        listing.isActive = false;
        _settleNFT(listing, msg.sender);
        _paySeller(seller, salePrice);
        _refund(msg.sender, msg.value - salePrice);
        emit NFTSold(listingId, msg.sender, seller, salePrice);
    }

    function createOffer(uint256 listingId, uint256 expiresAt)
        external
        payable
        activeListing(listingId)
        returns (uint256 offerId)
    {
        require(msg.value > 0, "Amount must be > 0");
        require(expiresAt > block.timestamp, "Invalid expiry");
        require(msg.sender != listings[listingId].seller, "Seller cannot offer");

        offerId = offerCounter++;
        offers[offerId] = Offer(listingId, payable(msg.sender), msg.value, block.timestamp, expiresAt, true);
        emit OfferCreated(offerId, listingId, msg.sender, msg.value, expiresAt);
    }

    function acceptOffer(uint256 offerId) external nonReentrant activeOffer(offerId) {
        Offer storage offer = offers[offerId];
        Listing storage listing = listings[offer.listingId];
        require(listing.isActive, "Listing not active");
        require(msg.sender == listing.seller, "Not listing seller");

        offer.isActive = false;
        listing.isActive = false;
        _settleNFT(listing, offer.buyer);
        _paySeller(listing.seller, offer.amount);
        emit OfferAccepted(offerId, offer.listingId, offer.buyer, offer.amount);
    }

    function cancelOffer(uint256 offerId) external activeOffer(offerId) nonReentrant {
        Offer storage offer = offers[offerId];
        require(msg.sender == offer.buyer, "Not offer buyer");
        offer.isActive = false;
        _sendHbar(offer.buyer, offer.amount);
        emit OfferCancelled(offerId, offer.buyer);
    }

    function rejectOffer(uint256 offerId) external activeOffer(offerId) nonReentrant {
        Offer storage offer = offers[offerId];
        Listing storage listing = listings[offer.listingId];
        require(msg.sender == listing.seller, "Not listing seller");
        offer.isActive = false;
        _sendHbar(offer.buyer, offer.amount);
        emit OfferRejected(offerId, msg.sender);
    }

    function expireOffer(uint256 offerId) external nonReentrant {
        Offer storage offer = offers[offerId];
        require(offer.isActive, "Offer not active");
        require(block.timestamp >= offer.expiresAt, "Offer has not expired");
        offer.isActive = false;
        _sendHbar(offer.buyer, offer.amount);
        emit OfferExpired(offerId, offer.buyer);
    }

    function cancelListing(uint256 listingId) external nonReentrant activeListing(listingId) {
        Listing storage listing = listings[listingId];
        require(msg.sender == listing.seller || msg.sender == owner, "Not authorized");
        listing.isActive = false;
        _returnNFT(listing);
        emit ListingCancelled(listingId, listing.seller);
    }

    function updateListingPrice(uint256 listingId, uint256 newPrice)
        external
        activeListing(listingId)
    {
        Listing storage listing = listings[listingId];
        require(msg.sender == listing.seller, "Not seller");
        require(newPrice > 0, "Price must be > 0");
        listing.price = newPrice;
        emit ListingPriceUpdated(listingId, newPrice);
    }

    function getListing(uint256 listingId) external view returns (
        address tokenAddress,
        int64 serialNumber,
        address seller,
        uint256 price,
        bool isActive
    ) {
        Listing memory listing = listings[listingId];
        return (listing.tokenAddress, listing.serialNumber, listing.seller, listing.price, listing.isActive);
    }

    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1_000, "Fee too high");
        platformFeePercent = newFee;
    }

    function withdrawFees() external onlyOwner nonReentrant {
        uint256 amount = address(this).balance;
        require(amount > 0, "No fees");
        _sendHbar(feeCollector, amount);
    }

    function setComicCore(address newCore) external onlyOwner {
        require(newCore != address(0), "Invalid core");
        comicCore = IComicCoreMarketplace(newCore);
    }

    function _settleNFT(Listing storage listing, address buyer) internal {
        int responseCode = HederaTokenService.transferNFT(
            listing.tokenAddress,
            address(this),
            buyer,
            listing.serialNumber
        );
        require(responseCode == HederaResponseCodes.SUCCESS, "NFT transfer failed");
        nftOwner[listing.tokenAddress][listing.serialNumber] = buyer;
        comicCore.grantReadingAccess(listing.tokenAddress, buyer);
    }

    function _returnNFT(Listing storage listing) internal {
        int responseCode = HederaTokenService.transferNFT(
            listing.tokenAddress,
            address(this),
            listing.seller,
            listing.serialNumber
        );
        require(responseCode == HederaResponseCodes.SUCCESS, "NFT return failed");
        delete nftOwner[listing.tokenAddress][listing.serialNumber];
    }

    function _paySeller(address seller, uint256 amount) internal {
        uint256 fee = (amount * platformFeePercent) / FEE_DENOMINATOR;
        _sendHbar(payable(seller), amount - fee);
        if (fee > 0) _sendHbar(feeCollector, fee);
    }

    function _refund(address recipient, uint256 amount) internal {
        if (amount > 0) _sendHbar(payable(recipient), amount);
    }

    function _sendHbar(address payable recipient, uint256 amount) internal {
        if (amount == 0) return;
        (bool sent, ) = recipient.call{value: amount}("");
        require(sent, "HBAR transfer failed");
    }

    receive() external payable {}
}
