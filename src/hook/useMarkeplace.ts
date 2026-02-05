import { useState } from "react";
import {
  ContractExecuteTransaction,
  Client,
  ContractFunctionParameters,
  AccountId,
  ContractId,
  TransactionId,
  ContractCallQuery,
  Hbar,
  HbarUnit,
  TokenId,
} from "@hashgraph/sdk";
import { useComicInscription } from "./useComicInscription";
import { ethers } from 'ethers';

// Define the ABI for your function
const abi = [
  'function canReadComic(string episodeId, address user) external view returns (bool)'
];

// Create interface and encode the function call

// ============================================
// CONTRACT ADDRESSES (Update after deployment)
// ============================================
// const CONTRACTS = {
//   COMIC_CORE: "0.0.7797069",       
//   COMIC_SALES: "0.0.7797100",      
//   COMIC_MARKETPLACE: "0.0.7797111" 
// };
const CONTRACTS = {
  COMIC_CORE: "0.0.7806656",
   COMIC_SALES: "0.0.7829668",
  // COMIC_SALES: "0.0.7806676",
  // COMIC_MARKETPLACE: "0.0.7806693"
  COMIC_MARKETPLACE: "0.0.7829656"
}

interface UseComicPlatformProps {
  accountId: string;
  signer: any;
  network?: "testnet" | "mainnet";
}

export enum CampaignType {
  PUBLIC = 0,
  WHITELIST = 1,
  SCHEDULED = 2
}

export enum PhaseType {
  WHITELIST = 0,
  PUBLIC = 1
}

