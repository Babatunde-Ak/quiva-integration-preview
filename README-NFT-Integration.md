# Comic NFT Minting Integration

This document explains the comprehensive integration of NFT minting functionality for comics when creators select "Pay Per Read" or enable NFT minting.

## Overview

The integration provides a seamless flow for creators to:
1. Upload comic files (images/ZIP)
2. Set monetization preferences (free/paid)
3. Enable NFT minting (optional)
4. Automatically handle IPFS upload for paid comics
5. Mint NFTs on blockchain when enabled
6. Save all data to backend database

## Key Components

### 🔧 Core Hooks

#### `useMintComic.ts`
- Handles blockchain NFT minting using wagmi
- Interacts with QuivaComics smart contract
- Manages transaction states and error handling

#### `useComicMinting.ts` (NEW)
- Orchestrates the complete publishing flow
- Handles IPFS uploads for paid comics
- Coordinates blockchain minting and database storage
- Provides comprehensive progress tracking

### 🎨 UI Components

#### `ComicPublisher.tsx` (ENHANCED)
- Enhanced with NFT minting progress indicators
- Shows IPFS upload progress
- Displays blockchain transaction status
- Provides detailed error handling

#### `OnboardingPage.tsx` (ENHANCED)
- Added smart integration info for paid comics
- Better UX for NFT options
- Clear indication of automatic IPFS integration

## Workflow

### For Free Comics
1. **Upload** → Direct to backend database
2. **Store** → Traditional file storage
3. **Publish** → Available immediately

### For Paid Comics (Pay Per Read)
1. **Upload** → IPFS storage (automatic)
2. **Metadata** → Generate and store on IPFS
3. **Database** → Save with IPFS references
4. **Publish** → Available with blockchain benefits

### For NFT Comics
1. **Upload** → IPFS storage (required)
2. **Metadata** → Generate NFT-compliant metadata
3. **Mint** → Create NFT on blockchain
4. **Database** → Save with blockchain references
5. **Publish** → Available as collectible NFT

## Backend Requirements

### IPFS Upload Endpoint
```
POST /api/ipfs/upload-comic
```

**Required Fields:**
- `coverImage`: File (optional)
- `pages`: File[] (required)
- `title`: string
- `description`: string
- `genre`: JSON string array
- `tags`: JSON string array
- `ageRating`: string

**Response:**
```json
{
  "success": true,
  "data": {
    "metadataUri": "ipfs://QmXXX...", // Main metadata JSON
    "coverImageUri": "ipfs://QmYYY...", // Cover image hash
    "pagesUris": ["ipfs://QmZZZ1...", "ipfs://QmZZZ2..."] // Page hashes
  }
}
```

### Enhanced Comics Database Schema
```javascript
{
  // Existing fields...
  title: String,
  description: String,
  genre: [String],
  tags: [String],
  ageRating: String,
  publishType: String, // 'free' | 'paid'
  price: Number,
  
  // New NFT fields
  mintAsNFT: Boolean,
  nftCopies: Number,
  nftPrice: Number,
  
  // Blockchain integration fields
  metadataUri: String, // IPFS metadata URI
  coverImageUri: String, // IPFS cover image URI
  pagesUris: [String], // IPFS page URIs
  blockchainTokenId: String, // NFT token ID
  blockchainTxHash: String, // Minting transaction hash
  
  // Status tracking
  ipfsUploaded: Boolean,
  nftMinted: Boolean,
  blockchainConfirmed: Boolean
}
```

## Smart Contract Integration

### Contract: QuivaComics
**Address:** `0xF5CBD0241D176C6cF35564d2F5b701F74a0756E8`

**Key Functions:**
- `mintComic(comicId, metadataURI, price, maxSupply, royaltyPercentage)`
- `purchaseComic(tokenId, amount)`
- `getComic(tokenId)`

**Events:**
- `ComicMinted(tokenId, creator, comicId, price, maxSupply)`
- `ComicPurchased(tokenId, buyer, creator, price)`

## Progress Tracking

The integration provides real-time progress tracking:

1. **IPFS Upload** (0-100%)
   - File validation and preparation
   - Individual file uploads
   - Metadata generation and upload

