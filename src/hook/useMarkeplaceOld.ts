// // // import { useState } from "react";
// // // import {
// // //   ContractExecuteTransaction,
// // //   Client,
// // //   ContractFunctionParameters,
// // //   AccountId,
// // //   ContractId,
// // //   TransactionId,
// // //   ContractCallQuery,
// // //   Hbar,
// // //   HbarUnit,
// // //   TokenId,
// // // } from "@hashgraph/sdk";
// // // import { useComicInscription } from "./useComicInscription";
// // // import { ethers } from 'ethers';
// // // import MirrorNodeService  from "./MirrorNodeService";

// // // // Define the ABI for your function
// // // const abi = [
// // //   'function canReadComic(string episodeId, address user) external view returns (bool)'
// // // ];

// // // // Create interface and encode the function call

// // // // ============================================
// // // // CONTRACT ADDRESSES (Update after deployment)
// // // // ============================================
// // // // const CONTRACTS = {
// // // //   COMIC_CORE: "0.0.7797069",       
// // // //   COMIC_SALES: "0.0.7797100",      
// // // //   COMIC_MARKETPLACE: "0.0.7797111" 
// // // // };
// // // const CONTRACTS = {
// // //   COMIC_CORE: "0.0.7806656",
// // //    COMIC_SALES: "0.0.7829668",
// // //   COMIC_MARKETPLACE: "0.0.7829656"
// // // }

// // // interface UseComicPlatformProps {
// // //   accountId: string;
// // //   signer: any;
// // //   network?: "testnet" | "mainnet";
// // // }

// // // export enum CampaignType {
// // //   PUBLIC = 0,
// // //   WHITELIST = 1,
// // //   SCHEDULED = 2
// // // }
// // // // export enum CampaignType {
// // // //   PUBLIC = "Public",
// // // //   WHITELIST = "Whitelist",
// // // //   SCHEDULED = "Scheduled"
// // // // }

// // // export enum PhaseType {
// // //   WHITELIST = 0,
// // //   PUBLIC = 1
// // // }

// // // export function useComicPlatform({
// // //   accountId,
// // //   signer,
// // //   network = "testnet"
// // // }: UseComicPlatformProps) {
// // //   const mirrorNodeService = new MirrorNodeService(network);
  
// // //   const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
// // //   const [error, setError] = useState<string | null>(null);
// // //   const [txId, setTxId] = useState<string | null>(null);
// // //   const [statusMessage, setStatusMessage] = useState<string>("");

// // //   // ============================================
// // //   // HELPER FUNCTIONS
// // //   // ============================================

// // //   const executeWithSigner = async (transaction: any) => {
// // //     const signedTx = await signer.signTransaction(transaction);
// // //     let client: Client;
// // //     if (signer._client) client = signer._client;
// // //     else if (signer.client) client = signer.client;
// // //     else client = Client.forName(network);
// // //     return await signedTx.execute(client);
// // //   };

// // //   const getClient = () => {
// // //     if (signer._client) return signer._client;
// // //     if (signer.client) return signer.client;
// // //     return Client.forName(network);
// // //   };

// // //   const formatTxIdForMirror = (txIdStr: string) => {
// // //     return txIdStr
// // //       .replace("@", "-")
// // //       .replace(/\./g, (match, offset, string) => {
// // //         const dotCount = string.slice(0, offset + 1).split('.').length - 1;
// // //         return dotCount <= 2 ? "." : "-";
// // //       });
// // //   };

// // //   const getMirrorNodeUrl = () => {
// // //     return network === "testnet" 
// // //       ? "https://testnet.mirrornode.hedera.com" 
// // //       : "https://mainnet.mirrornode.hedera.com";
// // //   };

// // //   //  const {
// // //   //     createInscription,
// // //   //     status: inscriptionStatus,
// // //   //     progress: inscriptionProgress,
// // //   //     result: inscriptionResult,
// // //   //     error: inscriptionError,
// // //   //     statusText: inscriptionStatusText,
// // //   //     reset: resetInscription,
// // //   //   } = useComicInscription({ accountId, signer, network });

// // //   // ================================== 
// // //   //  Polling MirrorNodeToTokenId
// // //   // ==================================

// // //   /**
// // //    * ✅ FIXED: Proper Mirror Node polling with retries
// // //    */
// // //   const pollMirrorNodeForTokenId = async (
// // //     txIdStr: string,
// // //     maxRetries: number = 60, // 60 retries * 2 seconds = 2 minutes
// // //     delayMs: number = 2000   // Wait 2 seconds between retries
// // //   ): Promise<string> => {
// // //     const txIdFormatted = formatTxIdForMirror(txIdStr);
// // //     const mirrorNodeUrl = getMirrorNodeUrl();
    
// // //     console.log(`📡 Polling Mirror Node for token ID (max ${maxRetries} attempts)...`);
    
// // //     for (let attempt = 1; attempt <= maxRetries; attempt++) {
// // //       try {
// // //         setStatusMessage(`Indexing on Mirror Node... (Attempt ${attempt}/${maxRetries})`);
        
// // //         const controller = new AbortController();
// // //         const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout per request
        
// // //         const response = await fetch(
// // //           `${mirrorNodeUrl}/api/v1/contracts/results/${txIdFormatted}`,
// // //           { signal: controller.signal }
// // //         );
        
// // //         clearTimeout(timeoutId);
        
// // //         if (response.status === 404) {
// // //           // 404 means not yet indexed, retry
// // //           console.log(`⏳ Transaction not yet indexed on Mirror Node (${attempt}/${maxRetries})`);
// // //           await new Promise(resolve => setTimeout(resolve, delayMs));
// // //           continue;
// // //         }
        
// // //         if (!response.ok) {
// // //           throw new Error(`Mirror Node returned status ${response.status}`);
// // //         }
        
// // //         const data = await response.json();
// // //         console.log("✅ Mirror Node response received:", data);
        
// // //         // Extract token ID from call_result
// // //         if (!data.call_result) {
// // //           throw new Error("No call_result in Mirror Node response");
// // //         }
        
// // //         // The call_result contains the return value (address)
// // //         const tokenEvmAddress = "0x" + data.call_result.slice(-40);
        
// // //         if (!tokenEvmAddress || tokenEvmAddress === "0x") {
// // //           throw new Error("Invalid token EVM address extracted");
// // //         }
        
// // //         // Convert EVM address to Hedera token ID
// // //         const tokenId = TokenId.fromEvmAddress(0, 0, tokenEvmAddress).toString();
// // //         console.log("🎉 Token ID extracted:", tokenId);
        
// // //         return tokenId;
        
// // //       } catch (err: any) {
// // //         if (err.name === 'AbortError') {
// // //           console.warn(`⏳ Request timeout (${attempt}/${maxRetries}), retrying...`);
// // //         } else {
// // //           console.warn(`⚠️ Polling error (${attempt}/${maxRetries}):`, err.message);
// // //         }
        
// // //         // If this is the last attempt, throw error
// // //         if (attempt === maxRetries) {
// // //           throw new Error(`Failed to get token ID after ${maxRetries} attempts: ${err.message}`);
// // //         }
        
// // //         // Wait before retrying with exponential backoff for later attempts
// // //         const backoffDelay = attempt > 10 ? delayMs * 2 : delayMs;
// // //         await new Promise(resolve => setTimeout(resolve, backoffDelay));
// // //       }
// // //     }
    
// // //     throw new Error("Failed to get token ID from Mirror Node");
// // //   };
  
  

// // //   // ============================================
// // //   // CREATOR FUNCTIONS
// // //   // ============================================

// // //   /**
// // //    * Step 1: Create Comic Collection
// // //    * Call this after backend uploads comic to IPFS
// // //    */
// // //   const createComicCollection = async ({
// // //     episodeId,
// // //     name,
// // //     symbol,
// // //     maxSupply,
// // //   }: {
// // //     episodeId: string; // From backend (e.g., "ep_001")
// // //     name: string;
// // //     symbol: string;
// // //     maxSupply: number;
// // //   }) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       console.log("📚 Creating comic collection:", { episodeId, name, maxSupply });

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_CORE)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         .setGas(15000000)
// // //         .setPayableAmount(new Hbar(30)) // For NFT token creation
// // //         .setFunction(
// // //           "createComicCollection",
// // //           new ContractFunctionParameters()
// // //             .addString(episodeId)
// // //             .addString(name)
// // //             .addString(symbol)
// // //             .addString(`${name} Collection`)
// // //             .addInt64(maxSupply)
// // //             .addInt64(7000000) // Auto-renew period
// // //         );

// // //       const response = await executeWithSigner(tx);
// // //       const txIdStr = response.transactionId.toString();
// // //       const receipt = await response.getReceipt(getClient());
// // //       console.log("✅ Collection created!");
      
// // //       // Wait for Mirror Node to index the transaction
// // //       await new Promise(resolve => setTimeout(resolve, 5000));
      
// // //       const txIdFormatted = formatTxIdForMirror(txIdStr);
// // //       console.log("📡 Fetching token ID from Mirror Node:", txIdFormatted);
      
// // //       let tokenId = '';
// // //       try {
// // //         // Create a fetch with timeout
// // //         const controller = new AbortController();
// // //         //const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
// // //         const mirrorResponse = await fetch(
// // //           `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`,
// // //           { signal: controller.signal }
// // //         );
// // //         //clearTimeout(timeoutId);
        
// // //         if (!mirrorResponse.ok) {
// // //           throw new Error(`Mirror Node returned status ${mirrorResponse.status}`);
// // //         }
        
// // //         const mirrorData = await mirrorResponse.json();
// // //         console.log("Mirror Node data:", mirrorData);
        
// // //         const tokenEvmAddress = mirrorData?.call_result 
// // //           ? "0x" + mirrorData.call_result.slice(-40) 
// // //           : null;
        
// // //         if (tokenEvmAddress) {
// // //           tokenId = TokenId.fromEvmAddress(0, 0, tokenEvmAddress).toString();
// // //           console.log("🎉 New Token ID:", tokenId);
// // //         } else {
// // //           console.warn("⚠️ Could not extract token EVM address from Mirror Node response");
// // //           throw new Error("No token address in Mirror Node response");
// // //         }
// // //       } catch (mirrorError: any) {
// // //         console.error("❌ Mirror Node fetch failed:", mirrorError.message);
// // //         // Don't fail the entire transaction, proceed with transaction ID
// // //         console.log("⚠️ Proceeding without Mirror Node data, will retry in next step");
// // //         tokenId = txIdStr; // Use transaction ID as fallback
// // //       }

// // //       setTxId(txIdStr);
// // //       setStatus("done");

// // //       return {
// // //         transactionId: txIdStr,
// // //         status: receipt.status.toString(),
// // //         tokenId
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Collection creation failed:", err);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       throw err;
// // //     }
// // //   };

// // //   // ============================================
// // //   // PATH 1: DIRECT LISTING
// // //   // ============================================



// // //   /**
// // //    * Create Direct Listing (mints + lists for sale immediately)
// // //    */
// // //   // const createDirectListing = async ({
// // //   //   episodeId,
// // //   //   quantity,
// // //   //   pricePerNFT,
// // //   //   metadata,
// // //   // }: {
// // //   //   episodeId: string;
// // //   //   quantity: number;
// // //   //   pricePerNFT: number; // in HBAR
// // //   //   metadata: string; // "hcs://1/topicId"
// // //   // }) => {
// // //   //   try {
// // //   //     setStatus("processing");
// // //   //     setError(null);
// // //   //     // console.log("💼 Starting Inscription process...");
// // //   //     // const inscriptionResult = await createInscription(metadata, episodeId);
// // //   //     // console.log("✅ Inscription created:", inscriptionResult);
// // //   //     console.log("🏪 Proceeding to create direct listing:", { episodeId, quantity, pricePerNFT });
// // //   //     console.log("🏪 Creating direct listing:", { episodeId, quantity, pricePerNFT });

// // //   //     const priceInTinybars = Hbar.from(pricePerNFT, HbarUnit.Hbar).toTinybars();
// // //   //       // const topicId = inscriptionResult.topicId || '';
// // //   //       // console.log("🎉 Inscription Topic ID:", topicId);
// // //   //       // const metadataHRL = `hcs://1/${topicId}`;
// // //   //         // console.log("Metadata HRL:", metadataHRL);
// // //   //     //  const BATCH_SIZE = 10;
// // //   //     // let allSerials: number[] = [];
// // //   //     // let mintedCount = 0;
// // //   //     // for (let batchStart = 0; batchStart < quantity; batchStart += BATCH_SIZE) {
// // //   //     //         const batchEnd = Math.min(batchStart + BATCH_SIZE, quantity);
// // //   //     //         const batchCount = batchEnd - batchStart;
              
// // //   //     //         console.log(`📦 Minting batch: NFTs ${batchStart + 1}-${batchEnd} (${batchCount} NFTs)`);
              
// // //   //             // Create metadata buffers for this batch only
// // //   //             // const metadataBuffers = Array(batchCount).fill(
// // //   //             //   Buffer.from(metadata || "")
// // //   //             // );
// // //   //     const tx = new ContractExecuteTransaction()
// // //   //       .setContractId(CONTRACTS.COMIC_SALES)
// // //   //       .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //   //       .setGas(5000000 + (quantity * 500000))
// // //   //       .setFunction(
// // //   //         "createDirectListing",
// // //   //         new ContractFunctionParameters()
// // //   //           .addString(episodeId)
// // //   //           .addUint256(quantity)
// // //   //           .addUint256(priceInTinybars)
// // //   //            .addBytes(Buffer.from(metadata))
// // //   //             //.addBytesArray(metadataBuffers)
// // //   //       );

// // //   //     const response = await executeWithSigner(tx);
// // //   //     const txIdStr = response.transactionId.toString();
// // //   //     const receipt = await response.getReceipt(getClient());

// // //   //     console.log("✅ Direct listing created!");
      

// // //   //     setTxId(txIdStr);
// // //   //     setStatus("done");
      
// // //   //     // Get listing ID from mirror node (optional)
// // //   //     await new Promise(resolve => setTimeout(resolve, 5000));
// // //   //     const txIdFormatted = formatTxIdForMirror(txIdStr);
// // //   //     const mirrorResponse = await fetch(
// // //   //       `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
// // //   //     );
// // //   //     const mirrorData = await mirrorResponse.json();
// // //   //     console.log("Mirror Node data:", mirrorData);
      
// // //   //     let listingId: string | undefined;
// // //   //     if (mirrorData?.call_result) {
// // //   //       listingId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
// // //   //     }
    

// // //   //     return {
// // //   //       transactionId: txIdStr,
// // //   //       status: receipt.status.toString(),
// // //   //       listingId,
// // //   //     };
// // //   //      // metadataHRL
// // //   //     // };
// // //   //   } catch (err: any) {
// // //   //     console.error("❌ Direct listing failed:", err);
// // //   //     setError(err.message);
// // //   //     setStatus("error");
// // //   //     throw err;
// // //   //   }
// // //   // };

// // //     /**
// // //    * Create Direct Listing (mints + lists for sale immediately)
// // //    * NOW WITH BATCH SUPPORT FOR MINTING
// // //    */
// // //   const createDirectListing = async ({
// // //     episodeId,
// // //     quantity,
// // //     pricePerNFT,
// // //     metadata,
// // //   }: {
// // //     episodeId: string;
// // //     quantity: number;
// // //     pricePerNFT: number; // in HBAR
// // //     metadata: string; // "hcs://1/topicId"
// // //   }) => {
// // //     let lastTxId = '';
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       setMintProgress(0);
// // //       console.log("🏪 Creating direct listing with batch minting:", { episodeId, quantity, pricePerNFT });

// // //       const priceInTinybars = Hbar.from(pricePerNFT, HbarUnit.Hbar).toTinybars();
      
// // //       // Constants for batch processing
// // //       const BATCH_SIZE = 10; // Hedera's limit
// // //       const totalBatches = Math.ceil(quantity / BATCH_SIZE);
// // //       let completedBatches = 0;

// // //       console.log(`📦 Will mint in ${totalBatches} batches of up to ${BATCH_SIZE} NFTs each`);

// // //       // Process in batches
// // //       for (let batchStart = 0; batchStart < quantity; batchStart += BATCH_SIZE) {
// // //         const batchEnd = Math.min(batchStart + BATCH_SIZE, quantity);
// // //         const batchQuantity = batchEnd - batchStart;
// // //         const currentBatch = completedBatches + 1;
        
// // //         console.log(`📦 Processing batch ${currentBatch}/${totalBatches}: NFTs ${batchStart + 1}-${batchEnd} (${batchQuantity} NFTs)`);
// // //         //setMintStatusText(`Minting batch ${currentBatch}/${totalBatches} (${batchQuantity} NFTs)...`);

