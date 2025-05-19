"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  FileText,
  Download,
  Trash2,
  Loader2,
  File,
  FileImage,
  FileIcon as FilePdf,
  FileArchive,
  Calendar,
} from "lucide-react"
import { format } from "date-fns"
import { supabase } from "@/lib/supabase"

type MedicalReport = {
  id: string
  title: string
  file_url: string
  file_type: string
  date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export default function MedicalReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<MedicalReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentReport, setCurrentReport] = useState<MedicalReport | null>(null)

  // Form state
  const [reportTitle, setReportTitle] = useState("")
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [reportNotes, setReportNotes] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchReports()
  }, [user])

  const fetchReports = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("medical_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (error) throw error

      setReports(data || [])
    } catch (error: any) {
      console.error("Error fetching medical reports:", error)
      setMessage({ type: "error", text: error.message || "Failed to load medical reports" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddReport = () => {
    resetForm()
    setCurrentReport(null)
    setIsAddDialogOpen(true)
  }

  const handleDeleteReport = (report: MedicalReport) => {
    setCurrentReport(report)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteReport = async () => {
    if (!currentReport) return

    setIsSaving(true)
    try {
      // Delete the file from storage
      const filePathMatch = currentReport.file_url.match(/\/([^/]+)$/)
      if (filePathMatch && filePathMatch[1]) {
        const filePath = `${user?.id}/${filePathMatch[1]}`
        const { error: storageError } = await supabase.storage.from("medical_reports").remove([filePath])

        if (storageError) {
          console.error("Error deleting file from storage:", storageError)
        }
      }

      // Delete the record from the database
      const { error } = await supabase.from("medical_reports").delete().eq("id", currentReport.id)

      if (error) throw error

      setReports(reports.filter((r) => r.id !== currentReport.id))
      setMessage({ type: "success", text: "Medical report deleted successfully" })
    } catch (error: any) {
      console.error("Error deleting medical report:", error)
      setMessage({ type: "error", text: error.message || "Failed to delete medical report" })
    } finally {
      setIsSaving(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const saveReport = async () => {
    if (!user || !selectedFile) return

    if (!reportTitle) {
      setMessage({ type: "error", text: "Report title is required" })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("medical_reports")
        .upload(filePath, selectedFile)

      if (uploadError) throw uploadError

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage.from("medical_reports").getPublicUrl(filePath)

      if (!urlData.publicUrl) {
        throw new Error("Failed to get public URL for the uploaded file")
      }

      // Determine file type category
      let fileType = "Document"
      if (selectedFile.type.startsWith("image/")) {
        fileType = "Image"
      } else if (selectedFile.type === "application/pdf") {
        fileType = "PDF"
      } else if (selectedFile.type.includes("spreadsheet") || selectedFile.type.includes("excel")) {
        fileType = "Spreadsheet"
      }

      // Save report metadata to database
      const reportData = {
        user_id: user.id,
        title: reportTitle,
        file_url: urlData.publicUrl,
        file_type: fileType,
        date: reportDate,
        notes: reportNotes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("medical_reports").insert(reportData).select()

      if (error) throw error

      if (data) {
        setReports([...data, ...reports])
      }

      setMessage({ type: "success", text: "Medical report uploaded successfully" })
      setIsAddDialogOpen(false)
    } catch (error: any) {
      console.error("Error saving medical report:", error)
      setMessage({ type: "error", text: error.message || "Failed to upload medical report" })
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setReportTitle("")
    setReportDate(new Date().toISOString().split("T")[0])
    setReportNotes("")
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "image":
        return <FileImage className="h-8 w-8 text-blue-500" />
      case "pdf":
        return <FilePdf className="h-8 w-8 text-red-500" />
      case "spreadsheet":
        return <FileArchive className="h-8 w-8 text-green-500" />
      default:
        return <FileText className="h-8 w-8 text-gray-500" />
    }
  }

  const downloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medical Reports</h1>
          <p className="text-muted-foreground">Upload and manage your medical documents and test results</p>
        </div>
        <Button onClick={handleAddReport}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Report
        </Button>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-6">
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <File className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No medical reports</h3>
            <p className="text-muted-foreground mb-4">You haven't uploaded any medical reports yet.</p>
            <Button onClick={handleAddReport}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Your First Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">{report.title}</CardTitle>
                <CardDescription className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {format(new Date(report.date), "MMMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getFileIcon(report.file_type)}
                    <span className="ml-2 text-sm text-muted-foreground">{report.file_type}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => downloadFile(report.file_url, report.title)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteReport(report)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {report.notes && <p className="text-sm text-muted-foreground">{report.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Report Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Medical Report</DialogTitle>
            <DialogDescription>Upload a medical document, test result, or any health-related file</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Blood Test Results"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Report Date</Label>
              <Input id="date" type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">File</Label>
              <Input id="file" type="file" ref={fileInputRef} onChange={handleFileChange} required />
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX (max 10MB)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="Any additional information about this report"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveReport} disabled={isSaving || !selectedFile}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>Upload</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the report "{currentReport?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteReport}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
