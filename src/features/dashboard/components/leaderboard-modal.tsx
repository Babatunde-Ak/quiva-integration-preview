'use client'

import { useEffect, useState } from 'react'
import { MainButton } from '@/components/button'
import { useAppDispatch, useAppSelector } from '@/redux/hook'
import { getLeaderboardFull } from '@/redux/slices/dashboardSlice'

const ITEMS_PER_PAGE = 10

type Props = { onClose: () => void }

export default function LeaderboardModalContent({ onClose }: Props) {
  const dispatch = useAppDispatch()
  const { allUsers, isLoading } = useAppSelector((s) => s.dashboard.leaderboard)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dispatch(getLeaderboardFull({ limit: 100 } as any))
  }, [dispatch])

  const totalPages = Math.max(1, Math.ceil(allUsers.length / ITEMS_PER_PAGE))
  const pageUsers = allUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
  const visiblePages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1)

  return (
    <div className="bg-[#111] text-white rounded-xl overflow-hidden min-w-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h2 className="font-bold text-base">Quiva Leaderboard</h2>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-3 px-6 py-3 border-b border-white/10">
        <span className="text-sm text-white/50">Rank</span>
        <span className="text-sm text-white/50">Username</span>
        <span className="text-sm text-white/50">XP</span>
      </div>

      {/* Rows */}
      {isLoading ? (
        Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
          <div key={i} className="grid grid-cols-3 px-6 py-4 border-b border-white/10 last:border-b-0">
            {Array.from({ length: 3 }).map((__, j) => (
              <div key={j} className="h-4 w-24 rounded bg-white/10 animate-pulse" />
            ))}
          </div>
        ))
      ) : allUsers.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-white/40">No leaderboard data yet.</div>
      ) : (
        pageUsers.map((user, i) => {
          const rank = (currentPage - 1) * ITEMS_PER_PAGE + i + 1
          return (
            <div
              key={user.username ?? i}
              className="grid grid-cols-3 px-6 py-4 border-b border-white/10 last:border-b-0"
            >
              <span className="text-sm text-white/50">#{rank}</span>
              <span className="text-sm text-white/80">{user.username}</span>
              <span className="text-sm text-white/80">{user.xp?.toLocaleString()} XP</span>
            </div>
          )
        })
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
        <MainButton
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="!rounded-lg !px-5 !py-2 !text-sm !shadow-none disabled:opacity-40"
        >
          Previous
        </MainButton>

        <div className="flex items-center gap-1.5">
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded text-sm font-semibold transition-colors ${
                currentPage === page
                  ? 'border border-[#FAA31E] text-[#FAA31E]'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {page}
            </button>
          ))}
          {totalPages > 5 && (
            <>
              <span className="text-white/30 text-sm px-1">···</span>
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`w-8 h-8 rounded text-sm font-semibold transition-colors ${
                  currentPage === totalPages
                    ? 'border border-[#FAA31E] text-[#FAA31E]'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <MainButton
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="!rounded-lg !px-5 !py-2 !text-sm !shadow-none disabled:opacity-40"
        >
          Next
        </MainButton>
      </div>
    </div>
  )
}
