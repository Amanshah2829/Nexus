import { cn } from "@/app/lib/utils"
import { Button } from "./button"
import { Input } from "./input"
import { X, Filter, ChevronDown } from "lucide-react"
import React, { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "./dropdown-menu"

interface FilterOption {
  label: string
  value: string
  count?: number
}

interface FilterBarProps {
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  filters?: {
    [key: string]: {
      label: string
      options: FilterOption[]
      value: string[]
      onChange: (values: string[]) => void
    }
  }
  className?: string
}

export function FilterBar({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters = {},
  className,
}: FilterBarProps) {
  const activeFilterCount = Object.values(filters).reduce(
    (count, filter) => count + filter.value.length,
    0
  )

  return (
    <div className={cn("flex flex-col gap-3 p-4 bg-muted/20 rounded-lg border border-border/30", className)}>
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background border-border/50"
          />
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        {searchValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange("")}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Dropdowns */}
      {Object.entries(filters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, filter]) => (
            <DropdownMenu key={key}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-2 border-border/50",
                    filter.value.length > 0 && "border-primary/50 bg-primary/5"
                  )}
                >
                  {filter.label}
                  {filter.value.length > 0 && (
                    <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full text-xs font-semibold">
                      {filter.value.length}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-card border-border/50">
                <DropdownMenuLabel className="font-semibold text-foreground">
                  {filter.label}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/30" />
                {filter.options.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={filter.value.includes(option.value)}
                    onCheckedChange={(checked) => {
                      const newValues = checked
                        ? [...filter.value, option.value]
                        : filter.value.filter((v) => v !== option.value)
                      filter.onChange(newValues)
                    }}
                    className="font-medium cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span>{option.label}</span>
                      {option.count !== undefined && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          ({option.count})
                        </span>
                      )}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}

          {/* Clear All Button */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                Object.values(filters).forEach((filter) => filter.onChange([]))
              }}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Active Filter Display */}
      {activeFilterCount > 0 && (
        <div className="text-xs text-muted-foreground">
          {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} applied
        </div>
      )}
    </div>
  )
}
