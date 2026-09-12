import Image from 'next/image'
import type { OfferComic, OfferSeller } from './auction-view'

const shorten = (value?: string) =>
  value ? `${value.slice(0, 6)}...${value.slice(-4)}` : 'Unknown holder'

const HASHSCAN = 'https://hashscan.io/testnet'

/**
 * The listing being bid on, and who holds it.
 *
 * Only shows figures with a real source behind them. The seller reputation this panel used to
 * carry - sales completed, acceptance rate, days active, "collector since" - has nowhere to come
 * from: the contract records no seller history and the backend indexes none, so it was invented.
 * Editions held is the one stat the mirror node can actually answer, so it is the one that stayed.
 */
export default function SellerProfile({
  seller,
  comic,
  isLoading,
}: {
  seller: OfferSeller
  comic: OfferComic
  isLoading?: boolean
}) {
  const usdPrice =
    comic.listedPriceHbar !== undefined ? (comic.listedPriceHbar * 0.115).toFixed(2) : undefined

  // How this listing sits against the collection floor, as a bar. Only meaningful once both
  // numbers are known and the floor is non-zero.
  const floorPercent =
    comic.listedPriceHbar !== undefined && comic.floorPriceHbar
      ? Math.min((comic.floorPriceHbar / comic.listedPriceHbar) * 100, 100)
      : undefined
  const atFloor =
    comic.listedPriceHbar !== undefined &&
    comic.floorPriceHbar !== undefined &&
    comic.listedPriceHbar <= comic.floorPriceHbar

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-white/40 uppercase tracking-widest">You are buying from</p>

      <div className="flex items-center gap-3 border border-white/10 rounded-xl lg:rounded-2xl p-4">
        <div className="w-12 h-12 rounded-full bg-secondary-200 flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
          {seller.address ? seller.address.slice(2, 4).toUpperCase() : '--'}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-white/40 text-semibold">Holder</p>
          <p className="text-white font-bold font-mono text-sm break-all">
            {shorten(seller.address)}
          </p>
          {seller.address && (
            <a
              href={`${HASHSCAN}/account/${seller.address}`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-[#FAA31E] hover:underline"
            >
              View on Hashscan
            </a>
          )}
        </div>
      </div>

      {seller.editionsHeld !== undefined && (
        <div className="flex flex-col items-center bg-[#1a1a1a] border border-white/10 rounded-xl py-3">
          <span className="text-secondary-200 font-bold text-lg">{seller.editionsHeld}</span>
          <span className="text-white/40 text-[10px] text-center mt-0.5 font-light">
            Editions held in this collection
          </span>
        </div>
      )}

      <div className="border border-white/10 rounded-xl">
        <div className="relative w-full rounded-t-xl overflow-hidden bg-[#111]">
          <div className="relative w-full aspect-[16/9]">
            {comic.backgroundImage && (
              <Image
                src={comic.backgroundImage}
                alt={comic.title || 'Comic'}
                fill
                className="object-cover brightness-50"
              />
            )}
            {comic.serialNumber !== undefined && (
              <span className="absolute bottom-3 left-3 text-[11px] text-white/70 bg-black/60 rounded px-2 py-0.5">
                #{comic.serialNumber}
                {comic.totalEditions ? ` of ${comic.totalEditions}` : ''}
              </span>
            )}
            {comic.image && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[28%] aspect-[2/3] rounded-lg overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
                  <Image src={comic.image} alt={comic.title || 'Comic'} fill className="object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 py-1 px-2 pb-2">
          {(comic.series || comic.episode) && (
            <p className="text-white/50 text-xs font-light">
              {[comic.series, comic.episode].filter(Boolean).join(' · ')}
            </p>
          )}
          <h2 className="text-white font-bold text-xl mt-4">{comic.title || 'Comic edition'}</h2>
          {comic.creator && <p className="text-white/40 text-xs font-light">by {comic.creator}</p>}

          <div className="flex items-end justify-between gap-4">
            <div className="flex items-center gap-1">
              <span className="text-secondary-200 font-bold text-3xl leading-none">
                {isLoading ? '--' : comic.listedPriceHbar ?? '--'}
              </span>
              <div className="w-fit h-fit flex items-center justify-center">
                <Image src="/hbar.png" alt="HBAR" width={24} height={24} className="object-cover" />
              </div>
              {usdPrice && <span className="text-white/40 text-sm">≈ ${usdPrice}</span>}
            </div>

            {floorPercent !== undefined && (
              <div className="flex flex-col items-end gap-1 min-w-0">
                <span className="text-[10px] text-white/40">vs floor price</span>
                <div className="w-32 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-[#FAA31E]" style={{ width: `${floorPercent}%` }} />
                </div>
                <span className={`text-[10px] ${atFloor ? 'text-green-400' : 'text-white/40'}`}>
                  {atFloor
                    ? 'At floor - lowest asking price'
                    : `Floor is ${comic.floorPriceHbar} HBAR`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {comic.tokenAddress && (
        <div className="flex items-center justify-between px-4 py-2.5 border border-white/10 rounded-xl bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FAA31E] flex-shrink-0" />
            <span className="text-white/40 text-[10px]">Held on Hedera as an HTS NFT</span>
          </div>
          <a
            href={`${HASHSCAN}/token/${comic.tokenAddress}`}
            target="_blank"
            rel="noreferrer"
            className="text-[#FAA31E] text-[10px] hover:underline"
          >
            View on Hashscan
          </a>
        </div>
      )}
    </div>
  )
}
