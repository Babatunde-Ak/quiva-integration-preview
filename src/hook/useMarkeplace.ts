// import { useState } from "react";
// import {
//   ContractExecuteTransaction,
//   Client,
//   ContractFunctionParameters,
//   AccountId,
//   TokenId,
//   TransactionId,
//   ContractCallQuery,
//   Hbar,
// } from "@hashgraph/sdk";

// interface UseNFTMarketplaceProps {
//   accountId: string;
//   network?: "testnet" | "mainnet";
//   marketplaceContractId: string;
//   signer: any;
// }

// interface Collection {
//   creator: string;
//   name: string;
//   symbol: string;
//   maxSupply: string;
//   currentSupply: string;
// }

// interface Listing {
//   tokenAddress: string;
//   serialNumber: string;
//   seller: string;
//   price: string;
//   isActive: boolean;
// }

// export function useNFTMarketplace({
//   accountId,
//   network = "testnet",
//   marketplaceContractId,
//   signer,
// }: UseNFTMarketplaceProps) {
//   const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
//   const [error, setError] = useState<string | null>(null);
//   const [txId, setTxId] = useState<string | null>(null);

//   // Helper to execute transaction with wallet signer
//   const executeWithSigner = async (transaction: any) => {
//     console.log("📝 Signing transaction with wallet...");
    
//     // Sign the transaction
//     const signedTx = await signer.signTransaction(transaction);
//     console.log("✅ Transaction signed");
    
//     // Different wallets have different methods to execute
//     // Try the most common patterns
    
//     // Pattern 1: Signer has call method (some wallets)
//     if (typeof signer.call === 'function') {
//       console.log("Using signer.call() method");
//       return await signer.call(signedTx);
//     }
    
//     // Pattern 2: Signer has executeTransaction method (HashConnect)
//     if (typeof signer.executeTransaction === 'function') {
//       console.log("Using signer.executeTransaction() method");
//       return await signer.executeTransaction(signedTx);
//     }
    
//     // Pattern 3: Use client with transaction provider (most common)
//     console.log("Using client.execute() method");
//     const client = Client.forName(network);
    
//     // The signed transaction already has all the signatures
//     // We just need to submit it to the network
//     const provider = signer.getProvider ? signer.getProvider() : null;
//     if (provider) {
//       const txResponse = await provider.execute(signedTx);
//       return txResponse;
//     }
    
//     // Pattern 4: Direct execution (fallback)
//     // This might fail if client doesn't have operator set
//     try {
//       return await signedTx.execute(client);
//     } catch (err: any) {
//       console.error("Standard execution failed, trying alternative method");
      
//       // Last resort: try to execute with the signer's internal client
//       if (signer._client) {
//         return await signedTx.execute(signer._client);
//       }
      
//       throw new Error("Unable to execute transaction. Please check wallet connection.");
//     }
//   };

//   // ========================================
//   // 1. CREATE COLLECTION
//   // ========================================
//   const createCollection = async ({
//     name,
//     symbol,
//     memo,
//     maxSupply,
//     autoRenewPeriod = 7000000,
//   }: {
//     name: string;
//     symbol: string;
//     memo: string;
//     maxSupply: number;
//     autoRenewPeriod?: number;
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("🎨 Creating NFT collection:", { name, symbol, maxSupply });

//       const contractExecTx = new ContractExecuteTransaction()
//         .setContractId(marketplaceContractId)
//         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
//         .setGas(4000000)
//         .setPayableAmount(new Hbar(50))
//         .setFunction(
//           "createCollection",
//           new ContractFunctionParameters()
//             .addString(name)
//             .addString(symbol)
//             .addString(memo)
//             .addInt64(maxSupply)
//             .addInt64(autoRenewPeriod)
//         );

//       const txResponse = await executeWithSigner(contractExecTx);
//       const txIdStr = txResponse.transactionId.toString();
//       console.log("📤 Transaction submitted:", txIdStr);

//       // Get receipt
//       const client = Client.forName(network);
//       const receipt = await txResponse.getReceipt(client);
//       console.log("✅ Collection created successfully");

//       // Get the token address from the transaction record
//       const record = await txResponse.getRecord(client);

//       const tokenEvmAddress = record.contractFunctionResult?.getAddress(0);
//       const tokenId = tokenEvmAddress 
//         ? AccountId.fromSolidityAddress(tokenEvmAddress).toString()
//         : null;

//       console.log("🎉 New Token ID:", tokenId);

//       setTxId(txIdStr);
//       setStatus("done");

