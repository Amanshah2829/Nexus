import { cn } from "@/app/lib/utils"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import React from "react"

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
  className?: string
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  description,
  className,
}: StatCardProps) {
  return (
    <div className={cn(
      "glass-card p-6 rounded-xl space-y-4 group",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
        </div>
        <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold",
            trend.isPositive
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          )}>
            {trend.isPositive ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
          <p className="text-xs text-muted-foreground">vs last month</p>
        </div>
      )}

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
