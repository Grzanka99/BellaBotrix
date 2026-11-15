"use client"

import { CrosshairIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useTransition } from "react"

import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { PageHeader } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAutoRefresh } from "@/hooks/use-auto-refresh"
import { notifyActionError, notifySuccess } from "@/lib/notify"

import { deleteR6dleOperator, updateR6dleOperator } from "../actions"
import type { R6dleOperator } from "../schema"
import { filterOperators, r6dleStore, type R6dleProps } from "../store"
import { OperatorFormDialog } from "./operator-form-dialog"

const COLUMNS = 11

/** Port of `pages/panel/r6dle.vue`. */
export function R6dleView(props: R6dleProps) {
  // Same cadence as the Nuxt store.
  useAutoRefresh(10_000)

  return (
    <r6dleStore.Provider props={props}>
      <PageHeader
        title="R6Dle Operators"
        description="Operators the r6dle chat game picks from."
      >
        {props.canEdit && <NewOperatorButton />}
      </PageHeader>
      {!props.canEdit && (
        <Alert>
          <AlertDescription>
            Read only: changing operators requires the r6dleadmin permission.
          </AlertDescription>
        </Alert>
      )}
      <R6dleContent />
    </r6dleStore.Provider>
  )
}

function NewOperatorButton() {
  return (
    <OperatorFormDialog
      trigger={<Button />}
      triggerLabel={
        <>
          <PlusIcon data-icon="inline-start" />
          Add new operator
        </>
      }
    />
  )
}

function R6dleContent() {
  const operators = r6dleStore.useStore((state) => state.operators)
  const query = r6dleStore.useStore((state) => state.query)
  const setQuery = r6dleStore.useStore((state) => state.setQuery)
  const filtered = filterOperators(operators, query)

  if (operators.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CrosshairIcon />
          </EmptyMedia>
          <EmptyTitle>Found 0 operators</EmptyTitle>
          <EmptyDescription>Add operators for the r6dle game.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search by name..."
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Enabled</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Org</TableHead>
            <TableHead>Squad</TableHead>
            <TableHead className="text-right">Release</TableHead>
            <TableHead className="text-right">Speed</TableHead>
            <TableHead className="w-48">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((operator) => (
            <OperatorRow key={operator.id} operator={operator} />
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={COLUMNS}
                className="h-24 text-center text-muted-foreground"
              >
                No operators match &quot;{query}&quot;
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function OperatorRow({ operator }: { operator: R6dleOperator }) {
  const canEdit = r6dleStore.useStore((state) => state.canEdit)
  const patchOperator = r6dleStore.useStore((state) => state.patchOperator)
  const [togglePending, startToggle] = useTransition()

  function onEnabledChange(enabled: boolean) {
    patchOperator(operator.id, { enabled })
    startToggle(async () => {
      const result = await updateR6dleOperator({ id: operator.id, enabled })
      if (!result.ok) {
        patchOperator(operator.id, { enabled: !enabled })
        notifyActionError("Error occurred while updating operator", result)
      }
    })
  }

  async function onDelete() {
    const result = await deleteR6dleOperator({ id: operator.id })
    if (!result.ok) {
      notifyActionError("Error occurred while deleting operator", result)
      return false
    }
    notifySuccess("Operator deleted")
  }

  return (
    <TableRow>
      <TableCell>
        <Switch
          checked={operator.enabled}
          disabled={!canEdit || togglePending}
          onCheckedChange={onEnabledChange}
          aria-label={operator.enabled ? "Disable operator" : "Enable operator"}
        />
      </TableCell>
      <TableCell className="font-medium">{operator.name}</TableCell>
      <TableCell>{operator.gender}</TableCell>
      <TableCell className="whitespace-normal">
        {operator.role.join(", ")}
      </TableCell>
      <TableCell>{operator.side}</TableCell>
      <TableCell>{operator.country}</TableCell>
      <TableCell>{operator.org}</TableCell>
      <TableCell>{operator.squad}</TableCell>
      <TableCell className="text-right tabular-nums">
        {operator.release}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {operator.speed}
      </TableCell>
      <TableCell>
        {canEdit && (
          <div className="flex justify-end gap-2">
            <OperatorFormDialog
              operator={operator}
              trigger={<Button variant="outline" size="sm" />}
              triggerLabel={
                <>
                  <PencilIcon data-icon="inline-start" />
                  Edit
                </>
              }
            />
            <ConfirmDeleteDialog
              trigger={<Button variant="destructive" size="sm" />}
              triggerLabel={
                <>
                  <Trash2Icon data-icon="inline-start" />
                  Delete
                </>
              }
              title={`Delete ${operator.name}?`}
              description="The operator is removed from the r6dle game. This can't be undone."
              onConfirm={onDelete}
            />
          </div>
        )}
      </TableCell>
    </TableRow>
  )
}