//       return {
//         transactionId: txIdStr,
//         status: receipt.status.toString(),
//         tokenId,
//         tokenEvmAddress,
//       };
//     } catch (err: any) {
//       console.error("❌ Collection creation failed:", err);
//       setError(err.message || "Collection creation failed");
//       setStatus("error");
//       throw err;
//     }
//   };

//   // ========================================
//   // 2. MINT NFTs
//   // ========================================
//   const mintNFTs = async ({
//     tokenId,
//     metadataURIs,
//   }: {
//     tokenId: string;
//     metadataURIs: string[];
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("🎨 Minting NFTs:", { tokenId, count: metadataURIs.length });

//       const tokenEvmAddress = TokenId.fromString(tokenId).toSolidityAddress();
//       const metadataBytes = metadataURIs.map(uri => Buffer.from(uri));

//       const contractExecTx = new ContractExecuteTransaction()
//         .setContractId(marketplaceContractId)
//         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
//         .setGas(4000000)
//         .setMaxTransactionFee(new Hbar(20))
//         .setFunction(
//           "mintNFTs",
//           new ContractFunctionParameters()
//             .addAddress(tokenEvmAddress)
//             .addBytesArray(metadataBytes)
//         );

//       const txResponse = await executeWithSigner(contractExecTx);
//       const txIdStr = txResponse.transactionId.toString();
//       console.log("📤 Transaction submitted:", txIdStr);

//       const client = Client.forName(network);
//       const receipt = txResponse.getReceipt 
//         ? await txResponse.getReceipt(client)
//         : await client.getReceiptQuery().setTransactionId(txResponse.transactionId).execute(client);
      
//       console.log("✅ NFTs minted successfully");

//       const record = txResponse.getRecord
//         ? await txResponse.getRecord(client)
//         : await client.getRecordQuery().setTransactionId(txResponse.transactionId).execute(client);
      
//       const serials: number[] = [];
//       for (let i = 0; i < metadataURIs.length; i++) {
//         try {
//           const serial = record.contractFunctionResult?.getInt64(i);
//           if (serial) serials.push(Number(serial));
//         } catch {
//           break;
//         }
//       }

//       console.log("🎉 Minted serials:", serials);

//       setTxId(txIdStr);
//       setStatus("done");

//       return {
//         transactionId: txIdStr,
//         status: receipt.status.toString(),
//         serials,
//       };
//     } catch (err: any) {
//       console.error("❌ Minting failed:", err);
//       setError(err.message || "Minting failed");
//       setStatus("error");
//       throw err;
//     }
//   };

//   // ========================================
//   // 3. LIST NFT FOR SALE
//   // ========================================
//   const listNFT = async ({
//     tokenId,
//     serialNumber,
//     priceInHbar,
//   }: {
//     tokenId: string;
//     serialNumber: number;
//     priceInHbar: number;
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("📝 Listing NFT:", { tokenId, serialNumber, priceInHbar });

//       const tokenEvmAddress = TokenId.fromString(tokenId).toSolidityAddress();
//       const priceInTinybars = Hbar.from(priceInHbar).toTinybars().toString();

//       const contractExecTx = new ContractExecuteTransaction()
//         .setContractId(marketplaceContractId)
//         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
//         .setGas(1500000)
//         .setFunction(
//           "listNFT",
//           new ContractFunctionParameters()
//             .addAddress(tokenEvmAddress)
//             .addInt64(serialNumber)
//             .addUint256(priceInTinybars)
//         );

//       const txResponse = await executeWithSigner(contractExecTx);
//       const txIdStr = txResponse.transactionId.toString();
//       console.log("📤 Transaction submitted:", txIdStr);

//       const client = Client.forName(network);
//       const receipt = txResponse.getReceipt
//         ? await txResponse.getReceipt(client)
//         : await client.getReceiptQuery().setTransactionId(txResponse.transactionId).execute(client);
      
//       console.log("✅ NFT listed successfully");

//       const record = txResponse.getRecord
//         ? await txResponse.getRecord(client)
//         : await client.getRecordQuery().setTransactionId(txResponse.transactionId).execute(client);
      
//       const listingId = record.contractFunctionResult?.getUint256(0);

//       console.log("🎉 Listing ID:", listingId?.toString());

//       setTxId(txIdStr);
//       setStatus("done");

//       return {
//         transactionId: txIdStr,
//         status: receipt.status.toString(),
//         listingId: listingId?.toString(),
//       };
//     } catch (err: any) {
//       console.error("❌ Listing failed:", err);
//       setError(err.message || "Listing failed");
//       setStatus("error");
//       throw err;
//     }
//   };

