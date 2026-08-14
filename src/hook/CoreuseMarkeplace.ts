// // import { useState } from "react";
// // import {
// //   ContractExecuteTransaction,
// //   Client,
// //   ContractFunctionParameters,
// //   AccountId,
// //   ContractId,
// //   TransactionId,
// //   TransactionReceiptQuery,
// //   TransactionRecordQuery,
// //   ContractCallQuery,
// //   Hbar,
// //   HbarUnit,
// //   TokenId,
// // } from "@hashgraph/sdk";
// // // import { useComicInscription } from "./useComicInscription";
// // import { ethers } from 'ethers';
// // import MirrorNodeService  from "./MirrorNodeService";

// // // Define the ABI for your function
// // const abi = [
// //   'function canReadComic(string episodeId, address user) external view returns (bool)'
// // ];

// // // Create interface and encode the function call

// // const CONTRACTS = {
// //   COMIC_CORE: "0.0.7806656",
// //    COMIC_SALES: "0.0.7829668",
// //   COMIC_MARKETPLACE: "0.0.7829656"
// // }

// // interface UseComicPlatformProps {
// //   accountId: string;
// //   signer: any;
// //   network?: "testnet" | "mainnet";
// // }

// // export enum CampaignType {
// //   PUBLIC = 0,
// //   WHITELIST = 1,
// //   SCHEDULED = 2
// // }
// // // export enum CampaignType {
// // //   PUBLIC = "Public",
// // //   WHITELIST = "Whitelist",
// // //   SCHEDULED = "Scheduled"
// // // }

// // export enum PhaseType {
// //   WHITELIST = 0,
// //   PUBLIC = 1
// // }

// // export function useComicPlatform({
// //   accountId,
// //   signer,
// //   network = "testnet"
// // }: UseComicPlatformProps) {
// //   const mirrorNodeService = new MirrorNodeService(network);

// //   const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
// //   const [error, setError] = useState<string | null>(null);
// //   const [txId, setTxId] = useState<string | null>(null);
// //   const [statusMessage, setStatusMessage] = useState<string>("");
// //   const [usedFallback, setUsedFallback] = useState<boolean>(false);

// //   // ============================================
// //   // HELPER FUNCTIONS
// //   // ============================================
 
// //   // const executeWithSigner = async (transaction: any) => {
// //   //   const signedTx = await signer.signTransaction(transaction);
// //   //   let client: Client;
// //   //   if (signer._client) client = signer._client;
// //   //   else if (signer.client) client = signer.client;
// //   //   else client = Client.forName(network);
// //   //   return await signedTx.execute(client);
// //   // };
// //    const getClient = () => {
// //     if (signer._client) return signer._client;
// //     if (signer.client) return signer.client;
// //     return Client.forName(network);
// //   };
// //   const executeWithSigner = async (transaction: any): Promise<void> => {
// //     // 1. Get the standard Hedera Client to fetch node account IDs
// //     const client = getClient();

// //     // 2. Extend valid duration so WalletConnect doesn't expire before the user signs
// //     transaction.setTransactionValidDuration(180);

// //     // 3. Freeze the transaction (locks in your manually set Transaction ID)
// //     transaction.freezeWith(client);

// //     // 4. Submit THROUGH the HashPack signer.
// //     //    IMPORTANT: do NOT call .getReceipt() or .getRecord() on the return value —
// //     //    that routes the query back through DAppSigner which throws:
// //     //    "(BUG) Query.fromBytes() not implemented for type getByKey"
// //     //    Always use TransactionReceiptQuery / TransactionRecordQuery with a plain
// //     //    Client.forName(network) instead (see getReceiptSafe / getRecordSafe below).
// //     await transaction.executeWithSigner(signer);
// //   };

// //   // ✅ Safe receipt fetch — uses plain SDK client, never DAppSigner
// //   const getReceiptSafe = async (txId: TransactionId) => {
// //     const client = Client.forName(network);
// //     return await new TransactionReceiptQuery()
// //       .setTransactionId(txId)
// //       .setIncludeChildren(true)
// //       .execute(client);
// //   };

// //   // ✅ Safe record fetch — uses plain SDK client, never DAppSigner
// //   const getRecordSafe = async (txId: TransactionId) => {
// //     const client = Client.forName(network);
// //     return await new TransactionRecordQuery()
// //       .setTransactionId(txId)
// //       .setIncludeChildren(true)
// //       .execute(client);
// //   };
// // //   const executeWithSigner = async (transaction: any) => {
// // //   return await transaction
// // //     .freezeWithSigner(signer)
// // //     .then((tx: any) => tx.signWithSigner(signer))
// // //     .then((tx: any) => tx.executeWithSigner(signer));
// //  const executeWithSigner = async (transaction: any) => {
// //     // 1. Get the standard Hedera Client
// //     const client = getClient();

// //     // 2. Freeze the transaction with the client.
// //     // This safely populates the required nodeAccountIds without 
// //     // modifying your manually set TransactionId.
// //     transaction.freezeWith(client);

// //     // 3. Sign the transaction using the HashPack signer
// //     const signedTx = await signer.signTransaction(transaction);

// //     // 4. Execute the transaction on the network
// //     return await signedTx.execute(client);
// //   };
 

// //   const formatTxIdForMirror = (txIdStr: string) => {
// //     return txIdStr
// //       .replace("@", "-")
// //       .replace(/\./g, (match, offset, string) => {
// //         const dotCount = string.slice(0, offset + 1).split('.').length - 1;
// //         return dotCount <= 2 ? "." : "-";
// //       });
// //   };

// //   const getMirrorNodeUrl = () => {
// //     return network === "testnet" 
// //       ? "https://testnet.mirrornode.hedera.com" 
// //       : "https://mainnet.mirrornode.hedera.com";
// //   };

// //   // //  const {
// //   //     createInscription,
// //   //     status: inscriptionStatus,
// //   //     progress: inscriptionProgress,
// //   //     result: inscriptionResult,
// //   //     error: inscriptionError,
// //   //     statusText: inscriptionStatusText,
// //   //     reset: resetInscription,
// //   //   // } = useComicInscription({ accountId, signer, network });
  

// //    /**
// //    * Poll Mirror Node for token ID with proper retry logic
// //    * Retries up to 60 times with exponential backoff
// //    */
 
// //   // ============================================
// //   // CREATOR FUNCTIONS
// //   // ============================================

// //   /**
// //    * Step 1: Create Comic Collection
// //    * Call this after backend uploads comic to IPFS
// //    */
// //   // const createComicCollection = async ({
// //   //   episodeId,
// //   //   name,
// //   //   symbol,
// //   //   maxSupply,
// //   // }: {
// //   //   episodeId: string; // From backend (e.g., "ep_001")
// //   //   name: string;
// //   //   symbol: string;
// //   //   maxSupply: number;
// //   // }) => {
// //   //   try {
// //   //     setStatus("processing");
// //   //     setError(null);
// //   //     console.log("📚 Creating comic collection:", { episodeId, name, maxSupply });

// //   //     const tx = new ContractExecuteTransaction()
// //   //       .setContractId(CONTRACTS.COMIC_CORE)
// //   //       .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// //   //       .setGas(15000000)
// //   //       .setPayableAmount(new Hbar(50)) // For NFT token creation
// //   //       .setFunction(
// //   //         "createComicCollection",
// //   //         new ContractFunctionParameters()
// //   //           .addString(episodeId)
// //   //           .addString(name)
// //   //           .addString(symbol)
// //   //           .addString(`${name} Collection`)
// //   //           .addInt64(maxSupply)
// //   //           .addInt64(7000000) // Auto-renew period
// //   //       );

// //   //     const response = await executeWithSigner(tx);
// //   //     const txIdStr = response.transactionId.toString();
// //   //     const receipt = await response.getReceipt(getClient());
// //   //     console.log("✅ Collection created!");
// //   //      await new Promise(resolve => setTimeout(resolve, 5000));
      
// //   //     const txIdFormatted = formatTxIdForMirror(txIdStr);
// //   //     const mirrorResponse = await fetch(
// //   //       `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
// //   //     );
// //   //     const mirrorData = await mirrorResponse.json();
// //   //     console.log("Mirror Node data:", mirrorData);
      
// //   //     const tokenEvmAddress = mirrorData?.call_result 
// //   //       ? "0x" + mirrorData.call_result.slice(-40) 
// //   //       : null;
// //   //     const tokenId = TokenId.fromEvmAddress(0,0,tokenEvmAddress).toString();
// //   //     // const tokenId = mirrorData?.call_result

// //   //     console.log("🎉 New Token ID:", tokenId);

// //   //     setTxId(txIdStr);
// //   //     setStatus("done");

// //   //     return {
// //   //       transactionId: txIdStr,
// //   //       status: receipt.status.toString(),
// //   //       tokenId
// //   //     };
// //   //   } catch (err: any) {
// //   //     console.error("❌ Collection creation failed:", err);
// //   //     setError(err.message);
// //   //     setStatus("error");
// //   //     throw err;
// //   //   }
// //   // };
// //   /**
// //    * Step 1: Create Comic Collection
// //    * Call this after backend uploads comic to IPFS
// //    */
// //  // ============================================
// //   // METHOD 1: Mirror Node Polling
// //   // ============================================
 
// //   const pollMirrorNodeWithRetry = async (
// //     txIdStr: string,
// //     maxRetries: number = 20,  // 20 retries * 2 seconds = 40 seconds
// //     delayMs: number = 2000
// //   ): Promise<string | null> => {
// //     const txIdFormatted = formatTxIdForMirror(txIdStr);
// //     const mirrorNodeUrl = getMirrorNodeUrl();
 
// //     console.log(`📡 Attempting Mirror Node polling (max ${maxRetries} attempts)...`);
 
// //     for (let attempt = 1; attempt <= maxRetries; attempt++) {
// //       try {
// //         setStatusMessage(`[Mirror Node] Indexing... (Attempt ${attempt}/${maxRetries})`);
 
// //         const controller = new AbortController();
// //         const timeoutId = setTimeout(() => controller.abort(), 15000);
 
// //         console.log(`🔍 Mirror Node polling attempt ${attempt}/${maxRetries}...`);
 
// //         const response = await fetch(
// //           `${mirrorNodeUrl}/api/v1/contracts/results/${txIdFormatted}`,
// //           { signal: controller.signal }
// //         );
 
// //         clearTimeout(timeoutId);
 
// //         // 404 means not indexed yet - this is normal
// //         if (response.status === 404) {
// //           console.log(`⏳ Not indexed yet (${attempt}/${maxRetries})`);
// //           await new Promise((resolve) => setTimeout(resolve, delayMs));
// //           continue;
// //         }
 
// //         if (!response.ok) {
// //           throw new Error(`Mirror Node returned status ${response.status}`);
// //         }
 
// //         const mirrorData = await response.json();
// //         console.log("✅ Mirror Node response:", mirrorData);
 
// //         // ============================================
// //         // Check if call_result is empty
// //         // ============================================
 
// //         if (!mirrorData?.call_result || mirrorData.call_result === "0x") {
// //           console.warn("⚠️ Mirror Node returned empty call_result");
// //           // Continue to fallback
// //           return null;
// //         }
 
// //         // Extract token EVM address from call_result
// //         const tokenEvmAddress = "0x" + mirrorData.call_result.slice(-40);
 
// //         if (!tokenEvmAddress || tokenEvmAddress.length !== 42) {
// //           console.warn("⚠️ Invalid EVM address extracted");
// //           return null;
// //         }
 
// //         // Convert EVM address to Hedera token ID
// //         const tokenId = TokenId.fromEvmAddress(0, 0, tokenEvmAddress).toString();
 
// //         if (!tokenId) {
// //           console.warn("⚠️ Failed to convert to token ID");
// //           return null;
// //         }
 
