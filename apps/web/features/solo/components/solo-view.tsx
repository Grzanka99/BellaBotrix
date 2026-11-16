"use client"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  RangeSummary,
  UrlPagination,
  UrlSearchInput,
} from "@/components/list-controls"
import { useAutoRefresh } from "@/hooks/use-auto-refresh"

import type { SolosPage } from "../queries"

/** Port of `pages/panel/solo.vue` (read-only). */
export function SoloView({ data }: { data: SolosPage }) {
  // Same cadence as the Nuxt store: refresh every 10 s while the page is open.
  useAutoRefresh(10_000)
  const { rows, page, pageSize, total, totals } = data

  return (
    <>
      <PageHeader
        title="Solo"
        description="Solo duels played in chat."
        toolbar={<UrlSearchInput placeholder="Search by username..." />}
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="tabular-nums">
            Total solos: {totals.total.toLocaleString("en-US")}
          </Badge>
          <Badge variant="secondary" className="tabular-nums">
            Finished solos: {totals.finished.toLocaleString("en-US")}
          </Badge>
        </div>
      </PageHeader>
      <div className="flex flex-col gap-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Finished</TableHead>
              <TableHead>User 1</TableHead>
              <TableHead>User 2</TableHead>
              <TableHead className="w-28 text-right">Points</TableHead>
              <TableHead>Winner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((solo) => (
              <TableRow key={solo.id}>
                <TableCell>
                  {solo.inProgress ? (
                    <Badge variant="outline">in progress</Badge>
                  ) : (
                    <Badge variant="secondary">finished</Badge>
                  )}
                </TableCell>
                <TableCell>{solo.user1}</TableCell>
                <TableCell>{solo.user2}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {solo.points.toLocaleString("en-US")}
                </TableCell>
                <TableCell>{solo.winner}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Found 0 solos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex flex-col items-center gap-2">
          <RangeSummary
            page={page}
            pageSize={pageSize}
            total={total}
            noun="solos"
          />
          <UrlPagination page={page} pageSize={pageSize} total={total} />
        </div>
      </div>
    </>
  )
}
