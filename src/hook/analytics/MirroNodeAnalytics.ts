// /**
//  * Mirror Node Analytics Service
//  * Fetch analytics data directly from Hedera Mirror Node API
//  * No backend required!
//  */

// const MIRROR_NODE_URL = 'https://testnet.mirrornode.hedera.com/api/v1';

// interface TransactionData {
//   transactions: Array<{
//     consensus_timestamp: string;
//     transaction_id: string;
//     result: string;
//     transfers: Array<{
//       account: string;
//       amount: number;
//     }>;
//   }>;
//   links: {
//     next: string | null;
//   };
// }

// interface NFTData {
//   nfts: Array<{
//     token_id: string;
//     serial_number: number;
//     account_id: string;
//     created_timestamp: string;
//     metadata: string;
//   }>;
//   links: {
//     next: string | null;
//   };
// }

// interface TokenData {
//   tokens: Array<{
//     token_id: string;
//     name: string;
//     symbol: string;
//     total_supply: string;
//     created_timestamp: string;
//   }>;
// }

// class MirrorNodeAnalyticsService {
//   /**
//    * Get all transactions for your marketplace contracts
//    * This gives you trading volume and sales count
//    */
//   async getMarketplaceTransactions(contractId: string, limit: number = 1000): Promise<any[]> {
//     try {
//       console.log(`📊 Fetching transactions for contract ${contractId}...`);
      
//       const response = await fetch(
//         `${MIRROR_NODE_URL}/contracts/${contractId}/results?limit=${limit}&order=desc`
//       );
      
//       const data = await response.json();
      
//       console.log(`✅ Found ${data.results?.length || 0} transactions`);
//       return data.results || [];
//     } catch (error) {
//       console.error('❌ Error fetching transactions:', error);
//       return [];
//     }
//   }

//   /**
//    * Get all NFTs minted from your comic tokens
//    * This gives you total minted count
//    */
//   async getAllTokenNFTs(tokenId: string): Promise<NFTData> {
//     try {
//       console.log(`📊 Fetching all NFTs for token ${tokenId}...`);
      
//       const response = await fetch(
//         `${MIRROR_NODE_URL}/tokens/${tokenId}/nfts?limit=1000`
//       );
      
//       const data = await response.json();
      
//       console.log(`✅ Found ${data.nfts?.length || 0} NFTs`);
//       return data;
//     } catch (error) {
//       console.error('❌ Error fetching NFTs:', error);
//       return { nfts: [], links: { next: null } };
//     }
//   }

//   /**
//    * Get token information
//    */
//   async getTokenInfo(tokenId: string): Promise<any> {
//     try {
//       const response = await fetch(`${MIRROR_NODE_URL}/tokens/${tokenId}`);
//       const data = await response.json();
//       return data;
//     } catch (error) {
//       console.error('❌ Error fetching token info:', error);
//       return null;
//     }
//   }

//   /**
//    * Get all transactions in a time range
//    * Use this for volume calculations
//    */
//   async getTransactionsInRange(
//     accountId: string,
//     startTimestamp: string,
//     endTimestamp?: string
//   ): Promise<TransactionData> {
//     try {
//       let url = `${MIRROR_NODE_URL}/transactions?account.id=${accountId}&timestamp=gte:${startTimestamp}&limit=1000`;
      
//       if (endTimestamp) {
//         url += `&timestamp=lte:${endTimestamp}`;
//       }
      
//       const response = await fetch(url);
//       const data = await response.json();
      
//       return data;
//     } catch (error) {
//       console.error('❌ Error fetching transactions in range:', error);
//       return { transactions: [], links: { next: null } };
//     }
//   }

//   /**
//    * Calculate total trading volume from transactions
//    * Sum all HBAR transfers from your marketplace contract
//    */
//   async calculateTradingVolume(contractId: string): Promise<{
//     totalVolume: number;
//     totalSales: number;
//     volumeByMonth: Array<{ month: string; volume: number; count: number }>;
//   }> {
//     try {
//       console.log('💰 Calculating trading volume...');
      
//       const transactions = await this.getMarketplaceTransactions(contractId);
      
//       let totalVolume = 0;
//       const volumeByMonth: { [key: string]: { volume: number; count: number } } = {};
      
//       transactions.forEach((tx: any) => {
//         // Parse the result to get transaction value
//         // For smart contract calls, check the 'amount' field
//         const amount = tx.amount || 0;
//         const timestamp = tx.consensus_timestamp;
        
//         // Convert timestamp to date
//         const date = new Date(parseFloat(timestamp) * 1000);
//         const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
//         // Add to totals
//         totalVolume += amount;
        
//         if (!volumeByMonth[monthKey]) {
//           volumeByMonth[monthKey] = { volume: 0, count: 0 };
//         }
        
//         volumeByMonth[monthKey].volume += amount;
//         volumeByMonth[monthKey].count += 1;
//       });
      
//       // Format monthly data
//       const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//       const currentYear = new Date().getFullYear();
      
//       const monthlyVolume = months.map((month, index) => {
//         const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
//         const data = volumeByMonth[monthKey] || { volume: 0, count: 0 };
        
//         return {
//           month,
//           volume: this.tinybarsToHbar(data.volume),
//           count: data.count
//         };
//       });
      
//       console.log(`✅ Total Volume: ${this.tinybarsToHbar(totalVolume)} HBAR`);
//       console.log(`✅ Total Sales: ${transactions.length}`);
      
//       return {
//         totalVolume: this.tinybarsToHbar(totalVolume),
//         totalSales: transactions.length,
//         volumeByMonth: monthlyVolume
//       };
//     } catch (error) {
//       console.error('❌ Error calculating volume:', error);
//       return {
//         totalVolume: 0,
//         totalSales: 0,
//         volumeByMonth: []
//       };
//     }
//   }

//   /**
//    * Get NFT statistics for all your comic tokens
//    */
//   async getComicNFTStats(comicTokenIds: string[]): Promise<{
//     totalMinted: number;
//     uniqueOwners: Set<string>;
//     mintsByMonth: Array<{ month: string; count: number }>;
//   }> {
//     try {
//       console.log(`📊 Fetching NFT stats for ${comicTokenIds.length} tokens...`);
      
//       let totalMinted = 0;
//       const uniqueOwners = new Set<string>();
//       const mintsByMonth: { [key: string]: number } = {};
      
//       // Fetch NFTs for each token
//       for (const tokenId of comicTokenIds) {
//         const nftData = await this.getAllTokenNFTs(tokenId);
        
//         nftData.nfts.forEach((nft) => {
//           totalMinted++;
//           uniqueOwners.add(nft.account_id);
          
//           // Parse timestamp
//           const timestamp = nft.created_timestamp;
//           const date = new Date(parseFloat(timestamp) * 1000);
//           const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
//           mintsByMonth[monthKey] = (mintsByMonth[monthKey] || 0) + 1;
//         });
//       }
      
//       // Format monthly data
//       const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//       const currentYear = new Date().getFullYear();
      
//       const monthlyMints = months.map((month, index) => {
//         const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
//         return {
//           month,
//           count: mintsByMonth[monthKey] || 0
//         };
//       });
      
//       console.log(`✅ Total Minted: ${totalMinted}`);
//       console.log(`✅ Unique Owners: ${uniqueOwners.size}`);
      
//       return {
//         totalMinted,
//         uniqueOwners,
//         mintsByMonth: monthlyMints
//       };
//     } catch (error) {
//       console.error('❌ Error fetching NFT stats:', error);
//       return {
//         totalMinted: 0,
//         uniqueOwners: new Set(),
//         mintsByMonth: []
//       };
//     }
//   }

//   /**
//    * Get complete analytics overview
//    * This combines all Mirror Node data
//    */
//   async getCompleteAnalytics(config: {
//     marketplaceContractId: string;
//     comicTokenIds: string[];
//   }): Promise<any> {
//     try {
//       console.log('📊 Fetching complete analytics from Mirror Node...');
      
//       // Fetch trading volume
//       const volumeData = await this.calculateTradingVolume(config.marketplaceContractId);
      
//       // Fetch NFT stats
//       const nftStats = await this.getComicNFTStats(config.comicTokenIds);
      
