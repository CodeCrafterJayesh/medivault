"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  AlertCircle,
  Shield,
  Clock,
  Download,
  AlertTriangle,
  FileText,
  Eye,
  Filter,
  Search,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Audit log type
type AuditLog = {
  id: string
  event_type: string
  user_id: string
  user_name: string
  timestamp: string
  details: string
  severity: "low" | "medium" | "high"
}

// Security alert type
type SecurityAlert = {
  id: string
  alert_type: string
  timestamp: string
  status: "active" | "resolved"
  details: string
  severity: "low" | "medium" | "high"
}

// Consent version type
type ConsentVersion = {
  id: string
  version: string
  published_date: string
  status: "active" | "archived"
  changes: string
}

export default function ComplianceDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [consentVersions, setConsentVersions] = useState<ConsentVersion[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    const fetchComplianceData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // In a real application, we would fetch this data from Supabase
        // For now, we'll use mock data that simulates real-time data

        // Generate mock audit logs
        const mockAuditLogs: AuditLog[] = [
          {
            id: "audit-1",
            event_type: "data_access",
            user_id: "user-123",
            user_name: "John Smith",
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
            details: "Accessed patient medical history",
            severity: "low",
          },
          {
            id: "audit-2",
            event_type: "data_export",
            user_id: "user-456",
            user_name: "Sarah Johnson",
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
            details: "Exported medical reports as PDF",
            severity: "medium",
          },
          {
            id: "audit-3",
            event_type: "data_sharing",
            user_id: "user-789",
            user_name: "Michael Brown",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            details: "Shared medical data with external provider",
            severity: "high",
          },
          {
            id: "audit-4",
            event_type: "login_attempt",
            user_id: "user-123",
            user_name: "John Smith",
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
            details: "Successful login from new device",
            severity: "low",
          },
          {
            id: "audit-5",
            event_type: "permission_change",
            user_id: "user-456",
            user_name: "Sarah Johnson",
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
            details: "Changed data sharing permissions",
            severity: "medium",
          },
          {
            id: "audit-6",
            event_type: "account_update",
            user_id: "user-789",
            user_name: "Michael Brown",
            timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
            details: "Updated account information",
            severity: "low",
          },
        ]

        // Generate mock security alerts
        const mockSecurityAlerts: SecurityAlert[] = [
          {
            id: "alert-1",
            alert_type: "multiple_failed_logins",
            timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
            status: "active",
            details: "5 failed login attempts for user account john.doe@example.com",
            severity: "medium",
          },
          {
            id: "alert-2",
            alert_type: "unusual_access_pattern",
            timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 minutes ago
            status: "active",
            details: "Unusual access pattern detected for user sarah.johnson@example.com",
            severity: "high",
          },
          {
            id: "alert-3",
            alert_type: "data_access_spike",
            timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(), // 40 minutes ago
            status: "resolved",
            details: "Spike in data access requests from IP 192.168.1.1",
            severity: "medium",
          },
          {
            id: "alert-4",
            alert_type: "unauthorized_export_attempt",
            timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(), // 55 minutes ago
            status: "resolved",
            details: "Attempted unauthorized export of medical records",
            severity: "high",
          },
        ]

        // Generate mock consent versions
        const mockConsentVersions: ConsentVersion[] = [
          {
            id: "consent-1",
            version: "v3.2.1",
            published_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
            status: "active",
            changes: "Updated data retention policy and third-party sharing terms",
          },
          {
            id: "consent-2",
            version: "v3.1.0",
            published_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
            status: "archived",
            changes: "Added GDPR compliance section and updated privacy terms",
          },
          {
            id: "consent-3",
            version: "v3.0.0",
            published_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(), // 60 days ago
            status: "archived",
            changes: "Major revision of all terms and conditions",
          },
          {
            id: "consent-4",
            version: "v2.5.0",
            published_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(), // 90 days ago
            status: "archived",
            changes: "Updated medical data sharing policies",
          },
        ]

        setAuditLogs(mockAuditLogs)
        setSecurityAlerts(mockSecurityAlerts)
        setConsentVersions(mockConsentVersions)

        // Set up real-time subscription for audit logs (in a real app)
        // This would connect to a Supabase table with audit logs
        const subscription = supabase
          .channel("audit-logs-changes")
          .on("postgres_changes", { event: "*", schema: "public", table: "audit_logs" }, (payload) => {
            console.log("Audit log change received:", payload)
            // In a real app, we would refresh the data here
          })
          .subscribe()

        return () => {
          subscription.unsubscribe()
        }
      } catch (error: any) {
        console.error("Error fetching compliance data:", error)
        setError(error.message || "Failed to load compliance data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchComplianceData()

    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchComplianceData()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [])

  // Filter audit logs based on search query and severity filter
  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter

    return matchesSearch && matchesSeverity
  })

  // Filter security alerts based on search query, severity filter, and status filter
  const filteredSecurityAlerts = securityAlerts.filter((alert) => {
    const matchesSearch =
      searchQuery === "" ||
      alert.alert_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.details.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter

    return matchesSearch && matchesSeverity && matchesStatus
  })

  const exportComplianceReport = () => {
    // In a real app, this would generate a CSV or Excel file
    alert("Exporting compliance report...")
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return <Badge className="bg-blue-500">Low</Badge>
      case "medium":
        return <Badge className="bg-amber-500">Medium</Badge>
      case "high":
        return <Badge className="bg-red-500">High</Badge>
      default:
        return <Badge>{severity}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="destructive">Active</Badge>
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Resolved
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (isLoading) {
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Privacy & Compliance</h1>
          <p className="text-muted-foreground">Monitor privacy compliance and security events</p>
        </div>
        <Button variant="outline" onClick={exportComplianceReport} className="hover:bg-gray-100 transition-colors">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Logs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              {auditLogs.filter((log) => log.severity === "high").length} high severity events
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {securityAlerts.filter((alert) => alert.status === "active").length} active alerts
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consent Versions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consentVersions.length}</div>
            <p className="text-xs text-muted-foreground">
              Latest version: {consentVersions.find((v) => v.status === "active")?.version}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="security">Security Alerts</TabsTrigger>
          <TabsTrigger value="consent">Consent Versions</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Comprehensive log of all data access and sharing activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search audit logs..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuditLogs.length > 0 ? (
                      filteredAuditLogs.map((log) => (
                        <TableRow
                          key={log.id}
                          className="group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <TableCell className="font-medium">{log.event_type.replace(/_/g, " ")}</TableCell>
                          <TableCell>{log.user_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                          <TableCell>{log.details}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>Real-time security events and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search security alerts..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alert Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSecurityAlerts.length > 0 ? (
                      filteredSecurityAlerts.map((alert) => (
                        <TableRow
                          key={alert.id}
                          className={alert.status === "active" ? "bg-red-50 dark:bg-red-900/10" : ""}
                        >
                          <TableCell className="font-medium">{alert.alert_type.replace(/_/g, " ")}</TableCell>
                          <TableCell>{getStatusBadge(alert.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{new Date(alert.timestamp).toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                          <TableCell>{alert.details}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No security alerts found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consent Version Control</CardTitle>
              <CardDescription>Track changes to consent forms and privacy policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Published Date</TableHead>
                      <TableHead>Changes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consentVersions.length > 0 ? (
                      consentVersions.map((version) => (
                        <TableRow key={version.id}>
                          <TableCell className="font-medium">{version.version}</TableCell>
                          <TableCell>
                            {version.status === "active" ? (
                              <Badge className="bg-green-500">Active</Badge>
                            ) : (
                              <Badge variant="outline">Archived</Badge>
                            )}
                          </TableCell>
                          <TableCell>{new Date(version.published_date).toLocaleDateString()}</TableCell>
                          <TableCell className="max-w-xs truncate" title={version.changes}>
                            {version.changes}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No consent versions found
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
