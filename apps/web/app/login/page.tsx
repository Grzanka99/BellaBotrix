import type { Metadata } from "next"
import { redirect } from "next/navigation"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/features/auth/components/login-form"
import { RegisterForm } from "@/features/auth/components/register-form"
import { getCurrentUser } from "@/lib/server/auth"
import { safePanelPath } from "@/lib/safe-redirect"

export const metadata: Metadata = {
  title: "Login",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  const { next } = await searchParams
  const redirectTo = safePanelPath(next)

  if (await getCurrentUser()) {
    redirect(redirectTo)
  }

  return (
    <main className="flex min-h-svh flex-col items-center px-4 pt-24">
      <Tabs defaultValue="login" className="w-full max-w-sm">
        <TabsList className="w-full">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login to existing account</CardTitle>
              <CardDescription>BellaBotrix admin panel</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm redirectTo={redirectTo} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Create new account</CardTitle>
              <CardDescription>
                You need a registration token from the bot owner.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterForm redirectTo={redirectTo} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