// //         console.log("✅ Successfully extracted token ID from Mirror Node:", tokenId);
// //         return tokenId;
 
// //       } catch (err: any) {
// //         console.warn(`⚠️ Mirror Node attempt ${attempt} failed:`, err.message);
 
// //         // If this is the last attempt, return null to trigger fallback
// //         if (attempt === maxRetries) {
// //           console.warn("❌ Mirror Node polling exhausted, will use fallback");
// //           return null;
// //         }
 
// //         // Exponential backoff
// //         const backoffDelay = attempt > 10 ? delayMs * 2 : delayMs;
// //         await new Promise((resolve) => setTimeout(resolve, backoffDelay));
// //       }
// //     }
 
// //     return null; // Fallback
// //   };
 
// //   // ============================================
// //   // METHOD 2: Event Logs Fallback
// //   // ============================================
 
// //   const extractTokenIdFromLogs = async (txId: TransactionId): Promise<string | null> => {
// //     try {
// //       setStatusMessage("🔄 Mirror Node unavailable, using Event Logs fallback...");

// //       console.log("📝 Attempting to extract token ID from transaction logs...");

// //       // ✅ Use plain client record query — never response.getRecord() via DAppSigner
// //       const record = await getRecordSafe(txId);
// //       const logs = record.contractFunctionResult?.logs;
 
// //       console.log("📋 Transaction logs:", logs);
 
// //       if (!logs || logs.length === 0) {
// //         throw new Error("No event logs found in transaction");
// //       }
 
// //       // Parse the first log (CollectionCreated event)
// //       const log = logs[0];
// //       console.log("📍 Parsing first log...");
 
// //       if (!log.data || log.data.length === 0) {
// //         throw new Error("Log data is empty");
// //       }
 
// //       // Extract token address from log data
// //       // The event emits: event CollectionCreated(address indexed tokenAddress, ...)
// //       const tokenEvmAddress = "0x" + log.data.slice(-40).toString();
 
// //       console.log("📍 Extracted EVM address from logs:", tokenEvmAddress);
 
// //       if (!tokenEvmAddress || tokenEvmAddress.length !== 42) {
// //         throw new Error(`Invalid EVM address: ${tokenEvmAddress}`);
// //       }
 
// //       // Convert EVM address to Hedera token ID
// //       const tokenId = TokenId.fromEvmAddress(0, 0, tokenEvmAddress).toString();
 
// //       if (!tokenId) {
// //         throw new Error("Failed to convert EVM address to token ID");
// //       }
 
// //       console.log("✅ Successfully extracted token ID from Event Logs:", tokenId);
// //       return tokenId;
 
// //     } catch (err: any) {
// //       console.error("❌ Event Logs fallback failed:", err.message);
// //       return null;
// //     }
// //   };
 
// //   // ============================================
// //   // MAIN: Create Comic Collection (Hybrid)
// //   // ============================================
 
// //   const createComicCollection = async ({
// //     episodeId,
// //     name,
// //     symbol,
// //     maxSupply,
// //   }: {
// //     episodeId: string;
// //     name: string;
// //     symbol: string;
// //     maxSupply: number;
// //   }) => {
// //     try {
// //       setStatus("processing");
// //       setError(null);
// //       setStatusMessage("Creating NFT collection...");
// //       setUsedFallback(false);
 
// //       console.log("📚 Creating comic collection:", {
// //         episodeId,
// //         name,
// //         maxSupply,
// //         contract: CONTRACTS.COMIC_CORE,
// //       });
 
// //       // ============================================
// //       // Step 1: Execute Transaction
// //       // ============================================
 
// //       const tx = new ContractExecuteTransaction()
// //         .setContractId(CONTRACTS.COMIC_CORE)
// //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// //         .setGas(15000000)
// //         .setPayableAmount(new Hbar(50))
// //         .setFunction(
// //           "createComicCollection",
// //           new ContractFunctionParameters()
// //             .addString(episodeId)
// //             .addString(name)
// //             .addString(symbol)
// //             .addString(`${name} Collection`)
// //             .addInt64(maxSupply)
// //             .addInt64(7000000)
// //         );
 
// //       setStatusMessage("Signing transaction with HashPack...");
// //       // ✅ Capture the TransactionId BEFORE submitting — we set it ourselves so
// //       //    we don't need to read it back from the (unreliable) wallet response.
// //       const actualTxId = tx.transactionId!;
// //       const txIdStr = actualTxId.toString();
// //       setTxId(txIdStr);

// //       // ✅ executeWithSigner now returns void — do NOT call .getReceipt() on it
// //       await executeWithSigner(tx);
 
// //       console.log("✅ Transaction signed:", txIdStr);
 
// //       // ============================================
// //       // Step 2: Wait for Receipt
// //       // ============================================
 
// //       setStatusMessage("Waiting for transaction confirmation...");
// //       // ✅ Use plain SDK client receipt query, never DAppSigner
// //       let receipt;
// //       try {
// //         receipt = await getReceiptSafe(actualTxId);
// //         console.log("✅ Receipt received - Status:", receipt.status.toString());
// //         if (receipt.status.toString() !== "SUCCESS") {
// //           throw new Error(`Transaction failed with status: ${receipt.status.toString()}`);
// //         }
// //       } catch (receiptErr: any) {
// //         // Receipt query can fail due to node lag even when tx succeeded on-chain.
// //         // Log and continue — mirror node polling will confirm success.
// //         console.warn("⚠️ Receipt query failed, proceeding to Mirror Node check:", receiptErr.message);
// //         receipt = null;
// //       }
 
// //       // ============================================
// //       // Step 3: Try Mirror Node First
// //       // ============================================
 
// //       setStatusMessage("Attempting to index via Mirror Node...");
// //       let tokenId = await pollMirrorNodeWithRetry(txIdStr);
 
// //       // ============================================
// //       // Step 4: Fallback to Event Logs
// //       // ============================================
 
// //       if (!tokenId) {
// //         console.log("⚠️ Mirror Node failed, falling back to Event Logs...");
// //         setUsedFallback(true);
// //         tokenId = await extractTokenIdFromLogs(actualTxId);
// //       }
 
// //       // ============================================
// //       // Step 5: Handle Result
// //       // ============================================
 
// //       if (!tokenId) {
// //         throw new Error(
// //           "Failed to extract token ID from both Mirror Node and Event Logs. " +
// //           "Transaction may have failed. Check contract execution."
// //         );
// //       }
 
// //       console.log(
// //         `🎉 Collection created successfully! ${usedFallback ? "(via Event Logs)" : "(via Mirror Node)"}`
// //       );
 
// //       setStatus("done");
// //       setStatusMessage(
// //         usedFallback
// //           ? "✅ Collection created! (Indexed via Event Logs)"
// //           : "✅ Collection created! (Indexed via Mirror Node)"
// //       );
 
// //       return {
// //         transactionId: txIdStr,
// //         status: receipt?.status.toString() ?? "SUCCESS",
// //         tokenId,
// //         indexedVia: usedFallback ? "event-logs" : "mirror-node",
// //       };
 
// //     } catch (err: any) {
// //       console.error("❌ Collection creation failed:", err.message);
// //       setError(err.message);
// //       setStatus("error");
// //       setStatusMessage(`Error: ${err.message}`);
// //       throw err;
// //     }
// //   };

// // // const createComicCollection = async ({
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
// // //       console.log("📚 Creating comic collection:", { episodeId, name, maxSupply });

// // //       const tx = new ContractExecuteTransaction()
// // //         .setContractId(CONTRACTS.COMIC_CORE)
// // //         // ✅ MUST BE INCLUDED:
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
// // //       console.log('response Tx:', response);
// // //       const txIdStr = response.transactionId.toString();
// // //       console.log("TransactionId:", txIdStr);
// // //       const receipt = await response.getReceipt(getClient());
// // //       console.log("✅ Collection created on ledger! Status:", receipt.status.toString());
      
// // //       const txIdFormatted = formatTxIdForMirror(txIdStr);
// // //       console.log("📡 Polling Mirror Node for Token ID:", txIdFormatted);
      
// // //       // 🔄 SMART POLLING LOOP (Checks every 2 seconds for up to 2 minutes)
// // //       let tokenEvmAddress = null;
// // //       let attempts = 0;
// // //       const maxAttempts = 60; 
      
// // //       while (attempts < maxAttempts && !tokenEvmAddress) {
// // //         attempts++;
// // //         await new Promise(resolve => setTimeout(resolve, 2000)); 
        
// // //         try {
// // //           const mirrorResponse = await fetch(
// // //             `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
// // //           );
          
// // //           if (mirrorResponse.ok) {
// // //             const mirrorData = await mirrorResponse.json();
// // //             if (mirrorData?.call_result) {
// // //               tokenEvmAddress = "0x" + mirrorData.call_result.slice(-40);
// // //               console.log(`✅ Mirror Node indexed result on attempt ${attempts}`);
// // //             }
// // //           } else {
// // //             console.log(`⏳ Mirror Node not ready yet (Attempt ${attempts}/${maxAttempts})...`);
// // //           }
// // //         } catch (mirrorError) {
// // //           console.log("⚠️ Fetch error during polling, retrying...");
// // //         }
// // //       }

// // //       if (!tokenEvmAddress) {
// // //         throw new Error("Transaction succeeded, but timed out waiting for the Mirror Node to index.");
// // //       }

// // //       const tokenId = TokenId.fromEvmAddress(0, 0, tokenEvmAddress).toString();
// // //       console.log("🎉 New Token ID:", tokenId);

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

// //   // ============================================
// //   // PATH 1: DIRECT LISTING
// //   // ============================================

// //   /**
// //    * Create Direct Listing (mints + lists for sale immediately)
// //    */
// //   // const createDirectListing = async ({
// //   //   episodeId,
// //   //   quantity,
// //   //   pricePerNFT,
// //   //   metadata,
// //   // }: {
// //   //   episodeId: string;
// //   //   quantity: number;
// //   //   pricePerNFT: number; // in HBAR
// //   //   metadata: string; // "hcs://1/topicId"
// //   // }) => {
// //   //   try {
// //   //     setStatus("processing");
// //   //     setError(null);
// //   //     // console.log("💼 Starting Inscription process...");
// //   //     // const inscriptionResult = await createInscription(metadata, episodeId);
// //   //     // console.log("✅ Inscription created:", inscriptionResult);
// //   //     console.log("🏪 Proceeding to create direct listing:", { episodeId, quantity, pricePerNFT });
// //   //     console.log("🏪 Creating direct listing:", { episodeId, quantity, pricePerNFT });

// //   //     const priceInTinybars = Hbar.from(pricePerNFT, HbarUnit.Hbar).toTinybars();
// //   //       // const topicId = inscriptionResult.topicId || '';
// //   //       // console.log("🎉 Inscription Topic ID:", topicId);
// //   //       // const metadataHRL = `hcs://1/${topicId}`;
// //   //         // console.log("Metadata HRL:", metadataHRL);
// //   //     //  const BATCH_SIZE = 10;
// //   //     // let allSerials: number[] = [];
// //   //     // let mintedCount = 0;
// //   //     // for (let batchStart = 0; batchStart < quantity; batchStart += BATCH_SIZE) {
// //   //     //         const batchEnd = Math.min(batchStart + BATCH_SIZE, quantity);
// //   //     //         const batchCount = batchEnd - batchStart;
              
// //   //     //         console.log(`📦 Minting batch: NFTs ${batchStart + 1}-${batchEnd} (${batchCount} NFTs)`);
              