//   // ========================================
//   // 4. PURCHASE NFT
//   // ========================================
//   const purchaseNFT = async ({
//     listingId,
//     priceInHbar,
//   }: {
//     listingId: number | string;
//     priceInHbar: number;
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("🛒 Purchasing NFT:", { listingId, priceInHbar });

//       const contractExecTx = new ContractExecuteTransaction()
//         .setContractId(marketplaceContractId)
//         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
//         .setGas(4000000)
//         .setPayableAmount(new Hbar(priceInHbar))
//         .setFunction(
//           "purchaseNFT",
//           new ContractFunctionParameters()
//             .addUint256(typeof listingId === "string" ? parseInt(listingId) : listingId)
//         );

//       const txResponse = await executeWithSigner(contractExecTx);
//       const txIdStr = txResponse.transactionId.toString();
//       console.log("📤 Transaction submitted:", txIdStr);

//       const client = Client.forName(network);
//       const receipt = txResponse.getReceipt
//         ? await txResponse.getReceipt(client)
//         : await client.getReceiptQuery().setTransactionId(txResponse.transactionId).execute(client);
      
//       console.log("✅ NFT purchased successfully");

//       setTxId(txIdStr);
//       setStatus("done");

//       return {
//         transactionId: txIdStr,
//         status: receipt.status.toString(),
//       };
//     } catch (err: any) {
//       console.error("❌ Purchase failed:", err);
//       setError(err.message || "Purchase failed");
//       setStatus("error");
//       throw err;
//     }
//   };

//   // ========================================
//   // 5. CANCEL LISTING
//   // ========================================
//   const cancelListing = async ({
//     listingId,
//   }: {
//     listingId: number | string;
//   }) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("❌ Cancelling listing:", listingId);

//       const contractExecTx = new ContractExecuteTransaction()
//         .setContractId(marketplaceContractId)
//         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
//         .setGas(1000000)
//         .setFunction(
//           "cancelListing",
//           new ContractFunctionParameters()
//             .addUint256(typeof listingId === "string" ? parseInt(listingId) : listingId)
//         );

//       const txResponse = await executeWithSigner(contractExecTx);
//       const txIdStr = txResponse.transactionId.toString();
//       console.log("📤 Transaction submitted:", txIdStr);

//       const client = Client.forName(network);
//       const receipt = txResponse.getReceipt
//         ? await txResponse.getReceipt(client)
//         : await client.getReceiptQuery().setTransactionId(txResponse.transactionId).execute(client);
      
//       console.log("✅ Listing cancelled");

//       setTxId(txIdStr);
//       setStatus("done");

//       return {
//         transactionId: txIdStr,
//         status: receipt.status.toString(),
//       };
//     } catch (err: any) {
//       console.error("❌ Cancellation failed:", err);
//       setError(err.message || "Cancellation failed");
//       setStatus("error");
//       throw err;
//     }
//   };

//   // ========================================
//   // 6. GET COLLECTION INFO
//   // ========================================
//   const getCollectionInfo = async (tokenId: string): Promise<Collection> => {
//     try {
//       console.log("📖 Fetching collection info:", tokenId);

//       const tokenEvmAddress = TokenId.fromString(tokenId).toSolidityAddress();
//       const client = Client.forName(network);

//       const query = new ContractCallQuery()
//         .setContractId(marketplaceContractId)
//         .setGas(100000)
//         .setFunction(
//           "getCollection",
//           new ContractFunctionParameters().addAddress(tokenEvmAddress)
//         );

//       const result = await query.execute(client);

//       const collection: Collection = {
//         creator: result.getAddress(0),
//         name: result.getString(1),
//         symbol: result.getString(2),
//         maxSupply: result.getInt64(3).toString(),
//         currentSupply: result.getInt64(4).toString(),
//       };

//       console.log("✅ Collection info:", collection);
//       return collection;
//     } catch (err: any) {
//       console.error("❌ Failed to fetch collection:", err);
//       throw err;
//     }
//   };

//   // ========================================
//   // 7. GET LISTING INFO
//   // ========================================
//   const getListingInfo = async (listingId: number | string): Promise<Listing> => {
//     try {
//       console.log("📖 Fetching listing info:", listingId);

//       const client = Client.forName(network);

//       const query = new ContractCallQuery()
//         .setContractId(marketplaceContractId)
//         .setGas(100000)
//         .setFunction(
//           "getListing",
//           new ContractFunctionParameters().addUint256(typeof listingId === "string" ? parseInt(listingId) : listingId)
//         );

//       const result = await query.execute(client);

