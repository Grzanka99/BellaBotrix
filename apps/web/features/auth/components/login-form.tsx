"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { fieldErrors } from "@/lib/form"
import { notifyError, notifySuccess } from "@/lib/notify"

import { login } from "../actions"
import { SDtoUser } from "../schema"

/** Port of `components/auth/LoginForm.vue`. */
export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [values, setValues] = useState({ username: "", password: "" })

  const parsed = SDtoUser.safeParse(values)
  // Like the Nuxt form: only complain once both fields have something in them.
  const touched = values.username.length > 0 && values.password.length > 0
  const errors = touched ? fieldErrors(parsed) : {}

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!parsed.success) return

    startTransition(async () => {
      const result = await login(parsed.data)

      if (!result.ok) {
        notifyError(
          "Incorrect username or password",
          "Couldn't login. Check your username and password"
        )
        return
      }

      notifySuccess("Logged in successfully")
      router.replace(redirectTo)
    })
  }

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <Field data-invalid={!!errors.username || undefined}>
          <FieldLabel htmlFor="login-username">Username</FieldLabel>
          <Input
            id="login-username"
            name="username"
            autoComplete="username"
            placeholder="username"
            value={values.username}
            aria-invalid={!!errors.username || undefined}
            onChange={(event) =>
              setValues((v) => ({ ...v, username: event.target.value }))
            }
          />
          <FieldError errors={errors.username} />
        </Field>
        <Field data-invalid={!!errors.password || undefined}>
          <FieldLabel htmlFor="login-password">Password</FieldLabel>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="password"
            value={values.password}
            aria-invalid={!!errors.password || undefined}
            onChange={(event) =>
              setValues((v) => ({ ...v, password: event.target.value }))
            }
          />
          <FieldError errors={errors.password} />
        </Field>
        <Field>
          <Button type="submit" disabled={!parsed.success || pending}>
            {pending && <Spinner data-icon="inline-start" />}
            Login
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