//       return {
//         overview: {
//           totalVolume: volumeData.totalVolume.toFixed(2),
//           totalSales: volumeData.totalSales,
//           totalMinted: nftStats.totalMinted,
//           totalCollectors: nftStats.uniqueOwners.size,
//           // Views and likes would still come from your backend
//           totalViews: 0,
//           totalLikes: 0
//         },
//         volumeByMonth: volumeData.volumeByMonth,
//         mintsByMonth: nftStats.mintsByMonth,
//         userGrowth: nftStats.mintsByMonth // Can use mints as proxy for user growth
//       };
//     } catch (error) {
//       console.error('❌ Error fetching complete analytics:', error);
//       throw error;
//     }
//   }

//   /**
//    * Helper: Convert tinybars to HBAR
//    */
//   private tinybarsToHbar(tinybars: number): number {
//     return tinybars / 100000000;
//   }

//   /**
//    * Helper: Get timestamp for time range
//    */
//   getTimestampForRange(range: '24h' | '7d' | '30d' | 'all'): string {
//     const now = Date.now();
    
//     switch (range) {
//       case '24h':
//         return String((now - 24 * 60 * 60 * 1000) / 1000);
//       case '7d':
//         return String((now - 7 * 24 * 60 * 60 * 1000) / 1000);
//       case '30d':
//         return String((now - 30 * 24 * 60 * 60 * 1000) / 1000);
//       case 'all':
//       default:
//         return '0';
//     }
//   }
// }

// export const mirrorNodeAnalytics = new MirrorNodeAnalyticsService();
// export default mirrorNodeAnalytics;

/**
 * Mirror Node Analytics Service
 * Fetch analytics data directly from Hedera Mirror Node API
 * No backend required!
 */

// const MIRROR_NODE_URL = 'https://testnet.mirrornode.hedera.com/api/v1';

// interface TransactionData {
//   transactions: Array<{
//     consensus_timestamp: string;
//     transaction_id: string;
//     result: string;
//     transfers: Array<{
//       account: string;
//       amount: number;
//     }>;
//   }>;
//   links: {
//     next: string | null;
//   };
// }

// interface NFTData {
//   nfts: Array<{
//     token_id: string;
//     serial_number: number;
//     account_id: string;
//     created_timestamp: string;
//     metadata: string;
//   }>;
//   links: {
//     next: string | null;
//   };
// }

// interface TokenData {
//   tokens: Array<{
//     token_id: string;
//     name: string;
//     symbol: string;
//     total_supply: string;
//     created_timestamp: string;
//   }>;
// }
//  const SALES_SELECTORS = ['0xfd23dc78', '0x02acc94b'];
// class MirrorNodeAnalyticsService {
//   /**
//    * Get all transactions for your marketplace contracts
//    * This gives you trading volume and sales count
//    */

 
// //   async getMarketplaceTransactions(contractId: string, limit: number = 1000): Promise<any[]> {
// //     try {
// //       console.log(`📊 Fetching transactions for contract ${contractId}...`);
      
// //       const response = await fetch(
// //         `${MIRROR_NODE_URL}/contracts/${contractId}/results?limit=${limit}&order=desc`
// //       );
      
// //       if (!response.ok) {
// //         console.warn(`⚠️ Mirror Node returned ${response.status} for transactions`);
// //         return [];
// //       }
      
// //       const data = await response.json();
      
// //       console.log(`✅ Found ${data.results?.length || 0} transactions`);
// //       return data.results || [];
// //     } catch (error) {
// //       console.error('❌ Error fetching transactions:', error);
// //       return [];
// //     }
// //   }


//   /**
//    * Get transactions for a contract, optionally filtering by multiple function selectors.
//    */
//   async getMarketplaceTransactions(
//     contractId: string,
//     selectors?: string[],
//     limit: number = 1000
//   ): Promise<any[]> {
//     try {
//       console.log(`📊 Fetching transactions for contract ${contractId}...`);
//       const response = await fetch(
//         `${MIRROR_NODE_URL}/contracts/${contractId}/results?limit=${limit}&order=desc`
//       );
//       if (!response.ok) {
//         console.warn(`⚠️ Mirror Node returned ${response.status}`);
//         return [];
//       }
//       const data = await response.json();
//       let results = data.results || [];

//       // Filter by any of the provided selectors
//       if (selectors && selectors.length > 0) {
//         results = results.filter((tx: any) => {
//           const params = tx.function_parameters || '';
//           return selectors.some(sel => params.startsWith(sel));
//         });
//       }

//       console.log(`✅ Found ${results.length} sales transactions`);
//       return results;
//     } catch (error) {
//       console.error('❌ Error fetching transactions:', error);
//       return [];
//     }
//   }

//   /**
//    * Calculate trading volume from all sales (purchases + minting).
//    */
//   async calculateTradingVolume(contractId: string): Promise<{
//     totalVolume: number;
//     totalSales: number;
//     volumeByMonth: Array<{ month: string; volume: number; count: number }>;
//   }> {
//     try {
//       console.log('💰 Calculating trading volume from purchaseFromListing and mint...');
//       const transactions = await this.getMarketplaceTransactions(contractId, SALES_SELECTORS);

//       let totalVolume = 0;
//       const volumeByMonth: Record<string, { volume: number; count: number }> = {};

//       // Initialize months
//       const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//       const currentYear = new Date().getFullYear();
//       months.forEach((_, index) => {
//         const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
//         volumeByMonth[monthKey] = { volume: 0, count: 0 };
//       });

//       transactions.forEach((tx: any) => {
//         const amount = tx.amount || 0; // tinybars sent
//         const timestamp = tx.consensus_timestamp;
//         if (timestamp) {
//           const date = new Date(parseFloat(timestamp) * 1000);
//           const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
//           totalVolume += amount;
//           if (!volumeByMonth[monthKey]) volumeByMonth[monthKey] = { volume: 0, count: 0 };
//           volumeByMonth[monthKey].volume += amount;
//           volumeByMonth[monthKey].count += 1;
//         }
//       });

//       const monthlyVolume = months.map((month, index) => {
//         const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
//         const data = volumeByMonth[monthKey] || { volume: 0, count: 0 };
//         return {
//           month,
//           volume: this.tinybarsToHbar(data.volume),
//           count: data.count,
//         };
//       });

//       console.log(`✅ Total Volume: ${this.tinybarsToHbar(totalVolume)} HBAR`);
//       console.log(`✅ Total Sales: ${transactions.length}`);

//       return {
//         totalVolume: this.tinybarsToHbar(totalVolume),
//         totalSales: transactions.length,
//         volumeByMonth: monthlyVolume,
//       };
//     } catch (error) {
//       console.error('❌ Error calculating volume:', error);
//       return { totalVolume: 0, totalSales: 0, volumeByMonth: [] };
//     }
//   }

 
//   /**
//    * Get all NFTs minted from your comic tokens
//    * This gives you total minted count
//    */
//   async getAllTokenNFTs(tokenId: string): Promise<NFTData> {
//     try {
//       console.log(`📊 Fetching all NFTs for token ${tokenId}...`);
      
//       const response = await fetch(
//         `${MIRROR_NODE_URL}/tokens/${tokenId}/nfts?limit=1000`
//       );
      
//       if (!response.ok) {
//         console.warn(`⚠️ Mirror Node returned ${response.status} for token ${tokenId}`);
//         return { nfts: [], links: { next: null } };
//       }
      
//       const data = await response.json();
      
//       console.log(`✅ Found ${data.nfts?.length || 0} NFTs`);
//       return data;
//     } catch (error) {
//       console.error('❌ Error fetching NFTs:', error);
//       return { nfts: [], links: { next: null } };
//     }
//   }

//   /**
//    * Get token information
//    */
//   async getTokenInfo(tokenId: string): Promise<any> {
//     try {
//       const response = await fetch(`${MIRROR_NODE_URL}/tokens/${tokenId}`);
      
//       if (!response.ok) {
//         console.warn(`⚠️ Mirror Node returned ${response.status} for token info ${tokenId}`);
//         return null;
//       }
      
//       const data = await response.json();
//       return data;
//     } catch (error) {
//       console.error('❌ Error fetching token info:', error);
//       return null;
//     }
//   }

//   /**
//    * Get all transactions in a time range
//    * Use this for volume calculations
//    */
//   async getTransactionsInRange(
//     accountId: string,
//     startTimestamp: string,
//     endTimestamp?: string
//   ): Promise<TransactionData> {
//     try {
//       let url = `${MIRROR_NODE_URL}/transactions?account.id=${accountId}&timestamp=gte:${startTimestamp}&limit=1000`;
      
//       if (endTimestamp) {
//         url += `&timestamp=lte:${endTimestamp}`;
//       }
      