//       const listing: Listing = {
//         tokenAddress: result.getAddress(0),
//         serialNumber: result.getInt64(1).toString(),
//         seller: result.getAddress(2),
//         price: result.getUint256(3).toString(),
//         isActive: result.getBool(4),
//       };

//       console.log("✅ Listing info:", listing);
//       return listing;
//     } catch (err: any) {
//       console.error("❌ Failed to fetch listing:", err);
//       throw err;
//     }
//   };

//   // ========================================
//   // 8. GET MARKETPLACE FEE
//   // ========================================
//   const getMarketplaceFee = async (): Promise<number> => {
//     try {
//       console.log("📖 Fetching marketplace fee...");

//       const client = Client.forName(network);

//       const query = new ContractCallQuery()
//         .setContractId(marketplaceContractId)
//         .setGas(100000)
//         .setFunction("marketplaceFeePercent");

//       const result = await query.execute(client);
//       const feePercent = Number(result.getUint256(0));

//       console.log("✅ Marketplace fee:", feePercent / 100, "%");
//       return feePercent;
//     } catch (err: any) {
//       console.error("❌ Failed to fetch fee:", err);
//       throw err;
//     }
//   };

//   // ========================================
//   // 9. UPDATE MARKETPLACE FEE (Owner only)
//   // ========================================
//   const updateMarketplaceFee = async (newFeePercent: number) => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("⚙️ Updating marketplace fee:", newFeePercent / 100, "%");

//       const contractExecTx = new ContractExecuteTransaction()
//         .setContractId(marketplaceContractId)
//         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
//         .setGas(1000000)
//         .setFunction(
//           "updateMarketplaceFee",
//           new ContractFunctionParameters().addUint256(newFeePercent)
//         );

//       const txResponse = await executeWithSigner(contractExecTx);
//       const txIdStr = txResponse.transactionId.toString();

//       const client = Client.forName(network);
//       const receipt = txResponse.getReceipt
//         ? await txResponse.getReceipt(client)
//         : await client.getReceiptQuery().setTransactionId(txResponse.transactionId).execute(client);
      
//       console.log("✅ Marketplace fee updated");

//       setTxId(txIdStr);
//       setStatus("done");

//       return {
//         transactionId: txIdStr,
//         status: receipt.status.toString(),
//       };
//     } catch (err: any) {
//       console.error("❌ Fee update failed:", err);
//       setError(err.message || "Fee update failed");
//       setStatus("error");
//       throw err;
//     }
//   };

//   // ========================================
//   // 10. WITHDRAW FEES (Owner only)
//   // ========================================
//   const withdrawFees = async () => {
//     try {
//       setStatus("processing");
//       setError(null);
//       console.log("💰 Withdrawing marketplace fees...");

//       const contractExecTx = new ContractExecuteTransaction()
//         .setContractId(marketplaceContractId)
//         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
//         .setGas(1000000)
//         .setFunction("withdrawFees");

//       const txResponse = await executeWithSigner(contractExecTx);
//       const txIdStr = txResponse.transactionId.toString();

//       const client = Client.forName(network);
//       const receipt = txResponse.getReceipt
//         ? await txResponse.getReceipt(client)
//         : await client.getReceiptQuery().setTransactionId(txResponse.transactionId).execute(client);
      
//       console.log("✅ Fees withdrawn");

//       setTxId(txIdStr);
//       setStatus("done");

//       return {
//         transactionId: txIdStr,
//         status: receipt.status.toString(),
//       };
//     } catch (err: any) {
//       console.error("❌ Withdrawal failed:", err);
//       setError(err.message || "Withdrawal failed");
//       setStatus("error");
//       throw err;
//     }
//   };

//   return {
//     // Actions
//     createCollection,
//     mintNFTs,
//     listNFT,
//     purchaseNFT,
//     cancelListing,
//     updateMarketplaceFee,
//     withdrawFees,
    
//     // Queries
//     getCollectionInfo,
//     getListingInfo,
//     getMarketplaceFee,
    
//     // State
//     status,
//     error,
//     txId,
//   };
// }


import { useState } from "react";
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

