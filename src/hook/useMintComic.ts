// import { useRef, useState, useEffect } from "react";
// import { Client, TokenCreateTransaction, TokenMintTransaction, TokenType, TokenSupplyType } from "@hashgraph/sdk";
// import { inscribeWithSigner, retrieveInscription } from "@hashgraphonline/standards-sdk";
// import { Buffer } from "buffer";
// import { createComicMetadata } from "../lib/hashinal-helper";
// import { InscriptionSDK } from '@kiloscribe/inscription-sdk';

// interface UseComicHashinalProps {
//   accountId: string;
//   signer: any;
//   network?: "testnet" | "mainnet";
// }

// interface ComicFormData {
//   name: string;
//   creator: string;
//   description: string;
//   genres: string[];
//   copiesOfComic: number;
//   coverUri: File;
//   ageRating: string;
//   priceHbar: number;
//   zipFile?: File;
//   pdfFile?: File;
//   mintNow?: number;
// }

// export function useComicHashinalNFT({
//   accountId,
//   signer,
//   network = "testnet",
// }: UseComicHashinalProps) {
//   const [status, setStatus] = useState<"idle" | "uploading" | "inscribing" | "waiting" | "minting" | "done" | "error">("idle");
//   const [progress, setProgress] = useState<number>(0);
//   const [result, setResult] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [statusText, setStatusText] = useState<string>("");

//   const pollingRef = useRef<NodeJS.Timeout | null>(null);

//   // const sdk = new InscriptionSDK({
//   //   apiKey: 'U2FsdGVkX1/TURlTVZ2pvTS2EhsOghpHukSJUC3Cedl66+PHbLHNYAHykYCkplVmMA086oZkJiqKsu/FjXdERA==',
//   //   network: network,
//   // });

//   // 🧠 Helper: background polling for confirmation
//   // const pollForConfirmation = async (transactionId: string, attempts = 0) => {
//   //   try {
//   //     const result = await retrieveInscription(transactionId, { network });
//   //     // Accept any of the known confirmation shapes returned by retrieveInscription:
//   //     // - result.content (primary)
//   //     // - result.topicId / result.topic_id
//   //     // - result.transactionId
//   //     // - legacy/third-party "inscription" field (guarded via any)
//   //     const r: any = result;
//   //     if (r?.content || r?.topicId || r?.topic_id || r?.transactionId || r?.inscription) {
//   //       console.log("✅ Inscription confirmed:", result);
//   //       setStatus("minting");
//   //       setProgress(100);
//   //       setStatusText("Inscription confirmed on Hedera ✅");

//   //       // Stop polling
//   //       if (pollingRef.current) clearTimeout(pollingRef.current);
//   //       return true;
//   //     }
//   //     throw new Error("Not confirmed yet");
//   //   } catch (err) {
//   //     if (attempts < 60) { // retry up to 60 times (~5 minutes)
//   //       console.log(`⏳ Waiting for inscription confirmation (attempt ${attempts + 1}/60)...`);
//   //       pollingRef.current = setTimeout(() => pollForConfirmation(transactionId, attempts + 1), 5000);
//   //     } else {
//   //       setError("Inscription confirmation timed out");
//   //       setStatus("error");
//   //     }
//   //   }
//   // };

//   // Check status every 2 seconds
// // const pollStatus = async (jobId) => {
// //   const status = await sdk.retrieveInscription(jobId);
  
// //   switch(status.status) {
// //     case 'completed':
// //       console.log('Success!', status);
// //       break;
// //     case 'paid':
// //       console.log('payment verified', status);
// //       break;
// //     case 'failed':
// //       console.error('Failed:', status);
// //       break;
// //     default:
// //       setTimeout(() => pollStatus(jobId), 2000);
// //   }
// // };
//   const createComicNFT = async (formData: ComicFormData) => {
//     try {
//       setStatus("inscribing");
//       setProgress(0);

//       if (!signer || typeof signer.sign !== "function")
//         throw new Error("Wallet signer not available. Please connect your wallet.");

