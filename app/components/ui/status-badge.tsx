import { cn } from "@/app/lib/utils"
import React from "react"

interface StatusBadgeProps {
  status: "success" | "warning" | "destructive" | "info" | "pending"
  label: string
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

const statusConfig = {
  success: {
    bgClass: "bg-success/10",
    textClass: "text-success",
    borderClass: "border-success/20",
  },
  warning: {
    bgClass: "bg-warning/10",
    textClass: "text-warning",
    borderClass: "border-warning/20",
  },
  destructive: {
    bgClass: "bg-destructive/10",
    textClass: "text-destructive",
    borderClass: "border-destructive/20",
  },
  info: {
    bgClass: "bg-info/10",
    textClass: "text-info",
    borderClass: "border-info/20",
  },
  pending: {
    bgClass: "bg-warning/10",
    textClass: "text-warning",
    borderClass: "border-warning/20",
  },
}

export function StatusBadge({
  status,
  label,
  icon: Icon,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-medium text-sm",
      config.bgClass,
      config.textClass,
      config.borderClass,
      className
    )}>
      {Icon && <Icon className="h-4 w-4" />}
      <span>{label}</span>
    </div>
  )
}