2. **Blockchain Minting** (0-100%)
   - Transaction preparation
   - Wallet interaction
   - Block confirmation

3. **Database Storage** (Final step)
   - Save all references
   - Update comic status

## Error Handling

### Common Error Scenarios
- **Wallet not connected** → Prompt connection
- **Insufficient gas** → Clear error message
- **IPFS upload failure** → Retry mechanism
- **Transaction rejected** → User-friendly explanation
- **Network issues** → Appropriate fallbacks

### Error Display
- Color-coded error messages
- Specific error types with solutions
- Progress preservation on retry

## Features

### ✅ Implemented
- [x] Complete IPFS integration for paid comics
- [x] Blockchain NFT minting with progress tracking
- [x] Enhanced UI with real-time progress
- [x] Comprehensive error handling
- [x] Automatic metadata generation
- [x] Transaction hash and token ID tracking

### 🚧 Backend Requirements
- [ ] IPFS upload endpoint implementation
- [ ] Database schema updates
- [ ] Metadata generation service
- [ ] IPFS pinning service integration

### 🔮 Future Enhancements
- [ ] Batch minting for series
- [ ] Royalty distribution system
- [ ] Secondary market integration
- [ ] Advanced metadata customization
- [ ] Cross-chain support

## Usage Example

```typescript
// In ComicPublisher component
const {
  publishComic,
  isUploading,
  isMinting,
  uploadProgress,
  mintingProgress,
  tokenId,
  mintHash,
} = useComicMinting();

// Publish with NFT minting
const result = await publishComic({
  comicData: {
    title: "My Awesome Comic",
    description: "An epic adventure...",
    // ... other fields
  },
  monetizationData: {
    publishType: "paid",
    price: 5.99,
    mintAsNFT: true,
    nftCopies: 100,
    nftPrice: 0.1,
  },
  user: { _id: "user123" }
});
```

## Security Considerations

1. **IPFS Pinning** - Ensure content permanence
2. **Metadata Validation** - Prevent malicious content
3. **Price Validation** - Prevent manipulation
4. **Wallet Verification** - Ensure authorized minting
5. **Rate Limiting** - Prevent spam minting

## Testing

### Test Scenarios
1. Free comic publishing (traditional flow)
2. Paid comic with IPFS upload
3. NFT minting with blockchain confirmation
4. Error handling for each step
5. Progress tracking accuracy
6. Wallet connection edge cases

---

This integration provides a comprehensive solution for comic creators to seamlessly transition from traditional publishing to blockchain-enabled, NFT-mintable comics with decentralized storage.


contract


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";

