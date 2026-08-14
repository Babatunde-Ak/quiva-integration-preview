# Wagmi Integration - Quick Reference Card

## 🔥 TL;DR - Copy This Pattern for ANY Component

```tsx
'use client';

// ✅ Step 1: Import
import { useWalletDetector } from '@/hook/useWalletDetector';
import { useWagmiComicContract } from '@/hook/useWagmiComicContract';

export function MyComponent() {
  // ✅ Step 2: Initialize hooks
  const wallet = useWalletDetector();
  const { contractFunction, isProcessing, error } = useWagmiComicContract();

  // ✅ Step 3: Check connection
  if (!wallet.isConnected) {
    return <p>Connect wallet first</p>;
  }

  // ✅ Step 4: Use it (automatically routes to correct wallet)
  const handleAction = async () => {
    try {
      await contractFunction(params, {
        onSuccess: (hash) => console.log('✅', hash),
        onError: (err) => console.error('❌', err.message),
      });
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return <button onClick={handleAction}>Execute</button>;
}
```

---

## 📚 Available Contract Functions

### useWagmiComicContract() Functions

```typescript
// Comic Core
createComicCollection(episodeId, name, symbol, memo, maxSupply, autoRenew, callbacks)
grantReadingAccess(tokenAddress, userAddress, callbacks)
revokeReadingAccess(tokenAddress, userAddress, callbacks)

// Marketplace
listNFTForResale(tokenAddress, serialNumber, price, callbacks)
buyNFTFromMarketplace(listingId, price, callbacks)
cancelListing(listingId, callbacks)

// Sales
createDirectListing(episodeId, pricePerNFT, quantity, callbacks)
buyFromDirectListing(listingId, quantity, price, callbacks)
createCampaign(episodeId, mintPrice, maxSupply, callbacks)
mintFromCampaign(campaignId, quantity, price, callbacks)
```

---

## 🎯 Common Use Cases

### Read Data (Mirror Node)
```tsx
const { data: episodeData } = useReadContract({
  address: HEDERA_CONTRACTS.COMIC_CORE.evmAddress as `0x${string}`,
  abi: COMIC_CORE_ABI,
  functionName: 'episodes',
  args: [episodeId],
});
```

### Write Transaction (Wagmi)
```tsx
const { buyNFTFromMarketplace, isProcessing } = useWagmiComicContract();

await buyNFTFromMarketplace(
  BigInt(listingId),
  BigInt(price),
  {
    onSuccess: (hash) => console.log('✅', hash),
    onError: (err) => console.error('❌', err.message),
  }
);
```

### Check Wallet Type
```tsx
const wallet = useWalletDetector();

if (wallet.type === WalletType.ETHEREUM) {
  // EVM-only code
} else if (wallet.type === WalletType.HEDERA) {
  // Hedera-only code
} else {
  // Not connected
}
```

---

## 💾 Required .env Variables

```env
NEXT_PUBLIC_COMIC_CORE_ADDRESS=0.0.YOUR_ID
NEXT_PUBLIC_COMIC_CORE_EVM_ADDRESS=0xYOUR_ADDRESS
NEXT_PUBLIC_COMIC_MARKETPLACE_ADDRESS=0.0.YOUR_ID
NEXT_PUBLIC_COMIC_MARKETPLACE_EVM_ADDRESS=0xYOUR_ADDRESS
NEXT_PUBLIC_COMIC_SALES_ADDRESS=0.0.YOUR_ID
NEXT_PUBLIC_COMIC_SALES_EVM_ADDRESS=0xYOUR_ADDRESS
```

---

## 🧠 How It Works

```
Your Component
     ↓
useWalletDetector() → Returns: { type: 'ethereum' | 'hedera', address, isConnected }
     ↓
useWagmiComicContract() → Check wallet type internally
     ↓
     ├─ IF Ethereum → Use wagmi writeContract hook
     └─ IF Hedera → Use Hedera SDK ContractExecuteTransaction
     ↓
Return transaction hash/ID
```

**Key Point**: You don't need to check wallet type in your component - the hook does it!

---

## ⚠️ Important Rules

1. **Always use BigInt for amounts**
   ```tsx
   ✅ BigInt(1000000000)
   ❌ 1000000000
   ```

2. **Check wallet connection FIRST**
   ```tsx
   if (!wallet.isConnected) return <p>Connect wallet</p>;
   ```

3. **Wrap in try-catch**
   ```tsx
   try {
     await operation();
   } catch (err) {
     console.error(err.message);
   }
   ```

4. **Add loading states**
   ```tsx
   <button disabled={isProcessing}>
     {isProcessing ? 'Processing...' : 'Execute'}
   </button>
   ```

---

## 🔍 Wallet Detection

```typescript
import { useWalletDetector, WalletType } from '@/hook/useWalletDetector';

const wallet = useWalletDetector();

wallet.type          // 'ethereum' | 'hedera' | 'none'
wallet.address       // User's address
wallet.isConnected   // true | false
wallet.connector     // 'MetaMask' | 'HashPack' | undefined
wallet.chainId       // For EVM wallets
```