//       const response = await fetch(url);
      
//       if (!response.ok) {
//         console.warn(`⚠️ Mirror Node returned ${response.status} for transactions in range`);
//         return { transactions: [], links: { next: null } };
//       }
      
//       const data = await response.json();
//       return data;
//     } catch (error) {
//       console.error('❌ Error fetching transactions in range:', error);
//       return { transactions: [], links: { next: null } };
//     }
//   }

//   /**
//    * Calculate total trading volume from transactions
//    * Sum all HBAR transfers from your marketplace contract
//    */
// //   async calculateTradingVolume(contractId: string): Promise<{
// //     totalVolume: number;
// //     totalSales: number;
// //     volumeByMonth: Array<{ month: string; volume: number; count: number }>;
// //   }> {
// //     try {
// //       console.log('💰 Calculating trading volume...');
      
// //       const transactions = await this.getMarketplaceTransactions(contractId);
      
// //       let totalVolume = 0;
// //       const volumeByMonth: { [key: string]: { volume: number; count: number } } = {};
      
// //       // Initialize all months with zero
// //       const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// //       const currentYear = new Date().getFullYear();
      
// //       months.forEach((month, index) => {
// //         const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
// //         volumeByMonth[monthKey] = { volume: 0, count: 0 };
// //       });
      
// //       // Process transactions
// //       transactions.forEach((tx: any) => {
// //         // For smart contract calls, check the 'amount' field
// //         // You might need to adjust this based on how your contract handles payments
// //         const amount = tx.amount || 0;
// //         const timestamp = tx.consensus_timestamp;
        
// //         if (timestamp) {
// //           // Convert timestamp to date
// //           const date = new Date(parseFloat(timestamp) * 1000);
// //           const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
// //           // Add to totals
// //           totalVolume += amount;
          
// //           if (!volumeByMonth[monthKey]) {
// //             volumeByMonth[monthKey] = { volume: 0, count: 0 };
// //           }
          
// //           volumeByMonth[monthKey].volume += amount;
// //           volumeByMonth[monthKey].count += 1;
// //         }
// //       });
      
// //       // Format monthly data
// //       const monthlyVolume = months.map((month, index) => {
// //         const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
// //         const data = volumeByMonth[monthKey] || { volume: 0, count: 0 };
        
// //         return {
// //           month,
// //           volume: this.tinybarsToHbar(data.volume),
// //           count: data.count
// //         };
// //       });
      
// //       console.log(`✅ Total Volume: ${this.tinybarsToHbar(totalVolume)} HBAR`);
// //       console.log(`✅ Total Sales: ${transactions.length}`);
      
// //       return {
// //         totalVolume: this.tinybarsToHbar(totalVolume),
// //         totalSales: transactions.length,
// //         volumeByMonth: monthlyVolume
// //       };
// //     } catch (error) {
// //       console.error('❌ Error calculating volume:', error);
// //       return {
// //         totalVolume: 0,
// //         totalSales: 0,
// //         volumeByMonth: []
// //       };
// //     }
// //   }

//   /**
//    * Get NFT statistics for all your comic tokens
//    */
//   async getComicNFTStats(comicTokenIds: string[]): Promise<{
//     totalMinted: number;
//     uniqueOwners: Set<string>;
//     mintsByMonth: Array<{ month: string; count: number }>;
//   }> {
//     try {
//       console.log(`📊 Fetching NFT stats for ${comicTokenIds.length} tokens...`);
      
//       let totalMinted = 0;
//       const uniqueOwners = new Set<string>();
//       const mintsByMonth: { [key: string]: number } = {};
      
//       // Initialize all months with zero
//       const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//       const currentYear = new Date().getFullYear();
      
//       months.forEach((month, index) => {
//         const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
//         mintsByMonth[monthKey] = 0;
//       });
      
//       // Fetch NFTs for each token
//       for (const tokenId of comicTokenIds) {
//         const nftData = await this.getAllTokenNFTs(tokenId);
        
//         // SAFETY CHECK: Make sure nftData and nftData.nfts exist
//         if (nftData && nftData.nfts && Array.isArray(nftData.nfts)) {
//           nftData.nfts.forEach((nft) => {
//             totalMinted++;
            
//             if (nft.account_id) {
//               uniqueOwners.add(nft.account_id);
//             }
            
//             // Parse timestamp
//             if (nft.created_timestamp) {
//               const timestamp = nft.created_timestamp;
//               const date = new Date(parseFloat(timestamp) * 1000);
              
//               // Check if date is valid
//               if (!isNaN(date.getTime())) {
//                 const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
//                 mintsByMonth[monthKey] = (mintsByMonth[monthKey] || 0) + 1;
//               }
//             }
//           });
//         } else {
//           console.log(`ℹ️ No NFTs found for token ${tokenId}`);
//         }
//       }
      
//       // Format monthly data
//       const monthlyMints = months.map((month, index) => {
//         const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
//         return {
//           month,
//           count: mintsByMonth[monthKey] || 0
//         };
//       });
      
//       console.log(`✅ Total Minted: ${totalMinted}`);
//       console.log(`✅ Unique Owners: ${uniqueOwners.size}`);
      
//       return {
//         totalMinted,
//         uniqueOwners,
//         mintsByMonth: monthlyMints
//       };
//     } catch (error) {
//       console.error('❌ Error fetching NFT stats:', error);
//       return {
//         totalMinted: 0,
//         uniqueOwners: new Set(),
//         mintsByMonth: []
//       };
//     }
//   }

//   /**
//    * Get complete analytics overview
//    * This combines all Mirror Node data
//    */
//   async getCompleteAnalytics(config: {
//     marketplaceContractId: string;
//     comicTokenIds: string[];
//   }): Promise<any> {
//     try {
//       console.log('📊 Fetching complete analytics from Mirror Node...');
//       console.log('Config:', config);
      
//       // Validate config
//       if (!config.marketplaceContractId) {
//         console.warn('⚠️ No marketplace contract ID provided');
//       }
      
//       if (!config.comicTokenIds || config.comicTokenIds.length === 0) {
//         console.warn('⚠️ No comic token IDs provided');
//       }
      
//       // Fetch trading volume
//       const volumeData = await this.calculateTradingVolume(config.marketplaceContractId);
      
//       // Fetch NFT stats
//       const nftStats = await this.getComicNFTStats(config.comicTokenIds || []);
      
//       return {
//         overview: {
//           totalVolume: volumeData.totalVolume.toFixed(2),
//           totalSales: volumeData.totalSales,
//           totalMinted: nftStats.totalMinted,
//           totalCollectors: nftStats.uniqueOwners.size,
//           totalViews: 0, // These would come from your backend
//           totalLikes: 0
//         },
//         volumeByMonth: volumeData.volumeByMonth,
//         mintsByMonth: nftStats.mintsByMonth,
//         userGrowth: nftStats.mintsByMonth
//       };
//     } catch (error) {
//       console.error('❌ Error fetching complete analytics:', error);
      
//       // Return empty data structure on error
//       return {
//         overview: {
//           totalVolume: '0.00',
//           totalSales: 0,
//           totalMinted: 0,
//           totalCollectors: 0,
//           totalViews: 0,
//           totalLikes: 0
//         },
//         volumeByMonth: [],
//         mintsByMonth: [],
//         userGrowth: []
//       };
//     }
//   }

//   /**
//    * Helper: Convert tinybars to HBAR
//    */
//   private tinybarsToHbar(tinybars: number): number {
//     return tinybars / 100000000;
//   }

//   /**
//    * Helper: Get timestamp for time range
//    */
//   getTimestampForRange(range: '24h' | '7d' | '30d' | 'all'): string {
//     const now = Date.now();
    
//     switch (range) {
//       case '24h':
//         return String((now - 24 * 60 * 60 * 1000) / 1000);
//       case '7d':
//         return String((now - 7 * 24 * 60 * 60 * 1000) / 1000);
//       case '30d':
//         return String((now - 30 * 24 * 60 * 60 * 1000) / 1000);
//       case 'all':
//       default:
//         return '0';
//     }
//   }
// }

// export const mirrorNodeAnalytics = new MirrorNodeAnalyticsService();
// export default mirrorNodeAnalytics;

// /**
//  * Mirror Node Analytics Service
//  * Fetch analytics data directly from Hedera Mirror Node API
//  * No backend required!
//  */

// const MIRROR_NODE_URL = 'https://testnet.mirrornode.hedera.com/api/v1';

