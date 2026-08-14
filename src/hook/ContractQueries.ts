/**
 * Contract Query Utilities
 * Uses Mirror Node for all read-only contract queries
 */

import { ethers } from 'ethers';
import { mirrorNodeService } from './MirrorNodeService';

// Contract addresses - update these with your deployed contracts
export const CONTRACTS = {
  COMIC_CORE: "0.0.7806656",
  COMIC_SALES: "0.0.7829668",
  COMIC_MARKETPLACE: "0.0.7829656"
};

// ABI definitions for contract functions
const COMIC_CORE_ABI = [
  'function canReadComic(string episodeId, address user) external view returns (bool)',
  'function getEpisode(string episodeId) external view returns (address tokenAddress, address creator, string name, int64 maxSupply, int64 currentSupply, bool exists)',
];

const COMIC_SALES_ABI = [
  'function getDirectListing(uint256 listingId) external view returns (string episodeId, address creator, uint256 pricePerNFT, uint256 available, bool isActive)',
  'function getCampaign(uint256 campaignId) external view returns (string episodeId, address creator, uint8 campaignType, uint256 mintPrice, uint256 maxSupply, uint256 totalMinted, bool isActive)',
  'function getCurrentPhase(uint256 campaignId) external view returns (uint256 phaseId, bool exists)',
];

const COMIC_MARKETPLACE_ABI = [
  'function getListing(uint256 listingId) external view returns (address tokenAddress, int64 serialNumber, address seller, uint256 price, bool isActive)',
  'function marketplaceFeePercent() external view returns (uint256)',
];

export interface DirectListingInfo {
  episodeId: string;
  creator: string;
  pricePerNFT: string; // in HBAR
  pricePerNFTTinybars: string; // in tinybars
  available: number;
  isActive: boolean;
}

export interface EpisodeInfo {
  tokenAddress: string;
  creator: string;
  name: string;
  maxSupply: number;
  currentSupply: number;
  exists: boolean;
}

export interface MarketplaceListingInfo {
  tokenAddress: string;
  serialNumber: number;
  seller: string;
  price: string; // in HBAR
  priceTinybars: string; // in tinybars
  isActive: boolean;
}

export interface CampaignInfo {
  episodeId: string;
  creator: string;
  campaignType: number;
  mintPrice: string; // in HBAR
  mintPriceTinybars: string; // in tinybars
  maxSupply: string;
  totalMinted: string;
  isActive: boolean;
}

/**
 * Query direct listing information from COMIC_SALES contract
 */
export async function getDirectListingInfo(listingId: number): Promise<DirectListingInfo> {
  try {
    console.log(`📖 Fetching direct listing info for listing ${listingId}...`);

    const abiInterface = new ethers.Interface(COMIC_SALES_ABI);
    const encodedData = abiInterface.encodeFunctionData('getDirectListing', [listingId]);

    const result = await mirrorNodeService.makeContractCall(
      CONTRACTS.COMIC_SALES,
      encodedData
    );

    const decoded = abiInterface.decodeFunctionResult('getDirectListing', result.result);

    const pricePerNFTTinybars = decoded[2].toString();
    const pricePerNFT = mirrorNodeService.tinybarsToHbar(pricePerNFTTinybars);

    const listingInfo: DirectListingInfo = {
      episodeId: decoded[0],
      creator: decoded[1],
      pricePerNFT: pricePerNFT.toString(),
      pricePerNFTTinybars: pricePerNFTTinybars,
      available: Number(decoded[3]),
      isActive: decoded[4],
    };

    console.log('✅ Direct listing info:', listingInfo);
    return listingInfo;
  } catch (error) {
    console.error('❌ Error fetching direct listing info:', error);
    throw error;
  }
}

/**
 * Query episode information from COMIC_CORE contract
 */
