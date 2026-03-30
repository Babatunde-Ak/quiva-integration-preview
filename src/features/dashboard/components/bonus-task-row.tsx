import { BONUS_TASKS } from '../data/data'

export default function BonusTaskRow({ task }: { task: typeof BONUS_TASKS[0] }) {
  return (
    <div className={`flex items-center justify-between py-3 px-4 border rounded-lg transition-colors ${
      task.done
        ? 'border-[#FAA31E]/50 bg-[#FAA31E]/5'
        : 'border-white/10 bg-transparent'
    }`}>
      <span className={`text-sm ${task.done ? 'text-white/40 line-through' : 'text-white/80'}`}>
        {task.label}
      </span>
      <span className="text-sm font-semibold text-white/70 flex-shrink-0 ml-4">
        +{task.xp} XP
      </span>
    </div>
  )
}
