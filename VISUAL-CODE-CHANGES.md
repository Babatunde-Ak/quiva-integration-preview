# Visual Code Changes for listing-view.tsx

## Side-by-Side Comparison

### CHANGE 1: Imports

**BEFORE:**
```tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

// Components
import EpisodeRarity from './steps/EpisodeRarity';
import ListingDetails from './steps/ListingDetails';
import ReviewDetails from './steps/ReviewDetails';
import ListingSuccessModal from './steps/ListingSuccessModal';

// Hooks
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { useHederaWallet } from '@/providers/HashPackProvider';
```

**AFTER:** (Add these three lines)
```tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

// Components
import EpisodeRarity from './steps/EpisodeRarity';
import ListingDetails from './steps/ListingDetails';
import ReviewDetails from './steps/ReviewDetails';
import ListingSuccessModal from './steps/ListingSuccessModal';

// Hooks
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { useHederaWallet } from '@/providers/HashPackProvider';
// ✨ ADD THESE 3 LINES:
import { useWalletDetector, WalletType, useWalletAware } from '@/hook/useWalletDetector';
import { useWagmiComicContract } from '@/hook/useWagmiComicContract';
import { useWalletAwareTransaction } from '@/hook/useWalletAwareTransaction';
import { useAccount } from 'wagmi';
```

---

### CHANGE 2: Hook Initialization

**BEFORE:**
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

    // State
    const [currentStep, setCurrentStep] = useState<FlowStep>('rarity');
    const [flowData, setFlowData] = useState<FlowData>({ rarity: null, listing: null });
    const [isProcessing, setIsProcessing] = useState(false);
```

**AFTER:** (Add these 6 lines after episodeId)
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

    // ✨ ADD THESE 6 LINES:
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

    // State
    const [currentStep, setCurrentStep] = useState<FlowStep>('rarity');
    const [flowData, setFlowData] = useState<FlowData>({ rarity: null, listing: null });
    const [isProcessing, setIsProcessing] = useState(false);
```

---

