// // import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// // import { mirrorNodeAnalytics } from '@/hook/analytics/MirroNodeAnalytics';

// // // Configuration - Update these with your contract/token IDs
// // const ANALYTICS_CONFIG = {
// //   marketplaceContractId: '0.0.7829656', // Your COMIC_MARKETPLACE contract
// //   salesContractId: '0.0.7829668',       // Your COMIC_SALES contract
// //   comicTokenIds: [] as string[]          // Will be populated from Redux comics state
// // };

// // // Types
// // interface AnalyticsOverview {
// //   totalVolume: string;
// //   totalSales: number;
// //   totalMinted: number;
// //   totalCollectors: number;
// //   totalViews: number;
// //   totalLikes: number;
// // }

// // interface VolumeData {
// //   month: string;
// //   volume: number;
// //   count: number;
// // }

// // interface MintData {
// //   month: string;
// //   count: number;
// // }

// // interface AnalyticsState {
// //   overview: AnalyticsOverview | null;
// //   volumeByMonth: VolumeData[];
// //   mintsByMonth: MintData[];
// //   isLoading: boolean;
// //   error: string | null;
// // }

// // const initialState: AnalyticsState = {
// //   overview: null,
// //   volumeByMonth: [],
// //   mintsByMonth: [],
// //   isLoading: false,
// //   error: null,
// // };

// // /**
// //  * Fetch complete analytics from Mirror Node
// //  * No backend API required!
// //  */
// // export const fetchMirrorNodeAnalytics = createAsyncThunk(
// //   'analytics/fetchFromMirrorNode',
// //   async (_, { getState, rejectWithValue }) => {
// //     try {
// //       // Get comic token IDs from Redux state
// //       const state: any = getState();
// //       const allComics = state.comic?.comics?.data?.comics?.data || [];
      
// //       // Extract unique token IDs from comics
// //       const comicTokenIds = allComics
// //         .filter((comic: any) => comic.nftId?.tokenId)
// //         .map((comic: any) => comic.nftId.tokenId)
// //         .filter((id: string, index: number, self: string[]) => 
// //           self.indexOf(id) === index // Remove duplicates
// //         );

// //       console.log(`📊 Fetching analytics for ${comicTokenIds.length} comic tokens...`);

// //       if (comicTokenIds.length === 0) {
// //         console.warn('⚠️ No comic tokens found. Make sure comics are loaded in Redux.');
// //       }

// //       // Fetch analytics from Mirror Node
// //       const analytics = await mirrorNodeAnalytics.getCompleteAnalytics({
// //         marketplaceContractId: ANALYTICS_CONFIG.salesContractId,
// //         comicTokenIds
// //       });

// //       // Get views and likes from Redux comics
// //       const totalViews = allComics.reduce((sum: number, comic: any) => 
// //         sum + (comic.views || 0), 0
// //       );
      
// //       const totalLikes = allComics.reduce((sum: number, comic: any) => 
// //         sum + (comic.likes || 0), 0
// //       );

// //       // Combine Mirror Node data with local data
// //       return {
// //         overview: {
// //           ...analytics.overview,
// //           totalViews,
// //           totalLikes
// //         },
// //         volumeByMonth: analytics.volumeByMonth,
// //         mintsByMonth: analytics.mintsByMonth
// //       };
// //     } catch (error: any) {
// //       console.error('❌ Error fetching Mirror Node analytics:', error);
// //       return rejectWithValue(error.message || 'Failed to fetch analytics');
// //     }
// //   }
// // );

// // /**
// //  * Fetch only trading volume (faster)
// //  */
// // export const fetchTradingVolume = createAsyncThunk(
// //   'analytics/fetchTradingVolume',
// //   async (_, { rejectWithValue }) => {
// //     try {
// //       const volumeData = await mirrorNodeAnalytics.calculateTradingVolume(
// //         ANALYTICS_CONFIG.salesContractId
// //       );
      
// //       return {
// //         totalVolume: volumeData.totalVolume,
// //         totalSales: volumeData.totalSales,
// //         volumeByMonth: volumeData.volumeByMonth
// //       };
// //     } catch (error: any) {
// //       return rejectWithValue(error.message || 'Failed to fetch volume');
// //     }
// //   }
// // );

