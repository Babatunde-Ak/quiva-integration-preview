// // // SPDX-License-Identifier: Apache-2.0
// // pragma solidity ^0.8.24;
// // import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// // /**
// //  * @title Advanced HTS NFT Marketplace (Kiloscribe-compatible)
// //  * @notice Marketplace with automatic original seller tracking, full royalty split, and listings.
// //  * @dev Supports listing multiple serial numbers and buying individual or multiple copies
// //  */

// // interface IHederaTokenService {
// //     struct NonFungibleTokenInfo {
// //         address ownerId;
// //         int64 creationTime;
// //         bytes metadata;
// //         address spenderId;
// //         string name;
// //         string symbol;
// //         string memo;
// //     }
    
// //     function transferNFT(address token, address sender, address receiver, int64[] memory serialNumbers) external returns (int64 responseCode);
// //     function getTokenInfo(address token) external view returns (string memory name, string memory symbol, string memory memo);
// //     function getNonFungibleTokenInfo(address token, int64 serialNumber) external view returns (int responseCode, NonFungibleTokenInfo memory tokenInfo);
// //     function transferToken(address token, address sender, address receiver, int64 amount) external returns (int responseCode);
// // }

// // interface IERC20 {
// //     function transferFrom(address from, address to, uint256 amount) external returns (bool);
// //     function transfer(address to, uint256 amount) external returns (bool);
// // }

// // contract QuivaMarketplace is ReentrancyGuard {
// //     address public platformOwner;
// //     uint256 public platformFeeBps = 2000; // 20%
// //     address private treasuryWallet;
// //     uint256 public totalSalesVolume;
// //     IHederaTokenService public hts;
    
// //     // Track original seller for each serial number
// //     mapping(address => mapping(int64 => address)) public originalSellerOf;

// //     struct RoyaltyInfo {
// //         address originalSeller;
// //         address currentSeller;
// //         address recipient;
// //         uint96 bps;
// //     }

// //     struct Listing {
// //         address seller;
// //         address tokenAddress;
// //         int64[] serials; // Available serial numbers
// //         uint256 pricePerNFT; // Price per single NFT
// //         bool active;
// //         RoyaltyInfo royalty;
// //         address paymentToken; // address(0) for HBAR
// //         string fullMetadataURI; // unlocked only after purchase
// //     }

// //     mapping(uint256 => Listing) public listings;
// //     uint256 public totalListings;

// //     event NFTListed(uint256 indexed listingId, address indexed seller, address token, int64[] serials, uint256 pricePerNFT, string metadata);
// //     event NFTSold(uint256 indexed listingId, address indexed buyer, int64[] serialsBought, uint256 totalPrice);
// //     event FundsDistributed(address indexed tokenAddress, int64[] serials, uint256 totalAmount, uint256 platformCut, uint256 ownerCut, uint256 originalSellerCut, uint256 currentSellerCut);
// //     event HbarReceived(address indexed sender, uint256 amount);
// //     event ListingCancelled(uint256 indexed listingId);

// //     constructor(address _treasury, address _htsAddress) { // 0x0000000000000000000000000000000000000167); // precompile contract hardcoded
// //         require(_treasury != address(0), "Invalid treasury");
// //         require(_htsAddress != address(0), "Invalid HTS address");
// //         platformOwner = msg.sender;
// //         treasuryWallet = _treasury;
// //         hts = IHederaTokenService(_htsAddress);
// //     }

// //     modifier onlyOwner() {
// //         require(msg.sender == platformOwner, "Not platform owner");
// //         _;
// //     }

// //     /**
// //      * @notice List NFTs for sale. Automatically tracks the first seller (original seller) of each NFT.
// //      * @param token The token address
// //      * @param serials Array of serial numbers to list
// //      * @param pricePerNFT Price for each individual NFT
// //      * @param royaltyRecipient Address to receive royalties
// //      * @param royaltyBps Royalty basis points (max 2000 = 20%)
// //      * @param paymentToken Token for payment (address(0) for HBAR)
// //      * @param fullMetadataURI Metadata URI unlocked after purchase
// //      */
// //     function listNFT(
// //         address token,
// //         int64[] memory serials,
// //         uint256 pricePerNFT,
// //         address royaltyRecipient,
// //         uint96 royaltyBps,
// //         address paymentToken,
// //         string calldata fullMetadataURI
// //     ) external {
// //         require(serials.length > 0, "No serials provided");
// //         require(pricePerNFT > 0, "Price must be > 0");
// //         require(royaltyBps <= 2000, "Royalty too high (max 20%)");

// //         // Track original sellers for each serial
// //         for (uint256 i = 0; i < serials.length; i++) {
// //             if (originalSellerOf[token][serials[i]] == address(0)) {
// //                 originalSellerOf[token][serials[i]] = msg.sender;
// //             }
// //         }

// //         // Transfer all NFTs to marketplace contract
// //         int64 response = hts.transferNFT(token, msg.sender, address(this), serials);
// //         require(response == 22, "HTS transfer failed");

// //         totalListings++;

// //         listings[totalListings] = Listing({
// //             seller: msg.sender,
// //             tokenAddress: token,
// //             serials: serials,
// //             pricePerNFT: pricePerNFT,
// //             active: true,
// //             royalty: RoyaltyInfo(
// //                 originalSellerOf[token][serials[0]], 
// //                 msg.sender, 
// //                 royaltyRecipient, 
// //                 royaltyBps
// //             ),
// //             paymentToken: paymentToken,
// //             fullMetadataURI: fullMetadataURI
// //         });

// //         emit NFTListed(totalListings, msg.sender, token, serials, pricePerNFT, fullMetadataURI);
// //     }

