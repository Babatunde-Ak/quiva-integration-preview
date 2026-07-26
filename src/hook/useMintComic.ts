export function useMintComic() {
  return {
    createComicNFT: async () => ({ transactionId: "", status: "skipped" }),
    mintAdditionalCopies: async () => ({ transactionId: "", status: "skipped" }),
    status: "idle",
    progress: 0,
    result: null,
    error: null,
    statusText: "",
    reset: () => undefined,
  };
}

export default useMintComic;

// import { useState, useEffect, useRef } from "react";
// import { Buffer } from "buffer";
// import {
//   Client,
//   TokenCreateTransaction,
//   TokenType,
//   TokenSupplyType,
//   TokenMintTransaction,
//   AccountId,
//   TransactionId,
// Hbar
// } from "@hashgraph/sdk";
// import { useComicInscription } from "./useComicInscription";
// import { createComicMetadata } from "../lib/hashinal-helper";
// import { HederaMirrorNode } from "@hashgraphonline/standards-sdk";
//    import { Logger } from '@hashgraphonline/standards-sdk';
// import axios from "axios";
// import { useAppDispatch } from "@/redux/hook";
// import { updateComicToken } from "@/redux/slices/comicSlice";

// // interface ComicFormData {
// //   name: string;
// //   creator: string;
// //   description: string;
// //   genres: string[];
// //   copiesOfComic: number;
// //   ageRating: string;
// //   coverUri: string;
// //   coverFile?: File;
// //   pageFiles?: File[];
// //   zipFile?: File;
// //   pdfFile?: File;
// //   sourceType?: "image" | "zip-images" | "pdf-file";
// //   priceHbar: number;
// //   mintNow?: number;
// // }
//  interface ComicFormData {
//     title: string,
//     episodeNumber: number,
//     summary: string,
//     maturityRating: string,
//     bannerImage: File | null,
//     collaborators: string[],
//     contentType: 'pdf' | 'images' | null,
//     pages: File[]
//  }
// interface CollectionId {
//   collectionId: string;
// }

// interface UseMintComicProps {
//   accountId: string;
//   signer: any;
//   network?: "testnet" | "mainnet";
// }

// interface MintResult {
//   tokenId: string;
//   serials: number[];
//   transactionId: string;
//   inscriptionTopicId?: string;
  
// }

// export function useMintComic({
//   accountId,
//   signer,
//   network = "testnet",
// }: UseMintComicProps) {
//   // State for minting process
//   const [mintStatus, setMintStatus] = useState<"idle" | "inscribing" | "minting" | "done" | "error">("idle");
//   const [mintProgress, setMintProgress] = useState<number>(0);
//   const [mintError, setMintError] = useState<string | null>(null);
//   const [mintResult, setMintResult] = useState<MintResult | null>(null);
//   const [mintStatusText, setMintStatusText] = useState<string>("");

//   const dispatch = useAppDispatch();


//   // Use the inscription hook
//   const {
//     createInscription,
//     status: inscriptionStatus,
//     progress: inscriptionProgress,
//     result: inscriptionResult,
//     error: inscriptionError,
//     statusText: inscriptionStatusText,
//     reset: resetInscription,
//   } = useComicInscription({ accountId, signer, network });

//   // Update mint status based on inscription status
//   useEffect(() => {
//     if (inscriptionStatus === "inscribing") {
//       setMintStatus("inscribing");
//       setMintProgress(inscriptionProgress * 0.5); // Inscription is 50% of total progress
//       setMintStatusText(inscriptionStatusText || "Inscribing comic...");
//     } else if (inscriptionStatus === "error") {
//       setMintStatus("error");
//       setMintError(inscriptionError || "Inscription failed");
//     }
//   }, [inscriptionStatus, inscriptionProgress, inscriptionError, inscriptionStatusText]);

//   /**
//    * Mint NFT on Hedera using HTS
//    */
//   const mintNFTOnHedera = async (
//     formData: ComicFormData,
//     inscriptionData: any,
//     count: number
//   ): Promise<MintResult> => {
//     let tokenId: string | undefined;
//     let serials: number[] = [];

