import { useState } from "react";
import { ContractExecuteTransaction, Client, ContractFunctionParameters } from "@hashgraph/sdk";
import { HashinalsWalletConnectSDK } from "@hashgraphonline/hashinal-wc";

interface UseListNFTProps {
  network?: "testnet" | "mainnet";
  marketplaceId: string; // Deployed marketplace contract ID
  projectId: string; // Hashgraph project ID
}

export function useListComic({ network = "testnet", marketplaceId= "0.0.7348494"}: UseListNFTProps) {
  const [status, setStatus] = useState<"idle" | "listing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const listComic = async ({
    tokenAddress,
    serial,
    price,
    royaltyRecipient,
    royaltyBps,
    paymentToken = "0x0000000000000000000000000000000000000000", // HBAR
    previewURI,
    fullMetadataURI
  }: {
    tokenAddress: string;
    serial: number;
    price: number;
    royaltyRecipient: string;
    royaltyBps: number;
    paymentToken?: string;
    previewURI: string;
    fullMetadataURI: string;
  }) => {
    try {
      setStatus("listing");
      setError(null);
      // 🔐 Connect wallet via Kiloscribe
      const wallet = new HashinalsWalletConnectSDK();
      const { accountId, signer } = await wallet.connectWallet(process.env.NEXT_PUBLIC_HASHGRAPH_PROJECT_ID, {
        name: "Quiva dApp",
        description: "List NFTs on Quiva Marketplace",
        url: window.location.origin,
        icons: ["https://example.com/icon.png"],
      });

      if (!accountId) throw new Error("Wallet not connected");

      const client = Client.forName(network);
      client.setOperatorWith(accountId, signer.publicKey, (message) => signer.sign(message));

      // ⚙️ Encode ABI call
      // listNFT(address token, int64 serial, uint256 price, address royaltyRecipient, uint96 royaltyBps, address paymentToken, string previewURI, string fullMetadataURI)
      const contractExecTx = new ContractExecuteTransaction()
        .setContractId(marketplaceId)
        .setGas(500000)
        .setFunction(
          "listNFT",
          new ContractFunctionParameters()
            .addAddress(tokenAddress)
            .addInt64(serial)
            .addUint256(price)
            .addAddress(royaltyRecipient)
            .addUint256(royaltyBps)
            .addAddress(paymentToken)
            .addString(previewURI)
            .addString(fullMetadataURI)
        );

      const signedTx = await signer.signTransaction(contractExecTx);
      const submitTx = await signedTx.execute(client);
      const receipt = await submitTx.getReceipt(client);

      setTxId(submitTx.transactionId.toString());
      setStatus("done");

      return {
        transactionId: submitTx.transactionId.toString(),
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