// //     /**
// //      * @notice Buy one or more NFTs from a listing
// //      * @param listingId The listing ID
// //      * @param quantity Number of NFTs to buy
// //      */
// //     function buyItem(uint256 listingId, uint256 quantity) external nonReentrant payable {
// //         Listing storage item = listings[listingId];
// //         require(item.active, "Listing inactive");
// //         require(quantity > 0, "Quantity must be > 0");
// //         require(quantity <= item.serials.length, "Not enough NFTs available");

// //         uint256 totalAmount = item.pricePerNFT * quantity;

// //         // Get the serials to transfer
// //         int64[] memory serialsToTransfer = new int64[](quantity);
// //         for (uint256 i = 0; i < quantity; i++) {
// //             serialsToTransfer[i] = item.serials[i];
// //         }

// //         // Handle payment
// //         if (item.paymentToken == address(0)) {
// //             // Pay with HBAR
// //             require(msg.value == totalAmount, "Incorrect HBAR sent");
// //             _distributeFundsHBAR(item, totalAmount);
// //         } else {
// //             // Pay with HTS token
// //             require(msg.value == 0, "Do not send HBAR for token payment");
// //             _distributeFundsHTS(item);
// //         }

// //         // Transfer NFTs to buyer
// //         int64 response = hts.transferNFT(item.tokenAddress, address(this), msg.sender, serialsToTransfer);
// //         require(response == 22, "HTS transfer to buyer failed");

// //         // Update listing: remove bought serials
// //         _removeSerials(item, quantity);

// //         // Deactivate listing if all NFTs sold
// //         if (item.serials.length == 0) {
// //             item.active = false;
// //         }

// //         totalSalesVolume += totalAmount;

// //         emit NFTSold(listingId, msg.sender, serialsToTransfer, totalAmount);
// //     }

// //     /**
// //      * @notice Cancel a listing and return NFTs to seller
// //      * @param listingId The listing ID to cancel
// //      */
// //     function cancelListing(uint256 listingId) external nonReentrant {
// //         Listing storage item = listings[listingId];
// //         require(item.active, "Listing not active");
// //         require(msg.sender == item.seller, "Not the seller");

// //         item.active = false;

// //         // Return all NFTs to seller
// //         int64 response = hts.transferNFT(item.tokenAddress, address(this), item.seller, item.serials);
// //         require(response == 22, "HTS transfer back failed");

// //         emit ListingCancelled(listingId);
// //     }

// //     /**
// //      * @notice Remove bought serials from listing
// //      */
// //     function _removeSerials(Listing storage item, uint256 quantity) internal {
// //         uint256 remaining = item.serials.length - quantity;
// //         int64[] memory newSerials = new int64[](remaining);
        
// //         for (uint256 i = 0; i < remaining; i++) {
// //             newSerials[i] = item.serials[i + quantity];
// //         }
        
// //         item.serials = newSerials;
// //     }

// //     /**
// //      * @notice Distribute funds for HBAR payments
// //      */
// //     function _distributeFundsHBAR(Listing storage item, uint256 amount) internal {
// //         uint256 platformCut = (amount * platformFeeBps) / 10000; // 20%
// //         uint256 royaltyBase = amount - platformCut; // remaining 80%

// //         uint256 royaltyTotal = (royaltyBase * item.royalty.bps) / 10000;
// //         uint256 ownerCut = (royaltyTotal * 500) / 10000; // 5% of royalties
// //         uint256 originalSellerCut = (royaltyTotal * 1500) / 10000; // 15% of royalties
// //         uint256 currentSellerCut = royaltyBase - royaltyTotal; // rest to seller

// //         if (platformCut > 0) payable(treasuryWallet).transfer(platformCut);
// //         if (ownerCut > 0) payable(treasuryWallet).transfer(ownerCut);
// //         if (item.royalty.originalSeller != address(0) && originalSellerCut > 0) {
// //             payable(item.royalty.originalSeller).transfer(originalSellerCut);
// //         }
// //         payable(item.royalty.currentSeller).transfer(currentSellerCut);

// //         emit FundsDistributed(item.tokenAddress, item.serials, amount, platformCut, ownerCut, originalSellerCut, currentSellerCut);
// //     }

// //     /**
// //      * @notice Distribute funds for HTS token payments
// //      */

// //           function _distributeFundsHTS(Listing storage item) internal {
// //         // uint256 amount = item.price;
// //         // uint256 platformCut = (amount * platformFeeBps) / 10000;
// //         // uint256 royaltyTotal = (amount * item.royalty.bps) / 10000;
// //         // uint256 ownerCut = (royaltyTotal * 500) / 10000;
// //         // uint256 originalSellerCut = (royaltyTotal * 1500) / 10000;
// //         // uint256 currentSellerCut = (amount * 8000) / 10000;

// //     uint256 amount = item.pricePerNFT;

// //     uint256 platformCut = (amount * platformFeeBps) / 10000; // 20%
// //     uint256 royaltyBase = amount - platformCut; // remaining 80%

// //     uint256 royaltyTotal = (royaltyBase * item.royalty.bps) / 10000;
// //     uint256 ownerCut = (royaltyTotal * 500) / 10000; // 5% of royalties
// //     uint256 originalSellerCut = (royaltyTotal * 1500) / 10000; // 15% of royalties
// //     uint256 currentSellerCut = royaltyBase - royaltyTotal; // rest to seller