// // /**
// //  * Fetch only NFT stats (faster)
// //  */
// // export const fetchNFTStats = createAsyncThunk(
// //   'analytics/fetchNFTStats',
// //   async (comicTokenIds: string[], { rejectWithValue }) => {
// //     try {
// //       const nftStats = await mirrorNodeAnalytics.getComicNFTStats(comicTokenIds);
      
// //       return {
// //         totalMinted: nftStats.totalMinted,
// //         totalCollectors: nftStats.uniqueOwners.size,
// //         mintsByMonth: nftStats.mintsByMonth
// //       };
// //     } catch (error: any) {
// //       return rejectWithValue(error.message || 'Failed to fetch NFT stats');
// //     }
// //   }
// // );

// // // Slice
// // const mirrorNodeAnalyticsSlice = createSlice({
// //   name: 'mirrorNodeAnalytics',
// //   initialState,
// //   reducers: {
// //     clearAnalytics: (state) => {
// //       state.overview = null;
// //       state.volumeByMonth = [];
// //       state.mintsByMonth = [];
// //       state.error = null;
// //     },
// //   },
// //   extraReducers: (builder) => {
// //     // Fetch complete analytics
// //     builder
// //       .addCase(fetchMirrorNodeAnalytics.pending, (state) => {
// //         state.isLoading = true;
// //         state.error = null;
// //       })
// //       .addCase(fetchMirrorNodeAnalytics.fulfilled, (state, action: PayloadAction<any>) => {
// //         state.isLoading = false;
// //         state.overview = action.payload.overview;
// //         state.volumeByMonth = action.payload.volumeByMonth;
// //         state.mintsByMonth = action.payload.mintsByMonth;
// //       })
// //       .addCase(fetchMirrorNodeAnalytics.rejected, (state, action) => {
// //         state.isLoading = false;
// //         state.error = action.payload as string;
// //       });

// //     // Fetch trading volume
// //     builder
// //       .addCase(fetchTradingVolume.pending, (state) => {
// //         state.isLoading = true;
// //       })
// //       .addCase(fetchTradingVolume.fulfilled, (state, action: PayloadAction<any>) => {
// //         state.isLoading = false;
// //         if (state.overview) {
// //           state.overview.totalVolume = action.payload.totalVolume.toFixed(2);
// //           state.overview.totalSales = action.payload.totalSales;
// //         }
// //         state.volumeByMonth = action.payload.volumeByMonth;
// //       })
// //       .addCase(fetchTradingVolume.rejected, (state, action) => {
// //         state.isLoading = false;
// //         state.error = action.payload as string;
// //       });

// //     // Fetch NFT stats
// //     builder
// //       .addCase(fetchNFTStats.pending, (state) => {
// //         state.isLoading = true;
// //       })
// //       .addCase(fetchNFTStats.fulfilled, (state, action: PayloadAction<any>) => {
// //         state.isLoading = false;
// //         if (state.overview) {
// //           state.overview.totalMinted = action.payload.totalMinted;
// //           state.overview.totalCollectors = action.payload.totalCollectors;
// //         }
// //         state.mintsByMonth = action.payload.mintsByMonth;
// //       })
// //       .addCase(fetchNFTStats.rejected, (state, action) => {
// //         state.isLoading = false;
// //         state.error = action.payload as string;
// //       });
// //   },
// // });

// // export const { clearAnalytics } = mirrorNodeAnalyticsSlice.actions;
// // export default mirrorNodeAnalyticsSlice.reducer;

// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import { mirrorNodeAnalytics } from '@/hook/analytics/MirroNodeAnalytics';

// // Configuration - Update these with your contract/token IDs
// const ANALYTICS_CONFIG = {
//   marketplaceContractId: '0.0.7829656', // Your COMIC_MARKETPLACE contract
//   salesContractId: '0.0.7829668',       // Your COMIC_SALES contract
//   comicTokenIds: [] as string[]          // Will be populated from Redux comics state
// };

// // Types
// interface AnalyticsOverview {
//   totalVolume: string;
//   totalSales: number;
//   totalMinted: number;
//   totalCollectors: number;
//   totalViews: number;
//   totalLikes: number;
// }