//     try {
//       console.log("🪙 Starting NFT minting on Hedera...");
      
    
//       // Initialize Hedera client
//       const client = Client.forName(network);
//     //  const client = Client.forTestnet();
//      console.log("🌐 Hedera client initialized for network:", client);
//      const inscriptionName = inscriptionData?.name;

// const logger = new Logger({ module: 'MyApp', level: 'info' });

// // Basic initialization
//   const mirrorNode = new HederaMirrorNode('testnet', logger);
//  const publicKey = await mirrorNode.getPublicKey(accountId.toString());
// console.log('Public key:', publicKey.toString());

//       // Create NFT Collection
//       console.log("📦 Creating NFT collection...");
//       const tokenCreateTx = new TokenCreateTransaction()
//         .setTokenName( formData.title || "Comic NFT")
//         .setTokenSymbol("QCOMIC")
//         .setTokenType(TokenType.NonFungibleUnique)
//         .setDecimals(0)
//         .setInitialSupply(0)
//         .setMaxSupply(10000)
//         .setSupplyType(TokenSupplyType.Finite)
//         .setTreasuryAccountId(AccountId.fromString(accountId))
//         .setSupplyKey(publicKey)
//         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)));
        
//         // .freezeWithSigner(signer)
      
       

//       const signedCreateTx = await signer.signTransaction(tokenCreateTx);
//       const nftCreateSubmit = await signedCreateTx.execute(client);
//       const nftCreateReceipt = await nftCreateSubmit.getReceipt(client);
//       tokenId = nftCreateReceipt.tokenId?.toString();

//       if (!tokenId) {
//         throw new Error("Failed to create NFT collection");
//       }

//       console.log("✅ NFT Collection Created:", tokenId);
//       setMintProgress(75);

      

//     const metadataHRL = `hcs://1/${inscriptionData.topicId}`
       
//       console.log("📄 Metadata HRL:", metadataHRL);

//       const BATCH_SIZE = 10;
//       let allSerials: number[] = [];
//       let mintedCount = 0;

//       setMintStatusText(`Minting ${count}  Copies...`);

//       for (let batchStart = 0; batchStart < count; batchStart += BATCH_SIZE) {
//         const batchEnd = Math.min(batchStart + BATCH_SIZE, count);
//         const batchCount = batchEnd - batchStart;
        
//         console.log(`📦 Minting batch: NFTs ${batchStart + 1}-${batchEnd} (${batchCount} NFTs)`);
        
//         // Create metadata buffers for this batch only
//         const metadataBuffers = Array(batchCount).fill(
//           Buffer.from(metadataHRL || "")
//         );

//         const mintTx = new TokenMintTransaction()
//           .setTokenId(tokenId)
//           .setMetadata(metadataBuffers)
//           .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)));
         
        
//         try {
//           const signedMintTx = await signer.signTransaction(mintTx);
//           const mintSubmit = await signedMintTx.execute(client);
//           const mintReceipt = await mintSubmit.getReceipt(client);

//           const batchSerials = mintReceipt.serials?.map(s => s.toNumber()) || [];
//           allSerials = [...allSerials, ...batchSerials];
//           mintedCount += batchSerials.length;
          
//           console.log(`✅ Batch ${Math.ceil((batchStart + 1) / BATCH_SIZE)} minted successfully. Serials: ${batchSerials.join(", ")}`);
          
//           // Update progress based on minting completion
//           const mintingProgress = 75 + (mintedCount / count) * 20; // Progress from 75% to 95%
//           setMintProgress(mintingProgress);
//           setMintStatusText(`Minted ${mintedCount}/${count} copies...`);
          
//         } catch (batchError: any) {
//           console.error(`❌ Error minting batch ${Math.ceil((batchStart + 1) / BATCH_SIZE)}:`, batchError);
//           // Continue with remaining batches or throw based on your preference
//           throw new Error(`Failed to mint batch ${Math.ceil((batchStart + 1) / BATCH_SIZE)}: ${batchError.message}`);
//         }
        
//         // Small delay between batches to avoid rate limiting
//         if (batchEnd < count) {
//           await new Promise(resolve => setTimeout(resolve, 500));
//         }
//       }


      
//       serials = allSerials;
//       console.log(`🎉 Successfully minted total of ${allSerials.length} NFTs across ${Math.ceil(count / BATCH_SIZE)} batches`);
//       console.log("✅ All serials:", serials);

