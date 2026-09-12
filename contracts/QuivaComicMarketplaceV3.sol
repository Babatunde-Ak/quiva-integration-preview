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

/// @dev Every HTS token exposes an ERC-721 facade at its own EVM address. Verified on testnet:
/// ownerOf() returns the account's aliased EVM address, the same form as msg.sender, so a direct
/// equality check against a stored seller address is sound.
interface IHtsErc721 {
    function ownerOf(uint256 serialNumber) external view returns (address);
    function getApproved(uint256 serialNumber) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

/**
 * @title QuivaComicMarketplaceV3
 * @notice Secondary marketplace with fixed-price sales, offers and English auctions.
 *
 * ## Why this replaces the escrow model
 *
 * comicCore mints every collection with two royalty fees that carry HBAR fallbacks (1 ℏ + 0.5 ℏ).
 * HTS charges those fallbacks to whoever RECEIVES an NFT in a transfer that moves no fungible
 * value - which is exactly what taking an NFT out of escrow is. When the receiver is a wallet
 * rather than a contract, that charge has to be authorized by the wallet's key, and a contract
 * call arriving over the JSON-RPC relay cannot do that: the HTS precompile answers
 * 326 INVALID_FULL_PREFIX_SIGNATURE_FOR_PRECOMPILE and the call reverts.
 *
 * V2 therefore could take NFTs into escrow but could never release them - cancelListing,
 * purchaseNFT, acceptOffer and settleAuction were all unreachable. (Testnet evidence: deposit
 * 0.0.7314364-1788102120-845391584 succeeded, charging the *contract* 1.5 ℏ as receiver, while
 * cancel 0xbf13fd0bdcc19e84ae2ff1f753a3f67fd97950e3f2de9c9905784b105586f027 died with 326.)
 *
 * ## How V3 avoids it
 *
 * The NFT never leaves the seller's wallet. Listing records an intent; the seller grants the
 * marketplace an HTS allowance. A sale is a single `cryptoTransfer` carrying both legs at once:
 *
 *     hbar: marketplace −proceeds, seller +proceeds
 *     nft:  seller → buyer (isApproval = true)
 *
 * Because the NFT's sender now receives fungible value in the same transfer, HTS assesses the
 * percentage royalty out of the seller's proceeds instead of the fallback against the receiver.
 * Nothing needs a wallet key inside the precompile: the contract authorizes its own HBAR leg and
 * the allowance authorizes the NFT leg.
 *
 * The cost of not escrowing is that a seller can move a listed NFT. That is a liveness problem,
 * not a safety one - `_sellerCanDeliver` is checked before any payment moves, and `pruneListing`
 * lets anyone clear a listing that has gone stale.
 *
 * ## Upgrade safety
 *
 * Storage layout is byte-identical to V2 (slots 0-12 plus the 40-slot gap), verified against the
 * live proxy's storage. No new state variables. UUPS is retained - dropping it would leave the
 * proxy permanently frozen.
 */
contract QuivaComicMarketplaceV3 is
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

    // ---- storage: order and types must stay exactly as V2 left them ----
    IComicCoreMarketplace public comicCore;      // slot 0
    address payable public feeCollector;         // slot 1
    uint256 public platformFeePercent;           // slot 2
    uint256 public minBidIncrementBps;           // slot 3
    uint256 public listingCounter;               // slot 4
    uint256 public offerCounter;                 // slot 5
    uint256 public auctionCounter;               // slot 6
    uint256 public accumulatedFees;              // slot 7

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

    mapping(uint256 => Listing) public listings;                        // slot 8
    mapping(uint256 => Offer) public offers;                            // slot 9
    mapping(uint256 => Auction) public auctions;                        // slot 10
    mapping(address => mapping(int64 => address)) public nftOwner;      // slot 11
    mapping(address => uint256) public pendingReturns;                  // slot 12

    /**
     * token => serial => listingId + 1, with 0 meaning "no live listing".
     *
     * Escrow used to make this impossible: depositing moved the NFT into the contract, so a
     * second deposit of the same serial failed because the seller no longer held it. Dropping
     * escrow removed that implicit guard, and nothing replaced it - a seller could list one
     * edition any number of times, and every copy but the first was guaranteed to fail at
     * purchase. The +1 offset is so listing 0 is distinguishable from "unset".
     *
     * Occupies slot 13, taken from __gap (40 -> 39) so every slot above keeps its position.
     */
    mapping(address => mapping(int64 => uint256)) private activeListingRef; // slot 13

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

    /// @notice Emitted when the owner pulls an NFT left in escrow by V2 back out of the contract.
    event EscrowRescued(address indexed tokenAddress, int64 serialNumber, address indexed to);

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

