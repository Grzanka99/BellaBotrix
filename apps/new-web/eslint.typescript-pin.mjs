// Workaround for the monorepo install layout: the workspace packages depend on
// `typescript: latest`, so TypeScript 7 (no JS compiler API) is hoisted to the
// repo root. `ts-api-utils` (used by typescript-eslint) declares typescript as
// a peer and therefore resolves that root copy and crashes. This hook makes
// every `typescript` import from ts-api-utils use this app's own TypeScript 5
// devDependency instead. Imported first by eslint.config.mjs; lint-time only.
import { createRequire, registerHooks } from "node:module"
import { pathToFileURL } from "node:url"

const require = createRequire(import.meta.url)
const appTypescriptUrl = pathToFileURL(require.resolve("typescript")).href

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier === "typescript" &&
      context.parentURL?.includes("/node_modules/ts-api-utils/")
    ) {
      return { url: appTypescriptUrl, format: "commonjs", shortCircuit: true }
    }

    return nextResolve(specifier, context)
  },
})
