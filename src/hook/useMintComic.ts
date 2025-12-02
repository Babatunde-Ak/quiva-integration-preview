import { createComicMetadata } from "../lib/hashinal-helper";
import { useState } from "react";
import { inscribe } from "@hashgraph-online/standards-sdk";
import { HashinalsWalletConnectSDK } from "@hashgraphonline/hashinal-wc";
import {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
} from "@hashgraph/sdk";
import { Buffer } from "buffer";



interface UseComicHashinalProps {
  accountId: string;
  signer: any; // KiloScribe or compatible signer
  network?: "testnet" | "mainnet";
}

  export function useComicHashinalNFT({ accountId, signer, network = "testnet" }: UseComicHashinalProps) {
 const [status, setStatus] = useState<"idle" | "uploading" | "inscribing" | "minting" | "done" | "error">("idle");
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
}) => {
  try {
    setStatus("inscribing");
    setProgress(0);

    // Step 1: Upload or inscribe all pages to IPFS / KiloScribe
    const pageUris: string[] = [];

    for (const page of formData.pageFiles) {
      const buffer = await page.arrayBuffer();
      const res = await inscribe(
        {
          type: "buffer",
          buffer: Buffer.from(buffer),
          fileName: page.name,
          mimeType: page.type || "image/png",
        },
        {
          accountId,
          network,
        },
        {
          mode: "hashinal",
          waitForConfirmation: true,
        }
      );

      const uri = `hcs://1/${res.inscription.topic_id}`;
      pageUris.push(uri);
    }

    // Step 2: Get cover URI (can be one of the pages)
    const coverUri = pageUris[0];
      setProgress(30)
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

    const nftInscription = await inscribe(
      {
        type: "buffer",
        buffer: Buffer.from(coverBuffer),
        fileName: formData.coverFile.name,
        mimeType: formData.coverFile.type || "image/png",
      },
      {
        accountId,
        network,
      },
      {
        mode: "hashinal",
        metadata,
        waitForConfirmation: true,
        progressCallback: (data) => setProgress(data.progressPercent),
      }
    );

    const comicHRL = `hcs://1/${nftInscription.inscription.topic_id}`;
    const metadataHRL = `hcs://1/${nftInscription.inscription.jsonTopicId}`;
      setProgress(80)
    // Step 5: Continue with NFT creation + mint as before
    // ... your existing TokenCreateTransaction + TokenMintTransaction logic

    const client = Client.forName(network);
      const publicKey = signer.getAccountKey ? await signer.getAccountKey() : signer.publicKey;
      client.setOperatorWith(accountId, publicKey, (msg) => signer.sign(msg));

      const tokenCreateTx = new TokenCreateTransaction()
        .setTokenName(metadata.name || "Comic NFT")
        .setTokenSymbol("QuivaCOMIC")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(metadata.properties.copiesOfComic)
        .setMaxSupply(10000)
        .setSupplyType(TokenSupplyType.Finite)
        .freezeWith(client);

      const signedCreateTx = await signer.signTransaction(tokenCreateTx);
      const nftCreateSubmit = await signedCreateTx.execute(client);
      const nftCreateReceipt = await nftCreateSubmit.getReceipt(client);
      const tokenId = nftCreateReceipt.tokenId?.toString();

      console.log("🪙 Comic NFT Collection Created:", tokenId);
      setProgress(90);

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
