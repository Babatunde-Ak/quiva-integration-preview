import { createComicMetadata } from "../lib/hashinal-helper";
import { useState, useRef, useEffect } from "react";
import {inscribe, inscribeWithSigner } from "@hashgraphonline/standards-sdk";
 import { HashinalsWalletConnectSDK } from "@hashgraphonline/hashinal-wc";
import {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  LedgerId,
  AccountId,
} from "@hashgraph/sdk";
import { Buffer } from "buffer/";

 

interface UseComicHashinalProps {
  accountId: string;
  signer: any; // DAppSigner from connector.getSigner() - must have getAccountId() method
  network?: "testnet" | "mainnet";
}

  export function useComicHashinalNFT({ accountId, signer, network = "testnet" }: UseComicHashinalProps) {
 const [status, setStatus] = useState<"idle" | "uploading" | "inscribing" | "minting" | "done" | "error">("idle");
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Use refs to always get the latest values
  const signerRef = useRef(signer);
  console.log('signerRef:', signerRef);
  const accountIdRef = useRef(accountId);
  console.log('accountIdRef:', accountIdRef);

  // Keep refs in sync with props
  useEffect(() => {
    signerRef.current = signer;
    accountIdRef.current = accountId;
  }, [signer, accountId]);

  // Resolve signer: prefer provided signer, fallback to WalletConnect SDK
const getActiveSigner = async () => {
  // Always read from ref to get latest value
  const currentSigner = signerRef.current;
  
  if (currentSigner) {
    console.log("🪙 Using provided signer from HashPack/Kabila");
    return currentSigner;
  }

  // throw new Error("No signer available. Please connect your wallet first.");

  console.log("⚡ No signer passed — initializing Hashinals WC SDK...");
  const sdk = HashinalsWalletConnectSDK.getInstance();

  await sdk.init(
    "ec1bf58ee8034b1747cb72a34b6652ae", // replace with your project ID
    {
      name: "Quiva Comics",
      description: "Client-side inscription with Hashinals",
      url: window.location.origin,
      icons: ["https://quiva.com/icon.png"],
    },
    network === "testnet" ? LedgerId.TESTNET : LedgerId.MAINNET
  );

  const session = await sdk.connect();
  const accountInfo = await sdk.getAccountInfo();
  console.log(`🔗 Connected Hedera wallet: ${accountInfo.accountId}`);

  return sdk.dAppConnector; // this acts as a signer for inscribeWithSigner
};

// active signer will be resolved when needed inside createComicNFT
const createComicNFT = async (formData: {
  name: string;
  creator: string;
  description: string;
  genres: string[];
  copiesOfComic: number;
  ageRating: string;
  coverFile: File;
  pageFiles: File[];
  priceHbar: number;
  mintNow?: number;
}) => {
  try {
    setStatus("inscribing");
    setProgress(0);

    // Validate inputs
    if (!formData.pageFiles || formData.pageFiles.length === 0) {
      throw new Error("No page files provided for inscription");
    }
    if (!formData.coverFile) {
      throw new Error("No cover file provided");
    }

  // Step 1: Upload or inscribe all pages to IPFS / KiloScribe
      const pageUris: string[] = [];
      const activeSigner = await getActiveSigner();
      console.log("🪙 Active signer ready:", activeSigner);
      
      // Validate signer has required method
      if (!activeSigner || typeof activeSigner.getAccountId !== 'function') {
        throw new Error("Invalid signer: must have getAccountId() method. Make sure you're passing a DAppSigner, not DAppConnector.");
      }
  
      for (const page of formData.pageFiles) {
        const arrayBuffer = await page.arrayBuffer();
       
        const res = await inscribeWithSigner(
          {
            type: "buffer",
            buffer: arrayBuffer,
            fileName: page.name,
            mimeType: page.type || "image/png",
          },
          activeSigner,
          
          {
          //  mode: "file",
            waitForConfirmation: true,
            network
          }
        );
  
        const uri = `hcs://1/${res.inscription.topic_id}`;
        pageUris.push(uri);
      }
  
      // Step 2: Get cover URI (can be one of the pages)
      const coverUri = pageUris[0];
      
        setProgress(30)
        console.log(
          "file inscribed",
          coverUri
        );
      // Step 3: Generate HIP-412 metadata
      const metadata = createComicMetadata({
        name: formData.name,
        creator: formData.creator,
        description: formData.description,
        genres: formData.genres,
        copiesOfComic: formData.copiesOfComic,
        ageRating: formData.ageRating,
        coverUri,
        pageUris,
        priceHbar: formData.priceHbar,
        totalPages: formData.pageFiles.length,
        mimeType: "image/png",
      });
    // Step 4: Inscribe metadata + cover image
    const coverBuffer = await formData.coverFile.arrayBuffer();

    const nftInscription = await inscribeWithSigner(
      {
        type: "buffer",
        buffer: coverBuffer,
        fileName: formData.coverFile.name,
        mimeType: formData.coverFile.type || "image/png",
      },
      activeSigner,
      {
        mode: "hashinal",
        metadata,
        waitForConfirmation: true,
        progressCallback: (data) => setProgress(data.progressPercent),
        network
      }
    );

    const comicHRL = `hcs://1/${nftInscription.inscription.topic_id}`;
    const metadataHRL = `hcs://1/${nftInscription.inscription.jsonTopicId}`;
      setProgress(80)
    // Step 5: Continue with NFT creation + mint as before
    // ... your existing TokenCreateTransaction + TokenMintTransaction logic

    // const client = Client.forName(network);
    const client = Client.forTestnet();
    client.setOperator(accountId, activeSigner);
      // const publicKey = activeSigner.getAccountKey ? await activeSigner.getAccountKey() : activeSigner.publicKey;
      // client.setOperatorWith(accountId, publicKey, (msg) => activeSigner.sign(msg));

      const tokenCreateTx = new TokenCreateTransaction()
        .setTokenName(metadata.name || "Comic NFT")
        .setTokenSymbol("QuivaCOMIC")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setMaxSupply(metadata.properties.copiesOfComic)
        .setSupplyType(TokenSupplyType.Finite)
        .freezeWith(client);
        
      const signedCreateTx = await activeSigner.signTransaction(tokenCreateTx);
      const nftCreateSubmit = await signedCreateTx.execute(client);
      const nftCreateReceipt = await nftCreateSubmit.getReceipt(client);
      const tokenId = nftCreateReceipt.tokenId?.toString();

      console.log("🪙 Comic NFT Collection Created:", tokenId);
      setProgress(90);
     let lastSerial: number = 0;
     for (let i = 0; i < (formData.mintNow || 1); i++) {
      const mintTx = new TokenMintTransaction()
        .setTokenId(tokenId!)
        .setMetadata([Buffer.from(metadataHRL)])
        .freezeWith(client);

      const signedMintTx = await activeSigner.signTransaction(mintTx);
      const mintSubmit = await signedMintTx.execute(client);
      const mintReceipt = await mintSubmit.getReceipt(client);
      lastSerial = mintReceipt.serials[0].toNumber();
      console.log(`🎉 Minted Comic NFT #${lastSerial}`);
     }

      const nftResult = {
        tokenId,
        serial: lastSerial,
        metadataHRL,
        comicHRL,
        totalPages: formData.pageFiles.length,
      };

      setResult(nftResult);
      setStatus("done");
      setProgress(100);
      return nftResult;
    } catch (err: any) {
      console.error("❌ Error creating comic NFT:", err);
      setError(err.message);
      setStatus("error");
      throw err;
    }
  };

  return { createComicNFT, status, progress, result, error };

};