// interface VolumeData {
//   month: string;
//   volume: number;
//   count: number;
// }

// interface MintData {
//   month: string;
//   count: number;
// }

// interface AnalyticsState {
//   overview: AnalyticsOverview | null;
//   volumeByMonth: VolumeData[];
//   mintsByMonth: MintData[];
//   isLoading: boolean;
//   error: string | null;
// }

// const initialState: AnalyticsState = {
//   overview: null,
//   volumeByMonth: [],
//   mintsByMonth: [],
//   isLoading: false,
//   error: null,
// };

// /**
//  * Fetch complete analytics from Mirror Node
//  * No backend API required!
//  */
// export const fetchMirrorNodeAnalytics = createAsyncThunk(
//   'analytics/fetchFromMirrorNode',
//   async (_, { getState, rejectWithValue }) => {
//     try {
//       // Get comic token IDs from Redux state
//       const state: any = getState();
//       const allComics = state.comic?.comics?.data?.comics?.data || [];
      
//       // Extract unique token IDs from comics
//       const comicTokenIds = allComics
//         .filter((comic: any) => comic.nftId?.tokenId)
//         .map((comic: any) => comic.nftId.tokenId)
//         .filter((id: string, index: number, self: string[]) => 
//           self.indexOf(id) === index // Remove duplicates
//         );

//       console.log(`📊 Fetching analytics for ${comicTokenIds.length} comic tokens...`);

//       if (comicTokenIds.length === 0) {
//         console.warn('⚠️ No comic tokens found. Make sure comics are loaded in Redux.');
//       }

//       // Fetch analytics from Mirror Node
//       const analytics = await mirrorNodeAnalytics.getCompleteAnalytics({
//         marketplaceContractId: ANALYTICS_CONFIG.salesContractId,
//         comicTokenIds
//       });

//       // Get views and likes from Redux comics
//       const totalViews = allComics.reduce((sum: number, comic: any) => 
//         sum + (comic.views || 0), 0
//       );
      
//       const totalLikes = allComics.reduce((sum: number, comic: any) => 
//         sum + (comic.likes || 0), 0
//       );

//       // Combine Mirror Node data with local data
//       return {
//         overview: {
//           ...analytics.overview,
//           totalViews,
//           totalLikes
//         },
//         volumeByMonth: analytics.volumeByMonth,
//         mintsByMonth: analytics.mintsByMonth
//       };
//     } catch (error: any) {
//       console.error('❌ Error fetching Mirror Node analytics:', error);
//       return rejectWithValue(error.message || 'Failed to fetch analytics');
//     }
//   }
// );

// /**
//  * Fetch only trading volume (faster)
//  */
// export const fetchTradingVolume = createAsyncThunk(
//   'analytics/fetchTradingVolume',
//   async (_, { rejectWithValue }) => {
//     try {
//       const volumeData = await mirrorNodeAnalytics.calculateTradingVolume(
//         ANALYTICS_CONFIG.salesContractId
//       );
      
//       return {
//         totalVolume: volumeData.totalVolume,
//         totalSales: volumeData.totalSales,
//         volumeByMonth: volumeData.volumeByMonth
//       };
//     } catch (error: any) {
//       return rejectWithValue(error.message || 'Failed to fetch volume');
//     }
//   }
// );

// /**
//  * Fetch only NFT stats (faster)
//  */
// export const fetchNFTStats = createAsyncThunk(
//   'analytics/fetchNFTStats',
//   async (comicTokenIds: string[], { rejectWithValue }) => {
//     try {
//       const nftStats = await mirrorNodeAnalytics.getComicNFTStats(comicTokenIds);
      
//       return {
//         totalMinted: nftStats.totalMinted,
//         totalCollectors: nftStats.uniqueOwners.size,
//         mintsByMonth: nftStats.mintsByMonth
//       };
//     } catch (error: any) {
//       return rejectWithValue(error.message || 'Failed to fetch NFT stats');
//     }
//   }
// );

