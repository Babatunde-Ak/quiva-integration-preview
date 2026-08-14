import { NextRequest, NextResponse } from 'next/server';
import {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  AccountId,
  PublicKey,
} from "@hiero-ledger/sdk";
import { createComicMetadata } from "@/lib/hashinal-helper";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      formData,
      accountId,
      publicKey,
      network = "testnet",
      action, // 'create' or 'mint'
      tokenId, // for minting existing token
    } = body;

    // Initialize Hedera client
    const client = Client.forName(network);
    
    // Don't set operator here - we're just preparing the transaction
    
    if (action === 'create') {
      // Generate metadata
      const metadata = createComicMetadata({
        name: formData.name,
        creator: formData.creator,
        description: formData.description,
        genres: formData.genres,
        copiesOfComic: formData.copiesOfComic,
        ageRating: formData.ageRating,
        coverUri: formData.coverUri,
        pageUris: formData.pageUris,
        priceHbar: formData.priceHbar,
        totalPages: formData.totalPages,
        mimeType: "image/png",
      });

      // Create token transaction
      const transaction = await new TokenCreateTransaction()
        .setTokenName(metadata.name || "Comic NFT")
        .setTokenSymbol("QuivaCOMIC")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setMaxSupply(metadata.properties.copiesOfComic)
        .setSupplyType(TokenSupplyType.Finite)
        .setTreasuryAccountId(AccountId.fromString(accountId))
        .setAdminKey(PublicKey.fromString(publicKey))
        .setSupplyKey(PublicKey.fromString(publicKey))
        .freezeWith(client);

      // Convert to bytes for client signing
      const transactionBytes = transaction.toBytes();
      const transactionBase64 = Buffer.from(transactionBytes).toString('base64');

      return NextResponse.json({
        success: true,
        transaction: transactionBase64,
        metadata,
        type: 'TokenCreateTransaction',
      });
    } 
    
    if (action === 'mint' && tokenId) {
      const metadataHRL = formData.metadataHRL;
      
      // Prepare mint transaction
      const transaction = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata([Buffer.from(metadataHRL)])
        .freezeWith(client);

      const transactionBytes = transaction.toBytes();
      const transactionBase64 = Buffer.from(transactionBytes).toString('base64');

      return NextResponse.json({
        success: true,
        transaction: transactionBase64,
        type: 'TokenMintTransaction',
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid action' 
    }, { status: 400 });

  } catch (error: any) {
    console.error('Error preparing transaction:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}