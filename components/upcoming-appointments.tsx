"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin } from "lucide-react"
import { format, parseISO, isToday, isBefore, addDays } from "date-fns"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

type Appointment = {
  id: string
  title: string
  doctor_name: string | null
  location: string | null
  date: string
  notes: string | null
}

export function UpcomingAppointments({ userId }: { userId: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userId) return

      try {
        const today = new Date()
        const nextWeek = addDays(today, 7)

        const { data, error } = await supabase
          .from("appointments")
          .select("id, title, doctor_name, location, date, notes")
          .eq("user_id", userId)
          .gte("date", today.toISOString())
          .lte("date", nextWeek.toISOString())
          .order("date", { ascending: true })
          .limit(3)

        if (error) throw error

        setAppointments(data || [])
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [userId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Your scheduled appointments for the next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-24">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Your scheduled appointments for the next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center h-24">
            <p className="text-sm text-muted-foreground mb-2">No upcoming appointments in the next 7 days</p>
            <Button variant="outline" size="sm" asChild>
              <a href="/appointments">Schedule Appointment</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
        <CardDescription>Your scheduled appointments for the next 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const appointmentDate = parseISO(appointment.date)
            const isUpcoming = !isBefore(appointmentDate, new Date()) || isToday(appointmentDate)

            return (
              <div
                key={appointment.id}
                className={cn(
                  "p-3 rounded-md border",
                  isToday(appointmentDate) && "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20",
                )}
              >
                <div className="font-medium mb-1">{appointment.title}</div>
                <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-3.5 w-3.5" />
                    <span>
                      {format(
                        appointmentDate,
                        isToday(appointmentDate) ? "'Today at' h:mm a" : "EEE, MMM d 'at' h:mm a",
                      )}
                    </span>
                  </div>
                  {appointment.doctor_name && (
                    <div className="flex items-center">
                      <Clock className="mr-2 h-3.5 w-3.5" />
                      <span>{appointment.doctor_name}</span>
                    </div>
                  )}
                  {appointment.location && (
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-3.5 w-3.5" />
                      <span>{appointment.location}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          <Button variant="link" className="p-0" asChild>
            <a href="/appointments">View All Appointments</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