---

## 📊 Mirror Node + Wagmi

```tsx
// Step 1: Read data from Mirror Node (both wallets)
const { data: episodeData } = useReadContract({
  address: HEDERA_CONTRACTS.COMIC_CORE.evmAddress as `0x${string}`,
  abi: COMIC_CORE_ABI,
  functionName: 'episodes',
  args: [episodeId],
});

// Step 2: Write transaction with wagmi (auto-routes)
const { buyNFTFromMarketplace } = useWagmiComicContract();
await buyNFTFromMarketplace(listingId, episodeData.price);
```

---

## 🐛 Debug Logging

Enable these in component:

```tsx
const wallet = useWalletDetector();
const { createComicCollection, isProcessing, error } = useWagmiComicContract();

console.log('Wallet Type:', wallet.type);
console.log('Is Connected:', wallet.isConnected);
console.log('Address:', wallet.address);
console.log('Is Processing:', isProcessing);
console.log('Error:', error?.message);
```

---

## 📁 File Locations

```
Your integration files are here:
├── src/contracts/HederaContractConfig.ts     (Contract ABI & addresses)
├── src/hook/useWalletDetector.ts             (Wallet detection)
├── src/hook/useWagmiComicContract.ts         (Contract functions)
├── src/hook/useWalletAwareTransaction.ts     (Transaction helper)
└── src/components/examples/WagmiIntegrationExamples.tsx (Example code)

Documentation files:
├── WAGMI-INTEGRATION-GUIDE.md                (Complete guide)
├── COMPONENT-INTEGRATION-GUIDE.md            (Component patterns)
├── MIRROR-NODE-WAGMI-INTEGRATION.md          (Mirror Node guide)
└── LISTING-VIEW-INTEGRATION-STEPS.md         (Step-by-step for listing-view)
```

---

## 🚀 Integration Checklist

For each component that uses contracts:

- [ ] Add imports (`useWalletDetector`, `useWagmiComicContract`)
- [ ] Call hooks in component
- [ ] Check `wallet.isConnected` before operations
- [ ] Replace old contract calls with wagmi hooks
- [ ] Test with Ethereum wallet
- [ ] Test with Hedera wallet
- [ ] Add error handling
- [ ] Add loading states
- [ ] Add wallet status indicator (optional)

---

## 💡 Pro Tips

1. **Start with read-only operations**
   - Test wallet detection
   - Test Mirror Node queries
   - Then move to writes

2. **Keep old hooks temporarily**
   - Easier fallback if needed
   - Easier to debug issues
   - Can remove later

3. **Use exact contract names**
   ```tsx
   // Check HederaContractConfig.ts for available functions
   ✅ createComicCollection
   ❌ createCollection
   ❌ mintCollection
   ```

4. **Handle network differences**
   - EVM: Sepolia/Mainnet
   - Hedera: Testnet/Mainnet
   - Use environment variables

5. **Always show transaction status**
   - Loading: "Processing..."
   - Success: "✅ Complete"
   - Error: "❌ Failed: [message]"

---

## 🔗 Links

- [Full Integration Guide](./WAGMI-INTEGRATION-GUIDE.md)
- [Component Patterns](./COMPONENT-INTEGRATION-GUIDE.md)
- [Mirror Node Integration](./MIRROR-NODE-WAGMI-INTEGRATION.md)
- [Listing View Steps](./LISTING-VIEW-INTEGRATION-STEPS.md)
- [Example Code](./src/components/examples/WagmiIntegrationExamples.tsx)

---

## ❓ FAQ

**Q: Do I need to check wallet type in every function?**
A: No! The hooks do it automatically. Just call the function - it routes correctly.

**Q: How do I know which wallet is connected?**
A: Use `useWalletDetector()` to get wallet type and address.

**Q: Can Mirror Node reads work with both wallets?**
A: Yes! Mirror Node is blockchain-agnostic, works for all wallet types.

**Q: Do I need to update environment variables?**
A: Yes, add contract addresses to `.env.local` for your network.

**Q: What if I want Ethereum-only feature?**
A: Check `wallet.type === WalletType.ETHEREUM` and show conditional UI.

**Q: How do I know if transaction worked?**
A: Check console logs or check returned transaction hash/ID.

---

## 🎓 Learning Path

1. **Day 1**: Read [WAGMI-INTEGRATION-GUIDE.md](./WAGMI-INTEGRATION-GUIDE.md)
2. **Day 2**: Review [listing-view-REFACTORED.tsx](./src/features/comic-pad/components/listing/listing-view-REFACTORED.tsx)
3. **Day 3**: Follow [LISTING-VIEW-INTEGRATION-STEPS.md](./LISTING-VIEW-INTEGRATION-STEPS.md)
4. **Day 4**: Update your actual listing-view.tsx
5. **Day 5**: Test with both wallets
6. **Day 6**: Apply same pattern to other components
7. **Day 7**: Final testing and polish

---

**Keep this card handy while integrating! 📌**

Last Updated: March 3, 2026
