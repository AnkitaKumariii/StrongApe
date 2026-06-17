import { Flame } from "lucide-react"

import { cn } from "@/lib/utils"

interface StreakBadgeProps {
  days: number
  active?: boolean
  className?: string
}

export function StreakBadge({ days, active = true, className }: StreakBadgeProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-2 overflow-hidden px-3 py-1.5 rounded-xl border font-semibold",
        active
          ? "bg-primary/10 border-primary/20 text-primary"
          : "bg-slate-100 border-slate-200 text-slate-400",
        className
      )}
    >


      <Flame className={cn("relative z-10 w-5 h-5", active ? "text-primary fill-primary" : "")} />

      <div className="relative z-10 flex items-baseline gap-1">
        <span className="text-lg leading-none">{days}</span>
        <span className="text-xs font-medium uppercase tracking-wider opacity-80">
          Day Streak
        </span>
      </div>
    </div>
  )
}