// // //         try {
// // //           const tx = new ContractExecuteTransaction()
// // //             .setContractId(CONTRACTS.COMIC_SALES)
// // //             .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //             .setGas(5000000 + (batchQuantity * 500000))
// // //             .setFunction(
// // //               "createDirectListing",
// // //               new ContractFunctionParameters()
// // //                 .addString(episodeId)
// // //                 .addUint256(batchQuantity)
// // //                 .addUint256(priceInTinybars)
// // //                 .addBytes(Buffer.from(metadata))
// // //             );

// // //           const response = await executeWithSigner(tx);
// // //           const txIdStr = response.transactionId.toString();
// // //           const receipt = await response.getReceipt(getClient());
// // //           console.log("✅ Batch direct listing created!", receipt);
// // //            lastTxId = txIdStr;

// // //           console.log(`✅ Batch ${currentBatch}/${totalBatches} completed! Transaction: ${txIdStr}`);
          
// // //           completedBatches++;
// // //           const progress = (completedBatches / totalBatches) * 100;
// // //           setMintProgress(progress);

// // //           // Add delay between batches to avoid rate limiting
// // //           if (batchEnd < quantity) {
// // //             console.log("⏳ Waiting 3 seconds before next batch...");
// // //             await new Promise(resolve => setTimeout(resolve, 3000));
// // //           }

// // //           // Store the last transaction ID for return
// // //           // if (batchEnd >= quantity) {
// // //           //   setTxId(txIdStr);
// // //           // }

// // //         } catch (batchError: any) {
// // //           console.error(`❌ Batch ${currentBatch}/${totalBatches} failed:`, batchError);
// // //           throw new Error(`Batch minting failed at NFTs ${batchStart + 1}-${batchEnd}: ${batchError.message}`);
// // //         }
// // //       }

// // //       console.log("✅ All batches completed! Direct listing created successfully!");
// // //       setMintProgress(100);
// // //       setTxId(lastTxId);
// // //       // setMintStatusText(`Successfully minted and listed ${quantity} NFTs!`);
// // //       setStatus("done");
      
// // //       // Get listing ID from mirror node for the last transaction
// // //       let listingId: string | undefined;
// // //       try {
// // //         await new Promise(resolve => setTimeout(resolve, 5000));
// // //         const txIdFormatted = formatTxIdForMirror(lastTxId);
// // //         console.log("📡 Fetching listing ID from Mirror Node:", txIdFormatted);
        
// // //         // Create a fetch with timeout
// // //         const controller = new AbortController();
// // //         //const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
// // //         const mirrorResponse = await fetch(
// // //           `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`,
// // //           { signal: controller.signal }
// // //         );
// // //         // clearTimeout(timeoutId);
        
// // //         if (!mirrorResponse.ok) {
// // //           throw new Error(`Mirror Node returned status ${mirrorResponse.status}`);
// // //         }
        
// // //         const mirrorData = await mirrorResponse.json();
// // //         console.log("Mirror Node data:", mirrorData);
        
// // //         if (mirrorData?.call_result) {
// // //           listingId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
// // //           console.log("✅ Listing ID:", listingId);
// // //         }
// // //       } catch (mirrorError: any) {
// // //         console.warn("⚠️ Mirror Node fetch failed, proceeding without listing ID:", mirrorError.message);
// // //         // Don't fail the entire transaction, the listing was created on-chain
// // //       }

// // //       return {
// // //         transactionId: lastTxId,
// // //         status: "SUCCESS",
// // //         listingId,
// // //         totalMinted: quantity,
// // //         batches: totalBatches,
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Direct listing with batch minting failed:", err);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       // setMintProgress(0);
// // //       throw err;
// // //     }
// // //   };
// // //   /**
// // //    * 
     

// // //    * Purchase from Direct Listing
// // //    */
// // //   const purchaseFromListing = async ({
// // //     listingId,
// // //     quantity,
// // //     pricePerNFT,
// // //   }: {
// // //     listingId: number;
// // //     quantity: number;
// // //     pricePerNFT: number; // in HBAR
// // //   }) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       console.log("💳 Purchasing from listing:", { listingId, quantity });

// // //       const totalPrice = pricePerNFT * quantity;

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_SALES)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         // .setGas(2000000)
// // //         .setGas(5000000 + (quantity * 500000))
// // //         .setPayableAmount(new Hbar(totalPrice, HbarUnit.Hbar))
// // //         .setFunction(
// // //           "purchaseFromListing",
// // //           new ContractFunctionParameters()
// // //             .addUint256(typeof listingId === "string" ? parseInt(listingId) : listingId)
// // //             .addUint256(quantity)
// // //         );

// // //       const response = await executeWithSigner(tx);
// // //       const txIdStr = response.transactionId.toString();
// // //       const receipt = await response.getReceipt(getClient());

// // //       console.log("✅ Purchase successful! You can now read this comic!");
// // //       setTxId(txIdStr);
// // //       setStatus("done");

// // //       return {
// // //         transactionId: txIdStr,
// // //         status: receipt.status.toString(),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Purchase failed:", err);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       throw err;
// // //     }
// // //   };

// // //   // ============================================
// // //   // PATH 2: CAMPAIGN/DROP SYSTEM
// // //   // ============================================

// // //   /**
// // //    * Create Campaign (Public/Whitelist/Scheduled)
// // //    */
// // //   const createCampaign = async ({
// // //     episodeId,
// // //     campaignType,
// // //     mintPrice,
// // //     maxSupply,
// // //     maxPerWallet,
// // //     metadata,
// // //   }: {
// // //     episodeId: string;
// // //     campaignType: CampaignType;
// // //     mintPrice: number; // in HBAR
// // //     maxSupply: number;
// // //     maxPerWallet: number;
// // //     metadata: string;
// // //   }) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       console.log("🎯 Creating campaign:", { episodeId, campaignType, maxSupply });

// // //       const priceInTinybars = Hbar.from(mintPrice, HbarUnit.Hbar).toTinybars();

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_SALES)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         .setGas(4000000)
// // //         .setFunction(
// // //           "createCampaign",
// // //           new ContractFunctionParameters()
// // //             .addString(episodeId)
// // //             .addUint8(campaignType)
// // //             .addUint256(priceInTinybars)
// // //             .addUint256(maxSupply)
// // //             .addUint256(maxPerWallet)
// // //             .addBytes(Buffer.from(metadata))
// // //         );

// // //       const response = await executeWithSigner(tx);
// // //       const txIdStr = response.transactionId.toString();
// // //       const receipt = await response.getReceipt(getClient());
// // //         await new Promise(resolve => setTimeout(resolve, 5000));
// // //       const txIdFormatted = formatTxIdForMirror(txIdStr);
// // //       const mirrorResponse = await fetch(
// // //         `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
// // //       );
// // //       const mirrorData = await mirrorResponse.json();
// // //       console.log("Mirror Node data:", mirrorData);
      
// // //       let campaignId: string | undefined;
// // //       if (mirrorData?.call_result) {
// // //         campaignId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
// // //       }
// // //       console.log("🎉 New Campaign ID:", campaignId);
// // //       setTxId(txIdStr);
// // //       setStatus("done");
// // //       console.log("✅ Campaign created!");
     

// // //       return {
// // //         transactionId: txIdStr,
// // //         status: receipt.status.toString(),
// // //         campaignId: campaignId
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Campaign creation failed:", err);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Add addresses to whitelist (for WHITELIST campaigns)
// // //    */
// // //   const addToWhitelist = async ({
// // //     campaignId,
// // //     addresses,
// // //     allocations,
// // //   }: {
// // //     campaignId: number;
// // //     addresses: string[];
// // //     allocations: number[];
// // //   }) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       console.log("📋 Adding to whitelist:", { campaignId, count: addresses.length });

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_SALES)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         .setGas(1000000 + (addresses.length * 100000))
// // //         .setFunction(
// // //           "addToWhitelist",
// // //           new ContractFunctionParameters()
// // //             .addUint256(campaignId)
// // //             .addAddressArray(addresses)
// // //             .addUint256Array(allocations)
// // //         );

// // //       const response = await executeWithSigner(tx);
// // //       const receipt = await response.getReceipt(getClient());

// // //       console.log("✅ Whitelist updated!");
// // //       setTxId(response.transactionId.toString());
// // //       setStatus("done");

// // //       return {
// // //         transactionId: response.transactionId.toString(),
// // //         status: receipt.status.toString(),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Whitelist update failed:", err);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Add phase (for SCHEDULED campaigns)
// // //    */
// // //   const addPhase = async ({
// // //     campaignId,
// // //     phaseType,
// // //     startTime,
// // //     endTime,
// // //     mintPrice,
// // //     maxPerWallet,
// // //     phaseSupply,
// // //   }: {
// // //     campaignId: number;
// // //     phaseType: PhaseType;
// // //     startTime: number; // Unix timestamp
// // //     endTime: number;
// // //     mintPrice: number; // in HBAR
// // //     maxPerWallet: number;
// // //     phaseSupply: number;
// // //   }) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       console.log("⏰ Adding phase:", { campaignId, phaseType });

// // //       const priceInTinybars = Hbar.from(mintPrice, HbarUnit.Hbar).toTinybars();

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_SALES)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         .setGas(2000000)
// // //         .setFunction(
// // //           "addPhase",
// // //           new ContractFunctionParameters()
// // //             .addUint256(campaignId)
// // //             .addUint8(phaseType)
// // //             .addUint256(startTime)
// // //             .addUint256(endTime)
// // //             .addUint256(priceInTinybars)
// // //             .addUint256(maxPerWallet)
// // //             .addUint256(phaseSupply)
// // //         );

// // //       const response = await executeWithSigner(tx);
// // //       const receipt = await response.getReceipt(getClient());

// // //       console.log("✅ Phase added!");
// // //       setTxId(response.transactionId.toString());
// // //       setStatus("done");

// // //       return {
// // //         transactionId: response.transactionId.toString(),
// // //         status: receipt.status.toString(),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Phase add failed:", err);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Mint from Campaign
// // //    */
// // //   const mintFromCampaign = async ({
// // //     campaignId,
// // //     phaseId = 0,
// // //     quantity,
// // //     mintPrice,
// // //   }: {
// // //     campaignId: number;
// // //     phaseId?: number; // 0 for PUBLIC/WHITELIST, specific ID for SCHEDULED
// // //     quantity: number;
// // //     mintPrice: number; // in HBAR
// // //   }) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       console.log("🎨 Minting from campaign:", { campaignId, quantity });

// // //       const totalPrice = mintPrice * quantity;

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_SALES)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         .setGas(4000000 + (quantity * 500000))
// // //         .setPayableAmount(new Hbar(totalPrice, HbarUnit.Hbar))
// // //         .setFunction(
// // //           "mint",
// // //           new ContractFunctionParameters()
// // //             .addUint256(campaignId)
// // //             .addUint256(phaseId)
// // //             .addUint256(quantity)
// // //         );

// // //       const response = await executeWithSigner(tx);
// // //       const txIdStr = response.transactionId.toString();
// // //       const receipt = await response.getReceipt(getClient());

// // //       console.log("✅ Mint successful! You can now read this comic!");
// // //       setTxId(txIdStr);
// // //       setStatus("done");

// // //       return {
// // //         transactionId: txIdStr,
// // //         status: receipt.status.toString(),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Mint failed:", err);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       throw err;
// // //     }
// // //   };

// // //   // ============================================
// // //   // MARKETPLACE - RESALE
// // //   // ============================================

// // //   /**
// // //    * List NFT for Resale
// // //    */
// // //   const listForResale = async ({
// // //     tokenAddress,
// // //     serialNumber,
// // //     priceInHbar,
// // //   }: {
// // //     tokenAddress: string;
// // //     serialNumber: number;
// // //     priceInHbar: number;
// // //   }) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       console.log("📝 Listing for resale:", { serialNumber, priceInHbar });

// // //       const priceInTinybars = Hbar.from(priceInHbar, HbarUnit.Hbar).toTinybars();

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         .setGas(5000000)
// // //         .setFunction(
// // //           "depositAndListForResale",
// // //           new ContractFunctionParameters()
// // //             .addAddress(TokenId.fromString(tokenAddress).toEvmAddress())
// // //             .addInt64(serialNumber)
// // //             .addUint256(priceInTinybars)
// // //         );

// // //       const response = await executeWithSigner(tx);
// // //       const txIdStr = response.transactionId.toString();
// // //       const receipt = await response.getReceipt(getClient());

// // //       console.log("✅ Listed for resale!");
// // //       setTxId(txIdStr);
// // //       setStatus("done");

// // //       // Get listing ID
// // //       await new Promise(resolve => setTimeout(resolve, 5000));
// // //       const txIdFormatted = formatTxIdForMirror(txIdStr);
// // //       const mirrorResponse = await fetch(
// // //         `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
// // //       );
// // //       const mirrorData = await mirrorResponse.json();
      
// // //       let listingId: string | undefined;
// // //       if (mirrorData?.call_result) {
// // //         listingId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
// // //       }
      
// // //           const serials: number[] = [];
// // //           let allSerials: number[] = [];
// // //           if (mirrorData?.call_result) {
// // //             const result = mirrorData.call_result.slice(2);
// // //             const arrayLengthHex = result.slice(64, 128);
// // //             const arrayLength = parseInt(arrayLengthHex, 16);
            
// // //             for (let i = 0; i < arrayLength; i++) {
// // //               const start = 128 + (i * 64);
// // //               const serialHex = result.slice(start, start + 64);
// // //               const serial = parseInt(serialHex, 16);
// // //               if (serial > 0) serials.push(serial);
// // //             }
          
// // //             allSerials = allSerials.concat(serials);
// // //             console.log("🎉 Minted serials:", serials);
// // //           }
// // //       return {
// // //         transactionId: txIdStr,
// // //         status: receipt.status.toString(),
// // //         listingId,
// // //         serials: allSerials
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ List for resale failed:", err);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Batch list multiple NFTs for resale
// // //    */
// // //   const batchListForResale = async ({
// // //     tokenAddress,
// // //     serialNumbers,
// // //     prices,
// // //   }: {
// // //     tokenAddress: string;
// // //     serialNumbers: number[];
// // //     prices: number[]; // in HBAR
// // //   }) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       console.log("📝 Batch listing for resale:", { count: serialNumbers.length });

// // //       const pricesInTinybars = prices.map(p => Hbar.from(p, HbarUnit.Hbar).toTinybars());

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         .setGas(3000000 + (serialNumbers.length * 300000))
// // //         .setFunction(
// // //           "batchDepositAndListForResale",
// // //           new ContractFunctionParameters()
// // //             .addAddress(TokenId.fromString(tokenAddress).toEvmAddress())
// // //             .addInt64Array(serialNumbers)
// // //             .addUint256Array(pricesInTinybars)
// // //         );

// // //       const response = await executeWithSigner(tx);
// // //       const txIdStr = response.transactionId.toString();
// // //       const receipt = await response.getReceipt(getClient());

// // //       console.log("✅ Batch listed for resale!");
// // //       setTxId(txIdStr);
// // //       setStatus("done");

// // //       return {
// // //         transactionId: txIdStr,
// // //         status: receipt.status.toString(),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Batch list failed:", err);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Purchase from Marketplace (Resale)
// // //    */
// // //   const purchaseFromMarketplace = async ({
// // //     listingId,
// // //     priceInHbar,
// // //   }: {
// // //     listingId: number;
// // //     priceInHbar: number;
// // //   }) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       console.log("💳 Purchasing from marketplace:", { listingId });

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         .setGas(5000000)
// // //         .setPayableAmount(new Hbar(priceInHbar, HbarUnit.Hbar))
// // //         .setFunction(
// // //           "purchaseNFT",
// // //           new ContractFunctionParameters()
// // //             .addUint256(typeof listingId === "string" ? parseInt(listingId) : listingId)
// // //         );

// // //       const response = await executeWithSigner(tx);
// // //       const txIdStr = response.transactionId.toString();
// // //       const receipt = await response.getReceipt(getClient());

// // //       console.log("✅ Purchase successful! Reading access transferred!");
// // //       setTxId(txIdStr);
// // //       setStatus("done");

// // //       return {
// // //         transactionId: txIdStr,
// // //         status: receipt.status.toString(),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Purchase failed:", err);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Cancel Listing
// // //    */
// // //   const cancelListing = async (listingId: number) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         .setGas(2000000)
// // //         .setFunction(
// // //           "cancelListing",
// // //           new ContractFunctionParameters()
// // //             .addUint256(listingId)
// // //         );

