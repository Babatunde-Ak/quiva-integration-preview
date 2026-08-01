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
// } from "@hiero-ledger/sdk";
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

//   /**
//    * Ensure we have a 0x-prefixed 20-byte EVM address for contract calls.
//    * Accepts either a Hedera token ID (e.g. "0.0.1234") or an EVM hex address.
//    */
//   const ensureEvmAddress = (tokenAddr: string): string => {
//     if (!tokenAddr) throw new Error("Invalid token address");
//     const asTrim = tokenAddr.trim();

//     if (/^0x[0-9a-fA-F]{40}$/.test(asTrim)) return asTrim;

//     try {
//       // If it's a Hedera token id like 0.0.1234
//       return TokenId.fromString(asTrim).toEvmAddress();
//     } catch (_) {
//       // Try to treat it as raw hex without 0x
//       const clean = asTrim.replace(/^0x/i, "");
//       if (clean.length === 40) return `0x${clean}`;
//       throw new Error("Unable to convert token identifier to EVM address");
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

//   // ═══════════════════════════════════════════════════════════════════════════
//   // UTILITY
//   // ═══════════════════════════════════════════════════════════════════════════

//   const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

//   const getMirrorNodeUrl = () => MIRROR_BASE;

//   // ═══════════════════════════════════════════════════════════════════════════
//   // MIRROR NODE CONTRACT CALL
//   // ═══════════════════════════════════════════════════════════════════════════

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
//   /**
//    * Execute a transaction through the connected wallet signer (HashPack).
//    * 
//    * The correct Hiero SDK pattern:
//    * 1. freezeWithSigner() - sets node account IDs and prepares for signing
//    * 2. execute() - submits the signed transaction to the network
//    * 
//    * @param {any} transaction - The transaction to execute
//    * @returns {Promise<TransactionResponse>}
//    */
//   // const executeWithSigner = async (transaction: any) => {
//   //   try {
//   //     console.log("🔐 Freezing transaction with signer...");
//   //     // freezeWithSigner handles signing internally via the signer/wallet
//   //     await transaction.freezeWithSigner(signer);
      
//   //     console.log("🔐 Transaction frozen, submitting to network...");
//   //     // execute() submits the now-signed transaction
//   //     const response = await transaction.execute(signer._client ?? Client.forName(network));
      
//   //     console.log("✅ Transaction submitted:", response?.transactionId?.toString());
//   //     return response;
//   //   } catch (err: any) {
//   //     console.error("❌ executeWithSigner failed:", err.message);
//   //     throw err;
//   //   }
//   // };
// // const executeWithSigner = async (transaction: any) => {
// //   const frozen   = await transaction.freezeWithSigner(signer);
// //   const response = await frozen.executeWithSigner(signer); // freezes, prompts wallet ONCE, signs, and submits
// //   return response;
// // };

// // ═══════════════════════════════════════════════════════════════════════════
//   // WALLET / SUBMIT HELPER
//   // ═══════════════════════════════════════════════════════════════════════════

//   /**
//    * Freeze + submit a transaction through the connected wallet signer (HashPack).
//    *
//    * IMPORTANT: never call `.setTransactionId()` on `transaction` before passing
//    * it in here. `freezeWithSigner()` internally calls the DAppSigner's
//    * `populateTransaction()`, which unconditionally calls `.setTransactionId()`
//    * itself — no check for an existing one. Presetting the ID beforehand locks
//    * that list, so the internal call throws "list is locked". Instead, we let
//    * the signer assign the ID during freeze, then read it straight back off
//    * the frozen transaction.
//    *
//    * NEVER throws. The WalletConnect relay can time out ("Request expired")
//    * even though HashPack already submitted the transaction and it landed
//    * on-chain. Instead of throwing and losing the transaction ID, this always
//    * returns `actualTxId` (known the moment freeze completes) alongside either
//    * a successful `response` or a `walletError` — callers use `actualTxId` to
//    * verify against Mirror Node regardless of what the wallet round-trip did.
//    */
//   const executeWithSigner = async (
//     transaction: any
//   ): Promise<{ actualTxId: TransactionId; response: any | null; walletError: Error | null }> => {
//     const actualTxId = TransactionId.generate(AccountId.fromString(accountId));
//     transaction.setTransactionId(actualTxId);
 
//     try {
//       const response = await transaction.executeWithSigner(signer);
//       return { actualTxId, response, walletError: null };
//     } catch (err: any) {
//       console.warn(
//         "⚠️ Wallet response failed/timed out — caller should verify against Mirror Node:",
//         err?.message
//       );
//       return { actualTxId, response: null, walletError: err };
//     }
//   };
 
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

//   //const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

//   // const getMirrorNodeUrl = () => {

//   //   return MIRROR_BASE;
//   // } 

