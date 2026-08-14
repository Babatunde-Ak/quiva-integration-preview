'use client'

import { ArrowRight } from 'lucide-react'
import { useDisclosure } from '@heroui/react'
import ReferrerHistoryModal from './referrer-history-modal'

export type ReferrerEntry = {
  referee: {
    username: string
    avatar?: string
    walletAddress?: string
  }
  xpAwarded: boolean
  createdAt: string
}

type Props = {
  entries: ReferrerEntry[]
  isLoading?: boolean
}

export default function ReferrerHistory({ entries, isLoading }: Props) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()

  return (
    <>
      <div className="mt-8 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-bold text-base">Referrer History</h2>
          <button
            onClick={onOpen}
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div>
          <div className="grid grid-cols-3 px-5 py-3 border-b border-white/10">
            <span className="text-sm text-white/50">Username</span>
            <span className="text-sm text-white/50">XP Awarded</span>
            <span className="text-sm text-white/50">Joined</span>
          </div>

          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="grid grid-cols-3 px-5 py-4 border-b border-white/10 last:border-b-0">
                {Array.from({ length: 3 }).map((__, j) => (
                  <div key={j} className="h-4 w-20 rounded bg-white/10 animate-pulse" />
                ))}
              </div>
            ))
          ) : entries.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-white/40">
              No referrals yet. Share your invite link to earn XP.
            </div>
          ) : (
            entries.map((entry, i) => (
              <div
                key={`${entry.referee.username}-${i}`}
                className="grid grid-cols-3 px-5 py-4 border-b border-white/10 last:border-b-0"
              >
                <span className="text-sm text-white/80">{entry.referee.username}</span>
                <span className={`text-sm font-medium ${entry.xpAwarded ? 'text-[#FAA31E]' : 'text-white/40'}`}>
                  {entry.xpAwarded ? 'Earned' : 'Pending'}
                </span>
                <span className="text-sm text-white/60">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <ReferrerHistoryModal isOpen={isOpen} onOpenChange={onOpenChange} onClose={onClose} />
    </>
  )
}