//       if (!formData.zipFile && !formData.pdfFile)
//         throw new Error("No comic ZIP or PDF file provided.");

//       const fileToInscribe = formData.zipFile || formData.pdfFile!;
//       const arrayBuffer = await fileToInscribe.arrayBuffer();
//      if (fileToInscribe.size > 500 * 1024) {
//   console.warn("ZIP too large for WalletConnect inscription, use backend route");
// }
//       console.log("🚀 Starting inscription:", fileToInscribe.name);

// // const result = await sdk.inscribe({
// //   // file: {
// //   file:{
// //     type: "base64",
// //     base64: Buffer.from(arrayBuffer).toString('base64'),
// //         //  buffer: Buffer.from(arrayBuffer),
// //           fileName: fileToInscribe.name,
// //          mimeType: fileToInscribe.type || "application/zip",
// //   },
// //   // },
// //   holderId: accountId,
// //   mode: 'hashinal-collection',
// //   network: network,
// // }, signer);

// // pollStatus(result.jobId);

// // const complete = await sdk.waitForInscription(
// //   result.jobId,
// //   30,     // Try up to 30 times
// //   4000,   // Wait 4 seconds between attempts
// //   true    // Also check for status === 'completed'
// // );

// // console.log('Topics:', {
// //   content: complete.topic_id,
// //   metadata: complete.jsonTopicId,
// //   registry: complete.registryTopicId
// // });

// // Check status
// // const status = await sdk.retrieveInscription(result.jobId);
// // console.log('Inscription status:', status);

// // const transactionId = status.transactionId;
// // console.log('Inscription transaction ID:', transactionId);

//       const inscriptionResult = await inscribeWithSigner(
//         {
//           type: "buffer",
//           buffer: Buffer.from(arrayBuffer),
//           fileName: fileToInscribe.name,
//           mimeType: fileToInscribe.type || "application/zip",
//         },
//         signer,
//         {
//           mode: "hashinal-collection",
//           waitForConfirmation: true, // 🚀 let’s not block UI here
//             waitMaxAttempts: 50,
//             waitIntervalMs: 10000,
//             chunkSize: 1024 * 256,
//           network,

//           progressCallback: (data: any) => {
//             const pct = Math.min(data.progressPercent || 0, 95);
//             setProgress(pct);
//             setStatusText(data.message || "Inscribing...");
//           },
//         }
//       );

//       const transactionId = (() => {
//         // Prefer explicit inscription.transactionId
//         const insTx = inscriptionResult?.inscription?.transactionId;
//         if (insTx) return insTx;
//         console.log('Inscription result:', insTx);
//         // If result is a plain string, treat it as the transactionId
//         if (typeof inscriptionResult?.result === "string") return inscriptionResult!.result;
//         console.log('Inscription result object:', inscriptionResult?.result);
//         // If result is an object that contains transactionId, use it
//         if (inscriptionResult?.result && typeof inscriptionResult.result === "object") {
//           if ("transactionId" in inscriptionResult.result) {
//             return (inscriptionResult.result as any).transactionId;
//             console.log('Found transactionId in result:', (inscriptionResult.result as any).transactionId);
//           }
//           // Some implementations may nest transactionId under result.transaction
//           if ("transaction" in inscriptionResult.result && (inscriptionResult.result as any).transaction?.transactionId) {
//             return (inscriptionResult.result as any).transaction.transactionId;
//           }
//         }
//         return undefined;
//       })();