//       setMintProgress(95);
      
//       // setMintProgress(95);

//       return {
//         tokenId: tokenId || "",
//         serials: Array.isArray(serials) ? serials : [serials],
//         transactionId: inscriptionData.transactionId,
//         inscriptionTopicId: inscriptionData.topicId,
//       };
      
//     } catch (error: any) {
//       console.error("❌ Error minting NFT:", error);
//       throw error;
//     }
//   };

//   /**
//    * Main function to create comic NFT (inscription + minting)
//    */
//   const createComicNFT = async (formData: ComicFormData, metadataCid: string, dbComicId: string, rarity) => {
//     try {
//       // Reset states
//       setMintStatus("inscribing");
//       setMintProgress(0);
//       setMintError(null);
//       setMintResult(null);

//       // Validate inputs
//       if (!signer || typeof signer.sign !== "function") {
//         throw new Error("Wallet signer not available. Please connect your wallet.");
//       }

    
//     // const comicData = {
//     //   title: formData.title,
//     //   episodeNumber: String(formData.episodeNumber),
//     //   summary: formData.summary,
//     //   maturityRating: formData.maturityRating,
//     //   bannerImage: formData.bannerImage,
//     //   collaborators: formData.collaborators,
//     //   contentType: formData.contentType,
//     //   files: formData.files
//     // };
//       // Step 1: Inscribe the comic file (uploads to backend + inscribes metadata)
//       console.log("📝 Step 1: Starting inscription...");
//     const inscriptionData =  await createInscription(metadataCid, dbComicId);

//       if (!inscriptionData) {
//         throw new Error("Inscription failed - no data returned");
//       }


//       console.log("✅ Inscription complete:", inscriptionData);
//        console.log("✅ Topic ID:", inscriptionData.topicId);
//       setMintProgress(50);
//       setMintStatus("minting");
//       setMintStatusText("Creating NFT collection on Hedera...");

//       // Step 2: Mint NFT on Hedera
//       console.log("🪙 Step 2: Minting NFT on Hedera...");
//       const mintData = await mintNFTOnHedera(formData, inscriptionData, rarity);
     
//        console.log("✅ NFT minting complete:", mintData);
//       // Set final result
//       const finalResult: MintResult = {
//         ...mintData,
//         inscriptionTopicId: inscriptionData.topicId,
//         // metadataTopicIds: inscriptionData.metadataTopicIds,
//       };

//       // await updateComicWithMintData(mintData, inscriptionData.dbComicId);
//       //  console.log("✅ Comic updated with mint data on backend");

//       setMintResult(finalResult);
//       setMintStatus("done");
//       setMintProgress(100);
//       setMintStatusText("Comic NFT created successfully!");

//       console.log("🎉 Comic NFT fully created:", finalResult);
//       return finalResult;

//     } catch (err: any) {
//       console.error("❌ Error creating comic NFT:", err);
//       const errorMessage = err.message || "Unexpected error during comic NFT creation";
//       setMintError(errorMessage);
//       setMintStatus("error");
//       setMintStatusText(`Error: ${errorMessage}`);
//       throw err;
//     }
//   };


//   async function updateComicWithMintData(mintData: MintResult, comicId: string) {
//     const token = localStorage.getItem('token');
//     try {
//       // @ts-ignore
//       const response = await dispatch(updateComicToken({ 
//         comicId, 
//         tokenId: mintData.tokenId, 
//         serial: String(mintData.serials[0] || 1),
//         transactionId: mintData.transactionId, 
//         metadataTopicIds: mintData.inscriptionTopicId ? [mintData.inscriptionTopicId] : [] 
//       })).unwrap();

//       return response.data;
//     } catch (error) {
//       console.error("❌ Error updating comic with mint data:", error);
//       throw error;
//     }

//     // const response = await axios.put(`http://localhost:5000/api/comics/token/${comicId}`,
//     //         {
//     //           tokenId: mintData.tokenId,
//     //           serial: mintData.serial,
//     //           transactionId: mintData.transactionId,
//     //           inscriptionTopicId: mintData.inscriptionTopicId,
//     //         },
//     //         {
//     //           headers: {
//     //             'Content-Type': 'multipart/form-data',
//     //             Authorization: `Bearer ${token}`,
//     //           },
            
