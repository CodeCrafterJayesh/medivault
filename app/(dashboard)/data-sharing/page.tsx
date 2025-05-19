"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Download,
  Share2,
  Lock,
  FileText,
  User,
  Pill,
  Phone,
  Calendar,
  BarChart2,
  Loader2,
  Copy,
  Check,
  PhoneIcon as WhatsApp,
  Mail,
  MessageSquare,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

type ProfileData = {
  id: string
  full_name: string
  phone_number: string | null
  date_of_birth: string | null
  gender: string | null
  address: string | null
}

type MedicalHistoryData = {
  chronic_illnesses: string[] | null
  previous_surgeries: any
  allergies: any
  current_medications: any
  family_history: any
}

type EmergencyContactData = {
  id: string
  full_name: string
  relationship: string
  phone_number: string
}

type MedicalReportData = {
  id: string
  title: string
  file_type: string
  date: string
}

type AppointmentData = {
  id: string
  title: string
  doctor_name: string | null
  date: string
}

type HealthMetricData = {
  metric_type: string
  value: number
  unit: string
  date: string
}

export default function DataSharingPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [shareableLink, setShareableLink] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)
  const [pdfPassword, setPdfPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Data for PDF generation
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryData | null>(null)
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContactData[]>([])
  const [medicalReports, setMedicalReports] = useState<MedicalReportData[]>([])
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [healthMetrics, setHealthMetrics] = useState<HealthMetricData[]>([])

  // Selection state for PDF content
  const [includeProfile, setIncludeProfile] = useState(true)
  const [includeMedicalHistory, setIncludeMedicalHistory] = useState(true)
  const [includeEmergencyContacts, setIncludeEmergencyContacts] = useState(true)
  const [includeMedications, setIncludeMedications] = useState(true)
  const [includeAppointments, setIncludeAppointments] = useState(true)
  const [includeMedicalReports, setIncludeMedicalReports] = useState(true)
  const [includeHealthMetrics, setIncludeHealthMetrics] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [user])

  const fetchUserData = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Fetch profile data
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(profileData)

      // Fetch medical history
      const { data: medicalHistoryData } = await supabase
        .from("medical_history")
        .select("*")
        .eq("user_id", user.id)
        .single()
      setMedicalHistory(medicalHistoryData)

      // Fetch emergency contacts
      const { data: contactsData } = await supabase
        .from("emergency_contacts")
        .select("id, full_name, relationship, phone_number")
        .eq("user_id", user.id)
      setEmergencyContacts(contactsData || [])

      // Fetch medical reports
      const { data: reportsData } = await supabase
        .from("medical_reports")
        .select("id, title, file_type, date")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
      setMedicalReports(reportsData || [])

      // Fetch appointments
      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select("id, title, doctor_name, date")
        .eq("user_id", user.id)
        .order("date", { ascending: true })
      setAppointments(appointmentsData || [])

      // Fetch health metrics
      const { data: metricsData } = await supabase
        .from("health_metrics")
        .select("metric_type, value, unit, date")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
      setHealthMetrics(metricsData || [])
    } catch (error) {
      console.error("Error fetching user data:", error)
      setMessage({ type: "error", text: "Failed to load user data" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGeneratePDF = () => {
    if (pdfPassword) {
      if (pdfPassword !== confirmPassword) {
        setMessage({ type: "error", text: "Passwords do not match" })
        return
      }
      generatePDF(pdfPassword)
    } else {
      generatePDF()
    }
  }

  const generatePDF = async (password?: string) => {
    if (!profile) return

    setIsGenerating(true)
    setMessage(null)

    try {
      // Create a new PDF document
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.setTextColor(0, 128, 128) // Teal color
      doc.text("MediVault Health Record", 105, 15, { align: "center" })

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text("Generated on: " + new Date().toLocaleDateString(), 105, 22, { align: "center" })

      let yPos = 30

      // Add profile information
      if (includeProfile && profile) {
        doc.setFontSize(16)
        doc.setTextColor(0, 128, 128)
        doc.text("Personal Information", 14, yPos)
        yPos += 8

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text(`Name: ${profile.full_name}`, 14, yPos)
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
      }

      // Add medical history
      if (includeMedicalHistory && medicalHistory) {
        doc.setFontSize(16)
        doc.setTextColor(0, 128, 128)
        doc.text("Medical History", 14, yPos)
        yPos += 8

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)

        // Chronic illnesses
        if (medicalHistory.chronic_illnesses && medicalHistory.chronic_illnesses.length > 0) {
          doc.text("Chronic Illnesses:", 14, yPos)
          yPos += 6
          medicalHistory.chronic_illnesses.forEach((illness) => {
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

        // Family history
        if (
          medicalHistory.family_history &&
          medicalHistory.family_history.items &&
          medicalHistory.family_history.items.length > 0
        ) {
          doc.text("Family History:", 14, yPos)
          yPos += 6
          medicalHistory.family_history.items.forEach((history: any) => {
            doc.text(`• ${history.condition} - Relation: ${history.relation}`, 20, yPos)
            yPos += 5
          })
          yPos += 3
        }

        yPos += 6
      }

      // Add medications
      if (includeMedications && medicalHistory?.current_medications?.items) {
        doc.setFontSize(16)
        doc.setTextColor(0, 128, 128)
        doc.text("Current Medications", 14, yPos)
        yPos += 8

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)

        if (medicalHistory.current_medications.items.length > 0) {
          medicalHistory.current_medications.items.forEach((medication: any) => {
            doc.text(`• ${medication.name} - Dosage: ${medication.dosage || "Not specified"}`, 20, yPos)
            yPos += 5
            if (medication.frequency) {
              doc.text(`  Frequency: ${medication.frequency}`, 20, yPos)
              yPos += 5
            }
          })
        } else {
          doc.text("No current medications recorded.", 14, yPos)
          yPos += 6
        }

        yPos += 6
      }

      // Add emergency contacts
      if (includeEmergencyContacts && emergencyContacts.length > 0) {
        doc.setFontSize(16)
        doc.setTextColor(0, 128, 128)
        doc.text("Emergency Contacts", 14, yPos)
        yPos += 8

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)

        emergencyContacts.forEach((contact) => {
          doc.text(`• ${contact.full_name} (${contact.relationship})`, 20, yPos)
          yPos += 5
          doc.text(`  Phone: ${contact.phone_number}`, 20, yPos)
          yPos += 5
        })

        yPos += 6
      }

      // Add appointments
      if (includeAppointments && appointments.length > 0) {
        doc.setFontSize(16)
        doc.setTextColor(0, 128, 128)

        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.text("Upcoming Appointments", 14, yPos)
        yPos += 8

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)

        // Filter for upcoming appointments
        const upcomingAppointments = appointments.filter((apt) => new Date(apt.date) >= new Date())

        if (upcomingAppointments.length > 0) {
          upcomingAppointments.slice(0, 5).forEach((appointment) => {
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
          })
        } else {
          doc.text("No upcoming appointments scheduled.", 14, yPos)
          yPos += 6
        }

        yPos += 6
      }

      // Add medical reports
      if (includeMedicalReports && medicalReports.length > 0) {
        doc.setFontSize(16)
        doc.setTextColor(0, 128, 128)

        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.text("Recent Medical Reports", 14, yPos)
        yPos += 8

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)

        medicalReports.slice(0, 5).forEach((report) => {
          const reportDate = new Date(report.date)
          doc.text(`• ${report.title} (${report.file_type})`, 20, yPos)
          yPos += 5
          doc.text(`  Date: ${reportDate.toLocaleDateString()}`, 20, yPos)
          yPos += 5
        })

        yPos += 6
      }

      // Add health metrics
      if (includeHealthMetrics && healthMetrics.length > 0) {
        doc.setFontSize(16)
        doc.setTextColor(0, 128, 128)

        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.text("Health Metrics", 14, yPos)
        yPos += 8

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)

        // Group metrics by type
        const metricsByType: Record<string, HealthMetricData[]> = {}
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

      // Set password if provided
      if (password) {
        doc.setEncryption({
          userPassword: password,
          ownerPassword: password,
          userPermissions: ["print", "copy"],
        })
      }

      // Save the PDF
      doc.save(`MediVault_Health_Record_${new Date().toISOString().split("T")[0]}.pdf`)

      setMessage({ type: "success", text: "PDF generated successfully" })
    } catch (error) {
      console.error("Error generating PDF:", error)
      setMessage({ type: "error", text: "Failed to generate PDF" })
    } finally {
      setIsGenerating(false)
      setPasswordDialogOpen(false)
    }
  }

  const handleShare = () => {
    // In a real app, this would upload the PDF to a secure location and generate a shareable link
    const dummyLink = `https://medivault.example.com/share/${Math.random().toString(36).substring(2, 15)}`
    setShareableLink(dummyLink)
    setShareDialogOpen(true)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const shareViaWhatsApp = () => {
    window.open(`https://wa.me/?text=Check out my health record: ${shareableLink}`, "_blank")
  }

  const shareViaEmail = () => {
    window.open(`mailto:?subject=My Health Record&body=Check out my health record: ${shareableLink}`, "_blank")
  }

  const shareViaSMS = () => {
    window.open(`sms:?body=Check out my health record: ${shareableLink}`, "_blank")
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Sharing</h1>
          <p className="text-muted-foreground">Generate and share your health records securely</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setPasswordDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Generate PDF
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-6">
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content Selection</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Select Content to Include</CardTitle>
              <CardDescription>Choose what information to include in your health record</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="profile" checked={includeProfile} onCheckedChange={setIncludeProfile as any} />
                  <Label htmlFor="profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Personal Information
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="medical-history"
                    checked={includeMedicalHistory}
                    onCheckedChange={setIncludeMedicalHistory as any}
                  />
                  <Label htmlFor="medical-history" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Medical History
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="medications"
                    checked={includeMedications}
                    onCheckedChange={setIncludeMedications as any}
                  />
                  <Label htmlFor="medications" className="flex items-center">
                    <Pill className="mr-2 h-4 w-4" />
                    Medications
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emergency-contacts"
                    checked={includeEmergencyContacts}
                    onCheckedChange={setIncludeEmergencyContacts as any}
                  />
                  <Label htmlFor="emergency-contacts" className="flex items-center">
                    <Phone className="mr-2 h-4 w-4" />
                    Emergency Contacts
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="appointments"
                    checked={includeAppointments}
                    onCheckedChange={setIncludeAppointments as any}
                  />
                  <Label htmlFor="appointments" className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Appointments
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="medical-reports"
                    checked={includeMedicalReports}
                    onCheckedChange={setIncludeMedicalReports as any}
                  />
                  <Label htmlFor="medical-reports" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Medical Reports
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="health-metrics"
                    checked={includeHealthMetrics}
                    onCheckedChange={setIncludeHealthMetrics as any}
                  />
                  <Label htmlFor="health-metrics" className="flex items-center">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Health Metrics
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
              <CardDescription>Preview of your health record document</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="border rounded-md p-6 space-y-6 bg-white">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-primary">MediVault Health Record</h2>
                    <p className="text-sm text-muted-foreground">Generated on: {new Date().toLocaleDateString()}</p>
                  </div>

                  {includeProfile && profile && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-primary flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        Personal Information
                      </h3>
                      <div className="pl-7 space-y-1">
                        <p>
                          <span className="font-medium">Name:</span> {profile.full_name}
                        </p>
                        {profile.date_of_birth && (
                          <p>
                            <span className="font-medium">Date of Birth:</span>{" "}
                            {new Date(profile.date_of_birth).toLocaleDateString()}
                          </p>
                        )}
                        {profile.gender && (
                          <p>
                            <span className="font-medium">Gender:</span> {profile.gender}
                          </p>
                        )}
                        {profile.phone_number && (
                          <p>
                            <span className="font-medium">Phone:</span> {profile.phone_number}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {includeMedicalHistory && medicalHistory && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-primary flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Medical History
                      </h3>
                      <div className="pl-7 space-y-3">
                        {medicalHistory.chronic_illnesses && medicalHistory.chronic_illnesses.length > 0 && (
                          <div>
                            <p className="font-medium">Chronic Illnesses:</p>
                            <ul className="list-disc pl-5">
                              {medicalHistory.chronic_illnesses.map((illness, idx) => (
                                <li key={idx}>{illness}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {medicalHistory.allergies && medicalHistory.allergies.has_allergies === "yes" && (
                          <div>
                            <p className="font-medium">Allergies:</p>
                            <ul className="list-disc pl-5">
                              {medicalHistory.allergies.items.map((allergy: any, idx: number) => (
                                <li key={idx}>
                                  {allergy.name} - Reaction: {allergy.reaction || "Not specified"}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* More preview sections would be added here */}
                  <div className="text-center text-sm text-muted-foreground border-t pt-4">
                    <p>This is a preview. The actual PDF will contain all selected information.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Protect Your PDF</DialogTitle>
            <DialogDescription>
              Add a password to protect your health record PDF. Leave blank for no password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center">
                <Lock className="mr-2 h-4 w-4" />
                Password (Optional)
              </Label>
              <Input
                id="password"
                type="password"
                value={pdfPassword}
                onChange={(e) => setPdfPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
            {pdfPassword && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGeneratePDF} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>Generate PDF</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <Label>Shareable Link</Label>
              <div className="flex items-center space-x-2">
                <Input value={shareableLink} readOnly />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">This link will expire in 7 days</p>
            </div>

            <div className="space-y-2">
              <Label>Share via</Label>
              <div className="flex justify-between">
                <Button variant="outline" className="flex-1 mr-2" onClick={shareViaWhatsApp}>
                  <WhatsApp className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
                <Button variant="outline" className="flex-1 mr-2" onClick={shareViaEmail}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
                <Button variant="outline" className="flex-1" onClick={shareViaSMS}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  SMS
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
