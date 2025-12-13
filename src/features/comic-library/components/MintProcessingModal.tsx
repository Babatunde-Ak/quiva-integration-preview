'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

interface MintProcessingModalProps {
  isOpen: boolean
}

const MintProcessingModal: React.FC<MintProcessingModalProps> = ({
  isOpen
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div 
        className="relative bg-[#1A1A1A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        style={{
          width: '638px',
          height: '449px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px'
        }}
      >
        {/* Big Loading Icon */}
        <div className="flex justify-center">
          <Loader2 className="w-20 h-20 text-yellow-600 animate-spin" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white text-center">
          Minting in progress…
        </h2>

        {/* Subtitle */}
        <p className="text-white/70 text-sm text-center max-w-xs">
          Your comic is being added to your collection.
        </p>

        
      </div>
    </div>
  )
}

export default MintProcessingModal
