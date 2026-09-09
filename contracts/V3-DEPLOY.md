# Deploying QuivaComicMarketplaceV3

Upgrade runbook for the live testnet marketplace. V3 replaces NFT escrow with an allowance
model — see the header comment in `QuivaComicMarketplaceV3.sol` for why.

## The addresses you need

| What | Value |
| --- | --- |
| Proxy (unchanged, keep this in `.env`) | `0.0.10232416` / `0x95cEB195a598f9ad66ff983A59C5573555e9d3AD` |
| Current implementation (V2) | `0.0.10232406` / `0xaefe652bc1d1198521dfeeb3b63bf8e4f2c93c53` |
| Proxy owner — must sign the upgrade | `0.0.7225845` / `0xb00d418b513a12984436ec4d8171594d4b1292d9` |
| comicCore | `0xd88f5d98a12ad826c6a86586f47544398226eb69` |
| Collection under test | token `0.0.10289671` / `0x00000000000000000000000000000000009d0207` |

The proxy address does not change, so no frontend env var changes and no backend indexer
changes — every event signature it decodes is unchanged.

## 1. Compile in Remix

Load `QuivaComicMarketplaceV3.sol`. In the Solidity Compiler tab:

- Compiler **0.8.24**
- Optimizer **enabled, 200 runs**
- EVM version: leave Remix's default; if the deployment reverts, retry with `shanghai`

Expect ~17.4 KB of bytecode — under the 24 KB limit, but not by a lot, so don't add much before
re-checking. The imports resolve over the network (the hiero-contracts GitHub URL and the
versioned `@openzeppelin/contracts-upgradeable@5.4.0` paths), so give Remix a moment on first
compile.

## 2. Deploy the implementation ONLY

In Deploy & Run, with your wallet on Hedera testnet and connected as the owner account:

- Contract: `QuivaComicMarketplaceV3`
- **Do not** use Remix's "Deploy with proxy" option. A proxy already exists and holds all the
  state; deploying a second one strands it.
- Press **Deploy**. Set the gas limit manually to ~5,000,000 if Remix's estimate fails.
- **Do not call `initialize`.** The proxy ran it in 2026 and its stored config is what you want.
  The implementation's own constructor calls `_disableInitializers()`, so the bare implementation
  is inert by design.

Write down the deployed address — call it `NEW_IMPL`.

## 3. Point the proxy at it

This is UUPS: the upgrade entry point lives in the implementation and is reached *through* the
proxy. In Remix, use **At Address** with the V3 ABI on the **proxy** address
`0x95cEB195a598f9ad66ff983A59C5573555e9d3AD`, then call:

```
upgradeToAndCall(NEW_IMPL, 0x)
```

Empty `bytes` for the second argument — there is no reinitializer to run. This must be sent from
`0xb00d418b…92d9`; any other caller gets `OwnableUnauthorizedAccount`.

## 4. Verify the upgrade took, before touching anything else

Still on the proxy address:

```
version()             -> "v3-allowance"
listingCounter()      -> 2          (state survived)
platformFeePercent()  -> 250
comicCore()           -> 0xd88f5d98a12ad826c6a86586f47544398226eb69
owner()               -> 0xb00d418b513a12984436ec4d8171594d4b1292d9
```

If `version()` reverts, the proxy is still on V2 — the upgrade did not land. If `listingCounter()`
comes back as anything but 2, stop and do not write anything: the storage layout is off, and the
fix is to compare `storageLayout` output, not to keep transacting.

Storage layout was verified byte-for-byte against the live proxy before this contract shipped:
slots 0–12 plus a 40-slot gap, identical to V2, with no new state variables.

## 5. Rescue the two NFTs V2 stranded

Serials **11** and **13** of `0.0.10289671` are held by the proxy and cannot be sent straight back
to the seller — that is the 326 wall V3 exists to avoid, and it still applies to a bare transfer.
They can only go to an account exempt from the token's custom fees: its treasury, or an account
that collects its royalty fees. `0.0.7225845` collects both royalty fees and is your own wallet,
so send them there.

```
rescueEscrowedNFT(0x00000000000000000000000000000000009d0207, 11, 0xb00d418b513a12984436ec4d8171594d4b1292d9)
rescueEscrowedNFT(0x00000000000000000000000000000000009d0207, 13, 0xb00d418b513a12984436ec4d8171594d4b1292d9)
```

Confirm each landed:

```bash
curl "https://testnet.mirrornode.hedera.com/api/v1/tokens/0.0.10289671/nfts/11"
```

From that wallet you can relist directly, or move an NFT anywhere with a normal SDK
`TransferTransaction` — a signed HAPI transfer *can* charge the receiver the 1.5 ℏ fallback, which
is exactly what a precompile call cannot do.

## 6. Clear the two stale listings

Both existing listings are dead: listing 0 has its price in weibars (a pre-fix bug, 10^10 too
large) and listing 1's NFT has just been rescued out from under it.

```
cancelListing(0)
cancelListing(1)
```

In V3 this is a pure state change — no transfer, nothing that can fail.

## 7. End-to-end test on testnet

Do this before pointing real users at it. Two wallets, both associated with the token.

1. **Seller** — from the app, list an edition. Two wallet prompts: `approve` on the token, then
   `listForResale`. The NFT must still be in the seller's wallet afterwards:
   `curl ".../tokens/0.0.10289671/nfts/<serial>"` → owner is the seller, not `0.0.10232416`.
2. **Buyer** — buy it. One prompt.
3. Read the transaction's child records — this is the check that matters:

```bash
curl "https://testnet.mirrornode.hedera.com/api/v1/transactions/<txId>"
```

The child `CRYPTOTRANSFER` should show, in one transfer:

- the NFT moving seller → buyer
- HBAR from the marketplace to the seller
- HBAR to `0.0.7225845` equal to **20% of the seller's proceeds** — the percentage royalty

That last line is the whole point. If instead you see a flat **1.5 ℏ** charge, or the transaction
fails with `NFT transfer failed`, then HTS assessed the fallback rather than the percentage and
the design assumption is wrong — stop and re-check before going further.

4. **Cancel** — list again, cancel it, confirm the NFT never moved.

## Rolling back

The proxy is still UUPS after the upgrade, so `upgradeToAndCall(0xaefe652bc1d1198521dfeeb3b63bf8e4f2c93c53, 0x)`
puts V2 back. Storage is compatible in both directions. That restores the old broken escrow
behaviour, so it is only worth doing if V3 turns out worse.

## What changed for users

- **Sellers keep custody.** Listing costs one approval and grants an allowance; the NFT stays in
  the wallet and stays readable.
- **Listing is cheaper.** No escrow deposit, so the contract stops paying 1.5 ℏ per listing.
- **Royalties changed shape.** 20% of the sale price now comes out of the seller's proceeds
  (what the token was always configured for) instead of a flat 1.5 ℏ charged to the receiver.
  After the 2.5% platform fee a seller nets about 78%.
- **Listings can go stale.** A seller who moves a listed NFT leaves a listing that cannot be
  filled. `purchaseNFT` checks before taking any money, `isListingFillable` lets the UI grey it
  out, and `pruneListing` lets anyone — your indexer included — close it.