// // //       const response = await executeWithSigner(tx);
// // //       const receipt = await response.getReceipt(getClient());

// // //       setTxId(response.transactionId.toString());
// // //       setStatus("done");

// // //       return {
// // //         transactionId: response.transactionId.toString(),
// // //         status: receipt.status.toString(),
// // //       };
// // //     } catch (err: any) {
// // //       setError(err.message);
// // //       setStatus("error");
// // //       throw err;
// // //     }
// // //   };

// // //   // ============================================
// // //   // QUERY FUNCTIONS
// // //   // ============================================

// // //  const canReadComic = async (episodeId: string, userAddress: string): Promise<boolean> => {
// // //   try {
// // //     const abi = ['function canReadComic(string episodeId, address user) external view returns (bool)'];
// // //     const abiInterface = new ethers.Interface(abi);
// // //     const encodedData = abiInterface.encodeFunctionData('canReadComic', [episodeId, userAddress]);

// // //     // Convert contract ID to EVM address (e.g., 0.0.1234 → 0x00000000000000000000000000000000000004d2)
// // //     // const contractAddress = ContractId.fromString(CONTRACTS.COMIC_CORE).toEvmAddress();
// // // const contractAddress = mirrorNodeService.hederaIdToEvmAddress(CONTRACTS.COMIC_CORE);
// // //     const response = await fetch('https://testnet.mirrornode.hedera.com/api/v1/contracts/call', {
// // //       method: 'POST',
// // //       headers: { 'Content-Type': 'application/json' },
// // //       body: JSON.stringify({
// // //         block: 'latest',
// // //         data: encodedData,
// // //         to: contractAddress
// // //       })
// // //     });

// // //     const result = await response.json();
// // //     console.log('Raw canReadComic result:', result);
    
// // //     // Decode the boolean result
// // //     const decoded = abiInterface.decodeFunctionResult('canReadComic', result.result);
// // //     console.log('Decoded canReadComic result:', decoded[0]);
    
// // //     return decoded[0];
// // //   } catch (err) {
// // //     console.error('❌ Query failed:', err);
// // //     return false;
// // //   }
// // // };


// // //   /**
// // //    * Check if user can read comic (for backend)
// // //    */
// // //   // const canReadComic = async (episodeId: string, userAddress: string): Promise<boolean> => {
// // //   //   try {
// // //   //     const client = Client.forName(network);

// // //   //     const query = new ContractCallQuery()
// // //   //       .setContractId(CONTRACTS.COMIC_CORE)
// // //   //       .setGas(100000)
// // //   //       .setFunction(
// // //   //         "canReadComic",
// // //   //         new ContractFunctionParameters()
// // //   //           .addString(episodeId)
// // //   //           .addAddress(userAddress)
// // //   //       );

// // //   //     const result = await query.execute(client);
// // //   //     return result.getBool(0);
// // //   //   } catch (err: any) {
// // //   //     console.error("❌ Query failed:", err);
// // //   //     return false;
// // //   //   }
// // //   // };

// // //   /**
// // //    * Get episode details
// // //    */
// // //   const getEpisode = async (episodeId: string) => {
// // //     try {
// // //       const client = Client.forName(network);

// // //       const query = new ContractCallQuery()
// // //         .setContractId(CONTRACTS.COMIC_CORE)
// // //         .setGas(100000)
// // //         .setFunction(
// // //           "getEpisode",
// // //           new ContractFunctionParameters()
// // //             .addString(episodeId)
// // //         );

// // //       const result = await query.execute(client);

// // //       return {
// // //         tokenAddress: result.getAddress(0),
// // //         creator: result.getAddress(1),
// // //         name: result.getString(2),
// // //         maxSupply: Number(result.getInt64(3)),
// // //         currentSupply: Number(result.getInt64(4)),
// // //         exists: result.getBool(5),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Query failed:", err);
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Get campaign details
// // //    */
// // //   const getCampaign = async (campaignId: number) => {
// // //     try {
// // //       const client = Client.forName(network);

// // //       const query = new ContractCallQuery()
// // //         .setContractId(CONTRACTS.COMIC_SALES)
// // //         .setGas(150000)
// // //         .setFunction(
// // //           "getCampaign",
// // //           new ContractFunctionParameters()
// // //             .addUint256(campaignId)
// // //         );

// // //       const result = await query.execute(client);

// // //       const campaignTypeNum = Number(result.getUint8(2));
// // //       const campaignTypeMap: { [key: number]: CampaignType } = {
// // //         0: CampaignType.PUBLIC,
// // //         1: CampaignType.WHITELIST,
// // //         2: CampaignType.SCHEDULED,
// // //       };
      
// // //       return {
// // //         episodeId: result.getString(0),
// // //         creator: result.getAddress(1),
// // //         campaignType: campaignTypeMap[campaignTypeNum] || CampaignType.PUBLIC,
// // //         mintPrice: result.getUint256(3).toString(),
// // //         maxSupply: result.getUint256(4).toString(),
// // //         totalMinted: result.getUint256(5).toString(),
// // //         isActive: result.getBool(6),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Query failed:", err);
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Get direct listing details
// // //    */
// // //   const getDirectListing = async (listingId: number) => {
// // //     try {
// // //       const client = Client.forName(network);

// // //       const query = new ContractCallQuery()
// // //         .setContractId(CONTRACTS.COMIC_SALES)
// // //         .setGas(100000)
// // //         .setFunction(
// // //           "getDirectListing",
// // //           new ContractFunctionParameters()
// // //             .addUint256(listingId)
// // //         );

// // //       const result = await query.execute(client);

// // //       return {
// // //         episodeId: result.getString(0),
// // //         creator: result.getAddress(1),
// // //         pricePerNFT: result.getUint256(2).toString(),
// // //         available: result.getUint256(3).toString(),
// // //         isActive: result.getBool(4),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Query failed:", err);
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Get marketplace listing details
// // //    */
// // //   const getMarketplaceListing = async (listingId: number) => {
// // //     try {
// // //       const client = Client.forName(network);

// // //       const query = new ContractCallQuery()
// // //         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
// // //         .setGas(100000)
// // //         .setFunction(
// // //           "getListing",
// // //           new ContractFunctionParameters()
// // //             .addUint256(listingId)
// // //         );
// // //        const response = await executeWithSigner(query);
// // //       const result = await response.execute(client);
// // //       console.log("Marketplace listing result:", result);

// // //       return {
// // //         tokenAddress: result.getAddress(0),
// // //         serialNumber: Number(result.getInt64(1)),
// // //         seller: result.getAddress(2),
// // //         price: result.getUint256(3).toString(),
// // //         isActive: result.getBool(4),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Query failed:", err);
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Get current phase for scheduled campaign
// // //    */
// // //   const getCurrentPhase = async (campaignId: number) => {
// // //     try {
// // //       const client = Client.forName(network);

// // //       const query = new ContractCallQuery()
// // //         .setContractId(CONTRACTS.COMIC_SALES)
// // //         .setGas(200000)
// // //         .setFunction(
// // //           "getCurrentPhase",
// // //           new ContractFunctionParameters()
// // //             .addUint256(campaignId)
// // //         );

// // //       const result = await query.execute(client);

// // //       return {
// // //         phaseId: Number(result.getUint256(0)),
// // //         exists: result.getBool(1),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Query failed:", err);
// // //       throw err;
// // //     }
// // //   };

// // //   return {
// // //     // Creator functions
// // //     createComicCollection,
// // //     createDirectListing,
// // //     createCampaign,
// // //     addToWhitelist,
// // //     addPhase,
    
// // //     // User functions - Buying
// // //     purchaseFromListing,
// // //     mintFromCampaign,
    
// // //     // User functions - Reselling
// // //     listForResale,
// // //     batchListForResale,
// // //     purchaseFromMarketplace,
// // //     cancelListing,
    
// // //     // Query functions
// // //     canReadComic,
// // //     getEpisode,
// // //     getCampaign,
// // //     getDirectListing,
// // //     getMarketplaceListing,
// // //     getCurrentPhase,
    
// // //     // State
// // //     status,
// // //     error,
// // //     txId,
// // //   };
// // // }

// // // export default useComicPlatform;
// // // function setMintProgress(progress: number) {
// // //   if (Number.isNaN(progress)) return;
// // //   const clamped = Math.max(0, Math.min(100, progress));
// // //   console.debug("Mint progress:", clamped);
// // // }
// // // // function setMintStatusText(text: string) {
// // // //   if (!text) return;
// // // //   console.debug("Mint status:", text);
// // // // }
// // // // function setMintStatusText(arg0: string) {
// // // //   throw new Error("Function not implemented.");
// // // // }


// // // import { useState } from "react";
// // // import {
// // //   ContractExecuteTransaction,
// // //   Client,
// // //   ContractFunctionParameters,
// // //   AccountId,
// // //   ContractId,
// // //   TransactionId,
// // //   ContractCallQuery,
// // //   Hbar,
// // //   HbarUnit,
// // //   TokenId,
// // // } from "@hashgraph/sdk";
// // // // import { useComicInscription } from "./useComicInscription";
// // // import { ethers } from 'ethers';
// // // import MirrorNodeService  from "./MirrorNodeService";

// // // // Define the ABI for your function
// // // const abi = [
// // //   'function canReadComic(string episodeId, address user) external view returns (bool)'
// // // ];

// // // // Create interface and encode the function call

// // // const CONTRACTS = {
// // //   COMIC_CORE: "0.0.7806656",
// // //    COMIC_SALES: "0.0.7829668",
// // //   COMIC_MARKETPLACE: "0.0.7829656"
// // // }

// // // interface UseComicPlatformProps {
// // //   accountId: string;
// // //   signer: any;
// // //   network?: "testnet" | "mainnet";
// // // }

// // // export enum CampaignType {
// // //   PUBLIC = 0,
// // //   WHITELIST = 1,
// // //   SCHEDULED = 2
// // // }
// // // // export enum CampaignType {
// // // //   PUBLIC = "Public",
// // // //   WHITELIST = "Whitelist",
// // // //   SCHEDULED = "Scheduled"
// // // // }

// // // export enum PhaseType {
// // //   WHITELIST = 0,
// // //   PUBLIC = 1
// // // }

// // // export function useComicPlatform({
// // //   accountId,
// // //   signer,
// // //   network = "testnet"
// // // }: UseComicPlatformProps) {
// // //   const mirrorNodeService = new MirrorNodeService(network);

// // //   const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
// // //   const [error, setError] = useState<string | null>(null);
// // //   const [txId, setTxId] = useState<string | null>(null);
// // //   const [statusMessage, setStatusMessage] = useState<string>("");
// // //   const [usedFallback, setUsedFallback] = useState<boolean>(false);

// // //   // ============================================
// // //   // HELPER FUNCTIONS
// // //   // ============================================
 
// // //   // const executeWithSigner = async (transaction: any) => {
// // //   //   const signedTx = await signer.signTransaction(transaction);
// // //   //   let client: Client;
// // //   //   if (signer._client) client = signer._client;
// // //   //   else if (signer.client) client = signer.client;
// // //   //   else client = Client.forName(network);
// // //   //   return await signedTx.execute(client);
// // //   // };
// // //    const getClient = () => {
// // //     if (signer._client) return signer._client;
// // //     if (signer.client) return signer.client;
// // //     return Client.forName(network);
// // //   };
// // //   const executeWithSigner = async (transaction: any) => {
// // //     // 1. Get the standard Hedera Client to fetch node account IDs
// // //     const client = getClient();
     
// // //     transaction.setTransactionValidDuration(180);
// // //     // 2. Freeze the transaction (locks in your manually set Transaction ID)
// // //     transaction.freezeWith(client);

// // //     // 3. CRITICAL FIX: Execute THROUGH the HashPack signer!
// // //     // This routes the submission through the browser extension to bypass CORS hangs.
// // //     const response = await transaction.executeWithSigner(signer);

// // //     return response;
// // //   };
// // // //   const executeWithSigner = async (transaction: any) => {
// // // //   return await transaction
// // // //     .freezeWithSigner(signer)
// // // //     .then((tx: any) => tx.signWithSigner(signer))
// // // //     .then((tx: any) => tx.executeWithSigner(signer));
// // // // };
// // // // const executeWithSigner = async (transaction: any) => {
// // // //     // 1. Get the standard Hedera Client
// // // //     const client = getClient();

// // // //     // 2. Freeze the transaction with the client.
// // // //     // This safely populates the required nodeAccountIds without 
// // // //     // modifying your manually set TransactionId.
// // // //     transaction.freezeWith(client);

// // // //     // 3. Sign the transaction using the HashPack signer
// // // //     const signedTx = await signer.signTransaction(transaction);

// // // //     // 4. Execute the transaction on the network
// // // //     return await signedTx.execute(client);
// // // //   };
 

// // //   const formatTxIdForMirror = (txIdStr: string) => {
// // //     return txIdStr
// // //       .replace("@", "-")
// // //       .replace(/\./g, (match, offset, string) => {
// // //         const dotCount = string.slice(0, offset + 1).split('.').length - 1;
// // //         return dotCount <= 2 ? "." : "-";
// // //       });
// // //   };

// // //   const getMirrorNodeUrl = () => {
// // //     return network === "testnet" 
// // //       ? "https://testnet.mirrornode.hedera.com" 
// // //       : "https://mainnet.mirrornode.hedera.com";
// // //   };

// // //   // //  const {
// // //   //     createInscription,
// // //   //     status: inscriptionStatus,
// // //   //     progress: inscriptionProgress,
// // //   //     result: inscriptionResult,
// // //   //     error: inscriptionError,
// // //   //     statusText: inscriptionStatusText,
// // //   //     reset: resetInscription,
// // //   //   // } = useComicInscription({ accountId, signer, network });
  

// // //    /**
// // //    * Poll Mirror Node for token ID with proper retry logic
// // //    * Retries up to 60 times with exponential backoff
// // //    */
 
// // //   // ============================================
// // //   // CREATOR FUNCTIONS
// // //   // ============================================

// // //   /**
// // //    * Step 1: Create Comic Collection
// // //    * Call this after backend uploads comic to IPFS
// // //    */
// // //   // const createComicCollection = async ({
// // //   //   episodeId,
// // //   //   name,
// // //   //   symbol,
// // //   //   maxSupply,
// // //   // }: {
// // //   //   episodeId: string; // From backend (e.g., "ep_001")
// // //   //   name: string;
// // //   //   symbol: string;
// // //   //   maxSupply: number;
// // //   // }) => {
// // //   //   try {
// // //   //     setStatus("processing");
// // //   //     setError(null);
// // //   //     console.log("📚 Creating comic collection:", { episodeId, name, maxSupply });

// // //   //     const tx = new ContractExecuteTransaction()
// // //   //       .setContractId(CONTRACTS.COMIC_CORE)
// // //   //       .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //   //       .setGas(15000000)
// // //   //       .setPayableAmount(new Hbar(50)) // For NFT token creation
// // //   //       .setFunction(
// // //   //         "createComicCollection",
// // //   //         new ContractFunctionParameters()
// // //   //           .addString(episodeId)
// // //   //           .addString(name)
// // //   //           .addString(symbol)
// // //   //           .addString(`${name} Collection`)
// // //   //           .addInt64(maxSupply)
// // //   //           .addInt64(7000000) // Auto-renew period
// // //   //       );

// // //   //     const response = await executeWithSigner(tx);
// // //   //     const txIdStr = response.transactionId.toString();
// // //   //     const receipt = await response.getReceipt(getClient());
// // //   //     console.log("✅ Collection created!");
// // //   //      await new Promise(resolve => setTimeout(resolve, 5000));
      
// // //   //     const txIdFormatted = formatTxIdForMirror(txIdStr);
// // //   //     const mirrorResponse = await fetch(
// // //   //       `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
// // //   //     );
// // //   //     const mirrorData = await mirrorResponse.json();
// // //   //     console.log("Mirror Node data:", mirrorData);
      
// // //   //     const tokenEvmAddress = mirrorData?.call_result 
// // //   //       ? "0x" + mirrorData.call_result.slice(-40) 
// // //   //       : null;
// // //   //     const tokenId = TokenId.fromEvmAddress(0,0,tokenEvmAddress).toString();
// // //   //     // const tokenId = mirrorData?.call_result

// // //   //     console.log("🎉 New Token ID:", tokenId);

// // //   //     setTxId(txIdStr);
// // //   //     setStatus("done");