export function useNFTMarketplace({
  accountId,
  network = "testnet",
  marketplaceContractId,
  signer,
}: UseNFTMarketplaceProps) {
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  // Helper to execute transaction with wallet signer
  // const executeWithSigner = async (transaction: any) => {
  //   console.log("📝 Signing transaction with wallet...");
    
  //   // Sign the transaction
  //   const signedTx = await signer.signTransaction(transaction);
  //   console.log("✅ Transaction signed");
    
  //   // Different wallets have different methods to execute
  //   // Try the most common patterns
    
  //   // Pattern 1: Signer has call method (some wallets)
  //   if (typeof signer.call === 'function') {
  //     console.log("Using signer.call() method");
  //     return await signer.call(signedTx);
  //   }
    
  //   // Pattern 2: Signer has executeTransaction method (HashConnect)
  //   if (typeof signer.executeTransaction === 'function') {
  //     console.log("Using signer.executeTransaction() method");
  //     return await signer.executeTransaction(signedTx);
  //   }
    
  //   // Pattern 3: Use client with transaction provider (most common)
  //   console.log("Using client.execute() method");
  //   const client = Client.forName(network);
    
  //   // The signed transaction already has all the signatures
  //   // We just need to submit it to the network
  //   const provider = signer.getProvider ? signer.getProvider() : null;
  //   if (provider) {
  //     const txResponse = await provider.execute(signedTx);
  //     return txResponse;
  //   }
    
  //   // Pattern 4: Direct execution (fallback)
  //   // This might fail if client doesn't have operator set
  //   try {
  //     return await signedTx.execute(client);
  //   } catch (err: any) {
  //     console.error("Standard execution failed, trying alternative method");
      
  //     // Last resort: try to execute with the signer's internal client
  //     if (signer._client) {
  //       return await signedTx.execute(signer._client);
  //     }
      
  //     throw new Error("Unable to execute transaction. Please check wallet connection.");
  //   }
  // };
    // Helper to execute transaction with wallet signer
  const executeWithSigner = async (transaction: any) => {
    console.log("📝 Signing and executing transaction with wallet...");
    
    // For HashPack and most Hedera wallets, we need to:
    // 1. Sign the transaction
    // 2. Execute it using the wallet's provider/client
    
    try {
      // Sign with wallet
      const signedTx = await signer.signTransaction(transaction);
      console.log("✅ Transaction signed");
      
      // Get or create a client
      let client: Client;
      
      // Try to get client from signer first
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
      
      // Execute the signed transaction
      console.log("Executing signed transaction...");
      const txResponse = await signedTx.execute(client);
      
      return txResponse;
    } catch (err: any) {
      console.error("Transaction execution error:", err);
      throw err;
    }
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
        .setPayableAmount(new Hbar(10))
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

      // Get receipt
      // const client = Client.forName(network);
       let client: Client;
      if (signer._client) {
        client = signer._client;
      } else if (signer.client) {
        client = signer.client;
      } else {
        client = Client.forName(network);
      }
      const receipt = await txResponse.getReceipt(client);
      console.log("✅ Collection created successfully");

      // // Get the token address from the transaction record
      // const record = await txResponse.getRecord();

      // const tokenEvmAddress = record.contractFunctionResult?.getAddress(0);
      // const tokenId = tokenEvmAddress 
        // ? TokenId.fromString(tokenEvmAddress).toEvmAddress()
        // : null;

        
    // Use Mirror Node to get the contract result instead of getRecord()
    // Wait for mirror node propagation
    await new Promise(resolve => setTimeout(resolve, 5000));
    const txIdFormatted = txIdStr
  .replace("@", "-")
  .replace(/\./g, (match, offset, string) => {
    // Keep the first two dots (shard.realm.num), replace the third with hyphen
    const dotCount = string.slice(0, offset + 1).split('.').length - 1;
    return dotCount <= 2 ? "." : "-";
  });
    
    // const txIdFormatted = txIdStr.replace("@", "-").replace(".", "-");
    const mirrorResponse = await fetch(
      `https://testnet.mirrornode.hedera.com/api/v1/contracts/results/${txIdFormatted}`
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
  // 2. MINT NFTs
  // ========================================
  // const mintNFTs = async ({
  //   tokenId,
  //   metadataURIs,
  // }: {
  //   tokenId: string;
  //   metadataURIs: string[];
  // }) => {
  //   try {
  //     setStatus("processing");
  //     setError(null);
  //     console.log("🎨 Minting NFTs:", { tokenId, count: metadataURIs.length });

  //     const tokenEvmAddress = TokenId.fromString(tokenId).toEvmAddress();
  //     const metadataBytes = metadataURIs.map(uri => Buffer.from(uri));

  //     const contractExecTx = new ContractExecuteTransaction()
  //       .setContractId(marketplaceContractId)
  //       .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
  //       .setGas(4000000)
  //       .setMaxTransactionFee(new Hbar(20))
  //       .setFunction(
  //         "mintNFTs",
  //         new ContractFunctionParameters()
  //           .addAddress(tokenEvmAddress)
  //           .addBytesArray(metadataBytes)
  //       );

  //     const txResponse = await executeWithSigner(contractExecTx);
  //     const txIdStr = txResponse.transactionId.toString();
  //     console.log("📤 Transaction submitted:", txIdStr);

  //     // const client = Client.forName(network);
  //      let client: Client;
  //     if (signer._client) {
  //       client = signer._client;
  //     } else if (signer.client) {
  //       client = signer.client;
  //     } else {
  //       client = Client.forName(network);
  //     }
  //     const receipt = await txResponse.getReceipt(client);
  //     console.log("✅ NFTs minted successfully");

  //     const record = await txResponse.getRecord(client);
      
  //     const serials: number[] = [];
  //     for (let i = 0; i < metadataURIs.length; i++) {
  //       try {
  //         const serial = record.contractFunctionResult?.getInt64(i);
  //         if (serial) serials.push(Number(serial));
  //       } catch {
  //         break;
  //       }
  //     }

  //     console.log("🎉 Minted serials:", serials);

  //     setTxId(txIdStr);
  //     setStatus("done");

  //     return {
  //       transactionId: txIdStr,
  //       status: receipt.status.toString(),
  //       serials,
  //     };
  //   } catch (err: any) {
  //     console.error("❌ Minting failed:", err);
  //     setError(err.message || "Minting failed");
  //     setStatus("error");
  //     throw err;
  //   }
  // };

const mintNFTs = async ({
  tokenId,
  metadataURIs,
}: {
  tokenId: string;
  metadataURIs: string[];
}) => {
  try {
    setStatus("processing");
    setError(null);
    console.log("🎨 Minting NFTs:", { tokenId, count: metadataURIs.length });

    //const tokenEvmAddress = TokenId.fromString(tokenId).toEvmAddress();
    const metadataBytes = metadataURIs.map(uri => Buffer.from(uri));

    const contractExecTx = new ContractExecuteTransaction()
      .setContractId(marketplaceContractId)
      .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
      .setGas(4000000)
      .setMaxTransactionFee(new Hbar(20))
      .setFunction(
        "mintNFTs",
        new ContractFunctionParameters()
          .addAddress(tokenId)
          .addBytesArray(metadataBytes)
      );

    const txResponse = await executeWithSigner(contractExecTx);
    const txIdStr = txResponse.transactionId.toString();
    console.log("📤 Transaction submitted:", txIdStr);

    let client: Client;
    if (signer._client) {
      client = signer._client;
    } else if (signer.client) {
      client = signer.client;
    } else {
      client = Client.forName(network);
    }
    const receipt = await txResponse.getReceipt(client);
    console.log("✅ NFTs minted successfully");

    // Use Mirror Node to get the contract result instead of getRecord()
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // const txIdFormatted = txIdStr.replace("@", "-").replace(".", "-");
     const txIdFormatted = txIdStr
  .replace("@", "-")
  .replace(/\./g, (match, offset, string) => {
    // Keep the first two dots (shard.realm.num), replace the third with hyphen
    const dotCount = string.slice(0, offset + 1).split('.').length - 1;
    return dotCount <= 2 ? "." : "-";
  });

    const baseUrl = network === "testnet" 
      ? "https://testnet.mirrornode.hedera.com" 
      : "https://mainnet.mirrornode.hedera.com";
    
    const mirrorResponse = await fetch(
      `${baseUrl}/api/v1/contracts/results/${txIdFormatted}`
    );
    const mirrorData = await mirrorResponse.json();
    console.log("Mirror Node data:", mirrorData);
    
    // Decode serial numbers from call_result
    const serials: number[] = [];
    if (mirrorData?.call_result) {
      // The result is ABI-encoded int64 array
      // Each int64 is 32 bytes (256 bits) in ABI encoding
      const result = mirrorData.call_result.slice(2); // Remove '0x'
      
      // Skip the first 64 chars (offset pointer) and next 64 chars (array length)
      const arrayLengthHex = result.slice(64, 128);
      const arrayLength = parseInt(arrayLengthHex, 16);
      
      for (let i = 0; i < arrayLength; i++) {
        const start = 128 + (i * 64);
        const serialHex = result.slice(start, start + 64);
        const serial = parseInt(serialHex, 16);
        if (serial > 0) serials.push(serial);
      }
    }

    console.log("🎉 Minted serials:", serials);

    setTxId(txIdStr);
    setStatus("done");

    return {
      transactionId: txIdStr,
      status: receipt.status.toString(),
      serials,
    };
  } catch (err: any) {
    console.error("❌ Minting failed:", err);
    setError(err.message || "Minting failed");
    setStatus("error");
    throw err;
  }
};



  // ========================================
  // 3. LIST NFT FOR SALE
  // ========================================
  // const listNFT = async ({
  //   tokenId,
  //   serialNumber,
  //   priceInHbar,
  // }: {
  //   tokenId: string;
  //   serialNumber: number;
  //   priceInHbar: number;
  // }) => {
  //   try {
  //     setStatus("processing");
  //     setError(null);
  //     console.log("📝 Listing NFT:", { tokenId, serialNumber, priceInHbar });

  //     const tokenEvmAddress = TokenId.fromString(tokenId).toEvmAddress();
  //     const priceInTinybars = Hbar.from(priceInHbar, HbarUnit.Hbar).toTinybars();

  //     const contractExecTx = new ContractExecuteTransaction()
  //       .setContractId(marketplaceContractId)
  //       .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
  //       .setGas(15000000)
  //       .setFunction(
  //         "listNFT",
  //         new ContractFunctionParameters()
  //           .addAddress(tokenEvmAddress)
  //           .addInt64(serialNumber)
  //           .addUint256(priceInTinybars)
  //       );

  //     const txResponse = await executeWithSigner(contractExecTx);
  //     const txIdStr = txResponse.transactionId.toString();
  //     console.log("📤 Transaction submitted:", txIdStr);

  //     // const client = Client.forName(network);
  //      let client: Client;
  //     if (signer._client) {
  //       client = signer._client;
  //     } else if (signer.client) {
  //       client = signer.client;
  //     } else {
  //       client = Client.forName(network);
  //     }
  //     const receipt = await txResponse.getReceipt(client);
  //     console.log("✅ NFT listed successfully");

  //     const record = await txResponse.getRecord(client);
      
  //     const listingId = record.contractFunctionResult?.getUint256(0);

  //     console.log("🎉 Listing ID:", listingId?.toString());

  //     setTxId(txIdStr);
  //     setStatus("done");

  //     return {
  //       transactionId: txIdStr,
  //       status: receipt.status.toString(),
  //       listingId: listingId?.toString(),
  //     };
  //   } catch (err: any) {
  //     console.error("❌ Listing failed:", err);
  //     setError(err.message || "Listing failed");
  //     setStatus("error");
  //     throw err;
  //   }
  // };

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

    // const tokenEvmAddress = TokenId.fromString(tokenId).toEvmAddress();
    const priceInTinybars = Hbar.from(priceInHbar, HbarUnit.Hbar).toTinybars();

    const contractExecTx = new ContractExecuteTransaction()
      .setContractId(marketplaceContractId)
      .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
      .setGas(15000000)
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

    let client: Client;
    if (signer._client) {
      client = signer._client;
    } else if (signer.client) {
      client = signer.client;
    } else {
      client = Client.forName(network);
    }
    const receipt = await txResponse.getReceipt(client);
    console.log("✅ NFT listed successfully");

    // Use Mirror Node to get the contract result instead of getRecord()
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    //const txIdFormatted = txIdStr.replace("@", "-").replace(".", "-");
     const txIdFormatted = txIdStr
  .replace("@", "-")
  .replace(/\./g, (match, offset, string) => {
    // Keep the first two dots (shard.realm.num), replace the third with hyphen
    const dotCount = string.slice(0, offset + 1).split('.').length - 1;
    return dotCount <= 2 ? "." : "-";
  });
    const baseUrl = network === "mainnet" 
      ? "https://mainnet.mirrornode.hedera.com" 
      : "https://testnet.mirrornode.hedera.com";
    
    const mirrorResponse = await fetch(
      `${baseUrl}/api/v1/contracts/results/${txIdFormatted}`
    );
    const mirrorData = await mirrorResponse.json();
    console.log("Mirror Node data:", mirrorData);
    
    // Decode listingId (uint256) from call_result
    let listingId: string | undefined;
    if (mirrorData?.call_result) {
      // The result is a single uint256 (32 bytes = 64 hex chars)
      const result = mirrorData.call_result.slice(2); // Remove '0x'
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

      const client = Client.forName(network);
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

      const client = Client.forName(network);
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
  // 6. GET COLLECTION INFO
  // ========================================
  const getCollectionInfo = async (tokenId: string): Promise<Collection> => {
    try {
      console.log("📖 Fetching collection info:", tokenId);

      const tokenEvmAddress = TokenId.fromString(tokenId).toSolidityAddress();
      const client = Client.forName(network);

      const query = new ContractCallQuery()
        .setContractId(marketplaceContractId)
        .setGas(100000)
        .setFunction(
          "getCollection",
          new ContractFunctionParameters().addAddress(tokenEvmAddress)
        );

      const result = await query.execute(client);

      const collection: Collection = {
        creator: result.getAddress(0),
        name: result.getString(1),
        symbol: result.getString(2),
        maxSupply: result.getInt64(3).toString(),
        currentSupply: result.getInt64(4).toString(),
      };

      console.log("✅ Collection info:", collection);
      return collection;
    } catch (err: any) {
      console.error("❌ Failed to fetch collection:", err);
      throw err;
    }
  };

  // ========================================
  // 7. GET LISTING INFO
  // ========================================
  const getListingInfo = async (listingId: number | string): Promise<Listing> => {
    try {
      console.log("📖 Fetching listing info:", listingId);

      const client = Client.forName(network);

      const query = new ContractCallQuery()
        .setContractId(marketplaceContractId)
        .setGas(100000)
        .setFunction(
          "getListing",
          new ContractFunctionParameters().addUint256(typeof listingId === "string" ? parseInt(listingId) : listingId)
        );

      const result = await query.execute(client);

      const listing: Listing = {
        tokenAddress: result.getAddress(0),
        serialNumber: result.getInt64(1).toString(),
        seller: result.getAddress(2),
        price: result.getUint256(3).toString(),
        isActive: result.getBool(4),
      };

      console.log("✅ Listing info:", listing);
      return listing;
    } catch (err: any) {
      console.error("❌ Failed to fetch listing:", err);
      throw err;
    }
  };

  // ========================================
  // 8. GET MARKETPLACE FEE
  // ========================================
  const getMarketplaceFee = async (): Promise<number> => {
    try {
      console.log("📖 Fetching marketplace fee...");

      const client = Client.forName(network);

      const query = new ContractCallQuery()
        .setContractId(marketplaceContractId)
        .setGas(100000)
        .setFunction("marketplaceFeePercent");

      const result = await query.execute(client);
      const feePercent = Number(result.getUint256(0));

      console.log("✅ Marketplace fee:", feePercent / 100, "%");
      return feePercent;
    } catch (err: any) {
      console.error("❌ Failed to fetch fee:", err);
      throw err;
    }
  };

  // ========================================
  // 9. UPDATE MARKETPLACE FEE (Owner only)
  // ========================================
  const updateMarketplaceFee = async (newFeePercent: number) => {
    try {
      setStatus("processing");
      setError(null);
      console.log("⚙️ Updating marketplace fee:", newFeePercent / 100, "%");

      const contractExecTx = new ContractExecuteTransaction()
        .setContractId(marketplaceContractId)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(1000000)
        .setFunction(
          "updateMarketplaceFee",
          new ContractFunctionParameters().addUint256(newFeePercent)
        );

      const txResponse = await executeWithSigner(contractExecTx);
      const txIdStr = txResponse.transactionId.toString();

      const client = Client.forName(network);
      const receipt = await txResponse.getReceipt(client);
      console.log("✅ Marketplace fee updated");

      setTxId(txIdStr);
      setStatus("done");

      return {
        transactionId: txIdStr,
        status: receipt.status.toString(),
      };
    } catch (err: any) {
      console.error("❌ Fee update failed:", err);
      setError(err.message || "Fee update failed");
      setStatus("error");
      throw err;
    }
  };

  // ========================================
  // 10. WITHDRAW FEES (Owner only)
  // ========================================
  const withdrawFees = async () => {
    try {
      setStatus("processing");
      setError(null);
      console.log("💰 Withdrawing marketplace fees...");

      const contractExecTx = new ContractExecuteTransaction()
        .setContractId(marketplaceContractId)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(1000000)
        .setFunction("withdrawFees");

      const txResponse = await executeWithSigner(contractExecTx);
      const txIdStr = txResponse.transactionId.toString();

      const client = Client.forName(network);
      const receipt = await txResponse.getReceipt(client);
      console.log("✅ Fees withdrawn");

      setTxId(txIdStr);
      setStatus("done");

      return {
        transactionId: txIdStr,
        status: receipt.status.toString(),
      };
    } catch (err: any) {
      console.error("❌ Withdrawal failed:", err);
      setError(err.message || "Withdrawal failed");
      setStatus("error");
      throw err;
    }
  };

  return {
    // Actions
    createCollection,
    mintNFTs,
    listNFT,
    purchaseNFT,
    cancelListing,
    updateMarketplaceFee,
    withdrawFees,
    
    // Queries
    getCollectionInfo,
    getListingInfo,
    getMarketplaceFee,
    
    // State
    status,
    error,
    txId,
  };
}