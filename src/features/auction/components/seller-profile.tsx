import Image from 'next/image'
import { CheckCircle } from 'lucide-react'
import { SELLER, COMIC } from '../data/data'

export default function SellerProfile({
  seller,
  comic,
}: {
  seller: typeof SELLER
  comic: typeof COMIC
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Buying from label */}
      <p className="text-xs text-white/40 uppercase tracking-widest">You are buying from</p>

      {/* Seller card */}
      <div className="flex items-center gap-3 border border-white/10 rounded-xl lg:rounded-2xl p-4">
        <div className="w-12 h-12 rounded-full bg-secondary-200 flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
          {seller.initials}
        </div>
        <div>
          <p className="text-xs text-white/40 text-[10px] text-semibold">Holder</p>
          <p className="text-white font-bold mb-2">@{seller.displayName}</p>
          <p className="text-xs text-white/40 text-[10px] font-light">Collector since Jan 2025</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-[10px] text-green-400 border bg-green-400/10 border-green-400/30 rounded-3xl px-4 py-0.5">
              <CheckCircle className="w-2.5 h-2.5" /> Verified
            </span>
            <span className="text-[10px] text-secondary-200 border border-secondary-200 bg-secondary-200/10 rounded-3xl px-4 py-0.5">
              {seller.stats.totalSales} sales . {seller.rating}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Editions held', value: seller.stats.comicsSold },
          { label: 'Sales done', value: seller.stats.totalSales },
          { label: 'Accepted', value: seller.stats.reAccepted },
          { label: 'Active', value: seller.stats.activeDays },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center bg-[#1a1a1a] border border-white/10 rounded-xl py-3">
            <span className="text-secondary-200 font-bold text-lg">{s.value}</span>
            <span className="text-white/40 text-[10px] text-center mt-0.5 font-light">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="border border-white/10 rounded-xl" >
        {/* Comic cover card */}
        <div className="relative w-full rounded-t-xl overflow-hidden bg-[#111]">
          {/* Background image */}
          <div className="relative w-full aspect-[16/9]">
            <Image
              src={comic.backgroundImage}
              alt={comic.title}
              fill
              className="object-cover brightness-50"
            />
            {/* Crown badge */}
            <span className="absolute top-3 right-3 text-2xl select-none">👑</span>
            {/* Edition badge */}
            <span className="absolute bottom-3 left-3 text-[11px] text-white/70 bg-black/60 rounded px-2 py-0.5">
              #{comic.editionNumber} of {comic.totalEditions}
            </span>
            {/* Comic cover floating in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-[28%] aspect-[2/3] rounded-lg overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
                <Image src={comic.image} alt={comic.title} fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Comic info */}
        <div className="flex flex-col gap-1 py-1 px-2 pb-2">
          <p className="text-white/50 text-xs font-light">{comic.series} · {comic.episode}</p>
          <h2 className="text-white font-bold text-xl mt-4">{comic.title}</h2>
          <p className="text-white/40 text-xs font-light">by {comic.creator}</p>
          <div className="flex items-end justify-between gap-4">
            {/* Price */}
            <div className="flex items-center gap-1">
              <span className="text-secondary-200 font-bold text-3xl leading-none">{comic.currentPrice}</span>
              <div className="w-fit h-fit flex items-center justify-center">
                  <Image src="/hbar.png" alt="HBAR" width={24} height={24} className="object-cover" />
                </div>
              <span className="text-white/40 text-sm">≈ ${comic.usdPrice}</span>
            </div>
            {/* Floor price comparison */}
            <div className="flex flex-col items-end gap-1 min-w-0">
              <span className="text-[10px] text-white/40">vs floor price</span>
              <div className="w-32 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#FAA31E]"
                  style={{ width: `${Math.min(comic.floorPercent, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-green-400">✓ {comic.floorStatus}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Activity */}
      <div className="border border-white/10 rounded-xl overflow-hidden">
        {comic.activity.map((a, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-4 py-3 ${i < comic.activity.length - 1 ? 'border-b border-white/10' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${a.type === 'Minted' ? 'bg-[#FAA31E]' : 'bg-green-400'}`} />
              <div>
                <p className="text-white font-semibold text-sm">{a.type}</p>
                <p className="text-white/40 text-xs mt-0.5">
                  {a.type === 'Minted' ? 'by' : 'to'} {a.user} · {a.date}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#FAA31E] font-semibold text-sm">
              <span>{a.amount}</span>
              <Image src="/hbar.png" alt="HBAR" width={14} height={14} className="object-contain opacity-80" />
            </div>
          </div>
        ))}

        {/* Hashscan footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FAA31E] flex-shrink-0" />
            <span className="text-white/40 text-[10px]">On Hedera · {comic.onHatiko} ·</span>
          </div>
          <a href="#" className="text-[#FAA31E] text-[10px] hover:underline">View on Hashscan</a>
        </div>
      </div>
    </div>
  )
}