// // //   //     return {
// // //   //       transactionId: txIdStr,
// // //   //       status: receipt.status.toString(),
// // //   //       tokenId
// // //   //     };
// // //   //   } catch (err: any) {
// // //   //     console.error("❌ Collection creation failed:", err);
// // //   //     setError(err.message);
// // //   //     setStatus("error");
// // //   //     throw err;
// // //   //   }
// // //   // };
// // //   /**
// // //    * Step 1: Create Comic Collection
// // //    * Call this after backend uploads comic to IPFS
// // //    */
// // //  // ============================================
// // //   // METHOD 1: Mirror Node Polling
// // //   // ============================================
 
// // //   const pollMirrorNodeWithRetry = async (
// // //     txIdStr: string,
// // //     maxRetries: number = 20,  // 20 retries * 2 seconds = 40 seconds
// // //     delayMs: number = 2000
// // //   ): Promise<string | null> => {
// // //     const txIdFormatted = formatTxIdForMirror(txIdStr);
// // //     const mirrorNodeUrl = getMirrorNodeUrl();
 
// // //     console.log(`📡 Attempting Mirror Node polling (max ${maxRetries} attempts)...`);
 
// // //     for (let attempt = 1; attempt <= maxRetries; attempt++) {
// // //       try {
// // //         setStatusMessage(`[Mirror Node] Indexing... (Attempt ${attempt}/${maxRetries})`);
 
// // //         const controller = new AbortController();
// // //         const timeoutId = setTimeout(() => controller.abort(), 15000);
 
// // //         console.log(`🔍 Mirror Node polling attempt ${attempt}/${maxRetries}...`);
 
// // //         const response = await fetch(
// // //           `${mirrorNodeUrl}/api/v1/contracts/results/${txIdFormatted}`,
// // //           { signal: controller.signal }
// // //         );
 
// // //         clearTimeout(timeoutId);
 
// // //         // 404 means not indexed yet - this is normal
// // //         if (response.status === 404) {
// // //           console.log(`⏳ Not indexed yet (${attempt}/${maxRetries})`);
// // //           await new Promise((resolve) => setTimeout(resolve, delayMs));
// // //           continue;
// // //         }
 
// // //         if (!response.ok) {
// // //           throw new Error(`Mirror Node returned status ${response.status}`);
// // //         }
 
// // //         const mirrorData = await response.json();
// // //         console.log("✅ Mirror Node response:", mirrorData);
 
// // //         // ============================================
// // //         // Check if call_result is empty
// // //         // ============================================
 
// // //         if (!mirrorData?.call_result || mirrorData.call_result === "0x") {
// // //           console.warn("⚠️ Mirror Node returned empty call_result");
// // //           // Continue to fallback
// // //           return null;
// // //         }
 
// // //         // Extract token EVM address from call_result
// // //         const tokenEvmAddress = "0x" + mirrorData.call_result.slice(-40);
 
// // //         if (!tokenEvmAddress || tokenEvmAddress.length !== 42) {
// // //           console.warn("⚠️ Invalid EVM address extracted");
// // //           return null;
// // //         }
 
// // //         // Convert EVM address to Hedera token ID
// // //         const tokenId = TokenId.fromEvmAddress(0, 0, tokenEvmAddress).toString();
 
// // //         if (!tokenId) {
// // //           console.warn("⚠️ Failed to convert to token ID");
// // //           return null;
// // //         }
 
// // //         console.log("✅ Successfully extracted token ID from Mirror Node:", tokenId);
// // //         return tokenId;
 
// // //       } catch (err: any) {
// // //         console.warn(`⚠️ Mirror Node attempt ${attempt} failed:`, err.message);
 
// // //         // If this is the last attempt, return null to trigger fallback
// // //         if (attempt === maxRetries) {
// // //           console.warn("❌ Mirror Node polling exhausted, will use fallback");
// // //           return null;
// // //         }
 
// // //         // Exponential backoff
// // //         const backoffDelay = attempt > 10 ? delayMs * 2 : delayMs;
// // //         await new Promise((resolve) => setTimeout(resolve, backoffDelay));
// // //       }
// // //     }
 
// // //     return null; // Fallback
// // //   };
 
// // //   // ============================================
// // //   // METHOD 2: Event Logs Fallback
// // //   // ============================================
 
// // //   const extractTokenIdFromLogs = async (response: any): Promise<string | null> => {
// // //     try {
// // //       setStatusMessage("🔄 Mirror Node unavailable, using Event Logs fallback...");
 
// // //       console.log("📝 Attempting to extract token ID from transaction logs...");
 
// // //       const record = await response.getRecord(getClient());
// // //       const logs = record.contractFunctionResult?.logs;
 
// // //       console.log("📋 Transaction logs:", logs);
 
// // //       if (!logs || logs.length === 0) {
// // //         throw new Error("No event logs found in transaction");
// // //       }
 
// // //       // Parse the first log (CollectionCreated event)
// // //       const log = logs[0];
// // //       console.log("📍 Parsing first log...");
 
// // //       if (!log.data || log.data.length === 0) {
// // //         throw new Error("Log data is empty");
// // //       }
 
// // //       // Extract token address from log data
// // //       // The event emits: event CollectionCreated(address indexed tokenAddress, ...)
// // //       const tokenEvmAddress = "0x" + log.data.slice(-40).toString('hex');
 
// // //       console.log("📍 Extracted EVM address from logs:", tokenEvmAddress);
 
// // //       if (!tokenEvmAddress || tokenEvmAddress.length !== 42) {
// // //         throw new Error(`Invalid EVM address: ${tokenEvmAddress}`);
// // //       }
 
// // //       // Convert EVM address to Hedera token ID
// // //       const tokenId = TokenId.fromEvmAddress(0, 0, tokenEvmAddress).toString();
 
// // //       if (!tokenId) {
// // //         throw new Error("Failed to convert EVM address to token ID");
// // //       }
 
// // //       console.log("✅ Successfully extracted token ID from Event Logs:", tokenId);
// // //       return tokenId;
 
// // //     } catch (err: any) {
// // //       console.error("❌ Event Logs fallback failed:", err.message);
// // //       return null;
// // //     }
// // //   };
 
// // //   // ============================================
// // //   // MAIN: Create Comic Collection (Hybrid)
// // //   // ============================================
 
// // //   const createComicCollection = async ({
// // //     episodeId,
// // //     name,
// // //     symbol,
// // //     maxSupply,
// // //   }: {
// // //     episodeId: string;
// // //     name: string;
// // //     symbol: string;
// // //     maxSupply: number;
// // //   }) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       setStatusMessage("Creating NFT collection...");
// // //       setUsedFallback(false);
 
// // //       console.log("📚 Creating comic collection:", {
// // //         episodeId,
// // //         name,
// // //         maxSupply,
// // //         contract: CONTRACTS.COMIC_CORE,
// // //       });
 
// // //       // ============================================
// // //       // Step 1: Execute Transaction
// // //       // ============================================
 
// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_CORE)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         .setGas(15000000)
// // //         .setPayableAmount(new Hbar(50))
// // //         .setFunction(
// // //           "createComicCollection",
// // //           new ContractFunctionParameters()
// // //             .addString(episodeId)
// // //             .addString(name)
// // //             .addString(symbol)
// // //             .addString(`${name} Collection`)
// // //             .addInt64(maxSupply)
// // //             .addInt64(7000000)
// // //         );
 
// // //       setStatusMessage("Signing transaction with HashPack...");
// // //       const response = await executeWithSigner(tx);
// // //       const txIdStr = response.transactionId.toString();
 
// // //       console.log("✅ Transaction signed:", txIdStr);
// // //       setTxId(txIdStr);
 
// // //       // ============================================
// // //       // Step 2: Wait for Receipt
// // //       // ============================================
 
// // //       setStatusMessage("Waiting for transaction confirmation...");
// // //       const receipt = await response.getReceipt(getClient());
 
// // //       console.log("✅ Receipt received - Status:", receipt.status.toString());
 
// // //       if (receipt.status.toString() !== "SUCCESS") {
// // //         throw new Error(`Transaction failed with status: ${receipt.status.toString()}`);
// // //       }
 
// // //       // ============================================
// // //       // Step 3: Try Mirror Node First
// // //       // ============================================
 
// // //       setStatusMessage("Attempting to index via Mirror Node...");
// // //       let tokenId = await pollMirrorNodeWithRetry(txIdStr);
 
// // //       // ============================================
// // //       // Step 4: Fallback to Event Logs
// // //       // ============================================
 
// // //       if (!tokenId) {
// // //         console.log("⚠️ Mirror Node failed, falling back to Event Logs...");
// // //         setUsedFallback(true);
// // //         tokenId = await extractTokenIdFromLogs(response);
// // //       }
 
// // //       // ============================================
// // //       // Step 5: Handle Result
// // //       // ============================================
 
// // //       if (!tokenId) {
// // //         throw new Error(
// // //           "Failed to extract token ID from both Mirror Node and Event Logs. " +
// // //           "Transaction may have failed. Check contract execution."
// // //         );
// // //       }
 
// // //       console.log(
// // //         `🎉 Collection created successfully! ${usedFallback ? "(via Event Logs)" : "(via Mirror Node)"}`
// // //       );
 
// // //       setStatus("done");
// // //       setStatusMessage(
// // //         usedFallback
// // //           ? "✅ Collection created! (Indexed via Event Logs)"
// // //           : "✅ Collection created! (Indexed via Mirror Node)"
// // //       );
 
// // //       return {
// // //         transactionId: txIdStr,
// // //         status: receipt.status.toString(),
// // //         tokenId,
// // //         indexedVia: usedFallback ? "event-logs" : "mirror-node",
// // //       };
 
// // //     } catch (err: any) {
// // //       console.error("❌ Collection creation failed:", err.message);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       setStatusMessage(`Error: ${err.message}`);
// // //       throw err;
// // //     }
// // //   };

// // // // const createComicCollection = async ({
// // // //     episodeId,
// // // //     name,
// // // //     symbol,
// // // //     maxSupply,
// // // //   }: {
// // // //     episodeId: string;
// // // //     name: string;
// // // //     symbol: string;
// // // //     maxSupply: number;
// // // //   }) => {
// // // //     try {
// // // //       setStatus("processing");
// // // //       setError(null);
// // // //       console.log("📚 Creating comic collection:", { episodeId, name, maxSupply });

// // // //       const tx = new ContractExecuteTransaction()
// // // //         .setContractId(CONTRACTS.COMIC_CORE)
// // // //         // ✅ MUST BE INCLUDED:
// // // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // // //         .setGas(15000000)
// // // //         .setPayableAmount(new Hbar(30)) // For NFT token creation
// // // //         .setFunction(
// // // //           "createComicCollection",
// // // //           new ContractFunctionParameters()
// // // //             .addString(episodeId)
// // // //             .addString(name)
// // // //             .addString(symbol)
// // // //             .addString(`${name} Collection`)
// // // //             .addInt64(maxSupply)
// // // //             .addInt64(7000000) // Auto-renew period
// // // //         );

// // // //       const response = await executeWithSigner(tx);
// // // //       console.log('response Tx:', response);
// // // //       const txIdStr = response.transactionId.toString();
// // // //       console.log("TransactionId:", txIdStr);
// // // //       const receipt = await response.getReceipt(getClient());
// // // //       console.log("✅ Collection created on ledger! Status:", receipt.status.toString());
      
// // // //       const txIdFormatted = formatTxIdForMirror(txIdStr);
// // // //       console.log("📡 Polling Mirror Node for Token ID:", txIdFormatted);
      
// // // //       // 🔄 SMART POLLING LOOP (Checks every 2 seconds for up to 2 minutes)
// // // //       let tokenEvmAddress = null;
// // // //       let attempts = 0;
// // // //       const maxAttempts = 60; 
      
// // // //       while (attempts < maxAttempts && !tokenEvmAddress) {
// // // //         attempts++;
// // // //         await new Promise(resolve => setTimeout(resolve, 2000)); 
        
// // // //         try {
// // // //           const mirrorResponse = await fetch(
// // // //             `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
// // // //           );
          
// // // //           if (mirrorResponse.ok) {
// // // //             const mirrorData = await mirrorResponse.json();
// // // //             if (mirrorData?.call_result) {
// // // //               tokenEvmAddress = "0x" + mirrorData.call_result.slice(-40);
// // // //               console.log(`✅ Mirror Node indexed result on attempt ${attempts}`);
// // // //             }
// // // //           } else {
// // // //             console.log(`⏳ Mirror Node not ready yet (Attempt ${attempts}/${maxAttempts})...`);
// // // //           }
// // // //         } catch (mirrorError) {
// // // //           console.log("⚠️ Fetch error during polling, retrying...");
// // // //         }
// // // //       }

// // // //       if (!tokenEvmAddress) {
// // // //         throw new Error("Transaction succeeded, but timed out waiting for the Mirror Node to index.");
// // // //       }

// // // //       const tokenId = TokenId.fromEvmAddress(0, 0, tokenEvmAddress).toString();
// // // //       console.log("🎉 New Token ID:", tokenId);

// // // //       setTxId(txIdStr);
// // // //       setStatus("done");

// // // //       return {
// // // //         transactionId: txIdStr,
// // // //         status: receipt.status.toString(),
// // // //         tokenId
// // // //       };
// // // //     } catch (err: any) {
// // // //       console.error("❌ Collection creation failed:", err);
// // // //       setError(err.message);
// // // //       setStatus("error");
// // // //       throw err;
// // // //     }
// // // //   };

// // //   // ============================================
// // //   // PATH 1: DIRECT LISTING
// // //   // ============================================

// // //   /**
// // //    * Create Direct Listing (mints + lists for sale immediately)
// // //    */
// // //   // const createDirectListing = async ({
// // //   //   episodeId,
// // //   //   quantity,
// // //   //   pricePerNFT,
// // //   //   metadata,
// // //   // }: {
// // //   //   episodeId: string;
// // //   //   quantity: number;
// // //   //   pricePerNFT: number; // in HBAR
// // //   //   metadata: string; // "hcs://1/topicId"
// // //   // }) => {
// // //   //   try {
// // //   //     setStatus("processing");
// // //   //     setError(null);
// // //   //     // console.log("💼 Starting Inscription process...");
// // //   //     // const inscriptionResult = await createInscription(metadata, episodeId);
// // //   //     // console.log("✅ Inscription created:", inscriptionResult);
// // //   //     console.log("🏪 Proceeding to create direct listing:", { episodeId, quantity, pricePerNFT });
// // //   //     console.log("🏪 Creating direct listing:", { episodeId, quantity, pricePerNFT });

// // //   //     const priceInTinybars = Hbar.from(pricePerNFT, HbarUnit.Hbar).toTinybars();
// // //   //       // const topicId = inscriptionResult.topicId || '';
// // //   //       // console.log("🎉 Inscription Topic ID:", topicId);
// // //   //       // const metadataHRL = `hcs://1/${topicId}`;
// // //   //         // console.log("Metadata HRL:", metadataHRL);
// // //   //     //  const BATCH_SIZE = 10;
// // //   //     // let allSerials: number[] = [];
// // //   //     // let mintedCount = 0;
// // //   //     // for (let batchStart = 0; batchStart < quantity; batchStart += BATCH_SIZE) {
// // //   //     //         const batchEnd = Math.min(batchStart + BATCH_SIZE, quantity);
// // //   //     //         const batchCount = batchEnd - batchStart;
              
// // //   //     //         console.log(`📦 Minting batch: NFTs ${batchStart + 1}-${batchEnd} (${batchCount} NFTs)`);
              
// // //   //             // Create metadata buffers for this batch only
// // //   //             // const metadataBuffers = Array(batchCount).fill(
// // //   //             //   Buffer.from(metadata || "")
// // //   //             // );
// // //   //     const tx = new ContractExecuteTransaction()
// // //   //       .setContractId(CONTRACTS.COMIC_SALES)
// // //   //       .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //   //       .setGas(5000000 + (quantity * 500000))
// // //   //       .setFunction(
// // //   //         "createDirectListing",
// // //   //         new ContractFunctionParameters()
// // //   //           .addString(episodeId)
// // //   //           .addUint256(quantity)
// // //   //           .addUint256(priceInTinybars)
// // //   //            .addBytes(Buffer.from(metadata))
// // //   //             //.addBytesArray(metadataBuffers)
// // //   //       );

// // //   //     const response = await executeWithSigner(tx);
// // //   //     const txIdStr = response.transactionId.toString();
// // //   //     const receipt = await response.getReceipt(getClient());

// // //   //     console.log("✅ Direct listing created!");
      

// // //   //     setTxId(txIdStr);
// // //   //     setStatus("done");
      