contract QuivaComics is ERC1155, Ownable, ReentrancyGuard, Pausable {
    
   receive() external payable {}

    fallback() external payable {}

    uint256 private _tokenIdCounter;
    
    struct Comic {
        uint256 tokenId;
        address creator;
        string metadataURI;
        uint256 maxSupply;
        uint256 royaltyPercentage; // in basis points (10% = 1000)
        bool exists;
    }
    
    struct Listing {
        address seller;
        uint256 pricePerToken;
        uint256 amount;
        bool isActive;
    }
    
    // Mappings
    mapping(uint256 => Comic) public comics;
    mapping(string => uint256) public comicIdToTokenId;
    mapping(uint256 => mapping(address => Listing)) public listings;
    mapping(address => uint256) public pendingWithdrawals;
    mapping(address => bool) public approvedCreators;
    
    // Platform fee (2.5% = 250 basis points)
    uint256 public platformFee = 250;
    uint256 public constant MAX_PLATFORM_FEE = 1000; // 10% max
    uint256 public constant MAX_ROYALTY = 3000; // 30% max
    
    address public treasuryAddress;
    
    // Events
    event ComicMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string comicId,
        uint256 maxSupply
    );
    
    event ComicListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 pricePerToken,
        uint256 amount
    );
    
    event ComicListingUpdated(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 newPrice,
        uint256 newAmount
    );
    
    event ComicListingCancelled(
        uint256 indexed tokenId,
        address indexed seller
    );
    
    event ComicPurchased(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 pricePerToken,
        uint256 amount,
        uint256 totalPrice
    );
    
    event RoyaltyPaid(
        uint256 indexed tokenId,
        address indexed creator,
        uint256 amount
    );
    
    event Withdrawal(
        address indexed recipient,
        uint256 amount
    );
    
    event TreasuryUpdated(
        address indexed oldTreasury,
        address indexed newTreasury
    );
    
    event PlatformFeeUpdated(
        uint256 oldFee,
        uint256 newFee
    );
    
    constructor(
        address _treasuryAddress,
        address initialOwner
    ) ERC1155("") Ownable(initialOwner) {
        require(_treasuryAddress != address(0), "Invalid treasury address");
        treasuryAddress = _treasuryAddress;
    }
    
    modifier onlyApprovedCreator() {
        require(
            approvedCreators[msg.sender] || owner() == msg.sender,
            "Not an approved creator"
        );
        _;
    }
    
    modifier comicExists(uint256 tokenId) {
        require(comics[tokenId].exists, "Comic does not exist");
        _;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /// @notice Approve a creator to mint comics
    function approveCreator(address creator) external onlyOwner {
        require(creator != address(0), "Invalid creator address");
        require(!approvedCreators[creator], "Already approved");
        approvedCreators[creator] = true;
    }
    
    /// @notice Revoke creator approval
    function revokeCreator(address creator) external onlyOwner {
        require(approvedCreators[creator], "Not approved");
        approvedCreators[creator] = false;
    }
    
    /// @notice Update treasury address
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        require(newTreasury != treasuryAddress, "Same treasury address");
        
        address oldTreasury = treasuryAddress;
        treasuryAddress = newTreasury;
        
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }
    
    /// @notice Update platform fee
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_PLATFORM_FEE, "Fee too high");
        
        uint256 oldFee = platformFee;
        platformFee = newFee;
        
        emit PlatformFeeUpdated(oldFee, newFee);
    }
    
    /// @notice Pause all contract operations
    function pause() external onlyOwner {
        _pause();
    }
    
    /// @notice Unpause all contract operations
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /// @notice Emergency withdrawal function (only for stuck funds)
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    // ============ CREATOR FUNCTIONS ============
    
    /// @notice Mint a new comic NFT (all copies go to creator)
    /// @param comicId Unique identifier for the comic
    /// @param metadataURI IPFS or metadata URI
    /// @param maxSupply Total number of copies to mint
    /// @param royaltyPercentage Secondary sale royalty (in basis points)
    function mintComic(
        string memory comicId,
        string memory metadataURI,
        uint256 maxSupply,
        uint256 royaltyPercentage
    ) external onlyApprovedCreator whenNotPaused returns (uint256) {
        require(bytes(comicId).length > 0, "Empty comic ID");
        require(bytes(metadataURI).length > 0, "Empty metadata URI");
        require(comicIdToTokenId[comicId] == 0, "Comic already minted");
        require(maxSupply > 0, "Max supply must be greater than 0");
        require(royaltyPercentage <= MAX_ROYALTY, "Royalty too high");
        
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        
        comics[newTokenId] = Comic({
            tokenId: newTokenId,
            creator: msg.sender,
            metadataURI: metadataURI,
            maxSupply: maxSupply,
            royaltyPercentage: royaltyPercentage,
            exists: true
        });
        
        comicIdToTokenId[comicId] = newTokenId;
        
        // Mint all copies to creator
        _mint(msg.sender, newTokenId, maxSupply, "");
        
        emit ComicMinted(newTokenId, msg.sender, comicId, maxSupply);
        
        return newTokenId;
    }
    
    /// @notice Withdraw accumulated earnings
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");
        
        pendingWithdrawals[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    // ============ MARKETPLACE FUNCTIONS ============
    
    /// @notice List comic for sale
    /// @param tokenId The comic token ID
    /// @param amount Number of copies to list
    /// @param pricePerToken Price per single copy
    function listComic(
        uint256 tokenId,
        uint256 amount,
        uint256 pricePerToken
    ) external whenNotPaused comicExists(tokenId) {
        require(amount > 0, "Amount must be greater than 0");
        require(pricePerToken > 0, "Price must be greater than 0");
        require(balanceOf(msg.sender, tokenId) == amount, "Insufficient balance");
        require(!listings[tokenId][msg.sender].isActive, "Already listed");
        
        listings[tokenId][msg.sender] = Listing({
            seller: msg.sender,
            pricePerToken: pricePerToken,
            amount: amount,
            isActive: true
        });

        // safeTransferFrom(msg.sender, address(this), tokenId, amount, "");
        
        emit ComicListed(tokenId, msg.sender, pricePerToken, amount);
    }
    
    /// @notice Update existing listing
    /// @param tokenId The comic token ID
    /// @param newAmount New amount to list (0 to keep current)
    /// @param newPrice New price per token (0 to keep current)
    function updateListing(
        uint256 tokenId,
        uint256 newAmount,
        uint256 newPrice
    ) external comicExists(tokenId) {
        Listing storage listing = listings[tokenId][msg.sender];
        require(listing.isActive, "No active listing");
        
        if (newAmount > 0) {
            require(balanceOf(msg.sender, tokenId) >= newAmount, "Insufficient balance");
            listing.amount = newAmount;
        }
        
        if (newPrice > 0) {
            listing.pricePerToken = newPrice;
        }
        
        emit ComicListingUpdated(tokenId, msg.sender, listing.pricePerToken, listing.amount);
    }
    
    /// @notice Cancel listing
    function cancelListing(uint256 tokenId) external {
        require(listings[tokenId][msg.sender].isActive, "No active listing");
        
        listings[tokenId][msg.sender].isActive = false;
        
        emit ComicListingCancelled(tokenId, msg.sender);
    }
    
    /// @notice Purchase comic from listing
    /// @param tokenId The comic token ID
    /// @param seller The seller's address
    /// @param amount Number of copies to buy
    function purchaseComic(
        uint256 tokenId,
        address seller,
        uint256 amount
    ) external nonReentrant whenNotPaused comicExists(tokenId) {
        Listing storage listing = listings[tokenId][seller];
        require(listing.isActive, "Listing not active");
        require(amount > 0 && amount <= listing.amount, "Invalid amount");
        require(balanceOf(seller, tokenId) >= amount, "Seller insufficient balance");
        
        uint256 totalPrice = listing.pricePerToken * amount;
        // require(msg.value >= totalPrice, "Insufficient payment");
        
        Comic memory comic = comics[tokenId];
        
        // Calculate distributions
        uint256 platformFeeAmount = (totalPrice * platformFee) / 10000;
        uint256 royaltyAmount = 0;
        
        // Only pay royalty if seller is not the original creator
        if (seller != comic.creator) {
            royaltyAmount = (totalPrice * comic.royaltyPercentage) / 10000;
        }
        
        uint256 sellerPayment = totalPrice - platformFeeAmount - royaltyAmount;
        
        // Update listing
        listing.amount -= amount;
        if (listing.amount == 0) {
            listing.isActive = false;
        }
        //Distribute payment
        // payable(msg.sender).transfer(platformFeeAmount);
        // payable(msg.sender).transfer(sellerPayment);
         if(sellerPayment > 0 ) {
                 (bool success, ) = payable(address(this)).call{value: sellerPayment}("");
                 require(success, "Payment to seller failed");
                 payable(seller).transfer(sellerPayment);
             }
             if(platformFeeAmount > 0) {
                 (bool success, ) = payable(treasuryAddress).call{value: platformFeeAmount}("");
                 require(success, "Payment to treasury failed");
             }
        // Transfer NFT
        _safeTransferFrom(seller, msg.sender, tokenId, amount, "");
        //  pendingWithdrawals[seller] += sellerPayment;
        // pendingWithdrawals[treasuryAddress] += platformFeeAmount;
       
        
        if (royaltyAmount > 0) {
            pendingWithdrawals[comic.creator] += royaltyAmount;
            emit RoyaltyPaid(tokenId, comic.creator, royaltyAmount);
        }
        
        // Refund excess
        // if (msg.value > totalPrice) {
        //     (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - totalPrice}("");
        //     require(refundSuccess, "Refund failed");
        // }
        
        emit ComicPurchased(tokenId, msg.sender, seller, listing.pricePerToken, amount, totalPrice);
    }
    
    /// @notice Batch purchase from multiple listings
    /// @param tokenIds Array of token IDs
    /// @param sellers Array of seller addresses
    /// @param amounts Array of amounts to purchase
    function batchPurchase(
        uint256[] calldata tokenIds,
        address[] calldata sellers,
        uint256[] calldata amounts
    ) external payable nonReentrant whenNotPaused {
        require(
            tokenIds.length == sellers.length && sellers.length == amounts.length,
            "Array length mismatch"
        );
        require(tokenIds.length > 0, "Empty arrays");
        
        uint256 totalCost = 0;
        
        // Calculate total cost first
        for (uint256 i = 0; i < tokenIds.length; i++) {
            Listing storage listing = listings[tokenIds[i]][sellers[i]];
            require(listing.isActive, "Listing not active");
            require(amounts[i] > 0 && amounts[i] <= listing.amount, "Invalid amount");
            
            totalCost += listing.pricePerToken * amounts[i];
        }
        
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Process each purchase
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            address seller = sellers[i];
            uint256 amount = amounts[i];
            
            Listing storage listing = listings[tokenId][seller];
            Comic memory comic = comics[tokenId];
            
            uint256 itemCost = listing.pricePerToken * amount;
            uint256 platformFeeAmount = (itemCost * platformFee) / 10000;
            uint256 royaltyAmount = 0;
            
            if (seller != comic.creator) {
                royaltyAmount = (itemCost * comic.royaltyPercentage) / 10000;
            }
            
            uint256 sellerPayment = itemCost - platformFeeAmount - royaltyAmount;
            
            listing.amount -= amount;
            if (listing.amount == 0) {
                listing.isActive = false;
            }
            
             // Transfer tokens and pay fees
             if(sellerPayment > 0 ) {
                 (bool success, ) = payable(seller).call{value: sellerPayment}("");
                 require(success, "Payment to seller failed");
             }
             if(platformFeeAmount > 0) {
                 (bool success, ) = payable(treasuryAddress).call{value: platformFeeAmount}("");
                 require(success, "Payment to treasury failed");
             }
            _safeTransferFrom(seller, msg.sender, tokenId, amount, "");
            
            // pendingWithdrawals[seller] += sellerPayment;
            // pendingWithdrawals[treasuryAddress] += platformFeeAmount;
            
            if (royaltyAmount > 0) {
                pendingWithdrawals[comic.creator] += royaltyAmount;
                emit RoyaltyPaid(tokenId, comic.creator, royaltyAmount);
            }
            
            emit ComicPurchased(tokenId, msg.sender, seller, listing.pricePerToken, amount, itemCost);
        }
        
        // Refund excess
        if (msg.value > totalCost) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - totalCost}("");
            require(refundSuccess, "Refund failed");
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /// @notice Get comic details
    function getComic(uint256 tokenId) 
        external 
        view 
        comicExists(tokenId)
        returns (Comic memory) 
    {
        return comics[tokenId];
    }
    
    /// @notice Get listing details
    function getListing(uint256 tokenId, address seller)
        external
        view
        returns (Listing memory)
    {
        return listings[tokenId][seller];
    }
    
    /// @notice Get pending withdrawals for an address
    function getPendingWithdrawal(address account)
        external
        view
        returns (uint256)
    {
        return pendingWithdrawals[account];
    }
    
    /// @notice Check if address is approved creator
    function isApprovedCreator(address creator)
        external
        view
        returns (bool)
    {
        return approvedCreators[creator] || creator == owner();
    }
    
    /// @notice Override URI function to return metadata URI
    function uri(uint256 tokenId) 
        public 
        view 
        override 
        comicExists(tokenId)
        returns (string memory) 
    {
        return comics[tokenId].metadataURI;
    }
    
    /// @notice Get current token counter
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /// @notice Get total supply of a comic
    function totalSupply(uint256 tokenId) 
        external 
        view 
        comicExists(tokenId)
        returns (uint256) 
    {
        return comics[tokenId].maxSupply;
    }
    
 function getHbarBalance() public view returns (uint) {
        return address(this).balance;
    }
   
    
}