// if (!transactionId) {
//   throw new Error("Failed to get inscription transaction ID");
// }
// const metadataHRL = `hcs://1/${inscriptionResult.inscription.jsonTopicId}`;
// console.log(`Metadata HRL: ${metadataHRL}`);
//       // const imageHRL = inscriptionResult?.inscription?.topic_id;
//       // if (!imageHRL) throw new Error("Failed to retrieve inscription topic ID.");
//       const jobId = inscriptionResult?.inscription?.jobId;
//       console.log(`Job ID: ${jobId}`);
//       // const transactionId = inscriptionResult?.inscription?.tx_id.toString();
//       // if (!transactionId) throw new Error("Failed to get inscription transaction ID");
//       //    // Background poller
//       //  pollForConfirmation(transactionId);
//       setStatus("waiting");
//       setStatusText("Waiting for network confirmation...");
//       console.log("🕓 Inscription submitted, polling confirmation for:", transactionId);
//     const retrieve = `http://v2-api.tier.bot/api/inscriptions/retrieve-inscription?id=${transactionId}&network=${network}`;
//     console.log('Retrieve URL:', retrieve);
    
     
//       // Prepare metadata right away
//       const metadata = createComicMetadata({
//         name: formData.name,
//         creator: formData.creator,
//         description: formData.description,
//         genres: formData.genres,
//         copiesOfComic: formData.copiesOfComic,
//         ageRating: formData.ageRating,
//         coverUri: formData.coverUri,
//         pageUris: [`hcs://tx/${transactionId}`],
//         priceHbar: formData.priceHbar,
//         totalPages: 1,
//         mimeType: "application/zip",
//       });

//       // 🪙 Mint NFT collection once confirmation done
//       // You can call this manually after confirmation if you want
//       const client = Client.forName(network);
//       const publicKey = signer.getAccountKey?.() || signer.publicKey || null;
//       client.setOperatorWith(accountId, publicKey, (msg) => signer.sign(msg));

//       const tokenCreateTx = new TokenCreateTransaction()
//         .setTokenName(metadata.name)
//         .setTokenSymbol("QCOMIC")
//         .setTokenType(TokenType.NonFungibleUnique)
//         .setDecimals(0)
//         .setInitialSupply(0)
//         .setMaxSupply(metadata.properties.copiesOfComic)
//         .setSupplyType(TokenSupplyType.Finite)
//         .freezeWith(client);

//       const signedCreateTx = await signer.signTransaction(tokenCreateTx);
//       const nftCreateSubmit = await signedCreateTx.execute(client);
//       const nftCreateReceipt = await nftCreateSubmit.getReceipt(client);
//       const tokenId = nftCreateReceipt.tokenId?.toString();

//       console.log("🪙 NFT Collection Created:", tokenId);
//       setProgress(95);

//       const mintTx = new TokenMintTransaction()
//         .setTokenId(tokenId!)
//         .setMetadata([Buffer.from(JSON.stringify(metadataHRL))])
//         .freezeWith(client);

//       const signedMintTx = await signer.signTransaction(mintTx);
//       const mintSubmit = await signedMintTx.execute(client);
//       const mintReceipt = await mintSubmit.getReceipt(client);
//       const serial = mintReceipt.serials[0].toNumber();

//       const nftResult = { tokenId, serial, transactionId };
//       setResult(nftResult);
//       setStatus("done");
//       setProgress(100);
//       console.log("✅ NFT fully created:", nftResult);

//       return nftResult;
//     } catch (err: any) {
//       console.error("❌ Error creating comic NFT:", err);
//       setError(err.message);
//       setStatus("error");
//     }
//   };

//   // 🧹 Clean up polling on unmount
//   useEffect(() => {
//     return () => {
//       if (pollingRef.current) clearTimeout(pollingRef.current);
//     };
//   }, []);

//   return { createComicNFT, status, progress, result, error, statusText };
// }


import { useState, useEffect, useRef } from "react";
import { Buffer } from "buffer";
import {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  AccountId,
  TransactionId,
Hbar
} from "@hashgraph/sdk";
import { useComicInscription } from "./useComicInscription";
import { createComicMetadata } from "../lib/hashinal-helper";
import { HederaMirrorNode } from "@hashgraphonline/standards-sdk";
   import { Logger } from '@hashgraphonline/standards-sdk';

