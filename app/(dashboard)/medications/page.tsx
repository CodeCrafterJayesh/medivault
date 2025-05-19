"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import {
  Plus,
  Minus,
  Trash2,
  Save,
  Loader2,
  CalendarIcon,
  Clock,
  Edit,
  AlertCircle,
  CheckCircle,
  X,
  PlusCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

type Medication = {
  id?: string
  name: string
  dosage: string
  frequency: string
  times: string[]
  startDate: Date | null
  endDate: Date | null
  route: string
  doctor: string
  reason: string
  status: "active" | "paused" | "discontinued"
  notifications: boolean
  history: {
    timestamp: string
    action: string
    details: string
  }[]
}

const ROUTES = [
  "Oral",
  "Injection",
  "Topical",
  "Inhalation",
  "Sublingual",
  "Rectal",
  "Vaginal",
  "Ophthalmic",
  "Otic",
  "Nasal",
  "Other",
]

const FREQUENCIES = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every morning",
  "Every evening",
  "Every other day",
  "Weekly",
  "As needed",
  "Other",
]

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "discontinued", label: "Discontinued" },
]

export default function MedicationsPage() {
  const { user } = useAuth()
  const [medicalHistory, setMedicalHistory] = useState<any>(null)
  const [medications, setMedications] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [medicationToDelete, setMedicationToDelete] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newMedication, setNewMedication] = useState<Medication>({
    name: "",
    dosage: "1",
    frequency: "Once daily",
    times: ["09:00"],
    startDate: new Date(),
    endDate: null,
    route: "Oral",
    doctor: "",
    reason: "",
    status: "active",
    notifications: true,
    history: [],
  })

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      if (user) {
        setIsLoading(true)
        try {
          const { data, error } = await supabase.from("medical_history").select("*").eq("user_id", user.id).single()

          if (error && error.code !== "PGRST116") {
            console.error("Error fetching medical history:", error)
            setMessage({ type: "error", text: "Failed to load medications" })
            return
          }

          if (data) {
            setMedicalHistory(data)

            // Transform the data to match our new structure
            const medicationsData = data.current_medications?.items || []
            const transformedMedications = medicationsData.map((med: any, index: number) => ({
              id: `med-${index}`,
              name: med.name || "",
              dosage: med.dosage || "1",
              frequency: med.frequency || "Once daily",
              times: med.times || ["09:00"],
              startDate: med.startDate ? new Date(med.startDate) : new Date(),
              endDate: med.endDate ? new Date(med.endDate) : null,
              route: med.route || "Oral",
              doctor: med.doctor || "",
              reason: med.reason || "",
              status: med.status || "active",
              notifications: med.notifications !== false,
              history: med.history || [],
            }))

            setMedications(transformedMedications)
          } else {
            // Initialize with empty array if no data
            setMedications([])
          }
        } catch (error) {
          console.error("Error:", error)
          setMessage({ type: "error", text: "An unexpected error occurred" })
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchMedicalHistory()
  }, [user])

  const handleSaveMedications = async () => {
    if (!user) return

    setIsSaving(true)
    setMessage(null)

    try {
      // Prepare the data for saving
      const medicationsData = {
        items: medications.map((med) => ({
          ...med,
          startDate: med.startDate ? med.startDate.toISOString() : null,
          endDate: med.endDate ? med.endDate.toISOString() : null,
        })),
      }

      if (medicalHistory?.id) {
        // Update existing record
        const { error } = await supabase
          .from("medical_history")
          .update({
            current_medications: medicationsData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", medicalHistory.id)

        if (error) throw error
      } else {
        // Create new record
        const { error } = await supabase.from("medical_history").insert({
          user_id: user.id,
          current_medications: medicationsData,
          chronic_illnesses: [],
          previous_surgeries: { items: [] },
          allergies: { has_allergies: "no", items: [] },
          family_history: { items: [] },
        })

        if (error) throw error
      }

      setMessage({ type: "success", text: "Medications saved successfully" })
    } catch (error: any) {
      console.error("Error saving medications:", error)
      setMessage({ type: "error", text: error.message || "Failed to save medications" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddMedication = () => {
    // Add timestamp to history
    const medicationWithHistory = {
      ...newMedication,
      id: `med-${Date.now()}`,
      history: [
        {
          timestamp: new Date().toISOString(),
          action: "Created",
          details: "Medication added",
        },
      ],
    }

    setMedications([...medications, medicationWithHistory])
    setIsAddDialogOpen(false)

    // Reset the new medication form
    setNewMedication({
      name: "",
      dosage: "1",
      frequency: "Once daily",
      times: ["09:00"],
      startDate: new Date(),
      endDate: null,
      route: "Oral",
      doctor: "",
      reason: "",
      status: "active",
      notifications: true,
      history: [],
    })
  }

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication)
  }

  const handleUpdateMedication = () => {
    if (!editingMedication) return

    // Add timestamp to history
    const updatedMedication = {
      ...editingMedication,
      history: [
        ...(editingMedication.history || []),
        {
          timestamp: new Date().toISOString(),
          action: "Updated",
          details: "Medication details updated",
        },
      ],
    }

    const updatedMedications = medications.map((med) => (med.id === updatedMedication.id ? updatedMedication : med))

    setMedications(updatedMedications)
    setEditingMedication(null)
  }

  const handleDeleteMedication = (id: string) => {
    setMedicationToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteMedication = () => {
    if (!medicationToDelete) return

    const updatedMedications = medications.filter((med) => med.id !== medicationToDelete)
    setMedications(updatedMedications)
    setIsDeleteDialogOpen(false)
    setMedicationToDelete(null)
  }

  const handleAdjustDosage = (medication: Medication, increment: boolean) => {
    // Parse the current dosage
    let currentDosage = Number.parseFloat(medication.dosage)
    if (isNaN(currentDosage)) currentDosage = 0

    // Increment or decrement
    let newDosage = increment ? currentDosage + 0.5 : currentDosage - 0.5

    // Ensure minimum of 0.5
    newDosage = Math.max(0.5, newDosage)

    // Update the medication
    const updatedMedication = {
      ...medication,
      dosage: newDosage.toString(),
      history: [
        ...(medication.history || []),
        {
          timestamp: new Date().toISOString(),
          action: "Dosage Changed",
          details: `Dosage ${increment ? "increased" : "decreased"} from ${currentDosage} to ${newDosage}`,
        },
      ],
    }

    const updatedMedications = medications.map((med) => (med.id === medication.id ? updatedMedication : med))

    setMedications(updatedMedications)
  }

  const handleToggleStatus = (medication: Medication, newStatus: "active" | "paused" | "discontinued") => {
    const updatedMedication = {
      ...medication,
      status: newStatus,
      history: [
        ...(medication.history || []),
        {
          timestamp: new Date().toISOString(),
          action: "Status Changed",
          details: `Status changed from ${medication.status} to ${newStatus}`,
        },
      ],
    }

    const updatedMedications = medications.map((med) => (med.id === medication.id ? updatedMedication : med))

    setMedications(updatedMedications)
  }

  const handleToggleNotifications = (medication: Medication) => {
    const updatedMedication = {
      ...medication,
      notifications: !medication.notifications,
      history: [
        ...(medication.history || []),
        {
          timestamp: new Date().toISOString(),
          action: "Notifications Changed",
          details: `Notifications ${medication.notifications ? "disabled" : "enabled"}`,
        },
      ],
    }

    const updatedMedications = medications.map((med) => (med.id === medication.id ? updatedMedication : med))

    setMedications(updatedMedications)
  }

  const handleMarkAsTaken = (medication: Medication) => {
    const updatedMedication = {
      ...medication,
      history: [
        ...(medication.history || []),
        {
          timestamp: new Date().toISOString(),
          action: "Taken",
          details: "Medication marked as taken",
        },
      ],
    }

    const updatedMedications = medications.map((med) => (med.id === medication.id ? updatedMedication : med))

    setMedications(updatedMedications)

    // Show success message
    setMessage({ type: "success", text: `${medication.name} marked as taken` })

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null)
    }, 3000)
  }

  // Filter medications based on active tab
  const filteredMedications = medications.filter((med) => {
    if (activeTab === "all") return true
    if (activeTab === "active") return med.status === "active"
    if (activeTab === "today") {
      // Check if medication is active and should be taken today
      return med.status === "active"
    }
    return false
  })

  // Get today's medications for the "Today" tab
  const todaysMedications = medications.filter(
    (med) => med.status === "active" && med.startDate && (med.endDate === null || new Date(med.endDate) >= new Date()),
  )

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Medications</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Medication
          </Button>
          {medications.length > 0 && (
            <Button onClick={handleSaveMedications} disabled={isSaving} variant="outline">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save All
                </>
              )}
            </Button>
          )}
        </div>
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
      ) : (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">All Medications</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="today">Today's Medications</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {medications.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">No medications added yet</p>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Medication
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredMedications.map((medication) => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  onEdit={handleEditMedication}
                  onDelete={() => medication.id && handleDeleteMedication(medication.id)}
                  onAdjustDosage={handleAdjustDosage}
                  onToggleStatus={handleToggleStatus}
                  onToggleNotifications={handleToggleNotifications}
                  onMarkAsTaken={handleMarkAsTaken}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            {filteredMedications.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">No active medications</p>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Medication
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredMedications.map((medication) => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  onEdit={handleEditMedication}
                  onDelete={() => medication.id && handleDeleteMedication(medication.id)}
                  onAdjustDosage={handleAdjustDosage}
                  onToggleStatus={handleToggleStatus}
                  onToggleNotifications={handleToggleNotifications}
                  onMarkAsTaken={handleMarkAsTaken}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="today" className="space-y-6">
            {todaysMedications.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">No medications scheduled for today</p>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Medication
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Medication Schedule</CardTitle>
                    <CardDescription>Check off medications as you take them</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {todaysMedications.map((medication) => (
                        <div
                          key={medication.id}
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox id={`taken-${medication.id}`} />
                            <div>
                              <Label htmlFor={`taken-${medication.id}`} className="font-medium">
                                {medication.name}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {medication.dosage} - {medication.frequency}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {medication.times.map((time, idx) => (
                              <Badge key={idx} variant="outline" className="bg-primary/10">
                                <Clock className="h-3 w-3 mr-1" />
                                {time}
                              </Badge>
                            ))}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="ml-2"
                              onClick={() => handleMarkAsTaken(medication)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="sr-only">Mark as taken</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Warnings/Interactions Card */}
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-amber-800 dark:text-amber-400 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Potential Interactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-amber-700 dark:text-amber-300">
                      Always consult with your healthcare provider about potential medication interactions.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Add Medication Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Medication</DialogTitle>
            <DialogDescription>
              Enter the details of your medication. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="med-name" className="font-medium">
                  Medication Name *
                </Label>
                <Input
                  id="med-name"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                  placeholder="e.g., Lisinopril"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="med-dosage" className="font-medium">
                  Dosage *
                </Label>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-r-none"
                    onClick={() => {
                      const currentDosage = Number.parseFloat(newMedication.dosage) || 0
                      const newDosage = Math.max(0.5, currentDosage - 0.5)
                      setNewMedication({ ...newMedication, dosage: newDosage.toString() })
                    }}
                    disabled={Number.parseFloat(newMedication.dosage) <= 0.5}
                    title="Decrease dosage"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="med-dosage"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                    className="rounded-none text-center"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-l-none"
                    onClick={() => {
                      const currentDosage = Number.parseFloat(newMedication.dosage) || 0
                      const newDosage = currentDosage + 0.5
                      setNewMedication({ ...newMedication, dosage: newDosage.toString() })
                    }}
                    title="Increase dosage"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="med-frequency" className="font-medium">
                  Frequency *
                </Label>
                <Select
                  value={newMedication.frequency}
                  onValueChange={(value) => setNewMedication({ ...newMedication, frequency: value })}
                >
                  <SelectTrigger id="med-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((freq) => (
                      <SelectItem key={freq} value={freq}>
                        {freq}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="med-times" className="font-medium">
                  Time(s) to Take *
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="med-times"
                    type="time"
                    value={newMedication.times[0] || "09:00"}
                    onChange={(e) => {
                      const updatedTimes = [...newMedication.times]
                      updatedTimes[0] = e.target.value
                      setNewMedication({ ...newMedication, times: updatedTimes })
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setNewMedication({
                        ...newMedication,
                        times: [...newMedication.times, "12:00"],
                      })
                    }}
                    title="Add another time"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {newMedication.times.slice(1).map((time, index) => (
                  <div key={index} className="flex items-center gap-2 mt-2">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => {
                        const updatedTimes = [...newMedication.times]
                        updatedTimes[index + 1] = e.target.value
                        setNewMedication({ ...newMedication, times: updatedTimes })
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const updatedTimes = [...newMedication.times]
                        updatedTimes.splice(index + 1, 1)
                        setNewMedication({ ...newMedication, times: updatedTimes })
                      }}
                      title="Remove time"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="med-start-date" className="font-medium">
                  Start Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="med-start-date"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newMedication.startDate ? format(newMedication.startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newMedication.startDate || undefined}
                      onSelect={(date) => setNewMedication({ ...newMedication, startDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="med-end-date" className="font-medium">
                  End Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button id="med-end-date" variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newMedication.endDate ? format(newMedication.endDate, "PPP") : <span>No end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start mb-2"
                        onClick={() => setNewMedication({ ...newMedication, endDate: null })}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Clear end date
                      </Button>
                    </div>
                    <Calendar
                      mode="single"
                      selected={newMedication.endDate || undefined}
                      onSelect={(date) => setNewMedication({ ...newMedication, endDate: date })}
                      initialFocus
                      disabled={(date) => (newMedication.startDate ? date < newMedication.startDate : false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="med-route" className="font-medium">
                  Route of Administration *
                </Label>
                <Select
                  value={newMedication.route}
                  onValueChange={(value) => setNewMedication({ ...newMedication, route: value })}
                >
                  <SelectTrigger id="med-route">
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROUTES.map((route) => (
                      <SelectItem key={route} value={route}>
                        {route}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="med-doctor" className="font-medium">
                  Prescribing Doctor
                </Label>
                <Input
                  id="med-doctor"
                  value={newMedication.doctor}
                  onChange={(e) => setNewMedication({ ...newMedication, doctor: e.target.value })}
                  placeholder="e.g., Dr. Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="med-reason" className="font-medium">
                  Reason for Taking
                </Label>
                <Input
                  id="med-reason"
                  value={newMedication.reason}
                  onChange={(e) => setNewMedication({ ...newMedication, reason: e.target.value })}
                  placeholder="e.g., High blood pressure"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="med-status" className="font-medium">
                  Status *
                </Label>
                <Select
                  value={newMedication.status}
                  onValueChange={(value: "active" | "paused" | "discontinued") =>
                    setNewMedication({ ...newMedication, status: value })
                  }
                >
                  <SelectTrigger id="med-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="med-notifications"
                  checked={newMedication.notifications}
                  onCheckedChange={(checked) => setNewMedication({ ...newMedication, notifications: checked === true })}
                />
                <Label htmlFor="med-notifications">Enable reminders for this medication</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddMedication}
              disabled={!newMedication.name || !newMedication.dosage || !newMedication.frequency}
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
            >
              Add Medication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Medication Dialog */}
      <Dialog open={!!editingMedication} onOpenChange={(open) => !open && setEditingMedication(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {editingMedication && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Medication</DialogTitle>
                <DialogDescription>Update the details of your medication.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-med-name" className="font-medium">
                      Medication Name *
                    </Label>
                    <Input
                      id="edit-med-name"
                      value={editingMedication.name}
                      onChange={(e) => setEditingMedication({ ...editingMedication, name: e.target.value })}
                      placeholder="e.g., Lisinopril"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-med-dosage" className="font-medium">
                      Dosage *
                    </Label>
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-r-none"
                        onClick={() => {
                          const currentDosage = Number.parseFloat(editingMedication.dosage) || 0
                          const newDosage = Math.max(0.5, currentDosage - 0.5)
                          setEditingMedication({ ...editingMedication, dosage: newDosage.toString() })
                        }}
                        disabled={Number.parseFloat(editingMedication.dosage) <= 0.5}
                        title="Decrease dosage"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="edit-med-dosage"
                        value={editingMedication.dosage}
                        onChange={(e) => setEditingMedication({ ...editingMedication, dosage: e.target.value })}
                        className="rounded-none text-center"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-l-none"
                        onClick={() => {
                          const currentDosage = Number.parseFloat(editingMedication.dosage) || 0
                          const newDosage = currentDosage + 0.5
                          setEditingMedication({ ...editingMedication, dosage: newDosage.toString() })
                        }}
                        title="Increase dosage"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-med-frequency" className="font-medium">
                      Frequency *
                    </Label>
                    <Select
                      value={editingMedication.frequency}
                      onValueChange={(value) => setEditingMedication({ ...editingMedication, frequency: value })}
                    >
                      <SelectTrigger id="edit-med-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map((freq) => (
                          <SelectItem key={freq} value={freq}>
                            {freq}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-med-times" className="font-medium">
                      Time(s) to Take *
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="edit-med-times"
                        type="time"
                        value={editingMedication.times[0] || "09:00"}
                        onChange={(e) => {
                          const updatedTimes = [...editingMedication.times]
                          updatedTimes[0] = e.target.value
                          setEditingMedication({ ...editingMedication, times: updatedTimes })
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingMedication({
                            ...editingMedication,
                            times: [...editingMedication.times, "12:00"],
                          })
                        }}
                        title="Add another time"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {editingMedication.times.slice(1).map((time, index) => (
                      <div key={index} className="flex items-center gap-2 mt-2">
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => {
                            const updatedTimes = [...editingMedication.times]
                            updatedTimes[index + 1] = e.target.value
                            setEditingMedication({ ...editingMedication, times: updatedTimes })
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const updatedTimes = [...editingMedication.times]
                            updatedTimes.splice(index + 1, 1)
                            setEditingMedication({ ...editingMedication, times: updatedTimes })
                          }}
                          title="Remove time"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-med-start-date" className="font-medium">
                      Start Date *
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="edit-med-start-date"
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editingMedication.startDate ? (
                            format(editingMedication.startDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={editingMedication.startDate || undefined}
                          onSelect={(date) => setEditingMedication({ ...editingMedication, startDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-med-end-date" className="font-medium">
                      End Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="edit-med-end-date"
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editingMedication.endDate ? (
                            format(editingMedication.endDate, "PPP")
                          ) : (
                            <span>No end date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <div className="p-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start mb-2"
                            onClick={() => setEditingMedication({ ...editingMedication, endDate: null })}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Clear end date
                          </Button>
                        </div>
                        <Calendar
                          mode="single"
                          selected={editingMedication.endDate || undefined}
                          onSelect={(date) => setEditingMedication({ ...editingMedication, endDate: date })}
                          initialFocus
                          disabled={(date) =>
                            editingMedication.startDate ? date < editingMedication.startDate : false
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-med-route" className="font-medium">
                      Route of Administration *
                    </Label>
                    <Select
                      value={editingMedication.route}
                      onValueChange={(value) => setEditingMedication({ ...editingMedication, route: value })}
                    >
                      <SelectTrigger id="edit-med-route">
                        <SelectValue placeholder="Select route" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROUTES.map((route) => (
                          <SelectItem key={route} value={route}>
                            {route}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-med-doctor" className="font-medium">
                      Prescribing Doctor
                    </Label>
                    <Input
                      id="edit-med-doctor"
                      value={editingMedication.doctor}
                      onChange={(e) => setEditingMedication({ ...editingMedication, doctor: e.target.value })}
                      placeholder="e.g., Dr. Smith"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-med-reason" className="font-medium">
                      Reason for Taking
                    </Label>
                    <Input
                      id="edit-med-reason"
                      value={editingMedication.reason}
                      onChange={(e) => setEditingMedication({ ...editingMedication, reason: e.target.value })}
                      placeholder="e.g., High blood pressure"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-med-status" className="font-medium">
                      Status *
                    </Label>
                    <Select
                      value={editingMedication.status}
                      onValueChange={(value: "active" | "paused" | "discontinued") =>
                        setEditingMedication({ ...editingMedication, status: value })
                      }
                    >
                      <SelectTrigger id="edit-med-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="edit-med-notifications"
                      checked={editingMedication.notifications}
                      onCheckedChange={(checked) =>
                        setEditingMedication({ ...editingMedication, notifications: checked === true })
                      }
                    />
                    <Label htmlFor="edit-med-notifications">Enable reminders for this medication</Label>
                  </div>
                </div>

                {/* Medication History */}
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-lg font-medium mb-2">Medication History</h3>
                  {editingMedication.history && editingMedication.history.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                      {editingMedication.history
                        .slice()
                        .reverse()
                        .map((entry, index) => (
                          <div key={index} className="text-sm py-1 border-b last:border-b-0">
                            <span className="text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</span>
                            <span className="font-medium ml-2">{entry.action}:</span> {entry.details}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No history available</p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingMedication(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateMedication}
                  disabled={!editingMedication.name || !editingMedication.dosage || !editingMedication.frequency}
                >
                  Update Medication
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this medication? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteMedication}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Add Button (Mobile) */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
        >
          <PlusCircle className="h-6 w-6" />
          <span className="sr-only">Add Medication</span>
        </Button>
      </div>
    </div>
  )
}

// Medication Card Component
function MedicationCard({
  medication,
  onEdit,
  onDelete,
  onAdjustDosage,
  onToggleStatus,
  onToggleNotifications,
  onMarkAsTaken,
}: {
  medication: Medication
  onEdit: (medication: Medication) => void
  onDelete: () => void
  onAdjustDosage: (medication: Medication, increment: boolean) => void
  onToggleStatus: (medication: Medication, status: "active" | "paused" | "discontinued") => void
  onToggleNotifications: (medication: Medication) => void
  onMarkAsTaken: (medication: Medication) => void
}) {
  const [showHistory, setShowHistory] = useState(false)

  // Get status badge color
  const getStatusColor = () => {
    switch (medication.status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "paused":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "discontinued":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <Card className={cn("transition-all duration-200", medication.status === "discontinued" && "opacity-70")}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              {medication.name}
              <Badge className={cn("ml-2 text-xs", getStatusColor())}>
                {medication.status.charAt(0).toUpperCase() + medication.status.slice(1)}
              </Badge>
              {medication.notifications && (
                <Badge variant="outline" className="ml-1 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Reminders On
                </Badge>
              )}
            </CardTitle>
            {medication.reason && <CardDescription className="mt-1">For: {medication.reason}</CardDescription>}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(medication)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Dosage:</span>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-r-none"
                  onClick={() => onAdjustDosage(medication, false)}
                  disabled={Number.parseFloat(medication.dosage) <= 0.5}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="px-3 py-1 border-y">{medication.dosage}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-l-none"
                  onClick={() => onAdjustDosage(medication, true)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Frequency:</span>
              <span>{medication.frequency}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Route:</span>
              <span>{medication.route}</span>
            </div>

            {medication.doctor && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Prescribed by:</span>
                <span>{medication.doctor}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Time(s):</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {medication.times.map((time, idx) => (
                  <Badge key={idx} variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {time}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Start Date:</span>
              <span>{medication.startDate ? format(medication.startDate, "PP") : "Not set"}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">End Date:</span>
              <span>{medication.endDate ? format(medication.endDate, "PP") : "Ongoing"}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Reminders:</span>
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => onToggleNotifications(medication)}>
                {medication.notifications ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? "Hide History" : "Show History"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onMarkAsTaken(medication)}
            disabled={medication.status !== "active"}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark as Taken
          </Button>
        </div>

        <div className="flex gap-2">
          {medication.status !== "active" && (
            <Button variant="outline" size="sm" onClick={() => onToggleStatus(medication, "active")}>
              Activate
            </Button>
          )}

          {medication.status !== "paused" && (
            <Button variant="outline" size="sm" onClick={() => onToggleStatus(medication, "paused")}>
              Pause
            </Button>
          )}

          {medication.status !== "discontinued" && (
            <Button variant="outline" size="sm" onClick={() => onToggleStatus(medication, "discontinued")}>
              Discontinue
            </Button>
          )}
        </div>
      </CardFooter>

      {/* Medication History */}
      {showHistory && (
        <div className="px-6 pb-4">
          <h4 className="text-sm font-medium mb-2">Medication History</h4>
          {medication.history && medication.history.length > 0 ? (
            <div className="max-h-40 overflow-y-auto border rounded-md p-2">
              {medication.history
                .slice()
                .reverse()
                .map((entry, index) => (
                  <div key={index} className="text-sm py-1 border-b last:border-b-0">
                    <span className="text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</span>
                    <span className="font-medium ml-2">{entry.action}:</span> {entry.details}
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No history available</p>
          )}
        </div>
      )}
    </Card>
  )
}