// interface TransactionData {
//   transactions: Array<{
//     consensus_timestamp: string;
//     transaction_id: string;
//     result: string;
//     transfers: Array<{
//       account: string;
//       amount: number;
//     }>;
//   }>;
//   links: {
//     next: string | null;
//   };
// }

// interface NFTData {
//   nfts: Array<{
//     token_id: string;
//     serial_number: number;
//     account_id: string;
//     created_timestamp: string;
//     metadata: string;
//   }>;
//   links: {
//     next: string | null;
//   };
// }

// interface TokenData {
//   tokens: Array<{
//     token_id: string;
//     name: string;
//     symbol: string;
//     total_supply: string;
//     created_timestamp: string;
//   }>;
// }

// class MirrorNodeAnalyticsService {
//   /**
//    * Get all transactions for your marketplace contracts
//    * This gives you trading volume and sales count
//    */
//   async getMarketplaceTransactions(contractId: string, limit: number = 1000): Promise<any[]> {
//     try {
//       console.log(`📊 Fetching transactions for contract ${contractId}...`);
      
//       const response = await fetch(
//         `${MIRROR_NODE_URL}/contracts/${contractId}/results?limit=${limit}&order=desc`
//       );
      
//       const data = await response.json();
      
//       console.log(`✅ Found ${data.results?.length || 0} transactions`);
//       return data.results || [];
//     } catch (error) {
//       console.error('❌ Error fetching transactions:', error);
//       return [];
//     }
//   }

//   /**
//    * Get all NFTs minted from your comic tokens
//    * This gives you total minted count
//    */
//   async getAllTokenNFTs(tokenId: string): Promise<NFTData> {
//     try {
//       console.log(`📊 Fetching all NFTs for token ${tokenId}...`);
      
//       const response = await fetch(
//         `${MIRROR_NODE_URL}/tokens/${tokenId}/nfts?limit=1000`
//       );
      
//       const data = await response.json();
      
//       console.log(`✅ Found ${data.nfts?.length || 0} NFTs`);
//       return data;
//     } catch (error) {
//       console.error('❌ Error fetching NFTs:', error);
//       return { nfts: [], links: { next: null } };
//     }
//   }

//   /**
//    * Get token information
//    */
//   async getTokenInfo(tokenId: string): Promise<any> {
//     try {
//       const response = await fetch(`${MIRROR_NODE_URL}/tokens/${tokenId}`);
//       const data = await response.json();
//       return data;
//     } catch (error) {
//       console.error('❌ Error fetching token info:', error);
//       return null;
//     }
//   }

//   /**
//    * Get all transactions in a time range
//    * Use this for volume calculations
//    */
//   async getTransactionsInRange(
//     accountId: string,
//     startTimestamp: string,
//     endTimestamp?: string
//   ): Promise<TransactionData> {
//     try {
//       let url = `${MIRROR_NODE_URL}/transactions?account.id=${accountId}&timestamp=gte:${startTimestamp}&limit=1000`;
      
//       if (endTimestamp) {
//         url += `&timestamp=lte:${endTimestamp}`;
//       }
      
//       const response = await fetch(url);
//       const data = await response.json();
      
//       return data;
//     } catch (error) {
//       console.error('❌ Error fetching transactions in range:', error);
//       return { transactions: [], links: { next: null } };
//     }
//   }

//   /**
//    * Calculate total trading volume from transactions
//    * Sum all HBAR transfers from your marketplace contract
//    */
//   async calculateTradingVolume(contractId: string): Promise<{
//     totalVolume: number;
//     totalSales: number;
//     volumeByMonth: Array<{ month: string; volume: number; count: number }>;
//   }> {
//     try {
//       console.log('💰 Calculating trading volume...');
      
//       const transactions = await this.getMarketplaceTransactions(contractId);
      
//       let totalVolume = 0;
//       const volumeByMonth: { [key: string]: { volume: number; count: number } } = {};
      
//       transactions.forEach((tx: any) => {
//         // Parse the result to get transaction value
//         // For smart contract calls, check the 'amount' field
//         const amount = tx.amount || 0;
//         const timestamp = tx.consensus_timestamp;
        
//         // Convert timestamp to date
//         const date = new Date(parseFloat(timestamp) * 1000);
//         const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
//         // Add to totals
//         totalVolume += amount;
        
//         if (!volumeByMonth[monthKey]) {
//           volumeByMonth[monthKey] = { volume: 0, count: 0 };
//         }
        
//         volumeByMonth[monthKey].volume += amount;
//         volumeByMonth[monthKey].count += 1;
//       });
      
//       // Format monthly data
//       const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//       const currentYear = new Date().getFullYear();
      
//       const monthlyVolume = months.map((month, index) => {
//         const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
//         const data = volumeByMonth[monthKey] || { volume: 0, count: 0 };
        
//         return {
//           month,
//           volume: this.tinybarsToHbar(data.volume),
//           count: data.count
//         };
//       });
      
//       console.log(`✅ Total Volume: ${this.tinybarsToHbar(totalVolume)} HBAR`);
//       console.log(`✅ Total Sales: ${transactions.length}`);
      
//       return {
//         totalVolume: this.tinybarsToHbar(totalVolume),
//         totalSales: transactions.length,
//         volumeByMonth: monthlyVolume
//       };
//     } catch (error) {
//       console.error('❌ Error calculating volume:', error);
//       return {
//         totalVolume: 0,
//         totalSales: 0,
//         volumeByMonth: []
//       };
//     }
//   }

//   /**
//    * Get NFT statistics for all your comic tokens
//    */
//   async getComicNFTStats(comicTokenIds: string[]): Promise<{
//     totalMinted: number;
//     uniqueOwners: Set<string>;
//     mintsByMonth: Array<{ month: string; count: number }>;
//   }> {
//     try {
//       console.log(`📊 Fetching NFT stats for ${comicTokenIds.length} tokens...`);
      
//       let totalMinted = 0;
//       const uniqueOwners = new Set<string>();
//       const mintsByMonth: { [key: string]: number } = {};
      
//       // Fetch NFTs for each token
//       for (const tokenId of comicTokenIds) {
//         const nftData = await this.getAllTokenNFTs(tokenId);
        
//         nftData.nfts.forEach((nft) => {
//           totalMinted++;
//           uniqueOwners.add(nft.account_id);
          
//           // Parse timestamp
//           const timestamp = nft.created_timestamp;
//           const date = new Date(parseFloat(timestamp) * 1000);
//           const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
//           mintsByMonth[monthKey] = (mintsByMonth[monthKey] || 0) + 1;
//         });
//       }
      
//       // Format monthly data
//       const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//       const currentYear = new Date().getFullYear();
      
//       const monthlyMints = months.map((month, index) => {
//         const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
//         return {
//           month,
//           count: mintsByMonth[monthKey] || 0
//         };
//       });
      
//       console.log(`✅ Total Minted: ${totalMinted}`);
//       console.log(`✅ Unique Owners: ${uniqueOwners.size}`);
      
//       return {
//         totalMinted,
//         uniqueOwners,
//         mintsByMonth: monthlyMints
//       };
//     } catch (error) {
//       console.error('❌ Error fetching NFT stats:', error);
//       return {
//         totalMinted: 0,
//         uniqueOwners: new Set(),
//         mintsByMonth: []
//       };
//     }
//   }

//   /**
//    * Get complete analytics overview
//    * This combines all Mirror Node data
//    */
//   async getCompleteAnalytics(config: {
//     marketplaceContractId: string;
//     comicTokenIds: string[];
//   }): Promise<any> {
//     try {
//       console.log('📊 Fetching complete analytics from Mirror Node...');
      
//       // Fetch trading volume
//       const volumeData = await this.calculateTradingVolume(config.marketplaceContractId);
      
//       // Fetch NFT stats
//       const nftStats = await this.getComicNFTStats(config.comicTokenIds);
      
//       return {
//         overview: {
//           totalVolume: volumeData.totalVolume.toFixed(2),
//           totalSales: volumeData.totalSales,
//           totalMinted: nftStats.totalMinted,
//           totalCollectors: nftStats.uniqueOwners.size,
//           // Views and likes would still come from your backend
//           totalViews: 0,
//           totalLikes: 0
//         },
//         volumeByMonth: volumeData.volumeByMonth,
//         mintsByMonth: nftStats.mintsByMonth,
//         userGrowth: nftStats.mintsByMonth // Can use mints as proxy for user growth
//       };
//     } catch (error) {
//       console.error('❌ Error fetching complete analytics:', error);
//       throw error;
//     }
//   }

