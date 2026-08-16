/**
 * Confirmed Quiva backend endpoint reference.
 *
 * This file is documentation/sample code only. It should not be imported by
 * runtime feature code until an endpoint is intentionally integrated.
 *
 * Backend contract reference for the frontend integration.
 * Browser proxy path: /api/quiva
 */

export const BACKEND_ENDPOINTS = {
  auth: {
    root: "/auth",
    byId: (id: string) => `/auth/${id}`,
    profile: (id: string) => `/auth/${id}/profile`,
    email: (id: string) => `/auth/${id}/email`,
    username: (id: string) => `/auth/${id}/username`,
    becomeCreator: (id: string) => `/auth/${id}/become-creator`,
    refresh: "/auth/refresh",
    collaborators: "/auth/collaborators/all",
    walletMessage: "/auth/wallet/message",
    walletVerify: "/auth/wallet/verify",
  },
  comics: {
    all: "/comics/all",
    byId: (id: string) => `/comics/${id}`,
    preview: (id: string) => `/comics/preview/${id}`,
    paid: (id: string) => `/comics/paid/${id}`,
    userComics: "/comics/user_comic",
    create: (collectionId: string) => `/comics/${collectionId}`,
    createFull: (collectionId: string) => `/comics/full/${collectionId}`,
    trending: "/comics/trending/comics",
    update: (id: string) => `/comics/${id}`,
    updateCover: (id: string) => `/comics/${id}/cover`,
    updateToken: (comicId: string) => `/comics/token/${comicId}`,
    delete: (id: string) => `/comics/${id}`,
  },
  comicChapters: {
    all: "/comic_chapter/all",
    byComic: (comicId: string) => `/comic_chapter/comic/${comicId}`,
    byId: (id: string) => `/comic_chapter/${id}`,
    create: "/comic_chapter",
    update: (id: string) => `/comic_chapter/${id}`,
    delete: (id: string) => `/comic_chapter/${id}`,
  },
  comicPages: {
    create: "/comic_page",
    uploadToChapter: (chapterId: string) => `/comic_page/upload/${chapterId}`,
    byChapter: (chapterId: string) => `/comic_page/chapter/${chapterId}`,
    byId: (id: string) => `/comic_page/${id}`,
    update: (id: string) => `/comic_page/${id}`,
    delete: (id: string) => `/comic_page/${id}`,
  },
  collections: {
    root: "/collections",
    all: "/collections/all",
    user: "/collections/user",
    byId: (collectionId: string) => `/collections/${collectionId}`,
  },
  transactions: {
    root: "/transactions",
    userAll: "/transactions/user/all",
    verifyNft: (comicId: string) => `/transactions/user/verify_nft/${comicId}`,
    byComic: (comicId: string) => `/transactions/comic/${comicId}`,
    byHash: (txHash: string) => `/transactions/hash/${txHash}`,
    status: "/transactions/status",
  },
  nfts: {
    all: "/nfts/all",
    root: "/nfts",
    byComic: (comicId: string) => `/nfts/comic/${comicId}`,
    byId: (id: string) => `/nfts/${id}`,
  },
  creators: {
    approveCreator: "/creators/approve-creator",
    checkApproval: (address: string) => `/creators/check-approval/${address}`,
    approveFreeCreator: "/creators/approve-free-creator",
    checkFreeApproval: (address: string) => `/creators/check-free-approval/${address}`,
  },
  engagement: {
    likeComic: (comicId: string) => `/like/comics/${comicId}`,
    // Backend source mounts this under /api/view, with route /view/comics/:comicId.
    viewComic: (comicId: string) => `/view/view/comics/${comicId}`,
  },
} as const;

export interface ApiSuccess<T> {
  success: boolean;
  status: number;
  message?: string;
  data: T;
}

export interface ApiFailure {
  success?: false;
  status?: number;
  message: string;
  error?: string;
}

export interface Paginated<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
    currentPage: number;
    totalPages: number;
  };
}

export interface CreatorProfileSample {
  penName?: string;
  genres?: string[];
  verified?: boolean;
}

