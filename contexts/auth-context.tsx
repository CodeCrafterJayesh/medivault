"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string, metadata: { full_name: string; phone_number: string }) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function getSession() {
      setIsLoading(true)

      // First check localStorage for cached session
      const cachedSession = localStorage.getItem("supabase.auth.token")

      // Get the current session from Supabase
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Error getting session:", error.message)
      }

      if (session) {
        setSession(session)
        setUser(session.user)

        // Cache the session
        localStorage.setItem("supabase.auth.token", JSON.stringify(session))
        localStorage.setItem("supabase.auth.expires", (Date.now() + 24 * 60 * 60 * 1000).toString())
      } else if (cachedSession) {
        // Check if cached session is still valid
        const expires = localStorage.getItem("supabase.auth.expires")
        if (expires && Number.parseInt(expires) > Date.now()) {
          try {
            const parsedSession = JSON.parse(cachedSession)
            setSession(parsedSession)
            setUser(parsedSession.user)
          } catch (e) {
            // Invalid cached session, clear it
            localStorage.removeItem("supabase.auth.token")
            localStorage.removeItem("supabase.auth.expires")
          }
        } else {
          // Expired session, clear it
          localStorage.removeItem("supabase.auth.token")
          localStorage.removeItem("supabase.auth.expires")
        }
      }

      setIsLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)

      if (session) {
        // Cache the session
        localStorage.setItem("supabase.auth.token", JSON.stringify(session))
        localStorage.setItem("supabase.auth.expires", (Date.now() + 24 * 60 * 60 * 1000).toString())
      } else {
        // Clear cached session
        localStorage.removeItem("supabase.auth.token")
        localStorage.removeItem("supabase.auth.expires")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, metadata: { full_name: string; phone_number: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })

    if (error) {
      throw error
    }

    toast({
      title: "Registered Successfully!",
      description: "Your account has been created. Please check your email for verification.",
      variant: "success",
    })
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    toast({
      title: "Login Successful!",
      description: "Welcome back to MediVault.",
      variant: "success",
    })

    // Redirect to dashboard after successful login
    router.push("/dashboard")
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    // Clear cached session
    localStorage.removeItem("supabase.auth.token")
    localStorage.removeItem("supabase.auth.expires")

    // Redirect to home page after logout
    router.push("/")
  }

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
