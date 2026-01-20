import { useState } from "react";
import { ContractExecuteTransaction, Client, ContractFunctionParameters, AccountId, TokenId, TransactionId, AccountAllowanceApproveTransaction, TokenAssociateTransaction } from "@hashgraph/sdk";
import {approveForAll, associateTokenWithMarketplace} from "./ApproveAssociate";
// import { console } from "inspector";
// import { HashinalsWalletConnectSDK } from "@hashgraphonline/hashinal-wc";

interface UseListNFTProps {
  accountId: string;
  network?: "testnet" | "mainnet";
  marketplaceId: string; // Deployed marketplace contract ID
  signer: any; // Signer object from connected wallet
}

export function useListComic({ accountId, network = "testnet", marketplaceId, signer}: UseListNFTProps) {
  const [status, setStatus] = useState<"idle" | "listing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const listComic = async ({
    tokenAddress,
    serials,
    pricePerNFT,
    royaltyRecipient,
    royaltyBps= 1000,
    paymentToken = "0x0000000000000000000000000000000000000000", // HBAR
    // previewURI,
    fullMetadataURI
  }: {
    tokenAddress: string;
    serials: number[];
    pricePerNFT: number | string;
    royaltyRecipient: string;
    royaltyBps: number | string;
    paymentToken?: string;
    // previewURI: string;
    fullMetadataURI: string;
  }) => {
    try {
      setStatus("listing");
      console.log("🔄 Starting listing process...");
      setError(null);
      // 🔐 Connect wallet via Kiloscribe
      // const wallet = new HashinalsWalletConnectSDK();
      // const { accountId } = await wallet.connectWallet(process.env.NEXT_PUBLIC_HASHGRAPH_PROJECT_ID, {
      //   name: "Quiva dApp",
      //   description: "List NFTs on Quiva Marketplace",
      //   url: window.location.origin,
      //   icons: ["https://example.com/icon.png"],
    //   });

      // if (!accountId) throw new Error("Wallet not connected");

      const client = Client.forName(network);


      // Approve Marketplace to transfer NFTs on behalf of user (if needed)
    
      // await associateTokenWithMarketplace(tokenAddress, marketplaceId, accountId, signer, network);
     // client.setOperator(AccountId.fromString(signer.accountId), signer);
       const tokenIdEvmAddress = TokenId.fromString(tokenAddress).toEvmAddress();
         console.log("Token EVM Address:", tokenIdEvmAddress);
           const serialsInt64 = serials.map(s => s);
      // 🧠 Convert Marketplace ID → EVM Address too
     const marketplaceEvmAddress = AccountId.fromString(marketplaceId).toEvmAddress();
      // ⚙️ Encode ABI call
    
      // listNFT(address token, int64 serial, uint256 price, address royaltyRecipient, uint96 royaltyBps, address paymentToken, string previewURI, string fullMetadataURI)
      // const associated = new TokenAssociateTransaction()
      //   .setAccountId(AccountId.fromString(marketplaceId))
      //   .setTokenIds([TokenId.fromString(tokenAddress)])
      //   .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)));

      // const signedAssociateTx = await signer.signTransaction(associated);
      // const associateResponse = await signedAssociateTx.execute(client);
      // const associateReceipt = await associateResponse.getReceipt(client);
      // console.log("✅ Token associated:", associateReceipt.status.toString());
    

  console.log("\n🔍 CONTRACT CALL DEBUG INFO");
  console.log("=" .repeat(50));
  
  // Token address
  const tokenIdObj = TokenId.fromString(tokenAddress);
  console.log("1. Token ID:", tokenAddress);
  console.log("   EVM Address:", tokenIdObj.toEvmAddress());
  console.log("   Type:", typeof tokenIdObj.toEvmAddress());
  
  // Serials
  console.log("\n2. Serials:", serials);
  console.log("   Length:", serials.length);
  console.log("   Types:", serials.map(s => typeof s));
  console.log("   First serial:", serials[0], "Type:", typeof serials[0]);
  
  // Price
  console.log("\n3. Price:");
  console.log("   Raw value:", pricePerNFT);
  console.log("   Type:", typeof pricePerNFT);
  console.log("   In tinybars:", pricePerNFT);
  console.log("   In HBAR:", Number(pricePerNFT) / 100_000_000);
  console.log("   Is > 0?", Number(pricePerNFT) > 0);
  
  // Royalty
  console.log("\n4. Royalty:");
  console.log("   BPS value:", royaltyBps);
  console.log("   Type:", typeof royaltyBps);
  console.log("   Percentage:", Number(royaltyBps) / 100, "%");
  console.log("   Is <= 2000?", Number(royaltyBps) <= 2000);
  
  // Addresses
  console.log("\n5. Addresses:");
  console.log("   Royalty Recipient:", royaltyRecipient);
  console.log("   Payment Token:", paymentToken);
  console.log("   Is payment token address(0)?", paymentToken === '0x0000000000000000000000000000000000000000');
  console.log("   Marketplace EVM Address:", marketplaceEvmAddress);
  console.log("   Type:", typeof marketplaceEvmAddress);
  console.log("Marktetplace ID:", marketplaceId);
  
  console.log("=" .repeat(50) + "\n");

    const associateToken =  await associateTokenWithMarketplace(tokenAddress, marketplaceId, network);
      console.log("Token associated with marketplace:", associateToken);

     const approveNFT = await approveForAll(marketplaceId, tokenAddress, accountId, signer, network);
      console.log("NFTs approved for marketplace:", approveNFT);

      const contractExecTx = new ContractExecuteTransaction()
        .setContractId(marketplaceId)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(1500000)
        .setFunction(
          "listNFT",
          new ContractFunctionParameters()
            .addAddress(tokenIdEvmAddress)
            .addInt64Array(serialsInt64)
            .addUint256(pricePerNFT as any)
            .addAddress(royaltyRecipient)
            .addUint256(royaltyBps as any)
            .addAddress(paymentToken)
            // .addString(previewURI)
            .addString(fullMetadataURI)
            
        );

        console.log("Contract Execution Transaction prepared:", contractExecTx);
        // .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
      const signedCreateTx = await signer.signTransaction(contractExecTx);
      const txResponse = await signedCreateTx.execute(client);
      console.log("Transaction submitted, ID:", txResponse.transactionId.toString());
      const receipt = await txResponse.getReceipt(client);
       console.log("✅ Listing successful:", receipt);
      setTxId(txResponse.transactionId.toString());

      setStatus("done");

      return { 
        transactionId: txResponse.transactionId.toString(),
        status: receipt.status.toString(),
      };
     
    } catch (err: any) {
      console.error("❌ Listing failed:", err);
      setError(err.message || "Listing failed");
      setStatus("error");
      throw err;
    }
  };

  return { listComic, status, error, txId };
}
