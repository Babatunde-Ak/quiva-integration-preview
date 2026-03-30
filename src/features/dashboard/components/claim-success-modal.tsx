import Image from 'next/image'
import { X } from 'lucide-react'
import GeneralModal from '@/components/modals/GeneralModal'
import { MainButton } from '@/components/button'

type Props = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  xp: number
}

export default function ClaimSuccessModal({ isOpen, onOpenChange, onClose, xp }: Props) {
  return (
    <GeneralModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={onClose}
      size="sm"
      backdrop="blur"
      modalContentClass="p-0 bg-[#111]"
    >
      <div className="relative flex flex-col items-center gap-4 px-8 py-8 text-white text-center">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Illustration */}
        <div className="w-40 h-40 flex items-center justify-center">
          <Image
            src="/task-success-img.png"
            alt="Claimed"
            width={160}
            height={160}
            className="object-contain"
          />
        </div>

        {/* Message */}
        <p className="text-base font-mono text-white/80">
          {xp}XP claimed successfully
        </p>

        {/* Continue */}
        <MainButton
          onClick={onClose}
          className="w-full !rounded-full !bg-[#FAA31E] !border-[#FAA31E] !text-black !shadow-none !font-bold"
        >
          Continue
        </MainButton>
      </div>
    </GeneralModal>
  )
}
