'use client'

import { Loader2 } from 'lucide-react'

type Task = {
  _id: string
  title: string
  xpReward: number
  completed: boolean
}

type Props = {
  task: Task
  onClaim: () => void
  isClaiming?: boolean
}

export default function BonusTaskRow({ task, onClaim, isClaiming }: Props) {
  return (
    <div
      className={`flex items-center justify-between py-3 px-4 border rounded-lg transition-colors ${
        task.completed
          ? 'border-[#FAA31E]/50 bg-[#FAA31E]/5'
          : 'border-white/10 bg-transparent'
      }`}
    >
      <span className={`text-sm ${task.completed ? 'text-white/40 line-through' : 'text-white/80'}`}>
        {task.title}
      </span>

      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
        <span className="text-sm font-semibold text-white/70">+{task.xpReward} XP</span>

        {task.completed ? (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FAA31E]/20 text-[#FAA31E]">
            Done
          </span>
        ) : (
          <button
            onClick={onClaim}
            disabled={isClaiming}
            className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FAA31E] text-black hover:bg-[#FAA31E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[52px]"
          >
            {isClaiming ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Claim'}
          </button>
        )}
      </div>
    </div>
  )
}