// //   //             // Create metadata buffers for this batch only
// //   //             // const metadataBuffers = Array(batchCount).fill(
// //   //             //   Buffer.from(metadata || "")
// //   //             // );
// //   //     const tx = new ContractExecuteTransaction()
// //   //       .setContractId(CONTRACTS.COMIC_SALES)
// //   //       .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
// //   //       .setGas(5000000 + (quantity * 500000))
// //   //       .setFunction(
// //   //         "createDirectListing",
// //   //         new ContractFunctionParameters()
// //   //           .addString(episodeId)
// //   //           .addUint256(quantity)
// //   //           .addUint256(priceInTinybars)
// //   //            .addBytes(Buffer.from(metadata))
// //   //             //.addBytesArray(metadataBuffers)
// //   //       );

// //   //     const response = await executeWithSigner(tx);
// //   //     const txIdStr = response.transactionId.toString();
// //   //     const receipt = await response.getReceipt(getClient());

// //   //     console.log("✅ Direct listing created!");
      

// //   //     setTxId(txIdStr);
// //   //     setStatus("done");
      
// //   //     // Get listing ID from mirror node (optional)
// //   //     await new Promise(resolve => setTimeout(resolve, 5000));
// //   //     const txIdFormatted = formatTxIdForMirror(txIdStr);
// //   //     const mirrorResponse = await fetch(
// //   //       `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
// //   //     );
// //   //     const mirrorData = await mirrorResponse.json();
// //   //     console.log("Mirror Node data:", mirrorData);
      
// //   //     let listingId: string | undefined;
// //   //     if (mirrorData?.call_result) {
// //   //       listingId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
// //   //     }
    

// //   //     return {
// //   //       transactionId: txIdStr,
// //   //       status: receipt.status.toString(),
// //   //       listingId,
// //   //     };
// //   //      // metadataHRL
// //   //     // };
// //   //   } catch (err: any) {
// //   //     console.error("❌ Direct listing failed:", err);
// //   //     setError(err.message);
// //   //     setStatus("error");
// //   //     throw err;
// //   //   }
// //   // };

// //     /**
// //    * Create Direct Listing (mints + lists for sale immediately)
// //    * NOW WITH BATCH SUPPORT FOR MINTING
// //    */
// //   const createDirectListing = async ({
// //     episodeId,
// //     quantity,
// //     pricePerNFT,
// //     metadata,
// //   }: {
// //     episodeId: string;
// //     quantity: number;
// //     pricePerNFT: number; // in HBAR
// //     metadata: string; // "hcs://1/topicId"
// //   }) => {
// //     let lastTxId = '';
// //     try {
// //       setStatus("processing");
// //       setError(null);
// //       setMintProgress(0);
// //       console.log("🏪 Creating direct listing with batch minting:", { episodeId, quantity, pricePerNFT });

// //       const priceInTinybars = Hbar.from(pricePerNFT, HbarUnit.Hbar).toTinybars();
      
// //       // Constants for batch processing
// //       const BATCH_SIZE = 10; // Hedera's limit
// //       const totalBatches = Math.ceil(quantity / BATCH_SIZE);
// //       let completedBatches = 0;

// //       console.log(`📦 Will mint in ${totalBatches} batches of up to ${BATCH_SIZE} NFTs each`);

// //       // Process in batches
// //       for (let batchStart = 0; batchStart < quantity; batchStart += BATCH_SIZE) {
// //         const batchEnd = Math.min(batchStart + BATCH_SIZE, quantity);
// //         const batchQuantity = batchEnd - batchStart;
// //         const currentBatch = completedBatches + 1;
        
// //         console.log(`📦 Processing batch ${currentBatch}/${totalBatches}: NFTs ${batchStart + 1}-${batchEnd} (${batchQuantity} NFTs)`);
// //         //setMintStatusText(`Minting batch ${currentBatch}/${totalBatches} (${batchQuantity} NFTs)...`);

// //         try {
// //           const batchTxId = TransactionId.generate(AccountId.fromString(accountId));
// //           const tx = new ContractExecuteTransaction()
// //             .setContractId(CONTRACTS.COMIC_SALES)
// //             .setTransactionId(batchTxId)
// //             .setGas(5000000 + (batchQuantity * 500000))
// //             .setFunction(
// //               "createDirectListing",
// //               new ContractFunctionParameters()
// //                 .addString(episodeId)
// //                 .addUint256(batchQuantity)
// //                 .addUint256(priceInTinybars)
// //                 .addBytes(Buffer.from(metadata))
// //             );

// //           await executeWithSigner(tx);
// //           const txIdStr = batchTxId.toString();
// //           const receipt = await getReceiptSafe(batchTxId);
// //           console.log("✅ Batch direct listing created!", receipt);
// //            lastTxId = txIdStr;

// //           console.log(`✅ Batch ${currentBatch}/${totalBatches} completed! Transaction: ${txIdStr}`);
          
// //           completedBatches++;
// //           const progress = (completedBatches / totalBatches) * 100;
// //           setMintProgress(progress);

// //           // Add delay between batches to avoid rate limiting
// //           if (batchEnd < quantity) {
// //             console.log("⏳ Waiting 3 seconds before next batch...");
// //             await new Promise(resolve => setTimeout(resolve, 3000));
// //           }

// //           // Store the last transaction ID for return
// //           // if (batchEnd >= quantity) {
// //           //   setTxId(txIdStr);
// //           // }

// //         } catch (batchError: any) {
// //           console.error(`❌ Batch ${currentBatch}/${totalBatches} failed:`, batchError);
// //           throw new Error(`Batch minting failed at NFTs ${batchStart + 1}-${batchEnd}: ${batchError.message}`);
// //         }
// //       }

// //       console.log("✅ All batches completed! Direct listing created successfully!");
// //       setMintProgress(100);
// //       setTxId(lastTxId);
// //       // setMintStatusText(`Successfully minted and listed ${quantity} NFTs!`);
// //       setStatus("done");
      
// //       // Get listing ID from mirror node for the last transaction
// //       await new Promise(resolve => setTimeout(resolve, 5000));
// //       const txIdFormatted = formatTxIdForMirror(lastTxId);
// //       const mirrorResponse = await fetch(
// //         `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
// //       );
// //       const mirrorData = await mirrorResponse.json();
// //       console.log("Mirror Node data:", mirrorData);
      
// //       let listingId: string | undefined;
// //       if (mirrorData?.call_result) {
// //         listingId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
// //       }

// //       return {
// //         transactionId: lastTxId,
// //         status: "SUCCESS",
// //         listingId,
// //         totalMinted: quantity,
// //         batches: totalBatches,
// //       };
// //     } catch (err: any) {
// //       console.error("❌ Direct listing with batch minting failed:", err);
// //       setError(err.message);
// //       setStatus("error");
// //       // setMintProgress(0);
// //       throw err;
// //     }
// //   };
// //   /**
// //    * Purchase from Direct Listing
// //    */
// //   const purchaseFromListing = async ({
// //     listingId,
// //     quantity,
// //     pricePerNFT,
// //   }: {
// //     listingId: number;
// //     quantity: number;
// //     pricePerNFT: number; // in HBAR
// //   }) => {
// //     try {
// //       setStatus("processing");
// //       setError(null);
// //       console.log("💳 Purchasing from listing:", { listingId, quantity });

// //       const totalPrice = pricePerNFT * quantity;

// //       const purchaseTxId = TransactionId.generate(AccountId.fromString(accountId));
// //       const tx = new ContractExecuteTransaction()
// //         .setContractId(CONTRACTS.COMIC_SALES)
// //         .setTransactionId(purchaseTxId)
// //         // .setGas(2000000)
// //         .setGas(5000000 + (quantity * 500000))
// //         .setPayableAmount(new Hbar(totalPrice, HbarUnit.Hbar))
// //         .setFunction(
// //           "purchaseFromListing",
// //           new ContractFunctionParameters()
// //             .addUint256(typeof listingId === "string" ? parseInt(listingId) : listingId)
// //             .addUint256(quantity)
// //         );

// //       await executeWithSigner(tx);
// //       const txIdStr = purchaseTxId.toString();
// //       const receipt = await getReceiptSafe(purchaseTxId);

// //       console.log("✅ Purchase successful! You can now read this comic!");
// //       setTxId(txIdStr);
// //       setStatus("done");

// //       return {
// //         transactionId: txIdStr,
// //         status: receipt.status.toString(),
// //       };
// //     } catch (err: any) {
// //       console.error("❌ Purchase failed:", err);
// //       setError(err.message);
// //       setStatus("error");
// //       throw err;
// //     }
// //   };

// //   // ============================================
// //   // PATH 2: CAMPAIGN/DROP SYSTEM
// //   // ============================================

// //   /**
// //    * Create Campaign (Public/Whitelist/Scheduled)
// //    */
// //   const createCampaign = async ({
// //     episodeId,
// //     campaignType,
// //     mintPrice,
// //     maxSupply,
// //     maxPerWallet,
// //     metadata,
// //   }: {
// //     episodeId: string;
// //     campaignType: CampaignType;
// //     mintPrice: number; // in HBAR
// //     maxSupply: number;
// //     maxPerWallet: number;
// //     metadata: string;
// //   }) => {
// //     try {
// //       setStatus("processing");
// //       setError(null);
// //       console.log("🎯 Creating campaign:", { episodeId, campaignType, maxSupply });

// //       const priceInTinybars = Hbar.from(mintPrice, HbarUnit.Hbar).toTinybars();

// //       const campaignTxId = TransactionId.generate(AccountId.fromString(accountId));
// //       const tx = new ContractExecuteTransaction()
// //         .setContractId(CONTRACTS.COMIC_SALES)
// //         .setTransactionId(campaignTxId)
// //         .setGas(4000000)
// //         .setFunction(
// //           "createCampaign",
// //           new ContractFunctionParameters()
// //             .addString(episodeId)
// //             .addUint8(campaignType)
// //             .addUint256(priceInTinybars)
// //             .addUint256(maxSupply)
// //             .addUint256(maxPerWallet)
// //             .addBytes(Buffer.from(metadata))
// //         );

// //       await executeWithSigner(tx);
// //       const txIdStr = campaignTxId.toString();
// //       const receipt = await getReceiptSafe(campaignTxId);
// //         await new Promise(resolve => setTimeout(resolve, 5000));
// //       const txIdFormatted = formatTxIdForMirror(txIdStr);
// //       const mirrorResponse = await fetch(
// //         `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
// //       );
// //       const mirrorData = await mirrorResponse.json();
// //       console.log("Mirror Node data:", mirrorData);
      
// //       let campaignId: string | undefined;
// //       if (mirrorData?.call_result) {
// //         campaignId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
// //       }
// //       console.log("🎉 New Campaign ID:", campaignId);
// //       setTxId(txIdStr);
// //       setStatus("done");
// //       console.log("✅ Campaign created!");
     

// //       return {
// //         transactionId: txIdStr,
// //         status: receipt.status.toString(),
// //         campaignId: campaignId
// //       };
// //     } catch (err: any) {
// //       console.error("❌ Campaign creation failed:", err);
// //       setError(err.message);
// //       setStatus("error");
// //       throw err;
// //     }
// //   };

// //   /**
// //    * Add addresses to whitelist (for WHITELIST campaigns)
// //    */
// //   const addToWhitelist = async ({
// //     campaignId,
// //     addresses,
// //     allocations,
// //   }: {
// //     campaignId: number;
// //     addresses: string[];
// //     allocations: number[];
// //   }) => {
// //     try {
// //       setStatus("processing");
// //       setError(null);
// //       console.log("📋 Adding to whitelist:", { campaignId, count: addresses.length });

// //       const whitelistTxId = TransactionId.generate(AccountId.fromString(accountId));
// //       const tx = new ContractExecuteTransaction()
// //         .setContractId(CONTRACTS.COMIC_SALES)
// //         .setTransactionId(whitelistTxId)
// //         .setGas(1000000 + (addresses.length * 100000))
// //         .setFunction(
// //           "addToWhitelist",
// //           new ContractFunctionParameters()
// //             .addUint256(campaignId)
// //             .addAddressArray(addresses)
// //             .addUint256Array(allocations)
// //         );

