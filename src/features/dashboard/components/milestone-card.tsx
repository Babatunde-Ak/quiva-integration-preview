'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useDisclosure } from '@heroui/react'
import { MainButton } from '@/components/button'
import ClaimSuccessModal from './claim-success-modal'
import { MILESTONES } from '../data/data'

export default function MilestoneCard({ milestone }: { milestone: typeof MILESTONES[0] }) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const [claimed, setClaimed] = useState(false)

  const xpDisplay =
    milestone.xp >= 1000
      ? `${(milestone.xp / 1000).toFixed(milestone.xp % 1000 === 0 ? 0 : 1)}K`
      : String(milestone.xp)

  const handleClaim = () => {
    setClaimed(true)
    onOpen()
  }

  return (
    <>
      <div className="border-t border-white/10 pt-4">
        {/* Streak label */}
        <p className="text-white font-bold text-sm mb-1">{milestone.streakLabel}</p>

        {/* Issue + title */}
        <p className="font-mono text-sm mb-4">
          <span className="text-white font-bold">{milestone.issueNumber}:</span>{' '}
          <span className="text-[#FAA31E]">{milestone.title}</span>
        </p>

        {/* Image + description */}
        <div className="flex gap-5 items-start mb-4">
          <div className="w-28 flex-shrink-0">
            <Image
              src={milestone.claimable ? '/book-verticle.png' : '/book-colored.png'}
              alt={milestone.title}
              width={112}
              height={112}
              className="object-contain w-full h-auto"
            />
          </div>
          <p className="text-sm text-white/70 leading-relaxed pt-1">{milestone.description}</p>
        </div>

        {/* Claim button */}
        <MainButton
          disabled={!milestone.claimable || claimed}
          onClick={handleClaim}
          className={`w-full ${
            milestone.claimable && !claimed
              ? '!text-white'
              : '!bg-primary-500/40 !text-white/40 !cursor-not-allowed'
          }`}
        >
          {claimed ? 'Claimed' : `Claim ${xpDisplay}XP`}
        </MainButton>
      </div>

      <ClaimSuccessModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={onClose}
        xp={milestone.xp}
      />
    </>
  )
}
