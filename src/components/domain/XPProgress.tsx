import { cn } from "@/lib/utils"

interface XPProgressProps {
  currentXP: number
  maxXP: number
  level: number
  className?: string
}

export function XPProgress({ currentXP, maxXP, level, className }: XPProgressProps) {
  const percentage = Math.min(100, Math.max(0, (currentXP / maxXP) * 100))

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-end mb-2">
        <div>
          <div className="text-sm font-bold text-slate-900">Level {level}</div>
          <div className="text-xs text-slate-500 font-medium">{maxXP - currentXP} XP to next level</div>
        </div>
        <div className="text-xs font-bold text-primary">
          {currentXP.toLocaleString()} / {maxXP.toLocaleString()} XP
        </div>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
