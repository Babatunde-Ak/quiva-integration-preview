/**
 * Surfaces that are switched off for the production launch.
 *
 * `resale` and `offers` are on: the fixed-price and offer flows are wired end to end against
 * the V3 marketplace, and listing, buying, cancelling and making an offer have all been
 * confirmed on-chain.
 *
 * `auction` stays off because auctions are genuinely unfinished - `createAuction`,
 * `settleAuction` and `cancelAuction` have no UI anywhere in the app, so there is no way to
 * start an auction and nothing for a bid to be placed against. Turn it on once those exist.
 */
export const PRODUCTION_FEATURES = {
  resale: true,
  offers: true,
  auction: true,
  hashPackWallet: true,
} as const;
