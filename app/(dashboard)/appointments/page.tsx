"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  CalendarIcon,
  Clock,
  MapPin,
  User,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  format,
  isBefore,
  isToday,
  addHours,
  parseISO,
  isSameDay,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  isSameMonth,
} from "date-fns"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

type Appointment = {
  id: string
  title: string
  doctor_name: string | null
  location: string | null
  date: string
  notes: string | null
  reminder_enabled: boolean
  created_at: string
  updated_at: string
}

export default function AppointmentsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isAppointmentDetailsOpen, setIsAppointmentDetailsOpen] = useState(false)

  // Form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null)
  const [appointmentTitle, setAppointmentTitle] = useState("")
  const [appointmentDoctor, setAppointmentDoctor] = useState("")
  const [appointmentLocation, setAppointmentLocation] = useState("")
  const [appointmentDate, setAppointmentDate] = useState<Date>(addHours(new Date(), 1))
  const [appointmentTime, setAppointmentTime] = useState("09:00")
  const [appointmentNotes, setAppointmentNotes] = useState("")
  const [appointmentReminder, setAppointmentReminder] = useState(true)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">("month")

  useEffect(() => {
    fetchAppointments()
  }, [user])

  useEffect(() => {
    if (appointments.length > 0) {
      filterAppointments()
    }
  }, [appointments, activeTab, selectedDate])

  const fetchAppointments = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true })

      if (error) throw error

      setAppointments(data || [])
    } catch (error: any) {
      console.error("Error fetching appointments:", error)
      setMessage({ type: "error", text: error.message || "Failed to load appointments" })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = [...appointments]

    // Filter by tab (upcoming or past)
    if (activeTab === "upcoming") {
      filtered = filtered.filter((apt) => isToday(parseISO(apt.date)) || !isBefore(parseISO(apt.date), new Date()))
    } else if (activeTab === "past") {
      filtered = filtered.filter((apt) => !isToday(parseISO(apt.date)) && isBefore(parseISO(apt.date), new Date()))
    } else if (activeTab === "calendar" && selectedDate) {
      // For calendar tab, we'll filter in the calendar view based on the selected date
    }

    setFilteredAppointments(filtered)
  }

  const handleAddAppointment = () => {
    resetForm()
    setCurrentAppointment(null)
    setIsAddDialogOpen(true)
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setCurrentAppointment(appointment)
    setAppointmentTitle(appointment.title)
    setAppointmentDoctor(appointment.doctor_name || "")
    setAppointmentLocation(appointment.location || "")

    const date = parseISO(appointment.date)
    setAppointmentDate(date)
    setAppointmentTime(format(date, "HH:mm"))

    setAppointmentNotes(appointment.notes || "")
    setAppointmentReminder(appointment.reminder_enabled)
    setIsAddDialogOpen(true)
  }

  const handleDeleteAppointment = (appointment: Appointment) => {
    setCurrentAppointment(appointment)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteAppointment = async () => {
    if (!currentAppointment) return

    setIsSaving(true)
    try {
      const { error } = await supabase.from("appointments").delete().eq("id", currentAppointment.id)

      if (error) throw error

      setAppointments(appointments.filter((apt) => apt.id !== currentAppointment.id))
      setMessage({ type: "success", text: "Appointment deleted successfully" })
    } catch (error: any) {
      console.error("Error deleting appointment:", error)
      setMessage({ type: "error", text: error.message || "Failed to delete appointment" })
    } finally {
      setIsSaving(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const saveAppointment = async () => {
    if (!user) return

    if (!appointmentTitle) {
      setMessage({ type: "error", text: "Appointment title is required" })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      // Combine date and time
      const dateTime = new Date(appointmentDate)
      const [hours, minutes] = appointmentTime.split(":").map(Number)
      dateTime.setHours(hours, minutes)

      const appointmentData = {
        title: appointmentTitle,
        doctor_name: appointmentDoctor || null,
        location: appointmentLocation || null,
        date: dateTime.toISOString(),
        notes: appointmentNotes || null,
        reminder_enabled: appointmentReminder,
        updated_at: new Date().toISOString(),
      }

      if (currentAppointment) {
        // Update existing appointment
        const { error } = await supabase.from("appointments").update(appointmentData).eq("id", currentAppointment.id)

        if (error) throw error

        setAppointments(
          appointments.map((apt) => (apt.id === currentAppointment.id ? { ...apt, ...appointmentData } : apt)),
        )
        setMessage({ type: "success", text: "Appointment updated successfully" })
      } else {
        // Create new appointment
        const { data, error } = await supabase
          .from("appointments")
          .insert({
            ...appointmentData,
            user_id: user.id,
          })
          .select()

        if (error) throw error

        if (data) {
          setAppointments([...appointments, ...data])
        }
        setMessage({ type: "success", text: "Appointment added successfully" })
      }

      setIsAddDialogOpen(false)
    } catch (error: any) {
      console.error("Error saving appointment:", error)
      setMessage({ type: "error", text: error.message || "Failed to save appointment" })
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setAppointmentTitle("")
    setAppointmentDoctor("")
    setAppointmentLocation("")
    setAppointmentDate(addHours(new Date(), 1))
    setAppointmentTime("09:00")
    setAppointmentNotes("")
    setAppointmentReminder(true)
  }

  const getAppointmentStatusBadge = (appointment: Appointment) => {
    const appointmentDate = parseISO(appointment.date)

    if (isToday(appointmentDate)) {
      return (
        <div className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <Clock className="mr-1 h-3 w-3" />
          Today
        </div>
      )
    } else if (isBefore(appointmentDate, new Date())) {
      return (
        <div className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Past
        </div>
      )
    } else {
      return (
        <div className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
          <CalendarIcon className="mr-1 h-3 w-3" />
          Upcoming
        </div>
      )
    }
  }

  const handleViewAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsAppointmentDetailsOpen(true)
  }

  // Calendar navigation
  const nextMonth = () => {
    const next = new Date(currentMonth)
    next.setMonth(next.getMonth() + 1)
    setCurrentMonth(next)
  }

  const prevMonth = () => {
    const prev = new Date(currentMonth)
    prev.setMonth(prev.getMonth() - 1)
    setCurrentMonth(prev)
  }

  // Generate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)

    const days = []
    let day = startDate

    // Create array of dates for the calendar
    while (day <= monthEnd) {
      for (let i = 0; i < 7; i++) {
        days.push(day)
        day = addDays(day, 1)
      }
    }

    return days
  }, [currentMonth])

  // Get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((apt) => {
      const aptDate = parseISO(apt.date)
      return isSameDay(aptDate, day)
    })
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage your medical appointments and get reminders</p>
        </div>
        <Button onClick={handleAddAppointment}>
          <Plus className="mr-2 h-4 w-4" />
          Add Appointment
        </Button>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-6">
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upcoming" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No upcoming appointments</h3>
                <p className="text-muted-foreground mb-4">You don't have any upcoming appointments scheduled.</p>
                <Button onClick={handleAddAppointment}>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule an Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onEdit={() => handleEditAppointment(appointment)}
                onDelete={() => handleDeleteAppointment(appointment)}
                onView={() => handleViewAppointmentDetails(appointment)}
                statusBadge={getAppointmentStatusBadge(appointment)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No past appointments</h3>
                <p className="text-muted-foreground">You don't have any past appointments in your records.</p>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onEdit={() => handleEditAppointment(appointment)}
                onDelete={() => handleDeleteAppointment(appointment)}
                onView={() => handleViewAppointmentDetails(appointment)}
                statusBadge={getAppointmentStatusBadge(appointment)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <Card className="mb-6">
            <CardContent className="p-0">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="font-medium text-lg">{format(currentMonth, "MMMM yyyy")}</h3>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant={calendarView === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCalendarView("month")}
                  >
                    Month
                  </Button>
                  <Button
                    variant={calendarView === "week" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCalendarView("week")}
                  >
                    Week
                  </Button>
                  <Button
                    variant={calendarView === "day" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCalendarView("day")}
                  >
                    Day
                  </Button>
                </div>
              </div>

              {/* Calendar Grid - Month View */}
              {calendarView === "month" && (
                <div className="p-4">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                      <div key={i} className="text-center text-sm font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, i) => {
                      const dayAppointments = getAppointmentsForDay(day)
                      const isSelected = selectedDate && isSameDay(day, selectedDate)
                      const isCurrentMonth = isSameMonth(day, currentMonth)

                      return (
                        <div
                          key={i}
                          className={cn(
                            "min-h-[100px] p-2 border rounded-md",
                            isSelected ? "bg-primary/10 border-primary" : "",
                            !isCurrentMonth ? "opacity-40" : "",
                            isToday(day) ? "bg-blue-50 dark:bg-blue-900/20" : "",
                          )}
                          onClick={() => {
                            setSelectedDate(day)
                            // If there are appointments on this day, show the first one
                            if (dayAppointments.length > 0) {
                              handleViewAppointmentDetails(dayAppointments[0])
                            }
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <span
                              className={cn(
                                "inline-block w-6 h-6 text-center rounded-full text-sm",
                                isToday(day) ? "bg-primary text-primary-foreground" : "",
                              )}
                            >
                              {format(day, "d")}
                            </span>
                            {dayAppointments.length > 0 && (
                              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full">
                                {dayAppointments.length}
                              </span>
                            )}
                          </div>

                          {/* Show max 2 appointments, with a "+X more" if there are more */}
                          <div className="mt-1 space-y-1">
                            {dayAppointments.slice(0, 2).map((apt) => (
                              <div
                                key={apt.id}
                                className="text-xs p-1 rounded bg-primary/10 truncate cursor-pointer hover:bg-primary/20"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewAppointmentDetails(apt)
                                }}
                              >
                                {format(parseISO(apt.date), "h:mm a")} - {apt.title}
                              </div>
                            ))}
                            {dayAppointments.length > 2 && (
                              <div className="text-xs text-muted-foreground text-center">
                                +{dayAppointments.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Week View */}
              {calendarView === "week" && (
                <div className="p-4">
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const day = addDays(startOfWeek(currentMonth), i)
                      const dayAppointments = getAppointmentsForDay(day)

                      return (
                        <div key={i} className="space-y-2">
                          <div
                            className={cn(
                              "text-center p-2 rounded-md",
                              isToday(day) ? "bg-primary text-primary-foreground" : "bg-muted",
                            )}
                          >
                            <div className="font-medium">{format(day, "EEE")}</div>
                            <div className="text-sm">{format(day, "d MMM")}</div>
                          </div>

                          <div className="space-y-2 h-[400px] overflow-y-auto p-1">
                            {dayAppointments.length === 0 ? (
                              <div className="text-center text-sm text-muted-foreground h-full flex items-center justify-center">
                                No appointments
                              </div>
                            ) : (
                              dayAppointments.map((apt) => (
                                <div
                                  key={apt.id}
                                  className="p-2 text-sm rounded-md border bg-card hover:bg-accent cursor-pointer"
                                  onClick={() => handleViewAppointmentDetails(apt)}
                                >
                                  <div className="font-medium truncate">{apt.title}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {format(parseISO(apt.date), "h:mm a")}
                                  </div>
                                  {apt.doctor_name && (
                                    <div className="text-xs flex items-center mt-1">
                                      <User className="h-3 w-3 mr-1" />
                                      {apt.doctor_name}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Day View */}
              {calendarView === "day" && selectedDate && (
                <div className="p-4">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h3>
                  </div>

                  <div className="space-y-4">
                    {(() => {
                      const dayAppointments = getAppointmentsForDay(selectedDate)

                      if (dayAppointments.length === 0) {
                        return (
                          <div className="text-center p-12">
                            <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No appointments scheduled</h3>
                            <p className="text-muted-foreground mb-4">You don't have any appointments for this day.</p>
                            <Button onClick={handleAddAppointment}>
                              <Plus className="mr-2 h-4 w-4" />
                              Add Appointment
                            </Button>
                          </div>
                        )
                      }

                      return dayAppointments.map((apt) => (
                        <Card key={apt.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row">
                              <div className="w-24 md:w-32 bg-primary/10 flex flex-col items-center justify-center p-4 text-center">
                                <div className="text-2xl font-bold">{format(parseISO(apt.date), "h:mm")}</div>
                                <div className="text-sm">{format(parseISO(apt.date), "a")}</div>
                              </div>
                              <div className="flex-1 p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-lg">{apt.title}</h3>
                                    {getAppointmentStatusBadge(apt)}
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditAppointment(apt)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAppointment(apt)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="mt-4 space-y-2 text-sm">
                                  {apt.doctor_name && (
                                    <div className="flex items-center text-muted-foreground">
                                      <User className="mr-2 h-4 w-4" />
                                      <span>{apt.doctor_name}</span>
                                    </div>
                                  )}
                                  {apt.location && (
                                    <div className="flex items-center text-muted-foreground">
                                      <MapPin className="mr-2 h-4 w-4" />
                                      <span>{apt.location}</span>
                                    </div>
                                  )}
                                </div>

                                {apt.notes && (
                                  <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm text-muted-foreground">{apt.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Appointment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentAppointment ? "Edit Appointment" : "Add New Appointment"}</DialogTitle>
            <DialogDescription>
              {currentAppointment
                ? "Update the details of your appointment"
                : "Fill in the details to schedule a new appointment"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Appointment Title</Label>
              <Input
                id="title"
                value={appointmentTitle}
                onChange={(e) => setAppointmentTitle(e.target.value)}
                placeholder="Annual Check-up"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    value={format(appointmentDate, "yyyy-MM-dd")}
                    onChange={(e) => {
                      if (e.target.value) {
                        setAppointmentDate(new Date(e.target.value))
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor Name</Label>
              <Input
                id="doctor"
                value={appointmentDoctor}
                onChange={(e) => setAppointmentDoctor(e.target.value)}
                placeholder="Dr. Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={appointmentLocation}
                onChange={(e) => setAppointmentLocation(e.target.value)}
                placeholder="City Hospital, Room 302"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value)}
                placeholder="Any special instructions or things to remember"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="reminder" checked={appointmentReminder} onCheckedChange={setAppointmentReminder} />
              <Label htmlFor="reminder">Enable reminder notification</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveAppointment} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save Appointment</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appointment Details Dialog */}
      <Dialog open={isAppointmentDetailsOpen} onOpenChange={setIsAppointmentDetailsOpen}>
        {selectedAppointment && (
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedAppointment.title}</DialogTitle>
              <DialogDescription>{format(parseISO(selectedAppointment.date), "EEEE, MMMM d, yyyy")}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{format(parseISO(selectedAppointment.date), "h:mm a")}</p>
                  </div>
                  {selectedAppointment.doctor_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">Doctor</p>
                      <p className="font-medium">{selectedAppointment.doctor_name}</p>
                    </div>
                  )}
                  {selectedAppointment.location && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{selectedAppointment.location}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {selectedAppointment.reminder_enabled
                    ? "Reminder is enabled for this appointment"
                    : "No reminder set for this appointment"}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAppointmentDetailsOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsAppointmentDetailsOpen(false)
                  handleEditAppointment(selectedAppointment)
                }}
              >
                Edit Appointment
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the appointment "{currentAppointment?.title}" scheduled for{" "}
              {currentAppointment ? format(parseISO(currentAppointment.date), "MMMM d, yyyy 'at' h:mm a") : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAppointment}
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

// Appointment Card Component
function AppointmentCard({
  appointment,
  onEdit,
  onDelete,
  onView,
  statusBadge,
}: {
  appointment: Appointment
  onEdit: () => void
  onDelete: () => void
  onView: () => void
  statusBadge: React.ReactNode
}) {
  const appointmentDate = parseISO(appointment.date)

  return (
    <Card
      className={cn(
        "overflow-hidden transition-colors hover:border-primary/50 cursor-pointer",
        isToday(appointmentDate) && "border-blue-300 dark:border-blue-800",
        isBefore(appointmentDate, new Date()) && !isToday(appointmentDate) && "bg-muted/30",
      )}
      onClick={onView}
    >
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-24 bg-primary/10 flex flex-col items-center justify-center p-4 text-center">
            <div className="text-2xl font-bold">{format(appointmentDate, "d")}</div>
            <div className="text-sm font-medium">{format(appointmentDate, "MMM")}</div>
            <div className="text-xs text-muted-foreground mt-1">{format(appointmentDate, "h:mm a")}</div>
          </div>
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg mb-1">{appointment.title}</h3>
                <div className="mb-4">{statusBadge}</div>
              </div>
              <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {appointment.doctor_name && (
                <div className="flex items-center text-muted-foreground">
                  <User className="mr-2 h-4 w-4" />
                  <span>{appointment.doctor_name}</span>
                </div>
              )}
              {appointment.location && (
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{appointment.location}</span>
                </div>
              )}
            </div>

            {appointment.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground line-clamp-2">{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
