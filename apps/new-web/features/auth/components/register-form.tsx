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

import { register } from "../actions"
import { SDtoCreateUser } from "../schema"

const EMPTY = {
  username: "",
  password: "",
  passwordConfirmation: "",
  regToken: "",
}

/** Port of `components/auth/RegistrationForm.vue`. Logs in on success. */
export function RegisterForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [values, setValues] = useState(EMPTY)

  const parsed = SDtoCreateUser.safeParse(values)
  const touched =
    values.username.length > 0 &&
    values.password.length > 0 &&
    values.regToken.length > 0
  const errors = touched ? fieldErrors(parsed) : {}
  const passwordConfirmed = values.passwordConfirmation === values.password
  const confirmationError =
    values.passwordConfirmation.length > 0 && !passwordConfirmed
      ? [{ message: "Passwords don't match" }]
      : undefined

  function update(key: keyof typeof EMPTY) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [key]: event.target.value }))
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!parsed.success || !passwordConfirmed) return

    startTransition(async () => {
      const result = await register(parsed.data)

      if (!result.ok) {
        notifyError("Couldn't create account", result.error)
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
          <FieldLabel htmlFor="register-username">Username</FieldLabel>
          <Input
            id="register-username"
            name="username"
            autoComplete="username"
            placeholder="username"
            value={values.username}
            aria-invalid={!!errors.username || undefined}
            onChange={update("username")}
          />
          <FieldError errors={errors.username} />
        </Field>
        <Field data-invalid={!!errors.password || undefined}>
          <FieldLabel htmlFor="register-password">Password</FieldLabel>
          <Input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="password"
            value={values.password}
            aria-invalid={!!errors.password || undefined}
            onChange={update("password")}
          />
          <FieldError errors={errors.password} />
        </Field>
        <Field data-invalid={!!confirmationError || undefined}>
          <FieldLabel htmlFor="register-password-confirmation">
            Confirm password
          </FieldLabel>
          <Input
            id="register-password-confirmation"
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            placeholder="confirm password"
            value={values.passwordConfirmation}
            aria-invalid={!!confirmationError || undefined}
            onChange={update("passwordConfirmation")}
          />
          <FieldError errors={confirmationError} />
        </Field>
        <Field data-invalid={!!errors.regToken || undefined}>
          <FieldLabel htmlFor="register-token">Registration token</FieldLabel>
          <Input
            id="register-token"
            name="regToken"
            autoComplete="off"
            placeholder="registration token"
            value={values.regToken}
            aria-invalid={!!errors.regToken || undefined}
            onChange={update("regToken")}
          />
          <FieldError errors={errors.regToken} />
        </Field>
        <Field>
          <Button
            type="submit"
            disabled={!parsed.success || !passwordConfirmed || pending}
          >
            {pending && <Spinner data-icon="inline-start" />}
            Register
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