// //       await executeWithSigner(tx);
// //       const receipt = await getReceiptSafe(whitelistTxId);

// //       console.log("✅ Whitelist updated!");
// //       setTxId(whitelistTxId.toString());
// //       setStatus("done");

// //       return {
// //         transactionId: whitelistTxId.toString(),
// //         status: receipt.status.toString(),
// //       };
// //     } catch (err: any) {
// //       console.error("❌ Whitelist update failed:", err);
// //       setError(err.message);
// //       setStatus("error");
// //       throw err;
// //     }
// //   };

// //   /**
// //    * Add phase (for SCHEDULED campaigns)
// //    */
// //   const addPhase = async ({
// //     campaignId,
// //     phaseType,
// //     startTime,
// //     endTime,
// //     mintPrice,
// //     maxPerWallet,
// //     phaseSupply,
// //   }: {
// //     campaignId: number;
// //     phaseType: PhaseType;
// //     startTime: number; // Unix timestamp
// //     endTime: number;
// //     mintPrice: number; // in HBAR
// //     maxPerWallet: number;
// //     phaseSupply: number;
// //   }) => {
// //     try {
// //       setStatus("processing");
// //       setError(null);
// //       console.log("⏰ Adding phase:", { campaignId, phaseType });

// //       const priceInTinybars = Hbar.from(mintPrice, HbarUnit.Hbar).toTinybars();

// //       const phaseTxId = TransactionId.generate(AccountId.fromString(accountId));
// //       const tx = new ContractExecuteTransaction()
// //         .setContractId(CONTRACTS.COMIC_SALES)
// //         .setTransactionId(phaseTxId)
// //         .setGas(2000000)
// //         .setFunction(
// //           "addPhase",
// //           new ContractFunctionParameters()
// //             .addUint256(campaignId)
// //             .addUint8(phaseType)
// //             .addUint256(startTime)
// //             .addUint256(endTime)
// //             .addUint256(priceInTinybars)
// //             .addUint256(maxPerWallet)
// //             .addUint256(phaseSupply)
// //         );

// //       await executeWithSigner(tx);
// //       const receipt = await getReceiptSafe(phaseTxId);

// //       console.log("✅ Phase added!");
// //       setTxId(phaseTxId.toString());
// //       setStatus("done");

// //       return {
// //         transactionId: phaseTxId.toString(),
// //         status: receipt.status.toString(),
// //       };
// //     } catch (err: any) {
// //       console.error("❌ Phase add failed:", err);
// //       setError(err.message);
// //       setStatus("error");
// //       throw err;
// //     }
// //   };

// //   /**
// //    * Mint from Campaign
// //    */
// //   const mintFromCampaign = async ({
// //     campaignId,
// //     phaseId = 0,
// //     quantity,
// //     mintPrice,
// //   }: {
// //     campaignId: number;
// //     phaseId?: number; // 0 for PUBLIC/WHITELIST, specific ID for SCHEDULED
// //     quantity: number;
// //     mintPrice: number; // in HBAR
// //   }) => {
// //     try {
// //       setStatus("processing");
// //       setError(null);
// //       console.log("🎨 Minting from campaign:", { campaignId, quantity });

// //       const totalPrice = mintPrice * quantity;

// //       const mintTxId = TransactionId.generate(AccountId.fromString(accountId));
// //       const tx = new ContractExecuteTransaction()
// //         .setContractId(CONTRACTS.COMIC_SALES)
// //         .setTransactionId(mintTxId)
// //         .setGas(4000000 + (quantity * 500000))
// //         .setPayableAmount(new Hbar(totalPrice, HbarUnit.Hbar))
// //         .setFunction(
// //           "mint",
// //           new ContractFunctionParameters()
// //             .addUint256(campaignId)
// //             .addUint256(phaseId)
// //             .addUint256(quantity)
// //         );

// //       await executeWithSigner(tx);
// //       const txIdStr = mintTxId.toString();
// //       const receipt = await getReceiptSafe(mintTxId);

// //       console.log("✅ Mint successful! You can now read this comic!");
// //       setTxId(txIdStr);
// //       setStatus("done");

// //       return {
// //         transactionId: txIdStr,
// //         status: receipt.status.toString(),
// //       };
// //     } catch (err: any) {
// //       console.error("❌ Mint failed:", err);
// //       setError(err.message);
// //       setStatus("error");
// //       throw err;
// //     }
// //   };

// //   // ============================================
// //   // MARKETPLACE - RESALE
// //   // ============================================

// //   /**
// //    * List NFT for Resale
// //    */
// //   const listForResale = async ({
// //     tokenAddress,
// //     serialNumber,
// //     priceInHbar,
// //   }: {
// //     tokenAddress: string;
// //     serialNumber: number;
// //     priceInHbar: number;
// //   }) => {
// //     try {
// //       setStatus("processing");
// //       setError(null);
// //       console.log("📝 Listing for resale:", { serialNumber, priceInHbar });

// //       const priceInTinybars = Hbar.from(priceInHbar, HbarUnit.Hbar).toTinybars();

// //       const resaleTxId = TransactionId.generate(AccountId.fromString(accountId));
// //       const tx = new ContractExecuteTransaction()
// //         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
// //         .setTransactionId(resaleTxId)
// //         .setGas(5000000)
// //         .setFunction(
// //           "depositAndListForResale",
// //           new ContractFunctionParameters()
// //             .addAddress(TokenId.fromString(tokenAddress).toEvmAddress())
// //             .addInt64(serialNumber)
// //             .addUint256(priceInTinybars)
// //         );

// //       await executeWithSigner(tx);
// //       const txIdStr = resaleTxId.toString();
// //       const receipt = await getReceiptSafe(resaleTxId);

// //       console.log("✅ Listed for resale!");
// //       setTxId(txIdStr);
// //       setStatus("done");

// //       // Get listing ID
// //       await new Promise(resolve => setTimeout(resolve, 5000));
// //       const txIdFormatted = formatTxIdForMirror(txIdStr);
// //       const mirrorResponse = await fetch(
// //         `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
// //       );
// //       const mirrorData = await mirrorResponse.json();
      
// //       let listingId: string | undefined;
// //       if (mirrorData?.call_result) {
// //         listingId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
// //       }
      
// //           const serials: number[] = [];
// //           let allSerials: number[] = [];
// //           if (mirrorData?.call_result) {
// //             const result = mirrorData.call_result.slice(2);
// //             const arrayLengthHex = result.slice(64, 128);
// //             const arrayLength = parseInt(arrayLengthHex, 16);
            
// //             for (let i = 0; i < arrayLength; i++) {
// //               const start = 128 + (i * 64);
// //               const serialHex = result.slice(start, start + 64);
// //               const serial = parseInt(serialHex, 16);
// //               if (serial > 0) serials.push(serial);
// //             }
          
// //             allSerials = allSerials.concat(serials);
// //             console.log("🎉 Minted serials:", serials);
// //           }
// //       return {
// //         transactionId: txIdStr,
// //         status: receipt.status.toString(),
// //         listingId,
// //         serials: allSerials
// //       };
// //     } catch (err: any) {
// //       console.error("❌ List for resale failed:", err);
// //       setError(err.message);
// //       setStatus("error");
// //       throw err;
// //     }
// //   };

// //   /**
// //    * Batch list multiple NFTs for resale
// //    */
// //   const batchListForResale = async ({
// //     tokenAddress,
// //     serialNumbers,
// //     prices,
// //   }: {
// //     tokenAddress: string;
// //     serialNumbers: number[];
// //     prices: number[]; // in HBAR
// //   }) => {
// //     try {
// //       setStatus("processing");
// //       setError(null);
// //       console.log("📝 Batch listing for resale:", { count: serialNumbers.length });

// //       const pricesInTinybars = prices.map(p => Hbar.from(p, HbarUnit.Hbar).toTinybars());

// //       const batchResaleTxId = TransactionId.generate(AccountId.fromString(accountId));
// //       const tx = new ContractExecuteTransaction()
// //         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
// //         .setTransactionId(batchResaleTxId)
// //         .setGas(3000000 + (serialNumbers.length * 300000))
// //         .setFunction(
// //           "batchDepositAndListForResale",
// //           new ContractFunctionParameters()
// //             .addAddress(TokenId.fromString(tokenAddress).toEvmAddress())
// //             .addInt64Array(serialNumbers)
// //             .addUint256Array(pricesInTinybars)
// //         );

// //       await executeWithSigner(tx);
// //       const txIdStr = batchResaleTxId.toString();
// //       const receipt = await getReceiptSafe(batchResaleTxId);

// //       console.log("✅ Batch listed for resale!");
// //       setTxId(txIdStr);
// //       setStatus("done");

// //       return {
// //         transactionId: txIdStr,
// //         status: receipt.status.toString(),
// //       };
// //     } catch (err: any) {
// //       console.error("❌ Batch list failed:", err);
// //       setError(err.message);
// //       setStatus("error");
// //       throw err;
// //     }
// //   };

// //   /**
// //    * Purchase from Marketplace (Resale)
// //    */
// //   const purchaseFromMarketplace = async ({
// //     listingId,
// //     priceInHbar,
// //   }: {
// //     listingId: number;
// //     priceInHbar: number;
// //   }) => {
// //     try {
// //       setStatus("processing");
// //       setError(null);
// //       console.log("💳 Purchasing from marketplace:", { listingId });

// //       const mktTxId = TransactionId.generate(AccountId.fromString(accountId));
// //       const tx = new ContractExecuteTransaction()
// //         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
// //         .setTransactionId(mktTxId)
// //         .setGas(5000000)
// //         .setPayableAmount(new Hbar(priceInHbar, HbarUnit.Hbar))
// //         .setFunction(
// //           "purchaseNFT",
// //           new ContractFunctionParameters()
// //             .addUint256(typeof listingId === "string" ? parseInt(listingId) : listingId)
// //         );

// //       await executeWithSigner(tx);
// //       const txIdStr = mktTxId.toString();
// //       const receipt = await getReceiptSafe(mktTxId);

// //       console.log("✅ Purchase successful! Reading access transferred!");
// //       setTxId(txIdStr);
// //       setStatus("done");

// //       return {
// //         transactionId: txIdStr,
// //         status: receipt.status.toString(),
// //       };
// //     } catch (err: any) {
// //       console.error("❌ Purchase failed:", err);
// //       setError(err.message);
// //       setStatus("error");
// //       throw err;
// //     }
// //   };

// //   /**
// //    * Cancel Listing
// //    */
// //   const cancelListing = async (listingId: number) => {
// //     try {
// //       setStatus("processing");
// //       setError(null);

// //       const cancelTxId = TransactionId.generate(AccountId.fromString(accountId));
// //       const tx = new ContractExecuteTransaction()
// //         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
// //         .setTransactionId(cancelTxId)
// //         .setGas(2000000)
// //         .setFunction(
// //           "cancelListing",
// //           new ContractFunctionParameters()
// //             .addUint256(listingId)
// //         );

// //       await executeWithSigner(tx);
// //       const receipt = await getReceiptSafe(cancelTxId);

// //       setTxId(cancelTxId.toString());
// //       setStatus("done");

// //       return {
// //         transactionId: cancelTxId.toString(),
// //         status: receipt.status.toString(),
// //       };
// //     } catch (err: any) {
// //       setError(err.message);
// //       setStatus("error");
// //       throw err;
// //     }
// //   };

// //   // ============================================
// //   // QUERY FUNCTIONS
// //   // ============================================

