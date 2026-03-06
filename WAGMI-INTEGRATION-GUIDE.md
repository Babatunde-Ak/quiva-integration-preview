# Wagmi Smart Contract Integration Guide

## Overview

This is a comprehensive guide for integrating smart contracts with both **EVM wallets (RainbowKit)** and **Hedera wallets (HashPack)** using wagmi.

The system automatically detects which wallet is connected and routes contract calls appropriately.

---

## Architecture

### Component Structure

```
hooks/
├── useWalletDetector.ts          # Detects connected wallet type
├── useWagmiComicContract.ts       # Main contract interaction hook
└── useWalletAwareTransaction.ts   # Transaction execution wrapper

contracts/
└── HederaContractConfig.ts        # Contract addresses and ABIs

providers/
└── HashPackProvider.tsx           # Hedera wallet provider
```

---

## Quick Start

### 1. Detect Which Wallet is Connected

```tsx
'use client';

import { useWalletDetector, WalletType } from '@/hook/useWalletDetector';

export function MyComponent() {
  const wallet = useWalletDetector();

  if (!wallet.isConnected) {
    return <div>Please connect a wallet</div>;
  }

  return (
    <div>
      <p>Connected: {wallet.type}</p>
      <p>Address: {wallet.address}</p>
      <p>Connector: {wallet.connector}</p>
    </div>
  );
}
```

### 2. Perform Contract Operations

```tsx
'use client';

import { useWagmiComicContract } from '@/hook/useWagmiComicContract';
import { useState } from 'react';

export function BuyComicButton() {
  const { buyNFTFromMarketplace, isProcessing, error } = useWagmiComicContract();
  const [isLoading, setIsLoading] = useState(false);

  const handleBuy = async () => {
    setIsLoading(true);
    try {
      const hash = await buyNFTFromMarketplace(
        BigInt(1), // listingId
        BigInt(100000000000), // price (100 HBAR in tinybars)
        {
          onSuccess: (txHash) => {
            console.log('✅ Purchase successful:', txHash);
            // Update UI, redirect, etc.
          },
          onError: (err) => {
            console.error('❌ Purchase failed:', err);
          }
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleBuy} disabled={isProcessing || isLoading}>
        {isProcessing ? 'Processing...' : 'Buy Comic'}
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </div>
  );
}
```

### 3. Execute Wallet-Aware Transactions

```tsx
'use client';

import { useWalletAwareTransaction, WalletType } from '@/hook/useWalletAwareTransaction';
import { useWagmiComicContract } from '@/hook/useWagmiComicContract';

export function ListComicButton() {
  const txExecutor = useWalletAwareTransaction();
  const { listNFTForResale } = useWagmiComicContract();

  const handleList = async () => {
    const result = await txExecutor.execute(
      async (walletType) => {
        if (walletType === WalletType.ETHEREUM) {
          // Call EVM-compatible contract
          return await listNFTForResale(
            '0x123...', // tokenAddress
            BigInt(1),   // serialNumber
            BigInt(1000)  // price
          );
        } else if (walletType === WalletType.HEDERA) {
          // Hedera SDK handles this automatically in useWagmiComicContract
          return await listNFTForResale(
            '0.0.123456', // Hedera token ID (will be converted)
            BigInt(1),
            BigInt(1000)
          );
        }
        throw new Error('Unsupported wallet');
      },
      {
        name: 'List Comic for Resale',
        description: 'List your comic on the marketplace',
        onSign: () => console.log('🔐 Waiting for signature...'),
        onConfirm: (hash) => console.log('✅ Listed:', hash),
        onError: (err) => console.error('❌ Error:', err),
      }
    );

    if (result.success) {
      console.log('Successfully listed comic:', result.hash);
    }
  };

  return <button onClick={handleList}>List Comic</button>;
}
```

---

## Wallet Detection Patterns

### Pattern 1: Conditional Rendering Based on Wallet

