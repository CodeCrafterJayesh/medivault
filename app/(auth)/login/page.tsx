"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MediVaultLogo } from "@/components/medivault-logo"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock, Mail, User, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAdminLoading, setIsAdminLoading] = useState(false)

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await signIn(email, password)
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message || "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminError(null)
    setIsAdminLoading(true)

    try {
      // Fixed admin credentials
      const ADMIN_EMAIL = "medivaultdigihealth@gmail.com"
      const ADMIN_PASSWORD = "Admin@2004"

      // Simple validation
      if (!adminEmail || !adminPassword) {
        throw new Error("Please enter both email and password")
      }

      // Check against fixed credentials
      if (adminEmail === ADMIN_EMAIL && adminPassword === ADMIN_PASSWORD) {
        // Set admin session in localStorage
        localStorage.setItem(
          "adminSession",
          JSON.stringify({
            isAdmin: true,
            email: ADMIN_EMAIL,
            loginTime: new Date().toISOString(),
          }),
        )

        // Redirect to admin dashboard
        router.push("/admin-dashboard")
      } else {
        throw new Error("Invalid admin credentials")
      }
    } catch (error: any) {
      setAdminError(error.message || "Admin login failed")
    } finally {
      setIsAdminLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-primary/10 to-background">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <MediVaultLogo className="h-16 w-16 text-primary" />
          <h1 className="mt-4 text-3xl font-bold">MediVault</h1>
          <p className="mt-2 text-muted-foreground">Secure Your Health, Anytime, Anywhere</p>
        </div>

        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="user" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>User Login</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Admin Login</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user">
            <Card>
              <CardHeader>
                <CardTitle>User Sign In</CardTitle>
                <CardDescription>Enter your email and password to access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUserSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-primary hover:underline">
                    Create an account
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Admin Sign In</CardTitle>
                <CardDescription>Secure access for authorized administrators only</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  {adminError && (
                    <Alert variant="destructive">
                      <AlertDescription>{adminError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="adminEmail"
                        type="email"
                        placeholder="admin@medivault.com"
                        className="pl-10"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Admin Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="adminPassword"
                        type="password"
                        className="pl-10"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" variant="secondary" disabled={isAdminLoading}>
                    {isAdminLoading ? "Authenticating..." : "Admin Login"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="text-center">
                <p className="text-sm text-muted-foreground w-full">
                  Administrative access is restricted to authorized personnel only
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
