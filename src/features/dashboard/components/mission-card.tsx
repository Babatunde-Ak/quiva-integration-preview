'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { MainButton } from '@/components/button'

type PlatformTask = {
  _id: string
  type: string
  count: number
  target: number
  xpReward: number
  completed: boolean
}

const TASK_CONFIG: Record<string, { title: string; description: string; image: string; href: string; buttonLabel: string }> = {
  READ: {
    title: 'Read Comic',
    description: 'Reading only counts when the final page is reached.',
    image: '/book-colored.png',
    href: '/marketplace/library',
    buttonLabel: 'Start Reading',
  },
  ONCHAIN: {
    title: 'Mint Comic',
    description: 'Purchase a comic from the marketplace to earn daily XP.',
    image: '/dashboard-coin.png',
    href: '/marketplace',
    buttonLabel: 'Go to Marketplace',
  },
}

export default function MissionCard({ task }: { task: PlatformTask }) {
  const router = useRouter()
  const config = TASK_CONFIG[task.type] ?? {
    title: task.type,
    description: '',
    image: '/dashboard-coin.png',
    href: '/marketplace',
    buttonLabel: 'Go',
  }
  const progressPct = task.target > 0 ? Math.min((task.count / task.target) * 100, 100) : 0

  return (
    <div className={`flex-1 bg-[#1a1a1a] border rounded-xl p-5 flex gap-5 items-start transition-colors ${
      task.completed ? 'border-[#FAA31E]/40' : 'border-white/10'
    }`}>
      {/* Image */}
      <div className="flex-shrink-0 flex items-center justify-center w-24 h-24">
        <Image
          src={config.image}
          alt={config.title}
          width={96}
          height={96}
          className={`object-contain ${task.completed ? 'opacity-50' : ''}`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-3 min-w-0 justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-white text-lg leading-tight">{config.title}</h3>
          {task.completed && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAA31E]/20 text-[#FAA31E]">
              Done
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-[#FAA31E] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs text-white/40 flex-shrink-0">
            {task.count}/{task.target}
          </span>
        </div>

        <span className="text-sm font-bold text-[#FAA31E]">+{task.xpReward} XP</span>

        <p className="text-xs text-white/50 leading-relaxed">{config.description}</p>

        <MainButton
          onClick={() => router.push(config.href)}
          disabled={task.completed}
          className="w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {task.completed ? 'Completed' : config.buttonLabel}
        </MainButton>
      </div>
    </div>
  )
}
