"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  UserIcon,
  MapPin,
  Search,
  RefreshCw,
  MessageSquare,
  UserCheck,
  Filter,
  ChevronDown,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO, isToday, isBefore } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"

// Appointment type
type Appointment = {
  id: string
  title: string
  doctor_name: string | null
  location: string | null
  date: string
  notes: string | null
  reminder_enabled: boolean
  user_id: string
  assigned_admin?: string | null
  created_at: string
  updated_at: string
}

// Profile type
type Profile = {
  id: string
  full_name: string
  email?: string
}

export default function AdminAppointmentsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [admins, setAdmins] = useState<{ id: string; email: string }[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "today" | "past">("all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false)
  const [assignedAdmin, setAssignedAdmin] = useState<string>("")
  const [chatMessage, setChatMessage] = useState("")
  const [adminRole, setAdminRole] = useState<"admin" | "superadmin">("admin")
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  // Fetch appointments and related data
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get current admin role from localStorage
      const adminSession = localStorage.getItem("adminSession")
      if (adminSession) {
        const parsedSession = JSON.parse(adminSession)
        setAdminRole(parsedSession.role || "admin")
      }

      // Fetch all appointments if superadmin, only assigned ones if regular admin
      let query = supabase.from("appointments").select("*").order("date", { ascending: true })

      // If regular admin, only fetch assigned appointments
      if (adminRole === "admin") {
        const adminSession = localStorage.getItem("adminSession")
        if (adminSession) {
          const parsedSession = JSON.parse(adminSession)
          query = query.eq("assigned_admin", parsedSession.id)
        }
      }

      const { data: appointmentsData, error: appointmentsError } = await query

      if (appointmentsError) throw appointmentsError

      // Fetch users for displaying names
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")

      if (profilesError) throw profilesError

      // Fetch admins for assignment
      const { data: adminsData, error: adminsError } = await supabase.from("admins").select("id, email")

      if (adminsError && adminsError.code !== "PGRST116") throw adminsError

      setAppointments(appointmentsData || [])
      setFilteredAppointments(appointmentsData || [])
      setProfiles(profilesData || [])
      setAdmins(adminsData || [])

      if (isRefreshing) {
        toast({
          variant: "success",
          title: "Data Refreshed",
          description: "Appointments data has been updated successfully.",
        })
      }
    } catch (error: any) {
      console.error("Error fetching appointments data:", error)
      setError(error.message || "Failed to load appointments data")

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load appointments data. Please try again.",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Set up real-time subscription
    const subscription = supabase
      .channel("appointments-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => {
        fetchData() // Refresh data when changes occur
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Filter appointments based on search query and status filter
  useEffect(() => {
    let filtered = [...appointments]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (apt) =>
          apt.title.toLowerCase().includes(query) ||
          (apt.doctor_name && apt.doctor_name.toLowerCase().includes(query)) ||
          (apt.location && apt.location.toLowerCase().includes(query)) ||
          getUserName(apt.user_id).toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "upcoming") {
        filtered = filtered.filter((apt) => !isToday(parseISO(apt.date)) && !isBefore(parseISO(apt.date), new Date()))
      } else if (statusFilter === "today") {
        filtered = filtered.filter((apt) => isToday(parseISO(apt.date)))
      } else if (statusFilter === "past") {
        filtered = filtered.filter((apt) => !isToday(parseISO(apt.date)) && isBefore(parseISO(apt.date), new Date()))
      }
    }

    setFilteredAppointments(filtered)
  }, [searchQuery, statusFilter, appointments])

  const getUserName = (userId: string) => {
    const profile = profiles.find((p) => p.id === userId)
    return profile ? profile.full_name : "Unknown User"
  }

  const getUserEmail = (userId: string) => {
    const profile = profiles.find((p) => p.id === userId)
    return profile?.email || "No email"
  }

  const getAdminEmail = (adminId: string) => {
    const admin = admins.find((a) => a.id === adminId)
    return admin ? admin.email : "Unassigned"
  }

  const getAppointmentStatusBadge = (appointment: Appointment) => {
    const appointmentDate = parseISO(appointment.date)

    if (isToday(appointmentDate)) {
      return (
        <Badge className="bg-blue-500">
          <Clock className="mr-1 h-3 w-3" />
          Today
        </Badge>
      )
    } else if (isBefore(appointmentDate, new Date())) {
      return (
        <Badge variant="outline">
          <Calendar className="mr-1 h-3 w-3" />
          Past
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-green-500">
          <Calendar className="mr-1 h-3 w-3" />
          Upcoming
        </Badge>
      )
    }
  }

  const handleAssignAdmin = async () => {
    if (!selectedAppointment) return

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          assigned_admin: assignedAdmin || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedAppointment.id)

      if (error) throw error

      // Update local state
      setAppointments(
        appointments.map((apt) =>
          apt.id === selectedAppointment.id ? { ...apt, assigned_admin: assignedAdmin || null } : apt,
        ),
      )

      setIsAssignDialogOpen(false)

      toast({
        variant: "success",
        title: "Admin Assigned",
        description: assignedAdmin
          ? `Appointment has been assigned to ${getAdminEmail(assignedAdmin)}.`
          : "Admin assignment has been removed.",
      })

      // Log the assignment
      const adminSession = localStorage.getItem("adminSession")
      if (adminSession) {
        const parsedSession = JSON.parse(adminSession)
        await supabase.from("admin_logs").insert({
          admin_id: parsedSession.id || "system",
          action: "appointment_assigned",
          details: `Appointment "${selectedAppointment.title}" assigned to ${getAdminEmail(assignedAdmin)}`,
          ip_address: "system",
          created_at: new Date().toISOString(),
        })
      }
    } catch (error: any) {
      console.error("Error assigning admin:", error)

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign admin. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = () => {
    if (!selectedAppointment || !chatMessage.trim()) return

    // In a real app, this would send a message to the user or admin
    // For demo purposes, we'll just show a toast
    toast({
      variant: "success",
      title: "Message Sent",
      description: `Your message has been sent to ${getUserName(selectedAppointment.user_id)}.`,
    })

    setChatMessage("")
    setIsChatDialogOpen(false)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchData()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments Management</h1>
          <p className="text-muted-foreground">
            {adminRole === "superadmin"
              ? "Manage and assign all appointments in the system"
              : "View and manage your assigned appointments"}
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="h-10">
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
          <CardDescription>
            {adminRole === "superadmin"
              ? "View, assign and manage all appointments"
              : "View and manage your assigned appointments"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                className="pl-10 h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Appointments</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading && !isRefreshing ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No appointments found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search query"
                  : statusFilter !== "all"
                    ? "Try changing the status filter"
                    : adminRole === "admin"
                      ? "You don't have any assigned appointments yet"
                      : "There are no appointments in the system"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Appointment</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    {adminRole === "superadmin" && <TableHead>Assigned To</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{appointment.title}</p>
                          {appointment.doctor_name && (
                            <p className="text-xs text-muted-foreground flex items-center">
                              <UserIcon className="h-3 w-3 mr-1" />
                              {appointment.doctor_name}
                            </p>
                          )}
                          {appointment.location && (
                            <p className="text-xs text-muted-foreground flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {appointment.location}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{getUserName(appointment.user_id)}</p>
                          <p className="text-xs text-muted-foreground">{getUserEmail(appointment.user_id)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{format(parseISO(appointment.date), "MMM d, yyyy")}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(appointment.date), "h:mm a")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getAppointmentStatusBadge(appointment)}</TableCell>
                      {adminRole === "superadmin" && (
                        <TableCell>
                          {appointment.assigned_admin ? (
                            <div className="flex items-center">
                              <UserCheck className="h-4 w-4 mr-1 text-green-500" />
                              <span className="text-sm">{getAdminEmail(appointment.assigned_admin)}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Appointment Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setIsDetailsDialogOpen(true)
                              }}
                            >
                              View Details
                            </DropdownMenuItem>
                            {adminRole === "superadmin" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedAppointment(appointment)
                                  setAssignedAdmin(appointment.assigned_admin || "")
                                  setIsAssignDialogOpen(true)
                                }}
                              >
                                Assign Admin
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setChatMessage("")
                                setIsChatDialogOpen(true)
                              }}
                            >
                              Contact Patient
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>Detailed information about the appointment</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{selectedAppointment.title}</h3>
                  <div className="mt-1">{getAppointmentStatusBadge(selectedAppointment)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{format(parseISO(selectedAppointment.date), "MMMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{format(parseISO(selectedAppointment.date), "h:mm a")}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">{getUserName(selectedAppointment.user_id)}</p>
                <p className="text-sm">{getUserEmail(selectedAppointment.user_id)}</p>
              </div>

              {selectedAppointment.doctor_name && (
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <p className="font-medium">{selectedAppointment.doctor_name}</p>
                </div>
              )}

              {selectedAppointment.location && (
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedAppointment.location}</p>
                </div>
              )}

              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium">{selectedAppointment.notes}</p>
                </div>
              )}

              {adminRole === "superadmin" && (
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Admin</p>
                  <p className="font-medium">
                    {selectedAppointment.assigned_admin
                      ? getAdminEmail(selectedAppointment.assigned_admin)
                      : "Unassigned"}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p>{format(parseISO(selectedAppointment.created_at), "MMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p>{format(parseISO(selectedAppointment.updated_at), "MMM d, yyyy")}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
            {adminRole === "superadmin" && selectedAppointment && (
              <Button
                onClick={() => {
                  setIsDetailsDialogOpen(false)
                  setAssignedAdmin(selectedAppointment.assigned_admin || "")
                  setIsAssignDialogOpen(true)
                }}
              >
                Assign Admin
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Admin Dialog */}
      {adminRole === "superadmin" && (
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Admin</DialogTitle>
              <DialogDescription>Assign an admin to handle this appointment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="assigned-admin">Select Admin</Label>
                <Select value={assignedAdmin} onValueChange={setAssignedAdmin}>
                  <SelectTrigger id="assigned-admin">
                    <SelectValue placeholder="Select an admin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {admins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignAdmin} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Assignment"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Chat Dialog */}
      <Dialog open={isChatDialogOpen} onOpenChange={setIsChatDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Patient</DialogTitle>
            <DialogDescription>
              {selectedAppointment && `Send a message to ${getUserName(selectedAppointment.user_id)}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Tabs defaultValue="message">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="message">Message</TabsTrigger>
                  <TabsTrigger value="template">Templates</TabsTrigger>
                </TabsList>
                <TabsContent value="message" className="space-y-4">
                  <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    rows={5}
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                  />
                </TabsContent>
                <TabsContent value="template" className="space-y-4">
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() =>
                        setChatMessage(
                          "This is a reminder about your upcoming appointment. Please arrive 15 minutes early to complete any necessary paperwork.",
                        )
                      }
                    >
                      Appointment Reminder
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() =>
                        setChatMessage(
                          "We need to reschedule your appointment. Please contact us at your earliest convenience to arrange a new time.",
                        )
                      }
                    >
                      Reschedule Request
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() =>
                        setChatMessage(
                          "Please remember to bring your insurance card and a list of current medications to your appointment.",
                        )
                      }
                    >
                      Appointment Preparation
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChatDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={!chatMessage.trim()}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
