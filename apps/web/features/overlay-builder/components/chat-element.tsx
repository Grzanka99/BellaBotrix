"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { useOverlayStore } from "../store"

type ChatMessage = {
  id: string
  username: string
  color: string
  message: string
}

function randomRgbColor() {
  const c = () => Math.floor(Math.random() * 256)
  return `rgb(${c()}, ${c()}, ${c()})`
}

function randomMessage(): ChatMessage {
  return {
    id: crypto.randomUUID(),
    username: crypto.randomUUID().substring(0, 8),
    message: crypto.randomUUID(),
    color: randomRgbColor(),
  }
}

/**
 * Port of `overlay-builder/elements/Chat.vue`: a fake chat preview. A random
 * message is appended after a random delay of up to `timeoutvalue` ms; the
 * oldest messages are dropped once the list overflows the box (or exceeds
 * 50). No network calls.
 */
export function ChatElement() {
  const timeout = useOverlayStore((s) => s.chatTimeout)
  const timeoutRef = useRef(timeout)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const boxRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    timeoutRef.current = timeout
  }, [timeout])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      setMessages((prev) => {
        const next = prev.length > 50 ? prev.slice(1) : prev
        return [...next, randomMessage()]
      })
      timer = setTimeout(
        tick,
        Math.floor(Math.random() * Math.max(0, timeoutRef.current))
      )
    }
    tick()
    return () => clearTimeout(timer)
  }, [])

  // Drop the oldest message while the list is taller than the box.
  useLayoutEffect(() => {
    const box = boxRef.current
    const list = listRef.current
    if (!box || !list || messages.length < 2) return
    if (list.scrollHeight > box.clientHeight) {
      setMessages((prev) => prev.slice(1))
    }
  }, [messages])

  return (
    <div
      ref={boxRef}
      className="size-full overflow-hidden p-3 text-sm text-white"
    >
      <ul ref={listRef} className="flex w-full flex-col">
        {messages.map((msg) => (
          <li
            key={msg.id}
            className="w-full animate-in pt-1.5 break-all duration-500 [text-shadow:1px_1px_1px_black] fade-in slide-in-from-bottom-8"
          >
            <b style={{ color: msg.color }}>{msg.username}: </b>
            {msg.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
