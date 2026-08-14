'use client'

import { useEffect, useState } from 'react'
import { Hourglass } from 'lucide-react'
import GeneralModal from '@/components/modals/GeneralModal'

const DURATION = 15

type Props = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function TaskTimerModal({ isOpen, onOpenChange }: Props) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setElapsed(0)
      return
    }
    if (elapsed >= DURATION) return
    const t = setTimeout(() => setElapsed((e) => e + 1), 1000)
    return () => clearTimeout(t)
  }, [isOpen, elapsed])

  const progress = Math.min(elapsed / DURATION, 1)
  const remaining = Math.max(DURATION - elapsed, 0)
  const circumference = 2 * Math.PI * 44

  return (
    <GeneralModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="sm"
      backdrop="blur"
      modalContentClass="p-0 bg-[#111]"
    >
      <div className="flex flex-col items-center gap-6 px-8 py-10 text-white text-center">
        {/* Circular ring + animated hourglass */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Background ring */}
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ transform: 'rotate(-90deg)' }}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="5"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#FAA31E"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>

          {/* Hourglass icon — slow spin simulating sand flow */}
          <div style={{ animation: 'spin 4s linear infinite' }}>
            <Hourglass className="w-11 h-11 text-[#FAA31E]" />
          </div>
        </div>

        {/* Copy */}
        <div>
          <p className="text-base font-bold tracking-wide">Verifying your task</p>
          <p className="text-sm text-white/50 mt-1.5 leading-relaxed">
            Please wait while we confirm
            <br />
            your activity…
          </p>
        </div>

        {/* Progress bar + countdown */}
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
            <div
              className="h-1 bg-[#FAA31E] rounded-full"
              style={{ width: `${progress * 100}%`, transition: 'width 1s linear' }}
            />
          </div>
          <p className="text-xs text-white/30">
            {remaining > 0 ? `${remaining}s remaining` : 'Finalising…'}
          </p>
        </div>
      </div>
    </GeneralModal>
  )
}