// import { createComicMetadata } from "../lib/hashinal-helper";
// import { useState } from "react";
// import { inscribeWithSigner } from "@hashgraphonline/standards-sdk";
// import { HashinalsWalletConnectSDK } from "@hashgraphonline/hashinal-wc";
// import {
//   Client,
//   TokenCreateTransaction,
//   TokenType,
//   TokenSupplyType,
//   TokenMintTransaction,
//   LedgerId,
//   TransactionId,
//   TopicCreateTransaction,
//   TopicMessageSubmitTransaction,
// } from "@hashgraph/sdk";
// import { Buffer } from "buffer/";

// interface UseComicHashinalProps {
//   accountId: string;
//   signer: any; // KiloScribe or compatible signer
//   network?: "testnet" | "mainnet";
// }

// export function useComicHashinalNFT({ accountId, signer, network = "testnet" }: UseComicHashinalProps) {
//   const [status, setStatus] = useState<"idle" | "uploading" | "inscribing" | "minting" | "done" | "error">("idle");
//   const [progress, setProgress] = useState<number>(0);
//   const [result, setResult] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);

//   // Resolve signer: prefer provided signer, fallback to WalletConnect SDK
//   const getActiveSigner = async () => {
//     if (signer) {
//       console.log("🪙 Using provided signer from HashPack/Kabila");
//       return signer;
//     }
//     throw new Error("No signer available");
//   };

