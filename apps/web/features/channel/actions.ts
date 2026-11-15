"use server"

import { revalidatePath } from "next/cache"

import {
  authorizeChannelAction,
  ok,
  type ActionResult,
} from "@/lib/server/action"
import { setSelectedChannelCookie } from "@/lib/server/auth"

/**
 * Switches the panel to another channel the user has access to. Setting the
 * cookie re-renders the current page with the new channel.
 */
export async function selectChannel(channelId: unknown): Promise<ActionResult> {
  const auth = await authorizeChannelAction(channelId)
  if (!auth.ok) return auth

  await setSelectedChannelCookie(auth.channel.id)
  revalidatePath("/panel", "layout")

  return ok()
}