//   // ═══════════════════════════════════════════════════════════════════════════
//   // CREATOR: Create Comic Collection
//   // ═══════════════════════════════════════════════════════════════════════════

//   // const createComicCollection = async ({
//   //   episodeId,
//   //   name,
//   //   symbol,
//   //   maxSupply,
//   // }: {
//   //   episodeId: string;
//   //   name:      string;
//   //   symbol:    string;
//   //   maxSupply: number;
//   // }) => {
//   //   try {
//   //     setStatus("processing");
//   //     setError(null);
//   //     setUsedFallback(false);
//   //     setStatusMessage("Preparing NFT collection transaction...");

//   //     console.log("📚 Creating comic collection:", { episodeId, name, maxSupply });

//   //     // ── Step 1: Build transaction & capture its ID before submitting ────────
//   //     //const actualTxId = TransactionId.generate(AccountId.fromString(accountId));

//   //     // ✅ Pre-generate TransactionId so we track it BEFORE wallet prompt
//   //     // const presetTxId = TransactionId.generate(AccountId.fromString(accountId));
//   //     // console.log("📋 Pre-set Transaction ID:", presetTxId.toString());
//   //     // setTxId(presetTxId.toString());

//   //     const tx = new ContractExecuteTransaction()
//   //       .setContractId(CONTRACTS.COMIC_CORE)
//   //      // .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))          // ✅ Set before wallet signs
//   //       .setTransactionValidDuration(180)       // 3 minutes for wallet approval
//   //       .setGas(15000000)
//   //       .setPayableAmount(new Hbar(40))         // ✅ 50 HBAR required for token creation
//   //       .setFunction(
//   //         "createComicCollection",
//   //         new ContractFunctionParameters()
//   //           .addString(episodeId)
//   //           .addString(name)
//   //           .addString(symbol)
//   //           .addString(`${name} Collection`)
//   //           .addInt64(maxSupply)
//   //           .addInt64(7000000)
//   //       );

//   //     // ── Step 2: Submit through wallet ───────────────────────────────────────
//   //     setStatusMessage("Please approve the transaction in your wallet...");
//   //     const response = await executeWithSigner(tx);

//   //     // Use pre-set ID as source of truth (more reliable than response)
//   //     const actualTxId = response?.transactionId
//   //     console.log("✅ Transaction submitted. ID:", actualTxId.toString());
//   //     setTxId(actualTxId.toString());
      

//   //     // ── Step 3: Confirm via Mirror Node /transactions ───────────────────────
//   //     // This replaces getReceipt() — pure REST, no SDK client needed
//   //     setStatusMessage("Waiting for on-chain confirmation...");
//   //     const transactionData = await pollTransactionData(actualTxId);
//   //     const txStatus = getPrimaryTransaction(transactionData)?.result;

//   //     if (txStatus !== "SUCCESS") {
//   //       throw new Error(`Transaction failed on-chain with status: ${txStatus}`);
//   //     }

//   //     // ── Step 4: Prefer the TOKENCREATION child record from Mirror Node ───────
//   //     setStatusMessage("Resolving new token ID from Mirror Node...");
//   //     let tokenId: string | null = extractTokenIdFromTransactionData(transactionData);

//   //     if (tokenId) {
//   //       console.log("✅ Token ID from Mirror Node transaction entity:", tokenId);
//   //     } else {
//   //       // ── Step 5: Get contract result (token address) from Mirror Node ───────
//   //       setStatusMessage("Fetching new token ID from Mirror Node...");
//   //       const contractResult = await pollContractResult(actualTxId, 8, 3000);

//   //       if (contractResult?.call_result) {
//   //         tokenId = tokenIdFromEvmHex(contractResult.call_result);
//   //         if (tokenId) {
//   //           console.log("✅ Token ID from Mirror Node contract result:", tokenId);
//   //         }
//   //       }
//   //     }

//   //     // ── Step 6: Fallback — extract from event logs via Mirror Node ──────────
//   //     if (!tokenId) {
//   //       setUsedFallback(true);
//   //       setStatusMessage("Extracting token from event logs...");
//   //       console.log("⚠️ Falling back to event log extraction...");

//   //       const mirrorTxId = txIdToMirrorFormat(actualTxId);
//   //       const logsRes    = await fetch(
//   //         `${MIRROR_BASE}/api/v1/contracts/results/${mirrorTxId}/logs?order=asc&limit=5`
//   //       );

//   //       if (logsRes.ok) {
//   //         const logsData = await logsRes.json();
//   //         tokenId = extractTokenIdFromEventLogs(logsData);
//   //         if (tokenId) {
//   //           console.log("✅ Token ID from event logs:", tokenId);
//   //         }
//   //       }
//   //     }

//   //     if (!tokenId) {
//   //       throw new Error(
//   //         "Collection was created on-chain but token ID could not be extracted. " +
//   //         "Check HashScan for tx: " + actualTxId.toString()
//   //       );
//   //     }

