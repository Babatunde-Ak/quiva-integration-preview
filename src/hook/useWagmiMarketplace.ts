
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
  COMIC_SALES_ABI,
  HEDERA_CONTRACTS,
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
  return /^0x[a-fA-F0-9]{40}$/.test(value) ? (value as Address) : undefined;
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

  const createComicCollection = async ({
    episodeId,
    name,
    symbol,
    maxSupply,
    hbarDeposit = 80,
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
    ]
  );
}

export default useWagmiMarketplace;