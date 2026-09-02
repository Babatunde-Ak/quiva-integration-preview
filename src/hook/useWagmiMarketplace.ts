
"use client";

import { useMemo, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { TokenId, Hbar ,HbarUnit } from "@hiero-ledger/sdk";
import {
  decodeEventLog,
  encodeFunctionData,
  parseUnits,
  stringToHex,
  type Address,
  type Hex,
  type TransactionReceipt,
} from "viem";
import { getDirectListingInfo, getMarketplaceFee } from './ContractQueries';
import {
  COMIC_CORE_ABI,
  COMIC_MARKETPLACE_ABI,
  COMIC_SALES_ABI,
  HEDERA_CONTRACTS,
  HTS_ERC721_ABI,
} from "@/contracts/HederaContractConfig";


export enum CampaignType {
  PUBLIC = 0,
  WHITELIST = 1,
  SCHEDULED = 2,
}

export enum PhaseType {
  WHITELIST = 0,
  PUBLIC = 1,
}

type TxStatus = "idle" | "processing" | "done" | "error";

interface UseWagmiMarketplaceResult {
  status: TxStatus;
  error: string | null;
  txHash: string | null;
  statusMessage: string;
  mintProgress: number;
  isProcessing: boolean;
  isConfirming: boolean;
  isConnected: boolean;
  address: Address | undefined;
  createComicCollection: (params: {
    episodeId: string;
    name: string;
    symbol: string;
    maxSupply: number;
    hbarDeposit?: number;
    autoRenewPeriod?: number;
  }) => Promise<any>;
  createDirectListing: (params: {
    episodeId: string;
    quantity: number;
    pricePerNFT: number;
    metadata: string;
  }) => Promise<any>;
  purchaseFromListing: (params: {
    listingId: number;
    quantity: number;
    pricePerNFT: number;
  }) => Promise<any>;
  listForResale: (params: {
    tokenAddress: string;
    serialNumber: number;
    priceInHbar: number;
  }) => Promise<any>;
  purchaseResaleListing: (params: {
    listingId: number;
    priceTinybars?: string;
    tokenAddress?: string;
  }) => Promise<any>;
  cancelResaleListing: (listingId: number) => Promise<any>;
  createOffer: (params: { listingId: number; amountInHbar: number; expiresAt: number }) => Promise<any>;
  cancelOffer: (offerId: number) => Promise<any>;
  acceptOffer: (offerId: number) => Promise<any>;
  rejectOffer: (offerId: number) => Promise<any>;
  expireOffer: (offerId: number) => Promise<any>;
  createAuction: (params: {
    tokenAddress: string;
    serialNumber: number;
    reservePriceInHbar: number;
    durationInSeconds: number;
  }) => Promise<any>;
  placeBid: (params: { auctionId: number; amountInHbar: number }) => Promise<any>;
  settleAuction: (auctionId: number) => Promise<any>;
  cancelAuction: (auctionId: number) => Promise<any>;
  createCampaign: (params: {
    episodeId: string;
    campaignType: CampaignType;
    mintPrice: number;
    maxSupply: number;
    maxPerWallet: number;
    metadata: string;
  }) => Promise<any>;
  addToWhitelist: (params: {
    campaignId: number;
    addresses: string[];
    allocations: number[];
  }) => Promise<any>;
  addPhase: (params: {
    campaignId: number;
    phaseType: PhaseType;
    startTime: number;
    endTime: number;
    mintPrice: number;
    maxPerWallet: number;
    phaseSupply: number;
  }) => Promise<any>;
  mintFromCampaign: (params: {
    campaignId: number;
    phaseId?: number;
    quantity: number;
    mintPrice: number;
  }) => Promise<any>;
}



export function useWagmiMarketplace(): UseWagmiMarketplaceResult {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync, isPending: isWritePending, error: writeError } = useWriteContract();
  const [status, setStatus] = useState<TxStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [mintProgress, setMintProgress] = useState(0);
  const [pendingHash, setPendingHash] = useState<Hex | undefined>();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: pendingHash,
    query: { enabled: Boolean(pendingHash) },
  });


const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  // Convert HBAR amount to Hedera tinybars (8 decimals) for contract arguments.
const hbarToTinybars = (hbarAmount: number | string): bigint => {
  const value = String(hbarAmount).trim();
  if (!value) return BigInt(0);
  return parseUnits(value, 8);
};

// Convert HBAR amount to JSON-RPC Relay wei units (18 decimals).
const hbarToWei = (hbarAmount: number | string): bigint => {
  const value = String(hbarAmount).trim();
  if (!value) return BigInt(0);
  return parseUnits(value, 18);
};

const rawUnitsToHbar = (rawValue: string): number => {
  const value = rawValue.trim();
  if (!value) return 0;
  const isNegative = value.startsWith('-');
  const positive = isNegative ? value.slice(1) : value;
  const digits = positive.replace(/^0+/, '') || '0';

  if (digits.length > 18) {
    const whole = digits.slice(0, digits.length - 18) || '0';
    const fraction = digits.slice(digits.length - 18).padStart(18, '0');
    return Number(`${isNegative ? '-' : ''}${whole}.${fraction}`);
  }

  if (digits.length > 8) {
    const whole = digits.slice(0, digits.length - 8) || '0';
    const fraction = digits.slice(digits.length - 8).padStart(8, '0');
    return Number(`${isNegative ? '-' : ''}${whole}.${fraction}`);
  }

  return Number(`${isNegative ? '-' : ''}0.${digits.padStart(8, '0')}`);
};

const toAddress = (value: string | undefined | null): Address | undefined => {
  if (!value) return undefined;

  const trimmed = value.trim();
  const withPrefix = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;

  if (/^0x[a-fA-F0-9]{40}$/.test(withPrefix)) {
    return withPrefix as Address;
  }

  if (/^[a-fA-F0-9]{40}$/.test(trimmed)) {
    return `0x${trimmed}` as Address;
  }

  if (/^\d+\.\d+\.\d+$/.test(trimmed)) {
    try {
      const hedgeAddress = TokenId.fromString(trimmed).toSolidityAddress();
      const normalized = hedgeAddress.startsWith("0x") ? hedgeAddress : `0x${hedgeAddress}`;
      return /^0x[a-fA-F0-9]{40}$/.test(normalized) ? (normalized as Address) : undefined;
    } catch {
      return undefined;
    }
  }

  return undefined;
};

const normalizeAddress = (value: string | undefined | null): Address => {
  const resolved = toAddress(value);
  if (resolved) return resolved;
  return "0x0000000000000000000000000000000000000000" as Address;
};

const extractEventArg = (
  receipt: TransactionReceipt | undefined,
  abi: readonly unknown[],
  eventName: string,
  argName: string
) => {
  if (!receipt?.logs) return undefined;

  for (const log of receipt.logs as Array<any>) {
    try {
      const decoded = decodeEventLog({
        abi,
        data: log.data as Hex,
        topics: (log.topics || []) as [Hex, ...Hex[]],
      }) as any;

      if (decoded?.eventName === eventName) {
        const value = (decoded?.args as Record<string, unknown> | undefined)?.[argName];
        if (typeof value === "bigint") return value.toString();
        if (typeof value === "string") return value;
        if (value instanceof Number) return value.toString();
        return value;
      }
    } catch {
      // Skip logs that do not match the ABI event
    }
  }

  return undefined;
};

