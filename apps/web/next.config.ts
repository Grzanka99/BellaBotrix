import path from "node:path"
import { fileURLToPath } from "node:url"

import { loadEnvConfig } from "@next/env"
import type { NextConfig } from "next"

const appDir = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.join(appDir, "../..")

loadMonorepoEnv()

const nextConfig: NextConfig = {
  // Workspace packages ship raw TypeScript and must be compiled by Next.
  transpilePackages: ["bellatrix", "r6dle"],
  // Native / engine-backed packages are loaded with Node's require at runtime.
  // (Both are also on Next's built-in list; listed here to make it explicit.)
  serverExternalPackages: ["@prisma/client", ".prisma/client", "argon2"],
  // The app imports from the monorepo (workspace packages, hoisted
  // node_modules, the generated Prisma client), so resolution and the server
  // output trace must start at the repo root.
  turbopack: { root: monorepoRoot },
  outputFileTracingRoot: monorepoRoot,
}

export default nextConfig

/**
 * Local dev convenience: the database URL (REMOTE_DB_URL) lives in the repo
 * root `.env`, shared with the other apps. Next only loads env files from
 * `apps/web`, so the root file is merged in here.
 *
 * Precedence: real environment and `apps/web/.env*` always win; the root
 * file only fills in missing keys. A missing root `.env` (e.g. on Vercel) is a
 * no-op.
 */
function loadMonorepoEnv() {
  const alreadyLoaded = { ...process.env }
  // forceReload: Next has already processed its own env files, without it the
  // call is a no-op. If `@next/env` happens to be the same module instance Next
  // uses, a forced reload resets process.env to its initial state first, which
  // is why the previously loaded values are restored right after.
  loadEnvConfig(
    monorepoRoot,
    process.env.NODE_ENV !== "production",
    { info: () => {}, error: console.error },
    true
  )
  Object.assign(process.env, alreadyLoaded)
}
