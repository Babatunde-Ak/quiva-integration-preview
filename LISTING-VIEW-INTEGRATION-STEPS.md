# Step-by-Step: Integrate Wagmi into listing-view.tsx

## 📍 Overview

This guide shows EXACTLY how to integrate the wagmi hooks into your existing `listing-view.tsx` component.

**File Location**: `src/features/comic-pad/components/listing/listing-view.tsx`

---

## 🚀 Step 1: Add Imports (Copy-Paste These)

Add these lines at the top of your `listing-view.tsx` file, after existing imports:

```tsx
// ✅ NEW: Add these imports
import { useWalletDetector, WalletType, useWalletAware } from '@/hook/useWalletDetector';
import { useWagmiComicContract } from '@/hook/useWagmiComicContract';
import { useWalletAwareTransaction } from '@/hook/useWalletAwareTransaction';
import { useAccount } from 'wagmi';
```

**Location**: Right after your existing hook imports (around line 26-28)

---

## 🎯 Step 2: Add Hook Calls in Component (Copy-Paste)

Add these hook calls right after your Redux dispatch and params, inside the component:

```tsx
const ListView: React.FC<ListViewProps> = ({
    episodeTitle = "Great Manga #2",
    episodeImage = "/api/placeholder/200/200",
    onCancel,
}) => {
    const router = useRouter();
    const params = useParams();
    const dispatch = useAppDispatch();
    const episodeId = params.episode as string;

    // ✅ NEW: Add these wallet/contract hooks
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

    // ... rest of your existing code ...
```

**Location**: After line 175 (after `const episodeId = params.episode as string;`)

---

## ✏️ Step 3: Update Collection Creation Function

Find your `executeCreateCollection` function (around line 280) and replace it with this:

```tsx
// Step 1: Create Collection
const executeCreateCollection = async (
    flowData: FlowData,
    episodeData: any
) => {
    setProcessingMessage('Creating NFT collection...');
    
    // ✅ NEW: Check wallet is connected
    if (!wallet.isConnected) {
        throw new Error('Please connect a wallet first');
    }

    console.log(`🔄 Creating collection on ${wallet.type} wallet...`);

    const result = await retryWithBackoff(async () => {
        // ✅ NEW: Use wagmi hook instead of old hook
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
    
    const collectionData = {
        tokenId: result || 'pending',
        transactionId: result || '',
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

**What Changed**:
- ✅ Added `if (!wallet.isConnected)` check
- ✅ Changed from `createComicCollection` to `wagmiCreateCollection`
- ✅ Added callbacks (`onSuccess`, `onError`)
- ✅ Added BigInt conversion for amounts
- ✅ Console logs to show which wallet is being used

---

## ✏️ Step 4: Update Mint and List Function

Find your `executeMintAndList` function (around line 325) and update it:

```tsx
// Step 3: Mint and List NFTs
const executeMintAndList = async (
    flowData: FlowData,
    inscriptionData: { metadataHRL: string; topicId: string },
    collectionData: { tokenId: string }
) => {
    setProcessingMessage('Minting and listing NFTs...');

    // ✅ NEW: Check wallet is connected
    if (!wallet.isConnected) {
        throw new Error('Please connect a wallet first');
    }

    console.log(`🔄 Creating direct listing on ${wallet.type} wallet...`);

    const numberOfCopies = parseInt(flowData.listing!.supply) || 1;

    const result = await retryWithBackoff(async () => {
        // ✅ NEW: Use wagmi hook instead of old hook
        return await wagmiCreateDirectListing(
            episodeId,
            BigInt(parseFloat(flowData.listing!.price) * 100_000_000),
            BigInt(numberOfCopies),
            {
                onSuccess: (hash) => {
                    console.log('✅ Direct listing created:', hash);
                    setProcessingMessage('NFTs listed successfully!');
                },
                onError: (err) => {
                    console.error('❌ Listing failed:', err);
                    setProcessingMessage(`Error: ${err.message}`);
                }
            }
        );
    });

    console.log("✅ NFTs minted and listed:", result);

    const mintingData: MintResult = {
        tokenId: collectionData.tokenId,
        status: 'listed',
        serials: [],
        transactionId: result || "",
        listingId: result || "",
    };

    const currentState = transactionState!;
    saveTransactionState({
        ...currentState,
        stage: 'completed',
        mintingData,
        timestamp: Date.now(),
    });

    return mintingData;
};
```

**What Changed**:
- ✅ Added `if (!wallet.isConnected)` check
- ✅ Changed from `createDirectListing` to `wagmiCreateDirectListing`
- ✅ Added callbacks (`onSuccess`, `onError`)
- ✅ Fixed price conversion to tinybars (multiply by 100_000_000)

---

## 🖼️ Step 5: Add Wallet Check to Render (Optional but Recommended)

Add this at the beginning of your JSX return statement (before your component UI):

```tsx
// ✅ NEW: Add this wallet check at the start of render
if (!wallet.isConnected) {
    return (
        <div className="p-6 text-center">
            <h2>Connect Your Wallet</h2>
            <p className="text-gray-600">
                Please connect a wallet (RainbowKit for Ethereum or HashPack for Hedera) to create listings.
            </p>
            <p className="text-sm text-gray-400 mt-2">
                Current Wallet Status: {wallet.type === WalletType.NONE ? '❌ Not Connected' : `🟢 ${wallet.type}`}
            </p>
        </div>
    );
}

