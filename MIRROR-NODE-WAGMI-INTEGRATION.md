# Mirror Node + Wagmi Integration Guide

## Quick Answer

**YES! Mirror Node contract calls work perfectly with wagmi integration.**

Here's the strategy:
- **Mirror Node Reads** → Use Mirror Node API for view functions (read-only, cost-free)
- **Contract Writes** → Use Wagmi + Hedera SDK (state changes, costs gas)

---

## 🏗️ Architecture

```
Your Component
    ↓
    ├─ Read Data (Mirror Node)
    │  └─ useReadContract() or Mirror Node API
    │     ├─ Works with both EVM and Hedera wallets
    │     ├─ Read-only, no gas cost
    │     └─ Same query for all wallet types
    │
    └─ Write Operations (Wagmi/SDK)
       └─ useWagmiComicContract()
          ├─ Detects wallet type
          ├─ Routes to wagmi (EVM) or Hedera SDK (Hedera)
          ├─ Automatic routing
          └─ Costs gas/HBAR
```

---

## 📋 Implementation Pattern

### Pattern 1: Read-Only Data from Mirror Node

```tsx
'use client';

import { useReadContract } from 'wagmi';
import { HEDERA_CONTRACTS, COMIC_CORE_ABI } from '@/contracts/HederaContractConfig';
import { useWalletDetector } from '@/hook/useWalletDetector';

export function ReadComicData({ episodeId }: { episodeId: string }) {
  const wallet = useWalletDetector();

  // ✅ Read contract state from Mirror Node
  // Works for BOTH Ethereum and Hedera wallets
  const { data: episodeData, isLoading: isReadingData } = useReadContract({
    address: HEDERA_CONTRACTS.COMIC_CORE.evmAddress as `0x${string}`,
    abi: COMIC_CORE_ABI,
    functionName: 'episodes',
    args: [episodeId],
    enabled: wallet.isConnected, // Only read when wallet is connected
  });

  if (isReadingData) return <div>Loading comic data...</div>;

  return (
    <div>
      <h2>{episodeData?.name}</h2>
      <p>Supply: {episodeData?.currentSupply} / {episodeData?.maxSupply}</p>
    </div>
  );
}
```

### Pattern 2: Mirror Node API for Complex Queries

```tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Episode {
  episodeId: string;
  name: string;
  maxSupply: number;
  currentSupply: number;
  tokenAddress: string;
}

export function ListEpisodes() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEpisodes = async () => {
      setIsLoading(true);
      try {
        // Query Mirror Node for contract data
        const response = await axios.get(
          `https://testnet.mirrornode.hedera.com/api/v1/contracts/${HEDERA_CONTRACTS.COMIC_CORE.evmAddress}/result`
        );

        // Parse and filter episodes
        const episodes: Episode[] = response.data.results || [];
        setEpisodes(episodes);
      } catch (error) {
        console.error('Failed to fetch episodes from Mirror Node:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEpisodes();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {episodes.map((episode) => (
        <div key={episode.episodeId}>
          <h3>{episode.name}</h3>
          <p>{episode.currentSupply} / {episode.maxSupply} minted</p>
        </div>
      ))}
    </div>
  );
}
```

### Pattern 3: Hybrid - Read + Write in One Component

```tsx
'use client';

import { useReadContract } from 'wagmi';
import { useWalletDetector } from '@/hook/useWalletDetector';
import { useWagmiComicContract } from '@/hook/useWagmiComicContract';
import { HEDERA_CONTRACTS, COMIC_CORE_ABI } from '@/contracts/HederaContractConfig';
import { useState } from 'react';