```tsx
import { useWalletDetector, WalletType } from '@/hook/useWalletDetector';

export function WalletAwareComponent() {
  const wallet = useWalletDetector();

  if (wallet.type === WalletType.ETHEREUM) {
    return <EthereumSpecificUI />;
  } else if (wallet.type === WalletType.HEDERA) {
    return <HederaSpecificUI />;
  } else {
    return <ConnectWalletPrompt />;
  }
}
```

### Pattern 2: Wallet-Specific Operations

```tsx
import { useWalletAware } from '@/hook/useWalletDetector';

export function SmartOperation() {
  const walletAware = useWalletAware();

  const performAction = () => {
    // Automatically routes to correct handler
    walletAware.executeWithWallet(
      () => {
        // Ethereum/EVM path
        return eth_specificOperation();
      },
      () => {
        // Hedera path
        return hedera_specificOperation();
      }
    );
  };

  return (
    <div>
      <p>{walletAware.wallet.type} wallet connected</p>
      <button onClick={performAction}>Execute</button>
    </div>
  );
}
```

### Pattern 3: Type Safety with Wallet Checking

```tsx
import { useWalletDetector, WalletType } from '@/hook/useWalletDetector';

export function TypeSafeComponent() {
  const { wallet, executeWithWallet, isWalletType } = useWalletAware();

  // Check before operation
  if (!isWalletType(WalletType.ETHEREUM)) {
    return <div>This feature requires Ethereum wallet</div>;
  }

  // Proceed with EVM-specific logic
  return <EVMFeatureComponent />;
}
```

---

## Contract Operation Examples

### Create Comic Collection

```tsx
import { useWagmiComicContract } from '@/hook/useWagmiComicContract';

export function CreateComicForm() {
  const { createComicCollection, isProcessing, error } = useWagmiComicContract();

  const handleCreate = async (formData: {
    episodeId: string;
    name: string;
    symbol: string;
    maxSupply: number;
  }) => {
    try {
      const hash = await createComicCollection(
        formData.episodeId,
        formData.name,
        formData.symbol,
        'Comic NFT Collection',
        BigInt(formData.maxSupply),
        BigInt(7776000), // 90 days in seconds
        {
          onSuccess: (txHash) => {
            console.log('✅ Collection created:', txHash);
            // Refresh state, navigate, etc.
          }
        }
      );
      return hash;
    } catch (err) {
      console.error('Failed to create collection:', err);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleCreate({
        episodeId: 'episode-1',
        name: 'Amazing Spider Comic',
        symbol: 'SPIDER',
        maxSupply: 1000,
      });
    }}>
      {/* Form fields */}
      <button type="submit" disabled={isProcessing}>
        {isProcessing ? 'Creating...' : 'Create Collection'}
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  );
}
```

### Grant Reading Access

```tsx
import { useWagmiComicContract } from '@/hook/useWagmiComicContract';
import { useWalletDetector } from '@/hook/useWalletDetector';

export function GrantAccessButton({
  tokenAddress,
  userAddress
}: {
  tokenAddress: string;
  userAddress: string;
}) {
  const { grantReadingAccess, isProcessing } = useWagmiComicContract();
  const wallet = useWalletDetector();

  if (!wallet.isConnected) {
    return <p>Please connect a wallet</p>;
  }

  const handleGrant = async () => {
    try {
      await grantReadingAccess(tokenAddress, userAddress, {
        onSuccess: (hash) => {
          console.log('✅ Access granted:', hash);
          // Update UI
        }
      });
    } catch (err) {
      console.error('Failed to grant access:', err);
    }
  };

  return (
    <button onClick={handleGrant} disabled={isProcessing}>
      {isProcessing ? 'Granting...' : 'Grant Reading Access'}
    </button>
  );
}
```

### Buy from Marketplace