// //         if (platformCut > 0) hts.transferToken(item.tokenAddress, msg.sender,treasuryWallet, int64(uint64(platformCut)));
// //         if (ownerCut > 0) hts.transferToken(item.tokenAddress, msg.sender,treasuryWallet, int64(uint64(ownerCut)));
// //         if (item.royalty.originalSeller != address(0) && originalSellerCut > 0) hts.transferToken(item.tokenAddress, msg.sender,item.royalty.originalSeller, int64(uint64(originalSellerCut)));
// //          hts.transferToken(item.tokenAddress, msg.sender,item.royalty.currentSeller, int64(uint64(currentSellerCut)));
// //     }
// //     // function _distributeFundsHTS(Listing storage item, uint256 amount) internal {
// //     //     uint256 platformCut = (amount * platformFeeBps) / 10000; // 20%
// //     //     uint256 royaltyBase = amount - platformCut; // remaining 80%

// //     //     uint256 royaltyTotal = (royaltyBase * item.royalty.bps) / 10000;
// //     //     uint256 ownerCut = (royaltyTotal * 500) / 10000; // 5% of royalties
// //     //     uint256 originalSellerCut = (royaltyTotal * 1500) / 10000; // 15% of royalties
// //     //     uint256 currentSellerCut = royaltyBase - royaltyTotal; // rest to seller

// //     //     if (platformCut > 0) {
// //     //         int64 resp = hts.transferToken(item.paymentToken, msg.sender, treasuryWallet, int64(uint64(platformCut)));
// //     //         require(resp == 22, "Platform cut transfer failed");
// //     //     }
// //     //     if (ownerCut > 0) {
// //     //         int64 resp = hts.transferToken(item.paymentToken, msg.sender, treasuryWallet, int64(uint64(ownerCut)));
// //     //         require(resp == 22, "Owner cut transfer failed");
// //     //     }
// //     //     if (item.royalty.originalSeller != address(0) && originalSellerCut > 0) {
// //     //         int64 resp = hts.transferToken(item.paymentToken, msg.sender, item.royalty.originalSeller, int64(uint64(originalSellerCut)));
// //     //         require(resp == 22, "Original seller cut transfer failed");
// //     //     }
// //     //     int64 resp = hts.transferToken(item.paymentToken, msg.sender, item.royalty.currentSeller, int64(uint64(currentSellerCut)));
// //     //     require(resp == 22, "Current seller cut transfer failed");

// //     //     emit FundsDistributed(item.tokenAddress, item.serials, amount, platformCut, ownerCut, originalSellerCut, currentSellerCut);
// //     // }

// //     /**
// //      * @notice Get marketplace statistics
// //      */
// //     function getMarketplaceStats() external view returns (uint256 totalList, uint256 volumeSales) {
// //         return (totalListings, totalSalesVolume);
// //     }

// //     /**
// //      * @notice Get full content metadata (only for purchased NFTs)
// //      */
// //     function getFullContent(uint256 listingId, address buyer) external view returns (string memory) {
// //         Listing memory item = listings[listingId];
// //         require(!item.active || item.serials.length == 0, "NFTs still available");
// //         return item.fullMetadataURI;
// //     }

// //     /**
// //      * @notice Get all active listings
// //      */
// //     function getActiveListings() public view returns (Listing[] memory) {
// //         uint256 activeCount = 0;
// //         for (uint256 i = 1; i <= totalListings; i++) {
// //             if (listings[i].active) {
// //                 activeCount++;
// //             }
// //         }

// //         Listing[] memory activeListings = new Listing[](activeCount);
// //         uint256 idx = 0;
// //         for (uint256 i = 1; i <= totalListings; i++) {
// //             if (listings[i].active) {
// //                 activeListings[idx] = listings[i];
// //                 idx++;
// //             }
// //         }

// //         return activeListings;
// //     }

// //     /**
// //      * @notice Get available quantity for a listing
// //      */
// //     function getAvailableQuantity(uint256 listingId) external view returns (uint256) {
// //         return listings[listingId].serials.length;
// //     }

// //     /**
// //      * @notice Update platform fee (only owner)
// //      */
// //     function setPlatformFee(uint256 newFeeBps) external onlyOwner {
// //         require(newFeeBps <= 5000, "Fee too high (max 50%)");
// //         platformFeeBps = newFeeBps;
// //     }

// //     /**
// //      * @notice Update treasury wallet (only owner)
// //      */
// //     function setTreasuryWallet(address newTreasury) external onlyOwner {
// //         require(newTreasury != address(0), "Invalid address");
// //         treasuryWallet = newTreasury;
// //     }

// //     receive() external payable {
// //         emit HbarReceived(msg.sender, msg.value);
// //     }

// //     fallback() external payable {
// //         emit HbarReceived(msg.sender, msg.value);
// //     }
// // }





// //New Contrract


// // SPDX-License-Identifier: Apache-2.0
// pragma solidity ^0.8.24;
// import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// /**
//  * @title Advanced HTS NFT Marketplace (Kiloscribe-compatible)
//  * @notice Marketplace with automatic original seller tracking, full royalty split, and listings.
//  * @dev Supports listing multiple serial numbers and buying individual or multiple copies
//  */

// interface IHederaTokenService {
//     struct NonFungibleTokenInfo {
//         address ownerId;
//         int64 creationTime;
//         bytes metadata;
//         address spenderId;
//         string name;
//         string symbol;
//         string memo;
//     }
    
//     function transferNFT(address token, address sender, address receiver, int64[] memory serialNumbers) external returns (int64 responseCode);
//     function getTokenInfo(address token) external view returns (string memory name, string memory symbol, string memory memo);
//     function getNonFungibleTokenInfo(address token, int64 serialNumber) external view returns (int responseCode, NonFungibleTokenInfo memory tokenInfo);
//     function transferToken(address token, address sender, address receiver, int64 amount) external returns (int responseCode);
//     function associateToken(address account, address token) external returns (int64 responseCode);
//     function associateTokens(address account, address[] memory tokens) external returns (int64 responseCode);
//     function approveForAll(address token, address sender, address receiver, bool approved) external returns (int64 responseCode);
//       function setApprovalForAll(
//         address token,
//         address operator,
//         bool approved
//     ) external returns (int64 responseCode);
// }   