// // //   //     // Get listing ID from mirror node (optional)
// // //   //     await new Promise(resolve => setTimeout(resolve, 5000));
// // //   //     const txIdFormatted = formatTxIdForMirror(txIdStr);
// // //   //     const mirrorResponse = await fetch(
// // //   //       `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
// // //   //     );
// // //   //     const mirrorData = await mirrorResponse.json();
// // //   //     console.log("Mirror Node data:", mirrorData);
      
// // //   //     let listingId: string | undefined;
// // //   //     if (mirrorData?.call_result) {
// // //   //       listingId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
// // //   //     }
    

// // //   //     return {
// // //   //       transactionId: txIdStr,
// // //   //       status: receipt.status.toString(),
// // //   //       listingId,
// // //   //     };
// // //   //      // metadataHRL
// // //   //     // };
// // //   //   } catch (err: any) {
// // //   //     console.error("❌ Direct listing failed:", err);
// // //   //     setError(err.message);
// // //   //     setStatus("error");
// // //   //     throw err;
// // //   //   }
// // //   // };

// // //     /**
// // //    * Create Direct Listing (mints + lists for sale immediately)
// // //    * NOW WITH BATCH SUPPORT FOR MINTING
// // //    */
// // //   const createDirectListing = async ({
// // //     episodeId,
// // //     quantity,
// // //     pricePerNFT,
// // //     metadata,
// // //   }: {
// // //     episodeId: string;
// // //     quantity: number;
// // //     pricePerNFT: number; // in HBAR
// // //     metadata: string; // "hcs://1/topicId"
// // //   }) => {
// // //     let lastTxId = '';
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       setMintProgress(0);
// // //       console.log("🏪 Creating direct listing with batch minting:", { episodeId, quantity, pricePerNFT });

// // //       const priceInTinybars = Hbar.from(pricePerNFT, HbarUnit.Hbar).toTinybars();
      
// // //       // Constants for batch processing
// // //       const BATCH_SIZE = 10; // Hedera's limit
// // //       const totalBatches = Math.ceil(quantity / BATCH_SIZE);
// // //       let completedBatches = 0;

// // //       console.log(`📦 Will mint in ${totalBatches} batches of up to ${BATCH_SIZE} NFTs each`);

// // //       // Process in batches
// // //       for (let batchStart = 0; batchStart < quantity; batchStart += BATCH_SIZE) {
// // //         const batchEnd = Math.min(batchStart + BATCH_SIZE, quantity);
// // //         const batchQuantity = batchEnd - batchStart;
// // //         const currentBatch = completedBatches + 1;
        
// // //         console.log(`📦 Processing batch ${currentBatch}/${totalBatches}: NFTs ${batchStart + 1}-${batchEnd} (${batchQuantity} NFTs)`);
// // //         //setMintStatusText(`Minting batch ${currentBatch}/${totalBatches} (${batchQuantity} NFTs)...`);

// // //         try {
// // //           const tx = new ContractExecuteTransaction()
// // //             .setContractId(CONTRACTS.COMIC_SALES)
// // //             .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //             .setGas(5000000 + (batchQuantity * 500000))
// // //             .setFunction(
// // //               "createDirectListing",
// // //               new ContractFunctionParameters()
// // //                 .addString(episodeId)
// // //                 .addUint256(batchQuantity)
// // //                 .addUint256(priceInTinybars)
// // //                 .addBytes(Buffer.from(metadata))
// // //             );

// // //           const response = await executeWithSigner(tx);
// // //           const txIdStr = response.transactionId.toString();
// // //           const receipt = await response.getReceipt(getClient());
// // //           console.log("✅ Batch direct listing created!", receipt);
// // //            lastTxId = txIdStr;

// // //           console.log(`✅ Batch ${currentBatch}/${totalBatches} completed! Transaction: ${txIdStr}`);
          
// // //           completedBatches++;
// // //           const progress = (completedBatches / totalBatches) * 100;
// // //           setMintProgress(progress);

// // //           // Add delay between batches to avoid rate limiting
// // //           if (batchEnd < quantity) {
// // //             console.log("⏳ Waiting 3 seconds before next batch...");
// // //             await new Promise(resolve => setTimeout(resolve, 3000));
// // //           }

// // //           // Store the last transaction ID for return
// // //           // if (batchEnd >= quantity) {
// // //           //   setTxId(txIdStr);
// // //           // }

// // //         } catch (batchError: any) {
// // //           console.error(`❌ Batch ${currentBatch}/${totalBatches} failed:`, batchError);
// // //           throw new Error(`Batch minting failed at NFTs ${batchStart + 1}-${batchEnd}: ${batchError.message}`);
// // //         }
// // //       }

// // //       console.log("✅ All batches completed! Direct listing created successfully!");
// // //       setMintProgress(100);
// // //       setTxId(lastTxId);
// // //       // setMintStatusText(`Successfully minted and listed ${quantity} NFTs!`);
// // //       setStatus("done");
      
// // //       // Get listing ID from mirror node for the last transaction
// // //       await new Promise(resolve => setTimeout(resolve, 5000));
// // //       const txIdFormatted = formatTxIdForMirror(lastTxId);
// // //       const mirrorResponse = await fetch(
// // //         `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
// // //       );
// // //       const mirrorData = await mirrorResponse.json();
// // //       console.log("Mirror Node data:", mirrorData);
      
// // //       let listingId: string | undefined;
// // //       if (mirrorData?.call_result) {
// // //         listingId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
// // //       }

// // //       return {
// // //         transactionId: lastTxId,
// // //         status: "SUCCESS",
// // //         listingId,
// // //         totalMinted: quantity,
// // //         batches: totalBatches,
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Direct listing with batch minting failed:", err);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       // setMintProgress(0);
// // //       throw err;
// // //     }
// // //   };
// // //   /**
// // //    * Purchase from Direct Listing
// // //    */
// // //   const purchaseFromListing = async ({
// // //     listingId,
// // //     quantity,
// // //     pricePerNFT,
// // //   }: {
// // //     listingId: number;
// // //     quantity: number;
// // //     pricePerNFT: number; // in HBAR
// // //   }) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       console.log("💳 Purchasing from listing:", { listingId, quantity });

// // //       const totalPrice = pricePerNFT * quantity;

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_SALES)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         // .setGas(2000000)
// // //         .setGas(5000000 + (quantity * 500000))
// // //         .setPayableAmount(new Hbar(totalPrice, HbarUnit.Hbar))
// // //         .setFunction(
// // //           "purchaseFromListing",
// // //           new ContractFunctionParameters()
// // //             .addUint256(typeof listingId === "string" ? parseInt(listingId) : listingId)
// // //             .addUint256(quantity)
// // //         );

// // //       const response = await executeWithSigner(tx);
// // //       const txIdStr = response.transactionId.toString();
// // //       const receipt = await response.getReceipt(getClient());

// // //       console.log("✅ Purchase successful! You can now read this comic!");
// // //       setTxId(txIdStr);
// // //       setStatus("done");

// // //       return {
// // //         transactionId: txIdStr,
// // //         status: receipt.status.toString(),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Purchase failed:", err);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       throw err;
// // //     }
// // //   };

// // //   // ============================================
// // //   // PATH 2: CAMPAIGN/DROP SYSTEM
// // //   // ============================================

// // //   /**
// // //    * Create Campaign (Public/Whitelist/Scheduled)
// // //    */
// // //   const createCampaign = async ({
// // //     episodeId,
// // //     campaignType,
// // //     mintPrice,
// // //     maxSupply,
// // //     maxPerWallet,
// // //     metadata,
// // //   }: {
// // //     episodeId: string;
// // //     campaignType: CampaignType;
// // //     mintPrice: number; // in HBAR
// // //     maxSupply: number;
// // //     maxPerWallet: number;
// // //     metadata: string;
// // //   }) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       console.log("🎯 Creating campaign:", { episodeId, campaignType, maxSupply });

// // //       const priceInTinybars = Hbar.from(mintPrice, HbarUnit.Hbar).toTinybars();

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_SALES)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         .setGas(4000000)
// // //         .setFunction(
// // //           "createCampaign",
// // //           new ContractFunctionParameters()
// // //             .addString(episodeId)
// // //             .addUint8(campaignType)
// // //             .addUint256(priceInTinybars)
// // //             .addUint256(maxSupply)
// // //             .addUint256(maxPerWallet)
// // //             .addBytes(Buffer.from(metadata))
// // //         );

// // //       const response = await executeWithSigner(tx);
// // //       const txIdStr = response.transactionId.toString();
// // //       const receipt = await response.getReceipt(getClient());
// // //         await new Promise(resolve => setTimeout(resolve, 5000));
// // //       const txIdFormatted = formatTxIdForMirror(txIdStr);
// // //       const mirrorResponse = await fetch(
// // //         `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
// // //       );
// // //       const mirrorData = await mirrorResponse.json();
// // //       console.log("Mirror Node data:", mirrorData);
      
// // //       let campaignId: string | undefined;
// // //       if (mirrorData?.call_result) {
// // //         campaignId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
// // //       }
// // //       console.log("🎉 New Campaign ID:", campaignId);
// // //       setTxId(txIdStr);
// // //       setStatus("done");
// // //       console.log("✅ Campaign created!");
     

// // //       return {
// // //         transactionId: txIdStr,
// // //         status: receipt.status.toString(),
// // //         campaignId: campaignId
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Campaign creation failed:", err);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Add addresses to whitelist (for WHITELIST campaigns)
// // //    */
// // //   const addToWhitelist = async ({
// // //     campaignId,
// // //     addresses,
// // //     allocations,
// // //   }: {
// // //     campaignId: number;
// // //     addresses: string[];
// // //     allocations: number[];
// // //   }) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       console.log("📋 Adding to whitelist:", { campaignId, count: addresses.length });

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_SALES)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         .setGas(1000000 + (addresses.length * 100000))
// // //         .setFunction(
// // //           "addToWhitelist",
// // //           new ContractFunctionParameters()
// // //             .addUint256(campaignId)
// // //             .addAddressArray(addresses)
// // //             .addUint256Array(allocations)
// // //         );

// // //       const response = await executeWithSigner(tx);
// // //       const receipt = await response.getReceipt(getClient());

// // //       console.log("✅ Whitelist updated!");
// // //       setTxId(response.transactionId.toString());
// // //       setStatus("done");

// // //       return {
// // //         transactionId: response.transactionId.toString(),
// // //         status: receipt.status.toString(),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Whitelist update failed:", err);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Add phase (for SCHEDULED campaigns)
// // //    */
// // //   const addPhase = async ({
// // //     campaignId,
// // //     phaseType,
// // //     startTime,
// // //     endTime,
// // //     mintPrice,
// // //     maxPerWallet,
// // //     phaseSupply,
// // //   }: {
// // //     campaignId: number;
// // //     phaseType: PhaseType;
// // //     startTime: number; // Unix timestamp
// // //     endTime: number;
// // //     mintPrice: number; // in HBAR
// // //     maxPerWallet: number;
// // //     phaseSupply: number;
// // //   }) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       console.log("⏰ Adding phase:", { campaignId, phaseType });

// // //       const priceInTinybars = Hbar.from(mintPrice, HbarUnit.Hbar).toTinybars();

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_SALES)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         .setGas(2000000)
// // //         .setFunction(
// // //           "addPhase",
// // //           new ContractFunctionParameters()
// // //             .addUint256(campaignId)
// // //             .addUint8(phaseType)
// // //             .addUint256(startTime)
// // //             .addUint256(endTime)
// // //             .addUint256(priceInTinybars)
// // //             .addUint256(maxPerWallet)
// // //             .addUint256(phaseSupply)
// // //         );

// // //       const response = await executeWithSigner(tx);
// // //       const receipt = await response.getReceipt(getClient());

// // //       console.log("✅ Phase added!");
// // //       setTxId(response.transactionId.toString());
// // //       setStatus("done");

// // //       return {
// // //         transactionId: response.transactionId.toString(),
// // //         status: receipt.status.toString(),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Phase add failed:", err);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Mint from Campaign
// // //    */
// // //   const mintFromCampaign = async ({
// // //     campaignId,
// // //     phaseId = 0,
// // //     quantity,
// // //     mintPrice,
// // //   }: {
// // //     campaignId: number;
// // //     phaseId?: number; // 0 for PUBLIC/WHITELIST, specific ID for SCHEDULED
// // //     quantity: number;
// // //     mintPrice: number; // in HBAR
// // //   }) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       console.log("🎨 Minting from campaign:", { campaignId, quantity });

// // //       const totalPrice = mintPrice * quantity;

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_SALES)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         .setGas(4000000 + (quantity * 500000))
// // //         .setPayableAmount(new Hbar(totalPrice, HbarUnit.Hbar))
// // //         .setFunction(
// // //           "mint",
// // //           new ContractFunctionParameters()
// // //             .addUint256(campaignId)
// // //             .addUint256(phaseId)
// // //             .addUint256(quantity)
// // //         );

// // //       const response = await executeWithSigner(tx);
// // //       const txIdStr = response.transactionId.toString();
// // //       const receipt = await response.getReceipt(getClient());

// // //       console.log("✅ Mint successful! You can now read this comic!");
// // //       setTxId(txIdStr);
// // //       setStatus("done");

// // //       return {
// // //         transactionId: txIdStr,
// // //         status: receipt.status.toString(),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Mint failed:", err);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       throw err;
// // //     }
// // //   };

// // //   // ============================================
// // //   // MARKETPLACE - RESALE
// // //   // ============================================

// // //   /**
// // //    * List NFT for Resale
// // //    */
// // //   const listForResale = async ({
// // //     tokenAddress,
// // //     serialNumber,
// // //     priceInHbar,
// // //   }: {
// // //     tokenAddress: string;
// // //     serialNumber: number;
// // //     priceInHbar: number;
// // //   }) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       console.log("📝 Listing for resale:", { serialNumber, priceInHbar });

// // //       const priceInTinybars = Hbar.from(priceInHbar, HbarUnit.Hbar).toTinybars();

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         .setGas(5000000)
// // //         .setFunction(
// // //           "depositAndListForResale",
// // //           new ContractFunctionParameters()
// // //             .addAddress(TokenId.fromString(tokenAddress).toEvmAddress())
// // //             .addInt64(serialNumber)
// // //             .addUint256(priceInTinybars)
// // //         );

// // //       const response = await executeWithSigner(tx);
// // //       const txIdStr = response.transactionId.toString();
// // //       const receipt = await response.getReceipt(getClient());

// // //       console.log("✅ Listed for resale!");
// // //       setTxId(txIdStr);
// // //       setStatus("done");

// // //       // Get listing ID
// // //       await new Promise(resolve => setTimeout(resolve, 5000));
// // //       const txIdFormatted = formatTxIdForMirror(txIdStr);
// // //       const mirrorResponse = await fetch(
// // //         `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
// // //       );
// // //       const mirrorData = await mirrorResponse.json();
      
// // //       let listingId: string | undefined;
// // //       if (mirrorData?.call_result) {
// // //         listingId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
// // //       }
      
// // //           const serials: number[] = [];
// // //           let allSerials: number[] = [];
// // //           if (mirrorData?.call_result) {
// // //             const result = mirrorData.call_result.slice(2);
// // //             const arrayLengthHex = result.slice(64, 128);
// // //             const arrayLength = parseInt(arrayLengthHex, 16);
            
// // //             for (let i = 0; i < arrayLength; i++) {
// // //               const start = 128 + (i * 64);
// // //               const serialHex = result.slice(start, start + 64);
// // //               const serial = parseInt(serialHex, 16);
// // //               if (serial > 0) serials.push(serial);
// // //             }
          
// // //             allSerials = allSerials.concat(serials);
// // //             console.log("🎉 Minted serials:", serials);
// // //           }
// // //       return {
// // //         transactionId: txIdStr,
// // //         status: receipt.status.toString(),
// // //         listingId,
// // //         serials: allSerials
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ List for resale failed:", err);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Batch list multiple NFTs for resale
// // //    */
// // //   const batchListForResale = async ({
// // //     tokenAddress,
// // //     serialNumbers,
// // //     prices,
// // //   }: {
// // //     tokenAddress: string;
// // //     serialNumbers: number[];
// // //     prices: number[]; // in HBAR
// // //   }) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       console.log("📝 Batch listing for resale:", { count: serialNumbers.length });

// // //       const pricesInTinybars = prices.map(p => Hbar.from(p, HbarUnit.Hbar).toTinybars());

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         .setGas(3000000 + (serialNumbers.length * 300000))
// // //         .setFunction(
// // //           "batchDepositAndListForResale",
// // //           new ContractFunctionParameters()
// // //             .addAddress(TokenId.fromString(tokenAddress).toEvmAddress())
// // //             .addInt64Array(serialNumbers)
// // //             .addUint256Array(pricesInTinybars)
// // //         );

