"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function AdminLogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    // Clear admin session
    localStorage.removeItem("adminSession")
    // Redirect to login page
    router.push("/login")
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2">
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </Button>
  )
}
