"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sun, Moon } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [settings, setSettings] = useState<any>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [dataSharingEnabled, setDataSharingEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      if (user) {
        const { data, error } = await supabase.from("settings").select("*").eq("id", user.id).single()

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching settings:", error)
          return
        }

        if (data) {
          setSettings(data)
          setNotificationsEnabled(data.notification_enabled ?? true)
          setDataSharingEnabled(data.data_sharing_enabled ?? false)
        }
      }
    }

    fetchSettings()
  }, [user])

  const handleSaveSettings = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.from("settings").upsert({
        id: user?.id,
        theme,
        notification_enabled: notificationsEnabled,
        data_sharing_enabled: dataSharingEnabled,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setMessage({ type: "success", text: "Settings saved successfully" })
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to save settings" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-6">
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how MediVault looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme">Theme</Label>
                  <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
                </div>
                <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                  {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive reminders for medications and appointments</p>
                </div>
                <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>Manage your data sharing preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="data-sharing">Allow Data Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow your anonymized health data to be used for research purposes
                  </p>
                </div>
                <Switch id="data-sharing" checked={dataSharingEnabled} onCheckedChange={setDataSharingEnabled} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  )
}
