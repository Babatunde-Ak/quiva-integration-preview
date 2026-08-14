# Wagmi Integration: Component Usage Guide

## 📋 Quick Answer: Mirror Node + Wagmi

**Yes, Mirror Node contract calls work with wagmi integration!** Here's how:

### Mirror Node + Wagmi Strategy

```tsx
// Mirror Node reads (view functions) - work with both wallets
const { data: collectionData } = useReadContract({
  address: HEDERA_CONTRACTS.COMIC_CORE.evmAddress,
  abi: COMIC_CORE_ABI,
  functionName: 'episodes',
  args: [episodeId],
});

// Write operations (state changes) - use useWagmiComicContract
const { createComicCollection } = useWagmiComicContract();
await createComicCollection(...); // Automatically routes to correct wallet
```

**The system works like this:**
- **Mirror Node/Read Calls** → Use Mirror Node API (read-only, same for both wallets)
- **Contract Writes** → Use wagmi hooks (automatically routes EVM or Hedera)

---

## 🔧 Component Integration Pattern

### Pattern 1: Basic Setup (All Components)

Every component that uses contract interactions should follow this pattern:

```tsx
'use client';

import { useWalletDetector, WalletType } from '@/hook/useWalletDetector';
import { useWagmiComicContract } from '@/hook/useWagmiComicContract';
import { useWalletAwareTransaction } from '@/hook/useWalletAwareTransaction';
import { useState } from 'react';

export function MyComponent() {
  // 1️⃣ Get wallet info
  const wallet = useWalletDetector();
  
  // 2️⃣ Get contract hooks
  const { createComicCollection, isProcessing, error } = useWagmiComicContract();
  const txExecutor = useWalletAwareTransaction();
  
  // 3️⃣ Local state
  const [isLoading, setIsLoading] = useState(false);

  // 4️⃣ Check wallet connection FIRST
  if (!wallet.isConnected) {
    return <div>Please connect a wallet to continue</div>;
  }

  // 5️⃣ Your component logic
  return <>...</>;
}
```

---

## 💼 Real Example: Integrate listing-view.tsx

Here's how to integrate the wagmi hooks into your `listing-view` component:

### Current Implementation → New Implementation

**BEFORE (Current):**
```tsx
const {
    createComicCollection,
    createDirectListing
} = useComicPlatform({
    accountId: account || user?.walletAddress || '',
    network: "testnet",
    signer: signer,
});
```

**AFTER (With Wagmi):**
```tsx
// 1. Add wallet detection
const wallet = useWalletDetector();
const { address: evmAddress } = useAccount(); // From wagmi

// 2. Use wagmi hooks instead
const { 
    createComicCollection: wagmiCreateCollection,
    createDirectListing: wagmiCreateDirectListing,
    isProcessing: contractProcessing,
    error: contractError
} = useWagmiComicContract();

// 3. Keep old hooks as fallback if needed
const {
    createComicCollection: legacyCreateCollection,
    createDirectListing: legacyCreateDirectListing
} = useComicPlatform({
    accountId: account || user?.walletAddress || '',
    network: "testnet",
    signer: signer,
});
```

### Update Collection Creation Function

**BEFORE:**
```tsx
const executeCreateCollection = async (
    flowData: FlowData,
    episodeData: any
) => {
    setProcessingMessage('Creating NFT collection...');
    
    const result = await retryWithBackoff(async () => {
        return await createComicCollection({
            episodeId: episodeId,
            name: `${episodeData?.title || 'Unknown'} Collection`,
            symbol: flowData.rarity!.type.toUpperCase().substring(0, 4),
            maxSupply: flowData.rarity!.maxSupply,
        });
    });
    
    // ... rest of code
};
```

**AFTER (With Wagmi):**
```tsx
const executeCreateCollection = async (
    flowData: FlowData,
    episodeData: any
) => {
    setProcessingMessage('Creating NFT collection...');
    
    // Check wallet is connected
    if (!wallet.isConnected) {
        throw new Error('Please connect a wallet first');
    }

    const result = await retryWithBackoff(async () => {
        // Use wagmi hook - it automatically detects wallet type
        return await wagmiCreateCollection(
            episodeId,
            `${episodeData?.title || 'Unknown'} Collection`,
            flowData.rarity!.type.toUpperCase().substring(0, 4),
            `${episodeData?.title} NFT Collection`,
            BigInt(flowData.rarity!.maxSupply),
            BigInt(AUTO_RENEW_PERIOD),
            {
                onSuccess: (hash) => {
                    console.log('✅ Collection created:', hash);
                    setProcessingMessage('Collection created successfully!');
                },
                onError: (err) => {
                    console.error('❌ Collection creation failed:', err);
                    setProcessingMessage(`Error: ${err.message}`);
                }
            }
        );
    });
    
    // Transform response
    const collectionData = {
        tokenId: result.hash || result.tokenId,
        transactionId: result.hash || result.transactionId,
        name: `${episodeData?.title || 'Unknown'} Collection`,
        symbol: flowData.rarity!.type.toUpperCase().substring(0, 4),
        maxSupply: flowData.rarity!.maxSupply,
    };

    saveTransactionState({
        stage: 'collection_created',
        episodeId,
        collectionData,
        flowData,
        episodeData,
        timestamp: Date.now(),
    });

    return collectionData;
};
```

