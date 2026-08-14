import { AccountAllowanceApproveTransaction, AccountId, Client, ContractExecuteTransaction, ContractFunctionParameters, ContractId, NftId, PrivateKey, TokenAssociateTransaction, TokenId, TransactionId } from "@hiero-ledger/sdk";

// Add this NEW function to associate marketplace with token
 export async function associateTokenWithMarketplace(
  tokenId: string,
  marketplaceAccountId: string,
  network: "testnet" | "mainnet" = "testnet"
) {
  try {

   //createNonFungibleTokenWithCustomFees
    console.log("🔗 Associating token with marketplace...");
    const OPERATOR_KEY = PrivateKey.fromStringECDSA("96ff29b830b40e6eb20d34d13b89340a9ad65f45597f0b7612469081ab6f2567");
    // const client = Client.forName(network);
    
    const client = Client.forTestnet();
    client.setOperator(AccountId.fromString("0.0.6632839"), OPERATOR_KEY);
    const associateTx = new ContractExecuteTransaction()
      .setContractId(marketplaceAccountId)
      .setGas(1500000)
      //.setTransactionId(TransactionId.generate(AccountId.fromString("0.0.6632839")))
      .setFunction("associateTokenWithContract", 
        new ContractFunctionParameters()
          .addAddress(TokenId.fromString(tokenId).toEvmAddress())
      )
      .freezeWith(client);
    const signedTx = await associateTx.sign(OPERATOR_KEY);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    
    console.log("✅ Token association complete (or already associated):", receipt.status.toString());
    return true;
  } catch (err: any) {
    console.error("Association error:", err);
    throw err;
  }
}

// Add this NEW function to approve NFT transfer
 export async function approveNFTForMarketplace(
  tokenId: string,
  serials: number[],
  marketplaceId: string,
  userAccountId: string,
  signer: any,
  network: "testnet" | "mainnet" = "testnet"
) {
  try {
    console.log("✅ Approving NFT transfer to marketplace...");
    const client = Client.forName(network);
    
    // Create NFT IDs for each serial
    const nftIds = serials.map(serial => 
      new NftId(TokenId.fromString(tokenId), serial)
    );

    // Approve marketplace to transfer these NFTs
    const approveTx = new AccountAllowanceApproveTransaction()
    .setTransactionId(TransactionId.generate(AccountId.fromString(userAccountId)));
    for (const nftId of nftIds) {
      approveTx.approveTokenNftAllowance(
        nftId,
        AccountId.fromString(userAccountId),
        AccountId.fromString(marketplaceId)
      );
    }

    const signedTx = await signer.signTransaction(approveTx);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    
    console.log("✅ NFT approval successful:", receipt.status.toString());
    return true;
  } catch (err: any) {
    console.error("Approval error:", err);
    throw err;
  }
}

export async function approveForAll( marketplaceId: string, 
  tokenId: string,
 userAccountId: string,
 signer: any,
 network: "testnet" | "mainnet" = "testnet"
) {

    const client = Client.forName(network);
   const approveTx = new ContractExecuteTransaction()
    .setContractId(marketplaceId) // Marketplace contract ID
    .setTransactionId(TransactionId.generate(AccountId.fromString(userAccountId)))
    .setGas(200000)
    .setFunction("approvalNFT", 
      new ContractFunctionParameters()
        .addAddress(TokenId.fromString(tokenId).toEvmAddress()) 
        .addAddress(AccountId.fromString(marketplaceId).toEvmAddress())
        // .addAddress(ContractId.fromString(marketplaceId).toEvmAddress())// Operator address (marketplace)
    );
     
  const signedTx = await signer.signTransaction(approveTx);
  const txResponse = await signedTx.execute(client);
  const receipt = await txResponse.getReceipt(client);
  console.log("✅ Approval for all successful:", receipt.status.toString());
  return true;
    // .freezeWith(client);

}


export async function setApprovalForAllHTS(tokenId: string, operator: string, accountId: string, signer: any, serials: number[]) {
    const client = Client.forTestnet();
    // const htsPrecompileAddress = "0x0000000000000000000000000000000000000167";
    const htsPrecompileAddress = "0.0.359";
    
    //const approveTx = new ContractExecuteTransaction()
        // .setContractId(htsPrecompileAddress)
        //  .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        // .setGas(1000000)
        // .setFunction("setApprovalForAll", 
        //     new ContractFunctionParameters()
        //         .addAddress(TokenId.fromString(tokenId).toEvmAddress())
        //         .addAddress(ContractId.fromString(operator).toEvmAddress())
        //         .addBool(approved)
        // );
      for (const serial of serials) {
      console.log(`Approving serial ${serial}...`);
      
      const approveTx = new ContractExecuteTransaction()
        .setContractId(htsPrecompileAddress)
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)))
        .setGas(500000)
        .setFunction("approveNFT", 
          new ContractFunctionParameters()
            .addAddress(AccountId.fromString(tokenId).toEvmAddress())
            .addAddress(ContractId.fromString(operator).toEvmAddress())
            .addUint64(serial)
        );
      
    const signedTx = await signer.signTransaction(approveTx);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    return receipt.status.toString();
      }
}