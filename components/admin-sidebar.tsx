"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MediVaultLogo } from "@/components/medivault-logo"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Bell,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  Shield,
  Database,
  AlertTriangle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export function AdminSidebar() {
  const pathname = usePathname()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [securityAlerts, setSecurityAlerts] = useState(0)
  const [pendingReminders, setPendingReminders] = useState(0)

  useEffect(() => {
    // Fetch security alerts count
    const fetchSecurityAlerts = async () => {
      try {
        const { count, error } = await supabase
          .from("security_alerts")
          .select("*", { count: "exact", head: true })
          .eq("status", "unresolved")

        if (!error) {
          setSecurityAlerts(count || 0)
        }
      } catch (error) {
        console.error("Error fetching security alerts:", error)
      }
    }

    // Fetch pending reminders count
    const fetchPendingReminders = async () => {
      try {
        const { count, error } = await supabase
          .from("appointment_reminders")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")

        if (!error) {
          setPendingReminders(count || 0)
        }
      } catch (error) {
        console.error("Error fetching pending reminders:", error)
      }
    }

    fetchSecurityAlerts()
    fetchPendingReminders()

    // Set up real-time subscriptions
    const securitySubscription = supabase
      .channel("security-alerts-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "security_alerts" }, () => {
        fetchSecurityAlerts()
      })
      .subscribe()

    const remindersSubscription = supabase
      .channel("reminders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointment_reminders" }, () => {
        fetchPendingReminders()
      })
      .subscribe()

    return () => {
      securitySubscription.unsubscribe()
      remindersSubscription.unsubscribe()
    }
  }, [])

  const handleLogout = () => {
    // Clear admin session
    localStorage.removeItem("adminSession")

    // Show toast notification
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
      variant: "success",
    })

    // Redirect to login page
    window.location.href = "/admin-login"
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin-dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: "Users",
      href: "/admin-dashboard/users",
      icon: Users,
      badge: null,
    },
    {
      name: "Admins",
      href: "/admin-dashboard/admins",
      icon: Shield,
      badge: null,
    },
    {
      name: "Appointments",
      href: "/admin-dashboard/appointments",
      icon: Calendar,
      badge: null,
    },
    {
      name: "Reminders",
      href: "/admin-dashboard/reminders",
      icon: Bell,
      badge: pendingReminders > 0 ? pendingReminders : null,
    },
    {
      name: "Security",
      href: "/admin-dashboard/security",
      icon: AlertTriangle,
      badge: securityAlerts > 0 ? securityAlerts : null,
    },
    {
      name: "Database",
      href: "/admin-dashboard/database",
      icon: Database,
      badge: null,
    },
    {
      name: "Analytics",
      href: "/admin-dashboard/analytics",
      icon: BarChart2,
      badge: null,
    },
    {
      name: "Settings",
      href: "/admin-dashboard/settings",
      icon: Settings,
      badge: null,
    },
  ]

  return (
    <>
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-card shadow-lg transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link href="/admin-dashboard" className="flex items-center space-x-2">
              <MediVaultLogo className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">MediVault</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="destructive" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
              <LogOut className="mr-2 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
