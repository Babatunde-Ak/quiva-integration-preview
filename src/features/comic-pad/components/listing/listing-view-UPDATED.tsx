// // SNIPPET: How to use the hybrid hook in your listing-view.tsx

// // In your existing listing-view.tsx, update the executeCreateCollection function:

// // OLD CODE (Replace this):
// /*
// const executeCreateCollection = async (
//     flowData: FlowData,
//     episodeData: any
// ) => {
//     setProcessingMessage('Creating NFT collection...');
    
//     const result = await retryWithBackoff(async () => {
//         return await createComicCollection({
//             episodeId: episodeId,
//             name: `${episodeData?.title || 'Unknown'} Collection`,
//             symbol: flowData.rarity!.type.toUpperCase().substring(0, 4),
//             maxSupply: flowData.rarity!.maxSupply,
//         });
//     });
//     // ... rest of code
// };
// */

// // NEW CODE (Use this instead):

// const executeCreateCollection = async (
//     flowData: FlowData,
//     episodeData: any
// ) => {
//     setProcessingMessage('Creating NFT collection...');
    
//     try {
//         // No need for retryWithBackoff - the hook handles retries internally!
//         const result = await createComicCollection({
//             episodeId: episodeId,
//             name: `${episodeData?.title || 'Unknown'} Collection`,
//             symbol: flowData.rarity!.type.toUpperCase().substring(0, 4),
//             maxSupply: flowData.rarity!.maxSupply,
//         });
        
//         console.log("✅ Collection created:", result);
        
//         // ============================================
//         // NEW: Check if fallback was used
//         // ============================================
        
//         if (result.indexedVia === "event-logs") {
//             console.warn("⚠️ Used Event Logs fallback (Mirror Node was unavailable)");
//             // Optional: Show a warning to user
//             // setStatusMessage("⚠️ Collection created (indexed via Event Logs fallback)");
//         } else {
//             console.log("✅ Indexed via Mirror Node (normal path)");
//         }
        
//         // ============================================
//         // Save to database as before
//         // ============================================
        
//         const collectionData = {
//             tokenId: result.tokenId!,
//             transactionId: result.transactionId,
//             name: `${episodeData?.title || 'Unknown'} Collection`,
//             symbol: flowData.rarity!.type.toUpperCase().substring(0, 4),
//             maxSupply: flowData.rarity!.maxSupply,
//             indexedVia: result.indexedVia, // Track how it was indexed
//         };
        
//         console.log("Collection data to save:", collectionData);
        
//         saveTransactionState({
//             stage: 'collection_created',
//             episodeId,
//             collectionData,
//             flowData,
//             episodeData,
//             timestamp: Date.now(),
//         });

//         return collectionData;
        
//     } catch (err: any) {
//         console.error("❌ Collection creation failed:", err);
//         setError(err.message);
//         throw err;
//     }
// };

// // ============================================
// // Update the status message display section
// // ============================================

// // In your JSX rendering code (around line 591), update the modal:

// {flowData.isCreating && (
//     <div className="modal">
//         <div className="spinner"></div>
        
//         {/* Main status message */}
//         <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
//             {statusMessage || 'Processing...'}
//         </div>
        
//         {/* Sub-message for detailed progress */}
//         {statusMessage?.includes('[Mirror Node]') && (
//             <div style={{ fontSize: '12px', color: '#FF9800' }}>
//                 📡 Attempting indexing via Mirror Node...
//             </div>
//         )}
        
//         {statusMessage?.includes('[Event Logs]') && (
//             <div style={{ fontSize: '12px', color: '#FFC107' }}>
//                 ⚠️ Fallback: Using Event Logs for indexing
//             </div>
//         )}
        
//         {/* Show success message */}
//         {statusMessage?.includes('Collection created') && (
//             <div style={{ fontSize: '12px', color: '#4CAF50', marginTop: '10px' }}>
//                 ✅ {statusMessage}
//             </div>
//         )}
        
//         {/* Error display */}
//         {error && (
//             <div style={{ fontSize: '12px', color: '#F44336', marginTop: '10px' }}>
//                 ❌ {error}
//             </div>
//         )}
//     </div>
// )}

// // ============================================
// // Optional: Monitor in browser console
// // ============================================

// // Open browser DevTools (F12) and watch console for:
// // ✅ Transaction signed: 0.0.XXXXX-XXXXX-XXXXX
// // ✅ Receipt received
// // 📡 Attempting Mirror Node polling (max 20 attempts)...
// // ✅ Successfully extracted token ID from Mirror Node: 0.0.XXXXX
// // OR:
// // ⚠️ Mirror Node failed, falling back to Event Logs...
// // 📝 Attempting to extract token ID from transaction logs...
// // ✅ Successfully extracted token ID from Event Logs: 0.0.XXXXX

