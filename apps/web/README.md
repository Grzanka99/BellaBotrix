# web

Next.js 16 (App Router, Turbopack) admin panel for the BellaBotrix Twitch bot.
It replaced the Nuxt 3 panel that used to live in this folder; the page URLs
are the same (`/login`, `/panel`, `/panel/timers`, ...).

Stack: React Server Components + Server Actions, Prisma 5 (shared schema in
`prisma/schema.prisma` at the repo root), iron-session, zod 3, zustand,
shadcn/ui (preset `base-sera`, **Base UI** primitives, not Radix), Tailwind 4,
`lucide-react` icons.

## Commands

Run inside `apps/web` (bun workspaces; install from the repo root).

| Command             | What                                       |
| ------------------- | ------------------------------------------ |
| `bun run dev`       | Dev server on http://localhost:3000        |
| `bun run build`     | Production build                           |
| `bun run start`     | Serve the production build                 |
| `bun run typecheck` | `next typegen && tsc --noEmit`             |
| `bun run lint`      | ESLint (see note below)                    |
| `bun run format`    | Prettier (no semicolons, double quotes)    |

The Prisma client is generated at the repo root (`bun install` runs
`prisma generate` in the root `postinstall`).

Lint note: the workspace packages pull TypeScript 7 to the repo root, which
typescript-eslint can't load. `eslint.typescript-pin.mjs` (imported first by
`eslint.config.mjs`) points it at this app's TypeScript 5.

## Environment

| Variable                              | Required     | Notes                                                                                                 |
| ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| `REMOTE_DB_URL`                       | yes          | Postgres URL used by the Prisma schema. Locally it is read from the repo-root `.env` (see below).      |
| `SESSION_PASSWORD`                    | yes in prod  | Random string, at least 32 chars, encrypts the session cookie. Dev falls back to a fixed insecure value. |
| `REG_TOKEN`                           | for register | Registration token users must enter. Unset = registration disabled.                                   |
| `APP_URL`                             | yes in prod  | Public origin, e.g. `https://panel.example.com`. Twitch redirect URI is `<APP_URL>/api/auth`.          |
| `API_CLIENT_ID` / `API_CLIENT_SECRET` | for OAuth    | Twitch application credentials.                                                                       |
| `SYNC_URL` / `SYNC_KEY`               | yes          | The `sup` sync service (defaults `http://localhost:5000` / `verysecurekey`, same as Nuxt).             |

Local: put app values in `apps/web/.env.local`. `next.config.ts` also
merges the repo-root `.env` (for `REMOTE_DB_URL`); app-level files and the
real environment always win, and a missing root `.env` is fine.

## Vercel

- Root directory: `apps/web`. Node.js 26.x comes from `engines` in
  `package.json`, and `vercel.json` sets the framework to Next.js, so both
  apply even if the project settings still say otherwise.
- Set every variable above (new compared to Nuxt: `SESSION_PASSWORD`).
- `turbopack.root` and `outputFileTracingRoot` point at the monorepo root, so
  workspace packages and the Prisma query engine
  (`node_modules/.prisma/client/libquery_engine-*.so.node`) are traced into the
  server functions. Check the `.next/server/**/*.nft.json` traces if Prisma
  fails to start after a dependency change.
- The Twitch app's OAuth redirect URI must be `<APP_URL>/api/auth`.

## Migration from the Nuxt app

This app was ported from the Nuxt 3 panel, which was removed in the same
change (it is in the git history). Comments such as "Port of
`pages/panel/timers.vue`" or "`server/api/auth.ts`" name files of that old app.

It is a drop-in replacement: same page URLs, same database, same sync service,
same Twitch redirect URI (`<APP_URL>/api/auth`). Deploying it needs the Vercel
project switched to the Next.js framework preset with Node.js 26.x, and
`SESSION_PASSWORD` set. Users have to log in again once (new session cookie);
passwords are unchanged.

### Differences from the Nuxt app

- The `/api/*` REST endpoints are gone except `/api/auth` and
  `/api/auth-redirect`; data goes through Server Components and Server Actions.
- The selected channel is a cookie instead of localStorage, and defaults to the
  first channel the user can access.
- Every read and write is scoped to a channel the user has access to (the Nuxt
  endpoints updated and deleted rows by bare id), and the stream-stats queries
  check that the stream belongs to the channel.
- Users, solo and automod events are searched and paginated on the server.
- The session secret comes from `SESSION_PASSWORD` instead of a value in the
  repository; the Twitch OAuth flow carries a `state` parameter.
- Subcommand editing and overlay element resizing work (both were broken).

## Architecture and conventions

Follow these when adding or changing a page. `features/timers` is the reference
implementation; copy its shape.

