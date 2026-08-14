// 'use client';

// /**
//  * Example Component: Comic Marketplace Integration
//  * 
//  * This demonstrates how to properly integrate the wagmi comic contract hooks
//  * with wallet detection and proper error handling across both EVM and Hedera wallets.
//  */

// import { useState, useEffect } from 'react';
// import { useWalletDetector, WalletType } from '@/hook/useWalletDetector';
// import { useWagmiComicContract } from '@/hook/useWagmiComicContract';
// import { useWalletAwareTransaction } from '@/hook/useWalletAwareTransaction';

// interface ComicListing {
//   id: string;
//   title: string;
//   creator: string;
//   price: bigint;
//   tokenAddress: string;
//   serialNumber: bigint;
//   listingId: bigint;
// }

// /**
//  * Example 1: Comic Marketplace Card Component
//  * Shows how to handle purchases with proper wallet detection
//  */
// export function ComicMarketplaceCard({ listing }: { listing: ComicListing }) {
//   const wallet = useWalletDetector();
//   const txExecutor = useWalletAwareTransaction();
//   const { buyNFTFromMarketplace, isProcessing } = useWagmiComicContract();
//   const [isPurchasing, setIsPurchasing] = useState(false);
//   const [purchaseStatus, setPurchaseStatus] = useState<{
//     type: 'success' | 'error' | null;
//     message: string;
//   }>({ type: null, message: '' });

//   // Prevent purchases without wallet
//   if (!wallet.isConnected) {
//     return (
//       <div style={cardStyle}>
//         <h3>{listing.title}</h3>
//         <p>by {listing.creator}</p>
//         <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
//           {Number(listing.price) / 100_000_000} HBAR
//         </p>
//         <button style={disabledButtonStyle} disabled>
//           Connect Wallet to Buy
//         </button>
//       </div>
//     );
//   }

//   const handlePurchase = async () => {
//     setIsPurchasing(true);
//     setPurchaseStatus({ type: null, message: '' });

//     const result = await txExecutor.execute(
//       async (walletType) => {
//         // Both EVM and Hedera are handled inside useWagmiComicContract
//         return await buyNFTFromMarketplace(listing.listingId, listing.price);
//       },
//       {
//         name: `Purchase ${listing.title}`,
//         description: `Buy comic for ${Number(listing.price) / 100_000_000} HBAR`,
//         onSign: () => {
//           console.log('🔐 Waiting for signature on', wallet.type);
//         },
//         onConfirm: (hash) => {
//           setPurchaseStatus({
//             type: 'success',
//             message: `✅ Purchase successful! Transaction: ${hash.slice(0, 10)}...`
//           });
//           console.log('Transaction confirmed:', hash);
//         },
//         onError: (err) => {
//           setPurchaseStatus({
//             type: 'error',
//             message: `❌ Purchase failed: ${err.message}`
//           });
//         }
//       }
//     );

//     setIsPurchasing(false);
//   };

//   return (
//     <div style={cardStyle}>
//       <div style={badgeStyle}>
//         {wallet.type === WalletType.ETHEREUM ? '🔵 EVM' : '🟢 Hedera'}
//       </div>

//       <h3>{listing.title}</h3>
//       <p style={{ color: '#666' }}>by {listing.creator}</p>

//       <div style={priceStyle}>
//         {Number(listing.price) / 100_000_000} HBAR
//       </div>

//       {purchaseStatus.type && (
//         <div style={{
//           ...statusStyle,
//           borderColor: purchaseStatus.type === 'success' ? '#0d6a0d' : '#a94442',
//           backgroundColor: purchaseStatus.type === 'success' ? '#dff0d8' : '#f2dede',
//           color: purchaseStatus.type === 'success' ? '#0d6a0d' : '#a94442'
//         }}>
//           {purchaseStatus.message}
//         </div>
//       )}

//       <button
//         onClick={handlePurchase}
//         disabled={isPurchasing || isProcessing}
//         style={{
//           ...buttonStyle,
//           opacity: isPurchasing || isProcessing ? 0.6 : 1,
//           cursor: isPurchasing || isProcessing ? 'not-allowed' : 'pointer'
//         }}
//       >
//         {isPurchasing ? 'Processing...' : 'Buy Now'}
//       </button>
//     </div>
//   );
// }