// // //       const response = await executeWithSigner(tx);
// // //       const txIdStr = response.transactionId.toString();
// // //       const receipt = await response.getReceipt(getClient());

// // //       console.log("✅ Batch listed for resale!");
// // //       setTxId(txIdStr);
// // //       setStatus("done");

// // //       return {
// // //         transactionId: txIdStr,
// // //         status: receipt.status.toString(),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Batch list failed:", err);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Purchase from Marketplace (Resale)
// // //    */
// // //   const purchaseFromMarketplace = async ({
// // //     listingId,
// // //     priceInHbar,
// // //   }: {
// // //     listingId: number;
// // //     priceInHbar: number;
// // //   }) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);
// // //       console.log("💳 Purchasing from marketplace:", { listingId });

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         .setGas(5000000)
// // //         .setPayableAmount(new Hbar(priceInHbar, HbarUnit.Hbar))
// // //         .setFunction(
// // //           "purchaseNFT",
// // //           new ContractFunctionParameters()
// // //             .addUint256(typeof listingId === "string" ? parseInt(listingId) : listingId)
// // //         );

// // //       const response = await executeWithSigner(tx);
// // //       const txIdStr = response.transactionId.toString();
// // //       const receipt = await response.getReceipt(getClient());

// // //       console.log("✅ Purchase successful! Reading access transferred!");
// // //       setTxId(txIdStr);
// // //       setStatus("done");

// // //       return {
// // //         transactionId: txIdStr,
// // //         status: receipt.status.toString(),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Purchase failed:", err);
// // //       setError(err.message);
// // //       setStatus("error");
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Cancel Listing
// // //    */
// // //   const cancelListing = async (listingId: number) => {
// // //     try {
// // //       setStatus("processing");
// // //       setError(null);

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
// // //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// // //         .setGas(2000000)
// // //         .setFunction(
// // //           "cancelListing",
// // //           new ContractFunctionParameters()
// // //             .addUint256(listingId)
// // //         );

// // //       const response = await executeWithSigner(tx);
// // //       const receipt = await response.getReceipt(getClient());

// // //       setTxId(response.transactionId.toString());
// // //       setStatus("done");

// // //       return {
// // //         transactionId: response.transactionId.toString(),
// // //         status: receipt.status.toString(),
// // //       };
// // //     } catch (err: any) {
// // //       setError(err.message);
// // //       setStatus("error");
// // //       throw err;
// // //     }
// // //   };

// // //   // ============================================
// // //   // QUERY FUNCTIONS
// // //   // ============================================

// // //  const canReadComic = async (episodeId: string, userAddress: string): Promise<boolean> => {
// // //   try {
// // //     const abi = ['function canReadComic(string episodeId, address user) external view returns (bool)'];
// // //     const abiInterface = new ethers.Interface(abi);
// // //     const encodedData = abiInterface.encodeFunctionData('canReadComic', [episodeId, userAddress]);

// // //     // Convert contract ID to EVM address (e.g., 0.0.1234 → 0x00000000000000000000000000000000000004d2)
// // //     // const contractAddress = ContractId.fromString(CONTRACTS.COMIC_CORE).toEvmAddress();
// // // const contractAddress = mirrorNodeService.hederaIdToEvmAddress(CONTRACTS.COMIC_CORE);
// // //     const response = await fetch('https://testnet.mirrornode.hedera.com/api/v1/contracts/call', {
// // //       method: 'POST',
// // //       headers: { 'Content-Type': 'application/json' },
// // //       body: JSON.stringify({
// // //         block: 'latest',
// // //         data: encodedData,
// // //         to: contractAddress
// // //       })
// // //     });

// // //     const result = await response.json();
// // //     console.log('Raw canReadComic result:', result);
    
// // //     // Decode the boolean result
// // //     const decoded = abiInterface.decodeFunctionResult('canReadComic', result.result);
// // //     console.log('Decoded canReadComic result:', decoded[0]);
    
// // //     return decoded[0];
// // //   } catch (err) {
// // //     console.error('❌ Query failed:', err);
// // //     return false;
// // //   }
// // // };


// // //   /**
// // //    * Check if user can read comic (for backend)
// // //    */
// // //   // const canReadComic = async (episodeId: string, userAddress: string): Promise<boolean> => {
// // //   //   try {
// // //   //     const client = Client.forName(network);

// // //   //     const query = new ContractCallQuery()
// // //   //       .setContractId(CONTRACTS.COMIC_CORE)
// // //   //       .setGas(100000)
// // //   //       .setFunction(
// // //   //         "canReadComic",
// // //   //         new ContractFunctionParameters()
// // //   //           .addString(episodeId)
// // //   //           .addAddress(userAddress)
// // //   //       );

// // //   //     const result = await query.execute(client);
// // //   //     return result.getBool(0);
// // //   //   } catch (err: any) {
// // //   //     console.error("❌ Query failed:", err);
// // //   //     return false;
// // //   //   }
// // //   // };

// // //   /**
// // //    * Get episode details
// // //    */
// // //   const getEpisode = async (episodeId: string) => {
// // //     try {
// // //       const client = Client.forName(network);

// // //       const query = new ContractCallQuery()
// // //         .setContractId(CONTRACTS.COMIC_CORE)
// // //         .setGas(100000)
// // //         .setFunction(
// // //           "getEpisode",
// // //           new ContractFunctionParameters()
// // //             .addString(episodeId)
// // //         );

// // //       const result = await query.execute(client);

// // //       return {
// // //         tokenAddress: result.getAddress(0),
// // //         creator: result.getAddress(1),
// // //         name: result.getString(2),
// // //         maxSupply: Number(result.getInt64(3)),
// // //         currentSupply: Number(result.getInt64(4)),
// // //         exists: result.getBool(5),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Query failed:", err);
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Get campaign details
// // //    */
// // //   const getCampaign = async (campaignId: number) => {
// // //     try {
// // //       const client = Client.forName(network);

// // //       const query = new ContractCallQuery()
// // //         .setContractId(CONTRACTS.COMIC_SALES)
// // //         .setGas(150000)
// // //         .setFunction(
// // //           "getCampaign",
// // //           new ContractFunctionParameters()
// // //             .addUint256(campaignId)
// // //         );

// // //       const result = await query.execute(client);

// // //       const campaignTypeNum = Number(result.getUint8(2));
// // //       const campaignTypeMap: { [key: number]: CampaignType } = {
// // //         0: CampaignType.PUBLIC,
// // //         1: CampaignType.WHITELIST,
// // //         2: CampaignType.SCHEDULED,
// // //       };
      
// // //       return {
// // //         episodeId: result.getString(0),
// // //         creator: result.getAddress(1),
// // //         campaignType: campaignTypeMap[campaignTypeNum] || CampaignType.PUBLIC,
// // //         mintPrice: result.getUint256(3).toString(),
// // //         maxSupply: result.getUint256(4).toString(),
// // //         totalMinted: result.getUint256(5).toString(),
// // //         isActive: result.getBool(6),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Query failed:", err);
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Get direct listing details
// // //    */
// // //   const getDirectListing = async (listingId: number) => {
// // //     try {
// // //       const client = Client.forName(network);

// // //       const query = new ContractCallQuery()
// // //         .setContractId(CONTRACTS.COMIC_SALES)
// // //         .setGas(100000)
// // //         .setFunction(
// // //           "getDirectListing",
// // //           new ContractFunctionParameters()
// // //             .addUint256(listingId)
// // //         );

// // //       const result = await query.execute(client);

// // //       return {
// // //         episodeId: result.getString(0),
// // //         creator: result.getAddress(1),
// // //         pricePerNFT: result.getUint256(2).toString(),
// // //         available: result.getUint256(3).toString(),
// // //         isActive: result.getBool(4),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Query failed:", err);
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Get marketplace listing details
// // //    */
// // //   const getMarketplaceListing = async (listingId: number) => {
// // //     try {
// // //       const client = Client.forName(network);

// // //       const query = new ContractCallQuery()
// // //         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
// // //         .setGas(100000)
// // //         .setFunction(
// // //           "getListing",
// // //           new ContractFunctionParameters()
// // //             .addUint256(listingId)
// // //         );
// // //        const response = await executeWithSigner(query);
// // //       const result = await response.execute(client);
// // //       console.log("Marketplace listing result:", result);

// // //       return {
// // //         tokenAddress: result.getAddress(0),
// // //         serialNumber: Number(result.getInt64(1)),
// // //         seller: result.getAddress(2),
// // //         price: result.getUint256(3).toString(),
// // //         isActive: result.getBool(4),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Query failed:", err);
// // //       throw err;
// // //     }
// // //   };

// // //   /**
// // //    * Get current phase for scheduled campaign
// // //    */
// // //   const getCurrentPhase = async (campaignId: number) => {
// // //     try {
// // //       const client = Client.forName(network);

// // //       const query = new ContractCallQuery()
// // //         .setContractId(CONTRACTS.COMIC_SALES)
// // //         .setGas(200000)
// // //         .setFunction(
// // //           "getCurrentPhase",
// // //           new ContractFunctionParameters()
// // //             .addUint256(campaignId)
// // //         );

// // //       const result = await query.execute(client);

// // //       return {
// // //         phaseId: Number(result.getUint256(0)),
// // //         exists: result.getBool(1),
// // //       };
// // //     } catch (err: any) {
// // //       console.error("❌ Query failed:", err);
// // //       throw err;
// // //     }
// // //   };

// // //   return {
// // //     // Creator functions
// // //     createComicCollection,
// // //     createDirectListing,
// // //     createCampaign,
// // //     addToWhitelist,
// // //     addPhase,
    
// // //     // User functions - Buying
// // //     purchaseFromListing,
// // //     mintFromCampaign,
    
// // //     // User functions - Reselling
// // //     listForResale,
// // //     batchListForResale,
// // //     purchaseFromMarketplace,
// // //     cancelListing,
    
// // //     // Query functions
// // //     canReadComic,
// // //     getEpisode,
// // //     getCampaign,
// // //     getDirectListing,
// // //     getMarketplaceListing,
// // //     getCurrentPhase,
    
// // //     // State
// // //     status,
// // //     error,
// // //     txId,
// // //     statusMessage,
// // //     usedFallback,
// // //   };
// // // }

// // // export default useComicPlatform;
// // // function setMintProgress(progress: number) {
// // //   if (Number.isNaN(progress)) return;
// // //   const clamped = Math.max(0, Math.min(100, progress));
// // //   console.debug("Mint progress:", clamped);
// // // }
// // // // function setMintStatusText(text: string) {
// // // //   if (!text) return;
// // // //   console.debug("Mint status:", text);
// // // // }
// // // // function setMintStatusText(arg0: string) {
// // // //   throw new Error("Function not implemented.");
// // // // }

// import { useState } from "react";
// import {
//   ContractExecuteTransaction,
//   Client,
//   ContractFunctionParameters,
//   AccountId,
//   ContractId,
//   TransactionId,
//   TransactionReceiptQuery,
//   TransactionRecordQuery,
//   ContractCallQuery,
//   Hbar,
//   HbarUnit,
//   TokenId,
// } from "@hashgraph/sdk";
// import { ethers } from "ethers";
// import MirrorNodeService from "./MirrorNodeService";

// // ============================================
// // CONTRACT ADDRESSES
// // ============================================
// const CONTRACTS = {
//   COMIC_CORE: "0.0.7806656",
//   COMIC_SALES: "0.0.7829668",
//   COMIC_MARKETPLACE: "0.0.7829656",
// };

// interface UseComicPlatformProps {
//   accountId: string;
//   signer: any;
//   network?: "testnet" | "mainnet";
// }

// export enum CampaignType {
//   PUBLIC = 0,
//   WHITELIST = 1,
//   SCHEDULED = 2,
// }

// export enum PhaseType {
//   WHITELIST = 0,
//   PUBLIC = 1,
// }

// export function useComicPlatform({
//   accountId,
//   signer,
//   network = "testnet",
// }: UseComicPlatformProps) {
//   const mirrorNodeService = new MirrorNodeService(network);

//   const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
//   const [error, setError] = useState<string | null>(null);
//   const [txId, setTxId] = useState<string | null>(null);
//   const [statusMessage, setStatusMessage] = useState<string>("");
//   const [usedFallback, setUsedFallback] = useState<boolean>(false);

//   // ============================================
//   // HELPER FUNCTIONS
//   // ============================================

//   /**
//    * Returns a plain Hedera SDK client (NOT routed through DAppSigner).
//    * Use this for ALL read operations: getReceipt, getRecord, ContractCallQuery.
//    * The DAppSigner only supports signing/submitting transactions, never queries.
//    */
//   const getPlainClient = (): Client => {
//     return Client.forName(network);
//   };

//   /**
//    * Signs and submits a transaction through the wallet (HashPack / WalletConnect).
//    *
//    * KEY RULES:
//    *  1. We capture the TransactionId from the tx object BEFORE calling this,
//    *     because the response object returned by executeWithSigner is a
//    *     TransactionResponse from the wallet SDK — not the Hedera SDK's
//    *     TransactionResponse — and calling .getReceipt() or .getRecord() on it
//    *     routes back through DAppSigner, which throws:
//    *       "(BUG) Query.fromBytes() not implemented for type getByKey"
//    *  2. We set a 180-second valid duration BEFORE freezing to prevent
//    *     WalletConnect's "Request expired" timeout on slow connections.
//    */
//   const executeWithSigner = async (transaction: any): Promise<void> => {
//     const client = getPlainClient();

//     // ✅ FIX 1: Extend the window WalletConnect has to present the signing
//     // prompt before the transaction expires on-chain.
//     transaction.setTransactionValidDuration(180);

//     // Freeze with the plain client so node account IDs are populated,
//     // but the transaction ID we set manually is preserved.
//     transaction.freezeWith(client);

//     // ✅ Submit through the wallet — do NOT call .getReceipt()/.getRecord()
//     // on the return value; use TransactionReceiptQuery / TransactionRecordQuery
//     // with a plain client instead (see getReceiptWithPlainClient below).
//     await transaction.executeWithSigner(signer);
//   };

//   /**
//    * ✅ FIX 2: Fetch the receipt using a plain SDK client, completely bypassing
//    * DAppSigner. This avoids the "Query.fromBytes() not implemented" crash.
//    */
//   const getReceiptWithPlainClient = async (txId: TransactionId) => {
//     const client = getPlainClient();
//     // Poll up to ~2 minutes (default SDK behaviour) for the receipt.
//     return await new TransactionReceiptQuery()
//       .setTransactionId(txId)
//       .setIncludeChildren(true)
//       .execute(client);
//   };

//   /**
//    * ✅ FIX 2 (variant): Fetch the full record (contains logs) using a plain
//    * SDK client. Used by the Event Logs fallback for extractTokenIdFromLogs.
//    */
//   const getRecordWithPlainClient = async (txId: TransactionId) => {
//     const client = getPlainClient();
//     return await new TransactionRecordQuery()
//       .setTransactionId(txId)
//       .setIncludeChildren(true)
//       .execute(client);
//   };

//   const formatTxIdForMirror = (txIdStr: string) => {
//     return txIdStr
//       .replace("@", "-")
//       .replace(/\./g, (match, offset, string) => {
//         const dotCount = string.slice(0, offset + 1).split(".").length - 1;
//         return dotCount <= 2 ? "." : "-";
//       });
//   };

//   const getMirrorNodeUrl = () => {
//     return network === "testnet"
//       ? "https://testnet.mirrornode.hedera.com"
//       : "https://mainnet.mirrornode.hedera.com";
//   };

//   // ============================================
//   // METHOD 1: Mirror Node Polling
//   // ============================================

//   const pollMirrorNodeWithRetry = async (
//     txIdStr: string,
//     maxRetries: number = 20,
//     delayMs: number = 2000
//   ): Promise<string | null> => {
//     const txIdFormatted = formatTxIdForMirror(txIdStr);
//     const mirrorNodeUrl = getMirrorNodeUrl();

//     console.log(`📡 Attempting Mirror Node polling (max ${maxRetries} attempts)...`);

//     for (let attempt = 1; attempt <= maxRetries; attempt++) {
//       try {
//         setStatusMessage(`[Mirror Node] Indexing... (Attempt ${attempt}/${maxRetries})`);

//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), 15000);

//         console.log(`🔍 Mirror Node polling attempt ${attempt}/${maxRetries}...`);

//         const response = await fetch(
//           `${mirrorNodeUrl}/api/v1/contracts/results/${txIdFormatted}`,
//           { signal: controller.signal }
//         );

