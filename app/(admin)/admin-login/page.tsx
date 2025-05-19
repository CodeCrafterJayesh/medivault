"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MediVaultLogo } from "@/components/medivault-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Shield, Lock, Mail, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockTime, setLockTime] = useState<number | null>(null)

  // Check if already logged in
  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession")
    if (adminSession) {
      try {
        JSON.parse(adminSession)
        router.push("/admin-dashboard")
      } catch (error) {
        localStorage.removeItem("adminSession")
      }
    }

    // Check if account is locked
    const lockedUntil = localStorage.getItem("adminLoginLocked")
    if (lockedUntil) {
      const lockTimeValue = Number.parseInt(lockedUntil, 10)
      if (lockTimeValue > Date.now()) {
        setIsLocked(true)
        setLockTime(lockTimeValue)
      } else {
        localStorage.removeItem("adminLoginLocked")
      }
    }

    // Get previous login attempts
    const attempts = localStorage.getItem("adminLoginAttempts")
    if (attempts) {
      setLoginAttempts(Number.parseInt(attempts, 10))
    }
  }, [router])

  // Countdown timer for locked account
  useEffect(() => {
    if (isLocked && lockTime) {
      const interval = setInterval(() => {
        if (lockTime <= Date.now()) {
          setIsLocked(false)
          localStorage.removeItem("adminLoginLocked")
          clearInterval(interval)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isLocked, lockTime])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLocked) {
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      // Call the admin login API
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Increment login attempts
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)
        localStorage.setItem("adminLoginAttempts", newAttempts.toString())

        // Lock account after 5 failed attempts
        if (newAttempts >= 5) {
          const lockDuration = 15 * 60 * 1000 // 15 minutes
          const lockUntil = Date.now() + lockDuration
          setIsLocked(true)
          setLockTime(lockUntil)
          localStorage.setItem("adminLoginLocked", lockUntil.toString())
          throw new Error("Too many failed login attempts. Account locked for 15 minutes.")
        }

        throw new Error(data.error || "Failed to sign in")
      }

      // Reset login attempts on successful login
      setLoginAttempts(0)
      localStorage.removeItem("adminLoginAttempts")
      localStorage.removeItem("adminLoginLocked")

      // Store admin session in localStorage
      localStorage.setItem(
        "adminSession",
        JSON.stringify({
          id: data.id,
          email: data.email,
          role: data.role,
          loginTime: new Date().toISOString(),
        }),
      )

      // Redirect to admin dashboard
      router.push("/admin-dashboard")
    } catch (error: any) {
      setError(error.message || "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeRemaining = () => {
    if (!lockTime) return ""

    const remaining = Math.max(0, lockTime - Date.now())
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)

    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <MediVaultLogo className="h-12 w-12 text-primary mb-2" />
              <Shield className="h-5 w-5 text-primary absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLocked ? (
            <div className="text-center p-4 bg-muted rounded-md">
              <Lock className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <h3 className="font-semibold mb-1">Account Temporarily Locked</h3>
              <p className="text-sm text-muted-foreground mb-2">Too many failed login attempts. Please try again in:</p>
              <div className="text-xl font-mono font-bold">{formatTimeRemaining()}</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    className="pl-10 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground w-full">
            <p>Secure access for authorized administrators only</p>
          </div>

          <div className="text-center">
            <Button variant="link" className="p-0 h-auto text-sm" onClick={() => router.push("/")}>
              Return to main site
            </Button>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs text-muted-foreground">
            <p>
              <strong>Demo credentials:</strong>
              <br />
              Email: medivaultdigihealth@gmail.com
              <br />
              Password: Admin@2004
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
