"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

type Medication = {
  name: string
  dosage: string
  frequency: string
}

export function MedicationReminders({ userId }: { userId: string }) {
  const [medications, setMedications] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMedications = async () => {
      if (!userId) return

      try {
        const { data, error } = await supabase
          .from("medical_history")
          .select("current_medications")
          .eq("user_id", userId)
          .single()

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching medications:", error)
          return
        }

        if (data?.current_medications?.items) {
          setMedications(data.current_medications.items)
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMedications()
  }, [userId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medication Reminders</CardTitle>
          <CardDescription>Your daily medication schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-24">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (medications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medication Reminders</CardTitle>
          <CardDescription>Your daily medication schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center h-24">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No medications added yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group medications by frequency
  const groupedMedications: Record<string, Medication[]> = {}
  medications.forEach((med) => {
    const frequency = med.frequency || "Unspecified"
    if (!groupedMedications[frequency]) {
      groupedMedications[frequency] = []
    }
    groupedMedications[frequency].push(med)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medication Reminders</CardTitle>
        <CardDescription>Your daily medication schedule</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(groupedMedications).map(([frequency, meds]) => (
            <div key={frequency} className="border-b pb-3 last:border-b-0 last:pb-0">
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <h4 className="font-medium">{frequency}</h4>
              </div>
              <div className="space-y-2">
                {meds.map((med, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span>{med.name}</span>
                    <Badge variant="outline">{med.dosage}</Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