### CHANGE 3: executeCreateCollection Function

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
    
    const collectionData = {
        tokenId: result.tokenId!,
        transactionId: result.transactionId,
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

**AFTER:** (Most important change)
```tsx
const executeCreateCollection = async (
    flowData: FlowData,
    episodeData: any
) => {
    setProcessingMessage('Creating NFT collection...');
    
    // ✨ ADD WALLET CHECK:
    if (!wallet.isConnected) {
        throw new Error('Please connect a wallet first');
    }

    console.log(`🔄 Creating collection on ${wallet.type} wallet...`);

    const result = await retryWithBackoff(async () => {
        // ✨ CHANGE: createComicCollection → wagmiCreateCollection
        return await wagmiCreateCollection(
            episodeId,
            `${episodeData?.title || 'Unknown'} Collection`,
            flowData.rarity!.type.toUpperCase().substring(0, 4),
            `${episodeData?.title} NFT Collection`,
            BigInt(flowData.rarity!.maxSupply),  // ✨ ADD BigInt
            BigInt(AUTO_RENEW_PERIOD),           // ✨ ADD BigInt
            // ✨ ADD CALLBACKS:
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
        tokenId: result || 'pending',  // ✨ CHANGE: handle string hash
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

---

### CHANGE 4: executeMintAndList Function

**BEFORE:**
```tsx
const executeMintAndList = async (
    flowData: FlowData,
    inscriptionData: { metadataHRL: string; topicId: string },
    collectionData: { tokenId: string }
) => {
    setProcessingMessage('Minting and listing NFTs...');
    
    const numberOfCopies = parseInt(flowData.listing!.supply) || 1;

    const result = await retryWithBackoff(async () => {
        return await createDirectListing({
            episodeId: episodeData?._id || '',
            quantity: numberOfCopies,
            pricePerNFT: parseFloat(flowData.listing!.price),
            metadata: inscriptionData.metadataHRL
        });
    });

    console.log("✅ NFTs minted and listed:", result);

    const mintingData: MintResult = {
        tokenId: collectionData.tokenId,
        status: result.status || '',
        serials: [],
        transactionId: result.transactionId || "",
        listingId: result.listingId || "",
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

**AFTER:** (Similar structure, key differences)
```tsx
const executeMintAndList = async (
    flowData: FlowData,
    inscriptionData: { metadataHRL: string; topicId: string },
    collectionData: { tokenId: string }
) => {
    setProcessingMessage('Minting and listing NFTs...');

    // ✨ ADD WALLET CHECK:
    if (!wallet.isConnected) {
        throw new Error('Please connect a wallet first');
    }

    console.log(`🔄 Creating direct listing on ${wallet.type} wallet...`);

    const numberOfCopies = parseInt(flowData.listing!.supply) || 1;

    const result = await retryWithBackoff(async () => {
        // ✨ CHANGE: createDirectListing → wagmiCreateDirectListing
        // ✨ CHANGE: Different parameter structure
        return await wagmiCreateDirectListing(
            episodeId,
            BigInt(parseFloat(flowData.listing!.price) * 100_000_000), // ✨ Convert to tinybars
            BigInt(numberOfCopies),
            // ✨ ADD CALLBACKS:
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
        status: 'listed',  // ✨ CHANGE: simplify status
        serials: [],
        transactionId: result || "",  // ✨ CHANGE: handle string result
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

---

### CHANGE 5: Render Output (UI Check)

**BEFORE:**
```tsx
return (
    <div className="comic-listing-container">
        {currentStep === 'rarity' && (
            <EpisodeRarity
                selected={flowData.rarity}
                options={RARITY_OPTIONS}
                onSelect={(rarity) => {
                    setFlowData({ ...flowData, rarity });
                    setCurrentStep('listing');
                }}
            />
        )}
        {/* ... rest of component ... */}
    </div>
);
```

**AFTER:** (Add wallet check at beginning)
```tsx
// ✨ ADD WALLET CHECK AT THE START:
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

return (
    <div className="comic-listing-container">
        {/* ✨ ADD WALLET BADGE: */}
        <div className="mb-4 p-3 bg-blue-100 rounded-lg text-sm">
            <p>🔐 Connected Wallet: <strong>{wallet.type}</strong></p>
            {wallet.address && (
                <p className="text-xs text-gray-600">
                    {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                </p>
            )}
        </div>

        {/* ✨ ADD ERROR DISPLAY: */}
        {contractError && (
            <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
                Contract Error: {contractError.message}
            </div>
        )}

        {currentStep === 'rarity' && (
            <EpisodeRarity
                selected={flowData.rarity}
                options={RARITY_OPTIONS}
                onSelect={(rarity) => {
                    setFlowData({ ...flowData, rarity });
                    setCurrentStep('listing');
                }}
            />
        )}
        {/* ... rest of component ... */}
    </div>
);
```

---

## Summary of Changes

| Line/Function | Change | Why |
|--------------|--------|-----|
| Imports | Add 4 new hooks | Get wallet detection and contract functions |
| Hook calls | Add 6 lines | Initialize wallet and contract hooks |
| executeCreateCollection | Replace function call + add wallet check + add BigInt | Use wagmi instead of legacy hook, ensure wallet connected, correct types |
| executeMintAndList | Replace function call + add wallet check + add BigInt | Use wagmi instead of legacy hook, ensure wallet connected, price conversion |
| Render | Add wallet check + add badge | Show wallet status, prevent operations without wallet |

---

## Key Takeaways

✅ **3 imports** - Get the hooks you need
✅ **6 hook initializations** - Set up wallet detection and contracts
✅ **2 function updates** - Replace old calls with wagmi calls
✅ **1 UI update** - Add wallet status display
✅ **Everything else stays the same** - Same state, same logic, same UI

---

## Testing Changes

After applying changes:

```bash
# 1. Check for TypeScript errors
pnpm lint

# 2. Run your app
pnpm dev

# 3. Connect Ethereum wallet
# Should see "ethereum" in the badge

# 4. Try creating a listing
# Should see "🔄 Creating collection on ethereum wallet..." in console

# 5. Connect Hedera wallet
# Should see "hedera" in badge and routing changes

# 6. Try creating listing again
# Should see "🔄 Creating collection on hedera wallet..." in console
```

---

**That's it! Your listing-view is now wagmi-integrated! 🎉**