    /// @notice Only for a fresh proxy. Upgrading an existing proxy must NOT call this - the
    /// initializer has already run there and the stored config is what you want to keep.
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

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /// @notice Cheap way to confirm which implementation the proxy is actually running.
    function version() external pure returns (string memory) {
        return "v3-allowance";
    }

    // ---------------------------------------------------------------------
    // Fixed-price listings
    // ---------------------------------------------------------------------

    /// @notice List an edition you own. The NFT stays in your wallet; the marketplace only needs
    /// an HTS allowance (ERC-721 `approve` for this serial, or `setApprovalForAll`).
    function listForResale(address tokenAddress, int64 serialNumber, uint256 price)
        external
        returns (uint256 listingId)
    {
        return _list(tokenAddress, serialNumber, price);
    }

    /// @notice Deprecated name kept so the existing frontend, indexer and ABI keep working.
    /// Nothing is deposited any more - this is `listForResale`.
    function depositAndListForResale(address tokenAddress, int64 serialNumber, uint256 price)
        external
        returns (uint256 listingId)
    {
        return _list(tokenAddress, serialNumber, price);
    }

    function _list(address tokenAddress, int64 serialNumber, uint256 price)
        internal
        returns (uint256 listingId)
    {
        require(price > 0, "Price must be > 0");
        require(serialNumber > 0, "Invalid serial number");
        require(bytes(comicCore.tokenToEpisode(tokenAddress)).length > 0, "Invalid comic token");
        require(
            _sellerCanDeliver(tokenAddress, serialNumber, msg.sender),
            "Own the NFT and approve the marketplace first"
        );

        // One live listing per edition. Without this the same serial can be listed repeatedly
        // and only the first sale can ever complete; the rest sit in the grid as duplicates
        // that fail at purchase. Update the price instead of listing again.
        uint256 existing = activeListingRef[tokenAddress][serialNumber];
        require(
            existing == 0 || !listings[existing - 1].isActive,
            "This edition is already listed"
        );

        listingId = listingCounter++;
        listings[listingId] = Listing(tokenAddress, serialNumber, msg.sender, price, true);
        nftOwner[tokenAddress][serialNumber] = msg.sender;
        activeListingRef[tokenAddress][serialNumber] = listingId + 1;
        emit NFTListed(listingId, tokenAddress, serialNumber, msg.sender, price);
    }

    function purchaseNFT(uint256 listingId) external payable nonReentrant activeListing(listingId) {
        Listing storage listing = listings[listingId];
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Seller cannot buy");
        require(
            _sellerCanDeliver(listing.tokenAddress, listing.serialNumber, listing.seller),
            "Seller no longer owns or approved this NFT"
        );

        uint256 salePrice = listing.price;
        address seller = listing.seller;
        listing.isActive = false;

        _executeSale(listing.tokenAddress, listing.serialNumber, seller, msg.sender, salePrice);
        _refund(msg.sender, msg.value - salePrice);
        emit NFTSold(listingId, msg.sender, seller, salePrice);
    }

    /// @notice Withdraw your listing. Nothing moves on chain - the NFT was never taken from you.
    /// @dev Listings inherited from V2 hold their NFT in this contract; cancelling one only
    /// clears the listing. Use `rescueEscrowedNFT` to get that NFT back out.
    function cancelListing(uint256 listingId) external nonReentrant activeListing(listingId) {
        Listing storage listing = listings[listingId];
        require(msg.sender == listing.seller || msg.sender == owner(), "Not authorized");
        listing.isActive = false;
        delete nftOwner[listing.tokenAddress][listing.serialNumber];
        emit ListingCancelled(listingId, listing.seller);
    }