//         clearTimeout(timeoutId);

//         if (response.status === 404) {
//           console.log(`⏳ Not indexed yet (${attempt}/${maxRetries})`);
//           await new Promise((resolve) => setTimeout(resolve, delayMs));
//           continue;
//         }

//         if (!response.ok) {
//           throw new Error(`Mirror Node returned status ${response.status}`);
//         }

//         const mirrorData = await response.json();
//         console.log("✅ Mirror Node response:", mirrorData);

//         if (!mirrorData?.call_result || mirrorData.call_result === "0x") {
//           console.warn("⚠️ Mirror Node returned empty call_result");
//           return null;
//         }

//         const tokenEvmAddress = "0x" + mirrorData.call_result.slice(-40);

//         if (!tokenEvmAddress || tokenEvmAddress.length !== 42) {
//           console.warn("⚠️ Invalid EVM address extracted");
//           return null;
//         }

//         const tokenId = TokenId.fromEvmAddress(0, 0, tokenEvmAddress).toString();

//         if (!tokenId) {
//           console.warn("⚠️ Failed to convert to token ID");
//           return null;
//         }

//         console.log("✅ Successfully extracted token ID from Mirror Node:", tokenId);
//         return tokenId;
//       } catch (err: any) {
//         console.warn(`⚠️ Mirror Node attempt ${attempt} failed:`, err.message);

//         if (attempt === maxRetries) {
//           console.warn("❌ Mirror Node polling exhausted, will use fallback");
//           return null;
//         }

//         const backoffDelay = attempt > 10 ? delayMs * 2 : delayMs;
//         await new Promise((resolve) => setTimeout(resolve, backoffDelay));
//       }
//     }

//     return null;
//   };

//   // ============================================
//   // METHOD 2: Event Logs Fallback
//   // ============================================

//   /**
//    * ✅ FIXED: Now accepts a TransactionId instead of a response object so we
//    * can fetch the record via getRecordWithPlainClient (plain SDK client) rather
//    * than calling response.getRecord() which routes through DAppSigner.
//    */
//   const extractTokenIdFromLogs = async (
//     txId: TransactionId
//   ): Promise<string | null> => {
//     try {
//       setStatusMessage("🔄 Mirror Node unavailable, using Event Logs fallback...");
//       console.log("📝 Attempting to extract token ID from transaction logs...");

//       // ✅ Use plain client — never call response.getRecord() from the wallet SDK
//       const record = await getRecordWithPlainClient(txId);
//       const logs = record.contractFunctionResult?.logs;

//       console.log("📋 Transaction logs:", logs);

//       if (!logs || logs.length === 0) {
//         throw new Error("No event logs found in transaction");
//       }

//       const log = logs[0];
//       console.log("📍 Parsing first log...");

//       if (!log.data || log.data.length === 0) {
//         throw new Error("Log data is empty");
//       }

//       const tokenEvmAddress = "0x" + log.data.slice(-40).toString();

//       console.log("📍 Extracted EVM address from logs:", tokenEvmAddress);

//       if (!tokenEvmAddress || tokenEvmAddress.length !== 42) {
//         throw new Error(`Invalid EVM address: ${tokenEvmAddress}`);
//       }

//       const tokenId = TokenId.fromEvmAddress(0, 0, tokenEvmAddress).toString();

//       if (!tokenId) {
//         throw new Error("Failed to convert EVM address to token ID");
//       }

//       console.log("✅ Successfully extracted token ID from Event Logs:", tokenId);
//       return tokenId;
//     } catch (err: any) {
//       console.error("❌ Event Logs fallback failed:", err.message);
//       return null;
//     }
//   };

//   // ============================================
//   // MAIN: Create Comic Collection (Hybrid)
//   // ============================================

//   const createComicCollection = async ({
//     episodeId,
//     name,
//     symbol,
//     maxSupply,
//   }: {
//     episodeId: string;
//     name: string;
//     symbol: string;
//     maxSupply: number;
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       setStatusMessage("Creating NFT collection...");
//       setUsedFallback(false);

//       console.log("📚 Creating comic collection:", {
//         episodeId,
//         name,
//         maxSupply,
//         contract: CONTRACTS.COMIC_CORE,
//       });

//       // ============================================
//       // Step 1: Build transaction and capture its ID
//       //         BEFORE submitting to the wallet.
//       // ============================================

//       const generatedTxId = TransactionId.generate(AccountId.fromString(accountId));

//       const tx = new ContractExecuteTransaction()
//         .setContractId(CONTRACTS.COMIC_CORE)
//         .setTransactionId(generatedTxId)
//         .setGas(15000000)
//         .setPayableAmount(new Hbar(50))
//         .setFunction(
//           "createComicCollection",
//           new ContractFunctionParameters()
//             .addString(episodeId)
//             .addString(name)
//             .addString(symbol)
//             .addString(`${name} Collection`)
//             .addInt64(maxSupply)
//             .addInt64(7000000)
//         );

//       // Capture the txId string NOW — do not rely on the wallet response object
//       // for it, because response.transactionId from DAppSigner can be unreliable
//       // and calling response.getReceipt() on it throws a query error.
//       const txIdStr = generatedTxId.toString();
//       setTxId(txIdStr);

//       // ============================================
//       // Step 2: Submit through wallet
//       // ============================================

//       setStatusMessage("Signing transaction with HashPack...");
//       // executeWithSigner now returns void — we do NOT call .getReceipt() on it.
//       await executeWithSigner(tx);

//       console.log("✅ Transaction submitted:", txIdStr);

//       // ============================================
//       // Step 3: Wait for receipt via plain SDK client
//       //         (bypasses DAppSigner entirely)
//       // ============================================

//       setStatusMessage("Waiting for transaction confirmation...");

//       let receipt;
//       try {
//         receipt = await getReceiptWithPlainClient(generatedTxId);
//         console.log("✅ Receipt received - Status:", receipt.status.toString());
//       } catch (receiptErr: any) {
//         // If the receipt query itself fails, the transaction may still have
//         // succeeded on-chain (race condition / node lag). Log the error and
//         // continue to mirror-node polling which will confirm success.
//         console.warn(
//           "⚠️ Receipt query failed, proceeding to Mirror Node check:",
//           receiptErr.message
//         );
//         receipt = null;
//       }

//       if (receipt && receipt.status.toString() !== "SUCCESS") {
//         throw new Error(
//           `Transaction failed with status: ${receipt.status.toString()}`
//         );
//       }

//       // ============================================
//       // Step 4: Try Mirror Node first
//       // ============================================

//       setStatusMessage("Attempting to index via Mirror Node...");
//       let tokenId = await pollMirrorNodeWithRetry(txIdStr);

//       // ============================================
//       // Step 5: Fallback to Event Logs
//       // ============================================

//       if (!tokenId) {
//         console.log("⚠️ Mirror Node failed, falling back to Event Logs...");
//         setUsedFallback(true);
//         // ✅ Pass the TransactionId object (not the wallet response)
//         tokenId = await extractTokenIdFromLogs(generatedTxId);
//       }

//       // ============================================
//       // Step 6: Handle result
//       // ============================================

//       if (!tokenId) {
//         throw new Error(
//           "Failed to extract token ID from both Mirror Node and Event Logs. " +
//             "Transaction may have failed. Check contract execution."
//         );
//       }

//       console.log(
//         `🎉 Collection created successfully! ${
//           usedFallback ? "(via Event Logs)" : "(via Mirror Node)"
//         }`
//       );

//       setStatus("done");
//       setStatusMessage(
//         usedFallback
//           ? "✅ Collection created! (Indexed via Event Logs)"
//           : "✅ Collection created! (Indexed via Mirror Node)"
//       );

//       return {
//         transactionId: txIdStr,
//         status: receipt?.status.toString() ?? "SUCCESS",
//         tokenId,
//         indexedVia: usedFallback ? "event-logs" : "mirror-node",
//       };
//     } catch (err: any) {
//       console.error("❌ Collection creation failed:", err.message);
//       setError(err.message);
//       setStatus("error");
//       setStatusMessage(`Error: ${err.message}`);
//       throw err;
//     }
//   };

//   // ============================================
//   // PATH 1: DIRECT LISTING
//   // ============================================

//   /**
//    * Create Direct Listing — batch minting support.
//    *
//    * ✅ All response.getReceipt() calls replaced with getReceiptWithPlainClient().
//    */
//   const createDirectListing = async ({
//     episodeId,
//     quantity,
//     pricePerNFT,
//     metadata,
//   }: {
//     episodeId: string;
//     quantity: number;
//     pricePerNFT: number;
//     metadata: string;
//   }) => {
//     let lastTxIdStr = "";
//     try {
//       setStatus("processing");
//       setError(null);
//       setMintProgress(0);
//       console.log("🏪 Creating direct listing with batch minting:", {
//         episodeId,
//         quantity,
//         pricePerNFT,
//       });

//       const priceInTinybars = Hbar.from(pricePerNFT, HbarUnit.Hbar).toTinybars();

//       const BATCH_SIZE = 10;
//       const totalBatches = Math.ceil(quantity / BATCH_SIZE);
//       let completedBatches = 0;

//       console.log(
//         `📦 Will mint in ${totalBatches} batches of up to ${BATCH_SIZE} NFTs each`
//       );

//       for (let batchStart = 0; batchStart < quantity; batchStart += BATCH_SIZE) {
//         const batchEnd = Math.min(batchStart + BATCH_SIZE, quantity);
//         const batchQuantity = batchEnd - batchStart;
//         const currentBatch = completedBatches + 1;

//         console.log(
//           `📦 Processing batch ${currentBatch}/${totalBatches}: NFTs ${batchStart + 1}-${batchEnd} (${batchQuantity} NFTs)`
//         );

//         try {
//           const batchTxId = TransactionId.generate(AccountId.fromString(accountId));

//           const tx = new ContractExecuteTransaction()
//             .setContractId(CONTRACTS.COMIC_SALES)
//             .setTransactionId(batchTxId)
//             .setGas(5000000 + batchQuantity * 500000)
//             .setFunction(
//               "createDirectListing",
//               new ContractFunctionParameters()
//                 .addString(episodeId)
//                 .addUint256(batchQuantity)
//                 .addUint256(priceInTinybars)
//                 .addBytes(Buffer.from(metadata))
//             );

//           await executeWithSigner(tx);
//           const batchTxIdStr = batchTxId.toString();

//           // ✅ Plain client receipt
//           const receipt = await getReceiptWithPlainClient(batchTxId);
//           console.log("✅ Batch direct listing created!", receipt);
//           lastTxIdStr = batchTxIdStr;

//           console.log(
//             `✅ Batch ${currentBatch}/${totalBatches} completed! Transaction: ${batchTxIdStr}`
//           );

//           completedBatches++;
//           setMintProgress((completedBatches / totalBatches) * 100);

//           if (batchEnd < quantity) {
//             console.log("⏳ Waiting 3 seconds before next batch...");
//             await new Promise((resolve) => setTimeout(resolve, 3000));
//           }
//         } catch (batchError: any) {
//           console.error(`❌ Batch ${currentBatch}/${totalBatches} failed:`, batchError);
//           throw new Error(
//             `Batch minting failed at NFTs ${batchStart + 1}-${batchEnd}: ${batchError.message}`
//           );
//         }
//       }

//       console.log("✅ All batches completed! Direct listing created successfully!");
//       setMintProgress(100);
//       setTxId(lastTxIdStr);
//       setStatus("done");

//       // Get listing ID from mirror node for the last transaction
//       await new Promise((resolve) => setTimeout(resolve, 5000));
//       const txIdFormatted = formatTxIdForMirror(lastTxIdStr);
//       const mirrorResponse = await fetch(
//         `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
//       );
//       const mirrorData = await mirrorResponse.json();
//       console.log("Mirror Node data:", mirrorData);

//       let listingId: string | undefined;
//       if (mirrorData?.call_result) {
//         listingId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
//       }

//       return {
//         transactionId: lastTxIdStr,
//         status: "SUCCESS",
//         listingId,
//         totalMinted: quantity,
//         batches: totalBatches,
//       };
//     } catch (err: any) {
//       console.error("❌ Direct listing with batch minting failed:", err);
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   /**
//    * Purchase from Direct Listing
//    */
//   const purchaseFromListing = async ({
//     listingId,
//     quantity,
//     pricePerNFT,
//   }: {
//     listingId: number;
//     quantity: number;
//     pricePerNFT: number;
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("💳 Purchasing from listing:", { listingId, quantity });

//       const totalPrice = pricePerNFT * quantity;
//       const purchaseTxId = TransactionId.generate(AccountId.fromString(accountId));

//       const tx = new ContractExecuteTransaction()
//         .setContractId(CONTRACTS.COMIC_SALES)
//         .setTransactionId(purchaseTxId)
//         .setGas(5000000 + quantity * 500000)
//         .setPayableAmount(new Hbar(totalPrice, HbarUnit.Hbar))
//         .setFunction(
//           "purchaseFromListing",
//           new ContractFunctionParameters()
//             .addUint256(
//               typeof listingId === "string" ? parseInt(listingId) : listingId
//             )
//             .addUint256(quantity)
//         );

//       await executeWithSigner(tx);

//       // ✅ Plain client receipt
//       const receipt = await getReceiptWithPlainClient(purchaseTxId);
//       const txIdStr = purchaseTxId.toString();

//       console.log("✅ Purchase successful! You can now read this comic!");
//       setTxId(txIdStr);
//       setStatus("done");

//       return {
//         transactionId: txIdStr,
//         status: receipt.status.toString(),
//       };
//     } catch (err: any) {
//       console.error("❌ Purchase failed:", err);
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   // ============================================
//   // PATH 2: CAMPAIGN / DROP SYSTEM
//   // ============================================

//   /**
//    * Create Campaign (Public / Whitelist / Scheduled)
//    */
//   const createCampaign = async ({
//     episodeId,
//     campaignType,
//     mintPrice,
//     maxSupply,
//     maxPerWallet,
//     metadata,
//   }: {
//     episodeId: string;
//     campaignType: CampaignType;
//     mintPrice: number;
//     maxSupply: number;
//     maxPerWallet: number;
//     metadata: string;
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("🎯 Creating campaign:", { episodeId, campaignType, maxSupply });

//       const priceInTinybars = Hbar.from(mintPrice, HbarUnit.Hbar).toTinybars();
//       const campaignTxId = TransactionId.generate(AccountId.fromString(accountId));

//       const tx = new ContractExecuteTransaction()
//         .setContractId(CONTRACTS.COMIC_SALES)
//         .setTransactionId(campaignTxId)
//         .setGas(4000000)
//         .setFunction(
//           "createCampaign",
//           new ContractFunctionParameters()
//             .addString(episodeId)
//             .addUint8(campaignType)
//             .addUint256(priceInTinybars)
//             .addUint256(maxSupply)
//             .addUint256(maxPerWallet)
//             .addBytes(Buffer.from(metadata))
//         );

//       await executeWithSigner(tx);

//       // ✅ Plain client receipt
//       const receipt = await getReceiptWithPlainClient(campaignTxId);
//       const txIdStr = campaignTxId.toString();

//       await new Promise((resolve) => setTimeout(resolve, 5000));
//       const txIdFormatted = formatTxIdForMirror(txIdStr);
//       const mirrorResponse = await fetch(
//         `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
//       );
//       const mirrorData = await mirrorResponse.json();
//       console.log("Mirror Node data:", mirrorData);

//       let campaignId: string | undefined;
//       if (mirrorData?.call_result) {
//         campaignId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
//       }
//       console.log("🎉 New Campaign ID:", campaignId);

//       setTxId(txIdStr);
//       setStatus("done");
//       console.log("✅ Campaign created!");

//       return {
//         transactionId: txIdStr,
//         status: receipt.status.toString(),
//         campaignId,
//       };
//     } catch (err: any) {
//       console.error("❌ Campaign creation failed:", err);
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   /**
//    * Add addresses to whitelist (for WHITELIST campaigns)
//    */
//   const addToWhitelist = async ({
//     campaignId,
//     addresses,
//     allocations,
//   }: {
//     campaignId: number;
//     addresses: string[];
//     allocations: number[];
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("📋 Adding to whitelist:", { campaignId, count: addresses.length });

//       const whitelistTxId = TransactionId.generate(AccountId.fromString(accountId));

//       const tx = new ContractExecuteTransaction()
//         .setContractId(CONTRACTS.COMIC_SALES)
//         .setTransactionId(whitelistTxId)
//         .setGas(1000000 + addresses.length * 100000)
//         .setFunction(
//           "addToWhitelist",
//           new ContractFunctionParameters()
//             .addUint256(campaignId)
//             .addAddressArray(addresses)
//             .addUint256Array(allocations)
//         );

