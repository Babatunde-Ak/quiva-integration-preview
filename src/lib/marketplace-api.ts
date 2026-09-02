import { API_ENDPOINTS } from "@/config/api";

const PROXY_BASE = "/api/quiva";

type QueryValue = string | number | boolean | undefined;

function withQuery(path: string, query?: Record<string, QueryValue>) {
  if (!query) return `${PROXY_BASE}${path}`;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const suffix = params.toString();
  return `${PROXY_BASE}${path}${suffix ? `?${suffix}` : ""}`;
}

async function getJson<T>(path: string, query?: Record<string, QueryValue>): Promise<T> {
  const response = await fetch(withQuery(path, query), { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load marketplace data.");
  return response.json() as Promise<T>;
}

export type MarketplaceListQuery = {
  walletAddress?: string;
  tokenAddress?: string;
  comicId?: string;
  active?: boolean;
};

export const marketplaceApi = {
  getListings: <T = unknown>(query?: MarketplaceListQuery) =>
    getJson<T>(API_ENDPOINTS.marketplace.listings, query),
  getListing: <T = unknown>(listingId: string) =>
    getJson<T>(API_ENDPOINTS.marketplace.listing(listingId)),
  getOffers: <T = unknown>(query?: MarketplaceListQuery) =>
    getJson<T>(API_ENDPOINTS.marketplace.offers, query),
  getOffer: <T = unknown>(offerId: string) =>
    getJson<T>(API_ENDPOINTS.marketplace.offer(offerId)),
  getMyOffers: <T = unknown>(walletAddress: string) =>
    getJson<T>(API_ENDPOINTS.marketplace.myOffers, { walletAddress }),
  getReceivedOffers: <T = unknown>(walletAddress: string) =>
    getJson<T>(API_ENDPOINTS.marketplace.receivedOffers, { walletAddress }),
  getAuctions: <T = unknown>(query?: MarketplaceListQuery) =>
    getJson<T>(API_ENDPOINTS.marketplace.auctions, query),
  getAuction: <T = unknown>(auctionId: string) =>
    getJson<T>(API_ENDPOINTS.marketplace.auction(auctionId)),
  getBids: <T = unknown>(query?: MarketplaceListQuery) =>
    getJson<T>(API_ENDPOINTS.marketplace.bids, query),
};