```tsx
import { useWagmiComicContract } from '@/hook/useWagmiComicContract';
import { useWalletAwareTransaction } from '@/hook/useWalletAwareTransaction';

export function MarketplaceCard({ listing }: { listing: Listing }) {
  const { buyNFTFromMarketplace } = useWagmiComicContract();
  const txExecutor = useWalletAwareTransaction();

  const handlePurchase = async () => {
    const result = await txExecutor.execute(
      async () => {
        return await buyNFTFromMarketplace(
          BigInt(listing.listingId),
          BigInt(listing.price)
        );
      },
      {
        name: `Buy ${listing.title}`,
        description: `Purchase for ${listing.price} HBAR`,
        onConfirm: (hash) => {
          console.log('✅ Purchase confirmed:', hash);
          // Refresh listings, show success message
        }
      }
    );

    if (!result.success) {
      console.error('Purchase failed:', result.error?.message);
    }
  };

  if (!txExecutor.isConnected) {
    return <p>Connect wallet to purchase</p>;
  }

  return (
    <div>
      <h3>{listing.title}</h3>
      <p>{listing.price} HBAR</p>
      <button onClick={handlePurchase} disabled={txExecutor.wallet.isLoading}>
        Buy Now
      </button>
    </div>
  );
}
```

---

## Error Handling

### Complete Error Handling Pattern

```tsx
import { useWagmiComicContract } from '@/hook/useWagmiComicContract';
import { useWalletDetector, WalletType } from '@/hook/useWalletDetector';
import { useState } from 'react';

export function RobustComicPurchase() {
  const { buyNFTFromMarketplace, error } = useWagmiComicContract();
  const wallet = useWalletDetector();
  const [userError, setUserError] = useState<string | null>(null);

  const handleBuy = async (listingId: bigint, price: bigint) => {
    // Check wallet connection
    if (!wallet.isConnected) {
      setUserError('Please connect a wallet first');
      return;
    }

    // Warn if wallet type might not support the operation
    if (wallet.type === WalletType.NONE) {
      setUserError('Unsupported wallet');
      return;
    }

    setUserError(null);

    try {
      await buyNFTFromMarketplace(listingId, price, {
        onSuccess: (txHash) => {
          console.log('✅ Success:', txHash);
          setUserError(null);
        },
        onError: (err) => {
          console.error('❌ Error:', err);
          setUserError(formatErrorMessage(err));
        }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setUserError(formatErrorMessage(new Error(message)));
    }
  };

  return (
    <div>
      {userError && (
        <div style={{ 
          padding: '10px',
          backgroundColor: '#fee',
          color: '#c00',
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          {userError}
        </div>
      )}
      <button 
        onClick={() => handleBuy(BigInt(1), BigInt(1000000000))}
        disabled={!wallet.isConnected}
      >
        Buy Comic
      </button>
    </div>
  );
}

function formatErrorMessage(error: Error): string {
  if (error.message.includes('insufficient balance')) {
    return 'Insufficient balance. Add HBAR to your wallet.';
  }
  if (error.message.includes('user rejected')) {
    return 'Transaction rejected by user';
  }
  if (error.message.includes('timeout')) {
    return 'Transaction timeout. Please try again.';
  }
  return error.message || 'An error occurred';
}
```

---

## Testing Wallet Connections

### Debug Component

```tsx
import { useWalletDetector } from '@/hook/useWalletDetector';
import { useWagmiComicContract } from '@/hook/useWagmiComicContract';

export function WalletDebugPanel() {
  const wallet = useWalletDetector();
  const contract = useWagmiComicContract();

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <h3>🔍 Wallet Debug Info</h3>
      <pre>
{JSON.stringify({
  walletType: wallet.type,
  isConnected: wallet.isConnected,
  address: wallet.address,
  connector: wallet.connector,
  chainId: wallet.chainId,
  contractState: {
    isProcessing: contract.isProcessing,
    hasError: !!contract.error,
    lastHash: contract.lastHash,
  }
}, null, 2)}
      </pre>
    </div>
  );
}
```