// interface IERC20 {
//     function transferFrom(address from, address to, uint256 amount) external returns (bool);
//     function transfer(address to, uint256 amount) external returns (bool);
// }

// contract QuivaMarketplace is ReentrancyGuard {
//     address public platformOwner;
//     uint256 public platformFeeBps = 2000; // 20%
//     address private treasuryWallet;
//     uint256 public totalSalesVolume;
//     IHederaTokenService public hts;
    
//     // Track original seller for each serial number
//     mapping(address => mapping(int64 => address)) public originalSellerOf;
//     mapping(address => bool) public tokenAssociated;

//     struct RoyaltyInfo {
//         address originalSeller;
//         address currentSeller;
//         address recipient;
//         uint96 bps;
//     }

//     struct Listing {
//         address seller;
//         address tokenAddress;
//         int64[] serials; // Available serial numbers
//         uint256 pricePerNFT; // Price per single NFT
//         bool active;
//         RoyaltyInfo royalty;
//         address paymentToken; // address(0) for HBAR
//         string fullMetadataURI; // unlocked only after purchase
//     }

//     mapping(uint256 => Listing) public listings;
//     uint256 public totalListings;

//     event NFTListed(uint256 indexed listingId, address indexed seller, address token, int64[] serials, uint256 pricePerNFT, string metadata);
//     event NFTSold(uint256 indexed listingId, address indexed buyer, int64[] serialsBought, uint256 totalPrice);
//     event FundsDistributed(address indexed tokenAddress, int64[] serials, uint256 totalAmount, uint256 platformCut, uint256 ownerCut, uint256 originalSellerCut, uint256 currentSellerCut);
//     event HbarReceived(address indexed sender, uint256 amount);
//     event ListingCancelled(uint256 indexed listingId);
//     event TokenAssociated(address indexed token);

//     constructor(address _treasury, address _htsAddress) { // 0x0000000000000000000000000000000000000167); // precompile contract hardcoded
//         require(_treasury != address(0), "Invalid treasury");
//         require(_htsAddress != address(0), "Invalid HTS address");
//         platformOwner = msg.sender;
//         treasuryWallet = _treasury;
//         hts = IHederaTokenService(_htsAddress);
//     }

//     modifier onlyOwner() {
//         require(msg.sender == platformOwner, "Not platform owner");
//         _;
//     }
    

//       /**
//      * @notice Associate a token with this contract (called automatically if needed)
//      * @dev This allows the contract to hold this token type
//      */
//     function associateTokenWithContract(address token) public onlyOwner returns (int64) {
//         require(token != address(0), "Invalid token address");
        
//         if (tokenAssociated[token]) {
//             return 22; // Already associated (SUCCESS)
//         }

//         int64 response = hts.associateToken(msg.sender, token);
//         require(response == 22, "Token association failed");
        
//         tokenAssociated[token] = true;
//         emit TokenAssociated(token);
        
//         return response;
//     }

//      function approveNFT(address token) external nonReentrant returns(int64) {
//        int64 response = hts.setApprovalForAll(token, msg.sender, true);
//        require(response == 22, "Approve Failed");
//        return  response;
//      }
//     /**
//      * @notice List NFTs for sale. Automatically tracks the first seller (original seller) of each NFT.
//      * @param token The token address
//      * @param serials Array of serial numbers to list
//      * @param pricePerNFT Price for each individual NFT
//      * @param royaltyRecipient Address to receive royalties
//      * @param royaltyBps Royalty basis points (max 2000 = 20%)
//      * @param paymentToken Token for payment (address(0) for HBAR)
//      * @param fullMetadataURI Metadata URI unlocked after purchase
//      */
//     function listNFT(
//         address token,
//         int64[] memory serials,
//         uint256 pricePerNFT,
//         address royaltyRecipient,
//         uint96 royaltyBps,
//         address paymentToken,
//         string calldata fullMetadataURI
//     ) external {
//         require(serials.length > 0, "No serials provided");
//         require(pricePerNFT > 0, "Price must be > 0");
//         require(royaltyBps <= 2000, "Royalty too high (max 20%)");

//         //  // 🔥 AUTO-ASSOCIATE if not already associated
//         // if (!tokenAssociated[token]) {
//         //     int64 assocResponse = associateTokenWithContract(token);
//         //     require(assocResponse == 22, "Auto-association failed");
//         // }

//         // Track original sellers for each serial
//         for (uint256 i = 0; i < serials.length; i++) {
//             if (originalSellerOf[token][serials[i]] == address(0)) {
//                 originalSellerOf[token][serials[i]] = msg.sender;
//             }
//         }
        
        
//         // Transfer all NFTs to marketplace contract
//         int64 response = hts.transferNFT(token, msg.sender, address(this), serials);
//         require(response == 22, "HTS transfer failed");

//         totalListings++;

//         listings[totalListings] = Listing({
//             seller: msg.sender,
//             tokenAddress: token,
//             serials: serials,
//             pricePerNFT: pricePerNFT,
//             active: true,
//             royalty: RoyaltyInfo(
//                 originalSellerOf[token][serials[0]], 
//                 msg.sender, 
//                 royaltyRecipient, 
//                 royaltyBps
//             ),
//             paymentToken: paymentToken,
//             fullMetadataURI: fullMetadataURI
//         });

