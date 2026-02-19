// Types for the API response
export interface ApiCreatorProfile {
  penName?: string;
}

export interface ApiCreator {
  _id: string;
  walletAddress: string;
  role: string[];
  creatorProfile?: ApiCreatorProfile;
  displayName?: string;
  avatar?: string;
}

export interface ApiCreatorsResponse {
  success: boolean;
  status: number;
  message: string;
  data: ApiCreator[];
}

// Transformed creator data for the UI component
export interface Creator {
  rank: number;
  name: string;
  penName: string;
  walletAddress: string;
  rating: string;
  sold: number;
  collections: number;
  image: string;
  id: string;
  roles: string[];
  isCreator: boolean;
}

// Creator stats for analytics (future use)
export interface CreatorStats {
  totalSales: number;
  totalCollections: number;
  avgRating: number;
  totalComics: number;
  followers: number;
  monthlyViews: number;
}

// Extended creator with stats
export interface CreatorWithStats extends Creator {
  stats?: CreatorStats;
}