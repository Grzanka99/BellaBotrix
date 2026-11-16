"use client"

import { TvIcon } from "lucide-react"
import { useTransition } from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { selectChannel } from "@/features/channel/actions"
import { notifyActionError } from "@/lib/notify"

type ChannelOption = { id: number; name: string }

/** Port of the channel select in `components/navbar/TopBar.vue`. */
export function ChannelSwitcher({
  channels,
  selectedId,
}: {
  channels: ChannelOption[]
  selectedId: number | null
}) {
  const [pending, startTransition] = useTransition()

  const items = channels.map((channel) => ({
    value: String(channel.id),
    label: `#${channel.name}`,
  }))

  function onValueChange(value: string | null) {
    if (!value || Number(value) === selectedId) return

    startTransition(async () => {
      const result = await selectChannel(Number(value))
      if (!result.ok) {
        notifyActionError("Couldn't switch channel", result)
      }
    })
  }

  if (!channels.length) {
    return null
  }

  return (
    <Select
      items={items}
      value={selectedId === null ? null : String(selectedId)}
      onValueChange={onValueChange}
      disabled={pending}
    >
      <SelectTrigger aria-label="Channel" className="min-w-40">
        <TvIcon />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
