'use client'

import { useEffect, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import GeneralModal from '@/components/modals/GeneralModal'
import { MainButton } from '@/components/button'
import { useAppDispatch, useAppSelector } from '@/redux/hook'
import { getReferralHistory } from '@/redux/slices/dashboardSlice'
import type { ReferrerEntry } from './referrer-history'

const ITEMS_PER_PAGE = 10

type Props = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
}

export default function ReferrerHistoryModal({ isOpen, onOpenChange, onClose }: Props) {
  const dispatch = useAppDispatch()
  const { data, total, isLoading } = useAppSelector((s) => s.dashboard.referralHistory)
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dispatch(getReferralHistory({ page: currentPage, limit: ITEMS_PER_PAGE } as any))
    }
  }, [isOpen, currentPage, dispatch])

  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const visiblePages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1)

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
        <div className="flex justify-end px-6 py-3 border-b border-white/10">
          <button className="flex items-center gap-1.5 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white/70 hover:text-white transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="grid grid-cols-3 px-6 py-3 border-b border-white/10">
          <span className="text-sm text-white/50">Username</span>
          <span className="text-sm text-white/50">XP Awarded</span>
          <span className="text-sm text-white/50">Joined</span>
        </div>

        {isLoading ? (
          Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <div key={i} className="grid grid-cols-3 px-6 py-4 border-b border-white/10 last:border-b-0">
              {Array.from({ length: 3 }).map((__, j) => (
                <div key={j} className="h-4 w-24 rounded bg-white/10 animate-pulse" />
              ))}
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-white/40">
            No referrals yet. Share your invite link to start earning XP.
          </div>
        ) : (
          (data as ReferrerEntry[]).map((row, i) => (
            <div key={`${row.referee.username}-${i}`} className="grid grid-cols-3 px-6 py-4 border-b border-white/10 last:border-b-0">
              <span className="text-sm text-white/80">{row.referee.username}</span>
              <span className={`text-sm font-medium ${row.xpAwarded ? 'text-[#FAA31E]' : 'text-white/40'}`}>
                {row.xpAwarded ? 'Earned' : 'Pending'}
              </span>
              <span className="text-sm text-white/60">
                {new Date(row.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))
        )}

        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
          <MainButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="!rounded-lg !px-5 !py-2 !text-sm !shadow-none disabled:opacity-40"
          >
            Previous
          </MainButton>

          <div className="flex items-center gap-1.5">
            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
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
                  onClick={() => handlePageChange(totalPages)}
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
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="!rounded-lg !px-5 !py-2 !text-sm !shadow-none disabled:opacity-40"
          >
            Next
          </MainButton>
        </div>
      </div>
    </GeneralModal>
  )
}
