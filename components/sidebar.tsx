"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { MediVaultLogo } from "./medivault-logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  FileText,
  Pill,
  Phone,
  Calendar,
  Upload,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  Sun,
  Moon,
  Share2,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [profile, setProfile] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const getProfile = async () => {
      if (user) {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (!error && data) {
          setProfile(data)
        }
      }
    }

    getProfile()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const navItems = [
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      name: "Medical History",
      href: "/medical-history",
      icon: FileText,
    },
    {
      name: "Medications",
      href: "/medications",
      icon: Pill,
    },
    {
      name: "Emergency Contacts",
      href: "/emergency-contacts",
      icon: Phone,
    },
    {
      name: "Appointments",
      href: "/appointments",
      icon: Calendar,
    },
    {
      name: "Medical Reports",
      href: "/medical-reports",
      icon: Upload,
    },
    {
      name: "Health Statistics",
      href: "/health-statistics",
      icon: BarChart2,
    },
    {
      name: "Data Sharing",
      href: "/data-sharing",
      icon: Share2,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
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
            <Link href="/dashboard" className="flex items-center space-x-2">
              <MediVaultLogo className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">MediVault</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>

          {/* User profile */}
          <div className="flex items-center space-x-3 p-4 border-b">
            <Avatar>
              <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
              <AvatarFallback>
                {profile?.full_name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-2">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
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
