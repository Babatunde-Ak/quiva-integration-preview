import { useState } from "react";
import {
  Client,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
} from "@hashgraph/sdk";
import { HashinalsWalletConnectSDK } from "@hashgraphonline/hashinal-wc";

interface UseBuyNFTProps {
  network?: "testnet" | "mainnet";
  marketplaceId: string;
  signer: any;
}

export function useBuyNFT({ network = "testnet", marketplaceId, signer }: UseBuyNFTProps) {
  const [status, setStatus] = useState<"idle" | "buying" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  /**
   * Buys a listed NFT from the marketplace.
   * @param listingId The marketplace listing ID.
   * @param price The price in HBAR or token units.
   * @param paymentToken Optional: the token address if not paying with HBAR.
   */
  const buyNFT = async ({
    listingId,
    price,
    paymentToken,
  }: {
    listingId: number;
    price: number;
    paymentToken?: string;
  }) => {
    try {
      setStatus("buying");
      setError(null);

      // 🔐 Connect user wallet
      const wallet = new HashinalsWalletConnectSDK();
      const { accountId, } = await wallet.connectWallet(process.env.VITE_PROJECT_ID, {
        name: "Quiva Marketplace",
        description: "Purchase NFTs with Hedera Hashinals",
        url: window.location.origin,
        icons: ["https://example.com/icon.png"],
      });

      if (!accountId) throw new Error("Wallet not connected");

      const client = Client.forName(network);
      client.setOperatorWith(accountId, signer.publicKey, (msg) => signer.sign(msg));

      // ⚙️ Build contract execution for `buyItem(uint256 listingId)`
      const tx = new ContractExecuteTransaction()
        .setContractId(marketplaceId)
        .setGas(300000)
        .setFunction("buyItem", new ContractFunctionParameters().addUint256(listingId));

      // 💰 Add payment in HBAR if paymentToken is 0x0 (HBAR)
      if (!paymentToken || paymentToken === "0x0000000000000000000000000000000000000000") {
        tx.setPayableAmount(Hbar.fromTinybars(price)); // price in tinybars
      }

      const signedTx = await signer.signTransaction(tx);
      const submitTx = await signedTx.execute(client);
      const receipt = await submitTx.getReceipt(client);

      setTxId(submitTx.transactionId.toString());
      setStatus("done");

      console.log("✅ Purchase successful:", {
        transactionId: submitTx.transactionId.toString(),
        status: receipt.status.toString(),
      });

      return {
        transactionId: submitTx.transactionId.toString(),
        status: receipt.status.toString(),
      };
    } catch (err: any) {
      console.error("❌ Purchase failed:", err);
      setError(err.message || "Purchase failed");
      setStatus("error");
      throw err;
    }
  };

  return { buyNFT, status, error, txId };
}