interface ComicFormData {
  name: string;
  creator: string;
  description: string;
  genres: string[];
  copiesOfComic: number;
  ageRating: string;
  coverUri: string;
  coverFile?: File;
  pageFiles?: File[];
  zipFile?: File;
  pdfFile?: File;
  sourceType?: "image" | "zip-images" | "pdf-file";
  priceHbar: number;
  mintNow?: number;
}

interface UseMintComicProps {
  accountId: string;
  signer: any;
  network?: "testnet" | "mainnet";
}

interface MintResult {
  tokenId: string;
  serial: number;
  transactionId: string;
  inscriptionTopicId?: string;
  metadataTopicIds?: string[];
}

export function useMintComic({
  accountId,
  signer,
  network = "testnet",
}: UseMintComicProps) {
  // State for minting process
  const [mintStatus, setMintStatus] = useState<"idle" | "inscribing" | "minting" | "done" | "error">("idle");
  const [mintProgress, setMintProgress] = useState<number>(0);
  const [mintError, setMintError] = useState<string | null>(null);
  const [mintResult, setMintResult] = useState<MintResult | null>(null);
  const [mintStatusText, setMintStatusText] = useState<string>("");

  // Use the inscription hook
  const {
    createInscription,
    status: inscriptionStatus,
    progress: inscriptionProgress,
    result: inscriptionResult,
    error: inscriptionError,
    statusText: inscriptionStatusText,
    reset: resetInscription,
  } = useComicInscription({ accountId, signer, network });

  // Update mint status based on inscription status
  useEffect(() => {
    if (inscriptionStatus === "inscribing") {
      setMintStatus("inscribing");
      setMintProgress(inscriptionProgress * 0.5); // Inscription is 50% of total progress
      setMintStatusText(inscriptionStatusText || "Inscribing comic...");
    } else if (inscriptionStatus === "error") {
      setMintStatus("error");
      setMintError(inscriptionError || "Inscription failed");
    }
  }, [inscriptionStatus, inscriptionProgress, inscriptionError, inscriptionStatusText]);

  /**
   * Create metadata for the comic NFT
   */
  const buildComicMetadata = (formData: ComicFormData, inscriptionData: any) => {
    // Use metadataTopicIds from inscription result for the HCS URIs
    const metadataTopicIds = inscriptionData?.metadataTopicIds || [];
    const transactionId = inscriptionData?.transactionId;
    const topicId = inscriptionData?.topicId;

    // Build HCS URIs from the inscription data
    const pageUris: string[] = [];
    
    // Add transaction-based URI if available
    if (transactionId) {
      pageUris.push(`hcs://tx/${transactionId}`);
    }
    
    // Add topic-based URIs if available
    if (topicId) {
      pageUris.push(`hcs://1/${topicId}`);
    }
    
    // Add metadata topic URIs
    metadataTopicIds.forEach((id: string) => {
      if (id) {
        pageUris.push(`hcs://1/${id}`);
      }
    });

    const metadata = createComicMetadata({
      name: formData.name,
      creator: formData.creator,
      description: formData.description,
      genres: formData.genres,
      copiesOfComic: formData.copiesOfComic,
      ageRating: formData.ageRating,
      coverUri: formData.coverUri || pageUris[0] || "",
      pageUris,
      priceHbar: formData.priceHbar,
      totalPages: 1,
      mimeType: formData.zipFile ? "application/zip" : "application/pdf",
      zipArchiveUri: pageUris[0], // Use first URI as archive URI
    });

    return metadata;
  };

  /**
   * Mint NFT on Hedera using HTS
   */
  const mintNFTOnHedera = async (
    formData: ComicFormData,
    inscriptionData: any,
    count: number
  ): Promise<MintResult> => {
    let tokenId: string | undefined;
    let serial: number[] = [];

    try {
      console.log("🪙 Starting NFT minting on Hedera...");
      
    
      // Initialize Hedera client
      const client = Client.forName(network);
    //  const client = Client.forTestnet();
     console.log("🌐 Hedera client initialized for network:", client);
     const inscriptionName = inscriptionData?.name;

const logger = new Logger({ module: 'MyApp', level: 'info' });

// Basic initialization
  const mirrorNode = new HederaMirrorNode('testnet', logger);
 const publicKey = await mirrorNode.getPublicKey(accountId.toString());
console.log('Public key:', publicKey.toString());

      // Create NFT Collection
      console.log("📦 Creating NFT collection...");
      const tokenCreateTx = new TokenCreateTransaction()
        .setTokenName( formData.name || "Comic NFT")
        .setTokenSymbol("QCOMIC")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setMaxSupply(10000)
        .setSupplyType(TokenSupplyType.Finite)
        .setTreasuryAccountId(AccountId.fromString(accountId))
        .setSupplyKey(publicKey)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)));
       

      const signedCreateTx = await signer.signTransaction(tokenCreateTx);
      const nftCreateSubmit = await signedCreateTx.execute(client);
      const nftCreateReceipt = await nftCreateSubmit.getReceipt(client);
      tokenId = nftCreateReceipt.tokenId?.toString();

      if (!tokenId) {
        throw new Error("Failed to create NFT collection");
      }

      console.log("✅ NFT Collection Created:", tokenId);
      setMintProgress(75);

      // Prepare metadata for minting
      // Store the metadata URI reference instead of full metadata
      // const metadataHRL = `hcs://1/${inscriptionData.metadataTopicIds?.[0].topic_id}`;

    const metadataHRL = `hcs://1/${inscriptionData.topicId}`
       
      console.log("📄 Metadata HRL:", metadataHRL);
   
      const metadataBuffers = Array(count).fill(
       Buffer.from(metadataHRL || "")
      );
        

        const mintTx = new TokenMintTransaction()
        .setTokenId(tokenId)
        // .setMetadata([Buffer.from(metadataHRL)])
        .setMetadata(metadataBuffers)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        // .freezeWithSigner(signer)
        
      const signedMintTx = await signer.signTransaction(mintTx);
      const mintSubmit = await signedMintTx.execute(client);
      const mintReceipt = await mintSubmit.getReceipt(client);

      serial = mintReceipt.serials?.map(s => s.toNumber()) || [];
      console.log("✅ NFT Minted with serials:", serial);
        console.log(`🎉 Minted ${mintReceipt.serials.length} NFTs in batch.`);

      setMintProgress(95);

      return {
        tokenId: tokenId || "",
        serial: serial[0] || 0,
        transactionId: inscriptionData.transactionId,
        inscriptionTopicId: inscriptionData.topicId,
        metadataTopicIds: inscriptionData.metadataTopicIds,
      };
    } catch (error: any) {
      console.error("❌ Error minting NFT:", error);
      throw error;
    }
  };

  /**
   * Main function to create comic NFT (inscription + minting)
   */
  const createComicNFT = async (formData: ComicFormData) => {
    try {
      // Reset states
      setMintStatus("inscribing");
      setMintProgress(0);
      setMintError(null);
      setMintResult(null);

      // Validate inputs
      if (!signer || typeof signer.sign !== "function") {
        throw new Error("Wallet signer not available. Please connect your wallet.");
      }

      // Log what files we received
      console.log("📁 Files received in createComicNFT:", {
        hasZipFile: !!formData.zipFile,
        hasPdfFile: !!formData.pdfFile,
        pageFilesCount: formData.pageFiles?.length || 0,
      });

      // Build comicData object for the inscription hook
      const comicData = {
        title: formData.name,
        description: formData.description,
        genre: formData.genres,
        tags: [], // Tags not in formData, default to empty
        ageRating: formData.ageRating,
        coverImage: formData.coverFile || null,
        pages: formData.pageFiles?.map((file, index) => ({
          name: file.name,
          blob: file,
          preview: '',
          type: 'image' as const,
          fileSize: file.size
        })) || (formData.zipFile ? [{
          name: formData.zipFile.name,
          blob: formData.zipFile,
          preview: '',
          type: 'zip-images' as const,
          fileSize: formData.zipFile.size
        }] : formData.pdfFile ? [{
          name: formData.pdfFile.name,
          blob: formData.pdfFile,
          preview: '',
          type: 'pdf-file' as const,
          fileSize: formData.pdfFile.size
        }] : [])
      };

      // Build monetizationData object for the inscription hook
      const monetizationData = {
        publishType: formData.priceHbar > 0 ? 'paid' as const : 'free' as const,
        price: formData.priceHbar,
        mintAsNFT: true,
        nftCopies: formData.copiesOfComic,
        nftPrice: formData.priceHbar
      };

      // Step 1: Inscribe the comic file (uploads to backend + inscribes metadata)
      console.log("📝 Step 1: Starting inscription...");
      const inscriptionData = await createInscription(comicData, monetizationData);

      if (!inscriptionData) {
        throw new Error("Inscription failed - no data returned");
      }

      console.log("✅ Inscription complete:", inscriptionData);
       console.log("✅ Topic ID:", inscriptionData.topicId);
      setMintProgress(50);
      setMintStatus("minting");
      setMintStatusText("Creating NFT collection on Hedera...");

      // Step 2: Mint NFT on Hedera
      console.log("🪙 Step 2: Minting NFT on Hedera...");
      const mintData = await mintNFTOnHedera(formData, inscriptionData, formData.copiesOfComic);
     
       console.log("✅ NFT minting complete:", mintData);
      // Set final result
      const finalResult: MintResult = {
        ...mintData,
        inscriptionTopicId: inscriptionData.topicId,
        // metadataTopicIds: inscriptionData.metadataTopicIds,
      };

      

      setMintResult(finalResult);
      setMintStatus("done");
      setMintProgress(100);
      setMintStatusText("Comic NFT created successfully!");

      console.log("🎉 Comic NFT fully created:", finalResult);
      return finalResult;

    } catch (err: any) {
      console.error("❌ Error creating comic NFT:", err);
      const errorMessage = err.message || "Unexpected error during comic NFT creation";
      setMintError(errorMessage);
      setMintStatus("error");
      setMintStatusText(`Error: ${errorMessage}`);
      throw err;
    }
  };

  /**
   * Reset all states
   */
  const reset = () => {
    setMintStatus("idle");
    setMintProgress(0);
    setMintError(null);
    setMintResult(null);
    setMintStatusText("");
    resetInscription();
  };

  /**
   * Mint additional copies of an existing NFT
   */
  const mintAdditionalCopies = async (
    tokenId: string,
    count: number,
    metadataHRL?: string
  ) => {
    try {
      if (!signer || !tokenId || count <= 0) {
        throw new Error("Invalid parameters for minting additional copies");
      }

      console.log(`🔄 Minting ${count} additional copies of token ${tokenId}`);
      
      const client = Client.forName(network);

      // Prepare metadata buffers for each copy
      const metadataBuffers = Array(count).fill(
        Buffer.from(metadataHRL || "")
      );

      const mintTx = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata(metadataBuffers)
        // .freezeWith(client);
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)));

      const signedMintTx = await signer.signTransaction(mintTx);
      const mintSubmit = await signedMintTx.execute(client);
      const mintReceipt = await mintSubmit.getReceipt(client);
      
      const serials = mintReceipt.serials?.map(s => s.toNumber()) || [];
      
      console.log(`✅ Minted ${serials.length} additional copies:`, serials);
      return serials;

    } catch (error: any) {
      console.error("❌ Error minting additional copies:", error);
      throw error;
    }
  };

  return {
    // Main functions
    createComicNFT,
    mintAdditionalCopies,
    reset,
    
    // Status
    status: mintStatus,
    progress: mintProgress,
    error: mintError,
    result: mintResult,
    statusText: mintStatusText,
    
    // Inscription details (for debugging/display)
    inscriptionStatus,
    inscriptionProgress,
    inscriptionResult,
  };
}