//   /**
//    * Helper: Convert tinybars to HBAR
//    */
//   private tinybarsToHbar(tinybars: number): number {
//     return tinybars / 100000000;
//   }

//   /**
//    * Helper: Get timestamp for time range
//    */
//   getTimestampForRange(range: '24h' | '7d' | '30d' | 'all'): string {
//     const now = Date.now();
    
//     switch (range) {
//       case '24h':
//         return String((now - 24 * 60 * 60 * 1000) / 1000);
//       case '7d':
//         return String((now - 7 * 24 * 60 * 60 * 1000) / 1000);
//       case '30d':
//         return String((now - 30 * 24 * 60 * 60 * 1000) / 1000);
//       case 'all':
//       default:
//         return '0';
//     }
//   }
// }

// export const mirrorNodeAnalytics = new MirrorNodeAnalyticsService();
// export default mirrorNodeAnalytics;

/**
 * Mirror Node Analytics Service
 * Fetch analytics data directly from Hedera Mirror Node API
 * No backend required!
 */

// const MIRROR_NODE_URL = 'https://testnet.mirrornode.hedera.com/api/v1';

// interface TransactionData {
//   transactions: Array<{
//     consensus_timestamp: string;
//     transaction_id: string;
//     result: string;
//     transfers: Array<{
//       account: string;
//       amount: number;
//     }>;
//   }>;
//   links: {
//     next: string | null;
//   };
// }

// interface NFTData {
//   nfts: Array<{
//     token_id: string;
//     serial_number: number;
//     account_id: string;
//     created_timestamp: string;
//     metadata: string;
//   }>;
//   links: {
//     next: string | null;
//   };
// }

// interface TokenData {
//   tokens: Array<{
//     token_id: string;
//     name: string;
//     symbol: string;
//     total_supply: string;
//     created_timestamp: string;
//   }>;
// }
//  const SALES_SELECTORS = ['fd23dc78', '02acc94b'];
// class MirrorNodeAnalyticsService {
//   /**
//    * Get all transactions for your marketplace contracts
//    * This gives you trading volume and sales count
//    */

 
// //   async getMarketplaceTransactions(contractId: string, limit: number = 1000): Promise<any[]> {
// //     try {
// //       console.log(`📊 Fetching transactions for contract ${contractId}...`);
      
// //       const response = await fetch(
// //         `${MIRROR_NODE_URL}/contracts/${contractId}/results?limit=${limit}&order=desc`
// //       );
      
// //       if (!response.ok) {
// //         console.warn(`⚠️ Mirror Node returned ${response.status} for transactions`);
// //         return [];
// //       }
      
// //       const data = await response.json();
      
// //       console.log(`✅ Found ${data.results?.length || 0} transactions`);
// //       return data.results || [];
// //     } catch (error) {
// //       console.error('❌ Error fetching transactions:', error);
// //       return [];
// //     }
// //   }


//   /**
//    * Get transactions for a contract, optionally filtering by multiple function selectors.
//    */
//   async getMarketplaceTransactions(
//     contractId: string,
//     selectors?: string[],
//     limit: number = 1000
//   ): Promise<any[]> {
//     try {
//       console.log(`📊 Fetching transactions for contract ${contractId}...`);
//       const response = await fetch(
//         `${MIRROR_NODE_URL}/contracts/${contractId}/results?limit=${limit}&order=desc`
//       );
//       if (!response.ok) {
//         console.warn(`⚠️ Mirror Node returned ${response.status}`);
//         return [];
//       }
//       const data = await response.json();
//       let results = data.results || [];

//       // Filter by any of the provided selectors
//       if (selectors && selectors.length > 0) {
//         results = results.filter((tx: any) => {
//           const params = tx.function_parameters || '';
//           return selectors.some(sel => params.startsWith(sel));
//         });
//       }

//       console.log(`✅ Found ${results.length} sales transactions`);
//       return results;
//     } catch (error) {
//       console.error('❌ Error fetching transactions:', error);
//       return [];
//     }
//   }

//   /**
//    * Calculate trading volume from all sales (purchases + minting).
//    */
//   /**
//    * Calculate trading volume from HBAR transfers to the contract account
//    * This is the HBAR that came INTO your marketplace from sales/mints
//    */
//   async calculateTradingVolume(contractId: string): Promise<{
//     totalVolume: number;
//     totalSales: number;
//     volumeByMonth: Array<{ month: string; volume: number; count: number }>;
//   }> {
//     try {
//       console.log(`💰 Fetching account transfers for contract ${contractId}...`);
      
//       // Convert contract ID to account format if needed
//       const accountId = contractId.startsWith('0.0.') 
//         ? contractId 
//         : `0.0.${contractId}`;
      
//       // Fetch all crypto transfers involving this account
//       const response = await fetch(
//         `${MIRROR_NODE_URL}/accounts/${accountId}/transactions?limit=1000&transactiontype=cryptotransfer&order=desc`
//       );
      
//       if (!response.ok) {
//         console.warn(`⚠️ Mirror Node returned ${response.status} for account ${accountId}`);
//         return { totalVolume: 0, totalSales: 0, volumeByMonth: [] };
//       }
      
//       const data = await response.json();
//       const transactions = data.transactions || [];
      
//       console.log(`📊 Found ${transactions.length} crypto transfer transactions`);

//       let totalVolume = 0;  // in tinybars
//       let salesCount = 0;
//       const volumeByMonth: Record<string, { volume: number; count: number }> = {};

//       // Initialize months
//       const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//       const currentYear = new Date().getFullYear();
//       months.forEach((_, index) => {
//         const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
//         volumeByMonth[monthKey] = { volume: 0, count: 0 };
//       });

//       // Process each transaction
//       transactions.forEach((tx: any) => {
//         if (!tx.transfers || !Array.isArray(tx.transfers)) return;
        
//         // Calculate HBAR received by the contract (positive amount to this account)
//         let hbarReceived = 0;
        
//         tx.transfers.forEach((transfer: any) => {
//           // Only count HBAR transfers TO the contract (positive amount)
//           if (transfer.account === accountId && transfer.amount > 0) {
//             hbarReceived += transfer.amount;  // in tinybars
//           }
//         });
        
//         // If contract received HBAR, count it as a sale
//         if (hbarReceived > 0) {
//           totalVolume += hbarReceived;
//           salesCount++;
          
//           // Group by month
//           const timestamp = tx.consensus_timestamp;
//           if (timestamp) {
//             const date = new Date(parseFloat(timestamp) * 1000);
//             const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
//             if (!volumeByMonth[monthKey]) {
//               volumeByMonth[monthKey] = { volume: 0, count: 0 };
//             }
            
//             volumeByMonth[monthKey].volume += hbarReceived;
//             volumeByMonth[monthKey].count += 1;
//           }
//         }
//       });

//       // Convert monthly data to array
//       const monthlyVolume = months.map((month, index) => {
//         const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
//         const data = volumeByMonth[monthKey] || { volume: 0, count: 0 };
//         return {
//           month,
//           volume: this.tinybarsToHbar(data.volume),
//           count: data.count,
//         };
//       });

//       const totalHbar = this.tinybarsToHbar(totalVolume);
      
//       console.log(`✅ Total Volume: ${totalHbar} HBAR from ${salesCount} sales transactions`);
//       console.log(`📊 Monthly breakdown:`, monthlyVolume.filter(m => m.count > 0));

//       return {
//         totalVolume: totalHbar,
//         totalSales: salesCount,
//         volumeByMonth: monthlyVolume,
//       };
//     } catch (error) {
//       console.error('❌ Error calculating trading volume:', error);
//       return { totalVolume: 0, totalSales: 0, volumeByMonth: [] };
//     }
//   }

 
//   /**
//    * Get all NFTs minted from your comic tokens
//    * This gives you total minted count
//    */
//   async getAllTokenNFTs(tokenId: string): Promise<NFTData> {
//     try {
//       console.log(`📊 Fetching all NFTs for token ${tokenId}...`);
      
//       const response = await fetch(
//         `${MIRROR_NODE_URL}/tokens/${tokenId}/nfts?limit=1000`
//       );
      
//       if (!response.ok) {
//         console.warn(`⚠️ Mirror Node returned ${response.status} for token ${tokenId}`);
//         return { nfts: [], links: { next: null } };
//       }
      
//       const data = await response.json();
      