//         emit NFTListed(totalListings, msg.sender, token, serials, pricePerNFT, fullMetadataURI);
//     }

//     /**
//      * @notice Buy one or more NFTs from a listing
//      * @param listingId The listing ID
//      * @param quantity Number of NFTs to buy
//      */
//     function buyItem(uint256 listingId, uint256 quantity) external nonReentrant payable {
//         Listing storage item = listings[listingId];
//         require(item.active, "Listing inactive");
//         require(quantity > 0, "Quantity must be > 0");
//         require(quantity <= item.serials.length, "Not enough NFTs available");

//         uint256 totalAmount = item.pricePerNFT * quantity;

//         // Get the serials to transfer
//         int64[] memory serialsToTransfer = new int64[](quantity);
//         for (uint256 i = 0; i < quantity; i++) {
//             serialsToTransfer[i] = item.serials[i];
//         }

//         // Handle payment
//         if (item.paymentToken == address(0)) {
//             // Pay with HBAR
//             require(msg.value == totalAmount, "Incorrect HBAR sent");
//             _distributeFundsHBAR(item, totalAmount);
//         } else {
//             // Pay with HTS token
//             require(msg.value == 0, "Do not send HBAR for token payment");
//             _distributeFundsHTS(item);
//         }

//         // Transfer NFTs to buyer
//         int64 response = hts.transferNFT(item.tokenAddress, address(this), msg.sender, serialsToTransfer);
//         require(response == 22, "HTS transfer to buyer failed");

//         // Update listing: remove bought serials
//         _removeSerials(item, quantity);

//         // Deactivate listing if all NFTs sold
//         if (item.serials.length == 0) {
//             item.active = false;
//         }

//         totalSalesVolume += totalAmount;

//         emit NFTSold(listingId, msg.sender, serialsToTransfer, totalAmount);
//     }

//     /**
//      * @notice Cancel a listing and return NFTs to seller
//      * @param listingId The listing ID to cancel
//      */
//     function cancelListing(uint256 listingId) external nonReentrant {
//         Listing storage item = listings[listingId];
//         require(item.active, "Listing not active");
//         require(msg.sender == item.seller, "Not the seller");

//         item.active = false;

//         // Return all NFTs to seller
//         int64 response = hts.transferNFT(item.tokenAddress, address(this), item.seller, item.serials);
//         require(response == 22, "HTS transfer back failed");

//         emit ListingCancelled(listingId);
//     }

//     /**
//      * @notice Remove bought serials from listing
//      */
//     function _removeSerials(Listing storage item, uint256 quantity) internal {
//         uint256 remaining = item.serials.length - quantity;
//         int64[] memory newSerials = new int64[](remaining);
        
//         for (uint256 i = 0; i < remaining; i++) {
//             newSerials[i] = item.serials[i + quantity];
//         }
        
//         item.serials = newSerials;
//     }

//     /**
//      * @notice Distribute funds for HBAR payments
//      */
//     function _distributeFundsHBAR(Listing storage item, uint256 amount) internal {
//         uint256 platformCut = (amount * platformFeeBps) / 10000; // 20%
//         uint256 royaltyBase = amount - platformCut; // remaining 80%

//         uint256 royaltyTotal = (royaltyBase * item.royalty.bps) / 10000;
//         uint256 ownerCut = (royaltyTotal * 500) / 10000; // 5% of royalties
//         uint256 originalSellerCut = (royaltyTotal * 1500) / 10000; // 15% of royalties
//         uint256 currentSellerCut = royaltyBase - royaltyTotal; // rest to seller

//         if (platformCut > 0) payable(treasuryWallet).transfer(platformCut);
//         if (ownerCut > 0) payable(treasuryWallet).transfer(ownerCut);
//         if (item.royalty.originalSeller != address(0) && originalSellerCut > 0) {
//             payable(item.royalty.originalSeller).transfer(originalSellerCut);
//         }
//         payable(item.royalty.currentSeller).transfer(currentSellerCut);

//         emit FundsDistributed(item.tokenAddress, item.serials, amount, platformCut, ownerCut, originalSellerCut, currentSellerCut);
//     }

//     /**
//      * @notice Distribute funds for HTS token payments
//      */

//           function _distributeFundsHTS(Listing storage item) internal {
//         // uint256 amount = item.price;
//         // uint256 platformCut = (amount * platformFeeBps) / 10000;
//         // uint256 royaltyTotal = (amount * item.royalty.bps) / 10000;
//         // uint256 ownerCut = (royaltyTotal * 500) / 10000;
//         // uint256 originalSellerCut = (royaltyTotal * 1500) / 10000;
//         // uint256 currentSellerCut = (amount * 8000) / 10000;

//     uint256 amount = item.pricePerNFT;

//     uint256 platformCut = (amount * platformFeeBps) / 10000; // 20%
//     uint256 royaltyBase = amount - platformCut; // remaining 80%

//     uint256 royaltyTotal = (royaltyBase * item.royalty.bps) / 10000;
//     uint256 ownerCut = (royaltyTotal * 500) / 10000; // 5% of royalties
//     uint256 originalSellerCut = (royaltyTotal * 1500) / 10000; // 15% of royalties
//     uint256 currentSellerCut = royaltyBase - royaltyTotal; // rest to seller