export interface UserSample {
  _id?: string;
  id?: string;
  email?: string;
  walletAddress?: string;
  username?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  banner?: string;
  role?: Array<"reader" | "creator" | "admin" | "superadmin">;
  creatorProfile?: CreatorProfileSample;
  createdAt?: string;
  lastLogin?: string;
}

export interface ComicSample {
  _id: string;
  title: string;
  description?: string;
  summary?: string;
  episodeNumber?: number;
  coverImage?: string;
  bannerImage?: string;
  genre?: string[];
  tags?: string[];
  status?: "draft" | "published";
  publishType?: "free" | "nft";
  creatorId?: string | UserSample;
  collectionId?: string | CollectionSample;
  nftId?: string | Record<string, unknown>;
  views?: number;
  likes?: number;
  isMinted?: boolean;
  isVisible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CollectionSample {
  _id: string;
  title: string;
  description?: string;
  genre?: string[];
  creatorId?: string | UserSample;
  comic?: string[] | ComicSample[];
  bannerImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WalletAuthRequestSample {
  walletAddress: string;
}

export interface WalletAuthResponseSample {
  accessToken: string;
  refreshToken: string;
  user: UserSample;
}

export interface CreateTransactionRequestSample {
  comicId: string;
  walletAddress: string;
  txHash: string;
  price: number;
  currency: string;
}

export interface TransactionSample {
  _id?: string;
  buyerId?: string;
  comicId?: string | ComicSample;
  walletAddress?: string;
  nftId?: string;
  txHash?: string;
  price?: number;
  currency?: string;
  status?: "PENDING" | "SUCCESS" | "FAILED";
  purchasedAt?: string;
}

export interface UpdateProfileRequestSample {
  displayName?: string;
  bio?: string;
  avatar?: File;
  banner?: File;
}

export interface UpdateComicTokenRequestSample {
  tokenId?: string;
  transactionId?: string;
  metadataTopicIds?: string[];
  serial?: string | number;
  listingId?: string;
  campaignId?: string;
  campaignType?: string;
  maxSupply?: number;
  price?: number;
}

const PROXY_BASE = "/api/quiva";

function buildProxyUrl(endpoint: string) {
  return `${PROXY_BASE}${endpoint}`;
}

export async function sampleFetchPublicComics() {
  const response = await fetch(buildProxyUrl(BACKEND_ENDPOINTS.comics.all), {
    method: "GET",
  });

  return response.json() as Promise<ApiSuccess<{ comics: Paginated<ComicSample> }>>;
}

export async function sampleWalletLogin(payload: WalletAuthRequestSample) {
  const response = await fetch(buildProxyUrl(BACKEND_ENDPOINTS.auth.walletMessage), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response.json() as Promise<ApiSuccess<WalletAuthResponseSample>>;
}

export async function sampleFetchCurrentUser(userId: string, accessToken: string) {
  const response = await fetch(buildProxyUrl(BACKEND_ENDPOINTS.auth.byId(userId)), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.json() as Promise<ApiSuccess<{ user: UserSample }>>;
}

export async function sampleFetchUserComics(accessToken: string) {
  const response = await fetch(buildProxyUrl(BACKEND_ENDPOINTS.comics.userComics), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.json() as Promise<ApiSuccess<{ comics: Paginated<ComicSample> | ComicSample[] }>>;
}

export async function sampleCreateTransaction(
  payload: CreateTransactionRequestSample,
  accessToken: string
) {
  const response = await fetch(buildProxyUrl(BACKEND_ENDPOINTS.transactions.root), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return response.json() as Promise<ApiSuccess<TransactionSample>>;
}

/**
 * Preview-only features after backend source audit:
 * - offers
 * - bids
 * - auctions
 * - orders
 * - escrow
 * - notifications
 * - watchlist list/read APIs
 * - portfolio summary/value APIs
 *
 * Backend-confirmed but not currently allowed by the frontend proxy:
 * - /nfts
 * - /creators
 * - /like
 * - /view
 */