export function ComicPurchaseComponent({ episodeId }: { episodeId: string }) {
  const wallet = useWalletDetector();
  const [isPurchasing, setIsPurchasing] = useState(false);

  // ✅ STEP 1: Read data from Mirror Node (works for both wallets)
  const { data: episodeData, isLoading: isReadingData } = useReadContract({
    address: HEDERA_CONTRACTS.COMIC_CORE.evmAddress as `0x${string}`,
    abi: COMIC_CORE_ABI,
    functionName: 'episodes',
    args: [episodeId],
    enabled: wallet.isConnected,
  });

  // ✅ STEP 2: Contract write (automatically routes to correct wallet)
  const { buyNFTFromMarketplace, isProcessing: isWriting } = useWagmiComicContract();

  const handlePurchase = async () => {
    if (!wallet.isConnected) {
      alert('Connect wallet first');
      return;
    }

    setIsPurchasing(true);
    try {
      // This automatically uses the correct wallet implementation
      await buyNFTFromMarketplace(
        BigInt(1), // listingId
        BigInt(episodeData?.price || 0)
      );
      alert('✅ Purchase successful!');
    } catch (err) {
      alert('❌ Purchase failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!wallet.isConnected) {
    return <p>Please connect wallet</p>;
  }

  if (isReadingData) {
    return <p>Loading comic info...</p>;
  }

  return (
    <div>
      <h2>{episodeData?.name}</h2>
      <p>Price: {Number(episodeData?.price || 0) / 100_000_000} HBAR</p>
      <p>Remaining: {episodeData?.currentSupply}</p>
      
      <button
        onClick={handlePurchase}
        disabled={isWriting || isPurchasing}
      >
        {isPurchasing ? 'Processing...' : 'Buy Now'}
      </button>
    </div>
  );
}
```

---

## 🔍 Mirror Node Endpoints

### Available for Reading Comics

```typescript
// Get contract data
GET https://testnet.mirrornode.hedera.com/api/v1/contracts/{contractAddress}

// Get token information
GET https://testnet.mirrornode.hedera.com/api/v1/tokens/{tokenAddress}

// Get NFT transfers
GET https://testnet.mirrornode.hedera.com/api/v1/tokens/{tokenAddress}/nfts

// Get account info
GET https://testnet.mirrornode.hedera.com/api/v1/accounts/{accountId}

// Get contract results
GET https://testnet.mirrornode.hedera.com/api/v1/contracts/{contractAddress}/result
```

### Helper Hook for Mirror Node Queries

```tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const MIRROR_NODE_BASE =
  process.env.NEXT_PUBLIC_NETWORK === 'mainnet'
    ? 'https://mainnet-public.mirrornode.hedera.com/api/v1'
    : 'https://testnet.mirrornode.hedera.com/api/v1';

export function useMirrorNodeQuery<T>(
  endpoint: string,
  enabled: boolean = true,
  refetchInterval?: number
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${MIRROR_NODE_BASE}${endpoint}`);
        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Optional: refetch at intervals
    if (refetchInterval) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [endpoint, enabled, refetchInterval]);

  return { data, isLoading, error };
}

// Usage:
export function ComicStats({ episodeId }: { episodeId: string }) {
  const { data: tokenData } = useMirrorNodeQuery(
    `/tokens/${episodeId}`,
    true,
    30000 // Refresh every 30 seconds
  );

  return <div>{tokenData?.name}</div>;
}
```

---

## 🎯 Real-World Example: Comic Marketplace

```tsx
'use client';

import { useReadContract } from 'wagmi';
import { useWalletDetector, WalletType } from '@/hook/useWalletDetector';
import { useWagmiComicContract } from '@/hook/useWagmiComicContract';
import { useWalletAwareTransaction } from '@/hook/useWalletAwareTransaction';
import { HEDERA_CONTRACTS, COMIC_MARKETPLACE_ABI } from '@/contracts/HederaContractConfig';
import { useState } from 'react';

interface Listing {
  listingId: bigint;
  tokenAddress: string;
  serialNumber: bigint;
  seller: string;
  price: bigint;
  isActive: boolean;
}

export function MarketplaceComponent() {
  const wallet = useWalletDetector();
  const txExecutor = useWalletAwareTransaction();
  const { buyNFTFromMarketplace } = useWagmiComicContract();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // ✅ Step 1: Read listings from Mirror Node (no gas cost)
  const { data: listings, isLoading: isLoadingListings } = useReadContract({
    address: HEDERA_CONTRACTS.COMIC_MARKETPLACE.evmAddress as `0x${string}`,
    abi: COMIC_MARKETPLACE_ABI,
    functionName: 'getActiveListings',
    enabled: wallet.isConnected,
  });

  // ✅ Step 2: Purchase when user clicks (uses wagmi)
  const handleBuy = async (listing: Listing) => {
    const result = await txExecutor.execute(
      async () => {
        return await buyNFTFromMarketplace(
          listing.listingId,
          listing.price
        );
      },
      {
        name: `Buy Comic Serial #${listing.serialNumber}`,
        onConfirm: (hash) => {
          console.log('✅ Purchased:', hash);
          setSelectedListing(null);
          // Refetch listings
        },
        onError: (err) => {
          console.error('❌ Purchase failed:', err.message);
        }
      }
    );

    return result;
  };

  if (!wallet.isConnected) {
    return <p>Connect wallet to view marketplace</p>;
  }

  if (isLoadingListings) {
    return <p>Loading listings...</p>;
  }

  return (
    <div>
      <h2>Comic Marketplace</h2>
      
      {/* Display listings from Mirror Node */}
      {listings?.map((listing: Listing) => (
        <div key={Number(listing.listingId)} className="listing-card">
          <h3>Comic #{listing.serialNumber.toString()}</h3>
          <p>Price: {Number(listing.price) / 100_000_000} HBAR</p>
          <p>Seller: {listing.seller.slice(0, 10)}...</p>
          
          <button
            onClick={() => handleBuy(listing)}
            disabled={!wallet.isConnected}
          >
            Buy Now
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 📊 Data Flow Diagram

```
Component Mounts
    ↓
    ├─ useReadContract() (Mirror Node Read)
    │  └─ Fetch episode data (read-only)
    │     └─ Data loaded, displayed to user
    │
    └─ User clicks "Buy"
       └─ useWagmiComicContract() (Transaction)
          ├─ Detect wallet type
          ├─ Route to wagmi (EVM) or SDK (Hedera)
          ├─ Execute transaction
          └─ Update local state
```

---

## 🔧 Setup Steps

### 1. Install Required Dependencies

```bash
pnpm add viem@2.x wagmi@2.x axios
```

### 2. Configure Contracts

Update `.env.local`:
```env
NEXT_PUBLIC_COMIC_CORE_EVM_ADDRESS=0x...
NEXT_PUBLIC_COMIC_MARKETPLACE_EVM_ADDRESS=0x...
NEXT_PUBLIC_COMIC_SALES_EVM_ADDRESS=0x...
NEXT_PUBLIC_NETWORK=testnet
```

### 3. Use in Components

```tsx
import { useReadContract } from 'wagmi';
import { useWagmiComicContract } from '@/hook/useWagmiComicContract';

// Read + Write
const { data } = useReadContract({ ... });
const { buyNFTFromMarketplace } = useWagmiComicContract();
```

---

## ✅ Common Patterns

### Pattern A: Display Data + Allow Purchase

```tsx
const { data: episodeData } = useReadContract({
  functionName: 'episodes',
  args: [episodeId],
});

const handleBuy = async () => {
  await buyNFTFromMarketplace(listingId, episodeData.price);
};
```

### Pattern B: Real-time Updates

```tsx
// Refetch periodically
const { data, refetch } = useReadContract({
  functionName: 'episodes',
  args: [episodeId],
});

// After purchase, refetch data
const handleBuy = async () => {
  await buyNFTFromMarketplace(...);
  refetch(); // Refresh data from Mirror Node
};
```

### Pattern C: Check Permissions

```tsx
const { data: canRead } = useReadContract({
  functionName: 'canReadByToken',
  args: [tokenAddress, userAddress],
});

return canRead ? <Reader /> : <NeedToPurchase />;
```

---

## 🚨 Important Notes

1. **Mirror Node is Read-Only**
   - Use it for querying data
   - Cannot execute transactions directly
   - Free and fast

2. **Wagmi is for Writes**
   - Execute state-changing functions
   - Requires transaction signing
   - Costs gas/HBAR

3. **Wallet Detection is Automatic**
   - No need to check wallet type in contract calls
   - Hooks handle routing internally
   - Same API for both EVM and Hedera

4. **Combine Both for Best Results**
   - Read data from Mirror Node
   - Write transactions using wagmi
   - Get best performance and UX

---

## 📝 Migration Checklist

For each component:

- [ ] Identify read operations (fetch data)
- [ ] Replace with `useReadContract()` from wagmi
- [ ] Identify write operations (state changes)
- [ ] Replace with `useWagmiComicContract()`
- [ ] Add wallet detection with `useWalletDetector()`
- [ ] Test both wallet types
- [ ] Verify Mirror Node queries work
- [ ] Verify transactions execute properly

This hybrid approach gives you:
✅ Fast data reads (Mirror Node)
✅ Automatic wallet routing (Wagmi)
✅ No manual conditional logic
✅ Works for both EVM and Hedera wallets