// /**
//  * Example 2: Create Comic Collection Form
//  * Shows form handling with wallet-aware validation
//  */
// export function CreateComicCollectionForm() {
//   const wallet = useWalletDetector();
//   const { createComicCollection, isProcessing, error } = useWagmiComicContract();
//   const [formData, setFormData] = useState({
//     episodeId: '',
//     name: '',
//     symbol: '',
//     maxSupply: 1000,
//   });
//   const [creationStatus, setCreationStatus] = useState<{
//     type: 'success' | 'error' | null;
//     message: string;
//   }>({ type: null, message: '' });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setCreationStatus({ type: null, message: '' });

//     // Validate wallet
//     if (!wallet.isConnected) {
//       setCreationStatus({
//         type: 'error',
//         message: 'Please connect a wallet first'
//       });
//       return;
//     }

//     // Validate form
//     if (!formData.episodeId || !formData.name || !formData.symbol) {
//       setCreationStatus({
//         type: 'error',
//         message: 'Please fill in all fields'
//       });
//       return;
//     }

//     try {
//       const hash = await createComicCollection(
//         formData.episodeId,
//         formData.name,
//         formData.symbol,
//         `${formData.name} NFT Collection`,
//         BigInt(formData.maxSupply),
//         BigInt(7776000), // 90 days
//         {
//           onSuccess: (txHash) => {
//             setCreationStatus({
//               type: 'success',
//               message: `✅ Collection created! Hash: ${txHash?.slice(0, 10)}...`
//             });
//             // Reset form
//             setFormData({
//               episodeId: '',
//               name: '',
//               symbol: '',
//               maxSupply: 1000,
//             });
//             console.log('Collection created:', txHash);
//           },
//           onError: (err) => {
//             setCreationStatus({
//               type: 'error',
//               message: `❌ Failed: ${err.message}`
//             });
//           }
//         }
//       );
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Unknown error';
//       setCreationStatus({
//         type: 'error',
//         message: `❌ Error: ${message}`
//       });
//     }
//   };

//   if (!wallet.isConnected) {
//     return (
//       <div style={formContainerStyle}>
//         <h2>Create Comic Collection</h2>
//         <p>Please connect a wallet to create a collection</p>
//         <p>Wallet Type: {wallet.type}</p>
//       </div>
//     );
//   }

//   return (
//     <div style={formContainerStyle}>
//       <h2>Create Comic Collection</h2>
//       <p>Connected: {wallet.type} Wallet</p>

//       <form onSubmit={handleSubmit}>
//         <div style={formGroupStyle}>
//           <label>Episode ID</label>
//           <input
//             type="text"
//             value={formData.episodeId}
//             onChange={(e) => setFormData({ ...formData, episodeId: e.target.value })}
//             placeholder="e.g., episode-001"
//             disabled={isProcessing}
//           />
//         </div>

//         <div style={formGroupStyle}>
//           <label>Comic Name</label>
//           <input
//             type="text"
//             value={formData.name}
//             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//             placeholder="Amazing Spider Comic"
//             disabled={isProcessing}
//           />
//         </div>

//         <div style={formGroupStyle}>
//           <label>Symbol</label>
//           <input
//             type="text"
//             value={formData.symbol}
//             onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
//             placeholder="SPIDER"
//             maxLength={4}
//             disabled={isProcessing}
//           />
//         </div>

//         <div style={formGroupStyle}>
//           <label>Max Supply</label>
//           <input
//             type="number"
//             value={formData.maxSupply}
//             onChange={(e) => setFormData({ ...formData, maxSupply: parseInt(e.target.value) })}
//             disabled={isProcessing}
//           />
//         </div>

//         {creationStatus.type && (
//           <div style={{
//             ...statusStyle,
//             borderColor: creationStatus.type === 'success' ? '#0d6a0d' : '#a94442',
//             backgroundColor: creationStatus.type === 'success' ? '#dff0d8' : '#f2dede',
//             color: creationStatus.type === 'success' ? '#0d6a0d' : '#a94442',
//             marginBottom: '15px'
//           }}>
//             {creationStatus.message}
//           </div>
//         )}

//         {error && (
//           <div style={{
//             ...statusStyle,
//             borderColor: '#a94442',
//             backgroundColor: '#f2dede',
//             color: '#a94442',
//             marginBottom: '15px'
//           }}>
//             {error.message}
//           </div>
//         )}

//         <button
//           type="submit"
//           disabled={isProcessing}
//           style={{
//             ...buttonStyle,
//             opacity: isProcessing ? 0.6 : 1,
//             cursor: isProcessing ? 'not-allowed' : 'pointer'
//           }}
//         >
//           {isProcessing ? 'Creating...' : 'Create Collection'}
//         </button>
//       </form>
//     </div>
//   );
// }

