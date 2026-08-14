'use client'

import { useState } from 'react'
import { ExternalLink, X } from 'lucide-react'
import GeneralModal from '@/components/modals/GeneralModal'
import { MainButton } from '@/components/button'

export type SocialTask = {
  _id: string
  title: string
  description?: string
  xpReward: number
  completed: boolean
  actionLink?: string
  url?: string
  metadata?: { instructions?: string; [key: string]: any }
}

type Props = {
  task: SocialTask | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  onConfirm: () => void
  isConfirming?: boolean
}

export default function SocialTaskModal({
  task,
  isOpen,
  onOpenChange,
  onClose,
  onConfirm,
  isConfirming,
}: Props) {
  const [hasClickedUrl, setHasClickedUrl] = useState(false)

  const socialUrl = task?.actionLink || task?.url || ''
  const description = task?.description || task?.metadata?.instructions
  const canConfirm = !socialUrl || hasClickedUrl

  const handleUrlClick = () => {
    setHasClickedUrl(true)
    if (socialUrl) window.open(socialUrl, '_blank', 'noopener,noreferrer')
  }

  const handleClose = () => {
    setHasClickedUrl(false)
    onClose()
  }

  return (
    <GeneralModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={handleClose}
      size="sm"
      backdrop="blur"
      modalContentClass="p-0 bg-[#111]"
    >
      <div className="relative flex flex-col gap-5 px-6 py-7 text-white">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Task info */}
        <div className="pr-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#FAA31E]/70 mb-1">
            Social Task
          </p>
          <h3 className="text-base font-bold leading-snug">{task?.title}</h3>
          {description && (
            <p className="text-sm text-white/55 mt-2 leading-relaxed">{description}</p>
          )}
          <span className="inline-block mt-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAA31E]/20 text-[#FAA31E]">
            +{task?.xpReward} XP
          </span>
        </div>

        {/* Social URL */}
        {socialUrl && (
          <div>
            <p className="text-xs text-white/40 mb-2">Complete the action at the link below:</p>
            <button
              onClick={handleUrlClick}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#FAA31E]/40 transition-all text-sm text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#FAA31E]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FAA31E]/20 transition-colors">
                <ExternalLink className="w-3.5 h-3.5 text-[#FAA31E]" />
              </div>
              <span className="truncate text-white/75 flex-1">{socialUrl}</span>
              {hasClickedUrl && (
                <span className="text-[10px] font-semibold text-green-400 flex-shrink-0">
                  Visited ✓
                </span>
              )}
            </button>
          </div>
        )}

        {/* Confirm */}
        <div className="space-y-2">
          {socialUrl && !hasClickedUrl && (
            <p className="text-xs text-white/35 text-center">
              Visit the link above to unlock the confirm button
            </p>
          )}
          <MainButton
            onClick={() => {
              if (canConfirm && !isConfirming) onConfirm()
            }}
            disabled={!canConfirm || isConfirming}
            className="w-full !rounded-full !bg-[#FAA31E] !border-[#FAA31E] !text-black !shadow-none !font-bold disabled:!opacity-30 disabled:!cursor-not-allowed"
          >
            {isConfirming ? 'Confirming…' : 'Confirm Task'}
          </MainButton>
        </div>
      </div>
    </GeneralModal>
  )
}
