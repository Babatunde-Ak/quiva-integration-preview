'use client'

import Image from 'next/image'
import { Lock } from 'lucide-react'
import { MainButton } from '@/components/button'
import { MILESTONES } from '../data/data'

type Props = {
  milestone: typeof MILESTONES[0]
  locked?: boolean
  completed?: boolean
  isClaiming?: boolean
  onClaim?: () => void
}

export default function MilestoneCard({
  milestone,
  locked = false,
  completed = false,
  isClaiming = false,
  onClaim,
}: Props) {
  const xpDisplay =
    milestone.xp >= 1000
      ? `${(milestone.xp / 1000).toFixed(milestone.xp % 1000 === 0 ? 0 : 1)}K`
      : String(milestone.xp)

  const isClaimable = !locked && !completed && !isClaiming && !!onClaim

  let buttonLabel = `Claim ${xpDisplay}XP`
  if (locked) buttonLabel = 'Locked'
  else if (completed) buttonLabel = 'Claimed'
  else if (isClaiming) buttonLabel = 'Claiming...'

  return (
    <div className="border-t border-white/10 pt-4">
      {/* Streak label */}
      <p className="text-white font-bold text-sm mb-1 flex items-center gap-2">
        {milestone.streakLabel}
        {locked && <Lock className="w-3 h-3 text-white/30" />}
      </p>

      {/* Issue + title */}
      <p className="font-mono text-sm mb-4">
        <span className={`font-bold ${locked ? 'text-white/40' : 'text-white'}`}>
          {milestone.issueNumber}:
        </span>{' '}
        <span className={locked ? 'text-white/30' : 'text-[#FAA31E]'}>{milestone.title}</span>
      </p>

      {/* Image + description */}
      <div className="flex gap-5 items-start mb-4">
        <div className="w-28 flex-shrink-0">
          <Image
            src={locked || completed ? '/book-colored.png' : '/book-verticle.png'}
            alt={milestone.title}
            width={112}
            height={112}
            className={`object-contain w-full h-auto ${locked ? 'opacity-40' : ''}`}
          />
        </div>
        <p className={`text-sm leading-relaxed pt-1 ${locked ? 'text-white/30' : 'text-white/70'}`}>
          {milestone.description}
        </p>
      </div>

      {/* Claim button */}
      <MainButton
        disabled={!isClaimable}
        onClick={isClaimable ? onClaim : undefined}
        className={`w-full ${
          isClaimable
            ? '!text-white'
            : '!bg-primary-500/40 !text-white/40 !cursor-not-allowed'
        }`}
      >
        {buttonLabel}
      </MainButton>
    </div>
  )
}
