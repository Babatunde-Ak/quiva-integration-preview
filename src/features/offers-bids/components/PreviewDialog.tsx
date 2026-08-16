'use client'

import { KeyboardEvent, ReactNode, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface PreviewDialogProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
  className?: string
  labelledBy?: string
}

function getFocusable(container: HTMLElement | null) {
  if (!container) return []
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((node) => {
    const rect = node.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  })
}

export default function PreviewDialog({
  isOpen,
  title,
  onClose,
  children,
  className = '',
  labelledBy,
}: PreviewDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = labelledBy || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    window.setTimeout(() => {
      const focusable = getFocusable(dialogRef.current)
      focusable[0]?.focus()
    }, 0)

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key !== 'Tab') return

    const focusable = getFocusable(dialogRef.current)
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-md"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        className={`relative w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#101010] p-5 shadow-2xl outline-none ${className}`}
      >
        <button
          type="button"
          aria-label={`Close ${title}`}
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-white/40 outline-none transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#FAA31E]"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 id={titleId} className="sr-only">
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}