// // Slice
// const mirrorNodeAnalyticsSlice = createSlice({
//   name: 'mirrorNodeAnalytics',
//   initialState,
//   reducers: {
//     clearAnalytics: (state) => {
//       state.overview = null;
//       state.volumeByMonth = [];
//       state.mintsByMonth = [];
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     // Fetch complete analytics
//     builder
//       .addCase(fetchMirrorNodeAnalytics.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchMirrorNodeAnalytics.fulfilled, (state, action: PayloadAction<any>) => {
//         state.isLoading = false;
//         state.overview = action.payload.overview;
//         state.volumeByMonth = action.payload.volumeByMonth;
//         state.mintsByMonth = action.payload.mintsByMonth;
//       })
//       .addCase(fetchMirrorNodeAnalytics.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       });

//     // Fetch trading volume
//     builder
//       .addCase(fetchTradingVolume.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(fetchTradingVolume.fulfilled, (state, action: PayloadAction<any>) => {
//         state.isLoading = false;
//         if (state.overview) {
//           state.overview.totalVolume = action.payload.totalVolume.toFixed(2);
//           state.overview.totalSales = action.payload.totalSales;
//         }
//         state.volumeByMonth = action.payload.volumeByMonth;
//       })
//       .addCase(fetchTradingVolume.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       });

//     // Fetch NFT stats
//     builder
//       .addCase(fetchNFTStats.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(fetchNFTStats.fulfilled, (state, action: PayloadAction<any>) => {
//         state.isLoading = false;
//         if (state.overview) {
//           state.overview.totalMinted = action.payload.totalMinted;
//           state.overview.totalCollectors = action.payload.totalCollectors;
//         }
//         state.mintsByMonth = action.payload.mintsByMonth;
//       })
//       .addCase(fetchNFTStats.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       });
//   },
// });

// export const { clearAnalytics } = mirrorNodeAnalyticsSlice.actions;
// export default mirrorNodeAnalyticsSlice.reducer;
// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import { mirrorNodeAnalytics } from '@/hook/analytics/MirroNodeAnalytics';

// // ----------------------------------------------------------------------
// // Configuration – update these with your deployed contract IDs
// // ----------------------------------------------------------------------
// const ANALYTICS_CONFIG = {
//   // The contract that handles purchases and mints (QuivaComicSales)
//   salesContractId:'0.0.7829668',
// };

// // ----------------------------------------------------------------------
// // Type definitions
// // ----------------------------------------------------------------------
// interface AnalyticsOverview {
//   totalVolume: string;        // in HBAR, as string for formatting
//   totalSales: number;         // number of on‑chain sales transactions
//   totalMinted: number;        // total NFTs minted across all comics
//   totalCollectors: number;    // unique owner count
//   totalViews: number;         // from your backend / Redux
//   totalLikes: number;         // from your backend / Redux
// }

// interface VolumeDataPoint {
//   month: string;              // e.g. "Jan"
//   volume: number;             // HBAR volume in that month
//   count: number;              // number of sales in that month
// }

// interface MintDataPoint {
//   month: string;              // e.g. "Feb"
//   count: number;              // number of mints in that month
// }

// interface AnalyticsState {
//   overview: AnalyticsOverview | null;
//   volumeByMonth: VolumeDataPoint[];
//   mintsByMonth: MintDataPoint[];
//   isLoading: boolean;
//   error: string | null;
// }

// const initialState: AnalyticsState = {
//   overview: null,
//   volumeByMonth: [],
//   mintsByMonth: [],
//   isLoading: false,
//   error: null,
// };

// // ----------------------------------------------------------------------
// // Async Thunk: fetch all analytics from Mirror Node + Redux state
// // ----------------------------------------------------------------------
// export const fetchMirrorNodeAnalytics = createAsyncThunk(
//   'analytics/fetchFromMirrorNode',
//   async (_, { getState, rejectWithValue }) => {
//     try {
//       // 1. Get comic data from Redux (for token IDs and off‑chain stats)
//       const state: any = getState();
//       const allComics = state.comic?.comics?.data?.comics?.data || [];

//       // ✅ Helper function to validate Hedera token IDs
//       const isValidHederaTokenId = (tokenId: string | null | undefined): boolean => {
//         if (!tokenId || typeof tokenId !== 'string') return false;
        
//         // Valid formats:
//         // 1. Hedera format: "0.0.12345"
//         // 2. EVM address: "0x000000000000000000000000000000000077408b"
        
