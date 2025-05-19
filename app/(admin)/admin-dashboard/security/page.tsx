"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Loader2,
  AlertCircle,
  Shield,
  Clock,
  Download,
  Search,
  Filter,
  UserX,
  RefreshCw,
  ShieldAlert,
  UserCog,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { ChevronRight } from "lucide-react"

// Security log type
type SecurityLog = {
  id: string
  event_type: string
  severity: "low" | "medium" | "high" | "critical"
  user_id?: string
  user_name?: string
  ip_address: string
  timestamp: string
  details: string
  status: "new" | "investigating" | "resolved" | "false_positive"
}

// Failed login type
type FailedLogin = {
  id: string
  email: string
  ip_address: string
  timestamp: string
  attempt_count: number
  blocked: boolean
}

// Role change type
type RoleChange = {
  id: string
  user_id: string
  user_name: string
  old_role: string
  new_role: string
  changed_by: string
  timestamp: string
  reason: string
}

export default function SecurityLogsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([])
  const [failedLogins, setFailedLogins] = useState<FailedLogin[]>([])
  const [roleChanges, setRoleChanges] = useState<RoleChange[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stats, setStats] = useState({
    criticalAlerts: 0,
    highAlerts: 0,
    mediumAlerts: 0,
    lowAlerts: 0,
    failedLogins: 0,
    roleChanges: 0,
    blockedIPs: 0,
  })

  const fetchSecurityData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // In a real application, we would fetch this data from Supabase
      // For now, we'll use mock data that simulates real-time data

      // Generate mock security logs
      const mockSecurityLogs: SecurityLog[] = [
        {
          id: "sec-1",
          event_type: "suspicious_login",
          severity: "high",
          user_id: "user-123",
          user_name: "John Smith",
          ip_address: "203.0.113.45",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
          details: "Login from unusual location (Moscow, Russia)",
          status: "investigating",
        },
        {
          id: "sec-2",
          event_type: "brute_force_attempt",
          severity: "critical",
          ip_address: "198.51.100.67",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          details: "Multiple failed login attempts (25) for various accounts",
          status: "new",
        },
        {
          id: "sec-3",
          event_type: "unauthorized_access_attempt",
          severity: "high",
          user_id: "user-456",
          user_name: "Sarah Johnson",
          ip_address: "192.0.2.89",
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
          details: "Attempted to access admin panel without permissions",
          status: "resolved",
        },
        {
          id: "sec-4",
          event_type: "api_abuse",
          severity: "medium",
          ip_address: "203.0.113.12",
          timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
          details: "Excessive API calls (500+ in 5 minutes)",
          status: "investigating",
        },
        {
          id: "sec-5",
          event_type: "suspicious_file_upload",
          severity: "medium",
          user_id: "user-789",
          user_name: "Michael Brown",
          ip_address: "198.51.100.23",
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
          details: "Uploaded file with potential malware signature",
          status: "false_positive",
        },
        {
          id: "sec-6",
          event_type: "account_lockout",
          severity: "low",
          user_id: "user-321",
          user_name: "Emily Davis",
          ip_address: "192.0.2.45",
          timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
          details: "Account locked after 5 failed login attempts",
          status: "resolved",
        },
        {
          id: "sec-7",
          event_type: "permission_escalation",
          severity: "critical",
          user_id: "user-654",
          user_name: "Robert Wilson",
          ip_address: "203.0.113.78",
          timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
          details: "User attempted to escalate privileges through API manipulation",
          status: "resolved",
        },
        {
          id: "sec-8",
          event_type: "data_export_large",
          severity: "high",
          user_id: "user-987",
          user_name: "Jennifer Taylor",
          ip_address: "198.51.100.34",
          timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hours ago
          details: "Unusual large data export (500+ records)",
          status: "investigating",
        },
      ]

      // Generate mock failed logins
      const mockFailedLogins: FailedLogin[] = [
        {
          id: "fail-1",
          email: "john.smith@example.com",
          ip_address: "203.0.113.45",
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
          attempt_count: 3,
          blocked: false,
        },
        {
          id: "fail-2",
          email: "admin@medivault.com",
          ip_address: "198.51.100.67",
          timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 minutes ago
          attempt_count: 8,
          blocked: true,
        },
        {
          id: "fail-3",
          email: "sarah.johnson@example.com",
          ip_address: "192.0.2.89",
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
          attempt_count: 2,
          blocked: false,
        },
        {
          id: "fail-4",
          email: "unknown@attacker.com",
          ip_address: "203.0.113.12",
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
          attempt_count: 15,
          blocked: true,
        },
        {
          id: "fail-5",
          email: "michael.brown@example.com",
          ip_address: "198.51.100.23",
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
          attempt_count: 5,
          blocked: true,
        },
      ]

      // Generate mock role changes
      const mockRoleChanges: RoleChange[] = [
        {
          id: "role-1",
          user_id: "user-123",
          user_name: "John Smith",
          old_role: "user",
          new_role: "admin",
          changed_by: "Admin User",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          reason: "Promoted to department manager",
        },
        {
          id: "role-2",
          user_id: "user-456",
          user_name: "Sarah Johnson",
          old_role: "admin",
          new_role: "user",
          changed_by: "Admin User",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          reason: "Stepping down from management role",
        },
        {
          id: "role-3",
          user_id: "user-789",
          user_name: "Michael Brown",
          old_role: "user",
          new_role: "moderator",
          changed_by: "Admin User",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
          reason: "New responsibilities in content oversight",
        },
      ]

      setSecurityLogs(mockSecurityLogs)
      setFailedLogins(mockFailedLogins)
      setRoleChanges(mockRoleChanges)

      // Calculate stats
      setStats({
        criticalAlerts: mockSecurityLogs.filter((log) => log.severity === "critical").length,
        highAlerts: mockSecurityLogs.filter((log) => log.severity === "high").length,
        mediumAlerts: mockSecurityLogs.filter((log) => log.severity === "medium").length,
        lowAlerts: mockSecurityLogs.filter((log) => log.severity === "low").length,
        failedLogins: mockFailedLogins.length,
        roleChanges: mockRoleChanges.length,
        blockedIPs: mockFailedLogins.filter((login) => login.blocked).length,
      })

      // Set up real-time subscription for security logs (in a real app)
      const subscription = supabase
        .channel("security-logs-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "security_logs" }, (payload) => {
          console.log("Security log change received:", payload)
          // In a real app, we would refresh the data here
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    } catch (error: any) {
      console.error("Error fetching security data:", error)
      setError(error.message || "Failed to load security data")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSecurityData()

    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchSecurityData()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [])

  // Filter security logs based on search query, severity filter, and status filter
  const filteredSecurityLogs = securityLogs.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.user_name && log.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.ip_address.includes(searchQuery) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter
    const matchesStatus = statusFilter === "all" || log.status === statusFilter

    return matchesSearch && matchesSeverity && matchesStatus
  })

  const refreshData = () => {
    setIsRefreshing(true)
    fetchSecurityData()
  }

  const exportSecurityReport = () => {
    // Create CSV content
    const headers = ["Event Type", "Severity", "User", "IP Address", "Timestamp", "Details", "Status"]
    const rows = filteredSecurityLogs.map((log) => [
      log.event_type.replace(/_/g, " "),
      log.severity,
      log.user_name || "N/A",
      log.ip_address,
      new Date(log.timestamp).toLocaleString(),
      log.details,
      log.status.replace(/_/g, " "),
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `security-logs-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-600">Critical</Badge>
      case "high":
        return <Badge className="bg-red-500">High</Badge>
      case "medium":
        return <Badge className="bg-amber-500">Medium</Badge>
      case "low":
        return <Badge className="bg-blue-500">Low</Badge>
      default:
        return <Badge>{severity}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            New
          </Badge>
        )
      case "investigating":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            Investigating
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Resolved
          </Badge>
        )
      case "false_positive":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
            False Positive
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading && !isRefreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Security Supervision</h1>
          <p className="text-muted-foreground">Monitor security events and suspicious activities</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={refreshData} className="h-10" disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportSecurityReport} className="h-10">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">Highest priority security issues</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Alerts</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highAlerts + stats.mediumAlerts}</div>
            <p className="text-xs text-muted-foreground">High and medium severity issues</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failedLogins}</div>
            <p className="text-xs text-muted-foreground">{stats.blockedIPs} IPs blocked</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role Changes</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.roleChanges}</div>
            <p className="text-xs text-muted-foreground">Permission modifications</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="security" className="space-y-4">
        <TabsList className="w-full flex justify-start overflow-x-auto">
          <TabsTrigger value="security" className="flex-1 sm:flex-none">
            Security Alerts
          </TabsTrigger>
          <TabsTrigger value="logins" className="flex-1 sm:flex-none">
            Failed Logins
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex-1 sm:flex-none">
            Role Changes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>Real-time security events and suspicious activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search security logs..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0">
                  <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="false_positive">False Positive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead className="hidden md:table-cell">User</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead className="hidden lg:table-cell">Timestamp</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSecurityLogs.length > 0 ? (
                      filteredSecurityLogs.map((log) => (
                        <TableRow
                          key={log.id}
                          className={
                            log.severity === "critical"
                              ? "bg-red-50 dark:bg-red-900/10"
                              : log.severity === "high"
                                ? "bg-orange-50 dark:bg-orange-900/10"
                                : ""
                          }
                        >
                          <TableCell className="font-medium">
                            {log.event_type.replace(/_/g, " ")}
                            <div className="md:hidden text-xs text-muted-foreground mt-1">
                              {log.user_name || "No user"}
                            </div>
                            <div className="lg:hidden text-xs text-muted-foreground mt-1">
                              {format(new Date(log.timestamp), "PPp")}
                            </div>
                          </TableCell>
                          <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                          <TableCell className="hidden md:table-cell">{log.user_name || "N/A"}</TableCell>
                          <TableCell>{log.ip_address}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{format(new Date(log.timestamp), "PPp")}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                          <TableCell className="hidden md:table-cell max-w-xs truncate" title={log.details}>
                            {log.details}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No security logs found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Login Attempts</CardTitle>
              <CardDescription>Track unsuccessful login attempts and potential brute force attacks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {failedLogins.length > 0 ? (
                      failedLogins.map((login) => (
                        <TableRow
                          key={login.id}
                          className={login.attempt_count >= 5 ? "bg-red-50 dark:bg-red-900/10" : ""}
                        >
                          <TableCell className="font-medium">{login.email}</TableCell>
                          <TableCell>{login.ip_address}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{format(new Date(login.timestamp), "PPp")}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={login.attempt_count >= 5 ? "destructive" : "outline"}
                              className={login.attempt_count >= 5 ? "" : "bg-amber-100 text-amber-800 border-amber-300"}
                            >
                              {login.attempt_count} attempts
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {login.blocked ? (
                              <Badge variant="destructive">Blocked</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                Active
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No failed login attempts found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Changes</CardTitle>
              <CardDescription>Track permission changes and role modifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role Change</TableHead>
                      <TableHead>Changed By</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead className="hidden md:table-cell">Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roleChanges.length > 0 ? (
                      roleChanges.map((change) => (
                        <TableRow
                          key={change.id}
                          className={
                            change.new_role === "admin" || change.old_role === "admin"
                              ? "bg-blue-50 dark:bg-blue-900/10"
                              : ""
                          }
                        >
                          <TableCell className="font-medium">{change.user_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{change.old_role}</Badge>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              <Badge
                                variant={
                                  change.new_role === "admin"
                                    ? "default"
                                    : change.new_role === "moderator"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {change.new_role}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{change.changed_by}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{format(new Date(change.timestamp), "PPp")}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{change.reason}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No role changes found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
