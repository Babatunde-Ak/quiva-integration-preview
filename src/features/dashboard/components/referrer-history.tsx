'use client'

import { ArrowRight } from 'lucide-react'
import { useDisclosure } from '@heroui/react'
import { REFERRER_HISTORY } from '../data/data'
import ReferrerHistoryModal from './referrer-history-modal'

export default function ReferrerHistory({ entries }: { entries: typeof REFERRER_HISTORY }) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()

  return (
    <>
      <div className="mt-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-bold text-base">Referrer History</h2>
          <button
            onClick={onOpen}
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div>
          {/* Column headers */}
          <div className="grid grid-cols-3 px-5 py-3 border-b border-white/10">
            <span className="text-sm text-white/50">Profile</span>
            <span className="text-sm text-white/50">Point</span>
            <span className="text-sm text-white/50">Role</span>
          </div>

          {/* Rows */}
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-3 px-5 py-4 border-b border-white/10 last:border-b-0"
            >
              <span className="text-sm text-white/80">{entry.profile}</span>
              <span className="text-sm text-white/80">+{entry.points} XP</span>
              <span className="text-sm text-white/80">{entry.role}</span>
            </div>
          ))}
        </div>
      </div>

      <ReferrerHistoryModal isOpen={isOpen} onOpenChange={onOpenChange} onClose={onClose} />
    </>
  )
}