//   // Manual inscription approach to bypass the Query.fromBytes() issue
//   const manualInscribe = async (content: ArrayBuffer, metadata: any, signer: any) => {
//     try {
//       const client = Client.forName(network);
      
//       // Create a topic for the inscription
//       const topicCreateTx = new TopicCreateTransaction()
//         .setTopicMemo("Comic NFT Inscription")
//         .freezeWith(client);
        
//       const signedTopicTx = await signer.signTransaction(topicCreateTx);
//       const topicSubmit = await signedTopicTx.execute(client);
//       const topicReceipt = await topicSubmit.getReceipt(client);
//       const topicId = topicReceipt.topicId;
      
//       console.log("📝 Created topic:", topicId?.toString());
      
//       // Submit the metadata as a message to the topic
//       const messageTransaction = new TopicMessageSubmitTransaction()
//         .setTopicId(topicId!)
//         .setMessage(Buffer.from(JSON.stringify(metadata)))
//         .freezeWith(client);
        
//       const signedMsgTx = await signer.signTransaction(messageTransaction);
//       const msgSubmit = await signedMsgTx.execute(client);
//       const msgReceipt = await msgSubmit.getReceipt(client);
      
//       console.log("📝 Submitted metadata to topic");
      
//       // Submit the content
//       const contentMessage = new TopicMessageSubmitTransaction()
//         .setTopicId(topicId!)
//         .setMessage(Buffer.from(content))
//         .freezeWith(client);
        
//       const signedContentTx = await signer.signTransaction(contentMessage);
//       const contentSubmit = await signedContentTx.execute(client);
//       const contentReceipt = await contentSubmit.getReceipt(client);
      
//       console.log("📝 Submitted content to topic");
      
//       return {
//         topicId: topicId?.toString(),
//         metadataTransactionId: msgReceipt.transactionId?.toString(),
//         contentTransactionId: contentReceipt.transactionId?.toString(),
//       };
//     } catch (err) {
//       console.error("Manual inscription error:", err);
//       throw err;
//     }
//   };

//   const createComicNFT = async (formData: {
//     name: string;
//     creator: string;
//     description: string;
//     genres: string[];
//     copiesOfComic: number;
//     ageRating: string;
//     coverFile: File;
//     pageFiles: File[];
//     priceHbar: number;
//     mintNow?: number;
//   }) => {
//     try {
//       setStatus("inscribing");
//       setProgress(0);

//       const activeSigner = await getActiveSigner();
//       console.log("🪙 Active signer ready:", activeSigner);

//       // For now, simplify by only inscribing the cover
//       // Pages can be added later once the Query issue is resolved
//       const pageUris: string[] = [];
//       for (let i = 0; i < formData.pageFiles.length; i++) {
//         pageUris.push(`page_${i + 1}_placeholder`);
//       }

//       const coverUri = "cover_placeholder"; // Will be updated from inscription
      
//       setProgress(30);
      