---

## 📊 Integration Checklist for listing-view.tsx

### Step 1: Add Imports
```tsx
import { useWalletDetector, WalletType } from '@/hook/useWalletDetector';
import { useWagmiComicContract } from '@/hook/useWagmiComicContract';
import { useWalletAwareTransaction } from '@/hook/useWalletAwareTransaction';
import { useAccount } from 'wagmi';
```

### Step 2: Add Hook Calls
```tsx
// Add at top of component, after existing hooks
const wallet = useWalletDetector();
const { address: evmAddress } = useAccount();
const walletAware = useWalletAware();
const txExecutor = useWalletAwareTransaction();

const {
    createComicCollection: wagmiCreateCollection,
    createDirectListing: wagmiCreateDirectListing,
    isProcessing: contractProcessing,
    error: contractError
} = useWagmiComicContract();
```

### Step 3: Update Collection Creation
```tsx
// In executeCreateCollection function
if (!wallet.isConnected) {
    throw new Error('Wallet not connected');
}

const result = await wagmiCreateCollection(
    episodeId,
    name,
    symbol,
    memo,
    BigInt(maxSupply),
    BigInt(AUTO_RENEW_PERIOD),
    {
        onSuccess: (hash) => console.log('✅', hash),
        onError: (err) => console.error('❌', err.message),
    }
);
```

### Step 4: Update Direct Listing Creation
```tsx
// In executeMintAndList function
if (!wallet.isConnected) {
    throw new Error('Wallet not connected');
}

const result = await wagmiCreateDirectListing(
    episodeId,
    BigInt(parseFloat(flowData.listing!.price)),
    BigInt(parseInt(flowData.listing!.supply) || 1),
    {
        onSuccess: (hash) => console.log('✅ Listed:', hash),
        onError: (err) => console.error('❌ Listing failed:', err.message),
    }
);
```

### Step 5: Add Wallet Check at Render
```tsx
// In the render/return section, add early check
if (!wallet.isConnected) {
    return (
        <div className="p-6 text-center">
            <p className="text-red-500">Please connect your wallet to create listings</p>
            <p className="text-sm text-gray-600">Connected: {wallet.type}</p>
        </div>
    );
}
```

---

## 🎯 Common Component Patterns

### Pattern A: Simple Contract Call

```tsx
export function SimpleComponent() {
  const wallet = useWalletDetector();
  const { buyNFTFromMarketplace, isProcessing } = useWagmiComicContract();

  const handleBuy = async () => {
    if (!wallet.isConnected) {
      alert('Connect your wallet first');
      return;
    }

    try {
      await buyNFTFromMarketplace(BigInt(1), BigInt(1000000000));
      alert('✅ Purchase successful!');
    } catch (err) {
      alert('❌ ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <button onClick={handleBuy} disabled={isProcessing}>
      {isProcessing ? 'Processing...' : 'Buy Comic'}
    </button>
  );
}
```

### Pattern B: With Transaction Executor

```tsx
export function TransactionComponent() {
  const txExecutor = useWalletAwareTransaction();
  const { listNFTForResale } = useWagmiComicContract();

  const handleList = async () => {
    const result = await txExecutor.execute(
      async () => {
        return await listNFTForResale(
          '0x...',
          BigInt(1),
          BigInt(1000000000)
        );
      },
      {
        name: 'List Comic',
        onSuccess: (hash) => {
          console.log('✅ Listed:', hash);
        },
        onError: (err) => {
          console.error('❌ Error:', err.message);
        }
      }
    );

    if (result.success) {
      console.log('Success:', result.hash);
    }
  };

  return <button onClick={handleList}>List Comic</button>;
}
```

### Pattern C: Conditional Based on Wallet