export async function getEpisodeInfo(episodeId: string): Promise<EpisodeInfo> {
  try {
    console.log(`📖 Fetching episode info for ${episodeId}...`);

    const abiInterface = new ethers.Interface(COMIC_CORE_ABI);
    const encodedData = abiInterface.encodeFunctionData('getEpisode', [episodeId]);

    const result = await mirrorNodeService.makeContractCall(
      CONTRACTS.COMIC_CORE,
      encodedData
    );

    const decoded = abiInterface.decodeFunctionResult('getEpisode', result.result);

    const episodeInfo: EpisodeInfo = {
      tokenAddress: decoded[0],
      creator: decoded[1],
      name: decoded[2],
      maxSupply: Number(decoded[3]),
      currentSupply: Number(decoded[4]),
      exists: decoded[5],
    };

    console.log('✅ Episode info:', episodeInfo);
    return episodeInfo;
  } catch (error) {
    console.error('❌ Error fetching episode info:', error);
    throw error;
  }
}

/**
 * Query marketplace listing information from COMIC_MARKETPLACE contract
 */
export async function getMarketplaceListingInfo(listingId: number): Promise<MarketplaceListingInfo> {
  try {
    console.log(`📖 Fetching marketplace listing info for listing ${listingId}...`);

    const abiInterface = new ethers.Interface(COMIC_MARKETPLACE_ABI);
    const encodedData = abiInterface.encodeFunctionData('getListing', [listingId]);

    const result = await mirrorNodeService.makeContractCall(
      CONTRACTS.COMIC_MARKETPLACE,
      encodedData
    );

    const decoded = abiInterface.decodeFunctionResult('getListing', result.result);

    const priceTinybars = decoded[3].toString();
    const price = mirrorNodeService.tinybarsToHbar(priceTinybars);

    const listingInfo: MarketplaceListingInfo = {
      tokenAddress: decoded[0],
      serialNumber: Number(decoded[1]),
      seller: decoded[2],
      price: price.toString(),
      priceTinybars: priceTinybars,
      isActive: decoded[4],
    };

    console.log('✅ Marketplace listing info:', listingInfo);
    return listingInfo;
  } catch (error) {
    console.error('❌ Error fetching marketplace listing info:', error);
    throw error;
  }
}

/**
 * Query campaign information from COMIC_SALES contract
 */
export async function getCampaignInfo(campaignId: number): Promise<CampaignInfo> {
  try {
    console.log(`📖 Fetching campaign info for campaign ${campaignId}...`);

    const abiInterface = new ethers.Interface(COMIC_SALES_ABI);
    const encodedData = abiInterface.encodeFunctionData('getCampaign', [campaignId]);

    const result = await mirrorNodeService.makeContractCall(
      CONTRACTS.COMIC_SALES,
      encodedData
    );

    const decoded = abiInterface.decodeFunctionResult('getCampaign', result.result);

    const mintPriceTinybars = decoded[3].toString();
    const mintPrice = mirrorNodeService.tinybarsToHbar(mintPriceTinybars);

    const campaignInfo: CampaignInfo = {
      episodeId: decoded[0],
      creator: decoded[1],
      campaignType: Number(decoded[2]),
      mintPrice: mintPrice.toString(),
      mintPriceTinybars: mintPriceTinybars,
      maxSupply: decoded[4].toString(),
      totalMinted: decoded[5].toString(),
      isActive: decoded[6],
    };

    console.log('✅ Campaign info:', campaignInfo);
    return campaignInfo;
  } catch (error) {
    console.error('❌ Error fetching campaign info:', error);
    throw error;
  }
}

/**
 * Check if user can read comic
 */
export async function canUserReadComic(episodeId: string, userAddress: string): Promise<boolean> {
  try {
    console.log(`📖 Checking if ${userAddress} can read ${episodeId}...`);

    const abiInterface = new ethers.Interface(COMIC_CORE_ABI);
    const encodedData = abiInterface.encodeFunctionData('canReadComic', [episodeId, userAddress]);

    const result = await mirrorNodeService.makeContractCall(
      CONTRACTS.COMIC_CORE,
      encodedData
    );

    const decoded = abiInterface.decodeFunctionResult('canReadComic', result.result);
    const canRead = decoded[0];

    console.log(`✅ Can read: ${canRead}`);
    return canRead;
  } catch (error) {
    console.error('❌ Error checking read permission:', error);
    return false;
  }
}