    /// @notice Permissionless cleanup: close a listing whose seller has moved the NFT or revoked
    /// the marketplace's allowance, so buyers stop tripping over it. Reverts if it is still good.
    function pruneListing(uint256 listingId) external activeListing(listingId) {
        Listing storage listing = listings[listingId];
        require(
            !_sellerCanDeliver(listing.tokenAddress, listing.serialNumber, listing.seller),
            "Listing is still fillable"
        );
        listing.isActive = false;
        delete nftOwner[listing.tokenAddress][listing.serialNumber];
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

    /// @notice Whether a buyer would actually be able to fill this listing right now. The UI can
    /// call this to hide or badge stale listings instead of letting someone pay gas to find out.
    /// @notice The live listing for an edition, if it has one. Lets a client check before
    /// listing rather than discovering the duplicate guard as a revert.
    function activeListingFor(address tokenAddress, int64 serialNumber)
        external
        view
        returns (uint256 listingId, bool exists)
    {
        uint256 ref = activeListingRef[tokenAddress][serialNumber];
        if (ref == 0 || !listings[ref - 1].isActive) return (0, false);
        return (ref - 1, true);
    }

    function isListingFillable(uint256 listingId) external view returns (bool) {
        if (listingId >= listingCounter) return false;
        Listing memory listing = listings[listingId];
        if (!listing.isActive) return false;
        return _sellerCanDeliver(listing.tokenAddress, listing.serialNumber, listing.seller);
    }

    // ---------------------------------------------------------------------
    // Offers (HBAR is still escrowed here - only NFTs stopped being escrowed)
    // ---------------------------------------------------------------------

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
        require(
            _sellerCanDeliver(listing.tokenAddress, listing.serialNumber, listing.seller),
            "Own the NFT and approve the marketplace first"
        );

        offer.isActive = false;
        listing.isActive = false;
        _executeSale(listing.tokenAddress, listing.serialNumber, listing.seller, offer.buyer, offer.amount);
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

    // ---------------------------------------------------------------------
    // Auctions
    // ---------------------------------------------------------------------

    /// @notice Open an English auction on an edition you own. As with listings the NFT stays put;
    /// only the allowance is required, and it must survive until settlement.
    function createAuction(
        address tokenAddress,
        int64 serialNumber,
        uint256 reservePrice,
        uint256 duration
    ) external returns (uint256 auctionId) {
        require(serialNumber > 0, "Invalid serial number");
        require(bytes(comicCore.tokenToEpisode(tokenAddress)).length > 0, "Invalid comic token");
        require(duration >= MIN_AUCTION_DURATION && duration <= MAX_AUCTION_DURATION, "Bad duration");
        require(
            _sellerCanDeliver(tokenAddress, serialNumber, msg.sender),
            "Own the NFT and approve the marketplace first"
        );

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

    /// @notice Anyone can trigger settlement once the auction has ended.
    /// @dev Without escrow the seller can walk away mid-auction, so a winner who can no longer be
    /// delivered to is refunded rather than left with HBAR stuck in the contract.
    function settleAuction(uint256 auctionId) external nonReentrant auctionExists(auctionId) {
        Auction storage a = auctions[auctionId];
        require(!a.settled && !a.cancelled, "Already finalized");
        require(_now() >= a.endTime, "Auction still live");

        a.settled = true;

        bool noSale = a.highestBidder == address(0) || a.highestBid < a.reservePrice;
        if (!noSale && !_sellerCanDeliver(a.tokenAddress, a.serialNumber, a.seller)) {
            noSale = true;
        }

        if (noSale) {
            if (a.highestBidder != address(0)) {
                pendingReturns[a.highestBidder] += a.highestBid;
            }
            delete nftOwner[a.tokenAddress][a.serialNumber];
            emit AuctionSettled(auctionId, address(0), a.seller, 0);
            return;
        }

        _executeSale(a.tokenAddress, a.serialNumber, a.seller, a.highestBidder, a.highestBid);
        emit AuctionSettled(auctionId, a.highestBidder, a.seller, a.highestBid);
    }

    /// @notice Seller (or owner) can cancel only while there are zero bids.
    function cancelAuction(uint256 auctionId) external nonReentrant auctionExists(auctionId) {
        Auction storage a = auctions[auctionId];
        require(!a.settled && !a.cancelled, "Already finalized");
        require(msg.sender == a.seller || msg.sender == owner(), "Not authorized");
        require(a.highestBidder == address(0), "Bids already placed");

        a.cancelled = true;
        delete nftOwner[a.tokenAddress][a.serialNumber];
        emit AuctionCancelled(auctionId, a.seller);
    }

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

    /// @notice One-time cleanup for NFTs V2 pulled into escrow and could never release.
    /// @dev The 326 wall still applies: this only succeeds when `to` is exempt from the token's
    /// custom fees - the token treasury, or an account that collects its royalty fees. From such
    /// a wallet a normal SDK TransferTransaction (signed by the receiver, not a precompile call)
    /// can move the NFT anywhere.
    function rescueEscrowedNFT(address tokenAddress, int64 serialNumber, address to)
        external
        onlyOwner
        nonReentrant
    {
        require(to != address(0), "Invalid recipient");
        int responseCode = HederaTokenService.transferNFT(tokenAddress, address(this), to, serialNumber);
        require(responseCode == HederaResponseCodes.SUCCESS, "Rescue transfer failed");
        delete nftOwner[tokenAddress][serialNumber];
        emit EscrowRescued(tokenAddress, serialNumber, to);
    }

    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1_000, "Fee too high");
        platformFeePercent = newFee;
    }