//       // Step 3: Generate HIP-412 metadata
//       const metadata = createComicMetadata({
//         name: formData.name,
//         creator: formData.creator,
//         description: formData.description,
//         genres: formData.genres,
//         copiesOfComic: formData.copiesOfComic,
//         ageRating: formData.ageRating,
//         coverUri,
//         pageUris,
//         priceHbar: formData.priceHbar,
//         totalPages: formData.pageFiles.length,
//         mimeType: "image/png",
//       });

//       // Step 4: Try manual inscription approach
//       const coverBuffer = await formData.coverFile.arrayBuffer();
      
//       let inscriptionResult: any;
//       let metadataHRL: string;
//       let comicHRL: string;
      
//       try {
//         // Try the original inscribeWithSigner first
//         console.log("📝 Attempting standard inscription...");
//         const nftInscription = await inscribeWithSigner(
//           {
//             type: "buffer",
//             buffer: coverBuffer,
//             fileName: formData.coverFile.name,
//             mimeType: formData.coverFile.type || "image/png",
//           },
//           activeSigner,
//           {
//             mode: "hashinal",
//             metadata,
//             waitForConfirmation: false, // Don't wait to avoid query issues
//             progressCallback: (data) => setProgress(Math.min(data.progressPercent, 70)),
//           }
//         );
        
//         comicHRL = `hcs://1/${nftInscription.inscription.topic_id}`;
//         metadataHRL = `hcs://1/${nftInscription.inscription.jsonTopicId}`;
//       } catch (inscriptionError: any) {
//         console.warn("Standard inscription failed, trying manual approach:", inscriptionError);
        
//         // Fallback to manual inscription
//         inscriptionResult = await manualInscribe(coverBuffer, metadata, activeSigner);
//         comicHRL = `hcs://1/${inscriptionResult.topicId}`;
//         metadataHRL = comicHRL; // Same topic for simplicity
//       }

//       setProgress(80);

//       // Step 5: Continue with NFT creation + mint as before
//       const client = Client.forName(network);

//       const tokenCreateTx = new TokenCreateTransaction()
//         .setTokenName(metadata.name || "Comic NFT")
//         .setTokenSymbol("QuivaCOMIC")
//         .setTokenType(TokenType.NonFungibleUnique)
//         .setDecimals(0)
//         .setInitialSupply(0)
//         .setMaxSupply(metadata.properties.copiesOfComic)
//         .setSupplyType(TokenSupplyType.Finite)
//         .freezeWith(client);

//       const signedCreateTx = await activeSigner.signTransaction(tokenCreateTx);
//       const nftCreateSubmit = await signedCreateTx.execute(client);
//       const nftCreateReceipt = await nftCreateSubmit.getReceipt(client);
//       const tokenId = nftCreateReceipt.tokenId?.toString();

//       console.log("🪙 Comic NFT Collection Created:", tokenId);
//       setProgress(90);
      
//       let lastSerial: number = 0;
//       for (let i = 0; i < (formData.mintNow || 1); i++) {
//         const mintTx = new TokenMintTransaction()
//           .setTokenId(tokenId!)
//           .setMetadata([Buffer.from(metadataHRL)])
//           .freezeWith(client);

//         const signedMintTx = await activeSigner.signTransaction(mintTx);
//         const mintSubmit = await signedMintTx.execute(client);
//         const mintReceipt = await mintSubmit.getReceipt(client);
//         lastSerial = mintReceipt.serials[0].toNumber();
//         console.log(`🎉 Minted Comic NFT #${lastSerial}`);
//       }

//       const nftResult = {
//         tokenId,
//         serial: lastSerial,
//         metadataHRL,
//         comicHRL,
//         totalPages: formData.pageFiles.length,
//       };

//       setResult(nftResult);
//       setStatus("done");
//       setProgress(100);
//       return nftResult;
//     } catch (err: any) {
//       console.error("❌ Error creating comic NFT:", err);
//       setError(err.message);
//       setStatus("error");
//       throw err;
//     }
//   };

//   return { createComicNFT, status, progress, result, error };
// }