//     //         }
//     //       );
//       // return response.data;
//   }
//   /**
//    * Reset all states
//    */
//   const reset = () => {
//     setMintStatus("idle");
//     setMintProgress(0);
//     setMintError(null);
//     setMintResult(null);
//     setMintStatusText("");
//     resetInscription();
//   };

//   /**
//    * Mint additional copies of an existing NFT
//    */
//   const mintAdditionalCopies = async (
//     tokenId: string,
//     count: number,
//     metadataHRL?: string
//   ) => {
//     try {
//       if (!signer || !tokenId || count <= 0) {
//         throw new Error("Invalid parameters for minting additional copies");
//       }

//       console.log(`🔄 Minting ${count} additional copies of token ${tokenId}`);
      
//       const client = Client.forName(network);

//       // Prepare metadata buffers for each copy
//       const metadataBuffers = Array(count).fill(
//         Buffer.from(metadataHRL || "")
//       );

//       const mintTx = new TokenMintTransaction()
//         .setTokenId(tokenId)
//         .setMetadata(metadataBuffers)
//         // .freezeWith(client);
//         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)));

//       const signedMintTx = await signer.signTransaction(mintTx);
//       const mintSubmit = await signedMintTx.execute(client);
//       const mintReceipt = await mintSubmit.getReceipt(client);
      
//       const serials = mintReceipt.serials?.map(s => s.toNumber()) || [];
      
//       console.log(`✅ Minted ${serials.length} additional copies:`, serials);
//       return serials;

//     } catch (error: any) {
//       console.error("❌ Error minting additional copies:", error);
//       throw error;
//     }
//   };

//   return {
//     // Main functions
//     createComicNFT,
//     mintAdditionalCopies,
//     reset,
    
//     // Status
//     status: mintStatus,
//     progress: mintProgress,
//     error: mintError,
//     result: mintResult,
//     statusText: mintStatusText,
    
//     // Inscription details (for debugging/display)
//     inscriptionStatus,
//     inscriptionProgress,
//     inscriptionResult,
//   };
// }



// // import { useState, useEffect } from "react";
// // import { Buffer } from "buffer";
// // import {
// //   Client,
// //   TokenCreateTransaction,
// //   TokenType,
// //   TokenSupplyType,
// //   TokenMintTransaction,
// //   AccountId,
// //   TransactionId,
// //   BatchTransaction,
// //   PrivateKey,
// //   TransactionReceiptQuery,
// // } from "@hashgraph/sdk";
// // import { useComicInscription } from "./useComicInscription";
// // import { HederaMirrorNode } from "@hashgraphonline/standards-sdk";
// // import { Logger } from '@hashgraphonline/standards-sdk';

// // interface ComicFormData {
// //   title: string;
// //   episodeNumber: number;
// //   summary: string;
// //   maturityRating: string;
// //   bannerImage: File | null;
// //   collaborators: string[];
// //   contentType: 'pdf' | 'images' | null;
// //   pages: File[];
// // }

// // interface UseMintComicProps {
// //   accountId: string;
// //   signer: any;
// //   network?: "testnet" | "mainnet";
// // }

// // interface MintResult {
// //   tokenId: string;
// //   serial: number[];
// //   transactionId: string;
// //   inscriptionTopicId?: string;
// // }

// // export function useMintComic({
// //   accountId,
// //   signer,
// //   network = "testnet",
// // }: UseMintComicProps) {
// //   const [mintStatus, setMintStatus] = useState<"idle" | "inscribing" | "minting" | "done" | "error">("idle");
// //   const [mintProgress, setMintProgress] = useState<number>(0);
// //   const [mintError, setMintError] = useState<string | null>(null);
// //   const [mintResult, setMintResult] = useState<MintResult | null>(null);
// //   const [mintStatusText, setMintStatusText] = useState<string>("");

// //   const {
// //     createInscription,
// //     status: inscriptionStatus,
// //     progress: inscriptionProgress,
// //     result: inscriptionResult,
// //     error: inscriptionError,
// //     statusText: inscriptionStatusText,
// //     reset: resetInscription,
// //   } = useComicInscription({ accountId, signer, network });