//       await executeWithSigner(tx);

//       // ✅ Plain client receipt
//       const receipt = await getReceiptWithPlainClient(whitelistTxId);
//       const txIdStr = whitelistTxId.toString();

//       console.log("✅ Whitelist updated!");
//       setTxId(txIdStr);
//       setStatus("done");

//       return {
//         transactionId: txIdStr,
//         status: receipt.status.toString(),
//       };
//     } catch (err: any) {
//       console.error("❌ Whitelist update failed:", err);
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   /**
//    * Add phase (for SCHEDULED campaigns)
//    */
//   const addPhase = async ({
//     campaignId,
//     phaseType,
//     startTime,
//     endTime,
//     mintPrice,
//     maxPerWallet,
//     phaseSupply,
//   }: {
//     campaignId: number;
//     phaseType: PhaseType;
//     startTime: number;
//     endTime: number;
//     mintPrice: number;
//     maxPerWallet: number;
//     phaseSupply: number;
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("⏰ Adding phase:", { campaignId, phaseType });

//       const priceInTinybars = Hbar.from(mintPrice, HbarUnit.Hbar).toTinybars();
//       const phaseTxId = TransactionId.generate(AccountId.fromString(accountId));

//       const tx = new ContractExecuteTransaction()
//         .setContractId(CONTRACTS.COMIC_SALES)
//         .setTransactionId(phaseTxId)
//         .setGas(2000000)
//         .setFunction(
//           "addPhase",
//           new ContractFunctionParameters()
//             .addUint256(campaignId)
//             .addUint8(phaseType)
//             .addUint256(startTime)
//             .addUint256(endTime)
//             .addUint256(priceInTinybars)
//             .addUint256(maxPerWallet)
//             .addUint256(phaseSupply)
//         );

//       await executeWithSigner(tx);

//       // ✅ Plain client receipt
//       const receipt = await getReceiptWithPlainClient(phaseTxId);
//       const txIdStr = phaseTxId.toString();

//       console.log("✅ Phase added!");
//       setTxId(txIdStr);
//       setStatus("done");

//       return {
//         transactionId: txIdStr,
//         status: receipt.status.toString(),
//       };
//     } catch (err: any) {
//       console.error("❌ Phase add failed:", err);
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   /**
//    * Mint from Campaign
//    */
//   const mintFromCampaign = async ({
//     campaignId,
//     phaseId = 0,
//     quantity,
//     mintPrice,
//   }: {
//     campaignId: number;
//     phaseId?: number;
//     quantity: number;
//     mintPrice: number;
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("🎨 Minting from campaign:", { campaignId, quantity });

//       const totalPrice = mintPrice * quantity;
//       const mintTxId = TransactionId.generate(AccountId.fromString(accountId));

//       const tx = new ContractExecuteTransaction()
//         .setContractId(CONTRACTS.COMIC_SALES)
//         .setTransactionId(mintTxId)
//         .setGas(4000000 + quantity * 500000)
//         .setPayableAmount(new Hbar(totalPrice, HbarUnit.Hbar))
//         .setFunction(
//           "mint",
//           new ContractFunctionParameters()
//             .addUint256(campaignId)
//             .addUint256(phaseId)
//             .addUint256(quantity)
//         );

//       await executeWithSigner(tx);

//       // ✅ Plain client receipt
//       const receipt = await getReceiptWithPlainClient(mintTxId);
//       const txIdStr = mintTxId.toString();

//       console.log("✅ Mint successful! You can now read this comic!");
//       setTxId(txIdStr);
//       setStatus("done");

//       return {
//         transactionId: txIdStr,
//         status: receipt.status.toString(),
//       };
//     } catch (err: any) {
//       console.error("❌ Mint failed:", err);
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   // ============================================
//   // MARKETPLACE — RESALE
//   // ============================================

//   /**
//    * List NFT for Resale
//    */
//   const listForResale = async ({
//     tokenAddress,
//     serialNumber,
//     priceInHbar,
//   }: {
//     tokenAddress: string;
//     serialNumber: number;
//     priceInHbar: number;
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("📝 Listing for resale:", { serialNumber, priceInHbar });

//       const priceInTinybars = Hbar.from(priceInHbar, HbarUnit.Hbar).toTinybars();
//       const resaleTxId = TransactionId.generate(AccountId.fromString(accountId));

//       const tx = new ContractExecuteTransaction()
//         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
//         .setTransactionId(resaleTxId)
//         .setGas(5000000)
//         .setFunction(
//           "depositAndListForResale",
//           new ContractFunctionParameters()
//             .addAddress(TokenId.fromString(tokenAddress).toEvmAddress())
//             .addInt64(serialNumber)
//             .addUint256(priceInTinybars)
//         );

//       await executeWithSigner(tx);

//       // ✅ Plain client receipt
//       const receipt = await getReceiptWithPlainClient(resaleTxId);
//       const txIdStr = resaleTxId.toString();

//       console.log("✅ Listed for resale!");
//       setTxId(txIdStr);
//       setStatus("done");

//       await new Promise((resolve) => setTimeout(resolve, 5000));
//       const txIdFormatted = formatTxIdForMirror(txIdStr);
//       const mirrorResponse = await fetch(
//         `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
//       );
//       const mirrorData = await mirrorResponse.json();

//       let listingId: string | undefined;
//       if (mirrorData?.call_result) {
//         listingId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
//       }

//       const serials: number[] = [];
//       let allSerials: number[] = [];
//       if (mirrorData?.call_result) {
//         const result = mirrorData.call_result.slice(2);
//         const arrayLengthHex = result.slice(64, 128);
//         const arrayLength = parseInt(arrayLengthHex, 16);

//         for (let i = 0; i < arrayLength; i++) {
//           const start = 128 + i * 64;
//           const serialHex = result.slice(start, start + 64);
//           const serial = parseInt(serialHex, 16);
//           if (serial > 0) serials.push(serial);
//         }

//         allSerials = allSerials.concat(serials);
//         console.log("🎉 Minted serials:", serials);
//       }

//       return {
//         transactionId: txIdStr,
//         status: receipt.status.toString(),
//         listingId,
//         serials: allSerials,
//       };
//     } catch (err: any) {
//       console.error("❌ List for resale failed:", err);
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   /**
//    * Batch list multiple NFTs for resale
//    */
//   const batchListForResale = async ({
//     tokenAddress,
//     serialNumbers,
//     prices,
//   }: {
//     tokenAddress: string;
//     serialNumbers: number[];
//     prices: number[];
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("📝 Batch listing for resale:", { count: serialNumbers.length });

//       const pricesInTinybars = prices.map((p) =>
//         Hbar.from(p, HbarUnit.Hbar).toTinybars()
//       );
//       const batchTxId = TransactionId.generate(AccountId.fromString(accountId));

//       const tx = new ContractExecuteTransaction()
//         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
//         .setTransactionId(batchTxId)
//         .setGas(3000000 + serialNumbers.length * 300000)
//         .setFunction(
//           "batchDepositAndListForResale",
//           new ContractFunctionParameters()
//             .addAddress(TokenId.fromString(tokenAddress).toEvmAddress())
//             .addInt64Array(serialNumbers)
//             .addUint256Array(pricesInTinybars)
//         );

//       await executeWithSigner(tx);

//       // ✅ Plain client receipt
//       const receipt = await getReceiptWithPlainClient(batchTxId);
//       const txIdStr = batchTxId.toString();

//       console.log("✅ Batch listed for resale!");
//       setTxId(txIdStr);
//       setStatus("done");

//       return {
//         transactionId: txIdStr,
//         status: receipt.status.toString(),
//       };
//     } catch (err: any) {
//       console.error("❌ Batch list failed:", err);
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   /**
//    * Purchase from Marketplace (Resale)
//    */
//   const purchaseFromMarketplace = async ({
//     listingId,
//     priceInHbar,
//   }: {
//     listingId: number;
//     priceInHbar: number;
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("💳 Purchasing from marketplace:", { listingId });

//       const mktTxId = TransactionId.generate(AccountId.fromString(accountId));

//       const tx = new ContractExecuteTransaction()
//         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
//         .setTransactionId(mktTxId)
//         .setGas(5000000)
//         .setPayableAmount(new Hbar(priceInHbar, HbarUnit.Hbar))
//         .setFunction(
//           "purchaseNFT",
//           new ContractFunctionParameters().addUint256(
//             typeof listingId === "string" ? parseInt(listingId) : listingId
//           )
//         );

//       await executeWithSigner(tx);

//       // ✅ Plain client receipt
//       const receipt = await getReceiptWithPlainClient(mktTxId);
//       const txIdStr = mktTxId.toString();

//       console.log("✅ Purchase successful! Reading access transferred!");
//       setTxId(txIdStr);
//       setStatus("done");

//       return {
//         transactionId: txIdStr,
//         status: receipt.status.toString(),
//       };
//     } catch (err: any) {
//       console.error("❌ Purchase failed:", err);
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   /**
//    * Cancel Listing
//    */
//   const cancelListing = async (listingId: number) => {
//     try {
//       setStatus("processing");
//       setError(null);

//       const cancelTxId = TransactionId.generate(AccountId.fromString(accountId));

//       const tx = new ContractExecuteTransaction()
//         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
//         .setTransactionId(cancelTxId)
//         .setGas(2000000)
//         .setFunction(
//           "cancelListing",
//           new ContractFunctionParameters().addUint256(listingId)
//         );

//       await executeWithSigner(tx);

//       // ✅ Plain client receipt
//       const receipt = await getReceiptWithPlainClient(cancelTxId);
//       const txIdStr = cancelTxId.toString();

//       setTxId(txIdStr);
//       setStatus("done");

//       return {
//         transactionId: txIdStr,
//         status: receipt.status.toString(),
//       };
//     } catch (err: any) {
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   // ============================================
//   // QUERY FUNCTIONS
//   // (All use plain client — no DAppSigner involvement)
//   // ============================================

//   const canReadComic = async (
//     episodeId: string,
//     userAddress: string
//   ): Promise<boolean> => {
//     try {
//       const abiDef = [
//         "function canReadComic(string episodeId, address user) external view returns (bool)",
//       ];
//       const abiInterface = new ethers.Interface(abiDef);
//       const encodedData = abiInterface.encodeFunctionData("canReadComic", [
//         episodeId,
//         userAddress,
//       ]);

//       const contractAddress =
//         mirrorNodeService.hederaIdToEvmAddress(CONTRACTS.COMIC_CORE);

//       const mirrorUrl =
//         network === "testnet"
//           ? "https://testnet.mirrornode.hedera.com"
//           : "https://mainnet.mirrornode.hedera.com";

//       const response = await fetch(`${mirrorUrl}/api/v1/contracts/call`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           block: "latest",
//           data: encodedData,
//           to: contractAddress,
//         }),
//       });

//       const result = await response.json();
//       console.log("Raw canReadComic result:", result);

//       const decoded = abiInterface.decodeFunctionResult(
//         "canReadComic",
//         result.result
//       );
//       console.log("Decoded canReadComic result:", decoded[0]);

//       return decoded[0];
//     } catch (err) {
//       console.error("❌ Query failed:", err);
//       return false;
//     }
//   };

//   /**
//    * Get episode details — uses plain SDK client directly (safe)
//    */
//   const getEpisode = async (episodeId: string) => {
//     try {
//       const client = getPlainClient();

//       const query = new ContractCallQuery()
//         .setContractId(CONTRACTS.COMIC_CORE)
//         .setGas(100000)
//         .setFunction(
//           "getEpisode",
//           new ContractFunctionParameters().addString(episodeId)
//         );

//       const result = await query.execute(client);

//       return {
//         tokenAddress: result.getAddress(0),
//         creator: result.getAddress(1),
//         name: result.getString(2),
//         maxSupply: Number(result.getInt64(3)),
//         currentSupply: Number(result.getInt64(4)),
//         exists: result.getBool(5),
//       };
//     } catch (err: any) {
//       console.error("❌ Query failed:", err);
//       throw err;
//     }
//   };

//   /**
//    * Get campaign details
//    */
//   const getCampaign = async (campaignId: number) => {
//     try {
//       const client = getPlainClient();

//       const query = new ContractCallQuery()
//         .setContractId(CONTRACTS.COMIC_SALES)
//         .setGas(150000)
//         .setFunction(
//           "getCampaign",
//           new ContractFunctionParameters().addUint256(campaignId)
//         );

//       const result = await query.execute(client);

//       const campaignTypeNum = Number(result.getUint8(2));
//       const campaignTypeMap: { [key: number]: CampaignType } = {
//         0: CampaignType.PUBLIC,
//         1: CampaignType.WHITELIST,
//         2: CampaignType.SCHEDULED,
//       };

//       return {
//         episodeId: result.getString(0),
//         creator: result.getAddress(1),
//         campaignType: campaignTypeMap[campaignTypeNum] || CampaignType.PUBLIC,
//         mintPrice: result.getUint256(3).toString(),
//         maxSupply: result.getUint256(4).toString(),
//         totalMinted: result.getUint256(5).toString(),
//         isActive: result.getBool(6),
//       };
//     } catch (err: any) {
//       console.error("❌ Query failed:", err);
//       throw err;
//     }
//   };

//   /**
//    * Get direct listing details
//    */
//   const getDirectListing = async (listingId: number) => {
//     try {
//       const client = getPlainClient();

//       const query = new ContractCallQuery()
//         .setContractId(CONTRACTS.COMIC_SALES)
//         .setGas(100000)
//         .setFunction(
//           "getDirectListing",
//           new ContractFunctionParameters().addUint256(listingId)
//         );

//       const result = await query.execute(client);

//       return {
//         episodeId: result.getString(0),
//         creator: result.getAddress(1),
//         pricePerNFT: result.getUint256(2).toString(),
//         available: result.getUint256(3).toString(),
//         isActive: result.getBool(4),
//       };
//     } catch (err: any) {
//       console.error("❌ Query failed:", err);
//       throw err;
//     }
//   };

//   /**
//    * Get marketplace listing details — ✅ fixed: uses plain client for query,
//    * not executeWithSigner (queries must never go through DAppSigner).
//    */
//   const getMarketplaceListing = async (listingId: number) => {
//     try {
//       const client = getPlainClient();

//       const query = new ContractCallQuery()
//         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
//         .setGas(100000)
//         .setFunction(
//           "getListing",
//           new ContractFunctionParameters().addUint256(listingId)
//         );

//       // ✅ Execute directly on the plain client — never route queries through signer
//       const result = await query.execute(client);
//       console.log("Marketplace listing result:", result);

//       return {
//         tokenAddress: result.getAddress(0),
//         serialNumber: Number(result.getInt64(1)),
//         seller: result.getAddress(2),
//         price: result.getUint256(3).toString(),
//         isActive: result.getBool(4),
//       };
//     } catch (err: any) {
//       console.error("❌ Query failed:", err);
//       throw err;
//     }
//   };

//   /**
//    * Get current phase for scheduled campaign
//    */
//   const getCurrentPhase = async (campaignId: number) => {
//     try {
//       const client = getPlainClient();

//       const query = new ContractCallQuery()
//         .setContractId(CONTRACTS.COMIC_SALES)
//         .setGas(200000)
//         .setFunction(
//           "getCurrentPhase",
//           new ContractFunctionParameters().addUint256(campaignId)
//         );

//       const result = await query.execute(client);

//       return {
//         phaseId: Number(result.getUint256(0)),
//         exists: result.getBool(1),
//       };
//     } catch (err: any) {
//       console.error("❌ Query failed:", err);
//       throw err;
//     }
//   };

//   return {
//     // Creator functions
//     createComicCollection,
//     createDirectListing,
//     createCampaign,
//     addToWhitelist,
//     addPhase,

//     // User functions — Buying
//     purchaseFromListing,
//     mintFromCampaign,

//     // User functions — Reselling
//     listForResale,
//     batchListForResale,
//     purchaseFromMarketplace,
//     cancelListing,

//     // Query functions
//     canReadComic,
//     getEpisode,
//     getCampaign,
//     getDirectListing,
//     getMarketplaceListing,
//     getCurrentPhase,

//     // State
//     status,
//     error,
//     txId,
//     statusMessage,
//     usedFallback,
//   };
// }

// export default useComicPlatform;

// function setMintProgress(progress: number) {
//   if (Number.isNaN(progress)) return;
//   const clamped = Math.max(0, Math.min(100, progress));
//   console.debug("Mint progress:", clamped);
// }