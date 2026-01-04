'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface MintProcessingModalProps {
  isOpen: boolean,
  transactionHash?: string
}

const MintProcessingModal: React.FC<MintProcessingModalProps> = ({
  isOpen,
  transactionHash
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop with blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, type: "spring" }}
          className="bg-[#000] border font-mono border-neutral-800 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden"
        >
          {/* Loading Visual   */}
          <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            {/* Outer rotating  */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center text-4xl"
            >
              ⌛
            </motion.div>
            
            {/* Inner yellow spinner */}
            <div className="relative z-10">
              <Loader2 className="w-20 h-20 text-yellow-600 animate-spin" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-3">
            Minting in progress…
          </h2>
          <p className="text-sm text-neutral-400 mb-8 leading-relaxed max-w-xs mx-auto">
            Your comic is being added to your collection.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default MintProcessingModal
