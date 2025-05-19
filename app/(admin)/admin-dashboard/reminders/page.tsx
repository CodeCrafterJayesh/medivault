"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, Mail, Send, Plus, RefreshCw, AlertTriangle } from "lucide-react"

// Reminder template type
type ReminderTemplate = {
  id: string
  name: string
  subject: string
  message: string
  created_at: string
}

// Reminder type
type Reminder = {
  id: string
  appointment_id: string
  patient_name: string
  appointment_date: string
  doctor_name: string | null
  clinic_address: string | null
  template_id: string
  status: "pending" | "sent" | "failed"
  send_at: string
  sent_at: string | null
  created_at: string
}

export default function RemindersPage() {
  const { toast } = useToast()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [templates, setTemplates] = useState<ReminderTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newTemplate, setNewTemplate] = useState<Partial<ReminderTemplate>>({
    name: "",
    subject: "",
    message: "",
  })
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isTableMissing, setIsTableMissing] = useState(false)

  // Fetch reminders and templates
  useEffect(() => {
    fetchReminders()
    fetchTemplates()
  }, [])

  // Check if table exists
  const checkTableExists = async (tableName: string) => {
    try {
      const { data, error } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_name", tableName)
        .eq("table_schema", "public")

      return data && data.length > 0
    } catch (error) {
      console.error(`Error checking if ${tableName} table exists:`, error)
      return false
    }
  }

  // Fetch reminders
  const fetchReminders = async () => {
    setLoading(true)
    setError(null)

    try {
      // Check if table exists
      const tableExists = await checkTableExists("appointment_reminders")

      if (!tableExists) {
        setIsTableMissing(true)
        setReminders([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("appointment_reminders")
        .select("*")
        .order("send_at", { ascending: false })

      if (error) {
        throw error
      }

      setReminders(data || [])
    } catch (error: any) {
      console.error("Error fetching reminders:", error)
      setError(error.message || "Failed to fetch reminders")
      toast({
        title: "Error",
        description: "Failed to fetch reminders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      // Check if table exists
      const tableExists = await checkTableExists("reminder_templates")

      if (!tableExists) {
        setTemplates([])
        return
      }

      const { data, error } = await supabase
        .from("reminder_templates")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setTemplates(data || [])
    } catch (error: any) {
      console.error("Error fetching templates:", error)
      toast({
        title: "Error",
        description: "Failed to fetch templates. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Create template
  const createTemplate = async () => {
    try {
      if (!newTemplate.name || !newTemplate.subject || !newTemplate.message) {
        toast({
          title: "Validation Error",
          description: "Please fill in all fields",
          variant: "destructive",
        })
        return
      }

      const { data, error } = await supabase
        .from("reminder_templates")
        .insert([
          {
            name: newTemplate.name,
            subject: newTemplate.subject,
            message: newTemplate.message,
          },
        ])
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Template created successfully",
        variant: "success",
      })

      // Reset form and close dialog
      setNewTemplate({
        name: "",
        subject: "",
        message: "",
      })
      setIsTemplateDialogOpen(false)

      // Refresh templates
      fetchTemplates()
    } catch (error: any) {
      console.error("Error creating template:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      })
    }
  }

  // Send reminder
  const sendReminder = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("appointment_reminders")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", id)
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Reminder sent successfully",
        variant: "success",
      })

      // Refresh reminders
      fetchReminders()
    } catch (error: any) {
      console.error("Error sending reminder:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to send reminder",
        variant: "destructive",
      })
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "sent":
        return <Badge variant="success">Sent</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // SQL for creating tables
  const createTablesSQL = `
-- Create reminder_templates table
CREATE TABLE IF NOT EXISTS reminder_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointment_reminders table
CREATE TABLE IF NOT EXISTS appointment_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  doctor_name VARCHAR(255),
  clinic_address TEXT,
  template_id UUID REFERENCES reminder_templates(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  send_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample template
INSERT INTO reminder_templates (name, subject, message)
VALUES (
  'Appointment Reminder',
  'Your upcoming appointment',
  'Dear {patient_name},\n\nThis is a reminder that you have an appointment scheduled on {appointment_date} at {appointment_time} with Dr. {doctor_name}.\n\nLocation: {clinic_address}\n\nPlease arrive 15 minutes early to complete any necessary paperwork.\n\nIf you need to reschedule, please contact us at least 24 hours in advance.\n\nThank you,\nMediVault Team'
)
ON CONFLICT DO NOTHING;

-- Insert sample reminders
INSERT INTO appointment_reminders (
  appointment_id, 
  patient_name, 
  appointment_date, 
  doctor_name, 
  clinic_address, 
  template_id, 
  status, 
  send_at
)
SELECT 
  uuid_generate_v4(), 
  'John Doe', 
  NOW() + INTERVAL '2 days', 
  'Dr. Smith', 
  '123 Medical Center, Suite 100, New York, NY 10001', 
  id, 
  'pending', 
  NOW() + INTERVAL '1 day'
FROM reminder_templates
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO appointment_reminders (
  appointment_id, 
  patient_name, 
  appointment_date, 
  doctor_name, 
  clinic_address, 
  template_id, 
  status, 
  send_at
)
SELECT 
  uuid_generate_v4(), 
  'Jane Smith', 
  NOW() + INTERVAL '3 days', 
  'Dr. Johnson', 
  '456 Health Clinic, Room 200, Boston, MA 02108', 
  id, 
  'pending', 
  NOW() + INTERVAL '1 day'
FROM reminder_templates
LIMIT 1
ON CONFLICT DO NOTHING;
  `

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Appointment Reminders</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={fetchReminders}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {!isTableMissing && (
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Reminder Template</DialogTitle>
                  <DialogDescription>Create a new template for appointment reminders.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      value={newTemplate.subject}
                      onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      value={newTemplate.message}
                      onChange={(e) => setNewTemplate({ ...newTemplate, message: e.target.value })}
                      placeholder="Use {patient_name}, {appointment_date}, {appointment_time}, {doctor_name}, and {clinic_address} as placeholders."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createTemplate}>Create Template</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {isTableMissing && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Fix Missing Tables
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create Required Tables</DialogTitle>
                  <DialogDescription>
                    The reminder tables are missing in your database. Run the following SQL in your Supabase SQL Editor
                    to create them.
                  </DialogDescription>
                </DialogHeader>
                <div className="my-4 max-h-96 overflow-auto rounded-md bg-muted p-4">
                  <pre className="text-sm">{createTablesSQL}</pre>
                </div>
                <DialogFooter>
                  <Button onClick={fetchReminders}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Data
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {isTableMissing ? (
        <Card>
          <CardHeader>
            <CardTitle>Tables Not Found</CardTitle>
            <CardDescription>
              The reminder tables are missing in your database. Click the "Fix Missing Tables" button to see the SQL
              needed to create them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-6">
              <AlertTriangle className="h-16 w-16 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading Reminders</CardTitle>
            <CardDescription>Please wait while we fetch the reminders...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-6">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchReminders}>Try Again</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Pending Reminders</CardTitle>
              <CardDescription>Manage appointment reminders for patients.</CardDescription>
            </CardHeader>
            <CardContent>
              {reminders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <Mail className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-center text-muted-foreground">No reminders found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Appointment</TableHead>
                      <TableHead>Send At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reminders.map((reminder) => (
                      <TableRow key={reminder.id}>
                        <TableCell className="font-medium">{reminder.patient_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              {formatDate(reminder.appointment_date)}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="mr-2 h-4 w-4" />
                              {formatTime(reminder.appointment_date)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(reminder.send_at)} {formatTime(reminder.send_at)}
                        </TableCell>
                        <TableCell>{getStatusBadge(reminder.status)}</TableCell>
                        <TableCell className="text-right">
                          {reminder.status === "pending" && (
                            <Button variant="outline" size="sm" onClick={() => sendReminder(reminder.id)}>
                              <Send className="mr-2 h-4 w-4" />
                              Send Now
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reminder Templates</CardTitle>
              <CardDescription>Manage email templates for appointment reminders.</CardDescription>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <Mail className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-center text-muted-foreground">No templates found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>{template.subject}</TableCell>
                        <TableCell>{formatDate(template.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
