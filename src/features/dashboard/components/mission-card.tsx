'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { MainButton } from '@/components/button'
import { DAILY_MISSIONS } from '../data/data'

export default function MissionCard({ mission }: { mission: typeof DAILY_MISSIONS[0] }) {
  const router = useRouter()
  const progressPct = mission.progressMax > 0 ? (mission.progress / mission.progressMax) * 100 : 0

  return (
    <div className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl p-5 flex gap-5 items-start">
      {/* Image */}
      <div className="flex-shrink-0 flex items-center justify-center w-24 h-24">
        <Image
          src={mission.image}
          alt={mission.title}
          width={96}
          height={96}
          className="object-contain"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-3 min-w-0 justify-between">
        <h3 className="font-bold text-white text-lg leading-tight">{mission.title}</h3>

        {/* Progress bar with count */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-primary-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs text-white/40 flex-shrink-0">
            {mission.progress}/{mission.progressMax}
          </span>
        </div>

        <span className="text-sm font-bold text-primary-500">+{mission.xp} XP</span>

        <p className="text-xs text-white/50 leading-relaxed">{mission.description}</p>

        <MainButton
          onClick={() => router.push(mission.href)}
          className="w-full"
        >
          {mission.buttonLabel}
        </MainButton>
      </div>
    </div>
  )
}