// //  const canReadComic = async (episodeId: string, userAddress: string): Promise<boolean> => {
// //   try {
// //     const abi = ['function canReadComic(string episodeId, address user) external view returns (bool)'];
// //     const abiInterface = new ethers.Interface(abi);
// //     const encodedData = abiInterface.encodeFunctionData('canReadComic', [episodeId, userAddress]);

// //     // Convert contract ID to EVM address (e.g., 0.0.1234 → 0x00000000000000000000000000000000000004d2)
// //     // const contractAddress = ContractId.fromString(CONTRACTS.COMIC_CORE).toEvmAddress();
// // const contractAddress = mirrorNodeService.hederaIdToEvmAddress(CONTRACTS.COMIC_CORE);
// //     const response = await fetch('https://testnet.mirrornode.hedera.com/api/v1/contracts/call', {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify({
// //         block: 'latest',
// //         data: encodedData,
// //         to: contractAddress
// //       })
// //     });

// //     const result = await response.json();
// //     console.log('Raw canReadComic result:', result);
    
// //     // Decode the boolean result
// //     const decoded = abiInterface.decodeFunctionResult('canReadComic', result.result);
// //     console.log('Decoded canReadComic result:', decoded[0]);
    
// //     return decoded[0];
// //   } catch (err) {
// //     console.error('❌ Query failed:', err);
// //     return false;
// //   }
// // };


// //   /**
// //    * Check if user can read comic (for backend)
// //    */
// //   // const canReadComic = async (episodeId: string, userAddress: string): Promise<boolean> => {
// //   //   try {
// //   //     const client = Client.forName(network);

// //   //     const query = new ContractCallQuery()
// //   //       .setContractId(CONTRACTS.COMIC_CORE)
// //   //       .setGas(100000)
// //   //       .setFunction(
// //   //         "canReadComic",
// //   //         new ContractFunctionParameters()
// //   //           .addString(episodeId)
// //   //           .addAddress(userAddress)
// //   //       );

// //   //     const result = await query.execute(client);
// //   //     return result.getBool(0);
// //   //   } catch (err: any) {
// //   //     console.error("❌ Query failed:", err);
// //   //     return false;
// //   //   }
// //   // };

// //   /**
// //    * Get episode details
// //    */
// //   const getEpisode = async (episodeId: string) => {
// //     try {
// //       const client = Client.forName(network);

// //       const query = new ContractCallQuery()
// //         .setContractId(CONTRACTS.COMIC_CORE)
// //         .setGas(100000)
// //         .setFunction(
// //           "getEpisode",
// //           new ContractFunctionParameters()
// //             .addString(episodeId)
// //         );

// //       const result = await query.execute(client);

// //       return {
// //         tokenAddress: result.getAddress(0),
// //         creator: result.getAddress(1),
// //         name: result.getString(2),
// //         maxSupply: Number(result.getInt64(3)),
// //         currentSupply: Number(result.getInt64(4)),
// //         exists: result.getBool(5),
// //       };
// //     } catch (err: any) {
// //       console.error("❌ Query failed:", err);
// //       throw err;
// //     }
// //   };

// //   /**
// //    * Get campaign details
// //    */
// //   const getCampaign = async (campaignId: number) => {
// //     try {
// //       const client = Client.forName(network);

// //       const query = new ContractCallQuery()
// //         .setContractId(CONTRACTS.COMIC_SALES)
// //         .setGas(150000)
// //         .setFunction(
// //           "getCampaign",
// //           new ContractFunctionParameters()
// //             .addUint256(campaignId)
// //         );

// //       const result = await query.execute(client);

// //       const campaignTypeNum = Number(result.getUint8(2));
// //       const campaignTypeMap: { [key: number]: CampaignType } = {
// //         0: CampaignType.PUBLIC,
// //         1: CampaignType.WHITELIST,
// //         2: CampaignType.SCHEDULED,
// //       };
      
// //       return {
// //         episodeId: result.getString(0),
// //         creator: result.getAddress(1),
// //         campaignType: campaignTypeMap[campaignTypeNum] || CampaignType.PUBLIC,
// //         mintPrice: result.getUint256(3).toString(),
// //         maxSupply: result.getUint256(4).toString(),
// //         totalMinted: result.getUint256(5).toString(),
// //         isActive: result.getBool(6),
// //       };
// //     } catch (err: any) {
// //       console.error("❌ Query failed:", err);
// //       throw err;
// //     }
// //   };

// //   /**
// //    * Get direct listing details
// //    */
// //   const getDirectListing = async (listingId: number) => {
// //     try {
// //       const client = Client.forName(network);

// //       const query = new ContractCallQuery()
// //         .setContractId(CONTRACTS.COMIC_SALES)
// //         .setGas(100000)
// //         .setFunction(
// //           "getDirectListing",
// //           new ContractFunctionParameters()
// //             .addUint256(listingId)
// //         );

// //       const result = await query.execute(client);

// //       return {
// //         episodeId: result.getString(0),
// //         creator: result.getAddress(1),
// //         pricePerNFT: result.getUint256(2).toString(),
// //         available: result.getUint256(3).toString(),
// //         isActive: result.getBool(4),
// //       };
// //     } catch (err: any) {
// //       console.error("❌ Query failed:", err);
// //       throw err;
// //     }
// //   };

// //   /**
// //    * Get marketplace listing details
// //    */
// //   const getMarketplaceListing = async (listingId: number) => {
// //     try {
// //       const client = Client.forName(network);

// //       const query = new ContractCallQuery()
// //         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
// //         .setGas(100000)
// //         .setFunction(
// //           "getListing",
// //           new ContractFunctionParameters()
// //             .addUint256(listingId)
// //         );
// //        const result = await query.execute(client);
// //       console.log("Marketplace listing result:", result);

// //       return {
// //         tokenAddress: result.getAddress(0),
// //         serialNumber: Number(result.getInt64(1)),
// //         seller: result.getAddress(2),
// //         price: result.getUint256(3).toString(),
// //         isActive: result.getBool(4),
// //       };
// //     } catch (err: any) {
// //       console.error("❌ Query failed:", err);
// //       throw err;
// //     }
// //   };

// //   /**
// //    * Get current phase for scheduled campaign
// //    */
// //   const getCurrentPhase = async (campaignId: number) => {
// //     try {
// //       const client = Client.forName(network);

// //       const query = new ContractCallQuery()
// //         .setContractId(CONTRACTS.COMIC_SALES)
// //         .setGas(200000)
// //         .setFunction(
// //           "getCurrentPhase",
// //           new ContractFunctionParameters()
// //             .addUint256(campaignId)
// //         );

// //       const result = await query.execute(client);

// //       return {
// //         phaseId: Number(result.getUint256(0)),
// //         exists: result.getBool(1),
// //       };
// //     } catch (err: any) {
// //       console.error("❌ Query failed:", err);
// //       throw err;
// //     }
// //   };

// //   return {
// //     // Creator functions
// //     createComicCollection,
// //     createDirectListing,
// //     createCampaign,
// //     addToWhitelist,
// //     addPhase,
    
// //     // User functions - Buying
// //     purchaseFromListing,
// //     mintFromCampaign,
    
// //     // User functions - Reselling
// //     listForResale,
// //     batchListForResale,
// //     purchaseFromMarketplace,
// //     cancelListing,
    
// //     // Query functions
// //     canReadComic,
// //     getEpisode,
// //     getCampaign,
// //     getDirectListing,
// //     getMarketplaceListing,
// //     getCurrentPhase,
    
// //     // State
// //     status,
// //     error,
// //     txId,
// //     statusMessage,
// //     usedFallback,
// //   };
// // }

// // export default useComicPlatform;
// // function setMintProgress(progress: number) {
// //   if (Number.isNaN(progress)) return;
// //   const clamped = Math.max(0, Math.min(100, progress));
// //   console.debug("Mint progress:", clamped);
// // }



// import { useState } from "react";
// import {
//   ContractExecuteTransaction,
//   ContractFunctionParameters,
//   Client,
//   AccountId,
//   TransactionId,
//   Hbar,
//   HbarUnit,
//   TokenId,
// } from "@hashgraph/sdk";
// import { ethers } from "ethers";
// import MirrorNodeService from "./MirrorNodeService";

