import { cn } from "@/app/lib/utils"
import { Button } from "./button"
import React from "react"

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    href?: string
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const buttonContent = (
    <>
      {action?.label}
    </>
  )

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-12 rounded-xl border-2 border-dashed border-border bg-muted/30",
      className
    )}>
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
      )}
      
      {action && (
        action.href ? (
          <Button asChild className="gap-2">
            <a href={action.href}>
              {buttonContent}
            </a>
          </Button>
        ) : (
          <Button onClick={action.onClick} className="gap-2">
            {buttonContent}
          </Button>
        )
      )}
    </div>
  )
}
