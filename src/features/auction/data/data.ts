/**
 * UI configuration for the offer page.
 *
 * Everything that describes an actual listing - price, seller, floor, fees, activity - is read
 * from the chain or the indexer at render time (see `useListingContext`). Only the fixed choices
 * a user picks between live here.
 */

/** Expiry presets. `createOffer` takes an absolute timestamp; these are the offsets offered. */
export const OFFER_EXPIRY_OPTIONS = ['24 hours', '3 days', '7 days', '30 days']

/** Quick-fill buttons, as a percentage above or below the collection floor. */
export const FLOOR_OPTIONS = [
  { label: 'Floor -10%', value: -10 },
  { label: 'Floor -5%', value: -5 },
  { label: 'Floor', value: 0 },
  { label: 'Floor +5%', value: 5 },
]
