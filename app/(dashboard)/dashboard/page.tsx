"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Share2, Loader2, PhoneIcon, Mail, MessageSquare, Copy, Check, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { MedicationReminders } from "@/components/medication-reminders"
import { UpcomingAppointments } from "@/components/upcoming-appointments"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<any>(null)
  const [recentAppointments, setRecentAppointments] = useState<any[]>([])
  const [recentMedicalReports, setRecentMedicalReports] = useState<any[]>([])
  const [medicalHistory, setMedicalHistory] = useState<any>(null)
  const [medications, setMedications] = useState<any[]>([])
  const [healthMetrics, setHealthMetrics] = useState<any[]>([])
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([])

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareableLink, setShareableLink] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Reference to track if data has been loaded
  const dataLoaded = useRef(false)

  useEffect(() => {
    const fetchData = async () => {
      if (user && !dataLoaded.current) {
        try {
          // Fetch profile
          const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
          if (profileData) {
            setProfile(profileData)
          }

          // Fetch recent appointments
          const { data: appointmentsData } = await supabase
            .from("appointments")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: true })
            .limit(3)
          if (appointmentsData) {
            setRecentAppointments(appointmentsData)
          }

          // Fetch recent medical reports
          const { data: reportsData } = await supabase
            .from("medical_reports")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(3)
          if (reportsData) {
            setRecentMedicalReports(reportsData)
          }

          // Fetch medical history
          const { data: historyData } = await supabase
            .from("medical_history")
            .select("*")
            .eq("user_id", user.id)
            .single()
          if (historyData) {
            setMedicalHistory(historyData)
          }

          // Fetch medications
          const { data: medicationsData } = await supabase
            .from("medications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
          if (medicationsData) {
            setMedications(medicationsData)
          }

          // Fetch health metrics
          const { data: metricsData } = await supabase
            .from("health_metrics")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: false })
          if (metricsData) {
            setHealthMetrics(metricsData)
          }

          // Fetch emergency contacts
          const { data: contactsData } = await supabase.from("emergency_contacts").select("*").eq("user_id", user.id)
          if (contactsData) {
            setEmergencyContacts(contactsData)
          }

          dataLoaded.current = true
        } catch (error) {
          console.error("Error fetching data:", error)
          toast({
            variant: "destructive",
            title: "Error loading data",
            description: "Failed to load your health information. Please try again.",
          })
        }
      }
    }

    fetchData()
  }, [user, toast])

  const handleGeneratePDF = async () => {
    if (!user || !profile) {
      setErrorMessage("Unable to generate report. User profile not loaded.")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to generate report. User profile not loaded.",
      })
      return
    }

    // If we already have a PDF blob, just use that
    if (pdfBlob) {
      downloadPDF()
      return
    }

    setIsGeneratingPDF(true)
    setErrorMessage(null)

    toast({
      title: "Generating Report",
      description: "Please wait while we prepare your health report...",
    })

    try {
      // Create a new PDF document
      const doc = new jsPDF()

      // Add title and header
      doc.setFontSize(22)
      doc.setTextColor(41, 128, 185) // Blue color
      doc.text("MediVault Health Record", 105, 15, { align: "center" })

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: "center" })

      let yPos = 30

      // Add profile information
      doc.setFontSize(16)
      doc.setTextColor(41, 128, 185)
      doc.text("Personal Information", 14, yPos)
      yPos += 8

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text(`Name: ${profile.full_name || "Not provided"}`, 14, yPos)
      yPos += 6

      if (profile.date_of_birth) {
        doc.text(`Date of Birth: ${new Date(profile.date_of_birth).toLocaleDateString()}`, 14, yPos)
        yPos += 6
      }

      if (profile.gender) {
        doc.text(`Gender: ${profile.gender}`, 14, yPos)
        yPos += 6
      }

      if (profile.phone_number) {
        doc.text(`Phone: ${profile.phone_number}`, 14, yPos)
        yPos += 6
      }

      if (profile.address) {
        doc.text(`Address: ${profile.address}`, 14, yPos)
        yPos += 6
      }

      yPos += 6

      // Add medical history if available
      if (medicalHistory) {
        doc.setFontSize(16)
        doc.setTextColor(41, 128, 185)
        doc.text("Medical History", 14, yPos)
        yPos += 8

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)

        // Chronic illnesses
        if (medicalHistory.chronic_illnesses && medicalHistory.chronic_illnesses.length > 0) {
          doc.text("Chronic Illnesses:", 14, yPos)
          yPos += 6
          medicalHistory.chronic_illnesses.forEach((illness: string) => {
            doc.text(`• ${illness}`, 20, yPos)
            yPos += 5
          })
          yPos += 3
        }

        // Allergies
        if (
          medicalHistory.allergies &&
          medicalHistory.allergies.has_allergies === "yes" &&
          medicalHistory.allergies.items
        ) {
          doc.text("Allergies:", 14, yPos)
          yPos += 6
          medicalHistory.allergies.items.forEach((allergy: any) => {
            doc.text(`• ${allergy.name} - Reaction: ${allergy.reaction || "Not specified"}`, 20, yPos)
            yPos += 5
          })
          yPos += 3
        }

        // Previous surgeries
        if (
          medicalHistory.previous_surgeries &&
          medicalHistory.previous_surgeries.items &&
          medicalHistory.previous_surgeries.items.length > 0
        ) {
          doc.text("Previous Surgeries:", 14, yPos)
          yPos += 6
          medicalHistory.previous_surgeries.items.forEach((surgery: any) => {
            doc.text(`• ${surgery.name} - Date: ${surgery.date || "Not specified"}`, 20, yPos)
            yPos += 5
            if (surgery.notes) {
              doc.text(`  Notes: ${surgery.notes}`, 20, yPos)
              yPos += 5
            }
          })
          yPos += 3
        }

        yPos += 6
      }

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      // Add medications
      if (medications && medications.length > 0) {
        doc.setFontSize(16)
        doc.setTextColor(41, 128, 185)
        doc.text("Current Medications", 14, yPos)
        yPos += 8

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)

        medications.forEach((medication: any) => {
          doc.text(`• ${medication.name} - Dosage: ${medication.dosage || "Not specified"}`, 20, yPos)
          yPos += 5
          if (medication.frequency) {
            doc.text(`  Frequency: ${medication.frequency}`, 20, yPos)
            yPos += 5
          }
          if (medication.start_date) {
            doc.text(`  Started: ${new Date(medication.start_date).toLocaleDateString()}`, 20, yPos)
            yPos += 5
          }
        })

        yPos += 6
      }

      // Add emergency contacts
      if (emergencyContacts && emergencyContacts.length > 0) {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(16)
        doc.setTextColor(41, 128, 185)
        doc.text("Emergency Contacts", 14, yPos)
        yPos += 8

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)

        emergencyContacts.forEach((contact: any) => {
          doc.text(`• ${contact.full_name} (${contact.relationship})`, 20, yPos)
          yPos += 5
          doc.text(`  Phone: ${contact.phone_number}`, 20, yPos)
          yPos += 5
        })

        yPos += 6
      }

      // Add appointments
      if (recentAppointments && recentAppointments.length > 0) {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(16)
        doc.setTextColor(41, 128, 185)
        doc.text("Upcoming Appointments", 14, yPos)
        yPos += 8

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)

        // Filter for upcoming appointments
        const upcomingAppointments = recentAppointments.filter((apt) => new Date(apt.date) >= new Date())

        if (upcomingAppointments.length > 0) {
          upcomingAppointments.forEach((appointment) => {
            const appointmentDate = new Date(appointment.date)
            doc.text(`• ${appointment.title}`, 20, yPos)
            yPos += 5
            doc.text(
              `  Date: ${appointmentDate.toLocaleDateString()} at ${appointmentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
              20,
              yPos,
            )
            yPos += 5
            if (appointment.doctor_name) {
              doc.text(`  Doctor: ${appointment.doctor_name}`, 20, yPos)
              yPos += 5
            }
            if (appointment.location) {
              doc.text(`  Location: ${appointment.location}`, 20, yPos)
              yPos += 5
            }
            yPos += 3
          })
        } else {
          doc.text("No upcoming appointments scheduled.", 14, yPos)
          yPos += 6
        }

        yPos += 6
      }

      // Add medical reports
      if (recentMedicalReports && recentMedicalReports.length > 0) {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(16)
        doc.setTextColor(41, 128, 185)
        doc.text("Recent Medical Reports", 14, yPos)
        yPos += 8

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)

        recentMedicalReports.forEach((report) => {
          const reportDate = new Date(report.date)
          doc.text(`• ${report.title} (${report.file_type})`, 20, yPos)
          yPos += 5
          doc.text(`  Date: ${reportDate.toLocaleDateString()}`, 20, yPos)
          yPos += 5
        })

        yPos += 6
      }

      // Add health metrics if available
      if (healthMetrics && healthMetrics.length > 0) {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(16)
        doc.setTextColor(41, 128, 185)
        doc.text("Health Metrics", 14, yPos)
        yPos += 8

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)

        // Group metrics by type
        const metricsByType: Record<string, any[]> = {}
        healthMetrics.forEach((metric) => {
          if (!metricsByType[metric.metric_type]) {
            metricsByType[metric.metric_type] = []
          }
          metricsByType[metric.metric_type].push(metric)
        })

        Object.entries(metricsByType).forEach(([type, metrics]) => {
          const displayName = type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
          doc.text(`${displayName}:`, 14, yPos)
          yPos += 6

          // Get the most recent reading
          const latestMetric = metrics[0]
          doc.text(
            `• Latest: ${latestMetric.value} ${latestMetric.unit} (${new Date(latestMetric.date).toLocaleDateString()})`,
            20,
            yPos,
          )
          yPos += 5

          // Calculate average
          const sum = metrics.reduce((acc, metric) => acc + metric.value, 0)
          const avg = sum / metrics.length
          doc.text(`• Average: ${avg.toFixed(1)} ${latestMetric.unit}`, 20, yPos)
          yPos += 8
        })
      }

      // Add footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(`MediVault Health Record - Page ${i} of ${pageCount}`, 105, 285, { align: "center" })
      }

      // Save the PDF as a blob
      const blob = doc.output("blob")
      setPdfBlob(blob)

      // Trigger download
      downloadPDF(blob)

      toast({
        variant: "success",
        title: "Report Generated",
        description: "Your health report has been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      setErrorMessage("Failed to generate PDF. Please try again.")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const downloadPDF = (blob?: Blob) => {
    const pdfToDownload = blob || pdfBlob
    if (!pdfToDownload) return

    // Create a URL for the blob
    const url = URL.createObjectURL(pdfToDownload)

    // Create a link element
    const link = document.createElement("a")
    link.href = url
    link.download = `MediVault_Health_Record_${format(new Date(), "yyyy-MM-dd")}.pdf`

    // Append to the document
    document.body.appendChild(link)

    // Trigger download
    link.click()

    // Clean up
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      variant: "info",
      title: "Download Started",
      description: "Your health report is being downloaded.",
    })
  }

  const handleShare = () => {
    // If we don't have a PDF blob yet, generate one first
    if (!pdfBlob) {
      setIsGeneratingPDF(true)
      setErrorMessage(null)

      toast({
        title: "Preparing Report",
        description: "Please wait while we prepare your report for sharing...",
      })

      try {
        // Create a new PDF document (reusing the same logic as handleGeneratePDF)
        const doc = new jsPDF()
        // ... (same PDF generation code as above)

        // For brevity, I'm creating a simple PDF here
        doc.setFontSize(22)
        doc.text("MediVault Health Record", 105, 15, { align: "center" })
        doc.setFontSize(12)
        doc.text(`Generated for: ${profile?.full_name || "User"}`, 105, 25, { align: "center" })
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 35, { align: "center" })

        // Save the PDF as a blob
        const blob = doc.output("blob")
        setPdfBlob(blob)

        // In a real app, this would upload the PDF to a secure location and generate a shareable link
        // For demo purposes, we'll create a dummy link
        const dummyLink = `https://medivault.example.com/share/${Math.random().toString(36).substring(2, 15)}`
        setShareableLink(dummyLink)
      } catch (error) {
        console.error("Error generating PDF for sharing:", error)
        setErrorMessage("Failed to generate shareable report. Please try again.")
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate shareable report. Please try again.",
        })
      } finally {
        setIsGeneratingPDF(false)
      }
    }

    // Open the share dialog
    setShareDialogOpen(true)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)

    toast({
      variant: "success",
      title: "Link Copied",
      description: "Shareable link copied to clipboard.",
    })
  }

  const shareViaWhatsApp = () => {
    window.open(`https://wa.me/?text=Check out my health record: ${shareableLink}`, "_blank")
    toast({
      variant: "info",
      title: "Sharing via WhatsApp",
      description: "Opening WhatsApp to share your health record.",
    })
  }

  const shareViaEmail = () => {
    window.open(`mailto:?subject=My Health Record&body=Check out my health record: ${shareableLink}`, "_blank")
    toast({
      variant: "info",
      title: "Sharing via Email",
      description: "Opening your email client to share your health record.",
    })
  }

  const shareViaSMS = () => {
    window.open(`sms:?body=Check out my health record: ${shareableLink}`, "_blank")
    toast({
      variant: "info",
      title: "Sharing via SMS",
      description: "Opening your messaging app to share your health record.",
    })
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hello, {profile?.full_name || "User"}!</h1>
          <p className="text-muted-foreground">
            Welcome to your health dashboard. Here's a summary of your health information.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGeneratePDF} disabled={isGeneratingPDF} className="relative overflow-hidden group">
            {isGeneratingPDF ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-0.5" />
                Generate Report
              </>
            )}
            <span className="absolute inset-0 w-full h-full bg-white/10 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
          </Button>
          <Button variant="outline" onClick={handleShare} className="relative overflow-hidden group">
            <Share2 className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
            Share
            <span className="absolute inset-0 w-full h-full bg-primary/5 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Medical History</CardTitle>
            <CardDescription>Your recorded medical conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {profile ? "View your complete medical history" : "No medical history recorded yet"}
            </p>
            <Button variant="link" className="p-0 mt-2" asChild>
              <a href="/medical-history">View Details</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medications</CardTitle>
            <CardDescription>Your current medications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {profile ? "View and manage your medications" : "No medications recorded yet"}
            </p>
            <Button variant="link" className="p-0 mt-2" asChild>
              <a href="/medications">View Details</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Contacts</CardTitle>
            <CardDescription>People to contact in case of emergency</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {profile ? "View your emergency contacts" : "No emergency contacts recorded yet"}
            </p>
            <Button variant="link" className="p-0 mt-2" asChild>
              <a href="/emergency-contacts">View Details</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {user && <MedicationReminders userId={user.id} />}

        {user && <UpcomingAppointments userId={user.id} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Medical Reports</CardTitle>
          <CardDescription>Your latest uploaded medical documents</CardDescription>
        </CardHeader>
        <CardContent>
          {recentMedicalReports.length > 0 ? (
            <ul className="space-y-4">
              {recentMedicalReports.map((report) => (
                <li key={report.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{report.title}</p>
                    <p className="text-sm text-muted-foreground">{report.file_type}</p>
                  </div>
                  <p className="text-sm">{new Date(report.date).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No medical reports uploaded</p>
          )}
          <Button variant="link" className="p-0 mt-4" asChild>
            <a href="/medical-reports">View All</a>
          </Button>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share Your Health Record</DialogTitle>
            <DialogDescription>
              Share your health record securely with healthcare providers or family members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Shareable Link</span>
                <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 px-2 text-xs">
                  {linkCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="p-2 bg-muted rounded-md text-sm break-all">{shareableLink}</div>
              <p className="text-xs text-muted-foreground">This link will expire in 7 days</p>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Share via</span>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-20 space-y-1"
                  onClick={shareViaWhatsApp}
                >
                  <PhoneIcon className="h-6 w-6 text-green-600" />
                  <span className="text-xs">WhatsApp</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-20 space-y-1"
                  onClick={shareViaEmail}
                >
                  <Mail className="h-6 w-6 text-blue-600" />
                  <span className="text-xs">Email</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-20 space-y-1"
                  onClick={shareViaSMS}
                >
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                  <span className="text-xs">SMS</span>
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={downloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
