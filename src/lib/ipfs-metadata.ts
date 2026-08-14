// src/lib/ipfs-metadata.ts
export interface ComicMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties: {
    pages: string[];
    genre: string[];
    tags: string[];
    ageRating: string;
    creator: string;
    createdAt: string;
    pageCount: number;
  };
}

export interface CreateMetadataParams {
  title: string;
  description: string;
  genre: string[];
  tags: string[];
  ageRating: string;
  coverImageUri: string;
  pagesUris: string[];
  creatorAddress: string;
}

/**
 * Generate NFT-compliant metadata for comic
 */
export function createComicMetadata(params: CreateMetadataParams): ComicMetadata {
  const {
    title,
    description,
    genre,
    tags,
    ageRating,
    coverImageUri,
    pagesUris,
    creatorAddress,
  } = params;

  // Format age rating for display
  const formatAgeRating = (rating: string): string => {
    switch (rating) {
      case 'everyone':
        return 'Everyone';
      case 'teen':
        return 'Teen (13+)';
      case 'mature':
        return 'Mature (18+)';
      default:
        return 'Not Rated';
    }
  };

  return {
    name: `${title} - Episode 1`,
    description,
    image: coverImageUri,
    attributes: [
      {
        trait_type: 'Creator',
        value: creatorAddress,
      },
      {
        trait_type: 'Genre',
        value: genre.join(', '),
      },
      {
        trait_type: 'Age Rating',
        value: formatAgeRating(ageRating),
      },
      {
        trait_type: 'Page Count',
        value: pagesUris.length,
      },
      {
        trait_type: 'Type',
        value: 'Comic Book',
      },
      {
        trait_type: 'Format',
        value: 'Digital',
      },
    ],
    properties: {
      pages: pagesUris,
      genre,
      tags,
      ageRating,
      creator: creatorAddress,
      createdAt: new Date().toISOString(),
      pageCount: pagesUris.length,
    },
  };
}

/**
 * Validate IPFS URI format
 */
export function isValidIPFSUri(uri: string): boolean {
  return uri.startsWith('ipfs://') && uri.length > 7;
}

/**
 * Convert IPFS URI to HTTP gateway URL for display
 */
export function ipfsToHttp(ipfsUri: string, gateway = 'https://ipfs.io/ipfs/'): string {
  if (!isValidIPFSUri(ipfsUri)) {
    return ipfsUri;
  }
  
  const hash = ipfsUri.replace('ipfs://', '');
  return `${gateway}${hash}`;
}

/**
 * Generate comic ID for blockchain
 */
export function generateComicId(userId: string, timestamp?: number): string {
  const time = timestamp || Date.now();
  return `comic_${time}_${userId}`;
}

/**
 * Estimate gas cost for minting (rough estimate)
 */
export function estimateGasCost(baseGasPrice: bigint, gasLimit = BigInt(200000)): bigint {
  return baseGasPrice * gasLimit;
}

/**
 * Format token ID for display
 */
export function formatTokenId(tokenId: bigint): string {
  return `#${tokenId.toString().padStart(6, '0')}`;
}

/**
 * Generate shareable NFT link
 */
export function generateNFTLink(
  contractAddress: string,
  tokenId: bigint,
  chainId: number
): string {
  // OpenSea format for testnet
  if (chainId === 296) { // Hedera testnet
    return `https://testnet.explorer.hedera.com/contract/${contractAddress}`;
  }
  
  // Default to OpenSea mainnet
  return `https://opensea.io/assets/${contractAddress}/${tokenId.toString()}`;
}