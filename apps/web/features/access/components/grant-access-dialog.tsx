"use client"

import { UserPlusIcon } from "lucide-react"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { fieldErrors } from "@/lib/form"
import { notifyActionError, notifySuccess } from "@/lib/notify"

import { grantAccess } from "../actions"
import { ACCESS_LEVELS, EChannelAccessLevel, SGrantAccess } from "../schema"

const LEVEL_ITEMS = ACCESS_LEVELS.map((level) => ({
  value: level,
  label: level,
}))

/** Port of `components/chacc/ChaccForm.vue`. */
export function GrantAccessDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <UserPlusIcon data-icon="inline-start" />
        Grant access
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Give access to channel</DialogTitle>
          <DialogDescription>
            Enter the username of an existing panel account.
          </DialogDescription>
        </DialogHeader>
        <GrantAccessForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function GrantAccessForm({ onDone }: { onDone: () => void }) {
  const [pending, startTransition] = useTransition()
  const [username, setUsername] = useState("")
  const [accessLevel, setAccessLevel] = useState<EChannelAccessLevel>(
    EChannelAccessLevel.Mod
  )

  const parsed = SGrantAccess.safeParse({ username, accessLevel })
  const errors = fieldErrors(parsed)
  const showUsernameError = username !== "" && !!errors.username

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!parsed.success) return
    const data = parsed.data

    startTransition(async () => {
      const result = await grantAccess(data)
      if (!result.ok) {
        notifyActionError("Error occurred while granting access", result)
        return
      }
      notifySuccess("Access granted", `${data.username} (${data.accessLevel})`)
      onDone()
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={showUsernameError || undefined}>
          <FieldLabel htmlFor="chacc-username">Username</FieldLabel>
          <Input
            id="chacc-username"
            name="username"
            placeholder="username"
            autoComplete="off"
            value={username}
            aria-invalid={showUsernameError || undefined}
            onChange={(event) => setUsername(event.target.value)}
          />
          {showUsernameError && <FieldError errors={errors.username} />}
        </Field>
        <Field>
          <FieldLabel htmlFor="chacc-level">Access level</FieldLabel>
          <Select
            items={LEVEL_ITEMS}
            value={accessLevel}
            onValueChange={(value) => value && setAccessLevel(value)}
          >
            <SelectTrigger id="chacc-level" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {LEVEL_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />} disabled={pending}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={!parsed.success || pending}>
          {pending && <Spinner data-icon="inline-start" />}
          Grant access
        </Button>
      </DialogFooter>
    </form>
  )
}