//         const hederaFormat = /^0\.0\.\d+$/;  // Matches "0.0.12345"
//         const evmFormat = /^0x[0-9a-fA-F]{40}$/;  // Matches "0x..." (40 hex chars)
        
//         return hederaFormat.test(tokenId) || evmFormat.test(tokenId);
//       };

//       // Extract unique token IDs from comics (used for NFT stats)
//       const comicTokenIds = allComics
//         .filter((comic: any) => comic.nftId?.tokenId)
//         .map((comic: any) => comic.nftId.tokenId)
//         .filter((id: string) => isValidHederaTokenId(id))  // ✅ Only valid Hedera IDs
//         .filter((id: string, index: number, self: string[]) => self.indexOf(id) === index);

//       console.log(`📊 Found ${allComics.length} total comics`);
//       console.log(`✅ Valid Hedera tokens: ${comicTokenIds.length}`);
//       console.log(`🎯 Token IDs:`, comicTokenIds);

//       // 2. Fetch on‑chain trading volume (sum of HBAR sent in purchaseFromListing + mint)
//       const volumeData = await mirrorNodeAnalytics.calculateTradingVolume(
//         ANALYTICS_CONFIG.salesContractId
//       );

//       // 3. Fetch NFT minting statistics (total minted, unique owners, monthly mints)
//       const nftStats = await mirrorNodeAnalytics.getComicNFTStats(comicTokenIds);

//       // 4. Aggregate off‑chain views and likes from Redux comics
//       const totalViews = allComics.reduce((sum: number, comic: any) => sum + (comic.views || 0), 0);
//       const totalLikes = allComics.reduce((sum: number, comic: any) => sum + (comic.likes || 0), 0);

//       // 5. Return combined data
//       return {
//         overview: {
//           totalVolume: volumeData.totalVolume.toFixed(2),
//           totalSales: volumeData.totalSales,
//           totalMinted: nftStats.totalMinted,
//           totalCollectors: nftStats.uniqueOwners.size,
//           totalViews,
//           totalLikes,
//         },
//         volumeByMonth: volumeData.volumeByMonth,
//         mintsByMonth: nftStats.mintsByMonth,
//       };
//     } catch (error: any) {
//       console.error('❌ Error fetching Mirror Node analytics:', error);
//       return rejectWithValue(error.message || 'Failed to fetch analytics');
//     }
//   }
// );

// /**
//  * Optional: fetch only trading volume (faster, for partial updates)
//  */
// export const fetchTradingVolume = createAsyncThunk(
//   'analytics/fetchTradingVolume',
//   async (_, { rejectWithValue }) => {
//     try {
//       const volumeData = await mirrorNodeAnalytics.calculateTradingVolume(
//         ANALYTICS_CONFIG.salesContractId
//       );
//       return {
//         totalVolume: volumeData.totalVolume,
//         totalSales: volumeData.totalSales,
//         volumeByMonth: volumeData.volumeByMonth,
//       };
//     } catch (error: any) {
//       return rejectWithValue(error.message || 'Failed to fetch volume');
//     }
//   }
// );

// /**
//  * Optional: fetch only NFT stats (faster, for partial updates)
//  */
// export const fetchNFTStats = createAsyncThunk(
//   'analytics/fetchNFTStats',
//   async (comicTokenIds: string[], { rejectWithValue }) => {
//     try {
//       const nftStats = await mirrorNodeAnalytics.getComicNFTStats(comicTokenIds);
//       return {
//         totalMinted: nftStats.totalMinted,
//         totalCollectors: nftStats.uniqueOwners.size,
//         mintsByMonth: nftStats.mintsByMonth,
//       };
//     } catch (error: any) {
//       return rejectWithValue(error.message || 'Failed to fetch NFT stats');
//     }
//   }
// );

