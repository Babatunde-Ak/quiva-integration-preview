import { ApiCreator, Creator, CreatorStats } from '../types/creator.types';

/**
 * Transform API creator data to UI format
 */
export const transformCreatorData = (apiData: ApiCreator[]): Creator[] => {
  return apiData
    .filter((creator) => creator.role?.includes('creator')) // Only include creators
    .map((creator, index) => {
      const penName = creator.creatorProfile?.penName || creator.displayName || "Unknown Creator";
      const displayName = creator.displayName || creator.creatorProfile?.penName || "Anonymous";
      
      return {
        rank: index + 1,
        name: displayName,
        penName: penName,
        walletAddress: creator.walletAddress,
        rating: generateMockRating(), // Replace with real analytics data
        sold: generateMockSales(), // Replace with real comic sales data
        collections: generateMockCollections(), // Replace with actual collections data
        image: creator.avatar || getDefaultAvatar(creator.walletAddress),
        id: creator._id,
        roles: creator.role || [],
        isCreator: creator.role?.includes('creator') || false
      };
    });
};

/**
 * Generate mock rating - Replace with real analytics
 */
const generateMockRating = (): string => {
  const isPositive = Math.random() > 0.3; // 70% chance of positive rating
  const percentage = Math.floor(Math.random() * 50) + 1;
  return `${isPositive ? '+' : '-'}${percentage}%`;
};

/**
 * Generate mock sales data - Replace with real sales data
 */
const generateMockSales = (): number => {
  return Math.floor(Math.random() * 1000) + 100;
};

/**
 * Generate mock collections data - Replace with real collections data
 */
const generateMockCollections = (): number => {
  return Math.floor(Math.random() * 200) + 50;
};

/**
 * Generate default avatar based on wallet address
 */
const getDefaultAvatar = (walletAddress: string): string => {
  // You could use a service like Boring Avatars or Identicons
  // For now, using a placeholder
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${walletAddress}`;
};

/**
 * Sort creators by different criteria
 */
export const sortCreators = (creators: Creator[], sortBy: 'rank' | 'sold' | 'collections' | 'name'): Creator[] => {
  return [...creators].sort((a, b) => {
    switch (sortBy) {
      case 'rank':
        return a.rank - b.rank;
      case 'sold':
        return b.sold - a.sold; // Descending order
      case 'collections':
        return b.collections - a.collections; // Descending order
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return a.rank - b.rank;
    }
  });
};

/**
 * Filter creators by time period (mock implementation)
 */
export const filterCreatorsByTimePeriod = (
  creators: Creator[], 
  period: 'today' | 'week' | 'month' | 'all'
): Creator[] => {
  // This is a mock implementation. In a real app, you'd filter based on actual data timestamps
  switch (period) {
    case 'today':
      return creators.slice(0, Math.ceil(creators.length * 0.2)); // Top 20%
    case 'week':
      return creators.slice(0, Math.ceil(creators.length * 0.5)); // Top 50%
    case 'month':
      return creators.slice(0, Math.ceil(creators.length * 0.8)); // Top 80%
    case 'all':
    default:
      return creators;
  }
};

/**
 * Calculate creator statistics
 */
export const calculateCreatorStats = (creators: Creator[]): {
  totalCreators: number;
  totalSales: number;
  totalCollections: number;
  avgRating: number;
} => {
  const totalCreators = creators.length;
  const totalSales = creators.reduce((sum, creator) => sum + creator.sold, 0);
  const totalCollections = creators.reduce((sum, creator) => sum + creator.collections, 0);
  
  // Calculate average rating (convert percentage strings to numbers)
  const ratings = creators.map(creator => {
    const match = creator.rating.match(/([+-])(\d+)%/);
    if (match) {
      const sign = match[1] === '+' ? 1 : -1;
      const value = parseInt(match[2]);
      return sign * value;
    }
    return 0;
  });
  
  const avgRating = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
    : 0;

  return {
    totalCreators,
    totalSales,
    totalCollections,
    avgRating: Math.round(avgRating * 100) / 100 // Round to 2 decimal places
  };
};

/**
 * Search creators by name or pen name
 */
export const searchCreators = (creators: Creator[], query: string): Creator[] => {
  const lowercaseQuery = query.toLowerCase();
  return creators.filter(creator => 
    creator.name.toLowerCase().includes(lowercaseQuery) ||
    creator.penName.toLowerCase().includes(lowercaseQuery)
  );
};

/**
 * Paginate creators
 */
export const paginateCreators = (
  creators: Creator[], 
  page: number, 
  itemsPerPage: number
): {
  paginatedCreators: Creator[];
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} => {
  const totalPages = Math.ceil(creators.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCreators = creators.slice(startIndex, endIndex);

  return {
    paginatedCreators,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};