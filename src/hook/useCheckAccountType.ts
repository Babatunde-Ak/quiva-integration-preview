 export async function getHederaAccountInfo(accountId: string) {
  const res = await fetch(
    `https://mainnet-public.mirrornode.hedera.com/api/v1/accounts/${accountId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch account info");
  }

  return res.json();
}

export async function canAuthorizeHTSTransfer(accountId: string) {
  const account = await getHederaAccountInfo(accountId);

  const keyType = account?.key?.type;
  const evmAddress = account?.evm_address;

  return (
    keyType === "ECDSA_SECP256K1" &&
    typeof evmAddress === "string" &&
    evmAddress.startsWith("0x")
  );
}
