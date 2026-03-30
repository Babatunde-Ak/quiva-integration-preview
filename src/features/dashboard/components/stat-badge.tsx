export default function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-white/50 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-semibold text-white truncate">{value}</span>
    </div>
  )
}
