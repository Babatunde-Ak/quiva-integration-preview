'use client'

import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import GeneralModal from '@/components/modals/GeneralModal'
import { MainButton } from '@/components/button'

const MOCK_REFERRERS = [
  { id: 1, username: 'Marxly', points: '53 XP', role: 'Creator' },
  { id: 2, username: 'Mary', points: '88 XP', role: 'Reader' },
  { id: 3, username: 'Saint', points: '37 XP', role: 'Creator' },
  { id: 4, username: 'Mishe', points: '53 XP', role: 'Creator' },
  { id: 5, username: 'Mide', points: '88 XP', role: 'Reader' },
  { id: 6, username: 'Goodness', points: '37 XP', role: 'Creator' },
  { id: 7, username: 'Joy', points: '66 XP', role: 'Creator' },
  { id: 8, username: 'Max', points: '38 XP', role: 'Reader' },
]

const TOTAL_PAGES = 20
const VISIBLE_PAGES = [1, 2, 3, 4, 5]

type Props = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
}

export default function ReferrerHistoryModal({ isOpen, onOpenChange, onClose }: Props) {
  const [currentPage, setCurrentPage] = useState(1)

  return (
    <GeneralModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={onClose}
      size="2xl"
      backdrop="blur"
      modalContentClass="p-0 bg-[#111]"
    >
      <div className="text-white rounded-xl overflow-hidden">
        {/* Filters row */}
        <div className="flex justify-end px-6 py-3 border-b border-white/10">
          <button className="flex items-center gap-1.5 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white/70 hover:text-white transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-3 px-6 py-3 border-b border-white/10">
          <span className="text-sm text-white/50">Username</span>
          <span className="text-sm text-white/50">Point</span>
          <span className="text-sm text-white/50">Role</span>
        </div>

        {/* Rows */}
        {MOCK_REFERRERS.map(row => (
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
            {VISIBLE_PAGES.map(page => (
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
    </GeneralModal>
  )
}
