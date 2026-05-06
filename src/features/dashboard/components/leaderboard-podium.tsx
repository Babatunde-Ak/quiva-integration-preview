'use client'

import { ArrowRight } from 'lucide-react'
import { useDisclosure } from '@heroui/react'
import GeneralModal from '@/components/modals/GeneralModal'
import LeaderboardModalContent from './leaderboard-modal'

type LeaderboardUser = {
  username: string
  xp: number
  avatar?: string
}

type Props = {
  topUsers: LeaderboardUser[]
  currentUser?: { rank: number; xp: number } | null
}

export default function LeaderboardPodium({ topUsers, currentUser }: Props) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()

  // Assign ranks 1-3 from the ordered topUsers array (index 0 = rank 1)
  const ranked = topUsers.slice(0, 3).map((u, i) => ({ ...u, rank: i + 1 }))

  // Podium visual order: 2nd (left), 1st (center), 3rd (right)
  const display = [
    ranked.find((e) => e.rank === 2) ?? null,
    ranked.find((e) => e.rank === 1) ?? null,
    ranked.find((e) => e.rank === 3) ?? null,
  ].filter(Boolean) as (LeaderboardUser & { rank: number })[]

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

        {display.length === 0 ? (
          <div className="px-5 pb-6 text-center text-sm text-white/40">No leaderboard data yet.</div>
        ) : (
          <div className="flex items-stretch justify-center gap-3 p-6">
            {display.map((entry) => {
              const isFirst = entry.rank === 1
              return (
                <div
                  key={entry.username}
                  className={`flex-1 flex flex-col items-center justify-between rounded-xl p-5 gap-4 ${
                    isFirst
                      ? 'bg-gradient-to-b from-[#FAA31E] to-black-500'
                      : 'bg-gradient-to-b from-[#1c1c1c] to-black-500'
                  }`}
                >
                  <p className={`text-base font-bold ${isFirst ? 'text-white' : 'text-white/80'}`}>
                    {entry.username}
                  </p>
                  <p
                    className={`text-4xl font-extrabold tracking-tight ${
                      isFirst ? 'text-white' : 'text-white/50'
                    }`}
                  >
                    {entry.xp.toLocaleString()}XP
                  </p>
                  <p className={`text-sm font-medium ${isFirst ? 'text-white/80' : 'text-white/50'}`}>
                    #{entry.rank}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {/* Authenticated user's rank if outside top 3 */}
        {currentUser && (!ranked.find((e) => e.rank <= 3) || currentUser.rank > 3) && (
          <div className="mx-6 mb-4 px-4 py-3 rounded-lg border border-[#FAA31E]/30 bg-[#FAA31E]/5 flex items-center justify-between text-sm">
            <span className="text-white/70">Your rank</span>
            <span className="text-[#FAA31E] font-semibold">
              #{currentUser.rank} · {currentUser.xp.toLocaleString()} XP
            </span>
          </div>
        )}
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
