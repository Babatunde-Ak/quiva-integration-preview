'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useDisclosure } from '@heroui/react'
import GeneralModal from '@/components/modals/GeneralModal'
import LeaderboardModalContent from './leaderboard-modal'
import { LEADERBOARD } from '../data/data'

export default function LeaderboardPodium({ entries }: { entries: typeof LEADERBOARD }) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()

  const display = [
    entries.find(e => e.rank === 2)!,
    entries.find(e => e.rank === 1)!,
    entries.find(e => e.rank === 3)!,
  ]

  return (
    <>
      <div className="overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-white font-bold text-base">Leaderboard</h2>
          <button
            onClick={onOpen}
            className="flex items-center border border-white/20 rounded-full px-3 py-1 gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Cards */}
        <div className="flex items-stretch justify-center gap-3 p-6">
          {display.map((entry) => {
            const isFirst = entry.rank === 1
            return (
              <div
                key={entry.name}
                className={`flex-1 flex flex-col items-center justify-between rounded-xl p-5 gap-4 ${
                  isFirst
                    ? 'bg-gradient-to-b from-[#FAA31E] to-black-500'
                    : 'bg-gradient-to-b from-[#1c1c1c] to-black-500'
                }`}
              >
                <p className={`text-base font-bold ${isFirst ? 'text-white' : 'text-white/80'}`}>
                  {entry.name}
                </p>
                <p className={`text-4xl font-extrabold tracking-tight ${isFirst ? 'text-white' : 'text-white/50'}`}>
                  {entry.xp}XP
                </p>
                <p className={`text-sm font-medium ${isFirst ? 'text-white/80' : 'text-white/50'}`}>
                  {entry.role}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <GeneralModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={onClose}
        size="2xl"
        backdrop="blur"
        modalContentClass="p-0 bg-[#111]"
      >
        <LeaderboardModalContent onClose={onClose} />
      </GeneralModal>
    </>
  )
}
