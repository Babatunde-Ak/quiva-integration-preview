import { NextRequest, NextResponse } from 'next/server';
import {
  Client,
  Transaction,
  TokenCreateTransaction,
  TokenMintTransaction,
} from "@hiero-ledger/sdk";

export async function POST(request: NextRequest) {
  try {
    const { 
      signedTransaction, 
      network = "testnet",
      transactionType 
    } = await request.json();

    const client = Client.forName(network);
    
    // Decode the signed transaction
    const transactionBytes = Buffer.from(signedTransaction, 'base64');
    
    let transaction;
    switch(transactionType) {
      case 'TokenCreateTransaction':
        transaction = TokenCreateTransaction.fromBytes(transactionBytes);
        break;
      case 'TokenMintTransaction':
        transaction = TokenMintTransaction.fromBytes(transactionBytes);
        break;
      default:
        transaction = Transaction.fromBytes(transactionBytes);
    }

    // Execute the signed transaction
    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);

    // Extract relevant data based on transaction type
    let responseData: any = {
      success: true,
      transactionId: txResponse.transactionId?.toString(),
      status: receipt.status.toString(),
    };

    if (transactionType === 'TokenCreateTransaction') {
      responseData.tokenId = receipt.tokenId?.toString();
    } else if (transactionType === 'TokenMintTransaction') {
      responseData.serials = receipt.serials?.map(s => s.toNumber());
    }

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Error submitting transaction:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}