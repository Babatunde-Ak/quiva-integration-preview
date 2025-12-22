// src/hooks/useMarketplace.ts
import { ContractExecuteTransaction, ContractCallQuery, Client, Hbar, ContractFunctionParameters } from "@hashgraph/sdk";

export function useBuyComic(marketplaceId= "0.0.7348494", network: "testnet" | "mainnet" = "testnet") {
  const client = Client.forName(network);

  const fetchListing = async (listingId: number) => {
    const query = new ContractCallQuery()
      .setContractId(marketplaceId)
      .setFunction("listings", new ContractFunctionParameters().addUint256(listingId))
      .setGas(100_000);
    const res = await query.execute(client);
    return res;
  };

  const fetchPreview = async (listingId: number) => {
    const query = new ContractCallQuery()
      .setContractId(marketplaceId)
      .setFunction("getPreview", new ContractFunctionParameters().addUint256(listingId))
      .setGas(100_000);
    return (await query.execute(client)).toString();
  };

  const fetchFullContent = async (listingId: number, buyer: string) => {
    const query = new ContractCallQuery()
      .setContractId(marketplaceId)
      .setFunction("getFullContent", new ContractFunctionParameters().addUint256(listingId).addAddress(buyer))
      .setGas(150_000);
    return (await query.execute(client)).toString();
  };

  const buyComic = async (listingId: number, priceTinybar: number, signer: any, accountId: string) => {
    const tx = new ContractExecuteTransaction()
      .setContractId(marketplaceId)
      .setFunction("buyItem", new ContractFunctionParameters().addUint256(listingId))
      .setPayableAmount(new Hbar(priceTinybar / 100_000_000))
      .setGas(300_000)
      .freezeWithSigner(signer);

    const signedTx = await signer.signTransaction(tx);
    const txResponse = await signedTx.execute(client);
    await txResponse.getReceipt(client);
    return txResponse.transactionId.toString();
  };

  return { fetchListing, fetchPreview, fetchFullContent, buyComic };
}
