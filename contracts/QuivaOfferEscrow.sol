// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "https://github.com/hashgraph/hedera-smart-contracts/blob/main/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";

/**
 * @title QuivaOfferEscrow
 * @notice Escrows HBAR and one HTS NFT per offer.
 *
 * Sellers deposit the NFT into this contract before accepting an offer. This
 * is intentionally independent from the deployed ComicMarketplace contract.
 * The Core contract cannot be called for reading access unless this contract
 * is authorized there, so access synchronization must be handled separately.
 */
contract QuivaOfferEscrow is HederaTokenService {
    uint256 public constant FEE_DENOMINATOR = 10_000;

    address public owner;
    address payable public feeCollector;
    uint256 public platformFeePercent;
    uint256 public offerCounter;

    enum OfferKind { Specific, OpenBid }
    enum OfferStatus { Active, Accepted, Cancelled, Expired }

    struct Offer {
        address tokenAddress;
        int64 serialNumber;
        address payable buyer;
        address seller;
        uint256 amount;
        uint256 createdAt;
        uint256 expiresAt;
        OfferKind kind;
        OfferStatus status;
        bool nftDeposited;
    }

    mapping(uint256 => Offer) public offers;

    event OfferCreated(
        uint256 indexed offerId,
        OfferKind kind,
        address indexed buyer,
        address indexed tokenAddress,
        int64 serialNumber,
        uint256 amount,
        uint256 expiresAt
    );
    event NFTDeposited(uint256 indexed offerId, address indexed seller, int64 serialNumber);
    event OfferAccepted(uint256 indexed offerId, address indexed seller, uint256 amount);
    event OfferCancelled(uint256 indexed offerId, address indexed buyer);
    event OfferExpired(uint256 indexed offerId, address indexed buyer, uint256 amount);
    event FeesWithdrawn(address indexed collector, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier activeOffer(uint256 offerId) {
        require(offerId < offerCounter, "Offer does not exist");
        require(offers[offerId].status == OfferStatus.Active, "Offer is not active");
        require(block.timestamp < offers[offerId].expiresAt, "Offer expired");
        _;
    }

    constructor(address payable _feeCollector, uint256 _platformFeePercent) {
        require(_feeCollector != address(0), "Invalid fee collector");
        require(_platformFeePercent <= 1_000, "Fee too high");
        owner = msg.sender;
        feeCollector = _feeCollector;
        platformFeePercent = _platformFeePercent;
    }

    /** @dev The contract must be associated with each HTS token before deposits. */
    function associateToken(address tokenAddress) external onlyOwner returns (int responseCode) {
        responseCode = HederaTokenService.associateToken(tokenAddress, address(this));
        require(responseCode == HederaResponseCodes.SUCCESS, "Token association failed");
    }

    function createSpecificOffer(
        address tokenAddress,
        int64 serialNumber,
        uint256 expiresAt
    ) external payable returns (uint256 offerId) {
        require(tokenAddress != address(0), "Invalid token");
        require(serialNumber > 0, "Invalid serial");
        return _createOffer(OfferKind.Specific, tokenAddress, serialNumber, expiresAt);
    }

    function createOpenBid(address tokenAddress, uint256 expiresAt)
        external
        payable
        returns (uint256 offerId)
    {
        require(tokenAddress != address(0), "Invalid token");
        return _createOffer(OfferKind.OpenBid, tokenAddress, 0, expiresAt);
    }

    function _createOffer(
        OfferKind kind,
        address tokenAddress,
        int64 serialNumber,
        uint256 expiresAt
    ) internal returns (uint256 offerId) {
        require(msg.value > 0, "Amount must be > 0");
        require(expiresAt > block.timestamp, "Invalid expiry");

        offerId = offerCounter++;
        offers[offerId] = Offer({
            tokenAddress: tokenAddress,
            serialNumber: serialNumber,
            buyer: payable(msg.sender),
            seller: address(0),
            amount: msg.value,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            kind: kind,
            status: OfferStatus.Active,
            nftDeposited: false
        });

        emit OfferCreated(offerId, kind, msg.sender, tokenAddress, serialNumber, msg.value, expiresAt);
    }

    /**
     * @dev Seller deposits the NFT that will satisfy the offer.
     * For open bids, the deposited serial becomes the accepted edition.
     */
    function depositNFT(uint256 offerId, int64 serialNumber)
        external
        activeOffer(offerId)
    {
        Offer storage offer = offers[offerId];
        require(!offer.nftDeposited, "NFT already deposited");
        require(serialNumber > 0, "Invalid serial");
        if (offer.kind == OfferKind.Specific) {
            require(serialNumber == offer.serialNumber, "Wrong NFT serial");
        }

        int responseCode = HederaTokenService.transferNFT(
            offer.tokenAddress,
            msg.sender,
            address(this),
            serialNumber
        );
        require(responseCode == HederaResponseCodes.SUCCESS, "NFT deposit failed");

        offer.serialNumber = serialNumber;
        offer.seller = msg.sender;
        offer.nftDeposited = true;
        emit NFTDeposited(offerId, msg.sender, serialNumber);
    }

    function acceptOffer(uint256 offerId) external activeOffer(offerId) {
        Offer storage offer = offers[offerId];
        require(offer.nftDeposited, "Deposit NFT before accepting");
        require(msg.sender == offer.seller, "Not NFT depositor");

        offer.status = OfferStatus.Accepted;
        uint256 fee = (offer.amount * platformFeePercent) / FEE_DENOMINATOR;
        uint256 sellerAmount = offer.amount - fee;

        _transferNFT(offer.tokenAddress, address(this), offer.buyer, offer.serialNumber);
        _sendHbar(offer.seller, sellerAmount);
        if (fee > 0) _sendHbar(feeCollector, fee);

        emit OfferAccepted(offerId, msg.sender, offer.amount);
    }

    function cancelOffer(uint256 offerId) external {
        Offer storage offer = offers[offerId];
        require(offer.status == OfferStatus.Active, "Offer is not active");
        require(msg.sender == offer.buyer, "Not offer buyer");

        offer.status = OfferStatus.Cancelled;
        if (offer.nftDeposited) {
            offer.nftDeposited = false;
            _transferNFT(offer.tokenAddress, address(this), offer.seller, offer.serialNumber);
        }
        _sendHbar(offer.buyer, offer.amount);
        emit OfferCancelled(offerId, offer.buyer);
    }

    function expireOffer(uint256 offerId) external {
        Offer storage offer = offers[offerId];
        require(offer.status == OfferStatus.Active, "Offer is not active");
        require(block.timestamp >= offer.expiresAt, "Offer has not expired");

        offer.status = OfferStatus.Expired;
        if (offer.nftDeposited) {
            offer.nftDeposited = false;
            _transferNFT(offer.tokenAddress, address(this), offer.seller, offer.serialNumber);
        }
        _sendHbar(offer.buyer, offer.amount);
        emit OfferExpired(offerId, offer.buyer, offer.amount);
    }

    function withdrawDepositedNFT(uint256 offerId) external {
        Offer storage offer = offers[offerId];
        require(offer.nftDeposited, "No NFT deposited");
        require(offer.status == OfferStatus.Cancelled || offer.status == OfferStatus.Expired, "Offer still active");
        require(msg.sender == offer.seller, "Not NFT depositor");

        offer.nftDeposited = false;
        _transferNFT(offer.tokenAddress, address(this), offer.seller, offer.serialNumber);
    }

    function withdrawFees() external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "No fees");
        _sendHbar(feeCollector, amount);
        emit FeesWithdrawn(feeCollector, amount);
    }

    function _transferNFT(address tokenAddress, address from, address to, int64 serialNumber) internal {
        int responseCode = HederaTokenService.transferNFT(tokenAddress, from, to, serialNumber);
        require(responseCode == HederaResponseCodes.SUCCESS, "NFT transfer failed");
    }

    function _sendHbar(address payable recipient, uint256 amount) internal {
        if (amount == 0) return;
        (bool sent, ) = recipient.call{value: amount}("");
        require(sent, "HBAR transfer failed");
    }

    receive() external payable {}
}