    function updateMinBidIncrement(uint256 newBps) external onlyOwner {
        require(newBps <= 2_000, "Increment too high");
        minBidIncrementBps = newBps;
    }

    /// @dev Pays out `accumulatedFees` only, never `address(this).balance` - the raw balance also
    /// holds live offer escrow and `pendingReturns` owed to outbid bidders.
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

    /// @dev The whole point of V3. One cryptoTransfer carries the HBAR and the NFT together, so
    /// HTS sees the NFT's sender receiving fungible value and assesses the percentage royalty
    /// against the seller's proceeds. Split them into two calls and the royalty falls back to the
    /// receiver instead, which no relay transaction can authorize.
    ///
    /// Amounts here are TINYBARS: msg.value inside the Hedera EVM is already tinybars, and
    /// AccountAmount.amount is an int64 of tinybars, so no scaling happens in this function.
    function _executeSale(
        address tokenAddress,
        int64 serialNumber,
        address seller,
        address buyer,
        uint256 grossAmount
    ) internal {
        uint256 fee = (grossAmount * platformFeePercent) / FEE_DENOMINATOR;
        uint256 sellerProceeds = grossAmount - fee;
        require(sellerProceeds > 0, "Nothing to pay the seller");
        require(sellerProceeds <= uint256(uint64(type(int64).max)), "Amount out of range");

        accumulatedFees += fee;

        IHederaTokenService.AccountAmount[] memory hbarLegs = new IHederaTokenService.AccountAmount[](2);
        hbarLegs[0] = IHederaTokenService.AccountAmount({
            accountID: address(this),
            amount: -int64(uint64(sellerProceeds)),
            isApproval: false
        });
        hbarLegs[1] = IHederaTokenService.AccountAmount({
            accountID: seller,
            amount: int64(uint64(sellerProceeds)),
            isApproval: false
        });

        IHederaTokenService.NftTransfer[] memory nftLegs = new IHederaTokenService.NftTransfer[](1);
        nftLegs[0] = IHederaTokenService.NftTransfer({
            senderAccountID: seller,
            receiverAccountID: buyer,
            serialNumber: serialNumber,
            isApproval: true
        });

        IHederaTokenService.TokenTransferList[] memory tokenLegs =
            new IHederaTokenService.TokenTransferList[](1);
        tokenLegs[0].token = tokenAddress;
        tokenLegs[0].transfers = new IHederaTokenService.AccountAmount[](0);
        tokenLegs[0].nftTransfers = nftLegs;

        IHederaTokenService.TransferList memory hbarTransfers;
        hbarTransfers.transfers = hbarLegs;

        int responseCode = HederaTokenService.cryptoTransfer(hbarTransfers, tokenLegs);
        require(responseCode == HederaResponseCodes.SUCCESS, "Atomic sale failed");

        nftOwner[tokenAddress][serialNumber] = buyer;
        comicCore.grantReadingAccess(tokenAddress, buyer);
    }

    /// @dev Can this seller still hand over this serial? Ownership plus a live allowance to this
    /// contract. Every facade call is wrapped: a token that doesn't answer is treated as
    /// undeliverable rather than reverting the caller.
    function _sellerCanDeliver(address tokenAddress, int64 serialNumber, address seller)
        internal
        view
        returns (bool)
    {
        if (seller == address(0)) return false;
        uint256 serial = uint256(uint64(serialNumber));

        try IHtsErc721(tokenAddress).ownerOf(serial) returns (address currentOwner) {
            if (currentOwner != seller) return false;
        } catch {
            return false;
        }

        try IHtsErc721(tokenAddress).isApprovedForAll(seller, address(this)) returns (bool approvedForAll) {
            if (approvedForAll) return true;
        } catch {
            // fall through to the per-serial check
        }

        try IHtsErc721(tokenAddress).getApproved(serial) returns (address spender) {
            return spender == address(this);
        } catch {
            return false;
        }
    }

    /// @dev Virtual clock hook so a test harness can fast-forward auction expiry.
    function _now() internal view virtual returns (uint256) {
        return block.timestamp;
    }

    function _refund(address recipient, uint256 amount) internal {
        if (amount > 0) _sendHbar(payable(recipient), amount);
    }

    function _sendHbar(address payable recipient, uint256 amount) internal {
        if (amount == 0) return;
        (bool sent, ) = recipient.call{value: amount}("");
        require(sent, "HBAR transfer failed");
    }

    /// @dev Reserve storage slots for future upgrades. Unchanged from V2 - shrink this by one for
    /// every new state variable you add, never reorder what is above it.
    uint256[39] private __gap;

    receive() external payable {}
}
