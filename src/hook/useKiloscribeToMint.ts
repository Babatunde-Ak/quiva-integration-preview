// import { useWallets, useAccount, useTransaction } from "hashgraph-react-wallets";
// import { useState } from "react";
// import axios from "axios";
// import { createPublicClient, http } from "viem";
// import { hederaTestnet } from "viem/chains";
// import MarketplaceABI from "../abi/Marketplace.json";
// import { InscriptionSDK } from '@kiloscribe/inscription-sdk';
// import { HashinalsWalletConnectSDK } from '@hashgraphonline/hashinal-wc';
// // import { KiloScribe } from "kiloscribe-sdk"; // Hypothetical SDK import

// export  function usePublishComic() {
//   const { connectedWallets } = useWallets();
// //   const { accountId } = useAccount();
//   const { sendTransaction } = useTransaction();

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);

//   const publicClient = createPublicClient({
//     chain: hederaTestnet,
//     transport: http(),
//   });

//   const sdk = new InscriptionSDK({
//   apiKey: process.env.KILOSCRIBE_API_KEY,
//   network: 'testnet'  // or 'mainnet'
// });



// const wallet = new HashinalsWalletConnectSDK();

//   const publishComic = async ({
//     files,
//     title,
//     description,
//     price,
//     coverImage,
//   }: {
//     files: File[];
//     title: string;
//     description: string;
//     price: number;
//     coverImage: string;
//   }) => {
//     try {
//       setLoading(true);
//       setError(null);

//       // ✅ Step 1: Upload & Mint with KiloScribe via Wallet
//       // (User signs this transaction)
//       const formData = new FormData();
//       files.forEach((file) => formData.append("files", file));
//       formData.append("title", title);
//       formData.append("description", description);

//     const { accountId } = await  wallet.connectWallet(
//   process.env.NEXT_PUBLIC_HASHGRAPH_PROJECT_ID!,
//   {
//     name: 'My dApp',
//     description: 'Example dApp using Inscription SDK',
//     url: window.location.origin,
//     icons: ['https://example.com/icon.png']
//   }
// );
//  const signer = wallet.dAppConnector.signers.find(
//   (s) => s.getAccountId().toString() === accountId
// );
//       // Example placeholder — replace with real KiloScribe SDK/API usage
//       // Convert first file to base64
//       const file = files[0];
//       const base64String = await new Promise<string>((resolve) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result as string);
//         reader.readAsDataURL(file);
//       });
      
//       const kiloResponse = await sdk.inscribe({ 
//         file: {
//         type : 'base64',
//         base64: base64String.split(',')[1], // Remove data URL prefix
//         fileName: file.name,
//         mimeType: file.type
//       }, 
//       holderId: accountId,
//       mode: 'hashinal',
//      description: description
//     },
//     signer
//     );

//     // Check status
// const status = await sdk.retrieveInscription(kiloResponse.jobId);

//     //   const { tokenId, metadataUri } = kiloResponse;
//     //   console.log("Minted via KiloScribe:", tokenId, metadataUri);

//       // ✅ Step 2: Save Comic Record to Backend
//       await axios.post("/api/comics/save", {
//         tokenId,
//         creator: accountId,
//         metadataUri,
//         title,
//         description,
//         coverImage,
//       });

//       // ✅ Step 3: List NFT on Marketplace (User signs tx)
//       const marketplaceAddress = "0xYourMarketplaceContract";
//       const priceInTinybar = BigInt(price * 1e8);

//       const data = publicClient.encodeFunctionData({
//         abi: MarketplaceABI,
//         functionName: "listNFT",
//         args: [tokenId, priceInTinybar],
//       });

//       await sendTransaction({
//         to: marketplaceAddress,
//         data,
//         from: accountId,
//       });

//       setSuccess(true);
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { publishComic, loading, error, success };
// }



// useHashinalNFT.ts
import { useState } from "react";
import { inscribe } from "@hashgraph-online/standards-sdk";
import { HashinalsWalletConnectSDK } from '@hashgraphonline/hashinal-wc';
import {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
} from "@hashgraph/sdk";


interface UseHashinalNFTProps {
  accountId: string;
  signer: any; // can be hashconnect or kiloscribe signer instance
  network?: "testnet" | "mainnet";
}

export function useHashinalNFT({ accountId, signer, network = "testnet" }: UseHashinalNFTProps) {
  const [status, setStatus] = useState<"idle" | "inscribing" | "minting" | "done" | "error">("idle");
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const createHashinalNFT = async (file: File, metadata: Record<string, any>) => {
    try {
      setStatus("inscribing");
      setProgress(0);

      const fileBuffer = await file.arrayBuffer();

      // Step 1: Inscribe file + metadata fully on Hedera (HCS-5)
      const nftInscription = await inscribe(
        {
          type: "buffer",
          buffer: Buffer.from(fileBuffer),
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
        },
        {
          accountId,
          privateKey: "", // leave empty: signing will be handled by user wallet
          network,
        },
        {
          mode: "hashinal",
          metadata,
          waitForConfirmation: true,
          progressCallback: (data) => setProgress(data.progressPercent),
        }
      );

      const imageHRL = `hcs://1/${nftInscription.inscription.topic_id}`;
      const metadataHRL = `hcs://1/${nftInscription.inscription.jsonTopicId}`;

      console.log("✅ Inscription complete", { imageHRL, metadataHRL });

      setStatus("minting");

      // Step 2: Create NFT and Mint using user signer
      const client = Client.forName(network);
      const publicKey = signer.getAccountKey ? await signer.getAccountKey() : signer.publicKey;
      client.setOperatorWith(accountId, publicKey, (message) => signer.sign(message));

      // Create a collection for the NFT
      const tokenCreateTx = new TokenCreateTransaction()
        .setTokenName(metadata.name || "Hashinal NFT")
        .setTokenSymbol(metadata.symbol || "HASH")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(10000)
        .freezeWith(client);

      const signedCreateTx = await signer.signTransaction(tokenCreateTx);
      const nftCreateSubmit = await signedCreateTx.execute(client);
      const nftCreateReceipt = await nftCreateSubmit.getReceipt(client);
      const tokenId = nftCreateReceipt.tokenId?.toString();

      console.log("🪙 NFT Collection Created:", tokenId);

      // Mint NFT with metadata HRL
      const mintTx = new TokenMintTransaction()
        .setTokenId(tokenId!)
        .setMetadata([Buffer.from(metadataHRL)])
        .freezeWith(client);

      const signedMintTx = await signer.signTransaction(mintTx);
      const mintSubmit = await signedMintTx.execute(client);
      const mintReceipt = await mintSubmit.getReceipt(client);
      const serial = mintReceipt.serials[0].toString();

      const nftResult = {
        tokenId,
        serial,
        metadataHRL,
        imageHRL,
      };

      setResult(nftResult);
      setStatus("done");

      return nftResult;
    } catch (err: any) {
      console.error("❌ Error creating Hashinal NFT:", err);
      setError(err.message || "Failed to create NFT");
      setStatus("error");
      throw err;
    }
  };

  return { createHashinalNFT, status, progress, result, error };
}
