"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, FileText, BarChart, PieChart, Clock, Download } from "lucide-react"
import { supabase } from "@/lib/supabase"

// File type definition
type FileMetadata = {
  id: string
  title: string
  file_type: string
  size: string
  date: string
  user_id: string
}

// File type stats
type FileTypeStats = {
  type: string
  count: number
  totalSize: number
}

export default function MedicalDataOversightPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentFiles, setRecentFiles] = useState<FileMetadata[]>([])
  const [fileTypeStats, setFileTypeStats] = useState<FileTypeStats[]>([])
  const [totalFiles, setTotalFiles] = useState(0)
  const [totalSize, setTotalSize] = useState(0)

  useEffect(() => {
    const fetchMedicalData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch medical reports
        const { data: reportsData, error: reportsError } = await supabase
          .from("medical_reports")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10)

        if (reportsError) throw reportsError

        if (reportsData) {
          // Transform reports data to FileMetadata type
          const transformedFiles: FileMetadata[] = reportsData.map((report) => {
            // Generate a random file size between 1-10 MB
            const fileSizeMB = (Math.random() * 9 + 1).toFixed(1)

            return {
              id: report.id,
              title: report.title,
              file_type: report.file_type,
              size: `${fileSizeMB} MB`,
              date: report.date,
              user_id: report.user_id,
            }
          })

          setRecentFiles(transformedFiles)

          // Calculate file type statistics
          const stats: Record<string, FileTypeStats> = {}

          transformedFiles.forEach((file) => {
            const fileType = file.file_type
            const sizeInMB = Number.parseFloat(file.size.split(" ")[0])

            if (!stats[fileType]) {
              stats[fileType] = {
                type: fileType,
                count: 0,
                totalSize: 0,
              }
            }

            stats[fileType].count += 1
            stats[fileType].totalSize += sizeInMB
          })

          setFileTypeStats(Object.values(stats))

          // Calculate totals
          setTotalFiles(transformedFiles.length)
          setTotalSize(Object.values(stats).reduce((sum, stat) => sum + stat.totalSize, 0))
        }

        // Set up real-time subscription for medical_reports table
        const subscription = supabase
          .channel("medical-reports-changes")
          .on("postgres_changes", { event: "*", schema: "public", table: "medical_reports" }, () => {
            fetchMedicalData() // Refresh data when changes occur
          })
          .subscribe()

        return () => {
          subscription.unsubscribe()
        }
      } catch (error: any) {
        console.error("Error fetching medical data:", error)
        setError(error.message || "Failed to load medical data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMedicalData()

    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchMedicalData()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [])

  const exportReportData = () => {
    // In a real app, this would generate a CSV or Excel file
    alert("Exporting medical data report...")
  }

  // Simple bar chart component
  const BarChartComponent = ({ data }: { data: FileTypeStats[] }) => {
    const maxCount = Math.max(...data.map((item) => item.count))

    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{item.type}</span>
              <span className="font-medium">{item.count} files</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${(item.count / maxCount) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    )
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
          <h1 className="text-3xl font-bold tracking-tight">Medical Data Oversight</h1>
          <p className="text-muted-foreground">Monitor medical document uploads and statistics</p>
        </div>
        <Button variant="outline" onClick={exportReportData}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFiles}</div>
            <p className="text-xs text-muted-foreground">Across all users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSize.toFixed(1)} MB</div>
            <p className="text-xs text-muted-foreground">Used by all documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">File Types</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fileTypeStats.length}</div>
            <p className="text-xs text-muted-foreground">Different file formats</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Size</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFiles > 0 ? (totalSize / totalFiles).toFixed(1) : 0} MB</div>
            <p className="text-xs text-muted-foreground">Per document</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Uploads</TabsTrigger>
          <TabsTrigger value="stats">File Type Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Document Uploads</CardTitle>
              <CardDescription>Latest medical documents uploaded to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Upload Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentFiles.length > 0 ? (
                      recentFiles.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium">{file.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{file.file_type}</Badge>
                          </TableCell>
                          <TableCell>{file.size}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{new Date(file.date).toLocaleDateString()}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No recent uploads found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>File Type Distribution</CardTitle>
              <CardDescription>Breakdown of document types in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {fileTypeStats.length > 0 ? (
                <BarChartComponent data={fileTypeStats} />
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No file type statistics available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