```tsx
export function WalletSpecificComponent() {
  const wallet = useWalletDetector();

  if (wallet.type === WalletType.ETHEREUM) {
    return <EVMOnlyFeature />;
  } else if (wallet.type === WalletType.HEDERA) {
    return <HederaOnlyFeature />;
  } else {
    return <ConnectWalletPrompt />;
  }
}
```

### Pattern D: With Mirror Node Data

```tsx
export function HybridComponent() {
  const wallet = useWalletDetector();
  const { listNFTForResale } = useWagmiComicContract();
  
  // Mirror Node read (works for both wallets)
  const { data: episodeData } = useReadContract({
    address: HEDERA_CONTRACTS.COMIC_CORE.evmAddress as `0x${string}`,
    abi: COMIC_CORE_ABI,
    functionName: 'episodes',
    args: [episodeId],
  });

  // Write operation (automatically routes)
  const handleList = async () => {
    await listNFTForResale('0x...', BigInt(1), BigInt(1000000000));
  };

  return (
    <div>
      {/* Display data from Mirror Node */}
      <p>Episode: {episodeData?.name}</p>
      {/* Use contract write */}
      <button onClick={handleList}>List</button>
    </div>
  );
}
```

---

## 🔄 Response Mapping

Different wallet types return data in slightly different formats. Here's how to normalize:

```tsx
// Universal response wrapper
const normalizeContractResponse = (result: any, walletType: WalletType) => {
  if (walletType === WalletType.ETHEREUM) {
    return {
      hash: result, // EVM returns tx hash string
      transactionId: result,
      success: !!result
    };
  } else if (walletType === WalletType.HEDERA) {
    return {
      hash: result, // Hedera returns transaction ID
      transactionId: result,
      success: !!result
    };
  }
  return { success: false };
};

// In your component
const result = await createComicCollection(...);
const normalized = normalizeContractResponse(result, wallet.type);
console.log('Transaction:', normalized.transactionId);
```

---

## ⚠️ Things to Remember

### 1. Always Check Wallet Connection First
```tsx
if (!wallet.isConnected) {
    // Show message to connect wallet
    return <ConnectPrompt />;
}
```

### 2. Use BigInt for Amounts
```tsx
// ✅ Correct
await buyNFT(BigInt(1), BigInt(1000000000));

// ❌ Wrong
await buyNFT(1, 1000000000);
```

### 3. Error Handling is Important
```tsx
try {
    await operation();
} catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    showError(message);
}
```

### 4. Add Loading States
```tsx
const { isProcessing } = useWagmiComicContract();

return (
    <button disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Execute'}
    </button>
);
```

---

## 🧪 Testing Your Integration

### Test Checklist

- [ ] Wallet connects without errors
- [ ] Wallet type is detected correctly
- [ ] Contract function calls succeed with Ethereum wallet
- [ ] Contract function calls succeed with Hedera wallet
- [ ] Mirror Node reads work for both wallets
- [ ] Error messages display properly
- [ ] Loading states update correctly
- [ ] Transaction hashes/IDs are returned

### Debug Log Example
```tsx
const handleAction = async () => {
    console.log('🔍 Debug Info:');
    console.log('  Wallet Type:', wallet.type);
    console.log('  Address:', wallet.address);
    console.log('  Is Connected:', wallet.isConnected);
    
    try {
        const result = await operation();
        console.log('✅ Success:', result);
    } catch (err) {
        console.error('❌ Error:', err);
    }
};
```

---

## 📝 Migration Checklist for listing-view.tsx

- [ ] Import new hooks
- [ ] Add `useWalletDetector()` call
- [ ] Add `useWagmiComicContract()` call
- [ ] Add wallet connection check in render
- [ ] Update `executeCreateCollection` to use wagmi hook
- [ ] Update `executeMintAndList` to use wagmi hook
- [ ] Test with Ethereum wallet
- [ ] Test with Hedera wallet
- [ ] Test error scenarios
- [ ] Test retry logic with new hooks
- [ ] Remove old hooks if fully migrated

---

## 🎓 Summary

**For your listing-view.tsx component:**

1. Import the wagmi hooks
2. Add `useWalletDetector()` to check which wallet is connected
3. Replace collection creation with `useWagmiComicContract().createComicCollection()`
4. Replace listing creation with `useWagmiComicContract().createDirectListing()`
5. The hooks automatically route to the correct wallet implementation
6. No manual conditional logic needed - it's automatic!

The same pattern works for ANY component - just use the hooks and let them handle the wallet routing.