//       console.log(`✅ Found ${data.nfts?.length || 0} NFTs`);
//       return data;
//     } catch (error) {
//       console.error('❌ Error fetching NFTs:', error);
//       return { nfts: [], links: { next: null } };
//     }
//   }

//   /**
//    * Get token information
//    */
//   async getTokenInfo(tokenId: string): Promise<any> {
//     try {
//       const response = await fetch(`${MIRROR_NODE_URL}/tokens/${tokenId}`);
      
//       if (!response.ok) {
//         console.warn(`⚠️ Mirror Node returned ${response.status} for token info ${tokenId}`);
//         return null;
//       }
      
//       const data = await response.json();
//       return data;
//     } catch (error) {
//       console.error('❌ Error fetching token info:', error);
//       return null;
//     }
//   }

//   /**
//    * Get all transactions in a time range
//    * Use this for volume calculations
//    */
//   async getTransactionsInRange(
//     accountId: string,
//     startTimestamp: string,
//     endTimestamp?: string
//   ): Promise<TransactionData> {
//     try {
//       let url = `${MIRROR_NODE_URL}/transactions?account.id=${accountId}&timestamp=gte:${startTimestamp}&limit=1000`;
      
//       if (endTimestamp) {
//         url += `&timestamp=lte:${endTimestamp}`;
//       }
      
//       const response = await fetch(url);
      
//       if (!response.ok) {
//         console.warn(`⚠️ Mirror Node returned ${response.status} for transactions in range`);
//         return { transactions: [], links: { next: null } };
//       }
      
//       const data = await response.json();
//       return data;
//     } catch (error) {
//       console.error('❌ Error fetching transactions in range:', error);
//       return { transactions: [], links: { next: null } };
//     }
//   }

//   /**
//    * Calculate total trading volume from transactions
//    * Sum all HBAR transfers from your marketplace contract
//    */
// //   async calculateTradingVolume(contractId: string): Promise<{
// //     totalVolume: number;
// //     totalSales: number;
// //     volumeByMonth: Array<{ month: string; volume: number; count: number }>;
// //   }> {
// //     try {
// //       console.log('💰 Calculating trading volume...');
      
// //       const transactions = await this.getMarketplaceTransactions(contractId);
      
// //       let totalVolume = 0;
// //       const volumeByMonth: { [key: string]: { volume: number; count: number } } = {};
      
// //       // Initialize all months with zero
// //       const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// //       const currentYear = new Date().getFullYear();
      
// //       months.forEach((month, index) => {
// //         const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
// //         volumeByMonth[monthKey] = { volume: 0, count: 0 };
// //       });
      
// //       // Process transactions
// //       transactions.forEach((tx: any) => {
// //         // For smart contract calls, check the 'amount' field
// //         // You might need to adjust this based on how your contract handles payments
// //         const amount = tx.amount || 0;
// //         const timestamp = tx.consensus_timestamp;
        
// //         if (timestamp) {
// //           // Convert timestamp to date
// //           const date = new Date(parseFloat(timestamp) * 1000);
// //           const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
// //           // Add to totals
// //           totalVolume += amount;
          
// //           if (!volumeByMonth[monthKey]) {
// //             volumeByMonth[monthKey] = { volume: 0, count: 0 };
// //           }
          
// //           volumeByMonth[monthKey].volume += amount;
// //           volumeByMonth[monthKey].count += 1;
// //         }
// //       });
      
// //       // Format monthly data
// //       const monthlyVolume = months.map((month, index) => {
// //         const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
// //         const data = volumeByMonth[monthKey] || { volume: 0, count: 0 };
        
// //         return {
// //           month,
// //           volume: this.tinybarsToHbar(data.volume),
// //           count: data.count
// //         };
// //       });
      
// //       console.log(`✅ Total Volume: ${this.tinybarsToHbar(totalVolume)} HBAR`);
// //       console.log(`✅ Total Sales: ${transactions.length}`);
      
// //       return {
// //         totalVolume: this.tinybarsToHbar(totalVolume),
// //         totalSales: transactions.length,
// //         volumeByMonth: monthlyVolume
// //       };
// //     } catch (error) {
// //       console.error('❌ Error calculating volume:', error);
// //       return {
// //         totalVolume: 0,
// //         totalSales: 0,
// //         volumeByMonth: []
// //       };
// //     }
// //   }

//   /**
//    * Get NFT statistics for all your comic tokens
//    */
//   async getComicNFTStats(comicTokenIds: string[]): Promise<{
//     totalMinted: number;
//     uniqueOwners: Set<string>;
//     mintsByMonth: Array<{ month: string; count: number }>;
//   }> {
//     try {
//       console.log(`📊 Fetching NFT stats for ${comicTokenIds.length} tokens...`);
      
//       let totalMinted = 0;
//       const uniqueOwners = new Set<string>();
//       const mintsByMonth: { [key: string]: number } = {};
      
//       // Initialize all months with zero
//       const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//       const currentYear = new Date().getFullYear();
      
//       months.forEach((month, index) => {
//         const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
//         mintsByMonth[monthKey] = 0;
//       });
      
//       // Fetch NFTs for each token
//       for (const tokenId of comicTokenIds) {
//         const nftData = await this.getAllTokenNFTs(tokenId);
        
//         // SAFETY CHECK: Make sure nftData and nftData.nfts exist
//         if (nftData && nftData.nfts && Array.isArray(nftData.nfts)) {
//           nftData.nfts.forEach((nft) => {
//             totalMinted++;
            
//             if (nft.account_id) {
//               uniqueOwners.add(nft.account_id);
//             }
            
//             // Parse timestamp
//             if (nft.created_timestamp) {
//               const timestamp = nft.created_timestamp;
//               const date = new Date(parseFloat(timestamp) * 1000);
              
//               // Check if date is valid
//               if (!isNaN(date.getTime())) {
//                 const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
//                 mintsByMonth[monthKey] = (mintsByMonth[monthKey] || 0) + 1;
//               }
//             }
//           });
//         } else {
//           console.log(`ℹ️ No NFTs found for token ${tokenId}`);
//         }
//       }
      
//       // Format monthly data
//       const monthlyMints = months.map((month, index) => {
//         const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
//         return {
//           month,
//           count: mintsByMonth[monthKey] || 0
//         };
//       });
      
//       console.log(`✅ Total Minted: ${totalMinted}`);
//       console.log(`✅ Unique Owners: ${uniqueOwners.size}`);
      
//       return {
//         totalMinted,
//         uniqueOwners,
//         mintsByMonth: monthlyMints
//       };
//     } catch (error) {
//       console.error('❌ Error fetching NFT stats:', error);
//       return {
//         totalMinted: 0,
//         uniqueOwners: new Set(),
//         mintsByMonth: []
//       };
//     }
//   }

//   /**
//    * Get complete analytics overview
//    * This combines all Mirror Node data
//    */
//   async getCompleteAnalytics(config: {
//     marketplaceContractId: string;
//     comicTokenIds: string[];
//   }): Promise<any> {
//     try {
//       console.log('📊 Fetching complete analytics from Mirror Node...');
//       console.log('Config:', config);
      
//       // Validate config
//       if (!config.marketplaceContractId) {
//         console.warn('⚠️ No marketplace contract ID provided');
//       }
      
//       if (!config.comicTokenIds || config.comicTokenIds.length === 0) {
//         console.warn('⚠️ No comic token IDs provided');
//       }
      
//       // Fetch trading volume
//       const volumeData = await this.calculateTradingVolume(config.marketplaceContractId);
      
//       // Fetch NFT stats
//       const nftStats = await this.getComicNFTStats(config.comicTokenIds || []);
      
//       return {
//         overview: {
//           totalVolume: volumeData.totalVolume.toFixed(2),
//           totalSales: volumeData.totalSales,
//           totalMinted: nftStats.totalMinted,
//           totalCollectors: nftStats.uniqueOwners.size,
//           totalViews: 0, // These would come from your backend
//           totalLikes: 0
//         },
//         volumeByMonth: volumeData.volumeByMonth,
//         mintsByMonth: nftStats.mintsByMonth,
//         userGrowth: nftStats.mintsByMonth
//       };
//     } catch (error) {
//       console.error('❌ Error fetching complete analytics:', error);
      
//       // Return empty data structure on error
//       return {
//         overview: {
//           totalVolume: '0.00',
//           totalSales: 0,
//           totalMinted: 0,
//           totalCollectors: 0,
//           totalViews: 0,
//           totalLikes: 0
//         },
//         volumeByMonth: [],
//         mintsByMonth: [],
//         userGrowth: []
//       };
//     }
//   }