---

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file:

```env
# Hedera Contract Addresses
NEXT_PUBLIC_COMIC_CORE_ADDRESS=0.0.1234567
NEXT_PUBLIC_COMIC_CORE_EVM_ADDRESS=0x0000000000000000000000000000000000000000

NEXT_PUBLIC_COMIC_MARKETPLACE_ADDRESS=0.0.1234568
NEXT_PUBLIC_COMIC_MARKETPLACE_EVM_ADDRESS=0x0000000000000000000000000000000000000000

NEXT_PUBLIC_COMIC_SALES_ADDRESS=0.0.1234569
NEXT_PUBLIC_COMIC_SALES_EVM_ADDRESS=0x0000000000000000000000000000000000000000
```

---

## Common Patterns

### Pattern: Guard Against Wrong Wallet

```tsx
import { useWagmiComicContract } from '@/hook/useWagmiComicContract';
import { useWalletDetector, WalletType } from '@/hook/useWalletDetector';

export function RestrictedFeature() {
  const { listNFTForResale } = useWagmiComicContract();
  const wallet = useWalletDetector();

  // This feature only works with Hedera wallets
  if (wallet.type !== WalletType.HEDERA) {
    return <p>⚠️ This feature requires a Hedera wallet. Please switch wallets.</p>;
  }

  return <ListComicUI onList={listNFTForResale} />;
}
```

### Pattern: Dual Wallet Support

```tsx
import { useWalletAureTransaction, WalletType } from '@/hook/useWalletAwareTransaction';

export function UniversalOperation() {
  const txExecutor = useWalletAwareTransaction();

  const handleAction = async () => {
    await txExecutor.executeOnAny(
      // Ethereum handler
      async () => {
        return await ethereumSpecificCall();
      },
      // Hedera handler
      async () => {
        return await hederaSpecificCall();
      },
      {
        name: 'Universal Action',
        onConfirm: (hash) => console.log('Success:', hash)
      }
    );
  };

  return <button onClick={handleAction}>Execute on Any Wallet</button>;
}
```

---

## Migration Checklist

When integrating wagmi into existing components:

- [ ] Replace existing wallet detection with `useWalletDetector`
- [ ] Replace contract calls with `useWagmiComicContract`
- [ ] Add wallet type checks before operations
- [ ] Update transaction handling to use `useWalletAwareTransaction`
- [ ] Test with both EVM and Hedera wallets
- [ ] Add error handling with wallet-specific messages
- [ ] Update environment variables with contract addresses

---

## Troubleshooting

### "No wallet connected" Error
- Check if user has RainbowKit or HashPack connected
- Verify `HederaWalletProvider` and `RainbowKitProvider` are in layout

### Address Format Issues
- EVM addresses: `0x123abc...` (40 hex chars)
- Hedera addresses: `0.0.123456` or EVM format
- Use utility functions in `useWalletAwareTransaction` module

### Transaction Timeouts
- Increase timeout in transaction config: `timeout: 240000`
- Check network connectivity
- Ensure sufficient gas/HBAR balance

### Contract Address Not Found
- Verify environment variables are set correctly
- Check contract addresses in network explorer
- Ensure correct network (testnet/mainnet)

---

## Support Functions

### Wallet Detection Utilities

```tsx
import { 
  WalletType, 
  useWalletDetector, 
  useWalletAware 
} from '@/hook/useWalletDetector';

// Check wallet type
const wallet = useWalletDetector();
console.log(wallet.type === WalletType.ETHEREUM); // true or false

// Conditional execution
const walletAware = useWalletAware();
walletAware.executeWithWallet(
  () => evmFn(),
  () => hederaFn()
);

// Get contract address
const contractAddr = walletAware.getContractAddress(
  evmAddress,
  hederaAddress
);
```

---

**Last Updated**: March 2026
**Version**: 1.0.0