//         if (platformCut > 0) hts.transferToken(item.tokenAddress, msg.sender,treasuryWallet, int64(uint64(platformCut)));
//         if (ownerCut > 0) hts.transferToken(item.tokenAddress, msg.sender,treasuryWallet, int64(uint64(ownerCut)));
//         if (item.royalty.originalSeller != address(0) && originalSellerCut > 0) hts.transferToken(item.tokenAddress, msg.sender,item.royalty.originalSeller, int64(uint64(originalSellerCut)));
//          hts.transferToken(item.tokenAddress, msg.sender,item.royalty.currentSeller, int64(uint64(currentSellerCut)));
//     }
//     // function _distributeFundsHTS(Listing storage item, uint256 amount) internal {
//     //     uint256 platformCut = (amount * platformFeeBps) / 10000; // 20%
//     //     uint256 royaltyBase = amount - platformCut; // remaining 80%

//     //     uint256 royaltyTotal = (royaltyBase * item.royalty.bps) / 10000;
//     //     uint256 ownerCut = (royaltyTotal * 500) / 10000; // 5% of royalties
//     //     uint256 originalSellerCut = (royaltyTotal * 1500) / 10000; // 15% of royalties
//     //     uint256 currentSellerCut = royaltyBase - royaltyTotal; // rest to seller

//     //     if (platformCut > 0) {
//     //         int64 resp = hts.transferToken(item.paymentToken, msg.sender, treasuryWallet, int64(uint64(platformCut)));
//     //         require(resp == 22, "Platform cut transfer failed");
//     //     }
//     //     if (ownerCut > 0) {
//     //         int64 resp = hts.transferToken(item.paymentToken, msg.sender, treasuryWallet, int64(uint64(ownerCut)));
//     //         require(resp == 22, "Owner cut transfer failed");
//     //     }
//     //     if (item.royalty.originalSeller != address(0) && originalSellerCut > 0) {
//     //         int64 resp = hts.transferToken(item.paymentToken, msg.sender, item.royalty.originalSeller, int64(uint64(originalSellerCut)));
//     //         require(resp == 22, "Original seller cut transfer failed");
//     //     }
//     //     int64 resp = hts.transferToken(item.paymentToken, msg.sender, item.royalty.currentSeller, int64(uint64(currentSellerCut)));
//     //     require(resp == 22, "Current seller cut transfer failed");

//     //     emit FundsDistributed(item.tokenAddress, item.serials, amount, platformCut, ownerCut, originalSellerCut, currentSellerCut);
//     // }

//     /**
//      * @notice Get marketplace statistics
//      */
//     function getMarketplaceStats() external view returns (uint256 totalList, uint256 volumeSales) {
//         return (totalListings, totalSalesVolume);
//     }

//     /**
//      * @notice Get full content metadata (only for purchased NFTs)
//      */
//     function getFullContent(uint256 listingId, address buyer) external view returns (string memory) {
//         Listing memory item = listings[listingId];
//         require(!item.active || item.serials.length == 0, "NFTs still available");
//         return item.fullMetadataURI;
//     }

//     /**
//      * @notice Get all active listings
//      */
//     function getActiveListings() public view returns (Listing[] memory) {
//         uint256 activeCount = 0;
//         for (uint256 i = 1; i <= totalListings; i++) {
//             if (listings[i].active) {
//                 activeCount++;
//             }
//         }

//         Listing[] memory activeListings = new Listing[](activeCount);
//         uint256 idx = 0;
//         for (uint256 i = 1; i <= totalListings; i++) {
//             if (listings[i].active) {
//                 activeListings[idx] = listings[i];
//                 idx++;
//             }
//         }

//         return activeListings;
//     }

//     /**
//      * @notice Get available quantity for a listing
//      */
//     function getAvailableQuantity(uint256 listingId) external view returns (uint256) {
//         return listings[listingId].serials.length;
//     }

//     /**
//      * @notice Update platform fee (only owner)
//      */
//     function setPlatformFee(uint256 newFeeBps) external onlyOwner {
//         require(newFeeBps <= 5000, "Fee too high (max 50%)");
//         platformFeeBps = newFeeBps;
//     }

//     /**
//      * @notice Update treasury wallet (only owner)
//      */
//     function setTreasuryWallet(address newTreasury) external onlyOwner {
//         require(newTreasury != address(0), "Invalid address");
//         treasuryWallet = newTreasury;
//     }

//     receive() external payable {
//         emit HbarReceived(msg.sender, msg.value);
//     }

//     fallback() external payable {
//         emit HbarReceived(msg.sender, msg.value);
//     }
// }


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HTS NFT Marketplace with ERC-721 Compatibility
 * @notice Marketplace using ERC-721 interface for HTS NFT transfers
 * @dev HTS NFTs are fully compatible with ERC-721 via HIP-218 and HIP-376
 */

