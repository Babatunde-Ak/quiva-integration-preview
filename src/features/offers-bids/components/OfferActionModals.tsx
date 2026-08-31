'use client'

import Image from 'next/image'
import { CheckCircle2, PartyPopper } from 'lucide-react'
import { HbarIcon } from '@/components/ui/HbarIcon'
import PreviewDialog from './PreviewDialog'
import { previewOfferComic } from '../data/preview-data'

export type OfferModalType = 'raise' | 'cancel' | 'accepted' | null

interface OfferActionModalsProps {
  activeModal: OfferModalType
  onClose: () => void
  onCancelOffer?: () => void
  onReadNow?: () => void
  onViewEditions?: () => void
}

export default function OfferActionModals({
  activeModal,
  onClose,
  onCancelOffer,
  onReadNow,
  onViewEditions,
}: OfferActionModalsProps) {
  const isRaise = activeModal === 'raise'
  const isCancel = activeModal === 'cancel'
  const isAccepted = activeModal === 'accepted'

  return (
    <>
      <PreviewDialog isOpen={isRaise} title="Raise your bid" onClose={onClose} className="max-w-3xl p-7">
        <div className="space-y-5">
          <div>
            <h3 className="text-xl font-bold text-white">Raise your bid</h3>
            <p className="mt-2 text-sm text-white/40">Shadow Realm - Episode 01 - Open bid</p>
          </div>

          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-white/60">
            <p>You have been outbid. Current highest is</p>
            <div className="mt-3 flex items-center gap-6">
              <span className="flex items-center gap-1 font-bold text-white">145 <HbarIcon size={14} /></span>
              <span>- Raise yours to stay in.</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-white/40">Your current bid</span>
            <span className="flex items-center gap-1 font-bold text-red-400">135 <HbarIcon size={14} /> outbid</span>
          </div>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-white/40">New bid amount</span>
            <div className="mt-3 flex items-center rounded-xl border-2 border-[#FAA31E] bg-[#181818] px-6 py-5">
              <input
                aria-label="New bid amount"
                className="w-full bg-transparent text-4xl font-bold text-white outline-none"
                defaultValue="150"
                inputMode="decimal"
              />
              <HbarIcon size={28} />
            </div>
            <span className="mt-2 block text-xs text-white/35">~ $19.44 - 3.4% above current highest bid</span>
          </label>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {['+1 HBAR', '+5 HBAR', '+10 HBAR', 'Custom'].map((label) => (
              <button
                key={label}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[#FAA31E] ${
                  label === '+10 HBAR'
                    ? 'border-[#FAA31E] bg-[#FAA31E] text-black'
                    : 'border-white/10 bg-transparent text-white/55 hover:border-white/30 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 text-sm text-white/45">
              <span>Additional locked in escrow</span>
              <span className="flex items-center gap-1">+15 <HbarIcon size={14} /></span>
            </div>
            <div className="flex items-center justify-between pt-4 text-sm font-bold text-white">
              <span>New total in escrow</span>
              <span className="flex items-center gap-1 text-[#FAA31E]">150 <HbarIcon size={14} /></span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-white/55">
            <span className="h-3 w-3 rounded-full bg-green-400" />
            Your previous 135 HBAR stays locked. You are only adding 15 HBAR more.
          </div>

          <button className="w-full rounded-xl bg-[#FAA31E] py-4 font-bold text-black outline-none transition hover:bg-[#ffb13b] focus-visible:ring-2 focus-visible:ring-white">
            Raise bid to 150 HBAR
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-white/10 py-3 text-sm text-white/45 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-[#FAA31E]"
          >
            Cancel
          </button>
        </div>
      </PreviewDialog>

      <PreviewDialog isOpen={isCancel} title="Cancel this offer?" onClose={onClose} className="max-w-md">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white">Cancel this offer?</h3>
            <p className="mt-1 text-sm text-white/45">Shadow Realm - Ep.01 #42 - 120 HBAR locked</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center">
            <p className="text-xs text-white/35">You will get back</p>
            <p className="mt-2 flex items-center justify-center gap-2 text-4xl font-bold text-green-400">
              120 <HbarIcon size={24} />
            </p>
            <p className="mt-2 text-xs text-white/35">Returned to your wallet instantly</p>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-white/60">
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            Cancellation is instant. Full amount returned, no fees.
          </div>

          <button
            onClick={onCancelOffer}
            className="w-full rounded-xl bg-red-500 py-3.5 font-bold text-white outline-none transition hover:bg-red-400 focus-visible:ring-2 focus-visible:ring-white"
          >
            Yes, cancel offer
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-white/10 py-3 text-sm text-white/45 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-[#FAA31E]"
          >
            Keep offer active
          </button>
        </div>
      </PreviewDialog>

      <PreviewDialog isOpen={isAccepted} title="Your offer was accepted!" onClose={onClose} className="max-w-lg">
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#FAA31E] text-[#FAA31E]">
            <PartyPopper className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Your offer was accepted!</h3>
            <p className="mt-1 text-sm text-white/45">You now own {previewOfferComic.title} - Ep.03 #7</p>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-green-500 bg-white/[0.03] p-4 text-left">
            <div className="relative h-20 w-16 overflow-hidden rounded-lg">
              <Image src={previewOfferComic.image} alt={previewOfferComic.title} fill className="object-cover" />
            </div>
            <div>
              <p className="text-xs text-white/40">{previewOfferComic.title} - Episode 03</p>
              <h4 className="mt-1 font-bold text-white">Edition #7 of 200</h4>
              <span className="mt-2 inline-flex rounded-full bg-[#FAA31E]/15 px-3 py-1 text-xs font-bold text-[#FAA31E]">
                Epic
              </span>
              <p className="mt-2 text-xs text-white/40">You paid 138 HBAR</p>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-left text-sm text-white/60">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
            <span>
              The edition is now in your collection. Every future resale earns the creator a royalty automatically.
              Preview display only; no blockchain transfer was executed here.
            </span>
          </div>

          <button
            onClick={onReadNow}
            className="w-full rounded-xl bg-[#FAA31E] py-4 font-bold text-black outline-none transition hover:bg-[#ffb13b] focus-visible:ring-2 focus-visible:ring-white"
          >
            Read now
          </button>
          <button
            onClick={onViewEditions}
            className="w-full rounded-xl border border-white/10 py-3.5 text-sm text-white/55 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-[#FAA31E]"
          >
            View in My Editions
          </button>
        </div>
      </PreviewDialog>
    </>
  )
}
