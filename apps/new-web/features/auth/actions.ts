"use server"

import argon2 from "argon2"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { parsePerms } from "@/lib/perms"
import {
  fail,
  ok,
  parseInput,
  tryDb,
  type ActionResult,
} from "@/lib/server/action"
import { SELECTED_CHANNEL_COOKIE } from "@/lib/server/auth"
import { prisma } from "@/lib/server/db"
import { destroySession, startSession } from "@/lib/server/session"

import { SDtoCreateUser, SDtoUser } from "./schema"

const WRONG_CREDENTIALS = "Wrong username or password"

/** Port of `server/api/auth/login.post.ts`. Sets the session cookie on success. */
export async function login(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(SDtoUser, input)
  if (!parsed.ok) return parsed

  const { username, password } = parsed.data

  const found = await tryDb(() =>
    prisma.webuiUser.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        channelId: true,
        perms: true,
      },
    })
  )
  if (!found.ok) return found

  const user = found.data
  if (!user || !(await verifyPassword(user.password, password))) {
    return fail(WRONG_CREDENTIALS, 401)
  }

  await startSession({
    id: user.id,
    username: user.username,
    channelId: user.channelId,
    perms: parsePerms(user.perms),
  })

  return ok()
}

/**
 * Port of `server/api/auth/register.post.ts` + the client's follow-up login:
 * creates the user and starts the session in one step.
 */
export async function register(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(SDtoCreateUser, input)
  if (!parsed.ok) return parsed

  const { username, password, regToken } = parsed.data

  if (!process.env.REG_TOKEN || process.env.REG_TOKEN !== regToken) {
    return fail("Invalid registration token", 401)
  }

  const existing = await tryDb(() =>
    prisma.webuiUser.findUnique({ where: { username }, select: { id: true } })
  )
  if (!existing.ok) return existing
  if (existing.data) {
    return fail("Username already exists!", 409)
  }

  const created = await tryDb(
    async () =>
      prisma.webuiUser.create({
        data: { username, password: await argon2.hash(password), settings: {} },
        select: { id: true, username: true, channelId: true, perms: true },
      }),
    "Couldn't create the account, try again later"
  )
  if (!created.ok) return created

  await startSession({
    id: created.data.id,
    username: created.data.username,
    channelId: created.data.channelId,
    perms: parsePerms(created.data.perms),
  })

  return ok()
}

/** Port of `server/api/auth/logout.post.ts`. Redirects to /login. */
export async function logout(): Promise<void> {
  await destroySession()
  ;(await cookies()).delete(SELECTED_CHANNEL_COOKIE)
  redirect("/login")
}

async function verifyPassword(hash: string, password: string) {
  try {
    return await argon2.verify(hash, password)
  } catch {
    // Malformed hash in the DB: treat as wrong credentials.
    return false
  }
}