//   /**
//    * Helper: Convert tinybars to HBAR
//    */
//   private tinybarsToHbar(tinybars: number): number {
//     return tinybars / 100000000;
//   }

//   /**
//    * Helper: Get timestamp for time range
//    */
//   getTimestampForRange(range: '24h' | '7d' | '30d' | 'all'): string {
//     const now = Date.now();
    
//     switch (range) {
//       case '24h':
//         return String((now - 24 * 60 * 60 * 1000) / 1000);
//       case '7d':
//         return String((now - 7 * 24 * 60 * 60 * 1000) / 1000);
//       case '30d':
//         return String((now - 30 * 24 * 60 * 60 * 1000) / 1000);
//       case 'all':
//       default:
//         return '0';
//     }
//   }
// }

// export const mirrorNodeAnalytics = new MirrorNodeAnalyticsService();
// export default mirrorNodeAnalytics;

/**
 * Mirror Node Analytics Service
 * Fetches on-chain data directly from Hedera Mirror Node API
 * Tracks both purchaseFromListing and mint transactions
 */

const MIRROR_NODE_URL = 'https://testnet.mirrornode.hedera.com/api/v1';

// Function selectors for payable functions in QuivaComicSales contract
// purchaseFromListing(uint256 listingId, uint256 quantity) -> fd23dc78
// mint(uint256 campaignId, uint256 phaseId, uint256 quantity) -> 1249c58b
const SALES_SELECTORS = ['0xfd23dc78', '0x02acc94b', '0x7bb58af1'];

interface TransactionData {
  transactions: Array<{
    consensus_timestamp: string;
    transaction_id: string;
    result: string;
    transfers: Array<{
      account: string;
      amount: number;
    }>;
  }>;
  links: {
    next: string | null;
  };
}

interface NFTData {
  nfts: Array<{
    token_id: string;
    serial_number: number;
    account_id: string;
    created_timestamp: string;
    metadata: string;
  }>;
  links: {
    next: string | null;
  };
}

interface ContractResult {
  amount: number;
  call_result: string;
  contract_id: string;
  created_timestamp: string;
  consensus_timestamp: string;
  error_message: string | null;
  from: string;
  function_parameters: string;
  gas_consumed: number;
  gas_limit: number;
  hash: string;
}

class MirrorNodeAnalyticsService {
  /**
   * Get contract results (transactions) for a contract
   * Optionally filter by function selectors to isolate sales/mint transactions
   */
  async getContractResults(
    contractId: string,
    selectors?: string[],
    limit: number = 1000
  ): Promise<ContractResult[]> {
    try {
      console.log(`📊 Fetching contract results for ${contractId}...`);
      
      const response = await fetch(
        `${MIRROR_NODE_URL}/contracts/${contractId}/results?limit=${limit}&order=desc`
      );

      if (!response.ok) {
        console.warn(`⚠️ Mirror Node returned ${response.status}`);
        return [];
      }

      const data = await response.json();
      let results = data.results || [];

      // Filter by function selectors if provided
      if (selectors && selectors.length > 0) {
        results = results.filter((tx: ContractResult) => {
          const params = tx.function_parameters || '';
          return selectors.some(sel => params.toLowerCase().startsWith(sel.toLowerCase()));
        });
      }

      console.log(`✅ Found ${results.length} matching transactions`);
      return results;
    } catch (error) {
      console.error('❌ Error fetching contract results:', error);
      return [];
    }
  }

  /**
   * Get all NFTs minted for a specific token
   */
  async getTokenNFTs(tokenId: string): Promise<NFTData> {
    try {
      console.log(`📊 Fetching NFTs for token ${tokenId}...`);
      
      const response = await fetch(
        `${MIRROR_NODE_URL}/tokens/${tokenId}/nfts?limit=1000`
      );

      if (!response.ok) {
        console.warn(`⚠️ Mirror Node returned ${response.status} for token ${tokenId}`);
        return { nfts: [], links: { next: null } };
      }

      const data = await response.json();
      
      console.log(`✅ Found ${data.nfts?.length || 0} NFTs`);
      return data;
    } catch (error) {
      console.error('❌ Error fetching NFTs:', error);
      return { nfts: [], links: { next: null } };
    }
  }

