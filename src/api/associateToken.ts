import {NextApiRequest, NextApiResponse} from "next";
import { 
  Client, 
  TokenAssociateTransaction, 
  AccountId, 
  TokenId,
  PrivateKey
} from "@hiero-ledger/sdk";
// import dotenv from 'dotenv';

// Load environment variables
// dotenv.config({ path: '.env.local' });

async function associateToken(tokenId: string) {
  try {
    const MARKETPLACE_CONTRACT_ID = process.env.MARKETPLACE_CONTRACT_ID!;
    const MARKETPLACE_OWNER_ACCOUNT_ID = process.env.MARKETPLACE_OWNER_ACCOUNT_ID!;
    const MARKETPLACE_OWNER_PRIVATE_KEY = process.env.MARKETPLACE_OWNER_PRIVATE_KEY!;
    const NETWORK = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';

    const client = Client.forName(NETWORK);
    client.setOperator(
      AccountId.fromString(MARKETPLACE_OWNER_ACCOUNT_ID),
      PrivateKey.fromStringECDSA(MARKETPLACE_OWNER_PRIVATE_KEY)
    );

    console.log("⏳ Creating transaction...");
    const associateTx = new TokenAssociateTransaction()
      .setAccountId(AccountId.fromString(MARKETPLACE_CONTRACT_ID))
      .setTokenIds([TokenId.fromString(tokenId)]);

    const frozenTx = await associateTx.freezeWith(client);
    const signedTx = await frozenTx.sign(PrivateKey.fromStringECDSA(MARKETPLACE_OWNER_PRIVATE_KEY));

    console.log("⏳ Executing...");
    const txResponse = await signedTx.execute(client);
    
    console.log("⏳ Waiting for receipt...");
    const receipt = await txResponse.getReceipt(client);

    console.log("✅ SUCCESS!");

    return { success: true, transactionId: txResponse.transactionId.toString() };

  } catch (err: any) {
    if (err.message?.includes("TOKEN_ALREADY_ASSOCIATED")) {
      return { success: true, alreadyAssociated: true };
    }
    console.error("❌ Failed:", err);
    throw err;
  }
}

// Get token ID from command line argument
const tokenId = process.argv[2] || "0.0.7659745";

associateToken(tokenId)
  .then((result) => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