### Layout

```
app/                     routes only (thin)
  login/page.tsx
  panel/layout.tsx       auth gate + sidebar shell (requireSession)
  panel/<route>/page.tsx
  api/auth, api/auth-redirect   the only route handlers (Twitch OAuth)
features/<feature>/
  schema.ts              zod schemas + inferred types (port of the Nuxt types/*.type.ts)
  queries.ts             "server-only" reads; each one authenticates + authorizes
  actions.ts             "use server" mutations returning ActionResult
  store.ts               zustand (only when client state is needed)
  components/*.tsx
components/              shared, dumb UI (page-header, search-input, confirm-delete-dialog, ...)
components/ui/           shadcn-generated, do not hand-edit
components/panel/        the panel shell (sidebar, channel switcher, theme toggle)
hooks/                   shared client hooks (use-auto-refresh)
lib/                     client-safe helpers (perms, nav, action-result, notify, form, ...)
lib/server/              server-only core: db, session, auth, action, sync, twitch
proxy.ts                 optimistic redirect of cookie-less /panel requests
```

### Data flow

- No REST API. Pages are async server components that read through
  `features/<f>/queries.ts`; mutations are Server Actions in
  `features/<f>/actions.ts`.
- Route file stays thin: get the channel, load data, render the feature's
  client component, export `metadata.title` (same title as the Nuxt `useHead`).

  ```tsx
  export const metadata: Metadata = { title: "Timers" }
  export default async function Page() {
    const channel = await getSelectedChannel()
    if (!channel) return <NoChannelEmpty />
    const timers = await getTimers(channel.id)
    return <TimersView key={channel.id} channelId={channel.id} timers={timers} />
  }
  ```

- Selected channel = cookie `selectedChannel` (Channel DB id), always
  re-validated against `ChannelAccess` by `getSelectedChannel()`. Pages pass
  `channel.id` down; actions receive it as their first argument and re-check
  it with `authorizeChannelAction(channelId)`.

### Security rules (every query and action)

- Server Actions are public HTTP endpoints. Each action, in order:
  `authorizeAction()` / `authorizeChannelAction(channelId, { perms })` →
  `parseInput(schema, input)` → DB work in `tryDb(...)` → `revalidatePath(...)`.
  Return the guard's failure as-is: `if (!auth.ok) return auth`.
- Scope every channel-owned row to the authorized channel:
  `where: { id, channelId: auth.channel.id }` with `updateMany` / `deleteMany`
  + `count === 0 → fail("... not found", 404)`, or fetch-then-check. Never
  mutate by bare id (the Nuxt endpoints did; that's a deliberate fix).
- Never throw to the client and never return Prisma errors; `tryDb` logs and
  returns a generic message. Select only the columns the UI needs (never
  `Channel.token`, never `WebuiUser.password`).
- Perms: `hasPerms(user.perms, [...])` = server semantics (any of, no admin
  shortcut, port of `checkPerms`). `canSeeWithPerms` / `<RequirePerms>` = UI
  semantics (admin always passes, `[]` = admin only). Hiding UI is not
  security.
- Sync service calls (`lib/server/sync.ts`): keep each Nuxt call site's
  semantics. Awaited ones fail the action; fire-and-forget ones go through
  `syncInBackground(label, fn)`.

### Client state and feedback

- zustand only via `createStoreContext` (`lib/create-store-context.tsx`): a
  store per mounted Provider, initialised from server props, re-synced when
  fresh props arrive (`sync`). Never a module-global store holding per-user
  server data. Purely client-side prefs may use a plain store with `persist`.
- Feedback = toast via `notifySuccess` / `notifyError` / `notifyActionError`
  (`lib/notify.ts`). Reuse the Nuxt popup wording where there was one.
- Polling: `useAutoRefresh(ms)` (calls `router.refresh()`, paused while the
  tab is hidden). Timers use 10 s like the Nuxt store.
- Forms: shadcn `FieldGroup` / `Field` / `FieldError`, zod `safeParse` on every
  render + `fieldErrors(result)`, submit disabled while invalid,
  `useTransition` for pending state, `Spinner data-icon="inline-start"`.

### UI

- shadcn-idiomatic: Table, Dialog, AlertDialog (`ConfirmDeleteDialog`),
  Empty, Card, Badge, Switch, Select, Tabs, Skeleton, Alert. Base UI uses
  `render={<Button />}` instead of `asChild`; `Select` needs `items`.
- Use `gap-*` (never `space-*`), semantic colors, icons with `data-icon`.
- Links styled as buttons: `<Link className={buttonVariants(...)}>`.
- Sidebar links live in `lib/nav.ts` only.
