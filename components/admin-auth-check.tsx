"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ShieldAlert } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function AdminAuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)

      // Check if admin session exists in localStorage
      const adminSession = localStorage.getItem("adminSession")

      if (!adminSession) {
        router.push("/admin-login")
        return
      }

      try {
        // Parse the session to make sure it's valid
        const session = JSON.parse(adminSession)

        // Check if session has required fields
        if (!session.email || !session.loginTime) {
          throw new Error("Invalid session format")
        }

        // Check if session is expired (24 hours)
        const loginTime = new Date(session.loginTime).getTime()
        const currentTime = new Date().getTime()
        const sessionDuration = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

        if (currentTime - loginTime > sessionDuration) {
          throw new Error("Session expired")
        }

        // Verify admin role in database
        const { data: adminData, error: adminError } = await supabase
          .from("admins")
          .select("role")
          .eq("email", session.email)
          .single()

        if (adminError) {
          // If using default admin
          if (session.email === "medivaultdigihealth@gmail.com") {
            setIsAuthenticated(true)
            setIsAuthorized(true)
          } else {
            throw new Error("Admin verification failed")
          }
        } else if (adminData) {
          setIsAuthenticated(true)
          // Check if user has admin role
          setIsAuthorized(adminData.role === "admin" || adminData.role === "superadmin")
        }
      } catch (error) {
        console.error("Admin authentication error:", error)
        localStorage.removeItem("adminSession")
        router.push("/admin-login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center max-w-md">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-center text-muted-foreground mb-6">
            You don't have the required permissions to access the admin panel. Please contact a system administrator.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