// //   useEffect(() => {
// //     if (inscriptionStatus === "inscribing") {
// //       setMintStatus("inscribing");
// //       setMintProgress(inscriptionProgress * 0.5);
// //       setMintStatusText(inscriptionStatusText || "Inscribing comic...");
// //     } else if (inscriptionStatus === "error") {
// //       setMintStatus("error");
// //       setMintError(inscriptionError || "Inscription failed");
// //     }
// //   }, [inscriptionStatus, inscriptionProgress, inscriptionError, inscriptionStatusText]);

// //   /**
// //    * Mint NFT on Hedera using BatchTransaction for atomic minting
// //    * Handles large mints by creating multiple batches
// //    * 
// //    * Hedera Limits:
// //    * - Each TokenMintTransaction can mint up to 10 NFTs
// //    * - Each BatchTransaction can contain up to 50 transactions
// //    * - Therefore, one batch can mint up to 500 NFTs (50 transactions × 10 NFTs)
// //    * 
// //    * For 1000 NFTs: Creates 2 batches of 500 NFTs each
// //    */
// //   const mintNFTOnHedera = async (
// //     formData: ComicFormData,
// //     inscriptionData: any,
// //     count: number
// //   ): Promise<MintResult> => {
// //     let tokenId: string | undefined;
// //     let allSerials: number[] = [];

// //     try {
// //       console.log(`🪙 Starting NFT minting on Hedera for ${count} NFTs...`);
      
// //       const client = Client.forName(network);
// //       //client.setOperator(AccountId.fromString(accountId.toString()), signer);
// //       console.log("🌐 Hedera client initialized for network:", network);

// //       const logger = new Logger({ module: 'MintComic', level: 'info' });
// //       const mirrorNode = new HederaMirrorNode(network, logger);
// //       const publicKey = await mirrorNode.getPublicKey(accountId.toString());
// //       console.log('Public key:', publicKey.toString());

// //       // Step 1: Create NFT Collection
// //       console.log("📦 Creating NFT collection...");
// //       const tokenCreateTx = new TokenCreateTransaction()
// //         .setTokenName(formData.title || "Comic NFT")
// //         .setTokenSymbol("QCOMIC")
// //         .setTokenType(TokenType.NonFungibleUnique)
// //         .setDecimals(0)
// //         .setInitialSupply(0)
// //         .setMaxSupply(10000)
// //         .setSupplyType(TokenSupplyType.Finite)
// //         .setTreasuryAccountId(AccountId.fromString(accountId))
// //         .setSupplyKey(publicKey)
// //         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)));

// //       const signedCreateTx = await signer.signTransaction(tokenCreateTx);
// //       const nftCreateSubmit = await signedCreateTx.execute(client);
// //       const nftCreateReceipt = await nftCreateSubmit.getReceipt(client);
// //       tokenId = nftCreateReceipt.tokenId?.toString();

// //       if (!tokenId) {
// //         throw new Error("Failed to create NFT collection");
// //       }

// //       console.log("✅ NFT Collection Created:", tokenId);
// //       setMintProgress(75);

// //       const metadataHRL = `hcs://1/${inscriptionData.topicId}`;
// //       console.log("📄 Metadata HRL:", metadataHRL);

// //       // Step 2: Calculate batching strategy
// //       const NFTS_PER_MINT_TX = 10;  // Max NFTs per TokenMintTransaction
// //       const MAX_TXS_PER_BATCH = 50;  // Max transactions per BatchTransaction
// //       const NFTS_PER_BATCH = NFTS_PER_MINT_TX * MAX_TXS_PER_BATCH; // 500 NFTs per batch

// //       const totalBatches = Math.ceil(count / NFTS_PER_BATCH);
// //       console.log(`📊 Minting strategy: ${count} NFTs across ${totalBatches} batch(es)`);
// //       console.log(`   - Each batch: up to ${NFTS_PER_BATCH} NFTs (${MAX_TXS_PER_BATCH} transactions × ${NFTS_PER_MINT_TX} NFTs)`);

// //       let mintedCount = 0;

// //       // Step 3: Process each batch
// //       let lastBatchTxResponse: any = undefined;
// //       for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
// //         const batchStart = batchIndex * NFTS_PER_BATCH;
// //         const batchEnd = Math.min(batchStart + NFTS_PER_BATCH, count);
// //         const nftsInThisBatch = batchEnd - batchStart;

