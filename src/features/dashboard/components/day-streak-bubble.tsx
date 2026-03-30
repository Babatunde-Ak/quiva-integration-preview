import Image from 'next/image'
import { Check, Flame } from 'lucide-react'
import { STREAK_DAYS } from '../data/data'

export default function DayStreakBubble({ day, label, done }: typeof STREAK_DAYS[0]) {
  if (done) {
    return (
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <span className="text-[10px] text-white/50">{label}</span>
        <div className="w-12 h-12 rounded-xl overflow-hidden relative flex items-center justify-center">
          <Image
            src="/small-streak-card-bg.png"
            alt="streak day"
            fill
            className="object-cover"
          />
          <Flame className="absolute top-1 right-1 w-3 h-3 text-[#FAA31E] z-10" />
          <Check className="w-5 h-5 text-[#FAA31E] relative z-10" strokeWidth={3} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <span className="text-[10px] text-white/50">{label}</span>
      <div className="w-12 h-12 rounded-xl bg-[#1e1e1e] border border-white/10 flex items-center justify-center">
        <span className="text-normal font-bold text-white">{day}</span>
      </div>
    </div>
  )
}