// Your existing UI code continues below...
return (
    <div className="comic-listing-container">
        {/* Continue with your existing UI */}
    </div>
);
```

---

## 📝 Step 6: Add Wallet Badge to UI (Optional but Nice)

Add this helper function and then call it in your JSX:

```tsx
// ✅ NEW: Helper to show wallet info
const renderWalletBadge = () => (
    <div className="mb-4 p-3 bg-blue-100 rounded-lg text-sm">
        <p>🔐 Connected Wallet: <strong>{wallet.type}</strong></p>
        {wallet.address && (
            <p className="text-xs text-gray-600">
                {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
            </p>
        )}
    </div>
);

// Then in your JSX return:
return (
    <div className="comic-listing-container">
        {renderWalletBadge()}
        
        {/* Show error if contract has one */}
        {contractError && (
            <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
                Contract Error: {contractError.message}
            </div>
        )}
        
        {/* Your existing UI components */}
    </div>
);
```

---

## 🧪 Step 7: Test the Integration

### Test Checklist

```tsx
// 1. Test with Ethereum Wallet (RainbowKit)
✅ Connect MetaMask or other EVM wallet
✅ Click "Create Listing"
✅ See "ethereum" in wallet badge
✅ Collection creation succeeds
✅ Transaction succeeds

// 2. Test with Hedera Wallet (HashPack)
✅ Connect HashPack wallet
✅ Click "Create Listing"
✅ See "hedera" in wallet badge
✅ Collection creation succeeds
✅ Transaction succeeds

// 3. Test Error Cases
✅ Disconnect wallet, try operation → See "Please connect a wallet" error
✅ Insufficient balance → See transaction failure message
✅ User rejects transaction → See rejection message
```

---

## 📋 Complete Code Diff Summary

Here's what changed:

| Change | Location | Purpose |
|--------|----------|---------|
| Added imports | Top of file | Import wagmi hooks |
| Added hook calls | Inside component | Get wallet & contract functions |
| Updated `executeCreateCollection` | Line ~280 | Use wagmi hook, add wallet check |
| Updated `executeMintAndList` | Line ~325 | Use wagmi hook, add wallet check |
| Added wallet check in render | Line ~700 | Prevent operations without wallet |
| Added wallet badge (optional) | In JSX | Show user which wallet is connected |

---

## ✅ Verification Steps

After making changes, verify:

1. **Component Still Compiles**
   ```bash
   pnpm build
   ```
   Should complete without errors

2. **No TypeScript Errors**
   - Check VS Code for red squiggles
   - Should be none after changes

3. **Functionality Works**
   - Test with MetaMask (EVM)
   - Test with HashPack (Hedera)
   - Both should work identically

4. **Console Logs Appear**
   - Look for `🔄 Creating collection on ethereum wallet...`
   - Or `🔄 Creating collection on hedera wallet...`
   - Indicates correct wallet detection

---

## 🐛 Troubleshooting

### Issue: "useWalletDetector is not exported"
**Solution**: Make sure you imported from correct path:
```tsx
import { useWalletDetector, WalletType } from '@/hook/useWalletDetector';
```

### Issue: "wallet.isConnected is undefined"
**Solution**: Make sure you called the hook:
```tsx
const wallet = useWalletDetector(); // This line is required
```

### Issue: "Contract calls still going to old hooks"
**Solution**: Make sure you're calling:
```tsx
await wagmiCreateCollection(...) // ✅ Correct
// NOT:
await createComicCollection(...) // ❌ Wrong
```

### Issue: "BigInt error"
**Solution**: Make sure to wrap numbers in BigInt():
```tsx
BigInt(flowData.rarity!.maxSupply)  // ✅ Correct
flowData.rarity!.maxSupply           // ❌ Wrong
```

---

## 🎉 You're Done!

Your `listing-view.tsx` component now:
✅ Detects which wallet is connected
✅ Routes contract calls automatically
✅ Works with both EVM and Hedera wallets
✅ Has proper error handling
✅ Shows wallet status to users

The same pattern applies to ALL other components that need contract interaction!

---

## 📚 Next Steps

1. **Integrate other components** using the same pattern
2. **Check other components** that use contracts:
   - `useListComic`
   - `useMintComic`
   - `useBuyComic`
   - Marketplace components
   - Dashboard components

3. **Replace all contract calls** gradually with wagmi hooks

4. **Test thoroughly** with both wallets for each component

---

## 💡 Pro Tips

1. **Keep old hooks temporarily** for fallback during migration
2. **Test one component at a time** to avoid breaking everything
3. **Use console.logs** to debug wallet detection
4. **Check console for transaction hashes** to verify success
5. **Handle errors properly** with try-catch blocks

---

**Happy integrating! 🚀**

Questions? Check:
- [WAGMI-INTEGRATION-GUIDE.md](./WAGMI-INTEGRATION-GUIDE.md)
- [MIRROR-NODE-WAGMI-INTEGRATION.md](./MIRROR-NODE-WAGMI-INTEGRATION.md)
- [COMPONENT-INTEGRATION-GUIDE.md](./COMPONENT-INTEGRATION-GUIDE.md)