// //         console.log(`\n🎯 Batch ${batchIndex + 1}/${totalBatches}: Minting NFTs ${batchStart + 1}-${batchEnd} (${nftsInThisBatch} NFTs)`);
// //         setMintStatusText(`Processing batch ${batchIndex + 1}/${totalBatches}: ${nftsInThisBatch} NFTs...`);

// //         // Generate a unique batch key for this batch
// //         const batchKey = PrivateKey.generateED25519();

// //         // Create the batch transaction
// //         const batchTx = new BatchTransaction();

// //         // Step 4: Create mint transactions for this batch
// //         const mintTxsInBatch = Math.ceil(nftsInThisBatch / NFTS_PER_MINT_TX);
// //         console.log(`   📝 Creating ${mintTxsInBatch} mint transaction(s) for this batch...`);

// //         for (let txIndex = 0; txIndex < mintTxsInBatch; txIndex++) {
// //           const txStart = txIndex * NFTS_PER_MINT_TX;
// //           const txEnd = Math.min(txStart + NFTS_PER_MINT_TX, nftsInThisBatch);
// //           const nftsInThisTx = txEnd - txStart;

// //           // Create metadata for this mint transaction
// //           const metadataBuffers = Array(nftsInThisTx).fill(Buffer.from(metadataHRL));

// //           // Create the mint transaction
// //           const mintTx = new TokenMintTransaction()
// //             .setTokenId(tokenId)
// //             .setMetadata(metadataBuffers)
// //             .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)));

// //           // Batchify the transaction
// //           // const batchifiedMintTx = await (mintTx).batchify(client, batchKey.publicKey);
// //           const batchifiedMintTx = await mintTx
// //          .setBatchKey(batchKey.publicKey)      // Step 1: Set batch key
// //          .setNodeAccountIds([new AccountId(0)]) // Step 2: Set nodeAccountId to 0.0.0
// //          .freezeWithSigner(signer);
// //          // Then sign with the signer
// //         const signedMintTx = await signer.signTransaction(batchifiedMintTx);
// //           // Add to batch
// //           batchTx.addInnerTransaction(signedMintTx);

// //           console.log(`      ✓ Mint transaction ${txIndex + 1}/${mintTxsInBatch}: ${nftsInThisTx} NFTs prepared`);
// //         }

// //         // Step 5: Execute the batch transaction
// //         console.log(`   🔧 Freezing and signing batch transaction...`);
// //         const frozenBatchTx = await batchTx.freezeWithSigner(signer);
// //         const signedWithBatchKey = await frozenBatchTx.sign(batchKey);
// //         const finalSignedBatchTx = await signer.signTransaction(signedWithBatchKey);

// //         console.log(`   🚀 Executing batch transaction...`);
// //         lastBatchTxResponse = await finalSignedBatchTx.execute(client);
// //         const batchReceipt = await lastBatchTxResponse.getReceipt(client);

// //         console.log(`   ✅ Batch ${batchIndex + 1} status: ${batchReceipt.status}`);

// //         // // Step 6: Collect serials from all inner transactions
// //         // const innerTransactions = batchTx.getInnerTransactions;
// //           const innerTransactions = batchTx.innerTransactions;
// //         console.log(`   📋 Processing ${innerTransactions.length} inner transaction(s)...`);

// //         // Get transaction IDs from the inner transactions
// //         const innerTxIds = innerTransactions.map((tx: any) => tx.transactionId);

// //         for (let i = 0; i < innerTxIds.length; i++) {
// //           try {
// //             const innerReceipt = await new TransactionReceiptQuery()
// //               .setTransactionId(innerTxIds[i])
// //               .execute(client);
            
// //             const batchSerials = innerReceipt.serials?.map(s => s.toNumber()) || [];
// //             allSerials = [...allSerials, ...batchSerials];
// //             mintedCount += batchSerials.length;
            
// //             console.log(`      ✓ Transaction ${i + 1}: ${batchSerials.length} NFTs (serials: ${batchSerials.join(", ")})`);
// //           } catch (innerError: any) {
// //             console.error(`      ⚠️ Could not fetch receipt for inner transaction ${i + 1}:`, innerError.message);
// //           }
// //         }

