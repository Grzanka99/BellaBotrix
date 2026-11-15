/**
 * The one return type for every Server Action. Client-safe (no server code).
 *
 * Actions never throw to the client: expected failures come back as
 * `{ ok: false, error, status }` with a message that is safe to show in a
 * toast. `status` mirrors the HTTP status the Nuxt endpoint used
 * (400 invalid input, 401 unauthenticated / no channel access,
 * 403 missing perms, 404 not found, 409 conflict, 500 server error).
 */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number }

export type ActionFailure = Extract<ActionResult<never>, { ok: false }>

export function ok(): ActionResult<void>
export function ok<T>(data: T): ActionResult<T>
export function ok<T>(data?: T): ActionResult<T | undefined> {
  return { ok: true, data }
}

export function fail(error: string, status?: number): ActionFailure {
  return { ok: false, error, status }
}
