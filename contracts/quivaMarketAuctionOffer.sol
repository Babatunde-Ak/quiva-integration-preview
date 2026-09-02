// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import "https://github.com/hiero-ledger/hiero-contracts/blob/main/contracts/token-service/HederaTokenService.sol";
import "@openzeppelin/contracts-upgradeable@5.4.0/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable@5.4.0/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable@5.4.0/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable@5.4.0/utils/ReentrancyGuardUpgradeable.sol";

interface IComicCoreMarketplace {
    function tokenToEpisode(address tokenAddress) external view returns (string memory);
    function grantReadingAccess(address tokenAddress, address user) external;
    function revokeReadingAccess(address tokenAddress, address user) external;
}

/**
 * @title QuivaComicMarketplaceV2
 * @notice Secondary marketplace with fixed-price sales, atomic offers, and English auctions.
 * @dev UUPS-upgradeable. Note: pragma bumped to ^0.8.0 because the upgradeable OZ contracts
 * require it (the original >=0.6.0 range is too permissive for Initializable's storage patterns).
 * Bumping the floor doesn't change any of your original logic — Solidity 0.6/0.7 syntax you had
 * was already valid 0.8 syntax.
 */
contract QuivaComicMarketplace is
    Initializable,
    HederaTokenService,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    uint256 public constant FEE_DENOMINATOR = 10_000;
    uint256 public constant MIN_AUCTION_DURATION = 1 hours;
    uint256 public constant MAX_AUCTION_DURATION = 30 days;
    uint256 public constant ANTI_SNIPE_WINDOW = 10 minutes;
    uint256 public constant ANTI_SNIPE_EXTENSION = 10 minutes;

    IComicCoreMarketplace public comicCore;
    address payable public feeCollector;
    uint256 public platformFeePercent;
    uint256 public minBidIncrementBps; // e.g. 500 = 5%
    uint256 public listingCounter;
    uint256 public offerCounter;
    uint256 public auctionCounter;
    uint256 public accumulatedFees; // fees owed to feeCollector, tracked separately from contract balance

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

    struct Auction {
        address tokenAddress;
        int64 serialNumber;
        address payable seller;
        uint256 reservePrice;
        uint256 startTime;
        uint256 endTime;
        address payable highestBidder;
        uint256 highestBid;
        bool settled;
        bool cancelled;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer) public offers;
    mapping(uint256 => Auction) public auctions;
    mapping(address => mapping(int64 => address)) public nftOwner;
    // outbid bidders (and sellers whose reserve wasn't met) pull their HBAR instead of
    // having it pushed to them — see placeBid() for why
    mapping(address => uint256) public pendingReturns;

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

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed tokenAddress,
        int64 serialNumber,
        address indexed seller,
        uint256 reservePrice,
        uint256 startTime,
        uint256 endTime
    );
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount, uint256 newEndTime);
    event AuctionSettled(uint256 indexed auctionId, address indexed winner, address indexed seller, uint256 amount);
    event AuctionCancelled(uint256 indexed auctionId, address indexed seller);
    event PendingReturnWithdrawn(address indexed account, uint256 amount);

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

    modifier auctionExists(uint256 auctionId) {
        require(auctionId < auctionCounter, "Auction does not exist");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Replaces the old constructor. Call this once, immediately after deploying
    /// behind a proxy (e.g. via hardhat-upgrades `deployProxy`).
    function initialize(address _comicCore, address payable _feeCollector) external initializer {
        require(_comicCore != address(0), "Invalid core");
        require(_feeCollector != address(0), "Invalid fee collector");

        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        comicCore = IComicCoreMarketplace(_comicCore);
        feeCollector = _feeCollector;
        platformFeePercent = 250;
        minBidIncrementBps = 500;
    }

    /// @dev Restricts who can push a new implementation. Swap for a timelock/multisig owner in prod.
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ---------------------------------------------------------------------
    // Fixed-price listings (unchanged behavior, refactored to share helpers)
    // ---------------------------------------------------------------------

    function depositAndListForResale(
        address tokenAddress,
        int64 serialNumber,
        uint256 price
    ) external returns (uint256 listingId) {
        require(price > 0, "Price must be > 0");
        require(bytes(comicCore.tokenToEpisode(tokenAddress)).length > 0, "Invalid comic token");

        _pullNFTFromSeller(tokenAddress, serialNumber, msg.sender);

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
        _settleNFT(listing.tokenAddress, listing.serialNumber, msg.sender);
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
        _settleNFT(listing.tokenAddress, listing.serialNumber, offer.buyer);
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
        require(msg.sender == listing.seller || msg.sender == owner(), "Not authorized");
        listing.isActive = false;
        _returnNFT(listing.tokenAddress, listing.serialNumber, listing.seller);
        emit ListingCancelled(listingId, listing.seller);
    }

    function updateListingPrice(uint256 listingId, uint256 newPrice) external activeListing(listingId) {
        Listing storage listing = listings[listingId];
        require(msg.sender == listing.seller, "Not seller");
        require(newPrice > 0, "Price must be > 0");
        listing.price = newPrice;
        emit ListingPriceUpdated(listingId, newPrice);
    }

    function getListing(uint256 listingId)
        external
        view
        returns (address tokenAddress, int64 serialNumber, address seller, uint256 price, bool isActive)
    {
        Listing memory listing = listings[listingId];
        return (listing.tokenAddress, listing.serialNumber, listing.seller, listing.price, listing.isActive);
    }

    // ---------------------------------------------------------------------
    // Auctions
    // ---------------------------------------------------------------------

    /// @notice Deposit an NFT and open an English auction on it.
    function createAuction(
        address tokenAddress,
        int64 serialNumber,
        uint256 reservePrice,
        uint256 duration
    ) external returns (uint256 auctionId) {
        require(bytes(comicCore.tokenToEpisode(tokenAddress)).length > 0, "Invalid comic token");
        require(duration >= MIN_AUCTION_DURATION && duration <= MAX_AUCTION_DURATION, "Bad duration");

        _pullNFTFromSeller(tokenAddress, serialNumber, msg.sender);

        uint256 nowTs = _now();
        auctionId = auctionCounter++;
        auctions[auctionId] = Auction({
            tokenAddress: tokenAddress,
            serialNumber: serialNumber,
            seller: payable(msg.sender),
            reservePrice: reservePrice,
            startTime: nowTs,
            endTime: nowTs + duration,
            highestBidder: payable(address(0)),
            highestBid: 0,
            settled: false,
            cancelled: false
        });
        nftOwner[tokenAddress][serialNumber] = msg.sender;

        emit AuctionCreated(auctionId, tokenAddress, serialNumber, msg.sender, reservePrice, nowTs, nowTs + duration);
    }

    /// @notice Place a bid that must beat the current high bid by `minBidIncrementBps`.
    /// @dev Outbid funds are credited to `pendingReturns` rather than pushed back with `.call`.
    /// If we pushed refunds here, a bidder could deploy a contract whose `receive()` always
    /// reverts, become the leading bidder, and then no one could ever outbid them (every new
    /// bid's refund-the-loser step would revert the whole transaction) — a classic auction DoS.
    /// Pull-payments close that off: refunds just accumulate and the bidder withdraws separately.
    function placeBid(uint256 auctionId) external payable nonReentrant auctionExists(auctionId) {
        Auction storage a = auctions[auctionId];
        require(!a.cancelled && !a.settled, "Auction not live");
        uint256 nowTs = _now();
        require(nowTs < a.endTime, "Auction ended");
        require(msg.sender != a.seller, "Seller cannot bid");

        uint256 minRequired = a.highestBid == 0
            ? a.reservePrice
            : a.highestBid + (a.highestBid * minBidIncrementBps) / FEE_DENOMINATOR;
        require(msg.value >= minRequired, "Bid too low");

        if (a.highestBidder != address(0)) {
            pendingReturns[a.highestBidder] += a.highestBid;
        }

        a.highestBidder = payable(msg.sender);
        a.highestBid = msg.value;

        // anti-snipe: a bid landing in the closing window pushes the deadline back out,
        // so a sniper can't win by bidding in the last block
        if (a.endTime - nowTs < ANTI_SNIPE_WINDOW) {
            a.endTime = nowTs + ANTI_SNIPE_EXTENSION;
        }

        emit BidPlaced(auctionId, msg.sender, msg.value, a.endTime);
    }

    /// @notice Anyone can trigger settlement once the auction has ended — the winner doesn't
    /// have to call this themselves, and the seller can't stall by refusing to.
    function settleAuction(uint256 auctionId) external nonReentrant auctionExists(auctionId) {
        Auction storage a = auctions[auctionId];
        require(!a.settled && !a.cancelled, "Already finalized");
        require(_now() >= a.endTime, "Auction still live");

        a.settled = true;

        if (a.highestBidder == address(0) || a.highestBid < a.reservePrice) {
            // no bids, or reserve not met: NFT goes back to the seller, any bid gets refunded
            _returnNFT(a.tokenAddress, a.serialNumber, a.seller);
            if (a.highestBidder != address(0)) {
                pendingReturns[a.highestBidder] += a.highestBid;
            }
            emit AuctionSettled(auctionId, address(0), a.seller, 0);
            return;
        }

        _settleNFT(a.tokenAddress, a.serialNumber, a.highestBidder);
        _paySeller(a.seller, a.highestBid);
        emit AuctionSettled(auctionId, a.highestBidder, a.seller, a.highestBid);
    }

    /// @notice Seller (or owner) can cancel only while there are zero bids — once someone has
    /// bid, the auction has to run to settlement so a bidder's HBAR is never stranded mid-auction.
    function cancelAuction(uint256 auctionId) external nonReentrant auctionExists(auctionId) {
        Auction storage a = auctions[auctionId];
        require(!a.settled && !a.cancelled, "Already finalized");
        require(msg.sender == a.seller || msg.sender == owner(), "Not authorized");
        require(a.highestBidder == address(0), "Bids already placed");

        a.cancelled = true;
        _returnNFT(a.tokenAddress, a.serialNumber, a.seller);
        emit AuctionCancelled(auctionId, a.seller);
    }

    /// @notice Withdraw HBAR owed to you from being outbid, or from an auction that closed
    /// below reserve.
    function withdrawPendingReturn() external nonReentrant {
        uint256 amount = pendingReturns[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        pendingReturns[msg.sender] = 0;
        _sendHbar(payable(msg.sender), amount);
        emit PendingReturnWithdrawn(msg.sender, amount);
    }

    function getAuction(uint256 auctionId)
        external
        view
        returns (
            address tokenAddress,
            int64 serialNumber,
            address seller,
            uint256 reservePrice,
            uint256 startTime,
            uint256 endTime,
            address highestBidder,
            uint256 highestBid,
            bool settled,
            bool cancelled
        )
    {
        Auction memory a = auctions[auctionId];
        return (
            a.tokenAddress,
            a.serialNumber,
            a.seller,
            a.reservePrice,
            a.startTime,
            a.endTime,
            a.highestBidder,
            a.highestBid,
            a.settled,
            a.cancelled
        );
    }

    // ---------------------------------------------------------------------
    // Admin
    // ---------------------------------------------------------------------

    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1_000, "Fee too high");
        platformFeePercent = newFee;
    }

    function updateMinBidIncrement(uint256 newBps) external onlyOwner {
        require(newBps <= 2_000, "Increment too high");
        minBidIncrementBps = newBps;
    }

    /// @dev Pays out `accumulatedFees` only — NOT `address(this).balance`. The old version
    /// swept the whole balance, which on this contract now includes HBAR owed to outbid
    /// bidders sitting in `pendingReturns`. Sweeping the raw balance would let the owner
    /// (accidentally or not) drain funds that belong to bidders. Tracking fees separately
    /// fixes that for both the old listing/offer flows and the new auction flow.
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 amount = accumulatedFees;
        require(amount > 0, "No fees");
        accumulatedFees = 0;
        _sendHbar(feeCollector, amount);
    }

    function setComicCore(address newCore) external onlyOwner {
        require(newCore != address(0), "Invalid core");
        comicCore = IComicCoreMarketplace(newCore);
    }

    function setFeeCollector(address payable newCollector) external onlyOwner {
        require(newCollector != address(0), "Invalid fee collector");
        feeCollector = newCollector;
    }

    // ---------------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------------

    /// @dev Pulls an NFT from `from` into escrow. Split out as its own virtual function (used by
    /// both `depositAndListForResale` and `createAuction`) so a test harness can override it to
    /// bypass the Hedera precompile call — see QuivaComicMarketplaceHarness.sol.
    function _pullNFTFromSeller(address tokenAddress, int64 serialNumber, address from) internal virtual {
        int responseCode = HederaTokenService.transferNFT(tokenAddress, from, address(this), serialNumber);
        require(responseCode == HederaResponseCodes.SUCCESS, "Transfer failed");
    }

    function _settleNFT(address tokenAddress, int64 serialNumber, address buyer) internal virtual {
        int responseCode = HederaTokenService.transferNFT(tokenAddress, address(this), buyer, serialNumber);
        require(responseCode == HederaResponseCodes.SUCCESS, "NFT transfer failed");
        nftOwner[tokenAddress][serialNumber] = buyer;
        comicCore.grantReadingAccess(tokenAddress, buyer);
    }

    function _returnNFT(address tokenAddress, int64 serialNumber, address to) internal virtual {
        int responseCode = HederaTokenService.transferNFT(tokenAddress, address(this), to, serialNumber);
        require(responseCode == HederaResponseCodes.SUCCESS, "NFT return failed");
        delete nftOwner[tokenAddress][serialNumber];
    }

    /// @dev Virtual clock hook. Always `block.timestamp` in production; a test harness can
    /// override it with a settable mock clock so auction-expiry and anti-snipe logic can be
    /// tested without waiting real wall-clock time (Remix's Solidity Unit Testing plugin has
    /// no time-travel cheatcode).
    function _now() internal view virtual returns (uint256) {
        return block.timestamp;
    }

    function _paySeller(address seller, uint256 amount) internal {
        uint256 fee = (amount * platformFeePercent) / FEE_DENOMINATOR;
        accumulatedFees += fee;
        _sendHbar(payable(seller), amount - fee);
    }

    function _refund(address recipient, uint256 amount) internal {
        if (amount > 0) _sendHbar(payable(recipient), amount);
    }

    function _sendHbar(address payable recipient, uint256 amount) internal {
        if (amount == 0) return;
        (bool sent, ) = recipient.call{value: amount}("");
        require(sent, "HBAR transfer failed");
    }

    /// @dev Reserve storage slots for future upgrades so new state vars don't collide
    /// with whatever a derived/next version adds.
    uint256[40] private __gap;

    receive() external payable {}
}