/**
 * Get marketplace fee percentage
 */
export async function getMarketplaceFee(): Promise<number> {
  try {
    console.log('📖 Fetching marketplace fee...');

    const abiInterface = new ethers.Interface(COMIC_MARKETPLACE_ABI);
    const encodedData = abiInterface.encodeFunctionData('marketplaceFeePercent', []);

    const result = await mirrorNodeService.makeContractCall(
      CONTRACTS.COMIC_MARKETPLACE,
      encodedData
    );

    const decoded = abiInterface.decodeFunctionResult('marketplaceFeePercent', result.result);
    const feePercent = Number(decoded[0]);

    console.log(`✅ Marketplace fee: ${feePercent}%`);
    return feePercent;
  } catch (error) {
    console.error('❌ Error fetching marketplace fee:', error);
    throw error;
  }
}

/**
 * Get current phase for scheduled campaign
 */
export async function getCurrentPhase(campaignId: number): Promise<{ phaseId: number; exists: boolean }> {
  try {
    console.log(`📖 Fetching current phase for campaign ${campaignId}...`);

    const abiInterface = new ethers.Interface(COMIC_SALES_ABI);
    const encodedData = abiInterface.encodeFunctionData('getCurrentPhase', [campaignId]);

    const result = await mirrorNodeService.makeContractCall(
      CONTRACTS.COMIC_SALES,
      encodedData
    );

    const decoded = abiInterface.decodeFunctionResult('getCurrentPhase', result.result);

    const phaseInfo = {
      phaseId: Number(decoded[0]),
      exists: decoded[1],
    };

    console.log('✅ Current phase:', phaseInfo);
    return phaseInfo;
  } catch (error) {
    console.error('❌ Error fetching current phase:', error);
    throw error;
  }
}

/**
 * Get NFT metadata from token
 */
export async function getNftMetadata(tokenId: string, serialNumber: number): Promise<any> {
  try {
    console.log(`📖 Fetching NFT metadata for token ${tokenId}, serial ${serialNumber}...`);

    const nftInfo = await mirrorNodeService.getNftInfo(tokenId, serialNumber);
    
    console.log('✅ NFT metadata:', nftInfo);
    return nftInfo;
  } catch (error) {
    console.error('❌ Error fetching NFT metadata:', error);
    throw error;
  }
}

/**
 * Get all NFTs owned by an account for a specific token
 */
export async function getAccountNftsForToken(accountId: string, tokenId: string): Promise<any> {
  try {
    console.log(`📖 Fetching NFTs for account ${accountId}, token ${tokenId}...`);

    const nfts = await mirrorNodeService.getAccountNfts(accountId, tokenId);
    
    console.log('✅ Account NFTs:', nfts);
    return nfts;
  } catch (error) {
    console.error('❌ Error fetching account NFTs:', error);
    throw error;
  }
}

/**
 * Get all NFTs minted from a specific token (contract)
 */
export async function getAllTokenNfts(tokenId: string): Promise<any> {
  try {
    console.log(`📖 Fetching ALL NFTs for token ${tokenId}...`);

    const nfts = await mirrorNodeService.getTokenNfts(tokenId);
    
    console.log('✅ All Token NFTs:', nfts);
    return nfts;
  } catch (error) {
    console.error('❌ Error fetching all token NFTs:', error);
    throw error;
  }
}


export async function getAccountNfts(accountId: string) {
  try {    console.log(`📖 Fetching NFTs for account ${accountId}...`);
    const nfts = await mirrorNodeService.getAccountNfts(accountId);
    
    console.log('✅ Account NFTs:', nfts);
    return nfts;
  } catch (error) {
    console.error('❌ Error fetching account NFTs:', error);
    throw error;
  }
}
export default {
  getDirectListingInfo,
  getEpisodeInfo,
  getMarketplaceListingInfo,
  getCampaignInfo,
  canUserReadComic,
  getMarketplaceFee,
  getCurrentPhase,
  getNftMetadata,
  getAccountNftsForToken,
  getAllTokenNfts,
};