// //         // Update progress
// //         const mintingProgress = 75 + (mintedCount / count) * 20;
// //         setMintProgress(mintingProgress);
// //         setMintStatusText(`Minted ${mintedCount}/${count} NFTs (${totalBatches - batchIndex - 1} batch(es) remaining)...`);

// //         console.log(`   ✅ Batch ${batchIndex + 1} complete: ${mintedCount}/${count} NFTs minted`);

// //         // Small delay between batches to avoid overwhelming the network
// //         if (batchIndex < totalBatches - 1) {
// //           console.log(`   ⏳ Waiting before next batch...`);
// //           await new Promise(resolve => setTimeout(resolve, 1000));
// //         }
// //       }

// //       console.log(`\n🎉 Successfully minted ${allSerials.length} NFTs across ${totalBatches} batch(es)`);
// //       console.log(`📝 All serials: [${allSerials.slice(0, 10).join(", ")}${allSerials.length > 10 ? `, ... +${allSerials.length - 10} more` : ''}]`);

// //       setMintProgress(95);
// //       setMintStatusText(`Successfully minted all ${allSerials.length} copies!`);

// //       // Use the last batch transaction response for transactionId
// //       return {
// //         tokenId: tokenId || "",
// //         serial: allSerials,
// //         transactionId: (typeof lastBatchTxResponse !== "undefined" && lastBatchTxResponse?.transactionId?.toString()) || "",
// //         inscriptionTopicId: inscriptionData.topicId,
// //       };
      
// //     } catch (error: any) {
// //       console.error("❌ Error minting NFT:", error);
// //       throw error;
// //     }
// //   };

// //   /**
// //    * Main function to create comic NFT (inscription + minting)
// //    */
// //   const createComicNFT = async (
// //     formData: ComicFormData, 
// //     metadataCid: string, 
// //     dbComicId: string, 
// //     rarity: number
// //   ) => {
// //     try {
// //       setMintStatus("inscribing");
// //       setMintProgress(0);
// //       setMintError(null);
// //       setMintResult(null);

// //       if (!signer || typeof signer.signTransaction !== "function") {
// //         throw new Error("Wallet signer not available. Please connect your wallet.");
// //       }

// //       console.log("🔐 Step 1: Starting inscription...");
// //       const inscriptionData = await createInscription(metadataCid, dbComicId);

// //       if (!inscriptionData) {
// //         throw new Error("Inscription failed - no data returned");
// //       }

// //       console.log("✅ Inscription complete:", inscriptionData);
// //       console.log("✅ Topic ID:", inscriptionData.topicId);
// //       setMintProgress(50);
// //       setMintStatus("minting");
// //       setMintStatusText("Creating NFT collection on Hedera...");

// //       console.log(`🪙 Step 2: Minting ${rarity} NFTs using batch transactions...`);
// //       const mintData = await mintNFTOnHedera(formData, inscriptionData, rarity);
     
// //       console.log("✅ NFT minting complete:", mintData);

// //       const finalResult: MintResult = {
// //         ...mintData,
// //         inscriptionTopicId: inscriptionData.topicId,
// //       };

// //       setMintResult(finalResult);
// //       setMintStatus("done");
// //       setMintProgress(100);
// //       setMintStatusText("Comic NFT created successfully!");

// //       console.log("🎉 Comic NFT fully created:", finalResult);
// //       return finalResult;

// //     } catch (err: any) {
// //       console.error("❌ Error creating comic NFT:", err);
// //       const errorMessage = err.message || "Unexpected error during comic NFT creation";
// //       setMintError(errorMessage);
// //       setMintStatus("error");
// //       setMintStatusText(`Error: ${errorMessage}`);
// //       throw err;
// //     }
// //   };

// //   const reset = () => {
// //     setMintStatus("idle");
// //     setMintProgress(0);
// //     setMintError(null);
// //     setMintResult(null);
// //     setMintStatusText("");
// //     resetInscription();
// //   };

// //   return {
// //     createComicNFT,
// //     reset,
// //     status: mintStatus,
// //     progress: mintProgress,
// //     error: mintError,
// //     result: mintResult,
// //     statusText: mintStatusText,
// //     inscriptionStatus,
// //     inscriptionProgress,
// //     inscriptionResult,
// //   };
// // }