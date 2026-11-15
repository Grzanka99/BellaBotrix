"use client"

import { Trash2Icon, UsersIcon } from "lucide-react"

import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { useCurrentUser } from "@/components/current-user-provider"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { notifyActionError, notifySuccess } from "@/lib/notify"

import { revokeAccess } from "../actions"
import type { ChannelAccessEntry, OwnChannelAccess } from "../schema"
import { GrantAccessDialog } from "./grant-access-dialog"

/** Port of `pages/panel/access.vue`. */
export function AccessView({ channel, entries }: OwnChannelAccess) {
  if (!channel) {
    return (
      <>
        <PageHeader title="Access" />
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>You don&apos;t have your own channel</EmptyTitle>
            <EmptyDescription>
              You can manage access only to your own channel. Authorize your
              Twitch channel first.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Access"
        description={`You will manage access only to your own channel (#${channel.name})!`}
      >
        <GrantAccessDialog />
      </PageHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead className="w-32">Access</TableHead>
            <TableHead className="w-32">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <AccessRow key={entry.id} entry={entry} />
          ))}
          {entries.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={3}
                className="h-24 text-center text-muted-foreground"
              >
                Nobody has access to this channel yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  )
}

function AccessRow({ entry }: { entry: ChannelAccessEntry }) {
  const user = useCurrentUser()
  const isSelf = entry.userid === user?.id
  const name = entry.username ?? `deleted user #${entry.userid}`

  async function onRevoke() {
    const result = await revokeAccess({ id: entry.id })
    if (!result.ok) {
      notifyActionError("Error occurred while revoking access", result)
      return false
    }
    notifySuccess("Access revoked", name)
  }

  return (
    <TableRow>
      <TableCell
        className={entry.username ? undefined : "text-muted-foreground"}
      >
        {name}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{entry.accessLevel}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex justify-end">
          {isSelf ? (
            <Button variant="destructive" size="sm" disabled>
              <Trash2Icon data-icon="inline-start" />
              Delete
            </Button>
          ) : (
            <ConfirmDeleteDialog
              trigger={<Button variant="destructive" size="sm" />}
              triggerLabel={
                <>
                  <Trash2Icon data-icon="inline-start" />
                  Delete
                </>
              }
              title="Revoke access?"
              description={`${name} will lose access to your channel.`}
              confirmLabel="Revoke"
              onConfirm={onRevoke}
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
