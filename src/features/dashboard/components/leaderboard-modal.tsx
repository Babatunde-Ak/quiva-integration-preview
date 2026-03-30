'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { MainButton } from '@/components/button'

const MOCK_LEADERBOARD_ROWS = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  username: 'Marxly',
  points: '80XP',
  role: 'Creator',
}))

const TOTAL_PAGES = 20

type Props = { onClose: () => void }

export default function LeaderboardModalContent({ onClose }: Props) {
  const [currentPage, setCurrentPage] = useState(1)

  const visiblePages = [1, 2, 3, 4, 5]

  return (
    <div className="bg-[#111] text-white rounded-xl overflow-hidden min-w-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h2 className="font-bold text-base">Quiva Leaderboard</h2>
        
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-3 px-6 py-3 border-b border-white/10">
        <span className="text-sm text-white/50">Username</span>
        <span className="text-sm text-white/50">Point</span>
        <span className="text-sm text-white/50">Role</span>
      </div>

      {/* Rows */}
      {MOCK_LEADERBOARD_ROWS.map(row => (
        <div key={row.id} className="grid grid-cols-3 px-6 py-4 border-b border-white/10 last:border-b-0">
          <span className="text-sm text-white/80">{row.username}</span>
          <span className="text-sm text-white/80">{row.points}</span>
          <span className="text-sm text-white/80">{row.role}</span>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
        <MainButton
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="!rounded-lg !px-5 !py-2 !text-sm !shadow-none disabled:opacity-40"
        >
          Previous
        </MainButton>

        <div className="flex items-center gap-1.5">
          {visiblePages.map(page => (
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
          <span className="text-white/30 text-sm px-1">···</span>
          <button
            onClick={() => setCurrentPage(10)}
            className={`w-8 h-8 rounded text-sm font-semibold transition-colors ${
              currentPage === 10 ? 'border border-[#FAA31E] text-[#FAA31E]' : 'text-white/50 hover:text-white'
            }`}
          >
            10
          </button>
          <button
            onClick={() => setCurrentPage(TOTAL_PAGES)}
            className={`w-8 h-8 rounded text-sm font-semibold transition-colors ${
              currentPage === TOTAL_PAGES ? 'border border-[#FAA31E] text-[#FAA31E]' : 'text-white/50 hover:text-white'
            }`}
          >
            {TOTAL_PAGES}
          </button>
        </div>

        <MainButton
          onClick={() => setCurrentPage(p => Math.min(TOTAL_PAGES, p + 1))}
          disabled={currentPage === TOTAL_PAGES}
          className="!rounded-lg !px-5 !py-2 !text-sm !shadow-none disabled:opacity-40"
        >
          Next
        </MainButton>
      </div>
    </div>
  )
}
