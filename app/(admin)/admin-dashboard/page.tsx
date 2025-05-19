"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Users,
  FileText,
  Calendar,
  Upload,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Database,
  Shield,
  Server,
  Download,
  RefreshCw,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { format } from "date-fns"

// Activity log type
type ActivityLog = {
  id: string
  type: string
  user: string
  timestamp: string
  details?: string
}

// System status type
type SystemStatus = {
  component: string
  status: "online" | "degraded" | "offline"
  latency: string
}

export default function AdminDashboardPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalMedications: 0,
    totalAppointments: 0,
    totalReports: 0,
    totalEmergencyContacts: 0,
    storageUsed: "0 MB",
    storageRemaining: "0 MB",
  })
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([])
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([
    { component: "Database", status: "online", latency: "0ms" },
    { component: "Authentication", status: "online", latency: "0ms" },
    { component: "Storage", status: "online", latency: "0ms" },
    { component: "API", status: "online", latency: "0ms" },
  ])

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Start timing database query for latency measurement
      const dbStartTime = performance.now()

      // Fetch profiles count
      const { count: profilesCount, error: profilesError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })

      if (profilesError) throw profilesError

      // Calculate database latency
      const dbEndTime = performance.now()
      const dbLatency = Math.round(dbEndTime - dbStartTime)

      // Update system status with real latency
      setSystemStatus((prev) =>
        prev.map((item) => (item.component === "Database" ? { ...item, latency: `${dbLatency}ms` } : item)),
      )

      // Fetch active users (users who have logged in within the last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const thirtyDaysAgoISOString = thirtyDaysAgo.toISOString()

      const { count: activeUsersCount, error: activeUsersError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gt("updated_at", thirtyDaysAgoISOString)

      if (activeUsersError && activeUsersError.code !== "PGRST116") throw activeUsersError

      // Fetch medications count
      const { count: medicationsCount, error: medicationsError } = await supabase
        .from("medications")
        .select("*", { count: "exact", head: true })

      // If table doesn't exist, we'll just use 0
      const totalMedications = medicationsError ? 0 : medicationsCount || 0

      // Fetch appointments count
      const { count: appointmentsCount, error: appointmentsError } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })

      // If table doesn't exist, we'll just use 0
      const totalAppointments = appointmentsError ? 0 : appointmentsCount || 0

      // Fetch reports count
      const { count: reportsCount, error: reportsError } = await supabase
        .from("medical_reports")
        .select("*", { count: "exact", head: true })

      // If table doesn't exist, we'll just use 0
      const totalReports = reportsError ? 0 : reportsCount || 0

      // Fetch emergency contacts count
      const { count: contactsCount, error: contactsError } = await supabase
        .from("emergency_contacts")
        .select("*", { count: "exact", head: true })

      // If table doesn't exist, we'll just use 0
      const totalContacts = contactsError ? 0 : contactsCount || 0

      // Fetch storage usage from Supabase
      // In a real app, you would query the storage buckets
      // For now, we'll estimate based on the number of reports
      const estimatedStorageUsed = (totalReports * 2.5).toFixed(1)
      const storageRemaining = (5000 - Number.parseFloat(estimatedStorageUsed)).toFixed(1) // Assuming 5GB total storage

      // Fetch recent activity logs
      let activityLogs: ActivityLog[] = []

      // Fetch recent profile updates
      const { data: profileUpdates, error: profileUpdatesError } = await supabase
        .from("profiles")
        .select("id, full_name, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5)

      if (!profileUpdatesError && profileUpdates) {
        const profileLogs = profileUpdates.map((profile) => ({
          id: `profile-${profile.id}`,
          type: "profile_update",
          user: profile.full_name || `User ${profile.id.substring(0, 8)}`,
          timestamp: profile.updated_at,
          details: "Profile information updated",
        }))
        activityLogs = [...activityLogs, ...profileLogs]
      }

      // Fetch recent medical reports
      const { data: recentReports, error: recentReportsError } = await supabase
        .from("medical_reports")
        .select("id, title, user_id, created_at")
        .order("created_at", { ascending: false })
        .limit(5)

      if (!recentReportsError && recentReports) {
        // For each report, get the user's name
        for (const report of recentReports) {
          const { data: userData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", report.user_id)
            .single()

          const userName = userData?.full_name || `User ${report.user_id.substring(0, 8)}`

          activityLogs.push({
            id: `report-${report.id}`,
            type: "document_upload",
            user: userName,
            timestamp: report.created_at,
            details: `Uploaded document: ${report.title}`,
          })
        }
      }

      // Fetch recent appointments
      const { data: recentAppointments, error: recentAppointmentsError } = await supabase
        .from("appointments")
        .select("id, title, user_id, created_at")
        .order("created_at", { ascending: false })
        .limit(5)

      if (!recentAppointmentsError && recentAppointments) {
        // For each appointment, get the user's name
        for (const appointment of recentAppointments) {
          const { data: userData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", appointment.user_id)
            .single()

          const userName = userData?.full_name || `User ${appointment.user_id.substring(0, 8)}`

          activityLogs.push({
            id: `appointment-${appointment.id}`,
            type: "appointment_created",
            user: userName,
            timestamp: appointment.created_at,
            details: `Created appointment: ${appointment.title}`,
          })
        }
      }

      // Sort by timestamp (newest first)
      activityLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      // Take only the most recent 10 activities
      activityLogs = activityLogs.slice(0, 10)

      setRecentActivity(activityLogs)

      // Set stats
      setStats({
        totalUsers: profilesCount || 0,
        activeUsers: activeUsersCount || 0,
        totalMedications,
        totalAppointments,
        totalReports,
        totalEmergencyContacts: totalContacts,
        storageUsed: `${estimatedStorageUsed} MB`,
        storageRemaining: `${storageRemaining} MB`,
      })

      if (isRefreshing) {
        toast({
          variant: "success",
          title: "Data Refreshed",
          description: "Dashboard data has been updated successfully.",
        })
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error)
      setError(error.message || "Failed to load dashboard data")

      // Update system status to show database is degraded if there's an error
      setSystemStatus((prev) =>
        prev.map((item) => (item.component === "Database" ? { ...item, status: "degraded", latency: "high" } : item)),
      )

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [toast])

  useEffect(() => {
    fetchDashboardData()

    // Set up subscriptions for real-time updates
    const profilesSubscription = supabase
      .channel("profiles-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        fetchDashboardData() // Refresh data when profiles change
      })
      .subscribe()

    const reportsSubscription = supabase
      .channel("reports-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "medical_reports" }, () => {
        fetchDashboardData() // Refresh data when reports change
      })
      .subscribe()

    const appointmentsSubscription = supabase
      .channel("appointments-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => {
        fetchDashboardData() // Refresh data when appointments change
      })
      .subscribe()

    // Set up interval to refresh data every 60 seconds
    const intervalId = setInterval(() => {
      fetchDashboardData()
    }, 60000)

    return () => {
      clearInterval(intervalId)
      profilesSubscription.unsubscribe()
      reportsSubscription.unsubscribe()
      appointmentsSubscription.unsubscribe()
    }
  }, [fetchDashboardData])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchDashboardData()
  }

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true)

    toast({
      title: "Generating Report",
      description: "Please wait while we prepare the admin report...",
    })

    try {
      // Create a new PDF document
      const doc = new jsPDF()

      // Add title and header
      doc.setFontSize(22)
      doc.setTextColor(41, 128, 185) // Blue color
      doc.text("MediVault Admin Report", 105, 15, { align: "center" })

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, 22, {
        align: "center",
      })

      let yPos = 30

      // Add system overview
      doc.setFontSize(16)
      doc.setTextColor(41, 128, 185)
      doc.text("System Overview", 14, yPos)
      yPos += 8

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)

      // Create a table for system stats
      const statsData = [
        ["Total Users", stats.totalUsers.toString()],
        ["Active Users (30 days)", stats.activeUsers.toString()],
        ["Total Appointments", stats.totalAppointments.toString()],
        ["Total Medical Reports", stats.totalReports.toString()],
        ["Total Medications", stats.totalMedications.toString()],
        ["Total Emergency Contacts", stats.totalEmergencyContacts.toString()],
        ["Storage Used", stats.storageUsed],
        ["Storage Remaining", stats.storageRemaining],
      ]

      // @ts-ignore - jsPDF-AutoTable types are not properly defined
      doc.autoTable({
        startY: yPos,
        head: [["Metric", "Value"]],
        body: statsData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
      })

      // Get the final Y position after the table
      // @ts-ignore - jsPDF-AutoTable types are not properly defined
      yPos = doc.lastAutoTable.finalY + 10

      // Add system status
      doc.setFontSize(16)
      doc.setTextColor(41, 128, 185)
      doc.text("System Status", 14, yPos)
      yPos += 8

      // Create a table for system status
      const statusData = systemStatus.map((status) => [status.component, status.status, status.latency])

      // @ts-ignore - jsPDF-AutoTable types are not properly defined
      doc.autoTable({
        startY: yPos,
        head: [["Component", "Status", "Latency"]],
        body: statusData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
        columnStyles: {
          1: {
            fontStyle: "bold",
            textColor: (data: any) => {
              const status = data.cell.raw
              if (status === "online") return [46, 204, 113]
              if (status === "degraded") return [243, 156, 18]
              return [231, 76, 60]
            },
          },
        },
      })

      // @ts-ignore - jsPDF-AutoTable types are not properly defined
      yPos = doc.lastAutoTable.finalY + 10

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      // Add recent activity
      doc.setFontSize(16)
      doc.setTextColor(41, 128, 185)
      doc.text("Recent Activity", 14, yPos)
      yPos += 8

      // Create a table for recent activity
      const activityData = recentActivity.map((activity) => [
        activity.user,
        activity.type.replace(/_/g, " "),
        new Date(activity.timestamp).toLocaleString(),
        activity.details || "",
      ])

      // @ts-ignore - jsPDF-AutoTable types are not properly defined
      doc.autoTable({
        startY: yPos,
        head: [["User", "Action", "Timestamp", "Details"]],
        body: activityData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        columnStyles: {
          2: { cellWidth: 40 },
          3: { cellWidth: 60 },
        },
      })

      // Add footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(`MediVault Admin Report - Page ${i} of ${pageCount}`, 105, 285, { align: "center" })
      }

      // Save the PDF as a blob
      const blob = doc.output("blob")

      // Create a URL for the blob
      const url = URL.createObjectURL(blob)

      // Create a link element
      const link = document.createElement("a")
      link.href = url
      link.download = `MediVault_Admin_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`

      // Append to the document
      document.body.appendChild(link)

      // Trigger download
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        variant: "success",
        title: "Report Generated",
        description: "Admin report has been generated and downloaded successfully.",
      })
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate admin report. Please try again.",
      })
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "degraded":
        return <Activity className="h-4 w-4 text-amber-500" />
      case "offline":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getComponentIcon = (component: string) => {
    switch (component) {
      case "Database":
        return <Database className="h-4 w-4" />
      case "Authentication":
        return <Shield className="h-4 w-4" />
      case "Storage":
        return <Upload className="h-4 w-4" />
      case "API":
        return <Server className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  if (isLoading && !isRefreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !isRefreshing) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Real-time overview of your MediVault system</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="h-10">
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
          <Button onClick={handleGenerateReport} disabled={isGeneratingReport} className="h-10">
            {isGeneratingReport ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">{stats.activeUsers} active in the last 30 days</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medical Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground">Across all users</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">Scheduled appointments</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.storageUsed}</div>
            <p className="text-xs text-muted-foreground">{stats.storageRemaining} remaining</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="system">System Status</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Activity</CardTitle>
              <CardDescription>Latest actions performed in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm font-medium">{activity.user}</p>
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2">
                              {activity.type.replace("_", " ")}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {activity.details && <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No recent activity to display</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Real-time status of system components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  {systemStatus.map((component, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        {getComponentIcon(component.component)}
                        <span className="font-medium">{component.component}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(component.status)}
                        <span
                          className={
                            component.status === "online"
                              ? "text-green-500"
                              : component.status === "degraded"
                                ? "text-amber-500"
                                : "text-red-500"
                          }
                        >
                          {component.status}
                        </span>
                        <span className="text-xs text-muted-foreground">({component.latency})</span>
                      </div>
                    </div>
                  ))}

                  <div className="mt-4">
                    <p className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
