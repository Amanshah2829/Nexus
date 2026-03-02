import { cn } from "@/app/lib/utils"
import { Button } from "./button"
import { Checkbox } from "./checkbox"
import { X, Trash2, Archive, CheckCircle } from "lucide-react"
import React from "react"

interface BulkActionBarProps {
  selectedCount: number
  totalCount: number
  onSelectAll: (checked: boolean) => void
  onClear: () => void
  actions: Array<{
    label: string
    icon: React.ComponentType<{ className?: string }>
    onClick: () => void
    variant?: "default" | "destructive" | "secondary"
    loading?: boolean
  }>
  className?: string
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClear,
  actions,
  className,
}: BulkActionBarProps) {
  const isAllSelected = selectedCount === totalCount && totalCount > 0
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount

  if (selectedCount === 0) return null

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg",
      className
    )}>
      {/* Selection Info */}
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onCheckedChange={(checked) => onSelectAll(checked as boolean)}
          className="h-5 w-5"
        />
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-foreground">
            {selectedCount} selected
          </p>
          <p className="text-xs text-muted-foreground">
            of {totalCount} item{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {actions.map((action, index) => {
          const Icon = action.icon
          const isDestructive = action.variant === "destructive"
          
          return (
            <Button
              key={index}
              variant={action.variant || "secondary"}
              size="sm"
              onClick={action.onClick}
              disabled={action.loading}
              className={cn(
                "gap-2",
                isDestructive && "hover:bg-destructive/90"
              )}
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </Button>
          )
        })}

        {/* Clear Selection */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
