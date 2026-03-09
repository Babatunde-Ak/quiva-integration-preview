'use client'

import { useRouter } from 'next/navigation'
import { LucideIcon } from 'lucide-react'

interface ComingSoonProps {
  title: string
  description?: string
  Icon: LucideIcon
}

export default function ComingSoon({ title, description, Icon }: ComingSoonProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-secondary-200/10 border border-secondary-200/30 flex items-center justify-center mx-auto mb-6">
          <Icon className="w-10 h-10 text-secondary-200" />
        </div>
        <p className="text-white/50 mb-2 text-lg font-semibold tracking-wide uppercase text-xs">Coming Soon</p>
        <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          {description ?? "We're working hard to bring you this feature. Check back soon."}
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-full bg-secondary-200 text-black font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}