// /**
//  * Example 3: Wallet Status Dashboard
//  * Shows current wallet state and available operations
//  */
// export function WalletStatusDashboard() {
//   const wallet = useWalletDetector();
//   const contract = useWagmiComicContract();

//   return (
//     <div style={dashboardStyle}>
//       <h2>Wallet Dashboard</h2>

//       <div style={statusCardStyle}>
//         <h3>Connection Status</h3>
//         <p>
//           <strong>Type:</strong> {wallet.type || 'Not Connected'}
//         </p>
//         <p>
//           <strong>Address:</strong> {wallet.address ? `${wallet.address.slice(0, 10)}...` : 'N/A'}
//         </p>
//         <p>
//           <strong>Connected:</strong> {wallet.isConnected ? '✅ Yes' : '❌ No'}
//         </p>
//         {wallet.connector && <p><strong>Connector:</strong> {wallet.connector}</p>}
//       </div>

//       <div style={statusCardStyle}>
//         <h3>Contract Interaction</h3>
//         <p>
//           <strong>Processing:</strong> {contract.isProcessing ? '🔄 Yes' : '✅ No'}
//         </p>
//         <p>
//           <strong>Last Hash:</strong> {contract.lastHash ? `${contract.lastHash.slice(0, 10)}...` : 'None'}
//         </p>
//         {contract.error && (
//           <p style={{ color: '#a94442' }}>
//             <strong>Error:</strong> {contract.error.message}
//           </p>
//         )}
//       </div>

//       <div style={statusCardStyle}>
//         <h3>Supported Operations</h3>
//         {wallet.isConnected ? (
//           <ul>
//             <li>✅ Create Comic Collections</li>
//             <li>✅ Grant/Revoke Reading Access</li>
//             <li>✅ List NFTs for Resale</li>
//             <li>✅ Buy from Marketplace</li>
//             <li>✅ Cancel Listings</li>
//             <li>✅ Create Direct Listings</li>
//             <li>✅ Create Campaigns</li>
//           </ul>
//         ) : (
//           <p>Connect a wallet to see available operations</p>
//         )}
//       </div>
//     </div>
//   );
// }

// // ============================================
// // STYLES
// // ============================================

// const cardStyle: React.CSSProperties = {
//   border: '1px solid #ddd',
//   borderRadius: '8px',
//   padding: '15px',
//   maxWidth: '300px',
//   boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//   position: 'relative'
// };

// const badgeStyle: React.CSSProperties = {
//   position: 'absolute',
//   top: '10px',
//   right: '10px',
//   fontSize: '12px',
//   padding: '4px 8px',
//   backgroundColor: '#f0f0f0',
//   borderRadius: '4px'
// };

// const priceStyle: React.CSSProperties = {
//   fontSize: '24px',
//   fontWeight: 'bold',
//   color: '#2196F3',
//   margin: '15px 0'
// };

// const buttonStyle: React.CSSProperties = {
//   width: '100%',
//   padding: '10px',
//   backgroundColor: '#2196F3',
//   color: 'white',
//   border: 'none',
//   borderRadius: '4px',
//   fontSize: '16px',
//   fontWeight: 'bold',
//   cursor: 'pointer'
// };

// const disabledButtonStyle: React.CSSProperties = {
//   ...buttonStyle,
//   backgroundColor: '#ccc',
//   cursor: 'not-allowed'
// };

// const statusStyle: React.CSSProperties = {
//   padding: '10px',
//   borderRadius: '4px',
//   border: '1px solid',
//   marginBottom: '10px'
// };

// const formContainerStyle: React.CSSProperties = {
//   maxWidth: '500px',
//   margin: '20px auto',
//   padding: '20px',
//   border: '1px solid #ddd',
//   borderRadius: '8px',
//   backgroundColor: '#f9f9f9'
// };

// const formGroupStyle: React.CSSProperties = {
//   marginBottom: '15px'
// };

// const dashboardStyle: React.CSSProperties = {
//   padding: '20px',
//   backgroundColor: '#f5f5f5',
//   borderRadius: '8px'
// };

// const statusCardStyle: React.CSSProperties = {
//   backgroundColor: 'white',
//   padding: '15px',
//   marginBottom: '15px',
//   borderRadius: '4px',
//   border: '1px solid #ddd'
// };