  /**
   * Get token information
   */
  async getTokenInfo(tokenId: string): Promise<any> {
    try {
      const response = await fetch(`${MIRROR_NODE_URL}/tokens/${tokenId}`);

      if (!response.ok) {
        console.warn(`⚠️ Mirror Node returned ${response.status} for token info ${tokenId}`);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error fetching token info:', error);
      return null;
    }
  }

  /**
   * Calculate trading volume from sales transactions (purchaseFromListing + mint)
   * Returns total volume, total sales count, and monthly breakdown
   */
  // async calculateTradingVolume(contractId: string): Promise<{
  //   totalVolume: number;
  //   totalSales: number;
  //   volumeByMonth: Array<{ month: string; volume: number; count: number }>;
  // }> {
  //   try {
  //     console.log('💰 Calculating trading volume from on-chain transactions...');
      
  //     // Fetch only sales-related transactions
  //     const transactions = await this.getContractResults(contractId, SALES_SELECTORS);

  //     let totalVolume = 0;
  //     const volumeByMonth: Record<string, { volume: number; count: number }> = {};

  //     // Initialize all months with zero
  //     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  //     const currentYear = new Date().getFullYear();
      
  //     months.forEach((_, index) => {
  //       const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
  //       volumeByMonth[monthKey] = { volume: 0, count: 0 };
  //     });

  //     // Process each transaction
  //     transactions.forEach((tx: ContractResult) => {
  //       const amount = tx.amount || 0; // Amount in tinybars
  //       const timestamp = tx.created_timestamp;

  //       if (timestamp) {
  //         const date = new Date(parseFloat(timestamp) * 1000);
          
  //         // Skip invalid dates
  //         if (isNaN(date.getTime())) return;

  //         const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
  //         totalVolume += amount;
          
  //         if (!volumeByMonth[monthKey]) {
  //           volumeByMonth[monthKey] = { volume: 0, count: 0 };
  //         }
          
  //         volumeByMonth[monthKey].volume += amount;
  //         volumeByMonth[monthKey].count += 1;
  //       }
  //     });

  //     // Format monthly data
  //     const monthlyVolume = months.map((month, index) => {
  //       const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
  //       const data = volumeByMonth[monthKey] || { volume: 0, count: 0 };
        
  //       return {
  //         month,
  //         volume: this.tinybarsToHbar(data.volume),
  //         count: data.count
  //       };
  //     });

  //     console.log(`✅ Total Volume: ${this.tinybarsToHbar(totalVolume)} HBAR`);
  //     console.log(`✅ Total Sales: ${transactions.length}`);

  //     return {
  //       totalVolume: this.tinybarsToHbar(totalVolume),
  //       totalSales: transactions.length,
  //       volumeByMonth: monthlyVolume
  //     };
  //   } catch (error) {
  //     console.error('❌ Error calculating volume:', error);
  //     return {
  //       totalVolume: 0,
  //       totalSales: 0,
  //       volumeByMonth: []
  //     };
  //   }
  // }

// In MirroNodeAnalytics.ts
; // purchaseFromListing and mint

// async calculateTradingVolume(contractId: string): Promise<{
//   totalVolume: number;
//   totalSales: number;
//   volumeByMonth: Array<{ month: string; volume: number; count: number }>;
// }> {
//   try {
//     console.log('💰 Calculating trading volume from on-chain transactions...');
    
//     // Fetch only sales-related transactions (both purchaseFromListing AND mint)
//     const transactions = await this.getContractResults(contractId, SALES_SELECTORS);
    
//     let totalVolume = 0;
//     const volumeByMonth: Record<string, { volume: number; count: number }> = {};
    
//     // Initialize months
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//     const currentYear = new Date().getFullYear();
    
//     months.forEach((_, index) => {
//       const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
//       volumeByMonth[monthKey] = { volume: 0, count: 0 };
//     });
    
//     // Process each transaction
//     transactions.forEach((tx: ContractResult) => {
//       const amount = tx.amount || 0; // Amount in tinybars
//       // const timestamp = tx.created_timestamp;
//       const timestamp = tx.consensus_timestamp;
      
//       if (timestamp) {
//         // const date = new Date(parseFloat(timestamp) * 1000);
//           const date = new Date(parseFloat(timestamp) * 1000);
//         if (!isNaN(date.getTime())) {
//           const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
//           totalVolume += amount;
          
//           if (!volumeByMonth[monthKey]) {
//             volumeByMonth[monthKey] = { volume: 0, count: 0 };
//           }
          
//           volumeByMonth[monthKey].volume += amount;
//           volumeByMonth[monthKey].count += 1;
//         }
//       }
//     });
    
//     // Format monthly data
//     const monthlyVolume = months.map((month, index) => {
//       const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
//       const data = volumeByMonth[monthKey] || { volume: 0, count: 0 };
      
//       return {
//         month,
//         volume: this.tinybarsToHbar(data.volume),
//         count: data.count
//       };
//     });
    
//     console.log(`✅ Total Volume: ${this.tinybarsToHbar(totalVolume)} HBAR`);
//     console.log(`✅ Total Sales: ${transactions.length}`);
    
//     return {
//       totalVolume: this.tinybarsToHbar(totalVolume),
//       totalSales: transactions.length,
//       volumeByMonth: monthlyVolume
//     };
//   } catch (error) {
//     console.error('❌ Error calculating volume:', error);
//     return {
//       totalVolume: 0,
//       totalSales: 0,
//       volumeByMonth: []
//     };
//   }
// }


async calculateTradingVolume(contractId: string): Promise<{
  totalVolume: number;
  totalSales: number;
  volumeByMonth: Array<{ month: string; volume: number; count: number }>;
}> {
  try {
    console.log('💰 Calculating trading volume from on-chain transactions...');
    console.log('Contract ID:', contractId);
    
    const transactions = await this.getContractResults(contractId, SALES_SELECTORS);
    
    console.log(`📊 Found ${transactions.length} total transactions`);
    
    // Log all transactions with their amounts
    let totalTinybars = 0;
    transactions.forEach((tx, index) => {
      console.log(`Tx ${index + 1}: amount=${tx.amount} tinybars (${tx.amount/100000000} HBAR), selector=${tx.function_parameters?.substring(0, 10)}`);
      totalTinybars += tx.amount || 0;
    });
    
    console.log(`💰 Sum of all amounts (tinybars): ${totalTinybars}`);
    console.log(`💰 Sum in HBAR: ${totalTinybars / 100000000}`);
    
    let totalVolume = 0;
    const volumeByMonth: Record<string, { volume: number; count: number }> = {};
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    months.forEach((_, index) => {
      const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
      volumeByMonth[monthKey] = { volume: 0, count: 0 };
    });
    
    transactions.forEach((tx: ContractResult) => {
      const amount = tx.amount || 0;
      const timestamp = tx.consensus_timestamp;
      
      if (timestamp) {
        const date = new Date(parseFloat(timestamp) * 1000);
        if (!isNaN(date.getTime())) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          totalVolume += amount;
          
          if (!volumeByMonth[monthKey]) {
            volumeByMonth[monthKey] = { volume: 0, count: 0 };
          }
          
          volumeByMonth[monthKey].volume += amount;
          volumeByMonth[monthKey].count += 1;
        }
      }
    });
    
    const monthlyVolume = months.map((month, index) => {
      const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
      const data = volumeByMonth[monthKey] || { volume: 0, count: 0 };
      
      return {
        month,
        volume: this.tinybarsToHbar(data.volume),
        count: data.count
      };
    });
    
    const result = {
      totalVolume: totalTinybars / 100000000, // Convert to HBAR
      totalSales: transactions.length,
      volumeByMonth: monthlyVolume
    };
    
    console.log('✅ FINAL VOLUME DATA FROM SERVICE:', result);
    console.log(`   totalVolume: ${result.totalVolume} HBAR`);
    console.log(`   totalSales: ${result.totalSales}`);
    
    return result;
  } catch (error) {
    console.error('❌ Error calculating volume:', error);
    return {
      totalVolume: 0,
      totalSales: 0,
      volumeByMonth: []
    };
  }
}
  /**
   * Get comprehensive NFT statistics for multiple comic tokens
   * Returns total minted, unique owners, and monthly mint breakdown
   */
  async getComicNFTStats(comicTokenIds: string[]): Promise<{
    totalMinted: number;
    uniqueOwners: Set<string>;
    mintsByMonth: Array<{ month: string; count: number }>;
  }> {
    try {
      console.log(`📊 Fetching NFT stats for ${comicTokenIds.length} tokens...`);

      let totalMinted = 0;
      const uniqueOwners = new Set<string>();
      const mintsByMonth: Record<string, number> = {};

      // Initialize all months with zero
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();

      months.forEach((_, index) => {
        const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
        mintsByMonth[monthKey] = 0;
      });

      // Fetch NFTs for each token
      for (const tokenId of comicTokenIds) {
        const nftData = await this.getTokenNFTs(tokenId);

        if (nftData && nftData.nfts && Array.isArray(nftData.nfts)) {
          nftData.nfts.forEach((nft) => {
            totalMinted++;

            if (nft.account_id) {
              uniqueOwners.add(nft.account_id);
            }

            if (nft.created_timestamp) {
              const timestamp = nft.created_timestamp;
              const date = new Date(parseFloat(timestamp) * 1000);

              if (!isNaN(date.getTime())) {
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                mintsByMonth[monthKey] = (mintsByMonth[monthKey] || 0) + 1;
              }
            }
          });
        } else {
          console.log(`ℹ️ No NFTs found for token ${tokenId}`);
        }
      }

      // Format monthly data
      const monthlyMints = months.map((month, index) => {
        const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
        return {
          month,
          count: mintsByMonth[monthKey] || 0
        };
      });

      console.log(`✅ Total Minted: ${totalMinted}`);
      console.log(`✅ Unique Owners: ${uniqueOwners.size}`);

      return {
        totalMinted,
        uniqueOwners,
        mintsByMonth: monthlyMints
      };
    } catch (error) {
      console.error('❌ Error fetching NFT stats:', error);
      return {
        totalMinted: 0,
        uniqueOwners: new Set(),
        mintsByMonth: []
      };
    }
  }

  /**
   * Get complete analytics overview combining volume and NFT stats
   */
  async getCompleteAnalytics(config: {
    salesContractId: string;
    comicTokenIds: string[];
  }): Promise<any> {
    try {
      console.log('📊 Fetching complete analytics from Mirror Node...');
      console.log('Config:', config);

      // Validate config
      if (!config.salesContractId) {
        console.warn('⚠️ No sales contract ID provided');
      }

      // Fetch trading volume
      const volumeData = await this.calculateTradingVolume(config.salesContractId);

      // Fetch NFT stats
      const nftStats = await this.getComicNFTStats(config.comicTokenIds || []);

      return {
        overview: {
          totalVolume: volumeData.totalVolume.toFixed(2),
          totalSales: volumeData.totalSales,
          totalMinted: nftStats.totalMinted,
          totalCollectors: nftStats.uniqueOwners.size,
          totalViews: 0, // These come from backend/Redux
          totalLikes: 0
        },
        volumeByMonth: volumeData.volumeByMonth,
        mintsByMonth: nftStats.mintsByMonth,
        userGrowth: nftStats.mintsByMonth
      };
    } catch (error) {
      console.error('❌ Error fetching complete analytics:', error);

      // Return empty data structure on error
      return {
        overview: {
          totalVolume: '0.00',
          totalSales: 0,
          totalMinted: 0,
          totalCollectors: 0,
          totalViews: 0,
          totalLikes: 0
        },
        volumeByMonth: [],
        mintsByMonth: [],
        userGrowth: []
      };
    }
  }

  /**
   * Helper: Convert tinybars to HBAR
   */
  private tinybarsToHbar(tinybars: number): number {
    return tinybars / 100000000;
  }

  /**
   * Helper: Get timestamp for time range filters
   */
  getTimestampForRange(range: '24h' | '7d' | '30d' | 'all'): string {
    const now = Date.now();

    switch (range) {
      case '24h':
        return String((now - 24 * 60 * 60 * 1000) / 1000);
      case '7d':
        return String((now - 7 * 24 * 60 * 60 * 1000) / 1000);
      case '30d':
        return String((now - 30 * 24 * 60 * 60 * 1000) / 1000);
      case 'all':
      default:
        return '0';
    }
  }
}

export const mirrorNodeAnalytics = new MirrorNodeAnalyticsService();
export default mirrorNodeAnalytics;