interface IERC721 {
    function transferFrom(address from, address to, uint256 tokenId) external;
    function ownerOf(uint256 tokenId) external view returns (address);
    function balanceOf(address owner) external view returns (uint256);
    function getApproved(uint256 tokenId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

interface IHederaTokenService {
    function associateToken(address account, address token) external returns (int64 responseCode);
    function transferToken(address token, address sender, address receiver, int64 amount) external returns (int64 responseCode);
}

contract QuivaMarketplace is ReentrancyGuard {
    int64 constant SUCCESS = 22;
    IHederaTokenService constant HTS = IHederaTokenService(address(0x167));

    address public platformOwner;
    uint256 public platformFeeBps = 2000; // 20%
    address private treasuryWallet;
    uint256 public totalSalesVolume;
    
    mapping(address => mapping(int64 => address)) public originalSellerOf;
    mapping(address => bool) public tokenAssociated;

    struct RoyaltyInfo {
        address originalSeller;
        address currentSeller;
        address recipient;
        uint96 bps;
    }

    struct Listing {
        address seller;
        address tokenAddress;
        int64[] serials;
        uint256 pricePerNFT;
        bool active;
        RoyaltyInfo royalty;
        address paymentToken;
        string fullMetadataURI;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public totalListings;

    event NFTListed(
        uint256 indexed listingId, 
        address indexed seller, 
        address token, 
        int64[] serials, 
        uint256 pricePerNFT, 
        string metadata
    );
    event NFTSold(
        uint256 indexed listingId, 
        address indexed buyer, 
        int64[] serialsBought, 
        uint256 totalPrice
    );
    event FundsDistributed(
        address indexed tokenAddress, 
        int64[] serials, 
        uint256 totalAmount, 
        uint256 platformCut, 
        uint256 ownerCut, 
        uint256 originalSellerCut, 
        uint256 currentSellerCut
    );
    event HbarReceived(address indexed sender, uint256 amount);
    event ListingCancelled(uint256 indexed listingId);
    event TokenAssociated(address indexed token);

    constructor(address _treasury) {
        require(_treasury != address(0), "Invalid treasury");
        platformOwner = msg.sender;
        treasuryWallet = _treasury;
    }

    modifier onlyOwner() {
        require(msg.sender == platformOwner, "Not platform owner");
        _;
    }

    /**
     * @notice Associate token with contract for receiving NFTs
     */
    function associateTokenWithContract(address token) public returns (int64) {
        require(token != address(0), "Invalid token address");
        
        if (tokenAssociated[token]) {
            return SUCCESS;
        }

        int64 response = HTS.associateToken(address(this), token);
        require(response == SUCCESS, "Token association failed");
        
        tokenAssociated[token] = true;
        emit TokenAssociated(token);
        
        return response;
    }

    /**
     * @notice List NFTs using ERC-721 transferFrom
     * @dev Seller must approve contract first via SDK (approveTokenNftAllowanceAllSerials)
     * @param token HTS token address
     * @param serials Array of serial numbers to list
     * @param pricePerNFT Price per NFT in tinybars (or payment token smallest unit)
     * @param royaltyRecipient Address to receive royalties
     * @param royaltyBps Royalty basis points (max 2000 = 20%)
     * @param paymentToken Payment token address (address(0) for HBAR)
     * @param fullMetadataURI Metadata URI for the listing
     */
    function listNFT(
        address token,
        int64[] memory serials,
        uint256 pricePerNFT,
        address royaltyRecipient,
        uint96 royaltyBps,
        address paymentToken,
        string calldata fullMetadataURI
    ) external {
        require(serials.length > 0, "No serials provided");
        require(pricePerNFT > 0, "Price must be > 0");
        require(royaltyBps <= 2000, "Royalty too high (max 20%)");

        // Associate token if needed
        if (!tokenAssociated[token]) {
            int64 assocResponse = associateTokenWithContract(token);
            require(assocResponse == SUCCESS, "Auto-association failed");
        }

        // Track original sellers
        for (uint256 i = 0; i < serials.length; i++) {
            if (originalSellerOf[token][serials[i]] == address(0)) {
                originalSellerOf[token][serials[i]] = msg.sender;
            }
        }

        // Transfer NFTs to contract using ERC-721 transferFrom
        // This respects the allowance granted via SDK
        IERC721 nftToken = IERC721(token);
        for (uint256 i = 0; i < serials.length; i++) {
            // Serial number is the tokenId for HTS NFTs
            nftToken.transferFrom(
                msg.sender, 
                address(this), 
                uint256(uint64(serials[i]))
            );
        }

        totalListings++;

        listings[totalListings] = Listing({
            seller: msg.sender,
            tokenAddress: token,
            serials: serials,
            pricePerNFT: pricePerNFT,
            active: true,
            royalty: RoyaltyInfo(
                originalSellerOf[token][serials[0]], 
                msg.sender, 
                royaltyRecipient, 
                royaltyBps
            ),
            paymentToken: paymentToken,
            fullMetadataURI: fullMetadataURI
        });

        emit NFTListed(
            totalListings, 
            msg.sender, 
            token, 
            serials, 
            pricePerNFT, 
            fullMetadataURI
        );
    }

    /**
     * @notice Buy NFTs from a listing
     * @param listingId ID of the listing
     * @param quantity Number of NFTs to buy
     */
    function buyItem(uint256 listingId, uint256 quantity) external nonReentrant payable {
        Listing storage item = listings[listingId];
        require(item.active, "Listing inactive");
        require(quantity > 0, "Quantity must be > 0");
        require(quantity <= item.serials.length, "Not enough NFTs available");

        uint256 totalAmount = item.pricePerNFT * quantity;

        // Get serials to transfer
        int64[] memory serialsToTransfer = new int64[](quantity);
        for (uint256 i = 0; i < quantity; i++) {
            serialsToTransfer[i] = item.serials[i];
        }

        // Handle payment
        if (item.paymentToken == address(0)) {
            require(msg.value == totalAmount, "Incorrect HBAR sent");
            _distributeFundsHBAR(item, totalAmount, serialsToTransfer);
        } else {
            require(msg.value == 0, "Do not send HBAR for token payment");
            _distributeFundsHTS(item, totalAmount, serialsToTransfer);
        }

        // Transfer NFTs to buyer using ERC-721
        // Contract owns the NFTs, so no approval needed
        IERC721 nftToken = IERC721(item.tokenAddress);
        for (uint256 i = 0; i < quantity; i++) {
            nftToken.transferFrom(
                address(this), 
                msg.sender, 
                uint256(uint64(serialsToTransfer[i]))
            );
        }

        _removeSerials(item, quantity);

        if (item.serials.length == 0) {
            item.active = false;
        }

        totalSalesVolume += totalAmount;
        emit NFTSold(listingId, msg.sender, serialsToTransfer, totalAmount);
    }

    /**
     * @notice Cancel a listing and return NFTs to seller
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage item = listings[listingId];
        require(item.active, "Listing not active");
        require(msg.sender == item.seller, "Not the seller");

        item.active = false;

        // Return NFTs to seller using ERC-721
        IERC721 nftToken = IERC721(item.tokenAddress);
        for (uint256 i = 0; i < item.serials.length; i++) {
            nftToken.transferFrom(
                address(this), 
                item.seller, 
                uint256(uint64(item.serials[i]))
            );
        }

        emit ListingCancelled(listingId);
    }

    /**
     * @notice Remove sold serials from listing
     */
    function _removeSerials(Listing storage item, uint256 quantity) internal {
        uint256 remaining = item.serials.length - quantity;
        int64[] memory newSerials = new int64[](remaining);
        
        for (uint256 i = 0; i < remaining; i++) {
            newSerials[i] = item.serials[i + quantity];
        }
        
        item.serials = newSerials;
    }

    /**
     * @notice Distribute HBAR payments
     */
    function _distributeFundsHBAR(
        Listing storage item, 
        uint256 amount,
        int64[] memory serialsTransferred
    ) internal {
        uint256 platformCut = (amount * platformFeeBps) / 10000;
        uint256 royaltyBase = amount - platformCut;

        uint256 royaltyTotal = (royaltyBase * item.royalty.bps) / 10000;
        uint256 ownerCut = (royaltyTotal * 500) / 10000;
        uint256 originalSellerCut = (royaltyTotal * 1500) / 10000;
        uint256 currentSellerCut = royaltyBase - royaltyTotal;

        if (platformCut > 0) {
            payable(treasuryWallet).transfer(platformCut);
        }
        if (ownerCut > 0) {
            payable(treasuryWallet).transfer(ownerCut);
        }
        if (item.royalty.originalSeller != address(0) && originalSellerCut > 0) {
            payable(item.royalty.originalSeller).transfer(originalSellerCut);
        }
        if (currentSellerCut > 0) {
            payable(item.royalty.currentSeller).transfer(currentSellerCut);
        }

        emit FundsDistributed(
            item.tokenAddress, 
            serialsTransferred, 
            amount, 
            platformCut, 
            ownerCut, 
            originalSellerCut, 
            currentSellerCut
        );
    }

    /**
     * @notice Distribute HTS token payments
     */
    function _distributeFundsHTS(
        Listing storage item, 
        uint256 amount,
        int64[] memory serialsTransferred
    ) internal {
        uint256 platformCut = (amount * platformFeeBps) / 10000;
        uint256 royaltyBase = amount - platformCut;

        uint256 royaltyTotal = (royaltyBase * item.royalty.bps) / 10000;
        uint256 ownerCut = (royaltyTotal * 500) / 10000;
        uint256 originalSellerCut = (royaltyTotal * 1500) / 10000;
        uint256 currentSellerCut = royaltyBase - royaltyTotal;

        if (platformCut > 0) {
            int64 resp = HTS.transferToken(
                item.paymentToken, 
                msg.sender, 
                treasuryWallet, 
                int64(uint64(platformCut))
            );
            require(resp == SUCCESS, "Platform cut transfer failed");
        }
        if (ownerCut > 0) {
            int64 resp = HTS.transferToken(
                item.paymentToken, 
                msg.sender, 
                treasuryWallet, 
                int64(uint64(ownerCut))
            );
            require(resp == SUCCESS, "Owner cut transfer failed");
        }
        if (item.royalty.originalSeller != address(0) && originalSellerCut > 0) {
            int64 resp = HTS.transferToken(
                item.paymentToken, 
                msg.sender, 
                item.royalty.originalSeller, 
                int64(uint64(originalSellerCut))
            );
            require(resp == SUCCESS, "Original seller cut transfer failed");
        }
        if (currentSellerCut > 0) {
            int64 resp = HTS.transferToken(
                item.paymentToken, 
                msg.sender, 
                item.royalty.currentSeller, 
                int64(uint64(currentSellerCut))
            );
            require(resp == SUCCESS, "Current seller cut transfer failed");
        }

        emit FundsDistributed(
            item.tokenAddress, 
            serialsTransferred, 
            amount, 
            platformCut, 
            ownerCut, 
            originalSellerCut, 
            currentSellerCut
        );
    }

    // ============ VIEW FUNCTIONS ============

    function getMarketplaceStats() external view returns (uint256 totalList, uint256 volumeSales) {
        return (totalListings, totalSalesVolume);
    }

    function getFullContent(uint256 listingId) external view returns (string memory) {
        Listing memory item = listings[listingId];
        require(!item.active || item.serials.length == 0, "NFTs still available");
        return item.fullMetadataURI;
    }

    function getActiveListings() public view returns (Listing[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= totalListings; i++) {
            if (listings[i].active) {
                activeCount++;
            }
        }

        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 idx = 0;
        for (uint256 i = 1; i <= totalListings; i++) {
            if (listings[i].active) {
                activeListings[idx] = listings[i];
                idx++;
            }
        }

        return activeListings;
    }

    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    function getAvailableQuantity(uint256 listingId) external view returns (uint256) {
        return listings[listingId].serials.length;
    }

    // ============ ADMIN FUNCTIONS ============

    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 5000, "Fee too high (max 50%)");
        platformFeeBps = newFeeBps;
    }

    function setTreasuryWallet(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid address");
        treasuryWallet = newTreasury;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        platformOwner = newOwner;
    }

    // ============ RECEIVE FUNCTIONS ============

    receive() external payable {
        emit HbarReceived(msg.sender, msg.value);
    }

    fallback() external payable {
        emit HbarReceived(msg.sender, msg.value);
    }
}