const isReceiptFailed = (receipt: TransactionReceipt | undefined) => {
  const status = (receipt as any)?.status;
  return (
    status === "reverted" ||
    status === "failed" ||
    status === 0 ||
    status === "0x0" ||
    status === "0x00" ||
    status === "0"
  );
};

const toHederaTokenId = (value: string | undefined | null): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();

  if (/^\d+\.\d+\.\d+$/.test(trimmed)) return trimmed;

  if (/^0x[0-9a-fA-F]{40}$/.test(trimmed)) {
    try {
      return TokenId.fromEvmAddress(0, 0, trimmed).toString();
    } catch {
      return undefined;
    }
  }

  const raw = trimmed.replace(/^0x/i, "");
  if (raw.length === 40) {
    try {
      return TokenId.fromEvmAddress(0, 0, `0x${raw}`).toString();
    } catch {
      return undefined;
    }
  }

  return undefined;
};

const MIRROR_NODE_BASE = process.env.NEXT_PUBLIC_MIRROR_NODE_URL || "https://testnet.mirrornode.hedera.com";

const fetchMirrorTransaction = async (txHash: string) => {
  try {
    // Try the transactions lookup by transaction_hash
    const url = `${MIRROR_NODE_BASE}/api/v1/transactions?transaction_hash=${encodeURIComponent(txHash)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const tx = Array.isArray(json?.transactions) ? json.transactions[0] : json?.transactions;
    return tx || json;
  } catch (err) {
    return null;
  }
};

// Weibars (18dp, what the JSON-RPC relay reports) per tinybar (8dp, what HTS charges).
// Mixing these up is off by 10^10 and fails silently - see the unit-scale note in CLAUDE.md.
const WEIBARS_PER_TINYBAR = BigInt(10_000_000_000);

// A resale price this large can only be a unit mistake: listings written before listForResale
// was corrected below stored the price in weibars, so their on-chain price is 10^10 too large
// and no wallet on earth can cover it. 10^14 tinybars is 1,000,000 HBAR.
const MAX_SANE_LISTING_TINYBARS = BigInt(100_000_000_000_000);

// HIP-719: every HTS token exposes a proxy contract at its own EVM address, so an EOA can
// associate itself with the token through a plain EVM call. It returns an HTS response code
// instead of reverting - 194 (TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT) is a no-op, not a failure.
const HTS_TOKEN_ASSOCIATE_ABI = [
  {
    inputs: [],
    name: "associate",
    outputs: [{ internalType: "int256", name: "responseCode", type: "int256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Total of a token's HBAR royalty fallback fees, in tinybars. On any NFT transfer where the
// sender receives no fungible value - which is exactly what an escrow deposit is - HTS charges
// these fallbacks to the *receiver*, i.e. the marketplace contract. Returns 0 if the token has
// no fallbacks or the read fails, so a mirror-node blip can never block a listing outright.
const fetchRoyaltyFallbackTinybars = async (tokenAddress: string): Promise<bigint> => {
  const tokenId = toHederaTokenId(tokenAddress);
  if (!tokenId) return BigInt(0);

  try {
    const res = await fetch(`${MIRROR_NODE_BASE}/api/v1/tokens/${tokenId}`);
    if (!res.ok) return BigInt(0);

    const json = await res.json();
    const royaltyFees: any[] = json?.custom_fees?.royalty_fees ?? [];

    return royaltyFees.reduce((total: bigint, fee: any) => {
      const fallback = fee?.fallback_fee;
      // A non-null denominating_token_id means the fallback is paid in a token, not HBAR.
      if (!fallback || fallback.denominating_token_id) return total;
      return total + BigInt(fallback.amount ?? 0);
    }, BigInt(0));
  } catch {
    return BigInt(0);
  }
};
  const ensureWallet = () => {
    if (!isConnected || !address) {
      throw new Error("Please connect your wallet before continuing.");
    }

    if (!publicClient) {
      throw new Error("Wallet RPC is unavailable right now.");
    }
  };

  const waitForReceipt = async (hash: Hex) => {
    if (!publicClient) {
      throw new Error("Wallet RPC is unavailable right now.");
    }

    setPendingHash(hash);
    return publicClient.waitForTransactionReceipt({ hash });
  };

  // Reads the HTS allowance through the token's ERC-721 facade so we can skip a redundant
  // approval transaction. Treated as "not approved" if the read fails for any reason - a
  // duplicate approval is harmless, a missing one reverts the listing.
  const isMarketplaceApprovedForNft = async (
    tokenAddress: Address,
    serialNumber: number,
    marketplaceAddress: Address
  ): Promise<boolean> => {
    if (!publicClient || !address) return false;

    const matches = (value: unknown) =>
      typeof value === "string" && value.toLowerCase() === marketplaceAddress.toLowerCase();

    // Bypassing Viem's overly strict ABI type inference, as elsewhere in this hook.
    const read = (publicClient as any).readContract.bind(publicClient);

    try {
      const operatorApproved = await read({
        address: tokenAddress,
        abi: HTS_ERC721_ABI as any,
        functionName: "isApprovedForAll",
        args: [address, marketplaceAddress],
      });
      if (operatorApproved === true) return true;
    } catch {
      // Fall through to the per-serial check.
    }

    try {
      const approvedSpender = await read({
        address: tokenAddress,
        abi: HTS_ERC721_ABI as any,
        functionName: "getApproved",
        args: [BigInt(serialNumber)],
      });
      return matches(approvedSpender);
    } catch {
      return false;
    }
  };

  // An escrow deposit moves the NFT to the marketplace without sending the seller any fungible
  // value, so HTS bills the collection's royalty fallback fees to the marketplace contract. If
  // the contract cannot cover them the precompile returns a non-SUCCESS code and the contract
  // reverts with a bare "Transfer failed", which tells the seller nothing. Check up front so the
  // user gets an actionable message instead of paying gas for a guaranteed revert.
  const ensureEscrowCanPayFallbackFees = async (
    tokenAddress: Address,
    marketplaceAddress: Address
  ) => {
    if (!publicClient) return;

    const requiredTinybars = await fetchRoyaltyFallbackTinybars(tokenAddress);
    if (requiredTinybars === BigInt(0)) return;

    const balanceWeibars = await publicClient.getBalance({ address: marketplaceAddress });
    const balanceTinybars = balanceWeibars / WEIBARS_PER_TINYBAR;
    if (balanceTinybars >= requiredTinybars) return;

    throw new Error(
      `The marketplace escrow (${HEDERA_CONTRACTS.COMIC_MARKETPLACE.address}) holds ` +
        `${rawUnitsToHbar(balanceTinybars.toString())} HBAR but needs at least ` +
        `${rawUnitsToHbar(requiredTinybars.toString())} HBAR to cover this collection's royalty ` +
        `fallback fees. Ask an admin to top up the marketplace contract before listing.`
    );
  };

  // Both escrow entry points - depositAndListForResale and createAuction - hand the NFT to the
  // marketplace, so both need the same two preconditions satisfied first.
  const prepareEscrowDeposit = async (
    tokenAddress: Address,
    serialNumber: number,
    marketplaceAddress: Address
  ) => {
    // Hedera will not let the marketplace pull the NFT out of the seller's account on the
    // strength of the transaction signature alone - it needs an explicit HTS allowance.
    // Grant it via the token's ERC-721 facade, otherwise transferNFT returns a non-SUCCESS
    // code and the contract reverts with "Transfer failed".
    const alreadyApproved = await isMarketplaceApprovedForNft(
      tokenAddress,
      serialNumber,
      marketplaceAddress
    );

    if (!alreadyApproved) {
      setStatusMessage("Approve the marketplace to transfer this NFT...");
      const approvalHash = await writeContractAsync({
        address: tokenAddress,
        abi: HTS_ERC721_ABI,
        functionName: "approve",
        args: [marketplaceAddress, BigInt(serialNumber)],
        account: address,
        chain: publicClient?.chain,
        gas: BigInt(1_000_000),
      });

      setStatusMessage("Waiting for the approval to confirm...");
      const approvalReceipt = await waitForReceipt(approvalHash);
      if (isReceiptFailed(approvalReceipt)) {
        throw new Error(`NFT approval transaction reverted (tx=${approvalHash}).`);
      }
    }

    setStatusMessage("Checking the marketplace can cover this collection's royalty fees...");
    await ensureEscrowCanPayFallbackFees(tokenAddress, marketplaceAddress);
  };

  // The buyer's side of the same HTS rule the escrow deposit hits: an account can only be
  // handed an NFT if it is associated with that token. Most wallets are created with unlimited
  // automatic association (-1) and need nothing, but an account without a free slot would only
  // find out through a bare "NFT transfer failed" revert inside _settleNFT, after paying gas.
  const ensureBuyerAssociated = async (tokenAddress: string) => {
    const normalizedToken = toAddress(tokenAddress);
    const hederaTokenId = toHederaTokenId(tokenAddress);
    if (!normalizedToken || !hederaTokenId || !address) return;

    try {
      const [tokensRes, accountRes] = await Promise.all([
        fetch(`${MIRROR_NODE_BASE}/api/v1/accounts/${address}/tokens?token.id=${hederaTokenId}&limit=1`),
        fetch(`${MIRROR_NODE_BASE}/api/v1/accounts/${address}?limit=1`),
      ]);

      if (tokensRes.ok) {
        const tokensJson = await tokensRes.json();
        if ((tokensJson?.tokens?.length ?? 0) > 0) return;
      }

      if (accountRes.ok) {
        const accountJson = await accountRes.json();
        // -1 is unlimited auto-association, so HTS associates the token on delivery.
        if (Number(accountJson?.max_automatic_token_associations) === -1) return;
      }
    } catch (err) {
      // A mirror node hiccup should not block the purchase - associating twice is harmless.
      console.warn("Could not confirm token association, associating anyway", err);
    }

    setStatusMessage("Associating your wallet with this collection...");
    const associateHash = await writeContractAsync({
      address: normalizedToken,
      abi: HTS_TOKEN_ASSOCIATE_ABI,
      functionName: "associate",
      args: [],
      account: address,
      chain: publicClient?.chain,
      gas: BigInt(900_000),
    });

    setStatusMessage("Waiting for the association to confirm...");
    const associateReceipt = await waitForReceipt(associateHash);
    if (isReceiptFailed(associateReceipt)) {
      throw new Error(`Token association transaction reverted (tx=${associateHash}).`);
    }
  };

  // Handing the NFT out of escrow sends the marketplace no fungible value, so HTS bills the
  // collection's royalty fallback fees to the receiver - the buyer - on top of the sale price.
  // Say so before the wallet prompt instead of after an out-of-funds revert.
  const ensureBuyerCanCoverPurchase = async (tokenAddress: string, priceTinybars: bigint) => {
    if (!publicClient || !address) return;

    const fallbackTinybars = await fetchRoyaltyFallbackTinybars(tokenAddress);
    const requiredTinybars = priceTinybars + fallbackTinybars;
    const balanceTinybars =
      (await publicClient.getBalance({ address })) / WEIBARS_PER_TINYBAR;

    if (balanceTinybars >= requiredTinybars) return;

    throw new Error(
      `This purchase needs about ${rawUnitsToHbar(requiredTinybars.toString())} HBAR ` +
        `(the ${rawUnitsToHbar(priceTinybars.toString())} HBAR price plus this collection's ` +
        `royalty fallback fees) but your wallet holds ` +
        `${rawUnitsToHbar(balanceTinybars.toString())} HBAR.`
    );
  };

  // Releasing an NFT from marketplace escrow - cancelListing returning it to the seller, or
  // purchaseNFT delivering it to the buyer - moves no fungible value to the sender, so HTS
  // charges the collection's HBAR royalty fallback fees to the RECEIVER. When that receiver is a
  // wallet rather than a contract, the charge has to be authorized by the wallet's key, and a
  // transaction submitted through the JSON-RPC relay cannot do that: the HTS precompile answers
  // 326 INVALID_FULL_PREFIX_SIGNATURE_FOR_PRECOMPILE and the contract reverts with a bare
  // "NFT return failed" / "NFT transfer failed".
  //
  // Verified on testnet: cancelListing tx 0xbf13fd0bdcc19e84ae2ff1f753a3f67fd97950e3f2de9c9905784
  // b105586f027 died exactly this way, while depositAndListForResale in the other direction
  // succeeded because the *contract* was the receiver and could authorize its own 1.5 HBAR fee.
  // The deposit's child transfer shows that fee: 0.0.10232416 -1.5 HBAR, 0.0.7225845 +1.5 HBAR.
  //
  // Drop this guard once escrow release no longer settles with a bare transferNFT.
  const ensureEscrowReleaseIsPossible = async (tokenAddress: string) => {
    const fallbackTinybars = await fetchRoyaltyFallbackTinybars(tokenAddress);
    if (fallbackTinybars === BigInt(0)) return;

    throw new Error(
      `Hedera cannot release this NFT from marketplace escrow: the collection charges ` +
        `${rawUnitsToHbar(fallbackTinybars.toString())} HBAR of royalty fallback fees to whoever ` +
        `receives it, and a contract call made over the JSON-RPC relay cannot authorize that ` +
        `charge against a wallet (HTS status 326). The marketplace contract has to settle escrow ` +
        `releases differently before this listing can be cancelled or bought.`
    );
  };

  // Contract state is the only authority on a listing: the mirror node snapshot the UI renders
  // can be stale by the time the buyer confirms, and purchaseNFT compares msg.value against
  // exactly this price.
  const readMarketplaceListing = async (listingId: number) => {
    if (!publicClient) throw new Error("No RPC client available to read the listing.");

    // Bypassing Viem's overly strict ABI type inference, as elsewhere in this hook.
    const listing = (await (publicClient as any).readContract({
      address: normalizeAddress(HEDERA_CONTRACTS.COMIC_MARKETPLACE.evmAddress),
      abi: COMIC_MARKETPLACE_ABI as any,
      functionName: "getListing",
      args: [BigInt(listingId)],
    })) as any[];

    return {
      tokenAddress: String(listing[0]),
      serialNumber: Number(listing[1]),
      seller: String(listing[2]),
      priceTinybars: BigInt(listing[3].toString()),
      isActive: Boolean(listing[4]),
    };
  };

  const createComicCollection = async ({
    episodeId,
    name,
    symbol,
    maxSupply,
    hbarDeposit =50,
    autoRenewPeriod = 7000000,
  }: {
    episodeId: string;
    name: string;
    symbol: string;
    maxSupply: number;
    hbarDeposit?: number;
    autoRenewPeriod?: number;
  }) => {
    try {
      ensureWallet();
      setStatus("processing");
      setError(null);
      setStatusMessage("Confirm collection creation in your wallet...");

      const coreAddress = normalizeAddress(HEDERA_CONTRACTS.COMIC_CORE.evmAddress);

      // ⚠️ DO NOT preflight simulate createComicCollection.
      // Hedera HTS system contract calls (IHederaTokenService) always revert in
      // eth_call / simulateContract because the HTS precompile state is not
      // available during simulation. The tx succeeds on-chain but fails off-chain.
      // Go straight to writeContractAsync.

      const txHashValue = await writeContractAsync({
        address: coreAddress,
        abi: COMIC_CORE_ABI,
        functionName: "createComicCollection",
        args: [
          episodeId,
          name,
          symbol,
          `${name} Collection`,
          BigInt(maxSupply),
          BigInt(autoRenewPeriod),
        ],
        value: hbarToWei(hbarDeposit),
        account: address,
        chain: publicClient?.chain,
        gas: BigInt(15_000_000),
      });

      setTxHash(txHashValue);
      setStatusMessage("Waiting for your transaction to confirm...");
      const receipt = await waitForReceipt(txHashValue);

      if (isReceiptFailed(receipt)) {
        const errMsg = `Transaction reverted creating collection (tx=${txHashValue})`;
        setError(errMsg);
        setStatus("error");
        setStatusMessage(errMsg);
        throw new Error(errMsg);
      }

      const tokenAddress = extractEventArg(receipt, COMIC_CORE_ABI, "CollectionCreated", "tokenAddress");

      // If the event wasn't found in the receipt logs, try the Hedera Mirror Node as a fallback
      let resolvedTokenAddress = tokenAddress;
      if (!resolvedTokenAddress && txHashValue) {
        try {
          const mirrorTx: any = await fetchMirrorTransaction(txHashValue as string);
          const logs = mirrorTx?.logs || mirrorTx?.transactions?.[0]?.logs || [];

          if (Array.isArray(logs) && logs.length > 0) {
            for (const log of logs) {
              try {
                const decoded = decodeEventLog({
                  abi: COMIC_CORE_ABI as any,
                  data: (log.data || log.dataHex) as Hex,
                  topics: (log.topics || log.topicsHex || []) as [Hex, ...Hex[]],
                }) as any;
                if (decoded?.eventName === "CollectionCreated") {
                  const maybe = (decoded?.args as Record<string, unknown> | undefined)?.["tokenAddress"];
                  if (typeof maybe === "string") {
                    resolvedTokenAddress = maybe;
                    break;
                  }
                }
              } catch {
                // ignore decode errors per-log
              }
            }
          }

          // As a last resort, Mirror Node may include a call_result.output / function_result that contains the returned address
          const callOutput = mirrorTx?.call_result?.output || mirrorTx?.function_result?.output || mirrorTx?.transactions?.[0]?.call_result?.output;
          if (!resolvedTokenAddress && typeof callOutput === "string" && callOutput.startsWith("0x")) {
            // Address is right-aligned in a 32-byte return value
            const candidate = `0x${callOutput.slice(-40)}`;
            if (toAddress(candidate)) resolvedTokenAddress = candidate as Address;
          }
        } catch {
          // ignore mirror node errors
        }
      }

      const finalTokenAddress = (resolvedTokenAddress as string) || (tokenAddress as string);
      const normalizedTokenId = toHederaTokenId(finalTokenAddress);

      setStatus("done");
      setStatusMessage("Collection created successfully.");

      return {
        txHash: txHashValue,
        transactionId: txHashValue,
        status: "SUCCESS",
        tokenAddress: resolvedTokenAddress,
        tokenId: normalizedTokenId || resolvedTokenAddress || tokenAddress,
        indexedVia: resolvedTokenAddress ? "mirror-node-fallback" : "wagmi",
      };
    } catch (err: any) {
      const message = err?.message || "Collection creation failed";
      setError(message);
      setStatus("error");
      setStatusMessage(message);
      throw err;
    }
  };

  // const createDirectListing = async ({
  //   episodeId,
  //   quantity,
  //   pricePerNFT,
  //   metadata,
  // }: {
  //   episodeId: string;
  //   quantity: number;
  //   pricePerNFT: number;
  //   metadata: string;
  // }) => {
  //   try {
  //     ensureWallet();
  //     setStatus("processing");
  //     setError(null);
  //     setStatusMessage("Confirm mint and listing in your wallet...");
  //     setMintProgress(0);

  //     const salesAddress = normalizeAddress(HEDERA_CONTRACTS.COMIC_SALES.evmAddress);
  //     const priceInTinybars = hbarToTinybars(pricePerNFT);
  //     const metadataHex = stringToHex(metadata);

  //     const txHashValue = await writeContractAsync({
  //       address: salesAddress,
  //       abi: COMIC_SALES_ABI,
  //       functionName: "createDirectListing",
  //       args: [episodeId, BigInt(quantity), priceInTinybars, metadataHex],
  //       account: address,
  //       chain: publicClient?.chain,
  //     });

  //     setTxHash(txHashValue);
  //     setStatusMessage("Waiting for your transaction to confirm...");
  //     const receipt = await waitForReceipt(txHashValue);
  //     if (isReceiptFailed(receipt)) {
  //       const errMsg = `Transaction reverted during mint/list (tx=${txHashValue})`;
  //       setError(errMsg);
  //       setStatus("error");
  //       setStatusMessage(errMsg);
  //       throw new Error(errMsg);
  //     }

  //     const listingId = extractEventArg(receipt, COMIC_SALES_ABI, "DirectListingCreated", "listingId");

  //     setMintProgress(100);
  //     setStatus("done");
  //     setStatusMessage("NFTs minted and listed successfully.");

  //     return {
  //       txHash: txHashValue,
  //       transactionId: txHashValue,
  //       status: "SUCCESS",
  //       listingId,
  //       totalMinted: quantity,
  //       batches: 1,
  //     };
  //   } catch (err: any) {
  //     const message = err?.message || "Minting and listing failed";
  //     setError(message);
  //     setStatus("error");
  //     setStatusMessage(message);
  //     throw err;
  //   }
  // };