// // ----------------------------------------------------------------------
// // Slice
// // ----------------------------------------------------------------------
// const mirrorNodeAnalyticsSlice = createSlice({
//   name: 'mirrorNodeAnalytics',
//   initialState,
//   reducers: {
//     clearAnalytics: (state) => {
//       state.overview = null;
//       state.volumeByMonth = [];
//       state.mintsByMonth = [];
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     // ---- fetchMirrorNodeAnalytics ----
//     builder
//       .addCase(fetchMirrorNodeAnalytics.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchMirrorNodeAnalytics.fulfilled, (state, action: PayloadAction<any>) => {
//         state.isLoading = false;
//         state.overview = action.payload.overview;
//         state.volumeByMonth = action.payload.volumeByMonth;
//         state.mintsByMonth = action.payload.mintsByMonth;
//       })
//       .addCase(fetchMirrorNodeAnalytics.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       });

//     // ---- fetchTradingVolume ----
//     builder
//       .addCase(fetchTradingVolume.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(fetchTradingVolume.fulfilled, (state, action: PayloadAction<any>) => {
//         state.isLoading = false;
//         if (state.overview) {
//           state.overview.totalVolume = action.payload.totalVolume.toFixed(2);
//           state.overview.totalSales = action.payload.totalSales;
//         } else {
//           // If overview doesn't exist yet, create a minimal one
//           state.overview = {
//             totalVolume: action.payload.totalVolume.toFixed(2),
//             totalSales: action.payload.totalSales,
//             totalMinted: 0,
//             totalCollectors: 0,
//             totalViews: 0,
//             totalLikes: 0,
//           };
//         }
//         state.volumeByMonth = action.payload.volumeByMonth;
//       })
//       .addCase(fetchTradingVolume.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       });

//     // ---- fetchNFTStats ----
//     builder
//       .addCase(fetchNFTStats.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(fetchNFTStats.fulfilled, (state, action: PayloadAction<any>) => {
//         state.isLoading = false;
//         if (state.overview) {
//           state.overview.totalMinted = action.payload.totalMinted;
//           state.overview.totalCollectors = action.payload.totalCollectors;
//         } else {
//           state.overview = {
//             totalVolume: '0.00',
//             totalSales: 0,
//             totalMinted: action.payload.totalMinted,
//             totalCollectors: action.payload.totalCollectors,
//             totalViews: 0,
//             totalLikes: 0,
//           };
//         }
//         state.mintsByMonth = action.payload.mintsByMonth;
//       })
//       .addCase(fetchNFTStats.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       });
//   },
// });

// export const { clearAnalytics } = mirrorNodeAnalyticsSlice.actions;
// export default mirrorNodeAnalyticsSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { mirrorNodeAnalytics } from '@/hook/analytics/MirroNodeAnalytics';

// ----------------------------------------------------------------------
// Configuration – update these with your deployed contract IDs
// ----------------------------------------------------------------------
const ANALYTICS_CONFIG = {
  // The contract that handles purchases and mints (QuivaComicSales)
  salesContractId: '0.0.7829668',
};

// ----------------------------------------------------------------------
// Type definitions
// ----------------------------------------------------------------------
interface AnalyticsOverview {
  totalVolume: string;        // in HBAR, as string for formatting
  totalSales: number;         // number of on‑chain sales transactions
  totalMinted: number;        // total NFTs minted across all comics
  totalCollectors: number;    // unique owner count
  totalViews: number;         // from your backend / Redux
  totalLikes: number;         // from your backend / Redux
}

interface VolumeDataPoint {
  month: string;              // e.g. "Jan"
  volume: number;             // HBAR volume in that month
  count: number;              // number of sales in that month
}

interface MintDataPoint {
  month: string;              // e.g. "Feb"
  count: number;              // number of mints in that month
}