//   //     setStatus("done");
//   //     setStatusMessage(
//   //       usedFallback
//   //         ? "✅ Collection created! (Token ID from event logs)"
//   //         : "✅ Collection created!"
//   //     );

//   //     return {
//   //       transactionId: actualTxId.toString(),
//   //       status:        "SUCCESS",
//   //       tokenId,
//   //       indexedVia:    usedFallback ? "event-logs" : "mirror-node",
//   //     };
//   //   } catch (err: any) {
//   //     console.error("❌ Collection creation failed:", err.message);
//   //     setError(err.message);
//   //     setStatus("error");
//   //     setStatusMessage(`Error: ${err.message}`);
//   //     throw err;
//   //   }
//   // };

//  const createComicCollection = async ({
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

//       // ── Step 1: Build transaction — no manual .setTransactionId() here.
//       // See executeWithSigner() for why.
//       const tx = new ContractExecuteTransaction()
//         .setContractId(CONTRACTS.COMIC_CORE)
//         .setTransactionValidDuration(180)
//         .setGas(15000000)
//         .setPayableAmount(new Hbar(40))
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

//       // ── Step 2: Freeze + submit through wallet ───────────────────────────────
//       setStatusMessage("Please approve the transaction in your wallet...");
//       const { actualTxId, walletError } = await executeWithSigner(tx);
//       console.log("📋 Transaction ID:", actualTxId.toString());
//       setTxId(actualTxId.toString());

//       if (walletError) {
//         setStatusMessage("Wallet response delayed — checking chain status...");
//       } else {
//         console.log("✅ Wallet confirmed submission for:", actualTxId.toString());
//       }

//       // ── Step 3: Confirm via Mirror Node /transactions ───────────────────────
//       setStatusMessage("Waiting for on-chain confirmation...");

//       let transactionData: any;
//       try {
//         transactionData = await pollTransactionData(actualTxId);
//       } catch (pollErr: any) {
//         // Mirror Node never indexed it either — genuinely failed, surface
//         // the original wallet error if we have one, it's more useful.
//         throw walletError ?? pollErr;
//       }

//       const txStatus = getPrimaryTransaction(transactionData)?.result;

//       if (txStatus !== "SUCCESS") {
//         throw new Error(`Transaction failed on-chain with status: ${txStatus}`);
//       }

//       console.log("✅ Confirmed on-chain via Mirror Node:", actualTxId.toString());

//       // ── Step 4: Prefer the TOKENCREATION child record from Mirror Node ───────
//       setStatusMessage("Resolving new token ID from Mirror Node...");
//       let tokenId: string | null = extractTokenIdFromTransactionData(transactionData);

//       if (tokenId) {
//         console.log("✅ Token ID from Mirror Node transaction entity:", tokenId);
//       } else {
//         setStatusMessage("Fetching new token ID from Mirror Node...");
//         const contractResult = await pollContractResult(actualTxId, 8, 3000);

//         if (contractResult?.call_result) {
//           tokenId = tokenIdFromEvmHex(contractResult.call_result);
//           if (tokenId) {
//             console.log("✅ Token ID from Mirror Node contract result:", tokenId);
//           }
//         }
//       }

//       // ── Step 5: Fallback — extract from event logs via Mirror Node ──────────
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
//           "Check HashScan for tx: " + actualTxId.toString()
//         );
//       }

//       setStatus("done");
//       setStatusMessage(
//         usedFallback
//           ? "✅ Collection created! (Token ID from event logs)"
//           : "✅ Collection created!"
//       );

//       return {
//         transactionId: actualTxId.toString(),
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

//       const priceInTinybars = .froHbarm(pricePerNFT, HbarUnit.Hbar).toTinybars();
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

//           // Extract CID only from IPFS URL if full URL was passed
//           const ipfsCid = metadata.includes('gateway.pinata.cloud')
//             ? metadata.replace('https://gateway.pinata.cloud/ipfs/', '')
//             : metadata;

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
//                 .addString(ipfsCid)  // ✅ addString not addBytes
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

//       const evmAddress = ensureEvmAddress(tokenAddress);

//       const tx = new ContractExecuteTransaction()
//         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
//         .setTransactionId(resaleTxId)
//         .setGas(5000000)
//         .setFunction(
//           "depositAndListForResale",
//           new ContractFunctionParameters()
//             .addAddress(evmAddress)
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

//       const evmAddress = ensureEvmAddress(tokenAddress);

//       const tx = new ContractExecuteTransaction()
//         .setContractId(CONTRACTS.COMIC_MARKETPLACE)
//         .setTransactionId(batchResaleTxId)
//         .setGas(3000000 + serialNumbers.length * 300000)
//         .setFunction(
//           "batchDepositAndListForResale",
//           new ContractFunctionParameters()
//             .addAddress(evmAddress)
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