/**
 * useMirrorNodeQueries Hook
 * Custom React hook for fetching data from Mirror Node
 */

import { useState, useEffect, useCallback } from 'react';
import {
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
    CampaignInfo,
    DirectListingInfo,
    EpisodeInfo,
    MarketplaceListingInfo

}
 from './ContractQueries';

interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useMirrorNodeQueries() {
  
  // ============================================
  // DIRECT LISTING QUERIES
  // ============================================
  
  const [directListingState, setDirectListingState] = useState<QueryState<DirectListingInfo>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchDirectListing = useCallback(async (listingId: number) => {
    setDirectListingState({ data: null, isLoading: true, error: null });
    try {
      const data = await getDirectListingInfo(listingId);
      setDirectListingState({ data, isLoading: false, error: null });
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch direct listing';
      setDirectListingState({ data: null, isLoading: false, error: errorMessage });
      throw error;
    }
  }, []);

  // ============================================
  // EPISODE QUERIES
  // ============================================
  
  const [episodeState, setEpisodeState] = useState<QueryState<EpisodeInfo>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchEpisode = useCallback(async (episodeId: string) => {
    setEpisodeState({ data: null, isLoading: true, error: null });
    try {
      const data = await getEpisodeInfo(episodeId);
      setEpisodeState({ data, isLoading: false, error: null });
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch episode';
      setEpisodeState({ data: null, isLoading: false, error: errorMessage });
      throw error;
    }
  }, []);

  // ============================================
  // MARKETPLACE LISTING QUERIES
  // ============================================
  
  const [marketplaceListingState, setMarketplaceListingState] = useState<QueryState<MarketplaceListingInfo>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchMarketplaceListing = useCallback(async (listingId: number) => {
    setMarketplaceListingState({ data: null, isLoading: true, error: null });
    try {
      const data = await getMarketplaceListingInfo(listingId);
      setMarketplaceListingState({ data, isLoading: false, error: null });
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch marketplace listing';
      setMarketplaceListingState({ data: null, isLoading: false, error: errorMessage });
      throw error;
    }
  }, []);

  // ============================================
  // CAMPAIGN QUERIES
  // ============================================
  
  const [campaignState, setCampaignState] = useState<QueryState<CampaignInfo>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchCampaign = useCallback(async (campaignId: number) => {
    setCampaignState({ data: null, isLoading: true, error: null });
    try {
      const data = await getCampaignInfo(campaignId);
      setCampaignState({ data, isLoading: false, error: null });
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch campaign';
      setCampaignState({ data: null, isLoading: false, error: errorMessage });
      throw error;
    }
  }, []);

  // ============================================
  // USER PERMISSIONS
  // ============================================
  
  const [canReadState, setCanReadState] = useState<QueryState<boolean>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const checkCanReadComic = useCallback(async (episodeId: string, userAddress: string) => {
    setCanReadState({ data: null, isLoading: true, error: null });
    try {
      const data = await canUserReadComic(episodeId, userAddress);
      setCanReadState({ data, isLoading: false, error: null });
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to check read permission';
      setCanReadState({ data: null, isLoading: false, error: errorMessage });
      return false;
    }
  }, []);

  // ============================================
  // MARKETPLACE FEE
  // ============================================
  
  const [feeState, setFeeState] = useState<QueryState<number>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchMarketplaceFee = useCallback(async () => {
    setFeeState({ data: null, isLoading: true, error: null });
    try {
      const data = await getMarketplaceFee();
      setFeeState({ data, isLoading: false, error: null });
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch marketplace fee';
      setFeeState({ data: null, isLoading: false, error: errorMessage });
      throw error;
    }
  }, []);

  // ============================================
  // CURRENT PHASE
  // ============================================
  
  const [phaseState, setPhaseState] = useState<QueryState<{ phaseId: number; exists: boolean }>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchCurrentPhase = useCallback(async (campaignId: number) => {
    setPhaseState({ data: null, isLoading: true, error: null });
    try {
      const data = await getCurrentPhase(campaignId);
      setPhaseState({ data, isLoading: false, error: null });
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch current phase';
      setPhaseState({ data: null, isLoading: false, error: errorMessage });
      throw error;
    }
  }, []);

  // ============================================
  // NFT METADATA
  // ============================================
  
  const [nftMetadataState, setNftMetadataState] = useState<QueryState<any>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchNftMetadata = useCallback(async (tokenId: string, serialNumber: number) => {
    setNftMetadataState({ data: null, isLoading: true, error: null });
    try {
      const data = await getNftMetadata(tokenId, serialNumber);
      setNftMetadataState({ data, isLoading: false, error: null });
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch NFT metadata';
      setNftMetadataState({ data: null, isLoading: false, error: errorMessage });
      throw error;
    }
  }, []);

  // ============================================
  // ACCOUNT NFTs
  // ============================================
  
  const [accountNftsState, setAccountNftsState] = useState<QueryState<any>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchAccountNfts = useCallback(async (accountId: string, tokenId: string) => {
    setAccountNftsState({ data: null, isLoading: true, error: null });
    try {
      const data = await getAccountNftsForToken(accountId, tokenId);
      setAccountNftsState({ data, isLoading: false, error: null });
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch account NFTs';
      setAccountNftsState({ data: null, isLoading: false, error: errorMessage });
      throw error;
    }
  }, []);


   // get a particular account NFTS
  const [accountOwnedNftsState, setAccountOwnedNftsState] = useState<QueryState<any>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchAccountOwnedNfts = useCallback(async (accountId: string) => {

  setAccountOwnedNftsState({ data: null, isLoading: true, error: null });

  try {

    const res = await fetch(
      `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}/nfts`
    );

    const data = await res.json();

    setAccountOwnedNftsState({
      data: data.nfts,
      isLoading: false,
      error: null
    });

    return data.nfts;

  } catch (error: any) {

    setAccountOwnedNftsState({
      data: null,
      isLoading: false,
      error: error.message
    });

    throw error;
  }

}, []);

  // ============================================
  // ALL TOKEN NFTs (ANY OWNER)
  // ============================================
  
  const [tokenNftsState, setTokenNftsState] = useState<QueryState<any>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchAllTokenNfts = useCallback(async (tokenId: string) => {
    setTokenNftsState({ data: null, isLoading: true, error: null });
    try {
      const data = await getAllTokenNfts(tokenId);
      setTokenNftsState({ data, isLoading: false, error: null });
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch token NFTs';
      setTokenNftsState({ data: null, isLoading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return {
    // Direct Listing
    directListing: directListingState,
    fetchDirectListing,
    
    // Episode
    episode: episodeState,
    fetchEpisode,
    
    // Marketplace Listing
    marketplaceListing: marketplaceListingState,
    fetchMarketplaceListing,
    
    // Campaign
    campaign: campaignState,
    fetchCampaign,
    
    // Read Permission
    canRead: canReadState,
    checkCanReadComic,
    
    // Marketplace Fee
    marketplaceFee: feeState,
    fetchMarketplaceFee,
    
    // Current Phase
    currentPhase: phaseState,
    fetchCurrentPhase,
    
    // NFT Metadata
    nftMetadata: nftMetadataState,
    fetchNftMetadata,
    
    // Account NFTs
    accountNfts: accountNftsState,
    fetchAccountNfts,
    // ACCount owned
    accountOwnedNfts: accountOwnedNftsState,
    fetchAccountOwnedNfts,
    // All Token NFTs
    tokenNfts: tokenNftsState,
    fetchAllTokenNfts,
  };
}

export default useMirrorNodeQueries;