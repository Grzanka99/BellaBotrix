"use client"

import { PencilIcon, Trash2Icon } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAutoRefresh } from "@/hooks/use-auto-refresh"

import type { PermissionEntry } from "../schema"
import {
  filterEntries,
  permissionsStore,
  type PermissionsProps,
} from "../store"
import { EditPermissionsDialog } from "./edit-permissions-dialog"

/** Port of `pages/panel/admin/permissions.vue`. */
export function PermissionsView(props: PermissionsProps) {
  // Same cadence as the Nuxt store.
  useAutoRefresh(10_000)

  return (
    <permissionsStore.Provider props={props}>
      <PageHeader
        title="Permissions"
        description="Panel users, their permissions and their own channel."
      />
      <PermissionsContent />
    </permissionsStore.Provider>
  )
}

function PermissionsContent() {
  const entries = permissionsStore.useStore((state) => state.entries)
  const query = permissionsStore.useStore((state) => state.query)
  const setQuery = permissionsStore.useStore((state) => state.setQuery)
  const filtered = filterEntries(entries, query)

  return (
    <div className="flex flex-col gap-4">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search by username..."
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Id</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead className="w-48">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((entry) => (
            <PermissionRow key={entry.id} entry={entry} />
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                Found 0 users
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function PermissionRow({ entry }: { entry: PermissionEntry }) {
  return (
    <TableRow>
      <TableCell className="tabular-nums">{entry.id}</TableCell>
      <TableCell className="font-medium">{entry.username}</TableCell>
      <TableCell className="whitespace-normal">
        <div className="flex flex-wrap gap-1">
          {entry.perms.map((perm) => (
            <Badge key={perm} variant="secondary">
              {perm}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>
        {entry.channel ?? <span className="text-muted-foreground">-</span>}
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <EditPermissionsDialog
            entry={entry}
            trigger={<Button variant="outline" size="sm" />}
            triggerLabel={
              <>
                <PencilIcon data-icon="inline-start" />
                Edit
              </>
            }
          />
          {/* Deleting panel users is disabled in the Nuxt app too. */}
          <Button variant="destructive" size="sm" disabled>
            <Trash2Icon data-icon="inline-start" />
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