/**
   * Creator: mint NFTs and immediately list them for sale at a fixed price.
   */
  const createDirectListing = async ({
    episodeId,
    quantity,
    pricePerNFT,
    metadata,
  }: {
    episodeId:  string;
    quantity:   number;
    pricePerNFT: number; // in HBAR
    metadata:   string;
  }) => {
    try {
      if (!publicClient) throw new Error("Public client not initialized");
      
     ensureWallet();
     setStatus("processing");
       setError(null);
      setStatusMessage("Confirm mint and listing in your wallet...");
     setMintProgress(0);

        const salesAddress = normalizeAddress(HEDERA_CONTRACTS.COMIC_SALES.evmAddress);
     const priceInTinybars = hbarToTinybars(pricePerNFT);
    const metadataHex = stringToHex(metadata);
      
      const BATCH_SIZE   = 10;
      const totalBatches = Math.ceil(quantity / BATCH_SIZE);
      
      let lastTxHash = "";
      let lastListingId: string | undefined;
      let completedBatches = 0;

      for (let batchStart = 0; batchStart < quantity; batchStart += BATCH_SIZE) {
        const batchEnd      = Math.min(batchStart + BATCH_SIZE, quantity);
        const batchQty      = batchEnd - batchStart;
        const currentBatch  = completedBatches + 1;

        setStatusMessage(`Batch ${currentBatch}/${totalBatches}: Approve in Wallet...`);

        // Execute natively using Wagmi's writeContractAsync
        const hash = await writeContractAsync({
          address: salesAddress as `0x${string}`,
          abi: COMIC_SALES_ABI,
          functionName: 'createDirectListing',
          args: [
            episodeId, 
            BigInt(batchQty), 
            priceInTinybars, 
            metadataHex // Viem equivalent of ethers.toUtf8Bytes
          ],
          account: address,
          chain: publicClient?.chain,
        });

        setTxHash(hash);
        lastTxHash = hash;

        setStatusMessage(`Confirming batch ${currentBatch}/${totalBatches} on-chain...`);
        
        // Wait for the transaction natively using Wagmi/Viem publicClient
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Extract listingId from logs using Viem
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: COMIC_SALES_ABI,
              data: log.data,
              topics: (log as any).topics,
            });
            if ((decoded as any).eventName === 'DirectListingCreated') {
              lastListingId = (decoded as any).args.listingId.toString();
            }
          } catch { /* not the right log */ }
        }

        completedBatches++;
        setMintProgress((completedBatches / totalBatches) * 100);

        if (batchEnd < quantity) {
          await delay(3000); 
        }
      }

      setMintProgress(100);
      setStatus("done");
      setStatusMessage("Direct listing created successfully!");

      return {
        txHash:     lastTxHash,
        status:     "SUCCESS",
        listingId:  lastListingId,
        totalMinted: quantity,
        batches:    totalBatches,
      };
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      setStatusMessage(`Error: ${err.message}`);
      throw err;
    }
  };
  const purchaseFromListing = async ({
    listingId,
    quantity,
    pricePerNFT,
  }: {
    listingId: number;
    quantity: number;
    pricePerNFT: number;  // in HBAR (human-readable, from UI)
  }) => {
    try {
      ensureWallet();
      setStatus("processing");
      setError(null);
      setStatusMessage("Fetching listing price...");

      const salesAddress = normalizeAddress(HEDERA_CONTRACTS.COMIC_SALES.evmAddress);

      // ─── Price unit reconciliation ──────────────────────────────────────────
      // The contract stores pricePerNFT in TINYBARS (8 decimals), set via
      // hbarToTinybars() when createDirectListing was called.
      // msg.value on Hedera JSON-RPC relay must be in WEI (18 decimals).
      //
      // So: msg.value (wei) = pricePerNFT_tinybars × quantity × 10^10
      //   because: 1 HBAR = 10^8 tinybars = 10^18 wei → 1 tinybar = 10^10 wei
      //
      // We read the authoritative on-chain price (in tinybars) and convert.
      // ───────────────────────────────────────────────────────────────────────

      let totalValueWei: bigint;

      try {
        // Read the authoritative price directly from the contract (in tinybars)
        setStatusMessage("Reading listing price from contract...");
        // @ts-ignore - Bypassing Viem's overly strict ABI type inference
        const listingData = await publicClient!.readContract({
          address: salesAddress as `0x${string}`,
          abi: COMIC_SALES_ABI as any,
          functionName: "getDirectListing",
          args: [BigInt(listingId)],
        }) as any[];

        // getDirectListing returns: (episodeId, creator, pricePerNFT, available, isActive)
        const onChainPriceTinybars = BigInt((listingData as any)[2].toString());
        console.debug("purchaseFromListing: on-chain pricePerNFT (tinybars)=", onChainPriceTinybars);

        // Convert tinybars → wei: multiply by 10^10
        // 1 tinybar = 10^10 wei  (because 1 HBAR = 10^8 tinybars = 10^18 wei)
        const TINYBARS_TO_WEI = BigInt("10000000000"); // 10^10
        totalValueWei = onChainPriceTinybars * BigInt(quantity) * TINYBARS_TO_WEI;
        console.debug("purchaseFromListing: totalValue (wei)=", totalValueWei);

      } catch (readErr) {
        // Fallback: convert the UI HBAR price directly to wei
        console.warn("purchaseFromListing: could not read on-chain price, falling back to UI price", readErr);
        totalValueWei = hbarToWei(pricePerNFT * quantity);
        console.debug("purchaseFromListing: totalValue (wei) fallback=", totalValueWei);
      }

      setStatusMessage("Confirm your purchase in your wallet...");
      const txHashValue = await writeContractAsync({
        address: salesAddress,
        abi: COMIC_SALES_ABI,
        functionName: "purchaseFromListing",
        args: [BigInt(listingId), BigInt(quantity)],
        value: totalValueWei,
        account: address,
        chain: publicClient?.chain,
        gas: BigInt(5_000_000 + quantity * 500_000),
      });

      setTxHash(txHashValue);
      setStatusMessage("Waiting for your transaction to confirm...");
      await waitForReceipt(txHashValue);

      setStatus("done");
      setStatusMessage("Purchase completed successfully.");

      return { txHash: txHashValue, transactionId: txHashValue, status: "SUCCESS" };
    } catch (err: any) {
      const message = err?.message || "Purchase failed";
      setError(message);
      setStatus("error");
      setStatusMessage(message);
      throw err;
    }
  };

  const listForResale = async ({
    tokenAddress,
    serialNumber,
    priceInHbar,
  }: {
    tokenAddress: string;
    serialNumber: number;
    priceInHbar: number;
  }) => {
    try {
      ensureWallet();

      const normalizedTokenAddress = toAddress(tokenAddress);
      if (!normalizedTokenAddress) {
        throw new Error("A valid EVM token address is required to list this NFT.");
      }
      if (!Number.isSafeInteger(serialNumber) || serialNumber <= 0) {
        throw new Error("A valid NFT serial number is required to list this NFT.");
      }
      if (!Number.isFinite(priceInHbar) || priceInHbar <= 0) {
        throw new Error("Enter a resale price greater than zero.");
      }

      setStatus("processing");
      setError(null);

      const marketplaceAddress = normalizeAddress(HEDERA_CONTRACTS.COMIC_MARKETPLACE.evmAddress);

      await prepareEscrowDeposit(normalizedTokenAddress, serialNumber, marketplaceAddress);

      setStatusMessage("Confirm the resale listing in your wallet...");
      const hash = await writeContractAsync({
        address: marketplaceAddress,
        abi: COMIC_MARKETPLACE_ABI,
        functionName: "depositAndListForResale",
        // The stored price is compared against msg.value, and msg.value inside the Hedera EVM
        // is denominated in TINYBARS - the relay divides the 18dp transaction value by 10^10
        // before execution. Storing weibars here makes the listing cost 10^10x its face value,
        // and no purchase can then satisfy the "Insufficient payment" require.
        args: [normalizedTokenAddress, BigInt(serialNumber), hbarToTinybars(priceInHbar)],
        account: address,
        chain: publicClient?.chain,
        gas: BigInt(5_000_000),
      });

      setTxHash(hash);
      setStatusMessage("Waiting for the resale listing to confirm...");
      const receipt = await waitForReceipt(hash);
      if (isReceiptFailed(receipt)) {
        throw new Error(`Resale listing transaction reverted (tx=${hash}).`);
      }

      const listingId = extractEventArg(receipt, COMIC_MARKETPLACE_ABI, "NFTListed", "listingId");
      setStatus("done");
      setStatusMessage("NFT listed for resale successfully.");
      return { txHash: hash, transactionId: hash, listingId, status: "SUCCESS" };
    } catch (err: any) {
      const message = err?.message || "Resale listing failed";
      setError(message);
      setStatus("error");
      setStatusMessage(message);
      throw err;
    }
  };

  const executeMarketplaceTransaction = async ({
    functionName,
    args,
    value,
    successMessage,
  }: {
    functionName: string;
    args: readonly unknown[];
    value?: bigint;
    successMessage: string;
  }) => {
    ensureWallet();
    setStatus("processing");
    setError(null);
    setStatusMessage("Confirm the transaction in your wallet...");

    const marketplaceAddress = normalizeAddress(HEDERA_CONTRACTS.COMIC_MARKETPLACE.evmAddress);
    const hash = await writeContractAsync({
      address: marketplaceAddress,
      abi: COMIC_MARKETPLACE_ABI,
      functionName: functionName as any,
      args: args as any,
      ...(value === undefined ? {} : { value }),
      account: address,
      chain: publicClient?.chain,
      gas: BigInt(5_000_000),
    } as any);

    setTxHash(hash);
    setStatusMessage("Waiting for the transaction to confirm...");
    const receipt = await waitForReceipt(hash);
    if (isReceiptFailed(receipt)) {
      throw new Error(`Marketplace transaction reverted (tx=${hash}).`);
    }

    setStatus("done");
    setStatusMessage(successMessage);
    return { txHash: hash, transactionId: hash, status: "SUCCESS" };
  };

  /**
   * Buy an edition another holder put up for resale.
   *
   * `priceTinybars` / `tokenAddress` are the values the caller already read from the mirror
   * node; they are only a fallback for when the contract read fails, because the contract's
   * own copy of the listing is what purchaseNFT checks.
   */
  const purchaseResaleListing = async ({
    listingId,
    priceTinybars,
    tokenAddress,
  }: {
    listingId: number;
    priceTinybars?: string;
    tokenAddress?: string;
  }) => {
    try {
      ensureWallet();
      if (!Number.isSafeInteger(listingId) || listingId < 0) {
        throw new Error("A valid listing ID is required to buy this NFT.");
      }

      setStatus("processing");
      setError(null);
      setStatusMessage("Reading the listing from the contract...");

      const marketplaceAddress = normalizeAddress(HEDERA_CONTRACTS.COMIC_MARKETPLACE.evmAddress);

      const listing = await readMarketplaceListing(listingId).catch((readErr) => {
        console.warn("purchaseResaleListing: could not read the listing on-chain", readErr);
        return null;
      });

      if (listing && !listing.isActive) {
        throw new Error("This listing is no longer active - it was already sold or cancelled.");
      }
      if (listing && address && listing.seller.toLowerCase() === address.toLowerCase()) {
        throw new Error("This is your own listing. Cancel it instead of buying it.");
      }

      const rawPriceTinybars =
        listing?.priceTinybars ?? (priceTinybars ? BigInt(priceTinybars) : null);
      if (rawPriceTinybars === null || rawPriceTinybars <= BigInt(0)) {
        throw new Error("Could not read this listing's price from the marketplace contract.");
      }
      if (rawPriceTinybars > MAX_SANE_LISTING_TINYBARS) {
        throw new Error(
          "This listing's price was recorded in the wrong unit by an earlier build of the app, " +
            "so it cannot be paid. The seller needs to cancel the listing and list it again."
        );
      }

      const listingToken = listing?.tokenAddress || tokenAddress;
      if (listingToken) {
        setStatusMessage("Checking your wallet can receive this NFT...");
        await ensureEscrowReleaseIsPossible(listingToken);
        await ensureBuyerAssociated(listingToken);
        await ensureBuyerCanCoverPurchase(listingToken, rawPriceTinybars);
      }

      // The contract holds the price in tinybars; the value crossing the JSON-RPC relay is
      // 18dp weibars, so scale up by 10^10. See the unit-scale note in CLAUDE.md.
      setStatusMessage("Confirm the purchase in your wallet...");
      const hash = await writeContractAsync({
        address: marketplaceAddress,
        abi: COMIC_MARKETPLACE_ABI,
        functionName: "purchaseNFT",
        args: [BigInt(listingId)],
        value: rawPriceTinybars * WEIBARS_PER_TINYBAR,
        account: address,
        chain: publicClient?.chain,
        gas: BigInt(5_000_000),
      });

      setTxHash(hash);
      setStatusMessage("Waiting for the purchase to confirm...");
      const receipt = await waitForReceipt(hash);
      if (isReceiptFailed(receipt)) {
        throw new Error(`Purchase transaction reverted (tx=${hash}).`);
      }

      setStatus("done");
      setStatusMessage("Purchase completed successfully.");
      return { txHash: hash, transactionId: hash, status: "SUCCESS" };
    } catch (err: any) {
      const message = err?.message || "Purchase failed";
      setError(message);
      setStatus("error");
      setStatusMessage(message);
      throw err;
    }
  };

  /**
   * Withdraw your own resale listing. cancelListing returns the escrowed NFT to the seller, and
   * because that transfer sends the marketplace no fungible value, HTS charges the collection's
   * royalty fallback fees to the seller receiving it back - so the caller needs a little HBAR
   * on hand beyond gas.
   */
  const cancelResaleListing = async (listingId: number) => {
    if (!Number.isSafeInteger(listingId) || listingId < 0) {
      throw new Error("A valid listing ID is required to cancel this listing.");
    }

    const listing = await readMarketplaceListing(listingId).catch((readErr) => {
      console.warn("cancelResaleListing: could not read the listing on-chain", readErr);
      return null;
    });
    if (listing?.tokenAddress) await ensureEscrowReleaseIsPossible(listing.tokenAddress);

    return executeMarketplaceTransaction({
      functionName: "cancelListing",
      args: [BigInt(listingId)],
      successMessage: "Listing cancelled and the NFT returned to your wallet.",
    });
  };

  const createOffer = async ({ listingId, amountInHbar, expiresAt }: {
    listingId: number;
    amountInHbar: number;
    expiresAt: number;
  }) => {
    if (!Number.isSafeInteger(listingId) || listingId < 0) throw new Error("A valid listing ID is required.");
    if (!Number.isFinite(amountInHbar) || amountInHbar <= 0) throw new Error("Offer amount must be greater than zero.");
    if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
      throw new Error("Offer expiry must be in the future.");
    }
    return executeMarketplaceTransaction({
      functionName: "createOffer",
      args: [BigInt(listingId), BigInt(expiresAt)],
      value: hbarToWei(amountInHbar),
      successMessage: "Offer submitted successfully.",
    });
  };

  const cancelOffer = (offerId: number) => executeMarketplaceTransaction({
    functionName: "cancelOffer", args: [BigInt(offerId)], successMessage: "Offer cancelled and funds returned.",
  });
  const acceptOffer = (offerId: number) => executeMarketplaceTransaction({
    functionName: "acceptOffer", args: [BigInt(offerId)], successMessage: "Offer accepted successfully.",
  });
  const rejectOffer = (offerId: number) => executeMarketplaceTransaction({
    functionName: "rejectOffer", args: [BigInt(offerId)], successMessage: "Offer rejected and funds returned.",
  });
  const expireOffer = (offerId: number) => executeMarketplaceTransaction({
    functionName: "expireOffer", args: [BigInt(offerId)], successMessage: "Expired offer funds returned.",
  });

  const createAuction = async ({ tokenAddress, serialNumber, reservePriceInHbar, durationInSeconds }: {
    tokenAddress: string;
    serialNumber: number;
    reservePriceInHbar: number;
    durationInSeconds: number;
  }) => {
    const normalizedTokenAddress = toAddress(tokenAddress);
    if (!normalizedTokenAddress) throw new Error("A valid EVM token address is required to create an auction.");
    if (!Number.isSafeInteger(serialNumber) || serialNumber <= 0) throw new Error("A valid NFT serial number is required.");
    if (!Number.isFinite(reservePriceInHbar) || reservePriceInHbar < 0) throw new Error("Reserve price cannot be negative.");
    if (!Number.isSafeInteger(durationInSeconds) || durationInSeconds <= 0) throw new Error("Auction duration must be positive.");

    ensureWallet();
    setStatus("processing");
    setError(null);
    await prepareEscrowDeposit(
      normalizedTokenAddress,
      serialNumber,
      normalizeAddress(HEDERA_CONTRACTS.COMIC_MARKETPLACE.evmAddress)
    );

    return executeMarketplaceTransaction({
      functionName: "createAuction",
      // The reserve is stored and then compared against a bid's msg.value, which the EVM sees
      // in TINYBARS - same rule as a resale listing's price. Storing weibars here puts the
      // reserve 10^10 out of reach and every bid comes back "Bid too low".
      args: [normalizedTokenAddress, BigInt(serialNumber), hbarToTinybars(reservePriceInHbar), BigInt(durationInSeconds)],
      successMessage: "Auction created successfully.",
    });
  };

  const placeBid = async ({ auctionId, amountInHbar }: { auctionId: number; amountInHbar: number }) => {
    if (!Number.isSafeInteger(auctionId) || auctionId < 0) throw new Error("A valid auction ID is required.");
    if (!Number.isFinite(amountInHbar) || amountInHbar <= 0) throw new Error("Bid amount must be greater than zero.");
    return executeMarketplaceTransaction({
      functionName: "placeBid", args: [BigInt(auctionId)], value: hbarToWei(amountInHbar), successMessage: "Bid submitted successfully.",
    });
  };

  const settleAuction = (auctionId: number) => executeMarketplaceTransaction({
    functionName: "settleAuction", args: [BigInt(auctionId)], successMessage: "Auction settled successfully.",
  });
  const cancelAuction = (auctionId: number) => executeMarketplaceTransaction({
    functionName: "cancelAuction", args: [BigInt(auctionId)], successMessage: "Auction cancelled successfully.",
  });

  const createCampaign = async ({
    episodeId,
    campaignType,
    mintPrice,
    maxSupply,
    maxPerWallet,
    metadata,
  }: {
    episodeId: string;
    campaignType: CampaignType;
    mintPrice: number;
    maxSupply: number;
    maxPerWallet: number;
    metadata: string;
  }) => {
    try {
      ensureWallet();
      setStatus("processing");
      setError(null);
      setStatusMessage("Confirm campaign creation...");

      const salesAddress = normalizeAddress(HEDERA_CONTRACTS.COMIC_SALES.evmAddress);
      const priceInTinybars = hbarToTinybars(mintPrice);

      const txHashValue = await writeContractAsync({
        address: salesAddress as `0x${string}`,
        abi: COMIC_SALES_ABI as any,
        functionName: "createCampaign",
        args: [
          episodeId,
          Number(campaignType),
          priceInTinybars,
          BigInt(maxSupply),
          BigInt(maxPerWallet),
          stringToHex(metadata),
        ],
        account: address,
        chain: publicClient?.chain,
      });

      setTxHash(txHashValue);
      setStatusMessage("Waiting for your transaction to confirm...");
      const receipt = await waitForReceipt(txHashValue);
      if (isReceiptFailed(receipt)) {
        const errMsg = `Transaction reverted during campaign creation (tx=${txHashValue})`;
        setError(errMsg);
        setStatus("error");
        setStatusMessage(errMsg);
        throw new Error(errMsg);
      }

      const campaignId = extractEventArg(receipt, COMIC_SALES_ABI, "CampaignCreated", "campaignId");

      setStatus("done");
      setStatusMessage("Campaign created successfully.");

      return { txHash: txHashValue, transactionId: txHashValue, status: "SUCCESS", campaignId };
    } catch (err: any) {
      const message = err?.message || "Campaign creation failed";
      setError(message);
      setStatus("error");
      setStatusMessage(message);
      throw err;
    }
  };

  const addToWhitelist = async ({
    campaignId,
    addresses,
    allocations,
  }: {
    campaignId: number;
    addresses: string[];
    allocations: number[];
  }) => {
    try {
      ensureWallet();
      setStatus("processing");
      setError(null);
      setStatusMessage("Confirm whitelist update...");

      const salesAddress = normalizeAddress(HEDERA_CONTRACTS.COMIC_SALES.evmAddress);
      const txHashValue = await writeContractAsync({
        address: salesAddress,
        abi: COMIC_SALES_ABI,
        functionName: "addToWhitelist",
        args: [BigInt(campaignId), addresses as Address[], allocations.map((value) => BigInt(value))],
        account: address,
        chain: publicClient?.chain,
      });

      setTxHash(txHashValue);
      const receipt = await waitForReceipt(txHashValue);
      if (isReceiptFailed(receipt)) {
        const errMsg = `Transaction reverted while updating whitelist (tx=${txHashValue})`;
        setError(errMsg);
        setStatus("error");
        setStatusMessage(errMsg);
        throw new Error(errMsg);
      }

      setStatus("done");
      setStatusMessage("Whitelist updated successfully.");
      return { txHash: txHashValue, transactionId: txHashValue, status: "SUCCESS" };
    } catch (err: any) {
      const message = err?.message || "Whitelist update failed";
      setError(message);
      setStatus("error");
      setStatusMessage(message);
      throw err;
    }
  };

  const addPhase = async ({
    campaignId,
    phaseType,
    startTime,
    endTime,
    mintPrice,
    maxPerWallet,
    phaseSupply,
  }: {
    campaignId: number;
    phaseType: PhaseType;
    startTime: number;
    endTime: number;
    mintPrice: number;
    maxPerWallet: number;
    phaseSupply: number;
  }) => {
    try {
      ensureWallet();
      setStatus("processing");
      setError(null);
      setStatusMessage("Confirm phase creation...");

      const salesAddress = normalizeAddress(HEDERA_CONTRACTS.COMIC_SALES.evmAddress);
      const priceInTinybars = hbarToTinybars(mintPrice);
      const txHashValue = await writeContractAsync({
        address: salesAddress,
        abi: COMIC_SALES_ABI,
        functionName: "addPhase",
        args: [
          BigInt(campaignId),
          Number(phaseType),
          BigInt(startTime),
          BigInt(endTime),
          priceInTinybars,
          BigInt(maxPerWallet),
          BigInt(phaseSupply),
        ],
        account: address,
        chain: publicClient?.chain,
      });

      setTxHash(txHashValue);
      const receipt = await waitForReceipt(txHashValue);
      if (isReceiptFailed(receipt)) {
        const errMsg = `Transaction reverted while adding phase (tx=${txHashValue})`;
        setError(errMsg);
        setStatus("error");
        setStatusMessage(errMsg);
        throw new Error(errMsg);
      }

      const phaseId = extractEventArg(receipt, COMIC_SALES_ABI, "PhaseAdded", "phaseId");

      setStatus("done");
      setStatusMessage("Phase created successfully.");
      return { txHash: txHashValue, transactionId: txHashValue, status: "SUCCESS", phaseId };
    } catch (err: any) {
      const message = err?.message || "Phase creation failed";
      setError(message);
      setStatus("error");
      setStatusMessage(message);
      throw err;
    }
  };

  const mintFromCampaign = async ({
    campaignId,
    phaseId = 0,
    quantity,
    mintPrice,
  }: {
    campaignId: number;
    phaseId?: number;
    quantity: number;
    mintPrice: number;  // in HBAR (human-readable, from UI)
  }) => {
    try {
      ensureWallet();
      setStatus("processing");
      setError(null);
      setStatusMessage("Fetching campaign price...");

      const salesAddress = normalizeAddress(HEDERA_CONTRACTS.COMIC_SALES.evmAddress);

      // ─── Price unit reconciliation ──────────────────────────────────────────
      // Campaign mintPrice is stored in TINYBARS (8 decimals) inside the contract.
      // msg.value on Hedera JSON-RPC relay must be in WEI (18 decimals).
      // Conversion: 1 tinybar = 10^10 wei
      // ───────────────────────────────────────────────────────────────────────

      let totalValue: bigint;

      try {
        setStatusMessage("Reading campaign price from contract...");
        // @ts-ignore - Bypassing Viem's overly strict ABI type inference
        const campaignData = await publicClient!.readContract({
          address: salesAddress as  `0x${string}`,
          abi: COMIC_SALES_ABI as any,
          functionName: "getCampaign",
          args: [BigInt(campaignId)],
        }) as any[];

        // getCampaign returns: (episodeId, creator, campaignType, mintPrice, maxSupply, totalMinted, isActive)
        const onChainPriceTinybars = BigInt(campaignData[3].toString());
        const TINYBARS_TO_WEI = BigInt("10000000000"); // 10^10
        totalValue = onChainPriceTinybars * BigInt(quantity) * TINYBARS_TO_WEI;
        console.debug("mintFromCampaign: on-chain price (tinybars)=", onChainPriceTinybars, "totalValue (wei)=", totalValue);

      } catch (readErr) {
        console.warn("mintFromCampaign: could not read on-chain price, falling back to UI price", readErr);
        totalValue = hbarToWei(mintPrice * quantity);
      }

      setStatusMessage("Confirm mint in your wallet...");
      const txHashValue = await writeContractAsync({
        address: salesAddress,
        abi: COMIC_SALES_ABI,
        functionName: "mint",
        args: [BigInt(campaignId), BigInt(phaseId), BigInt(quantity)],
        value: totalValue,
        account: address,
        chain: publicClient?.chain,
        gas: BigInt(4_000_000 + quantity * 500_000),
      });

      setTxHash(txHashValue);
      const receipt = await waitForReceipt(txHashValue);

      if (isReceiptFailed(receipt)) {
        const errMsg = `Transaction reverted during mint (tx=${txHashValue})`;
        setError(errMsg);
        setStatus("error");
        setStatusMessage(errMsg);
        throw new Error(errMsg);
      }

      setStatus("done");
      setStatusMessage("Mint completed successfully.");
      return { txHash: txHashValue, transactionId: txHashValue, status: "SUCCESS" };
    } catch (err: any) {
      const message = err?.message || "Mint failed";
      setError(message);
      setStatus("error");
      setStatusMessage(message);
      throw err;
    }
  };

  return useMemo(
    () => ({
      status,
      error,
      txHash,
      statusMessage,
      mintProgress,
      isProcessing: status === "processing" || isWritePending,
      isConfirming: isConfirming || Boolean(pendingHash),
      isConnected,
      address,
      createComicCollection,
      createDirectListing,
      purchaseFromListing,
      listForResale,
      purchaseResaleListing,
      cancelResaleListing,
      createOffer,
      cancelOffer,
      acceptOffer,
      rejectOffer,
      expireOffer,
      createAuction,
      placeBid,
      settleAuction,
      cancelAuction,
      createCampaign,
      addToWhitelist,
      addPhase,
      mintFromCampaign,
    }),
    [
      address,
      error,
      isConfirming,
      isConnected,
      isWritePending,
      mintProgress,
      pendingHash,
      status,
      statusMessage,
      txHash,
      createOffer,
      cancelOffer,
      acceptOffer,
      rejectOffer,
      expireOffer,
      createAuction,
      placeBid,
      settleAuction,
      cancelAuction,
    ]
  );
}

export default useWagmiMarketplace;