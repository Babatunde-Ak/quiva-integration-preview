
import { useEffect, useState } from "react";
import {
  ContractExecuteTransaction,
  Client,
  ContractFunctionParameters,
  AccountId,
  TokenId,
  TransactionId,
  ContractCallQuery,
  Hbar,
  HbarUnit,
} from "@hashgraph/sdk";
import { useComicInscription } from "./useComicInscription";

interface UseNFTMarketplaceProps {
  accountId: string;
  network?: "testnet" | "mainnet";
  marketplaceContractId: string;
  signer: any;
}

interface Collection {
  creator: string;
  name: string;
  symbol: string;
  maxSupply: string;
  currentSupply: string;
}

interface Listing {
  tokenAddress: string;
  serialNumber: string;
  seller: string;
  price: string;
  isActive: boolean;
}

interface MintResult {
  transactionId: string;
  status: string;
  serials: number[];
}

export function useNFTMarketplace({
  accountId,
  network = "testnet",
  marketplaceContractId,
  signer,
}: UseNFTMarketplaceProps) {
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [mintStatus, setMintStatus] = useState<"idle" | "inscribing" | "minting" | "done" | "error">("idle");
  const [mintProgress, setMintProgress] = useState<number>(0);
  const [mintError, setMintError] = useState<string | null>(null);
  const [mintResult, setMintResult] = useState<MintResult | null>(null);
  const [mintStatusText, setMintStatusText] = useState<string>("");

  const {
    createInscription,
    status: inscriptionStatus,
    progress: inscriptionProgress,
    result: inscriptionResult,
    error: inscriptionError,
    statusText: inscriptionStatusText,
    reset: resetInscription,
  } = useComicInscription({ accountId, signer, network });

  useEffect(() => {
    if (inscriptionStatus === "inscribing") {
      setMintStatus("inscribing");
      setMintProgress(inscriptionProgress * 0.5);
      setMintStatusText(inscriptionStatusText || "Inscribing comic...");
    } else if (inscriptionStatus === "error") {
      setMintStatus("error");
      setMintError(inscriptionError || "Inscription failed");
    }
  }, [inscriptionStatus, inscriptionProgress, inscriptionError, inscriptionStatusText]);

  const executeWithSigner = async (transaction: any) => {
    console.log("🔐 Signing and executing transaction with wallet...");
    
    try {
      const signedTx = await signer.signTransaction(transaction);
      console.log("✅ Transaction signed");
      
      let client: Client;
      
      if (signer._client) {
        console.log("Using signer's internal client");
        client = signer._client;
      } else if (signer.client) {
        console.log("Using signer's client");
        client = signer.client;
      } else {
        console.log("Creating new client");
        client = Client.forName(network);
      }
      
      console.log("Executing signed transaction...");
      const txResponse = await signedTx.execute(client);
      
      return txResponse;
    } catch (err: any) {
      console.error("Transaction execution error:", err);
      throw err;
    }
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

  const getClient = () => {
    if (signer._client) return signer._client;
    if (signer.client) return signer.client;
    return Client.forName(network);
  };

  // ========================================
  // 1. CREATE COLLECTION
  // ========================================
  const createCollection = async ({
    name,
    symbol,
    memo,
    maxSupply,
    autoRenewPeriod = 7000000,
  }: {
    name: string;
    symbol: string;
    memo: string;
    maxSupply: number;
    autoRenewPeriod?: number;
  }) => {
    try {
      setStatus("processing");
      setError(null);
      console.log("🎨 Creating NFT collection:", { name, symbol, maxSupply });

      const contractExecTx = new ContractExecuteTransaction()
        .setContractId(marketplaceContractId)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(4000000)
        .setPayableAmount(new Hbar(20))
        .setFunction(
          "createCollection",
          new ContractFunctionParameters()
            .addString(name)
            .addString(symbol)
            .addString(memo)
            .addInt64(maxSupply)
            .addInt64(autoRenewPeriod)
        );

      const txResponse = await executeWithSigner(contractExecTx);
      const txIdStr = txResponse.transactionId.toString();
      console.log("📤 Transaction submitted:", txIdStr);

      const client = getClient();
      const receipt = await txResponse.getReceipt(client);
      console.log("✅ Collection created successfully");

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
        tokenId,
        tokenEvmAddress,
      };
    } catch (err: any) {
      console.error("❌ Collection creation failed:", err);
      setError(err.message || "Collection creation failed");
      setStatus("error");
      throw err;
    }
  };

  // ========================================
  // 2. MINT NFTs (Batch)
  // ========================================
  const mintNFTs = async ({
    tokenId,
    inscriptionData,
    copies
  }: {
    tokenId: string;
    inscriptionData: any;
    copies: number;
  }) => {
    try {
      setStatus("processing");
      setError(null);
      setMintStatus("minting");
      console.log("🎨 Minting NFTs:", { tokenId, count: copies });
      
      const metadataHRL = `hcs://1/${inscriptionData.topicId}`;
      console.log("📄 Metadata HRL:", metadataHRL);
      
      const BATCH_SIZE = 10;
      let allSerials: number[] = [];
      let txIdStr = "";
      let receipt: any;

      setMintStatusText(`Minting ${copies} Copies...`);

      for (let batchStart = 0; batchStart < copies; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, copies);
        const batchCount = batchEnd - batchStart;
        
        console.log(`📦 Minting batch: NFTs ${batchStart + 1}-${batchEnd} (${batchCount} NFTs)`);
        
        const metadataBuffers = Array(batchCount).fill(
          Buffer.from(metadataHRL || "")
        );

        try {
          const contractExecTx = new ContractExecuteTransaction()
            .setContractId(marketplaceContractId)
            .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
            .setGas(4000000)
            .setMaxTransactionFee(new Hbar(20))
            .setFunction(
              "mintNFTs",
              new ContractFunctionParameters()
                .addAddress(tokenId)
                .addBytesArray(metadataBuffers)
            );

          const txResponse = await executeWithSigner(contractExecTx);
          txIdStr = txResponse.transactionId.toString();
          console.log("📤 Transaction submitted:", txIdStr);
          setTxId(txIdStr);

          const client = getClient();
          receipt = await txResponse.getReceipt(client);
          console.log("✅ NFTs minted successfully", receipt);

          await new Promise(resolve => setTimeout(resolve, 5000));
          
          const txIdFormatted = formatTxIdForMirror(txIdStr);
          const mirrorResponse = await fetch(
            `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
          );
          const mirrorData = await mirrorResponse.json();
          console.log("Mirror Node data:", mirrorData);
          
          const serials: number[] = [];
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

          setMintProgress(50 + ((batchEnd / copies) * 50));
          setMintStatusText(`Minted ${batchEnd} of ${copies} NFTs...`);
        } catch (batchError: any) {
          console.error(`❌ Error minting batch ${Math.ceil((batchStart + 1) / BATCH_SIZE)}:`, batchError);
          throw new Error(`Failed to mint batch ${Math.ceil((batchStart + 1) / BATCH_SIZE)}: ${batchError.message}`);
        }
        
        if (batchEnd < copies) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    
      setStatus("done");
      setMintStatus("done");
      setMintProgress(100);

      return {
        transactionId: txIdStr,
        status: receipt.status.toString(),
        serials: allSerials,
      };
    } catch (err: any) {
      console.error("❌ Minting failed:", err);
      setError(err.message || "Minting failed");
      setMintError(err.message || "Minting failed");
      setStatus("error");
      setMintStatus("error");
      throw err;
    }
  };

  // ========================================
  // 3. LIST SINGLE NFT
  // ========================================
  const listNFT = async ({
    tokenId,
    serialNumber,
    priceInHbar,
  }: {
    tokenId: string;
    serialNumber: number;
    priceInHbar: number;
  }) => {
    try {
      setStatus("processing");
      setError(null);
      console.log("📝 Listing NFT:", { tokenId, serialNumber, priceInHbar });

      const priceInTinybars = Hbar.from(priceInHbar, HbarUnit.Hbar).toTinybars();
      
      const contractExecTx = new ContractExecuteTransaction()
        .setContractId(marketplaceContractId)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(1500000)
        .setFunction(
          "listNFT",
          new ContractFunctionParameters()
            .addAddress(tokenId)
            .addInt64(serialNumber)
            .addUint256(priceInTinybars)
        );

      const txResponse = await executeWithSigner(contractExecTx);
      const txIdStr = txResponse.transactionId.toString();
      console.log("📤 Transaction submitted:", txIdStr);

      const client = getClient();
      const receipt = await txResponse.getReceipt(client);
      console.log("✅ NFT listed successfully");

      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const txIdFormatted = formatTxIdForMirror(txIdStr);
      const mirrorResponse = await fetch(
        `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
      );
      const mirrorData = await mirrorResponse.json();
      
      let listingId: string | undefined;
      if (mirrorData?.call_result) {
        const result = mirrorData.call_result.slice(2);
        listingId = BigInt("0x" + result).toString();
      }

      console.log("🎉 Listing ID:", listingId);

      setTxId(txIdStr);
      setStatus("done");

      return {
        transactionId: txIdStr,
        status: receipt.status.toString(),
        listingId,
      };
    } catch (err: any) {
      console.error("❌ Listing failed:", err);
      setError(err.message || "Listing failed");
      setStatus("error");
      throw err;
    }
  };

  // ========================================
  // 3B. BATCH LIST NFTs
  // ========================================
  const batchListNFTs = async ({
    tokenId,
    serialNumbers,
    priceInHbar,
  }: {
    tokenId: string;
    serialNumbers: number[];
    priceInHbar: number;
  }) => {
    try {
      setStatus("processing");
      setError(null);
      console.log("📝 Batch listing NFTs:", { tokenId, count: serialNumbers.length, priceInHbar });

      const priceInTinybars = Hbar.from(priceInHbar, HbarUnit.Hbar).toTinybars();
      const prices = Array(serialNumbers.length).fill(priceInTinybars);
      
      const contractExecTx = new ContractExecuteTransaction()
        .setContractId(marketplaceContractId)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(1500000 + (serialNumbers.length * 100000)) // Scale gas with number of listings
        .setFunction(
          "batchListNFTs",
          new ContractFunctionParameters()
            .addAddress(tokenId)
            .addInt64Array(serialNumbers)
            .addUint256Array(prices)
        );

      const txResponse = await executeWithSigner(contractExecTx);
      const txIdStr = txResponse.transactionId.toString();
      console.log("📤 Transaction submitted:", txIdStr);

      const client = getClient();
      const receipt = await txResponse.getReceipt(client);
      console.log("✅ NFTs listed successfully");

      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const txIdFormatted = formatTxIdForMirror(txIdStr);
      const mirrorResponse = await fetch(
        `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
      );
      const mirrorData = await mirrorResponse.json();
      
      const listingIds: string[] = [];
      if (mirrorData?.call_result) {
        const result = mirrorData.call_result.slice(2);
        const arrayLengthHex = result.slice(64, 128);
        const arrayLength = parseInt(arrayLengthHex, 16);
        
        for (let i = 0; i < arrayLength; i++) {
          const start = 128 + (i * 64);
          const listingIdHex = result.slice(start, start + 64);
          const listingId = BigInt("0x" + listingIdHex).toString();
          listingIds.push(listingId);
        }
      }

      console.log("🎉 Listing IDs:", listingIds);

      setTxId(txIdStr);
      setStatus("done");

      return {
        transactionId: txIdStr,
        status: receipt.status.toString(),
        listingIds,
      };
    } catch (err: any) {
      console.error("❌ Batch listing failed:", err);
      setError(err.message || "Batch listing failed");
      setStatus("error");
      throw err;
    }
  };

  // ========================================
  // 4. PURCHASE NFT
  // ========================================
  const purchaseNFT = async ({
    listingId,
    priceInHbar,
  }: {
    listingId: number | string;
    priceInHbar: number;
  }) => {
    try {
      setStatus("processing");
      setError(null);
      console.log("🛒 Purchasing NFT:", { listingId, priceInHbar });

      const contractExecTx = new ContractExecuteTransaction()
        .setContractId(marketplaceContractId)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(4000000)
        .setPayableAmount(new Hbar(priceInHbar, HbarUnit.Hbar))
        .setFunction(
          "purchaseNFT",
          new ContractFunctionParameters()
            .addUint256(typeof listingId === "string" ? parseInt(listingId) : listingId)
        );

      const txResponse = await executeWithSigner(contractExecTx);
      const txIdStr = txResponse.transactionId.toString();
      console.log("📤 Transaction submitted:", txIdStr);

      const client = getClient();
      const receipt = await txResponse.getReceipt(client);
      console.log("✅ NFT purchased successfully");

      setTxId(txIdStr);
      setStatus("done");

      return {
        transactionId: txIdStr,
        status: receipt.status.toString(),
      };
    } catch (err: any) {
      console.error("❌ Purchase failed:", err);
      setError(err.message || "Purchase failed");
      setStatus("error");
      throw err;
    }
  };

  // ========================================
  // 5. CANCEL LISTING
  // ========================================
  const cancelListing = async ({
    listingId,
  }: {
    listingId: number | string;
  }) => {
    try {
      setStatus("processing");
      setError(null);
      console.log("❌ Cancelling listing:", listingId);

      const contractExecTx = new ContractExecuteTransaction()
        .setContractId(marketplaceContractId)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(1000000)
        .setFunction(
          "cancelListing",
          new ContractFunctionParameters()
            .addUint256(typeof listingId === "string" ? parseInt(listingId) : listingId)
        );

      const txResponse = await executeWithSigner(contractExecTx);
      const txIdStr = txResponse.transactionId.toString();
      console.log("📤 Transaction submitted:", txIdStr);

      const client = getClient();
      const receipt = await txResponse.getReceipt(client);
      console.log("✅ Listing cancelled");

      setTxId(txIdStr);
      setStatus("done");

      return {
        transactionId: txIdStr,
        status: receipt.status.toString(),
      };
    } catch (err: any) {
      console.error("❌ Cancellation failed:", err);
      setError(err.message || "Cancellation failed");
      setStatus("error");
      throw err;
    }
  };

  // ========================================
  // CREATE COMIC NFT (with inscription)
  // ========================================
  const createComicNFT = async ({
    metadata,
    dbComicId,
    tokenId,
    copies
  }: {
    metadata: string;
    dbComicId: string;
    tokenId: string;
    copies: number;
  }) => {
    try {
      setMintStatus("inscribing");
      setMintError(null);
      console.log("🎨 Creating comic NFT...");
      
      const inscriptionResult = await createInscription(metadata, dbComicId);
      console.log("✅ Inscription created:", inscriptionResult);
      
      setMintStatus("minting");
      const mintResult = await mintNFTs({
        tokenId: tokenId,
        inscriptionData: inscriptionResult,
        copies: copies
      });
      
      console.log("✅ NFT(s) minted:", mintResult);
      setMintStatus("done");
      setMintResult(mintResult);
      return mintResult;
    } catch (err: any) {
      console.error("❌ Creating comic NFT failed:", err);
      setMintError(err.message || "Creating comic NFT failed");
      setMintStatus("error");
      throw err;
    }
  };

  // Query functions remain the same...
  const getCollectionInfo = async (tokenId: string): Promise<Collection> => {
    console.log("📖 Fetching collection info:", tokenId);
    const tokenEvmAddress = TokenId.fromString(tokenId).toEvmAddress();
    const client = Client.forName(network);

    const query = new ContractCallQuery()
      .setContractId(marketplaceContractId)
      .setGas(100000)
      .setFunction("getCollection", new ContractFunctionParameters().addAddress(tokenEvmAddress));

    const result = await query.execute(client);
    return {
      creator: result.getAddress(0),
      name: result.getString(1),
      symbol: result.getString(2),
      maxSupply: result.getInt64(3).toString(),
      currentSupply: result.getInt64(4).toString(),
    };
  };



  const depositComicNFT = async ({
    tokenId,
    serialNumber
  }: {
    tokenId: string,
    serialNumber: number,
  }) => {
    try {
      setStatus("processing");
      setError(null);
      console.log("📥 Depositing Comic NFT:", { tokenId, serialNumber })

       const contractExecTx = new ContractExecuteTransaction()
        .setContractId(marketplaceContractId)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(1000000)
        .setFunction(
          "depositNFTForResale",
          new ContractFunctionParameters()
            .addAddress(tokenId)
            .addInt64(serialNumber)
        );

      const txResponse = await executeWithSigner(contractExecTx);
      const txIdStr = txResponse.transactionId.toString();
      console.log("📤 Transaction submitted:", txIdStr);

      const client = getClient();
      const receipt = await txResponse.getReceipt(client);
      console.log("✅ Listing cancelled");

      setTxId(txIdStr);
      setStatus("done");

      return {
        transactionId: txIdStr,
        status: receipt.status.toString(),
      };
    } catch (err: any) {
      console.error("❌ Deposit failed:", err);
      setError(err.message || "Deposit failed");
      setStatus("error");
      throw err;
    }
  };

  const resaleNFTListing = async ({ tokenId, serialNumber, price }: { tokenId: string; serialNumber: number; price: number }) => {
    try {
      setStatus("processing");
      setError(null);
      console.log("🔄 Reselling Single Comic NFT:");
       const contractExecTx = new ContractExecuteTransaction()
        .setContractId(marketplaceContractId)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(1000000)
        .setFunction(
          "listNFTForResale",
          new ContractFunctionParameters()
            .addAddress(tokenId)
            .addInt64(serialNumber)
            .addUint256(price)
        );

      const txResponse = await executeWithSigner(contractExecTx);
      const txIdStr = txResponse.transactionId.toString();
      console.log("📤 Transaction submitted:", txIdStr);

      const client = getClient();
      const receipt = await txResponse.getReceipt(client);
      console.log("✅ Listing cancelled");

      setTxId(txIdStr);
      setStatus("done");

      return {
        transactionId: txIdStr,
        status: receipt.status.toString(),
      };

    } catch (err: any) {
      console.error("❌ Resale failed:", err);
      setError(err.message || "Resale failed");
      setStatus("error");
      throw err;
    }
  };

    const batchResaleNFTListing = async ({ tokenId, serialNumber, price }:
    { tokenId: string; serialNumber: number[]; price: number[] }
    ) => {
    try {
      setStatus("processing");
      setError(null);
      console.log("🔄 Reselling Single Comic NFT:");
       const contractExecTx = new ContractExecuteTransaction()
        .setContractId(marketplaceContractId)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(1000000)
        .setFunction(
          "batchListNFTsForResale",
          new ContractFunctionParameters()
            .addAddress(tokenId)
            .addInt64Array(serialNumber)
            .addUint256Array(price)
        );

      const txResponse = await executeWithSigner(contractExecTx);
      const txIdStr = txResponse.transactionId.toString();
      console.log("📤 Transaction submitted:", txIdStr);

      const client = getClient();
      const receipt = await txResponse.getReceipt(client);
      console.log("✅ Listing cancelled");

      setTxId(txIdStr);
      setStatus("done");

      return {
        transactionId: txIdStr,
        status: receipt.status.toString(),
      };

    } catch (err: any) {
      console.error("❌ Resale failed:", err);
      setError(err.message || "Resale failed");
      setStatus("error");
      throw err;
    }
  };

  const getListingInfo = async (listingId: number | string): Promise<Listing> => {
    console.log("📖 Fetching listing info:", listingId);
    const client = Client.forName(network);

    const query = new ContractCallQuery()
      .setContractId(marketplaceContractId)
      .setGas(100000)
      .setFunction("getListing", 
        new ContractFunctionParameters().addUint256(typeof listingId === "string" ? parseInt(listingId) : listingId)
      );

    const result = await query.execute(client);
    return {
      tokenAddress: result.getAddress(0),
      serialNumber: result.getInt64(1).toString(),
      seller: result.getAddress(2),
      price: result.getUint256(3).toString(),
      isActive: result.getBool(4),
    };
  };

  const getMarketplaceFee = async (): Promise<number> => {
    const client = Client.forName(network);
    const query = new ContractCallQuery()
      .setContractId(marketplaceContractId)
      .setGas(100000)
      .setFunction("marketplaceFeePercent");

    const result = await query.execute(client);
    return Number(result.getUint256(0));
  };

  // Owner functions
  const updateMarketplaceFee = async (newFeePercent: number) => {
    setStatus("processing");
    setError(null);

    const contractExecTx = new ContractExecuteTransaction()
      .setContractId(marketplaceContractId)
      .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
      .setGas(1000000)
      .setFunction("updateMarketplaceFee", new ContractFunctionParameters().addUint256(newFeePercent));

    const txResponse = await executeWithSigner(contractExecTx);
    const receipt = await txResponse.getReceipt(getClient());

    setTxId(txResponse.transactionId.toString());
    setStatus("done");

    return { transactionId: txResponse.transactionId.toString(), status: receipt.status.toString() };
  };

  const withdrawFees = async () => {
    setStatus("processing");
    setError(null);

    const contractExecTx = new ContractExecuteTransaction()
      .setContractId(marketplaceContractId)
      .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
      .setGas(1000000)
      .setFunction("withdrawFees");

    const txResponse = await executeWithSigner(contractExecTx);
    const receipt = await txResponse.getReceipt(getClient());

    setTxId(txResponse.transactionId.toString());
    setStatus("done");

    return { transactionId: txResponse.transactionId.toString(), status: receipt.status.toString() };
  };

  return {
    // Actions
    createCollection,
    createComicNFT,
    mintNFTs,
    listNFT,
    batchListNFTs, // NEW
    purchaseNFT,
    resaleNFTListing,
    batchResaleNFTListing,
    cancelListing,
    updateMarketplaceFee,
    withdrawFees,
    
    // Queries
    getCollectionInfo,
    getListingInfo,
    getMarketplaceFee,
    depositComicNFT,
    
    // State
    status,
    error,
    txId,
    mintStatus,
    mintProgress,
    mintError,
    mintResult,
    mintStatusText,
  };
}