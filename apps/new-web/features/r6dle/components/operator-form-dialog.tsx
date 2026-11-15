"use client"

import type {
  ER6DleOrg,
  ER6DleRegion,
  ER6DleRole,
  ER6DleSquad,
  ER6dleGender,
} from "r6dle"
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
import { Spinner } from "@/components/ui/spinner"
import { CheckboxList } from "@/features/permissions/components/checkbox-list"
import { fieldErrors } from "@/lib/form"
import { notifyActionError, notifySuccess } from "@/lib/notify"

import { createR6dleOperator, updateR6dleOperator } from "../actions"
import {
  GENDER_OPTIONS,
  NEW_OPERATOR_DEFAULTS,
  ORG_OPTIONS,
  REGION_OPTIONS,
  RELEASE_OPTIONS,
  ROLE_OPTIONS,
  SCreateOperator,
  SIDE_OPTIONS,
  SPEED_OPTIONS,
  SQUAD_OPTIONS,
  type R6dleOperator,
} from "../schema"
import { OptionSelect } from "./option-select"

/**
 * Port of `NewR6DleOperatorModal.vue` (no `operator`) and
 * `EditR6DleOperatorModal.vue` (`operator`; the name can't be changed).
 */
export function OperatorFormDialog({
  operator,
  trigger,
  triggerLabel,
}: {
  operator?: R6dleOperator
  trigger: React.ReactElement
  triggerLabel: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger}>{triggerLabel}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {operator
              ? `Edit properties of: ${operator.name}`
              : "Add new operator"}
          </DialogTitle>
          <DialogDescription>
            {operator
              ? "Change how this operator is described in the r6dle game."
              : "Add new operator into r6dle game."}
          </DialogDescription>
        </DialogHeader>
        <OperatorForm operator={operator} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function OperatorForm({
  operator,
  onDone,
}: {
  operator?: R6dleOperator
  onDone: () => void
}) {
  const [pending, startTransition] = useTransition()
  const initial = operator ?? NEW_OPERATOR_DEFAULTS
  const [name, setName] = useState(operator?.name ?? "")
  const [gender, setGender] = useState<ER6dleGender>(initial.gender)
  const [role, setRole] = useState<ER6DleRole[]>(operator?.role ?? [])
  const [side, setSide] = useState<"Attack" | "Defence">(initial.side)
  const [country, setCountry] = useState(operator?.country ?? "")
  const [region, setRegion] = useState<ER6DleRegion>(initial.region)
  const [org, setOrg] = useState<ER6DleOrg>(initial.org)
  const [squad, setSquad] = useState<ER6DleSquad>(initial.squad)
  const [release, setRelease] = useState(initial.release)
  const [speed, setSpeed] = useState(initial.speed)

  const parsed = SCreateOperator.safeParse({
    name,
    gender,
    role,
    side,
    country,
    region,
    org,
    squad,
    release,
    speed,
    enabled: operator?.enabled ?? true,
  })
  const errors = fieldErrors(parsed)

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!parsed.success) return
    const { name: _name, enabled, ...fields } = parsed.data

    startTransition(async () => {
      if (operator) {
        // `enabled` is left alone (the Nuxt modal re-enabled on every edit).
        const result = await updateR6dleOperator({ id: operator.id, ...fields })
        if (!result.ok) {
          notifyActionError("Error occurred while updating operator", result)
          return
        }
        notifySuccess("Operator updated")
      } else {
        const result = await createR6dleOperator({
          name: _name,
          enabled,
          ...fields,
        })
        if (!result.ok) {
          notifyActionError("Error occurred while creating operator", result)
          return
        }
        notifySuccess("Operator created")
      }
      onDone()
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <FieldGroup className="gap-6">
        {!operator && (
          <Field data-invalid={(name !== "" && !!errors.name) || undefined}>
            <FieldLabel htmlFor="operator-name">Operator name</FieldLabel>
            <Input
              id="operator-name"
              name="name"
              value={name}
              autoComplete="off"
              aria-invalid={(name !== "" && !!errors.name) || undefined}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          <OptionSelect
            id="operator-side"
            label="Side"
            options={SIDE_OPTIONS}
            value={side}
            onChange={setSide}
          />
          <OptionSelect
            id="operator-gender"
            label="Gender"
            options={GENDER_OPTIONS}
            value={gender}
            onChange={setGender}
          />
          <Field
            data-invalid={(country !== "" && !!errors.country) || undefined}
          >
            <FieldLabel htmlFor="operator-country">Country</FieldLabel>
            <Input
              id="operator-country"
              name="country"
              value={country}
              autoComplete="off"
              aria-invalid={(country !== "" && !!errors.country) || undefined}
              onChange={(event) => setCountry(event.target.value)}
            />
          </Field>
          <OptionSelect
            id="operator-region"
            label="Region"
            options={REGION_OPTIONS}
            value={region}
            onChange={setRegion}
          />
          <OptionSelect
            id="operator-squad"
            label="Squad"
            options={SQUAD_OPTIONS}
            value={squad}
            onChange={setSquad}
          />
          <OptionSelect
            id="operator-org"
            label="Organization"
            options={ORG_OPTIONS}
            value={org}
            onChange={setOrg}
          />
          <OptionSelect
            id="operator-speed"
            label="Speed"
            options={SPEED_OPTIONS}
            value={speed}
            onChange={setSpeed}
          />
          <OptionSelect
            id="operator-release"
            label="Release"
            options={RELEASE_OPTIONS}
            value={release}
            onChange={setRelease}
          />
        </div>
        <Field>
          <CheckboxList
            id="operator-role"
            legend="Role (at least one)"
            options={ROLE_OPTIONS}
            value={role}
            onChange={setRole}
          />
          {role.length === 0 && <FieldError>Pick at least one role</FieldError>}
        </Field>
      </FieldGroup>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />} disabled={pending}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={!parsed.success || pending}>
          {pending && <Spinner data-icon="inline-start" />}
          {operator ? "Save" : "Add"}
        </Button>
      </DialogFooter>
    </form>
  )
}