export function useComicPlatform({
  accountId,
  signer,
  network = "testnet"
}: UseComicPlatformProps) {
  
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const executeWithSigner = async (transaction: any) => {
    const signedTx = await signer.signTransaction(transaction);
    let client: Client;
    if (signer._client) client = signer._client;
    else if (signer.client) client = signer.client;
    else client = Client.forName(network);
    return await signedTx.execute(client);
  };

  const getClient = () => {
    if (signer._client) return signer._client;
    if (signer.client) return signer.client;
    return Client.forName(network);
  };

  const formatTxIdForMirror = (txIdStr: string) => {
    return txIdStr
      .replace("@", "-")
      .replace(/\./g, (match, offset, string) => {
        const dotCount = string.slice(0, offset + 1).split('.').length - 1;
        return dotCount <= 2 ? "." : "-";
      });
  };

  const getMirrorNodeUrl = () => {
    return network === "testnet" 
      ? "https://testnet.mirrornode.hedera.com" 
      : "https://mainnet.mirrornode.hedera.com";
  };

   const {
      createInscription,
      status: inscriptionStatus,
      progress: inscriptionProgress,
      result: inscriptionResult,
      error: inscriptionError,
      statusText: inscriptionStatusText,
      reset: resetInscription,
    } = useComicInscription({ accountId, signer, network });
  

  // ============================================
  // CREATOR FUNCTIONS
  // ============================================

  /**
   * Step 1: Create Comic Collection
   * Call this after backend uploads comic to IPFS
   */
  const createComicCollection = async ({
    episodeId,
    name,
    symbol,
    maxSupply,
  }: {
    episodeId: string; // From backend (e.g., "ep_001")
    name: string;
    symbol: string;
    maxSupply: number;
  }) => {
    try {
      setStatus("processing");
      setError(null);
      console.log("📚 Creating comic collection:", { episodeId, name, maxSupply });

      const tx = new ContractExecuteTransaction()
        .setContractId(CONTRACTS.COMIC_CORE)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(15000000)
        .setPayableAmount(new Hbar(30)) // For NFT token creation
        .setFunction(
          "createComicCollection",
          new ContractFunctionParameters()
            .addString(episodeId)
            .addString(name)
            .addString(symbol)
            .addString(`${name} Collection`)
            .addInt64(maxSupply)
            .addInt64(7000000) // Auto-renew period
        );

      const response = await executeWithSigner(tx);
      const txIdStr = response.transactionId.toString();
      const receipt = await response.getReceipt(getClient());
      console.log("✅ Collection created!");
       await new Promise(resolve => setTimeout(resolve, 5000));
      
      const txIdFormatted = formatTxIdForMirror(txIdStr);
      const mirrorResponse = await fetch(
        `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
      );
      const mirrorData = await mirrorResponse.json();
      console.log("Mirror Node data:", mirrorData);
      
      const tokenEvmAddress = mirrorData?.call_result 
        ? "0x" + mirrorData.call_result.slice(-40) 
        : null;
      const tokenId = tokenEvmAddress;

      console.log("🎉 New Token ID:", tokenId);

      setTxId(txIdStr);
      setStatus("done");

      return {
        transactionId: txIdStr,
        status: receipt.status.toString(),
        tokenId
      };
    } catch (err: any) {
      console.error("❌ Collection creation failed:", err);
      setError(err.message);
      setStatus("error");
      throw err;
    }
  };

  // ============================================
  // PATH 1: DIRECT LISTING
  // ============================================

  /**
   * Create Direct Listing (mints + lists for sale immediately)
   */
  // const createDirectListing = async ({
  //   episodeId,
  //   quantity,
  //   pricePerNFT,
  //   metadata,
  // }: {
  //   episodeId: string;
  //   quantity: number;
  //   pricePerNFT: number; // in HBAR
  //   metadata: string; // "hcs://1/topicId"
  // }) => {
  //   try {
  //     setStatus("processing");
  //     setError(null);
  //     // console.log("💼 Starting Inscription process...");
  //     // const inscriptionResult = await createInscription(metadata, episodeId);
  //     // console.log("✅ Inscription created:", inscriptionResult);
  //     console.log("🏪 Proceeding to create direct listing:", { episodeId, quantity, pricePerNFT });
  //     console.log("🏪 Creating direct listing:", { episodeId, quantity, pricePerNFT });

  //     const priceInTinybars = Hbar.from(pricePerNFT, HbarUnit.Hbar).toTinybars();
  //       // const topicId = inscriptionResult.topicId || '';
  //       // console.log("🎉 Inscription Topic ID:", topicId);
  //       // const metadataHRL = `hcs://1/${topicId}`;
  //         // console.log("Metadata HRL:", metadataHRL);
  //     //  const BATCH_SIZE = 10;
  //     // let allSerials: number[] = [];
  //     // let mintedCount = 0;
  //     // for (let batchStart = 0; batchStart < quantity; batchStart += BATCH_SIZE) {
  //     //         const batchEnd = Math.min(batchStart + BATCH_SIZE, quantity);
  //     //         const batchCount = batchEnd - batchStart;
              
  //     //         console.log(`📦 Minting batch: NFTs ${batchStart + 1}-${batchEnd} (${batchCount} NFTs)`);
              
  //             // Create metadata buffers for this batch only
  //             // const metadataBuffers = Array(batchCount).fill(
  //             //   Buffer.from(metadata || "")
  //             // );
  //     const tx = new ContractExecuteTransaction()
  //       .setContractId(CONTRACTS.COMIC_SALES)
  //       .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
  //       .setGas(5000000 + (quantity * 500000))
  //       .setFunction(
  //         "createDirectListing",
  //         new ContractFunctionParameters()
  //           .addString(episodeId)
  //           .addUint256(quantity)
  //           .addUint256(priceInTinybars)
  //            .addBytes(Buffer.from(metadata))
  //             //.addBytesArray(metadataBuffers)
  //       );

  //     const response = await executeWithSigner(tx);
  //     const txIdStr = response.transactionId.toString();
  //     const receipt = await response.getReceipt(getClient());

  //     console.log("✅ Direct listing created!");
      

  //     setTxId(txIdStr);
  //     setStatus("done");
      
  //     // Get listing ID from mirror node (optional)
  //     await new Promise(resolve => setTimeout(resolve, 5000));
  //     const txIdFormatted = formatTxIdForMirror(txIdStr);
  //     const mirrorResponse = await fetch(
  //       `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
  //     );
  //     const mirrorData = await mirrorResponse.json();
  //     console.log("Mirror Node data:", mirrorData);
      
  //     let listingId: string | undefined;
  //     if (mirrorData?.call_result) {
  //       listingId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
  //     }
    

  //     return {
  //       transactionId: txIdStr,
  //       status: receipt.status.toString(),
  //       listingId,
  //     };
  //      // metadataHRL
  //     // };
  //   } catch (err: any) {
  //     console.error("❌ Direct listing failed:", err);
  //     setError(err.message);
  //     setStatus("error");
  //     throw err;
  //   }
  // };

    /**
   * Create Direct Listing (mints + lists for sale immediately)
   * NOW WITH BATCH SUPPORT FOR MINTING
   */
  const createDirectListing = async ({
    episodeId,
    quantity,
    pricePerNFT,
    metadata,
  }: {
    episodeId: string;
    quantity: number;
    pricePerNFT: number; // in HBAR
    metadata: string; // "hcs://1/topicId"
  }) => {
    let lastTxId = '';
    try {
      setStatus("processing");
      setError(null);
      setMintProgress(0);
      console.log("🏪 Creating direct listing with batch minting:", { episodeId, quantity, pricePerNFT });

      const priceInTinybars = Hbar.from(pricePerNFT, HbarUnit.Hbar).toTinybars();
      
      // Constants for batch processing
      const BATCH_SIZE = 10; // Hedera's limit
      const totalBatches = Math.ceil(quantity / BATCH_SIZE);
      let completedBatches = 0;

      console.log(`📦 Will mint in ${totalBatches} batches of up to ${BATCH_SIZE} NFTs each`);

      // Process in batches
      for (let batchStart = 0; batchStart < quantity; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, quantity);
        const batchQuantity = batchEnd - batchStart;
        const currentBatch = completedBatches + 1;
        
        console.log(`📦 Processing batch ${currentBatch}/${totalBatches}: NFTs ${batchStart + 1}-${batchEnd} (${batchQuantity} NFTs)`);
        //setMintStatusText(`Minting batch ${currentBatch}/${totalBatches} (${batchQuantity} NFTs)...`);

        try {
          const tx = new ContractExecuteTransaction()
            .setContractId(CONTRACTS.COMIC_SALES)
            .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
            .setGas(5000000 + (batchQuantity * 500000))
            .setFunction(
              "createDirectListing",
              new ContractFunctionParameters()
                .addString(episodeId)
                .addUint256(batchQuantity)
                .addUint256(priceInTinybars)
                .addBytes(Buffer.from(metadata))
            );

          const response = await executeWithSigner(tx);
          const txIdStr = response.transactionId.toString();
          const receipt = await response.getReceipt(getClient());
          console.log("✅ Batch direct listing created!", receipt);
           lastTxId = txIdStr;

          console.log(`✅ Batch ${currentBatch}/${totalBatches} completed! Transaction: ${txIdStr}`);
          
          completedBatches++;
          const progress = (completedBatches / totalBatches) * 100;
          setMintProgress(progress);

          // Add delay between batches to avoid rate limiting
          if (batchEnd < quantity) {
            console.log("⏳ Waiting 3 seconds before next batch...");
            await new Promise(resolve => setTimeout(resolve, 3000));
          }

          // Store the last transaction ID for return
          // if (batchEnd >= quantity) {
          //   setTxId(txIdStr);
          // }

        } catch (batchError: any) {
          console.error(`❌ Batch ${currentBatch}/${totalBatches} failed:`, batchError);
          throw new Error(`Batch minting failed at NFTs ${batchStart + 1}-${batchEnd}: ${batchError.message}`);
        }
      }

      console.log("✅ All batches completed! Direct listing created successfully!");
      setMintProgress(100);
      setTxId(lastTxId);
      // setMintStatusText(`Successfully minted and listed ${quantity} NFTs!`);
      setStatus("done");
      
      // Get listing ID from mirror node for the last transaction
      await new Promise(resolve => setTimeout(resolve, 5000));
      const txIdFormatted = formatTxIdForMirror(lastTxId);
      const mirrorResponse = await fetch(
        `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
      );
      const mirrorData = await mirrorResponse.json();
      console.log("Mirror Node data:", mirrorData);
      
      let listingId: string | undefined;
      if (mirrorData?.call_result) {
        listingId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
      }

      return {
        transactionId: lastTxId,
        status: "SUCCESS",
        listingId,
        totalMinted: quantity,
        batches: totalBatches,
      };
    } catch (err: any) {
      console.error("❌ Direct listing with batch minting failed:", err);
      setError(err.message);
      setStatus("error");
      // setMintProgress(0);
      throw err;
    }
  };
  /**
   * Purchase from Direct Listing
   */
  const purchaseFromListing = async ({
    listingId,
    quantity,
    pricePerNFT,
  }: {
    listingId: number;
    quantity: number;
    pricePerNFT: number; // in HBAR
  }) => {
    try {
      setStatus("processing");
      setError(null);
      console.log("💳 Purchasing from listing:", { listingId, quantity });

      const totalPrice = pricePerNFT * quantity;

      const tx = new ContractExecuteTransaction()
        .setContractId(CONTRACTS.COMIC_SALES)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        // .setGas(2000000)
        .setGas(5000000 + (quantity * 500000))
        .setPayableAmount(new Hbar(totalPrice, HbarUnit.Hbar))
        .setFunction(
          "purchaseFromListing",
          new ContractFunctionParameters()
            .addUint256(typeof listingId === "string" ? parseInt(listingId) : listingId)
            .addUint256(quantity)
        );

      const response = await executeWithSigner(tx);
      const txIdStr = response.transactionId.toString();
      const receipt = await response.getReceipt(getClient());

      console.log("✅ Purchase successful! You can now read this comic!");
      setTxId(txIdStr);
      setStatus("done");

      return {
        transactionId: txIdStr,
        status: receipt.status.toString(),
      };
    } catch (err: any) {
      console.error("❌ Purchase failed:", err);
      setError(err.message);
      setStatus("error");
      throw err;
    }
  };

  // ============================================
  // PATH 2: CAMPAIGN/DROP SYSTEM
  // ============================================

  /**
   * Create Campaign (Public/Whitelist/Scheduled)
   */
  const createCampaign = async ({
    episodeId,
    campaignType,
    mintPrice,
    maxSupply,
    maxPerWallet,
    metadata,
  }: {
    episodeId: string;
    campaignType: CampaignType;
    mintPrice: number; // in HBAR
    maxSupply: number;
    maxPerWallet: number;
    metadata: string;
  }) => {
    try {
      setStatus("processing");
      setError(null);
      console.log("🎯 Creating campaign:", { episodeId, campaignType, maxSupply });

      const priceInTinybars = Hbar.from(mintPrice, HbarUnit.Hbar).toTinybars();

      const tx = new ContractExecuteTransaction()
        .setContractId(CONTRACTS.COMIC_SALES)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(3000000)
        .setFunction(
          "createCampaign",
          new ContractFunctionParameters()
            .addString(episodeId)
            .addUint8(campaignType)
            .addUint256(priceInTinybars)
            .addUint256(maxSupply)
            .addUint256(maxPerWallet)
            .addBytes(Buffer.from(metadata))
        );

      const response = await executeWithSigner(tx);
      const txIdStr = response.transactionId.toString();
      const receipt = await response.getReceipt(getClient());

      console.log("✅ Campaign created!");
      setTxId(txIdStr);
      setStatus("done");

      return {
        transactionId: txIdStr,
        status: receipt.status.toString(),
      };
    } catch (err: any) {
      console.error("❌ Campaign creation failed:", err);
      setError(err.message);
      setStatus("error");
      throw err;
    }
  };

  /**
   * Add addresses to whitelist (for WHITELIST campaigns)
   */
  const addToWhitelist = async ({
    campaignId,
    addresses,
    allocations,
  }: {
    campaignId: number;
    addresses: string[];
    allocations: number[];
  }) => {
    try {
      setStatus("processing");
      setError(null);
      console.log("📋 Adding to whitelist:", { campaignId, count: addresses.length });

      const tx = new ContractExecuteTransaction()
        .setContractId(CONTRACTS.COMIC_SALES)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(1000000 + (addresses.length * 100000))
        .setFunction(
          "addToWhitelist",
          new ContractFunctionParameters()
            .addUint256(campaignId)
            .addAddressArray(addresses)
            .addUint256Array(allocations)
        );

      const response = await executeWithSigner(tx);
      const receipt = await response.getReceipt(getClient());

      console.log("✅ Whitelist updated!");
      setTxId(response.transactionId.toString());
      setStatus("done");

      return {
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString(),
      };
    } catch (err: any) {
      console.error("❌ Whitelist update failed:", err);
      setError(err.message);
      setStatus("error");
      throw err;
    }
  };

  /**
   * Add phase (for SCHEDULED campaigns)
   */
  const addPhase = async ({
    campaignId,
    phaseType,
    startTime,
    endTime,
    mintPrice,
    maxPerWallet,
    phaseSupply,
  }: {
    campaignId: number;
    phaseType: PhaseType;
    startTime: number; // Unix timestamp
    endTime: number;
    mintPrice: number; // in HBAR
    maxPerWallet: number;
    phaseSupply: number;
  }) => {
    try {
      setStatus("processing");
      setError(null);
      console.log("⏰ Adding phase:", { campaignId, phaseType });

      const priceInTinybars = Hbar.from(mintPrice, HbarUnit.Hbar).toTinybars();

      const tx = new ContractExecuteTransaction()
        .setContractId(CONTRACTS.COMIC_SALES)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(2000000)
        .setFunction(
          "addPhase",
          new ContractFunctionParameters()
            .addUint256(campaignId)
            .addUint8(phaseType)
            .addUint256(startTime)
            .addUint256(endTime)
            .addUint256(priceInTinybars)
            .addUint256(maxPerWallet)
            .addUint256(phaseSupply)
        );

      const response = await executeWithSigner(tx);
      const receipt = await response.getReceipt(getClient());

      console.log("✅ Phase added!");
      setTxId(response.transactionId.toString());
      setStatus("done");

      return {
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString(),
      };
    } catch (err: any) {
      console.error("❌ Phase add failed:", err);
      setError(err.message);
      setStatus("error");
      throw err;
    }
  };

  /**
   * Mint from Campaign
   */
  const mintFromCampaign = async ({
    campaignId,
    phaseId = 0,
    quantity,
    mintPrice,
  }: {
    campaignId: number;
    phaseId?: number; // 0 for PUBLIC/WHITELIST, specific ID for SCHEDULED
    quantity: number;
    mintPrice: number; // in HBAR
  }) => {
    try {
      setStatus("processing");
      setError(null);
      console.log("🎨 Minting from campaign:", { campaignId, quantity });

      const totalPrice = mintPrice * quantity;

      const tx = new ContractExecuteTransaction()
        .setContractId(CONTRACTS.COMIC_SALES)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(4000000 + (quantity * 500000))
        .setPayableAmount(new Hbar(totalPrice, HbarUnit.Hbar))
        .setFunction(
          "mint",
          new ContractFunctionParameters()
            .addUint256(campaignId)
            .addUint256(phaseId)
            .addUint256(quantity)
        );

      const response = await executeWithSigner(tx);
      const txIdStr = response.transactionId.toString();
      const receipt = await response.getReceipt(getClient());

      console.log("✅ Mint successful! You can now read this comic!");
      setTxId(txIdStr);
      setStatus("done");

      return {
        transactionId: txIdStr,
        status: receipt.status.toString(),
      };
    } catch (err: any) {
      console.error("❌ Mint failed:", err);
      setError(err.message);
      setStatus("error");
      throw err;
    }
  };

  // ============================================
  // MARKETPLACE - RESALE
  // ============================================

  /**
   * List NFT for Resale
   */
  const listForResale = async ({
    tokenAddress,
    serialNumber,
    priceInHbar,
  }: {
    tokenAddress: string;
    serialNumber: number;
    priceInHbar: number;
  }) => {
    try {
      setStatus("processing");
      setError(null);
      console.log("📝 Listing for resale:", { serialNumber, priceInHbar });

      const priceInTinybars = Hbar.from(priceInHbar, HbarUnit.Hbar).toTinybars();

      const tx = new ContractExecuteTransaction()
        .setContractId(CONTRACTS.COMIC_MARKETPLACE)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(5000000)
        .setFunction(
          "depositAndListForResale",
          new ContractFunctionParameters()
            .addAddress(TokenId.fromString(tokenAddress).toEvmAddress())
            .addInt64(serialNumber)
            .addUint256(priceInTinybars)
        );

      const response = await executeWithSigner(tx);
      const txIdStr = response.transactionId.toString();
      const receipt = await response.getReceipt(getClient());

      console.log("✅ Listed for resale!");
      setTxId(txIdStr);
      setStatus("done");

      // Get listing ID
      await new Promise(resolve => setTimeout(resolve, 5000));
      const txIdFormatted = formatTxIdForMirror(txIdStr);
      const mirrorResponse = await fetch(
        `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
      );
      const mirrorData = await mirrorResponse.json();
      
      let listingId: string | undefined;
      if (mirrorData?.call_result) {
        listingId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
      }
      
          const serials: number[] = [];
          let allSerials: number[] = [];
          if (mirrorData?.call_result) {
            const result = mirrorData.call_result.slice(2);
            const arrayLengthHex = result.slice(64, 128);
            const arrayLength = parseInt(arrayLengthHex, 16);
            
            for (let i = 0; i < arrayLength; i++) {
              const start = 128 + (i * 64);
              const serialHex = result.slice(start, start + 64);
              const serial = parseInt(serialHex, 16);
              if (serial > 0) serials.push(serial);
            }
          
            allSerials = allSerials.concat(serials);
            console.log("🎉 Minted serials:", serials);
          }
      return {
        transactionId: txIdStr,
        status: receipt.status.toString(),
        listingId,
        serials: allSerials
      };
    } catch (err: any) {
      console.error("❌ List for resale failed:", err);
      setError(err.message);
      setStatus("error");
      throw err;
    }
  };

  /**
   * Batch list multiple NFTs for resale
   */
  const batchListForResale = async ({
    tokenAddress,
    serialNumbers,
    prices,
  }: {
    tokenAddress: string;
    serialNumbers: number[];
    prices: number[]; // in HBAR
  }) => {
    try {
      setStatus("processing");
      setError(null);
      console.log("📝 Batch listing for resale:", { count: serialNumbers.length });

      const pricesInTinybars = prices.map(p => Hbar.from(p, HbarUnit.Hbar).toTinybars());

      const tx = new ContractExecuteTransaction()
        .setContractId(CONTRACTS.COMIC_MARKETPLACE)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(3000000 + (serialNumbers.length * 300000))
        .setFunction(
          "batchDepositAndListForResale",
          new ContractFunctionParameters()
            .addAddress(TokenId.fromString(tokenAddress).toEvmAddress())
            .addInt64Array(serialNumbers)
            .addUint256Array(pricesInTinybars)
        );

      const response = await executeWithSigner(tx);
      const txIdStr = response.transactionId.toString();
      const receipt = await response.getReceipt(getClient());

      console.log("✅ Batch listed for resale!");
      setTxId(txIdStr);
      setStatus("done");

      return {
        transactionId: txIdStr,
        status: receipt.status.toString(),
      };
    } catch (err: any) {
      console.error("❌ Batch list failed:", err);
      setError(err.message);
      setStatus("error");
      throw err;
    }
  };

  /**
   * Purchase from Marketplace (Resale)
   */
  const purchaseFromMarketplace = async ({
    listingId,
    priceInHbar,
  }: {
    listingId: number;
    priceInHbar: number;
  }) => {
    try {
      setStatus("processing");
      setError(null);
      console.log("💳 Purchasing from marketplace:", { listingId });

      const tx = new ContractExecuteTransaction()
        .setContractId(CONTRACTS.COMIC_MARKETPLACE)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(5000000)
        .setPayableAmount(new Hbar(priceInHbar, HbarUnit.Hbar))
        .setFunction(
          "purchaseNFT",
          new ContractFunctionParameters()
            .addUint256(typeof listingId === "string" ? parseInt(listingId) : listingId)
        );

      const response = await executeWithSigner(tx);
      const txIdStr = response.transactionId.toString();
      const receipt = await response.getReceipt(getClient());

      console.log("✅ Purchase successful! Reading access transferred!");
      setTxId(txIdStr);
      setStatus("done");

      return {
        transactionId: txIdStr,
        status: receipt.status.toString(),
      };
    } catch (err: any) {
      console.error("❌ Purchase failed:", err);
      setError(err.message);
      setStatus("error");
      throw err;
    }
  };

  /**
   * Cancel Listing
   */
  const cancelListing = async (listingId: number) => {
    try {
      setStatus("processing");
      setError(null);

      const tx = new ContractExecuteTransaction()
        .setContractId(CONTRACTS.COMIC_MARKETPLACE)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(2000000)
        .setFunction(
          "cancelListing",
          new ContractFunctionParameters()
            .addUint256(listingId)
        );

      const response = await executeWithSigner(tx);
      const receipt = await response.getReceipt(getClient());

      setTxId(response.transactionId.toString());
      setStatus("done");

      return {
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString(),
      };
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      throw err;
    }
  };

  // ============================================
  // QUERY FUNCTIONS
  // ============================================

 const canReadComic = async (episodeId: string, userAddress: string): Promise<boolean> => {
  try {
    const abi = ['function canReadComic(string episodeId, address user) external view returns (bool)'];
    const abiInterface = new ethers.Interface(abi);
    const encodedData = abiInterface.encodeFunctionData('canReadComic', [episodeId, userAddress]);

    // Convert contract ID to EVM address (e.g., 0.0.1234 → 0x00000000000000000000000000000000000004d2)
    const contractAddress = ContractId.fromString(CONTRACTS.COMIC_CORE).toEvmAddress();

    const response = await fetch('https://testnet.mirrornode.hedera.com/api/v1/contracts/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        block: 'latest',
        data: encodedData,
        to: contractAddress
      })
    });

    const result = await response.json();
    
    // Decode the boolean result
    const decoded = abiInterface.decodeFunctionResult('canReadComic', result.result);
    return decoded[0];
  } catch (err) {
    console.error('❌ Query failed:', err);
    return false;
  }
};


  /**
   * Check if user can read comic (for backend)
   */
  // const canReadComic = async (episodeId: string, userAddress: string): Promise<boolean> => {
  //   try {
  //     const client = Client.forName(network);

  //     const query = new ContractCallQuery()
  //       .setContractId(CONTRACTS.COMIC_CORE)
  //       .setGas(100000)
  //       .setFunction(
  //         "canReadComic",
  //         new ContractFunctionParameters()
  //           .addString(episodeId)
  //           .addAddress(userAddress)
  //       );

  //     const result = await query.execute(client);
  //     return result.getBool(0);
  //   } catch (err: any) {
  //     console.error("❌ Query failed:", err);
  //     return false;
  //   }
  // };

  /**
   * Get episode details
   */
  const getEpisode = async (episodeId: string) => {
    try {
      const client = Client.forName(network);

      const query = new ContractCallQuery()
        .setContractId(CONTRACTS.COMIC_CORE)
        .setGas(100000)
        .setFunction(
          "getEpisode",
          new ContractFunctionParameters()
            .addString(episodeId)
        );

      const result = await query.execute(client);

      return {
        tokenAddress: result.getAddress(0),
        creator: result.getAddress(1),
        name: result.getString(2),
        maxSupply: Number(result.getInt64(3)),
        currentSupply: Number(result.getInt64(4)),
        exists: result.getBool(5),
      };
    } catch (err: any) {
      console.error("❌ Query failed:", err);
      throw err;
    }
  };

  /**
   * Get campaign details
   */
  const getCampaign = async (campaignId: number) => {
    try {
      const client = Client.forName(network);

      const query = new ContractCallQuery()
        .setContractId(CONTRACTS.COMIC_SALES)
        .setGas(150000)
        .setFunction(
          "getCampaign",
          new ContractFunctionParameters()
            .addUint256(campaignId)
        );

      const result = await query.execute(client);

      return {
        episodeId: result.getString(0),
        creator: result.getAddress(1),
        campaignType: Number(result.getUint8(2)) as CampaignType,
        mintPrice: result.getUint256(3).toString(),
        maxSupply: result.getUint256(4).toString(),
        totalMinted: result.getUint256(5).toString(),
        isActive: result.getBool(6),
      };
    } catch (err: any) {
      console.error("❌ Query failed:", err);
      throw err;
    }
  };

  /**
   * Get direct listing details
   */
  const getDirectListing = async (listingId: number) => {
    try {
      const client = Client.forName(network);

      const query = new ContractCallQuery()
        .setContractId(CONTRACTS.COMIC_SALES)
        .setGas(100000)
        .setFunction(
          "getDirectListing",
          new ContractFunctionParameters()
            .addUint256(listingId)
        );

      const result = await query.execute(client);

      return {
        episodeId: result.getString(0),
        creator: result.getAddress(1),
        pricePerNFT: result.getUint256(2).toString(),
        available: result.getUint256(3).toString(),
        isActive: result.getBool(4),
      };
    } catch (err: any) {
      console.error("❌ Query failed:", err);
      throw err;
    }
  };

  /**
   * Get marketplace listing details
   */
  const getMarketplaceListing = async (listingId: number) => {
    try {
      const client = Client.forName(network);

      const query = new ContractCallQuery()
        .setContractId(CONTRACTS.COMIC_MARKETPLACE)
        .setGas(100000)
        .setFunction(
          "getListing",
          new ContractFunctionParameters()
            .addUint256(listingId)
        );
       const response = await executeWithSigner(query);
      const result = await response.execute(client);
      console.log("Marketplace listing result:", result);

      return {
        tokenAddress: result.getAddress(0),
        serialNumber: Number(result.getInt64(1)),
        seller: result.getAddress(2),
        price: result.getUint256(3).toString(),
        isActive: result.getBool(4),
      };
    } catch (err: any) {
      console.error("❌ Query failed:", err);
      throw err;
    }
  };

  /**
   * Get current phase for scheduled campaign
   */
  const getCurrentPhase = async (campaignId: number) => {
    try {
      const client = Client.forName(network);

      const query = new ContractCallQuery()
        .setContractId(CONTRACTS.COMIC_SALES)
        .setGas(200000)
        .setFunction(
          "getCurrentPhase",
          new ContractFunctionParameters()
            .addUint256(campaignId)
        );

      const result = await query.execute(client);

      return {
        phaseId: Number(result.getUint256(0)),
        exists: result.getBool(1),
      };
    } catch (err: any) {
      console.error("❌ Query failed:", err);
      throw err;
    }
  };

  return {
    // Creator functions
    createComicCollection,
    createDirectListing,
    createCampaign,
    addToWhitelist,
    addPhase,
    
    // User functions - Buying
    purchaseFromListing,
    mintFromCampaign,
    
    // User functions - Reselling
    listForResale,
    batchListForResale,
    purchaseFromMarketplace,
    cancelListing,
    
    // Query functions
    canReadComic,
    getEpisode,
    getCampaign,
    getDirectListing,
    getMarketplaceListing,
    getCurrentPhase,
    
    // State
    status,
    error,
    txId,
  };
}

export default useComicPlatform;
function setMintProgress(progress: number) {
  if (Number.isNaN(progress)) return;
  const clamped = Math.max(0, Math.min(100, progress));
  console.debug("Mint progress:", clamped);
}
// function setMintStatusText(text: string) {
//   if (!text) return;
//   console.debug("Mint status:", text);
// }
// function setMintStatusText(arg0: string) {
//   throw new Error("Function not implemented.");
// }