interface AnalyticsState {
  overview: AnalyticsOverview | null;
  volumeByMonth: VolumeDataPoint[];
  mintsByMonth: MintDataPoint[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  overview: null,
  volumeByMonth: [],
  mintsByMonth: [],
  isLoading: false,
  error: null,
};

// ----------------------------------------------------------------------
// Async Thunk: fetch all analytics from Mirror Node + Redux state
// ----------------------------------------------------------------------
// export const fetchMirrorNodeAnalytics = createAsyncThunk(
//   'analytics/fetchFromMirrorNode',
//   async (_, { getState, rejectWithValue }) => {
//     try {
//       // 1. Get comic data from Redux (for token IDs and off‑chain stats)
//       const state: any = getState();
//       const allComics = state.comic?.comics?.data?.comics?.data || [];

//       // Extract unique token IDs from comics (used for NFT stats)
//       const comicTokenIds = allComics
//         .filter((comic: any) => comic.nftId?.tokenId)
//         .map((comic: any) => comic.nftId.tokenId)
//         .filter((id: string, index: number, self: string[]) => self.indexOf(id) === index);

//       console.log(`📊 Fetching analytics for ${comicTokenIds.length} comic tokens...`);

//       // If no comics are loaded, return empty data
//       if (comicTokenIds.length === 0) {
//         console.warn('⚠️ No comic tokens found. Make sure comics are loaded in Redux.');
//         return {
//           overview: {
//             totalVolume: '0.00',
//             totalSales: 0,
//             totalMinted: 0,
//             totalCollectors: 0,
//             totalViews: 0,
//             totalLikes: 0,
//           },
//           volumeByMonth: [],
//           mintsByMonth: [],
//         };
//       }

//       // 2. Fetch on‑chain trading volume (sum of HBAR sent in purchaseFromListing + mint)
//       const volumeData = await mirrorNodeAnalytics.calculateTradingVolume(
//         ANALYTICS_CONFIG.salesContractId
//       );

//       // 3. Fetch NFT minting statistics (total minted, unique owners, monthly mints)
//       const nftStats = await mirrorNodeAnalytics.getComicNFTStats(comicTokenIds);

//       // 4. Aggregate off‑chain views and likes from Redux comics
//       const totalViews = allComics.reduce((sum: number, comic: any) => sum + (comic.views || 0), 0);
//       const totalLikes = allComics.reduce((sum: number, comic: any) => sum + (comic.likes || 0), 0);

//       // 5. Return combined data
//       return {
//         overview: {
//           totalVolume: volumeData.totalVolume.toFixed(2),
//           totalSales: volumeData.totalSales,
//           totalMinted: nftStats.totalMinted,
//           totalCollectors: nftStats.uniqueOwners.size,
//           totalViews,
//           totalLikes,
//         },
//         volumeByMonth: volumeData.volumeByMonth,
//         mintsByMonth: nftStats.mintsByMonth,
//       };
//     } catch (error: any) {
//       console.error('❌ Error fetching Mirror Node analytics:', error);
//       return rejectWithValue(error.message || 'Failed to fetch analytics');
//     }
//   }
// );
export const fetchMirrorNodeAnalytics = createAsyncThunk(
  'analytics/fetchFromMirrorNode',
  async (_, { getState, rejectWithValue }) => {
    try {
      console.log('🔵 ===== FETCH MIRROR NODE ANALYTICS STARTED =====');
      
      const state: any = getState();
      const allComics = state.comic?.comics?.data?.comics?.data || [];
      console.log('📚 Comics loaded:', allComics.length);

      const comicTokenIds = allComics
        .filter((comic: any) => comic.nftId?.tokenId)
        .map((comic: any) => comic.nftId.tokenId)
        .filter((id: string, index: number, self: string[]) => self.indexOf(id) === index);

      console.log(`🎯 Comic Token IDs:`, comicTokenIds);

      console.log('📊 Calling mirrorNodeAnalytics.calculateTradingVolume...');
      const volumeData = await mirrorNodeAnalytics.calculateTradingVolume(
        ANALYTICS_CONFIG.salesContractId
      );
      console.log('📊 Volume data received in thunk:', volumeData);

      console.log('📊 Calling mirrorNodeAnalytics.getComicNFTStats...');
      const nftStats = await mirrorNodeAnalytics.getComicNFTStats(comicTokenIds);
      console.log('📊 NFT stats received in thunk:', {
        totalMinted: nftStats.totalMinted,
        uniqueOwners: nftStats.uniqueOwners.size,
        mintsByMonth: nftStats.mintsByMonth
      });

      const totalViews = allComics.reduce((sum: number, comic: any) => sum + (comic.views || 0), 0);
      const totalLikes = allComics.reduce((sum: number, comic: any) => sum + (comic.likes || 0), 0);

      const result = {
        overview: {
          totalVolume: volumeData.totalVolume.toFixed(2),
          totalSales: volumeData.totalSales,
          totalMinted: nftStats.totalMinted,
          totalCollectors: nftStats.uniqueOwners.size,
          totalViews,
          totalLikes,
        },
        volumeByMonth: volumeData.volumeByMonth,
        mintsByMonth: nftStats.mintsByMonth,
      };

      console.log('🔵 FINAL RESULT BEING DISPATCHED TO REDUX:', result);
      console.log('   totalVolume:', result.overview.totalVolume);
      console.log('   totalSales:', result.overview.totalSales);
      
      return result;
    } catch (error: any) {
      console.error('❌ Error in fetchMirrorNodeAnalytics:', error);
      return rejectWithValue(error.message || 'Failed to fetch analytics');
    }
  }
);

/**
 * Fetch only trading volume (faster, for partial updates)
 */
export const fetchTradingVolume = createAsyncThunk(
  'analytics/fetchTradingVolume',
  async (_, { rejectWithValue }) => {
    try {
      const volumeData = await mirrorNodeAnalytics.calculateTradingVolume(
        ANALYTICS_CONFIG.salesContractId
      );
      return {
        totalVolume: volumeData.totalVolume,
        totalSales: volumeData.totalSales,
        volumeByMonth: volumeData.volumeByMonth,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch volume');
    }
  }
);

/**
 * Fetch only NFT stats (faster, for partial updates)
 */
export const fetchNFTStats = createAsyncThunk(
  'analytics/fetchNFTStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const allComics = state.comic?.comics?.data?.comics?.data || [];

      const comicTokenIds = allComics
        .filter((comic: any) => comic.nftId?.tokenId)
        .map((comic: any) => comic.nftId.tokenId)
        .filter((id: string, index: number, self: string[]) => self.indexOf(id) === index);

      const nftStats = await mirrorNodeAnalytics.getComicNFTStats(comicTokenIds);
      
      return {
        totalMinted: nftStats.totalMinted,
        totalCollectors: nftStats.uniqueOwners.size,
        mintsByMonth: nftStats.mintsByMonth,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch NFT stats');
    }
  }
);

// ----------------------------------------------------------------------
// Slice
// ----------------------------------------------------------------------
const mirrorNodeAnalyticsSlice = createSlice({
  name: 'mirrorNodeAnalytics',
  initialState,
  reducers: {
    clearAnalytics: (state) => {
      state.overview = null;
      state.volumeByMonth = [];
      state.mintsByMonth = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ---- fetchMirrorNodeAnalytics ----
    builder
      .addCase(fetchMirrorNodeAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMirrorNodeAnalytics.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.overview = action.payload.overview;
        state.volumeByMonth = action.payload.volumeByMonth;
        state.mintsByMonth = action.payload.mintsByMonth;
      })
      .addCase(fetchMirrorNodeAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ---- fetchTradingVolume ----
    builder
      .addCase(fetchTradingVolume.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTradingVolume.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (state.overview) {
          state.overview.totalVolume = action.payload.totalVolume.toFixed(2);
          state.overview.totalSales = action.payload.totalSales;
        } else {
          // If overview doesn't exist yet, create a minimal one
          state.overview = {
            totalVolume: action.payload.totalVolume.toFixed(2),
            totalSales: action.payload.totalSales,
            totalMinted: 0,
            totalCollectors: 0,
            totalViews: 0,
            totalLikes: 0,
          };
        }
        state.volumeByMonth = action.payload.volumeByMonth;
      })
      .addCase(fetchTradingVolume.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ---- fetchNFTStats ----
    builder
      .addCase(fetchNFTStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNFTStats.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (state.overview) {
          state.overview.totalMinted = action.payload.totalMinted;
          state.overview.totalCollectors = action.payload.totalCollectors;
        } else {
          state.overview = {
            totalVolume: '0.00',
            totalSales: 0,
            totalMinted: action.payload.totalMinted,
            totalCollectors: action.payload.totalCollectors,
            totalViews: 0,
            totalLikes: 0,
          };
        }
        state.mintsByMonth = action.payload.mintsByMonth;
      })
      .addCase(fetchNFTStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAnalytics } = mirrorNodeAnalyticsSlice.actions;
export default mirrorNodeAnalyticsSlice.reducer;