// // ─── Contracts ────────────────────────────────────────────────────────────────
// const CONTRACTS = {
//   COMIC_CORE:        "0.0.7806656",
//   COMIC_SALES:       "0.0.7829668",
//   COMIC_MARKETPLACE: "0.0.7829656",
// };

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface UseComicPlatformProps {
//   accountId: string;
//   signer: any;
//   network?: "testnet" | "mainnet";
// }

// export enum CampaignType {
//   PUBLIC    = 0,
//   WHITELIST = 1,
//   SCHEDULED = 2,
// }

// export enum PhaseType {
//   WHITELIST = 0,
//   PUBLIC    = 1,
// }

// // ─── Hook ─────────────────────────────────────────────────────────────────────
// export function useComicPlatform({
//   accountId,
//   signer,
//   network = "testnet",
// }: UseComicPlatformProps) {
//   const mirrorNodeService = new MirrorNodeService(network);

//   const [status,        setStatus]        = useState<"idle" | "processing" | "done" | "error">("idle");
//   const [error,         setError]         = useState<string | null>(null);
//   const [txId,          setTxId]          = useState<string | null>(null);
//   const [statusMessage, setStatusMessage] = useState<string>("");
//   const [usedFallback,  setUsedFallback]  = useState<boolean>(false);
//   const [mintProgress,  setMintProgress]  = useState<number>(0);

//   // ═══════════════════════════════════════════════════════════════════════════
//   // MIRROR NODE REST HELPERS
//   // All reads go through Mirror Node REST API — zero SDK queries, zero DAppSigner
//   // ═══════════════════════════════════════════════════════════════════════════

//   const MIRROR_BASE =
//     network === "testnet"
//       ? "https://testnet.mirrornode.hedera.com"
//       : "https://mainnet.mirrornode.hedera.com";

//   /**
//    * Convert "0.0.1234@1700000000.123456789" → "0.0.1234-1700000000-123456789"
//    * This is the format the Mirror Node REST API expects in URL paths.
//    */
//   const txIdToMirrorFormat = (txId: TransactionId): string => {
//     const str = txId.toString();           // "0.0.1234@1700000000.123456789"
//     const [account, timestamp] = str.split("@");
//     const [secs, nanos]        = timestamp.split(".");
//     return `${account}-${secs}-${nanos.padStart(9, "0")}`;
//   };

//   const getPrimaryTransaction = (transactionData: any) => {
//     const transactions = transactionData?.transactions ?? [];
//     return transactions.find((tx: any) => tx?.nonce === 0) ?? transactions[0];
//   };

//   const extractTokenIdFromTransactionData = (transactionData: any): string | null => {
//     const transactions = transactionData?.transactions ?? [];
//     const tokenCreationTx = transactions.find((tx: any) => {
//       return String(tx?.name ?? "").toUpperCase() === "TOKENCREATION" && tx?.entity_id;
//     });

//     const tokenId = tokenCreationTx?.entity_id;
//     return typeof tokenId === "string" && /^\d+\.\d+\.\d+$/.test(tokenId) ? tokenId : null;
//   };

//   const tokenIdFromEvmHex = (value?: string | null): string | null => {
//     if (!value) return null;

//     const clean = value.replace(/^0x/i, "");
//     if (clean.length < 40) return null;

//     const evmAddress = `0x${clean.slice(-40)}`;
//     if (/^0x0{40}$/i.test(evmAddress)) return null;

//     try {
//       return TokenId.fromEvmAddress(0, 0, evmAddress).toString();
//     } catch (_) {
//       return null;
//     }
//   };

//   const extractTokenIdFromEventLogs = (logsData: any): string | null => {
//     const logs = logsData?.logs ?? [];

//     for (const log of logs) {
//       // CollectionCreated(string indexed episodeId, address indexed tokenAddress, ...)
//       const tokenTopic = Array.isArray(log?.topics) ? log.topics[2] : null;
//       const tokenFromTopic = tokenIdFromEvmHex(tokenTopic);
//       if (tokenFromTopic) return tokenFromTopic;
//     }

//     for (const log of logs) {
//       const tokenFromData = tokenIdFromEvmHex(log?.data);
//       if (tokenFromData) return tokenFromData;
//     }

//     return null;
//   };

//   /**
//    * Poll GET /api/v1/transactions/{id} until the transaction is indexed.
//    * The response can include child transactions; HTS token creation is often
//    * exposed there as TOKENCREATION with entity_id set to the new token ID.
//    */
//   const pollTransactionData = async (
//     txId: TransactionId,
//     maxAttempts = 40,
//     intervalMs  = 3000
//   ): Promise<any> => {
//     const mirrorTxId = txIdToMirrorFormat(txId);
//     const url        = `${MIRROR_BASE}/api/v1/transactions/${mirrorTxId}`;

//     console.log(`📡 Polling tx status: ${url}`);

//     for (let attempt = 1; attempt <= maxAttempts; attempt++) {
//       setStatusMessage(`Confirming transaction on-chain... (${attempt}/${maxAttempts})`);
//       try {
//         const res = await fetch(url);

//         if (res.status === 404) {
//           // Normal — not indexed yet
//           console.log(`⏳ Tx not yet indexed (${attempt}/${maxAttempts})`);
//           await delay(intervalMs);
//           continue;
//         }

//         if (!res.ok) {
//           throw new Error(`Mirror Node returned HTTP ${res.status}`);
//         }

//         const data = await res.json();
//         const tx = getPrimaryTransaction(data);

//         if (!tx?.result) {
//           await delay(intervalMs);
//           continue;
//         }

//         console.log(`✅ Tx confirmed with status: ${tx.result}`);
//         return data;
//       } catch (err: any) {
//         console.warn(`⚠️ pollTxStatus attempt ${attempt} error:`, err.message);
//         await delay(intervalMs);
//       }
//     }

//     throw new Error("Transaction confirmation timed out — Mirror Node did not index it in time.");
//   };

//   /**
//    * Poll GET /api/v1/transactions/{id} until the transaction is indexed
//    * and has a result field, then return it (e.g. "SUCCESS").
//    *
//    * This completely replaces TransactionReceiptQuery — no SDK client needed.
//    */
//   const pollTxStatus = async (
//     txId: TransactionId,
//     maxAttempts = 40,
//     intervalMs  = 3000
//   ): Promise<string> => {
//     const data = await pollTransactionData(txId, maxAttempts, intervalMs);
//     return getPrimaryTransaction(data)?.result as string;
//   };

//   /**
//    * Poll GET /api/v1/contracts/results/{txId} until the contract result is
//    * indexed, then return the parsed call_result hex string.
//    *
//    * Used to extract return values (token address, listing ID, etc.).
//    */
//   const pollContractResult = async (
//     txId: TransactionId,
//     maxAttempts = 40,
//     intervalMs  = 3000
//   ): Promise<any> => {
//     const mirrorTxId = txIdToMirrorFormat(txId);
//     const url        = `${MIRROR_BASE}/api/v1/contracts/results/${mirrorTxId}`;

//     console.log(`📡 Polling contract result: ${url}`);

//     for (let attempt = 1; attempt <= maxAttempts; attempt++) {
//       setStatusMessage(`Indexing contract result... (${attempt}/${maxAttempts})`);
//       try {
//         const controller = new AbortController();
//         const timeoutId  = setTimeout(() => controller.abort(), 15000);
//         const res        = await fetch(url, { signal: controller.signal });
//         clearTimeout(timeoutId);

//         if (res.status === 404) {
//           console.log(`⏳ Contract result not indexed yet (${attempt}/${maxAttempts})`);
//           await delay(intervalMs);
//           continue;
//         }

//         if (!res.ok) {
//           throw new Error(`Mirror Node returned HTTP ${res.status}`);
//         }

//         const data = await res.json();

//         if (!data?.call_result || data.call_result === "0x") {
//           console.warn("⚠️ call_result empty, retrying...");
//           await delay(intervalMs);
//           continue;
//         }

//         console.log("✅ Contract result indexed:", data);
//         return data;
//       } catch (err: any) {
//         if (err.name === "AbortError") {
//           console.warn(`⚠️ pollContractResult attempt ${attempt} timed out`);
//         } else {
//           console.warn(`⚠️ pollContractResult attempt ${attempt} error:`, err.message);
//         }
//         if (attempt === maxAttempts) return null;
//         await delay(intervalMs);
//       }
//     }

//     return null;
//   };

//   /**
//    * Mirror Node contract/call — replaces ContractCallQuery entirely.
//    * Used for read-only (view) function calls.
//    */
//   const mirrorContractCall = async (
//     contractId: string,
//     encodedData: string
//   ): Promise<string> => {
//     const contractAddress = mirrorNodeService.hederaIdToEvmAddress(contractId);
//     const res = await fetch(`${MIRROR_BASE}/api/v1/contracts/call`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         block: "latest",
//         data:  encodedData,
//         to:    contractAddress,
//       }),
//     });

//     if (!res.ok) {
//       const text = await res.text();
//       throw new Error(`Mirror Node contract/call failed (${res.status}): ${text}`);
//     }

//     const json = await res.json();
//     return json.result as string;
//   };

//   // ═══════════════════════════════════════════════════════════════════════════
//   // WALLET / SUBMIT HELPER
//   // ═══════════════════════════════════════════════════════════════════════════

//   /**
//    * Freeze and submit a transaction through the connected wallet (HashPack).
//    *
//    * Returns void — do NOT call .getReceipt() or .getRecord() on whatever
//    * the wallet SDK hands back.  All confirmation is done via Mirror Node REST.
//    */
//   // const executeWithSigner = async (transaction: any): Promise<void> => {
//   //   // Give WalletConnect 3 minutes before the tx expires on-chain
//   //   transaction.setTransactionValidDuration(180);

//   //   // Freeze so node account IDs are populated, using the wallet's embedded client
//   //   const client = signer._client ?? signer.client;
//   //   if (client) {
//   //     transaction.freezeWith(client);
//   //   } else {
//   //     // Fallback: freeze without a client (requires transactionId + nodeAccountIds already set)
//   //     transaction.freeze();
//   //   }

//   //   // Submit through wallet — discard return value
//   //   await transaction.executeWithSigner(signer);
//   // };
//   const getClient = () => {
//    if (signer._client) return signer._client;
//      if (signer.client) return signer.client;
//          return Client.forName(network);
//   };

//   const executeWithSigner = async (transaction: any) => {
//     const signedTx = await signer.signTransaction(transaction);
//     console.log("signeTransaction", signedTx);
//     return await signedTx.executeWithSigner(signer);
// };

// // const executeWithSigner = async (transaction: any) => {

// //   transaction.freezeWithSigner(signer);

// //   const signedTx = await transaction.signWithSigner(signer);
// //   console.log("Signer", signedTx); 

// //   return await signedTx.executeWithSigner(signer);
// // };
// //  const executeWithSigner = async (transaction: any) => {
// //   try {
// //     console.log("🚀 Executing transaction...");

// //     // // Freeze the transaction
// //     await transaction.freezeWithSigner(signer);

// //     // HashPack will prompt the user and sign internally
// //     const response = await transaction.executeWithSigner(signer);

// //     console.log(
// //       "✅ Submitted:",
// //       response.transactionId?.toString()
// //     );

// //     return response;
// //   } catch (err) {
// //     console.error("❌ executeWithSigner failed:", err);
// //     throw err;
// //   }
// // };
 

//   // ═══════════════════════════════════════════════════════════════════════════
//   // UTILITY
//   // ═══════════════════════════════════════════════════════════════════════════

//   const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

//   const getMirrorNodeUrl = () => MIRROR_BASE;

//   // ═══════════════════════════════════════════════════════════════════════════
//   // CREATOR: Create Comic Collection
//   // ═══════════════════════════════════════════════════════════════════════════

//   const createComicCollection = async ({
//     episodeId,
//     name,
//     symbol,
//     maxSupply,
//   }: {
//     episodeId: string;
//     name:      string;
//     symbol:    string;
//     maxSupply: number;
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       setUsedFallback(false);
//       setStatusMessage("Preparing NFT collection transaction...");

//       console.log("📚 Creating comic collection:", { episodeId, name, maxSupply });

//       // ── Step 1: Build transaction & capture its ID before submitting ────────
//       //const actualTxId = TransactionId.generate(AccountId.fromString(accountId));

//       const tx = new ContractExecuteTransaction()
//         .setContractId(CONTRACTS.COMIC_CORE)
//         //.setTransactionId(actualTxId)
//         .setTransactionValidDuration(180) // 3 minutes
//         .setGas(15000000)
//         .setPayableAmount(new Hbar(30))
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

//       // const txIdStr = actualTxId.toString();
//       // console.log("✅ Transaction submitted:", txIdStr);
//       // setTxId(txIdStr);

//       // ── Step 2: Submit through wallet ───────────────────────────────────────
//       setStatusMessage("Please approve the transaction in your wallet...");
//       const response = await executeWithSigner(tx);

//       console.log("response:", response);
//       console.log("response.transactionId:", response.transactionId?.toString());
//       //console.log("actualTxId:", actualTxId.toString());
//       const actualTxId = response.transactionId;
//        console.log(actualTxId.toString());

//        setTxId(actualTxId.toString());
      

//       // ── Step 3: Confirm via Mirror Node /transactions ───────────────────────
//       // This replaces getReceipt() — pure REST, no SDK client needed
//       setStatusMessage("Waiting for on-chain confirmation...");
//       const transactionData = await pollTransactionData(actualTxId);
//       const txStatus = getPrimaryTransaction(transactionData)?.result;

//       if (txStatus !== "SUCCESS") {
//         throw new Error(`Transaction failed on-chain with status: ${txStatus}`);
//       }

//       // ── Step 4: Prefer the TOKENCREATION child record from Mirror Node ───────
//       setStatusMessage("Resolving new token ID from Mirror Node...");
//       let tokenId: string | null = extractTokenIdFromTransactionData(transactionData);

//       if (tokenId) {
//         console.log("✅ Token ID from Mirror Node transaction entity:", tokenId);
//       } else {
//         // ── Step 5: Get contract result (token address) from Mirror Node ───────
//         setStatusMessage("Fetching new token ID from Mirror Node...");
//         const contractResult = await pollContractResult(actualTxId, 8, 3000);

//         if (contractResult?.call_result) {
//           tokenId = tokenIdFromEvmHex(contractResult.call_result);
//           if (tokenId) {
//             console.log("✅ Token ID from Mirror Node contract result:", tokenId);
//           }
//         }
//       }

//       // ── Step 6: Fallback — extract from event logs via Mirror Node ──────────
//       if (!tokenId) {
//         setUsedFallback(true);
//         setStatusMessage("Extracting token from event logs...");
//         console.log("⚠️ Falling back to event log extraction...");

//         const mirrorTxId = txIdToMirrorFormat(actualTxId);
//         const logsRes    = await fetch(
//           `${MIRROR_BASE}/api/v1/contracts/results/${mirrorTxId}/logs?order=asc&limit=5`
//         );

//         if (logsRes.ok) {
//           const logsData = await logsRes.json();
//           tokenId = extractTokenIdFromEventLogs(logsData);
//           if (tokenId) {
//             console.log("✅ Token ID from event logs:", tokenId);
//           }
//         }
//       }

//       if (!tokenId) {
//         throw new Error(
//           "Collection was created on-chain but token ID could not be extracted. " +
//           "Check HashScan for tx: " + txIdStr
//         );
//       }

//       setStatus("done");
//       setStatusMessage(
//         usedFallback
//           ? "✅ Collection created! (Token ID from event logs)"
//           : "✅ Collection created!"
//       );

//       return {
//         transactionId: txIdStr,
//         status:        "SUCCESS",
//         tokenId,
//         indexedVia:    usedFallback ? "event-logs" : "mirror-node",
//       };
//     } catch (err: any) {
//       console.error("❌ Collection creation failed:", err.message);
//       setError(err.message);
//       setStatus("error");
//       setStatusMessage(`Error: ${err.message}`);
//       throw err;
//     }
//   };

//   // ═══════════════════════════════════════════════════════════════════════════
//   // CREATOR: Create Direct Listing (batch mint)
//   // ═══════════════════════════════════════════════════════════════════════════

//   const createDirectListing = async ({
//     episodeId,
//     quantity,
//     pricePerNFT,
//     metadata,
//   }: {
//     episodeId:  string;
//     quantity:   number;
//     pricePerNFT: number;
//     metadata:   string;
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       setMintProgress(0);

//       console.log("🏪 Creating direct listing (batch):", { episodeId, quantity, pricePerNFT });

//       const priceInTinybars = Hbar.from(pricePerNFT, HbarUnit.Hbar).toTinybars();
//       const BATCH_SIZE      = 10;
//       const totalBatches    = Math.ceil(quantity / BATCH_SIZE);
//       let   completedBatches = 0;
//       let   lastTxId        = "";

//       for (let batchStart = 0; batchStart < quantity; batchStart += BATCH_SIZE) {
//         const batchEnd      = Math.min(batchStart + BATCH_SIZE, quantity);
//         const batchQuantity = batchEnd - batchStart;
//         const currentBatch  = completedBatches + 1;

//         console.log(`📦 Batch ${currentBatch}/${totalBatches}: NFTs ${batchStart + 1}–${batchEnd}`);

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

//           setStatusMessage(`Batch ${currentBatch}/${totalBatches} — approve in wallet...`);
//           await executeWithSigner(tx);

//           // ✅ Confirm via Mirror Node REST
//           const txStatus = await pollTxStatus(batchTxId);
//           if (txStatus !== "SUCCESS") {
//             throw new Error(`Batch ${currentBatch} failed on-chain: ${txStatus}`);
//           }

//           lastTxId = batchTxId.toString();
//           console.log(`✅ Batch ${currentBatch}/${totalBatches} confirmed`);

//           completedBatches++;
//           setMintProgress((completedBatches / totalBatches) * 100);

//           if (batchEnd < quantity) {
//             await delay(3000);
//           }
//         } catch (batchError: any) {
//           throw new Error(
//             `Batch minting failed at NFTs ${batchStart + 1}–${batchEnd}: ${batchError.message}`
//           );
//         }
//       }

//       setMintProgress(100);
//       setTxId(lastTxId);
//       setStatus("done");
//       setStatusMessage("✅ Direct listing created!");

//       // Get listing ID from last batch's contract result
//       const lastactualTxId = TransactionId.generate(AccountId.fromString(accountId));
//       // Re-poll the last tx for its contract result
//       let listingId: string | undefined;
//       try {
//         const lastMirrorTxId = lastTxId
//           .replace("@", "-")
//           .replace(/\.(?=\d{9}$)/, "-");
//         const mirrorRes = await fetch(
//           `${MIRROR_BASE}/api/v1/contracts/results/${lastMirrorTxId}`
//         );
//         if (mirrorRes.ok) {
//           const mirrorData = await mirrorRes.json();
//           if (mirrorData?.call_result) {
//             listingId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
//           }
//         }
//       } catch (_) { /* listing ID is optional */ }

//       return {
//         transactionId: lastTxId,
//         status:        "SUCCESS",
//         listingId,
//         totalMinted:   quantity,
//         batches:       totalBatches,
//       };
//     } catch (err: any) {
//       console.error("❌ Direct listing failed:", err);
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   // ═══════════════════════════════════════════════════════════════════════════
//   // BUYER: Purchase from Direct Listing
//   // ═══════════════════════════════════════════════════════════════════════════

//   const purchaseFromListing = async ({
//     listingId,
//     quantity,
//     pricePerNFT,
//   }: {
//     listingId:  number;
//     quantity:   number;
//     pricePerNFT: number;
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("💳 Purchasing from listing:", { listingId, quantity });

//       const totalPrice    = pricePerNFT * quantity;
//       const purchaseTxId  = TransactionId.generate(AccountId.fromString(accountId));

//       const tx = new ContractExecuteTransaction()
//         .setContractId(CONTRACTS.COMIC_SALES)
//         .setTransactionId(purchaseTxId)
//         .setGas(5000000 + quantity * 500000)
//         .setPayableAmount(new Hbar(totalPrice, HbarUnit.Hbar))
//         .setFunction(
//           "purchaseFromListing",
//           new ContractFunctionParameters()
//             .addUint256(typeof listingId === "string" ? parseInt(listingId) : listingId)
//             .addUint256(quantity)
//         );

//       setStatusMessage("Approve purchase in your wallet...");
//       await executeWithSigner(tx);

//       // ✅ Mirror Node REST confirmation
//       const txStatus = await pollTxStatus(purchaseTxId);
//       if (txStatus !== "SUCCESS") {
//         throw new Error(`Purchase failed on-chain: ${txStatus}`);
//       }

//       const txIdStr = purchaseTxId.toString();
//       setTxId(txIdStr);
//       setStatus("done");
//       setStatusMessage("✅ Purchase successful! You can now read this comic!");

//       return { transactionId: txIdStr, status: "SUCCESS" };
//     } catch (err: any) {
//       console.error("❌ Purchase failed:", err);
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   // ═══════════════════════════════════════════════════════════════════════════
//   // CREATOR: Create Campaign
//   // ═══════════════════════════════════════════════════════════════════════════

//   const createCampaign = async ({
//     episodeId,
//     campaignType,
//     mintPrice,
//     maxSupply,
//     maxPerWallet,
//     metadata,
//   }: {
//     episodeId:    string;
//     campaignType: CampaignType;
//     mintPrice:    number;
//     maxSupply:    number;
//     maxPerWallet: number;
//     metadata:     string;
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("🎯 Creating campaign:", { episodeId, campaignType, maxSupply });

//       const priceInTinybars = Hbar.from(mintPrice, HbarUnit.Hbar).toTinybars();
//       const campaignTxId    = TransactionId.generate(AccountId.fromString(accountId));

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

//       setStatusMessage("Approve campaign creation in your wallet...");
//       await executeWithSigner(tx);

//       // ✅ Mirror Node REST confirmation
//       const txStatus = await pollTxStatus(campaignTxId);
//       if (txStatus !== "SUCCESS") {
//         throw new Error(`Campaign creation failed on-chain: ${txStatus}`);
//       }

//       // Get campaign ID from contract result
//       const contractResult = await pollContractResult(campaignTxId);
//       let campaignId: string | undefined;
//       if (contractResult?.call_result) {
//         campaignId = BigInt("0x" + contractResult.call_result.slice(2)).toString();
//       }
//       console.log("🎉 New Campaign ID:", campaignId);

//       const txIdStr = campaignTxId.toString();
//       setTxId(txIdStr);
//       setStatus("done");
//       setStatusMessage("✅ Campaign created!");

//       return { transactionId: txIdStr, status: "SUCCESS", campaignId };
//     } catch (err: any) {
//       console.error("❌ Campaign creation failed:", err);
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   // ═══════════════════════════════════════════════════════════════════════════
//   // CREATOR: Add Whitelist
//   // ═══════════════════════════════════════════════════════════════════════════

//   const addToWhitelist = async ({
//     campaignId,
//     addresses,
//     allocations,
//   }: {
//     campaignId:  number;
//     addresses:   string[];
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

//       setStatusMessage("Approve whitelist update in your wallet...");
//       await executeWithSigner(tx);

//       const txStatus = await pollTxStatus(whitelistTxId);
//       if (txStatus !== "SUCCESS") {
//         throw new Error(`Whitelist update failed on-chain: ${txStatus}`);
//       }

//       const txIdStr = whitelistTxId.toString();
//       setTxId(txIdStr);
//       setStatus("done");
//       setStatusMessage("✅ Whitelist updated!");

//       return { transactionId: txIdStr, status: "SUCCESS" };
//     } catch (err: any) {
//       console.error("❌ Whitelist update failed:", err);
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   // ═══════════════════════════════════════════════════════════════════════════
//   // CREATOR: Add Phase
//   // ═══════════════════════════════════════════════════════════════════════════

//   const addPhase = async ({
//     campaignId,
//     phaseType,
//     startTime,
//     endTime,
//     mintPrice,
//     maxPerWallet,
//     phaseSupply,
//   }: {
//     campaignId:   number;
//     phaseType:    PhaseType;
//     startTime:    number;
//     endTime:      number;
//     mintPrice:    number;
//     maxPerWallet: number;
//     phaseSupply:  number;
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("⏰ Adding phase:", { campaignId, phaseType });

//       const priceInTinybars = Hbar.from(mintPrice, HbarUnit.Hbar).toTinybars();
//       const phaseTxId       = TransactionId.generate(AccountId.fromString(accountId));

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

//       setStatusMessage("Approve phase creation in your wallet...");
//       await executeWithSigner(tx);

//       const txStatus = await pollTxStatus(phaseTxId);
//       if (txStatus !== "SUCCESS") {
//         throw new Error(`Phase creation failed on-chain: ${txStatus}`);
//       }

//       const txIdStr = phaseTxId.toString();
//       setTxId(txIdStr);
//       setStatus("done");
//       setStatusMessage("✅ Phase added!");

//       return { transactionId: txIdStr, status: "SUCCESS" };
//     } catch (err: any) {
//       console.error("❌ Phase add failed:", err);
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   // ═══════════════════════════════════════════════════════════════════════════
//   // BUYER: Mint from Campaign
//   // ═══════════════════════════════════════════════════════════════════════════

//   const mintFromCampaign = async ({
//     campaignId,
//     phaseId = 0,
//     quantity,
//     mintPrice,
//   }: {
//     campaignId: number;
//     phaseId?:   number;
//     quantity:   number;
//     mintPrice:  number;
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("🎨 Minting from campaign:", { campaignId, quantity });

//       const totalPrice = mintPrice * quantity;
//       const mintTxId   = TransactionId.generate(AccountId.fromString(accountId));

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

//       setStatusMessage("Approve mint in your wallet...");
//       await executeWithSigner(tx);

//       const txStatus = await pollTxStatus(mintTxId);
//       if (txStatus !== "SUCCESS") {
//         throw new Error(`Mint failed on-chain: ${txStatus}`);
//       }

//       const txIdStr = mintTxId.toString();
//       setTxId(txIdStr);
//       setStatus("done");
//       setStatusMessage("✅ Mint successful! You can now read this comic!");

//       return { transactionId: txIdStr, status: "SUCCESS" };
//     } catch (err: any) {
//       console.error("❌ Mint failed:", err);
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   // ═══════════════════════════════════════════════════════════════════════════
//   // RESALE: List NFT
//   // ═══════════════════════════════════════════════════════════════════════════

//   const listForResale = async ({
//     tokenAddress,
//     serialNumber,
//     priceInHbar,
//   }: {
//     tokenAddress: string;
//     serialNumber: number;
//     priceInHbar:  number;
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("📝 Listing for resale:", { serialNumber, priceInHbar });

//       const priceInTinybars = Hbar.from(priceInHbar, HbarUnit.Hbar).toTinybars();
//       const resaleTxId      = TransactionId.generate(AccountId.fromString(accountId));

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

//       setStatusMessage("Approve listing in your wallet...");
//       await executeWithSigner(tx);

//       const txStatus = await pollTxStatus(resaleTxId);
//       if (txStatus !== "SUCCESS") {
//         throw new Error(`Listing failed on-chain: ${txStatus}`);
//       }

//       // Get listing ID + serial numbers from contract result
//       const contractResult = await pollContractResult(resaleTxId);
//       let listingId: string | undefined;
//       let allSerials: number[] = [];

//       if (contractResult?.call_result) {
//         const result = contractResult.call_result.slice(2);
//         listingId    = BigInt("0x" + result.slice(0, 64)).toString();

//         // Decode array of serial numbers
//         const arrayLengthHex = result.slice(64, 128);
//         const arrayLength    = parseInt(arrayLengthHex, 16);
//         for (let i = 0; i < arrayLength; i++) {
//           const start  = 128 + i * 64;
//           const serial = parseInt(result.slice(start, start + 64), 16);
//           if (serial > 0) allSerials.push(serial);
//         }
//         console.log("🎉 Listing ID:", listingId, "Serials:", allSerials);
//       }

//       const txIdStr = resaleTxId.toString();
//       setTxId(txIdStr);
//       setStatus("done");
//       setStatusMessage("✅ Listed for resale!");

//       return { transactionId: txIdStr, status: "SUCCESS", listingId, serials: allSerials };
//     } catch (err: any) {
//       console.error("❌ List for resale failed:", err);
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   // ═══════════════════════════════════════════════════════════════════════════
//   // RESALE: Batch List NFTs
//   // ═══════════════════════════════════════════════════════════════════════════

//   const batchListForResale = async ({
//     tokenAddress,
//     serialNumbers,
//     prices,
//   }: {
//     tokenAddress:  string;
//     serialNumbers: number[];
//     prices:        number[];
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("📝 Batch listing for resale:", { count: serialNumbers.length });

//       const pricesInTinybars = prices.map((p) => Hbar.from(p, HbarUnit.Hbar).toTinybars());
//       const batchResaleTxId  = TransactionId.generate(AccountId.fromString(accountId));

//       const tx = new ContractExecuteTransaction()
//         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
//         .setTransactionId(batchResaleTxId)
//         .setGas(3000000 + serialNumbers.length * 300000)
//         .setFunction(
//           "batchDepositAndListForResale",
//           new ContractFunctionParameters()
//             .addAddress(TokenId.fromString(tokenAddress).toEvmAddress())
//             .addInt64Array(serialNumbers)
//             .addUint256Array(pricesInTinybars)
//         );

//       setStatusMessage("Approve batch listing in your wallet...");
//       await executeWithSigner(tx);

//       const txStatus = await pollTxStatus(batchResaleTxId);
//       if (txStatus !== "SUCCESS") {
//         throw new Error(`Batch listing failed on-chain: ${txStatus}`);
//       }

//       const txIdStr = batchResaleTxId.toString();
//       setTxId(txIdStr);
//       setStatus("done");
//       setStatusMessage("✅ Batch listed for resale!");

//       return { transactionId: txIdStr, status: "SUCCESS" };
//     } catch (err: any) {
//       console.error("❌ Batch list failed:", err);
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   // ═══════════════════════════════════════════════════════════════════════════
//   // BUYER: Purchase from Marketplace
//   // ═══════════════════════════════════════════════════════════════════════════

//   const purchaseFromMarketplace = async ({
//     listingId,
//     priceInHbar,
//   }: {
//     listingId:  number;
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
//           new ContractFunctionParameters()
//             .addUint256(typeof listingId === "string" ? parseInt(listingId) : listingId)
//         );

//       setStatusMessage("Approve purchase in your wallet...");
//       await executeWithSigner(tx);

//       const txStatus = await pollTxStatus(mktTxId);
//       if (txStatus !== "SUCCESS") {
//         throw new Error(`Marketplace purchase failed on-chain: ${txStatus}`);
//       }

//       const txIdStr = mktTxId.toString();
//       setTxId(txIdStr);
//       setStatus("done");
//       setStatusMessage("✅ Purchase successful! Reading access transferred!");

//       return { transactionId: txIdStr, status: "SUCCESS" };
//     } catch (err: any) {
//       console.error("❌ Purchase failed:", err);
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   // ═══════════════════════════════════════════════════════════════════════════
//   // SELLER: Cancel Listing
//   // ═══════════════════════════════════════════════════════════════════════════

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

//       setStatusMessage("Approve cancellation in your wallet...");
//       await executeWithSigner(tx);

//       const txStatus = await pollTxStatus(cancelTxId);
//       if (txStatus !== "SUCCESS") {
//         throw new Error(`Cancel listing failed on-chain: ${txStatus}`);
//       }

//       const txIdStr = cancelTxId.toString();
//       setTxId(txIdStr);
//       setStatus("done");
//       setStatusMessage("✅ Listing cancelled!");

//       return { transactionId: txIdStr, status: "SUCCESS" };
//     } catch (err: any) {
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   // ═══════════════════════════════════════════════════════════════════════════
//   // READ-ONLY QUERIES — all via Mirror Node REST, zero SDK ContractCallQuery
//   // ═══════════════════════════════════════════════════════════════════════════

//   /**
//    * Check if a user has read access to a comic episode.
//    * Uses Mirror Node /contracts/call (eth_call equivalent).
//    */
//   const canReadComic = async (episodeId: string, userAddress: string): Promise<boolean> => {
//     try {
//       const abi          = ["function canReadComic(string episodeId, address user) external view returns (bool)"];
//       const iface        = new ethers.Interface(abi);
//       const encodedData  = iface.encodeFunctionData("canReadComic", [episodeId, userAddress]);
//       const result       = await mirrorContractCall(CONTRACTS.COMIC_CORE, encodedData);
//       const decoded      = iface.decodeFunctionResult("canReadComic", result);
//       return decoded[0] as boolean;
//     } catch (err) {
//       console.error("❌ canReadComic query failed:", err);
//       return false;
//     }
//   };

//   /**
//    * Get episode details via Mirror Node contract/call.
//    */
//   const getEpisode = async (episodeId: string) => {
//     try {
//       const abi = [
//         "function getEpisode(string episodeId) external view returns (address tokenAddress, address creator, string name, int64 maxSupply, int64 currentSupply, bool exists)",
//       ];
//       const iface       = new ethers.Interface(abi);
//       const encodedData = iface.encodeFunctionData("getEpisode", [episodeId]);
//       const result      = await mirrorContractCall(CONTRACTS.COMIC_CORE, encodedData);
//       const decoded     = iface.decodeFunctionResult("getEpisode", result);
//       return {
//         tokenAddress:  decoded[0] as string,
//         creator:       decoded[1] as string,
//         name:          decoded[2] as string,
//         maxSupply:     Number(decoded[3]),
//         currentSupply: Number(decoded[4]),
//         exists:        decoded[5] as boolean,
//       };
//     } catch (err: any) {
//       console.error("❌ getEpisode query failed:", err);
//       throw err;
//     }
//   };

//   /**
//    * Get campaign details via Mirror Node contract/call.
//    */
//   const getCampaign = async (campaignId: number) => {
//     try {
//       const abi = [
//         "function getCampaign(uint256 campaignId) external view returns (string episodeId, address creator, uint8 campaignType, uint256 mintPrice, uint256 maxSupply, uint256 totalMinted, bool isActive)",
//       ];
//       const iface       = new ethers.Interface(abi);
//       const encodedData = iface.encodeFunctionData("getCampaign", [campaignId]);
//       const result      = await mirrorContractCall(CONTRACTS.COMIC_SALES, encodedData);
//       const decoded     = iface.decodeFunctionResult("getCampaign", result);

//       const campaignTypeMap: { [key: number]: CampaignType } = {
//         0: CampaignType.PUBLIC,
//         1: CampaignType.WHITELIST,
//         2: CampaignType.SCHEDULED,
//       };

//       return {
//         episodeId:    decoded[0] as string,
//         creator:      decoded[1] as string,
//         campaignType: campaignTypeMap[Number(decoded[2])] ?? CampaignType.PUBLIC,
//         mintPrice:    decoded[3].toString(),
//         maxSupply:    decoded[4].toString(),
//         totalMinted:  decoded[5].toString(),
//         isActive:     decoded[6] as boolean,
//       };
//     } catch (err: any) {
//       console.error("❌ getCampaign query failed:", err);
//       throw err;
//     }
//   };

//   /**
//    * Get direct listing details via Mirror Node contract/call.
//    */
//   const getDirectListing = async (listingId: number) => {
//     try {
//       const abi = [
//         "function getDirectListing(uint256 listingId) external view returns (string episodeId, address creator, uint256 pricePerNFT, uint256 available, bool isActive)",
//       ];
//       const iface       = new ethers.Interface(abi);
//       const encodedData = iface.encodeFunctionData("getDirectListing", [listingId]);
//       const result      = await mirrorContractCall(CONTRACTS.COMIC_SALES, encodedData);
//       const decoded     = iface.decodeFunctionResult("getDirectListing", result);
//       return {
//         episodeId:  decoded[0] as string,
//         creator:    decoded[1] as string,
//         pricePerNFT: decoded[2].toString(),
//         available:  decoded[3].toString(),
//         isActive:   decoded[4] as boolean,
//       };
//     } catch (err: any) {
//       console.error("❌ getDirectListing query failed:", err);
//       throw err;
//     }
//   };

//   /**
//    * Get marketplace listing details via Mirror Node contract/call.
//    */
//   const getMarketplaceListing = async (listingId: number) => {
//     try {
//       const abi = [
//         "function getListing(uint256 listingId) external view returns (address tokenAddress, int64 serialNumber, address seller, uint256 price, bool isActive)",
//       ];
//       const iface       = new ethers.Interface(abi);
//       const encodedData = iface.encodeFunctionData("getListing", [listingId]);
//       const result      = await mirrorContractCall(CONTRACTS.COMIC_MARKETPLACE, encodedData);
//       const decoded     = iface.decodeFunctionResult("getListing", result);
//       return {
//         tokenAddress: decoded[0] as string,
//         serialNumber: Number(decoded[1]),
//         seller:       decoded[2] as string,
//         price:        decoded[3].toString(),
//         isActive:     decoded[4] as boolean,
//       };
//     } catch (err: any) {
//       console.error("❌ getMarketplaceListing query failed:", err);
//       throw err;
//     }
//   };

//   /**
//    * Get current phase for a scheduled campaign via Mirror Node contract/call.
//    */
//   const getCurrentPhase = async (campaignId: number) => {
//     try {
//       const abi = [
//         "function getCurrentPhase(uint256 campaignId) external view returns (uint256 phaseId, bool exists)",
//       ];
//       const iface       = new ethers.Interface(abi);
//       const encodedData = iface.encodeFunctionData("getCurrentPhase", [campaignId]);
//       const result      = await mirrorContractCall(CONTRACTS.COMIC_SALES, encodedData);
//       const decoded     = iface.decodeFunctionResult("getCurrentPhase", result);
//       return {
//         phaseId: Number(decoded[0]),
//         exists:  decoded[1] as boolean,
//       };
//     } catch (err: any) {
//       console.error("❌ getCurrentPhase query failed:", err);
//       throw err;
//     }
//   };

//   // ═══════════════════════════════════════════════════════════════════════════
//   // EXPORTS
//   // ═══════════════════════════════════════════════════════════════════════════

//   return {
//     // Creator
//     createComicCollection,
//     createDirectListing,
//     createCampaign,
//     addToWhitelist,
//     addPhase,

//     // Buyer
//     purchaseFromListing,
//     mintFromCampaign,

//     // Resale
//     listForResale,
//     batchListForResale,
//     purchaseFromMarketplace,
//     cancelListing,

//     // Queries
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
//     mintProgress,
//   };
// }

// export default useComicPlatform;
