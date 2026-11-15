"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import type { TSettingOption } from "../schema"

/** Port of `components/settings/SettingsGroup.vue`. */
export function SettingsGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col [&>[data-slot=setting]+[data-slot=setting]]:border-t">
        {children}
      </CardContent>
    </Card>
  )
}

/**
 * Port of `components/settings/SingleSetting.vue`: name, control,
 * description and the message variables (`$name`, hover for meaning).
 * A disabled setting shows its value instead of the control.
 */
export function SettingRow({
  id,
  label,
  option,
  disabled,
  saving,
  error,
  children,
}: {
  id: string
  label: string
  option: TSettingOption<unknown>
  disabled?: boolean
  saving?: boolean
  error?: string
  children: React.ReactNode
}) {
  const vars = option.vars ? Object.entries(option.vars) : []

  return (
    <div
      data-slot="setting"
      data-disabled={disabled || undefined}
      className={cn(
        "grid gap-3 py-4 md:grid-cols-[minmax(10rem,1fr)_minmax(12rem,28rem)_2fr] md:items-center md:gap-6",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <div className="flex items-center gap-2">
        <Label htmlFor={disabled ? undefined : id} className="capitalize">
          {label}
        </Label>
        {saving && <Spinner className="text-muted-foreground" />}
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        {disabled ? (
          <span className="text-sm break-words">
            {formatValue(option.value)}
          </span>
        ) : (
          children
        )}
        {!disabled && error && <FieldError>{error}</FieldError>}
      </div>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <span>{option.description}</span>
        {vars.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {vars.map(([name, meaning]) => (
              <Tooltip key={name}>
                <TooltipTrigger
                  render={
                    <code className="cursor-help bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground" />
                  }
                >
                  ${name}
                </TooltipTrigger>
                <TooltipContent>{meaning}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ")
  return String(value)
}
