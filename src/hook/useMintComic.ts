


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
import axios from "axios";

// interface ComicFormData {
//   name: string;
//   creator: string;
//   description: string;
//   genres: string[];
//   copiesOfComic: number;
//   ageRating: string;
//   coverUri: string;
//   coverFile?: File;
//   pageFiles?: File[];
//   zipFile?: File;
//   pdfFile?: File;
//   sourceType?: "image" | "zip-images" | "pdf-file";
//   priceHbar: number;
//   mintNow?: number;
// }
 interface ComicFormData {
    title: string,
    episodeNumber: number,
    summary: string,
    maturityRating: string,
    bannerImage: File | null,
    collaborators: string[],
    contentType: 'pdf' | 'images' | null,
    files: File[]
 }
interface CollectionId {
  collectionId: string;
}

interface UseMintComicProps {
  accountId: string;
  signer: any;
  network?: "testnet" | "mainnet";
}

interface MintResult {
  tokenId: string;
  serial: number[];
  transactionId: string;
  inscriptionTopicId?: string;
  // metadataTopicIds?: string[];
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
        .setTokenName( formData.title || "Comic NFT")
        .setTokenSymbol("QCOMIC")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setMaxSupply(10000)
        .setSupplyType(TokenSupplyType.Finite)
        .setTreasuryAccountId(AccountId.fromString(accountId))
        .setSupplyKey(publicKey)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)));
        
        // .freezeWithSigner(signer)
      
       

      const signedCreateTx = await signer.signTransaction(tokenCreateTx);
      const nftCreateSubmit = await signedCreateTx.execute(client);
      const nftCreateReceipt = await nftCreateSubmit.getReceipt(client);
      tokenId = nftCreateReceipt.tokenId?.toString();

      if (!tokenId) {
        throw new Error("Failed to create NFT collection");
      }

      console.log("✅ NFT Collection Created:", tokenId);
      setMintProgress(75);

      

    const metadataHRL = `hcs://1/${inscriptionData.topicId}`
       
      console.log("📄 Metadata HRL:", metadataHRL);

      const BATCH_SIZE = 10;
      let allSerials: number[] = [];
      let mintedCount = 0;

      setMintStatusText(`Minting ${count}  Copies...`);

      for (let batchStart = 0; batchStart < count; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, count);
        const batchCount = batchEnd - batchStart;
        
        console.log(`📦 Minting batch: NFTs ${batchStart + 1}-${batchEnd} (${batchCount} NFTs)`);
        
        // Create metadata buffers for this batch only
        const metadataBuffers = Array(batchCount).fill(
          Buffer.from(metadataHRL || "")
        );

        const mintTx = new TokenMintTransaction()
          .setTokenId(tokenId)
          .setMetadata(metadataBuffers)
          .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)));
         
        
        try {
          const signedMintTx = await signer.signTransaction(mintTx);
          const mintSubmit = await signedMintTx.execute(client);
          const mintReceipt = await mintSubmit.getReceipt(client);

          const batchSerials = mintReceipt.serials?.map(s => s.toNumber()) || [];
          allSerials = [...allSerials, ...batchSerials];
          mintedCount += batchSerials.length;
          
          console.log(`✅ Batch ${Math.ceil((batchStart + 1) / BATCH_SIZE)} minted successfully. Serials: ${batchSerials.join(", ")}`);
          
          // Update progress based on minting completion
          const mintingProgress = 75 + (mintedCount / count) * 20; // Progress from 75% to 95%
          setMintProgress(mintingProgress);
          setMintStatusText(`Minted ${mintedCount}/${count} copies...`);
          
        } catch (batchError: any) {
          console.error(`❌ Error minting batch ${Math.ceil((batchStart + 1) / BATCH_SIZE)}:`, batchError);
          // Continue with remaining batches or throw based on your preference
          throw new Error(`Failed to mint batch ${Math.ceil((batchStart + 1) / BATCH_SIZE)}: ${batchError.message}`);
        }
        
        // Small delay between batches to avoid rate limiting
        if (batchEnd < count) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }


      
      serial = allSerials;
      console.log(`🎉 Successfully minted total of ${allSerials.length} NFTs across ${Math.ceil(count / BATCH_SIZE)} batches`);
      console.log("✅ All serials:", serial);

      setMintProgress(95);
      
      // setMintProgress(95);

      return {
        tokenId: tokenId || "",
        serial: Array.isArray(serial) ? serial : [serial],
        transactionId: inscriptionData.transactionId,
        inscriptionTopicId: inscriptionData.topicId,
      };
      
    } catch (error: any) {
      console.error("❌ Error minting NFT:", error);
      throw error;
    }
  };

  /**
   * Main function to create comic NFT (inscription + minting)
   */
  const createComicNFT = async (formData: ComicFormData, metadataCid: string, dbComicId: string, rarity) => {
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

    
    // const comicData = {
    //   title: formData.title,
    //   episodeNumber: String(formData.episodeNumber),
    //   summary: formData.summary,
    //   maturityRating: formData.maturityRating,
    //   bannerImage: formData.bannerImage,
    //   collaborators: formData.collaborators,
    //   contentType: formData.contentType,
    //   files: formData.files
    // };
      // Step 1: Inscribe the comic file (uploads to backend + inscribes metadata)
      console.log("📝 Step 1: Starting inscription...");
    const inscriptionData =  await createInscription(metadataCid, dbComicId);

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
      const mintData = await mintNFTOnHedera(formData, inscriptionData, rarity);
     
       console.log("✅ NFT minting complete:", mintData);
      // Set final result
      const finalResult: MintResult = {
        ...mintData,
        inscriptionTopicId: inscriptionData.topicId,
        // metadataTopicIds: inscriptionData.metadataTopicIds,
      };

      await updateComicWithMintData(mintData, inscriptionData.dbComicId);
       console.log("✅ Comic updated with mint data on backend");

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

   async function updateComicWithMintData(mintData: MintResult, comicId: string) {
    const token = localStorage.getItem('token');
    const response = await axios.put(`http://localhost:5000/api/comics/token/${comicId}`,
            {
              tokenId: mintData.tokenId,
              serial: mintData.serial,
              transactionId: mintData.transactionId,
              inscriptionTopicId: mintData.inscriptionTopicId,
            },
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
              },
            
            }
          );
      return response.data;
   }
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

