// // // src/hooks/useMarketplace.ts
// // import { ContractExecuteTransaction, ContractCallQuery, Client, Hbar, ContractFunctionParameters } from "@hashgraph/sdk";

// // export function useBuyComic(marketplaceId= "0.0.7348494", network: "testnet" | "mainnet" = "testnet") {
// //   const client = Client.forName(network);

// //   const fetchListing = async (listingId: number) => {
// //     const query = new ContractCallQuery()
// //       .setContractId(marketplaceId)
// //       .setFunction("listings", new ContractFunctionParameters().addUint256(listingId))
// //       .setGas(100_000);
// //     const res = await query.execute(client);
// //     return res;
// //   };

// //   const fetchPreview = async (listingId: number) => {
// //     const query = new ContractCallQuery()
// //       .setContractId(marketplaceId)
// //       .setFunction("getPreview", new ContractFunctionParameters().addUint256(listingId))
// //       .setGas(100_000);
// //     return (await query.execute(client)).toString();
// //   };

// //   const fetchFullContent = async (listingId: number, buyer: string) => {
// //     const query = new ContractCallQuery()
// //       .setContractId(marketplaceId)
// //       .setFunction("getFullContent", new ContractFunctionParameters().addUint256(listingId).addAddress(buyer))
// //       .setGas(150_000);
// //     return (await query.execute(client)).toString();
// //   };

// //   const buyComic = async (listingId: number, priceTinybar: number, signer: any, accountId: string) => {
// //     const tx = new ContractExecuteTransaction()
// //       .setContractId(marketplaceId)
// //       .setFunction("buyItem", new ContractFunctionParameters().addUint256(listingId))
// //       .setPayableAmount(new Hbar(priceTinybar / 100_000_000))
// //       .setGas(300_000)
// //       .freezeWithSigner(signer);

// //     const signedTx = await signer.signTransaction(tx);
// //     const txResponse = await signedTx.execute(client);
// //     await txResponse.getReceipt(client);
// //     return txResponse.transactionId.toString();
// //   };

// //   return { fetchListing, fetchPreview, fetchFullContent, buyComic };
// // }



// import { useState } from "react";
// import { 
//   ContractExecuteTransaction, 
//   Client, 
//   ContractFunctionParameters, 
//   AccountId, 
//   TransactionId,
//   Hbar 
// } from "@hashgraph/sdk";

// interface UseBuyComicProps {
//   accountId: string;
//   network?: "testnet" | "mainnet";
//   marketplaceId: string;
//   signer: any;
// }

// export function useBuyComic({ 
//   accountId, 
//   network = "testnet", 
//   marketplaceId = "0.0.7348494", 
//   signer 
// }: UseBuyComicProps) {
//   const [status, setStatus] = useState<"idle" | "buying" | "done" | "error">("idle");
//   const [error, setError] = useState<string | null>(null);
//   const [txId, setTxId] = useState<string | null>(null);

//   const buyComic = async ({
//     listingId,
//     quantity,
//     paymentAmount // Total payment (quantity * pricePerNFT)
//   }: {
//     listingId: number;
//     quantity: number;
//     paymentAmount: number | string;
//   }) => {
//     try {
//       setStatus("buying");
//       console.log("🛒 Starting purchase process...");
//       console.log("Listing ID:", listingId);
//       console.log("Quantity:", quantity);
//       console.log("Payment Amount:", paymentAmount);
//       setError(null);

//       const client = Client.forName(network);

//       // Prepare contract execution transaction
//       // Function signature: buyItem(uint256 listingId, uint256 quantity) payable
//       const contractExecTx = new ContractExecuteTransaction()
//         .setContractId(marketplaceId)
//         .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
//         .setGas(500000)
//         .setPayableAmount(new Hbar(Number(paymentAmount))) // Send HBAR payment
//         .setFunction(
//           "buyItem",
//           new ContractFunctionParameters()
//             .addUint256(listingId) // listing ID
//             .addUint256(quantity) // quantity to buy
//         );

//       console.log("Contract Execution Transaction prepared:", contractExecTx);

//       // Sign and execute transaction
//       const signedTx = await signer.signTransaction(contractExecTx);
//       const txResponse = await signedTx.execute(client);
//       const receipt = await txResponse.getReceipt(client);
      
//       console.log("✅ Purchase successful:", receipt);
//       console.log("Transaction ID:", txResponse.transactionId.toString());
      
//       setTxId(txResponse.transactionId.toString());
//       setStatus("done");

//       return { 
//         transactionId: txResponse.transactionId.toString(),
//         status: receipt.status.toString(),
//         quantityBought: quantity
//       };
     
//     } catch (err: any) {
//       console.error("❌ Purchase failed:", err);
//       setError(err.message || "Purchase failed");
//       setStatus("error");
//       throw err;
//     }
//   };

//   return { buyComic, status, error, txId };
// }