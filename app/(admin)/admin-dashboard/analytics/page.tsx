"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Loader2,
  AlertCircle,
  Download,
  Activity,
  Users,
  FileText,
  Server,
  Database,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bell,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import {
  Line,
  LineChart as RechartsLineChart,
  Bar,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// System stats type
type SystemStats = {
  totalUsers: number
  activeUsers: number
  totalDocuments: number
  totalAppointments: number
  totalStorage: string
  apiCalls: number
  uptime: string
  responseTime: string
}

// Usage data point type
type UsageDataPoint = {
  date: string
  users: number
  documents: number
  appointments: number
}

// API call data point type
type ApiCallDataPoint = {
  time: string
  calls: number
  responseTime: number
}

// System status type
type SystemStatus = {
  component: string
  status: "online" | "degraded" | "offline"
  uptime: string
  lastIncident?: string
}

export default function SystemAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 12,
    activeUsers: 3,
    totalDocuments: 0,
    totalAppointments: 0,
    totalStorage: "0 MB",
    apiCalls: 0,
    uptime: "0d 0h 0m",
    responseTime: "0ms",
  })
  const [usageData, setUsageData] = useState<UsageDataPoint[]>([])
  const [apiCallData, setApiCallData] = useState<ApiCallDataPoint[]>([])
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([])
  const [timeRange, setTimeRange] = useState<string>("7d")

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // In a real application, we would fetch this data from Supabase
        // For now, we'll use mock data that simulates real-time data

        // Fetch basic stats
        const { count: usersCount, error: usersError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })

        if (usersError) throw usersError

        const { count: documentsCount, error: documentsError } = await supabase
          .from("medical_reports")
          .select("*", { count: "exact", head: true })

        if (documentsError) throw documentsError

        const { count: appointmentsCount, error: appointmentsError } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })

        if (appointmentsError) throw appointmentsError

        // Set system stats
        setSystemStats({
          totalUsers: usersCount || 0,
          activeUsers: Math.floor((usersCount || 0) * 0.7), // Estimate active users
          totalDocuments: documentsCount || 0,
          totalAppointments: appointmentsCount || 0,
          totalStorage: `${((documentsCount || 0) * 2.5).toFixed(1)} MB`, // Estimate based on documents
          apiCalls: Math.floor(Math.random() * 10000) + 5000, // Random API calls
          uptime: "99.98%",
          responseTime: "124ms",
        })

        // Generate usage data based on time range
        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
        const usageDataPoints: UsageDataPoint[] = []

        for (let i = days; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)

          // Create a smooth trend with some randomness
          const baseUsers = Math.floor(usersCount * 0.6) + Math.floor(Math.random() * 10)
          const baseDocuments = Math.floor(documentsCount * 0.8) + Math.floor(Math.random() * 5)
          const baseAppointments = Math.floor(appointmentsCount * 0.7) + Math.floor(Math.random() * 3)

          // Add a growth trend
          const growthFactor = 1 + (days - i) / (days * 2)

          usageDataPoints.push({
            date: date.toISOString().split("T")[0],
            users: Math.floor(baseUsers * growthFactor),
            documents: Math.floor(baseDocuments * growthFactor),
            appointments: Math.floor(baseAppointments * growthFactor),
          })
        }

        setUsageData(usageDataPoints)

        // Generate API call data (last 24 hours)
        const apiCallDataPoints: ApiCallDataPoint[] = []

        for (let i = 24; i >= 0; i--) {
          const time = new Date()
          time.setHours(time.getHours() - i)

          // Create a pattern with peak hours
          const hourOfDay = time.getHours()
          const isPeakHour = hourOfDay >= 9 && hourOfDay <= 17
          const baseCalls = isPeakHour ? 300 : 100
          const baseResponseTime = isPeakHour ? 150 : 100

          apiCallDataPoints.push({
            time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            calls: baseCalls + Math.floor(Math.random() * 100),
            responseTime: baseResponseTime + Math.floor(Math.random() * 50),
          })
        }

        setApiCallData(apiCallDataPoints)

        // Generate system status
        setSystemStatus([
          {
            component: "Database",
            status: "online",
            uptime: "99.99%",
          },
          {
            component: "Authentication",
            status: "online",
            uptime: "99.98%",
          },
          {
            component: "Storage",
            status: "online",
            uptime: "100%",
          },
          {
            component: "API Gateway",
            status: "online",
            uptime: "99.95%",
            lastIncident: "3 days ago",
          },
          {
            component: "Notification Service",
            status: "degraded",
            uptime: "98.5%",
            lastIncident: "2 hours ago",
          },
        ])

        // Set up real-time subscription for analytics data (in a real app)
        const subscription = supabase
          .channel("analytics-changes")
          .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
            console.log("Analytics data change received:", payload)
            // In a real app, we would refresh the data here
          })
          .subscribe()

        return () => {
          subscription.unsubscribe()
        }
      } catch (error: any) {
        console.error("Error fetching analytics data:", error)
        setError(error.message || "Failed to load analytics data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()

    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchAnalyticsData()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [timeRange])

  const exportAnalyticsReport = () => {
    // In a real app, this would generate a CSV or Excel file
    alert("Exporting analytics report...")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-500">Online</Badge>
      case "degraded":
        return <Badge className="bg-amber-500">Degraded</Badge>
      case "offline":
        return <Badge className="bg-red-500">Offline</Badge>
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
          <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
          <p className="text-muted-foreground">Real-time system health and usage statistics</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportAnalyticsReport} className="hover:bg-gray-100 transition-colors">
            <Download className="mr-2 h-4 w-4" />
            Export Report
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
            <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">{systemStats.activeUsers} active users</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">{systemStats.totalStorage} storage used</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.apiCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Avg. response time: {systemStats.responseTime}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.uptime}</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Usage Trends</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="status">System Status</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Trends</CardTitle>
              <CardDescription>User activity and document trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    users: {
                      label: "Active Users",
                      color: "hsl(var(--chart-1))",
                    },
                    documents: {
                      label: "Documents",
                      color: "hsl(var(--chart-2))",
                    },
                    appointments: {
                      label: "Appointments",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={usageData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} />
                      <Line type="monotone" dataKey="documents" stroke="var(--color-documents)" strokeWidth={2} />
                      <Line type="monotone" dataKey="appointments" stroke="var(--color-appointments)" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Performance</CardTitle>
              <CardDescription>API call volume and response times (last 24 hours)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    calls: {
                      label: "API Calls",
                      color: "hsl(var(--chart-1))",
                    },
                    responseTime: {
                      label: "Response Time (ms)",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={apiCallData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" orientation="left" stroke="var(--color-calls)" />
                      <YAxis yAxisId="right" orientation="right" stroke="var(--color-responseTime)" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="calls" fill="var(--color-calls)" name="API Calls" />
                      <Bar
                        yAxisId="right"
                        dataKey="responseTime"
                        fill="var(--color-responseTime)"
                        name="Response Time (ms)"
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current status of all system components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemStatus.map((component, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {component.component === "Database" && <Database className="h-5 w-5 text-primary" />}
                      {component.component === "Authentication" && <Shield className="h-5 w-5 text-primary" />}
                      {component.component === "Storage" && <Server className="h-5 w-5 text-primary" />}
                      {component.component === "API Gateway" && <Activity className="h-5 w-5 text-primary" />}
                      {component.component === "Notification Service" && <Bell className="h-5 w-5 text-primary" />}
                      <div>
                        <p className="font-medium">{component.component}</p>
                        <p className="text-xs text-muted-foreground">Uptime: {component.uptime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {component.lastIncident && (
                        <p className="text-xs text-muted-foreground">Last incident: {component.lastIncident}</p>
                      )}
                      <div className="flex items-center gap-2">
                        {component.status === "online" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : component.status === "degraded" ? (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        {getStatusBadge(component.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
