"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Loader2,
  AlertCircle,
  FileText,
  Clock,
  Download,
  Search,
  Filter,
  Eye,
  BarChart,
  PieChart,
  Calendar,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

// PDF log type
type PdfLog = {
  id: string
  user_id: string
  user_name: string
  document_type: string
  timestamp: string
  file_size: string
  recipient?: string
  status: "generated" | "shared" | "downloaded"
}

export default function PdfLogsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfLogs, setPdfLogs] = useState<PdfLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<PdfLog[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [timeFilter, setTimeFilter] = useState<string>("all")
  const [stats, setStats] = useState({
    totalPdfs: 0,
    generatedToday: 0,
    sharedPdfs: 0,
    downloadedPdfs: 0,
  })

  useEffect(() => {
    const fetchPdfLogs = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // In a real application, we would fetch this data from Supabase
        // For now, we'll use mock data that simulates real-time data

        // Generate mock PDF logs
        const mockPdfLogs: PdfLog[] = [
          {
            id: "pdf-1",
            user_id: "user-123",
            user_name: "John Smith",
            document_type: "Medical Report",
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
            file_size: "1.2 MB",
            status: "generated",
          },
          {
            id: "pdf-2",
            user_id: "user-456",
            user_name: "Sarah Johnson",
            document_type: "Prescription",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            file_size: "0.5 MB",
            recipient: "Dr. Michael Brown",
            status: "shared",
          },
          {
            id: "pdf-3",
            user_id: "user-789",
            user_name: "Robert Davis",
            document_type: "Lab Results",
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
            file_size: "2.1 MB",
            status: "downloaded",
          },
          {
            id: "pdf-4",
            user_id: "user-123",
            user_name: "John Smith",
            document_type: "Vaccination Record",
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
            file_size: "0.8 MB",
            recipient: "Travel Authority",
            status: "shared",
          },
          {
            id: "pdf-5",
            user_id: "user-456",
            user_name: "Sarah Johnson",
            document_type: "Medical History",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            file_size: "3.5 MB",
            status: "generated",
          },
          {
            id: "pdf-6",
            user_id: "user-789",
            user_name: "Robert Davis",
            document_type: "Insurance Claim",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
            file_size: "1.7 MB",
            recipient: "Insurance Provider",
            status: "shared",
          },
          {
            id: "pdf-7",
            user_id: "user-123",
            user_name: "John Smith",
            document_type: "Appointment Summary",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
            file_size: "0.9 MB",
            status: "downloaded",
          },
          {
            id: "pdf-8",
            user_id: "user-456",
            user_name: "Sarah Johnson",
            document_type: "Specialist Referral",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
            file_size: "0.6 MB",
            recipient: "Dr. Emily Wilson",
            status: "shared",
          },
          {
            id: "pdf-9",
            user_id: "user-789",
            user_name: "Robert Davis",
            document_type: "Medication List",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
            file_size: "0.4 MB",
            status: "generated",
          },
          {
            id: "pdf-10",
            user_id: "user-123",
            user_name: "John Smith",
            document_type: "Allergy Report",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24 hours ago
            file_size: "1.1 MB",
            status: "downloaded",
          },
          {
            id: "pdf-11",
            user_id: "user-456",
            user_name: "Sarah Johnson",
            document_type: "Treatment Plan",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 36 hours ago
            file_size: "2.3 MB",
            status: "generated",
          },
          {
            id: "pdf-12",
            user_id: "user-789",
            user_name: "Robert Davis",
            document_type: "Surgical Report",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 48 hours ago
            file_size: "4.2 MB",
            recipient: "Dr. James Wilson",
            status: "shared",
          },
        ]

        setPdfLogs(mockPdfLogs)
        setFilteredLogs(mockPdfLogs)

        // Calculate statistics
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

        const generatedToday = mockPdfLogs.filter(
          (log) => new Date(log.timestamp).getTime() >= today && log.status === "generated",
        ).length

        const sharedPdfs = mockPdfLogs.filter((log) => log.status === "shared").length
        const downloadedPdfs = mockPdfLogs.filter((log) => log.status === "downloaded").length

        setStats({
          totalPdfs: mockPdfLogs.length,
          generatedToday,
          sharedPdfs,
          downloadedPdfs,
        })

        // Set up real-time subscription for PDF logs (in a real app)
        // This would connect to a Supabase table with PDF logs
        const subscription = supabase
          .channel("pdf-logs-changes")
          .on("postgres_changes", { event: "*", schema: "public", table: "pdf_logs" }, (payload) => {
            console.log("PDF log change received:", payload)
            // In a real app, we would refresh the data here
          })
          .subscribe()

        return () => {
          subscription.unsubscribe()
        }
      } catch (error: any) {
        console.error("Error fetching PDF logs:", error)
        setError(error.message || "Failed to load PDF logs")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPdfLogs()

    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchPdfLogs()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [])

  // Filter logs based on search query, status filter, and time filter
  useEffect(() => {
    let filtered = pdfLogs

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (log) =>
          log.user_name.toLowerCase().includes(query) ||
          log.document_type.toLowerCase().includes(query) ||
          (log.recipient && log.recipient.toLowerCase().includes(query)),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((log) => log.status === statusFilter)
    }

    // Apply time filter
    if (timeFilter !== "all") {
      const now = new Date().getTime()
      let timeThreshold = now

      switch (timeFilter) {
        case "24h":
          timeThreshold = now - 24 * 60 * 60 * 1000 // 24 hours ago
          break
        case "7d":
          timeThreshold = now - 7 * 24 * 60 * 60 * 1000 // 7 days ago
          break
        case "30d":
          timeThreshold = now - 30 * 24 * 60 * 60 * 1000 // 30 days ago
          break
      }

      filtered = filtered.filter((log) => new Date(log.timestamp).getTime() >= timeThreshold)
    }

    setFilteredLogs(filtered)
  }, [searchQuery, statusFilter, timeFilter, pdfLogs])

  const exportPdfReport = () => {
    // In a real app, this would generate a CSV or Excel file
    alert("Exporting PDF generation report...")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "generated":
        return <Badge className="bg-blue-500">Generated</Badge>
      case "shared":
        return <Badge className="bg-amber-500">Shared</Badge>
      case "downloaded":
        return <Badge className="bg-green-500">Downloaded</Badge>
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
          <h1 className="text-3xl font-bold tracking-tight">PDF Generation & Sharing</h1>
          <p className="text-muted-foreground">Monitor PDF exports and sharing activities</p>
        </div>
        <Button variant="outline" onClick={exportPdfReport} className="hover:bg-gray-100 transition-colors">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total PDFs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPdfs}</div>
            <p className="text-xs text-muted-foreground">Across all users</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.generatedToday}</div>
            <p className="text-xs text-muted-foreground">New PDFs today</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared PDFs</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sharedPdfs}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.sharedPdfs / stats.totalPdfs) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloaded PDFs</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.downloadedPdfs}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.downloadedPdfs / stats.totalPdfs) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PDF Generation & Sharing Logs</CardTitle>
          <CardDescription>Real-time logs of PDF exports per user (anonymized)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search PDF logs..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="generated">Generated</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                    <SelectItem value="downloaded">Downloaded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <TableCell className="font-medium">{log.document_type}</TableCell>
                      <TableCell>{log.user_name}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>{log.file_size}</TableCell>
                      <TableCell>{log.recipient || "—"}</TableCell>
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
                    <TableCell colSpan={7} className="h-24 text-center">
                      No PDF logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
