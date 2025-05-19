"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MediVaultLogo } from "@/components/medivault-logo"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  FileText,
  Shield,
  FileIcon as FilePdf,
  BarChart,
  Bell,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Moon,
  Sun,
  Database,
  ShieldAlert,
} from "lucide-react"
import { AdminAuthCheck } from "@/components/admin-auth-check"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useTheme } from "@/contexts/theme-context"

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [adminSession, setAdminSession] = useState<any>(null)
  const [activeUsers, setActiveUsers] = useState(0)
  const [totalDocuments, setTotalDocuments] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [securityAlerts, setSecurityAlerts] = useState(0)

  useEffect(() => {
    setIsClient(true)
    const session = localStorage.getItem("adminSession")

    if (session) {
      try {
        const parsedSession = JSON.parse(session)
        setAdminSession(parsedSession)

        // Fetch real-time data
        fetchRealTimeData()

        // Set up real-time subscriptions
        const profilesSubscription = supabase
          .channel("profiles-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "profiles",
            },
            () => {
              fetchRealTimeData()
            },
          )
          .subscribe()

        const reportsSubscription = supabase
          .channel("reports-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "medical_reports",
            },
            () => {
              fetchRealTimeData()
            },
          )
          .subscribe()

        setIsLoading(false)

        return () => {
          profilesSubscription.unsubscribe()
          reportsSubscription.unsubscribe()
        }
      } catch (error) {
        console.error("Error parsing admin session:", error)
        handleLogout()
      }
    } else {
      // Redirect to login if no session
      router.push("/admin-login")
    }
  }, [router])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("admin-mobile-sidebar")
      const hamburger = document.getElementById("admin-hamburger-button")

      if (
        sidebar &&
        hamburger &&
        !sidebar.contains(event.target as Node) &&
        !hamburger.contains(event.target as Node) &&
        isSidebarOpen
      ) {
        setIsSidebarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isSidebarOpen])

  const fetchRealTimeData = async () => {
    try {
      // Get active users count (users who have logged in within the last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const thirtyDaysAgoISOString = thirtyDaysAgo.toISOString()

      const { count: activeUsersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gt("updated_at", thirtyDaysAgoISOString)

      if (activeUsersCount !== null) {
        setActiveUsers(activeUsersCount)
      }

      // Get total documents count
      const { count: documentsCount } = await supabase
        .from("medical_reports")
        .select("*", { count: "exact", head: true })

      if (documentsCount !== null) {
        setTotalDocuments(documentsCount)
      }

      // Set mock security alerts (in a real app, this would come from a security_logs table)
      setSecurityAlerts(Math.floor(Math.random() * 3) + 1) // Random number between 1-3
    } catch (error) {
      console.error("Error fetching real-time data:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminSession")
    router.push("/admin-login")
  }

  const navItems = [
    {
      name: "Overview",
      href: "/admin-dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "User Management",
      href: "/admin-dashboard/users",
      icon: Users,
    },
    {
      name: "Admin Management",
      href: "/admin-dashboard/admins",
      icon: Shield,
    },
    {
      name: "Database Settings",
      href: "/admin-dashboard/database",
      icon: Database,
    },
    {
      name: "Medical Data",
      href: "/admin-dashboard/medical-data",
      icon: FileText,
    },
    {
      name: "Security",
      href: "/admin-dashboard/security",
      icon: ShieldAlert,
      badge: securityAlerts > 0 ? securityAlerts : undefined,
    },
    {
      name: "Privacy & Compliance",
      href: "/admin-dashboard/compliance",
      icon: Shield,
    },
    {
      name: "PDF Generation Logs",
      href: "/admin-dashboard/pdf-logs",
      icon: FilePdf,
    },
    {
      name: "System Analytics",
      href: "/admin-dashboard/analytics",
      icon: BarChart,
    },
    {
      name: "Appointment Reminders",
      href: "/admin-dashboard/reminders",
      icon: Bell,
    },
  ]

  if (!isClient) {
    return null // Prevent hydration mismatch
  }

  if (!adminSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center">
          <MediVaultLogo className="h-12 w-12 text-primary mb-4 animate-pulse" />
          <p className="text-lg font-medium">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminAuthCheck>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        {/* Mobile hamburger menu */}
        <div className="fixed top-4 left-4 z-50 md:hidden" id="admin-hamburger-button">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle menu"
            className="h-10 w-10 rounded-full shadow-md bg-background"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Sidebar */}
        <aside
          id="admin-mobile-sidebar"
          className={`fixed md:sticky top-0 h-screen w-72 flex-shrink-0 bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out z-40 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="flex h-full flex-col">
            {/* Sidebar header */}
            <div className="flex items-center justify-between p-4 border-b">
              <Link href="/admin-dashboard" className="flex items-center space-x-2">
                <MediVaultLogo className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Admin Panel
                </span>
              </Link>
            </div>

            {/* Admin info */}
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center shadow-md">
                  <span className="text-sm font-bold">A</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{adminSession.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {adminSession.role === "superadmin" ? "Super Administrator" : "Administrator"}
                  </p>
                </div>
              </div>
            </div>

            {/* Real-time stats */}
            <div className="p-4 border-b">
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                Real-time Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md shadow-sm hover:shadow-md transition-all">
                  <p className="text-xs text-muted-foreground">Active Users</p>
                  <p className="text-lg font-bold">{activeUsers}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md shadow-sm hover:shadow-md transition-all">
                  <p className="text-xs text-muted-foreground">Documents</p>
                  <p className="text-lg font-bold">{totalDocuments}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-2">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center justify-between rounded-md px-3 py-3 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700/50",
                        )}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <div className="flex items-center">
                          <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary-foreground" : "")} />
                          <span>{item.name}</span>

                          {item.badge && (
                            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {isActive && <ChevronRight className="h-4 w-4" />}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* External link to Supabase dashboard */}
            <div className="p-4 border-t border-b">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-primary hover:underline group transition-all"
              >
                <span>View Supabase Dashboard</span>
                <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Theme toggle */}
            <div className="p-4 border-b">
              <Button variant="outline" size="sm" className="w-full justify-start h-11" onClick={toggleTheme}>
                {theme === "dark" ? (
                  <>
                    <Sun className="mr-2 h-4 w-4" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark Mode
                  </>
                )}
              </Button>
            </div>

            {/* Sidebar footer */}
            <div className="p-4 border-t">
              <Button
                variant="destructive"
                className="w-full justify-start text-destructive-foreground hover:bg-destructive/90 transition-colors h-11"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top header */}
          <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b shadow-sm p-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold md:hidden">Admin Dashboard</h1>
              <div className="flex items-center space-x-2">
                {isLoading ? (
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
                ) : (
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                )}
                <span className="text-sm text-muted-foreground mr-4">{isLoading ? "Syncing..." : "Live Data"}</span>
                <Button variant="outline" size="sm" onClick={toggleTheme} className="mr-2 h-9">
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors h-9"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 pt-16 md:pt-6">
            <div className="container mx-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
                    <p className="text-muted-foreground">Loading dashboard data...</p>
                  </div>
                </div>
              ) : (
                children
              )}
            </div>
          </main>
        </div>
      </div>
    </AdminAuthCheck>
  )
}
