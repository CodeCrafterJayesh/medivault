"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

const chronicIllnesses = [
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Heart Disease",
  "Cancer",
  "Arthritis",
  "Thyroid Disorder",
  "Kidney Disease",
  "Liver Disease",
  "Other",
]

export default function MedicalHistoryPage() {
  const { user } = useAuth()
  const [medicalHistory, setMedicalHistory] = useState<any>(null)
  const [selectedChronicIllnesses, setSelectedChronicIllnesses] = useState<string[]>([])
  const [previousSurgeries, setPreviousSurgeries] = useState<{ name: string; date: string; notes: string }[]>([
    { name: "", date: "", notes: "" },
  ])
  const [hasAllergies, setHasAllergies] = useState<string>("no")
  const [allergies, setAllergies] = useState<{ name: string; reaction: string }[]>([{ name: "", reaction: "" }])
  const [currentMedications, setCurrentMedications] = useState<{ name: string; dosage: string; frequency: string }[]>([
    { name: "", dosage: "", frequency: "" },
  ])
  const [familyHistory, setFamilyHistory] = useState<{ condition: string; relation: string }[]>([
    { condition: "", relation: "" },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      if (user) {
        const { data, error } = await supabase.from("medical_history").select("*").eq("user_id", user.id).single()

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching medical history:", error)
          return
        }

        if (data) {
          setMedicalHistory(data)
          setSelectedChronicIllnesses(data.chronic_illnesses || [])

          // Ensure previous_surgeries is an array
          const surgeries = Array.isArray(data.previous_surgeries?.items)
            ? data.previous_surgeries.items
            : [{ name: "", date: "", notes: "" }]
          setPreviousSurgeries(surgeries)

          setHasAllergies(data.allergies?.has_allergies || "no")

          // Ensure allergies is an array
          const allergyItems = Array.isArray(data.allergies?.items)
            ? data.allergies.items
            : [{ name: "", reaction: "" }]
          setAllergies(allergyItems)

          // Ensure medications is an array
          const medicationItems = Array.isArray(data.current_medications?.items)
            ? data.current_medications.items
            : [{ name: "", dosage: "", frequency: "" }]
          setCurrentMedications(medicationItems)

          // Ensure family_history is an array
          const historyItems = Array.isArray(data.family_history?.items)
            ? data.family_history.items
            : [{ condition: "", relation: "" }]
          setFamilyHistory(historyItems)
        }
      }
    }

    fetchMedicalHistory()
  }, [user])

  const handleSaveMedicalHistory = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const medicalHistoryData = {
        user_id: user?.id,
        chronic_illnesses: selectedChronicIllnesses,
        previous_surgeries: {
          items: previousSurgeries.filter((surgery) => surgery.name.trim() !== ""),
        },
        allergies: {
          has_allergies: hasAllergies,
          items: hasAllergies === "yes" ? allergies.filter((allergy) => allergy.name.trim() !== "") : [],
        },
        current_medications: {
          items: currentMedications.filter((medication) => medication.name.trim() !== ""),
        },
        family_history: {
          items: familyHistory.filter((history) => history.condition.trim() !== ""),
        },
        updated_at: new Date().toISOString(),
      }

      if (medicalHistory?.id) {
        // Update existing record
        const { error } = await supabase.from("medical_history").update(medicalHistoryData).eq("id", medicalHistory.id)

        if (error) throw error
      } else {
        // Insert new record
        const { error } = await supabase.from("medical_history").insert(medicalHistoryData)

        if (error) throw error
      }

      setMessage({ type: "success", text: "Medical history saved successfully" })
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to save medical history" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChronicIllnessChange = (illness: string, checked: boolean) => {
    if (checked) {
      setSelectedChronicIllnesses((prev) => [...prev, illness])
    } else {
      setSelectedChronicIllnesses((prev) => prev.filter((i) => i !== illness))
    }
  }

  const addSurgery = () => {
    setPreviousSurgeries([...previousSurgeries, { name: "", date: "", notes: "" }])
  }

  const updateSurgery = (index: number, field: string, value: string) => {
    const updatedSurgeries = [...previousSurgeries]
    updatedSurgeries[index] = { ...updatedSurgeries[index], [field]: value }
    setPreviousSurgeries(updatedSurgeries)
  }

  const removeSurgery = (index: number) => {
    if (previousSurgeries.length > 1) {
      const updatedSurgeries = [...previousSurgeries]
      updatedSurgeries.splice(index, 1)
      setPreviousSurgeries(updatedSurgeries)
    }
  }

  const addAllergy = () => {
    setAllergies([...allergies, { name: "", reaction: "" }])
  }

  const updateAllergy = (index: number, field: string, value: string) => {
    const updatedAllergies = [...allergies]
    updatedAllergies[index] = { ...updatedAllergies[index], [field]: value }
    setAllergies(updatedAllergies)
  }

  const removeAllergy = (index: number) => {
    if (allergies.length > 1) {
      const updatedAllergies = [...allergies]
      updatedAllergies.splice(index, 1)
      setAllergies(updatedAllergies)
    }
  }

  const addMedication = () => {
    setCurrentMedications([...currentMedications, { name: "", dosage: "", frequency: "" }])
  }

  const updateMedication = (index: number, field: string, value: string) => {
    const updatedMedications = [...currentMedications]
    updatedMedications[index] = { ...updatedMedications[index], [field]: value }
    setCurrentMedications(updatedMedications)
  }

  const removeMedication = (index: number) => {
    if (currentMedications.length > 1) {
      const updatedMedications = [...currentMedications]
      updatedMedications.splice(index, 1)
      setCurrentMedications(updatedMedications)
    }
  }

  const addFamilyHistory = () => {
    setFamilyHistory([...familyHistory, { condition: "", relation: "" }])
  }

  const updateFamilyHistory = (index: number, field: string, value: string) => {
    const updatedFamilyHistory = [...familyHistory]
    updatedFamilyHistory[index] = { ...updatedFamilyHistory[index], [field]: value }
    setFamilyHistory(updatedFamilyHistory)
  }

  const removeFamilyHistory = (index: number) => {
    if (familyHistory.length > 1) {
      const updatedFamilyHistory = [...familyHistory]
      updatedFamilyHistory.splice(index, 1)
      setFamilyHistory(updatedFamilyHistory)
    }
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Medical History</h1>

      <form onSubmit={handleSaveMedicalHistory} className="space-y-6">
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Chronic Illnesses</CardTitle>
            <CardDescription>Select any chronic conditions you have been diagnosed with</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chronicIllnesses.map((illness) => (
                <div key={illness} className="flex items-center space-x-2">
                  <Checkbox
                    id={`illness-${illness}`}
                    checked={selectedChronicIllnesses.includes(illness)}
                    onCheckedChange={(checked) => handleChronicIllnessChange(illness, checked as boolean)}
                  />
                  <Label htmlFor={`illness-${illness}`}>{illness}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Previous Surgeries</CardTitle>
            <CardDescription>List any surgeries you have had in the past</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(previousSurgeries) &&
                previousSurgeries.map((surgery, index) => (
                  <div key={index} className="grid gap-4 md:grid-cols-3 items-start">
                    <div className="space-y-2">
                      <Label htmlFor={`surgery-name-${index}`}>Surgery Name</Label>
                      <Input
                        id={`surgery-name-${index}`}
                        value={surgery.name}
                        onChange={(e) => updateSurgery(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`surgery-date-${index}`}>Date</Label>
                      <Input
                        id={`surgery-date-${index}`}
                        type="date"
                        value={surgery.date}
                        onChange={(e) => updateSurgery(index, "date", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`surgery-notes-${index}`}>Notes</Label>
                      <div className="flex space-x-2">
                        <Input
                          id={`surgery-notes-${index}`}
                          value={surgery.notes}
                          onChange={(e) => updateSurgery(index, "notes", e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeSurgery(index)}
                          disabled={previousSurgeries.length <= 1}
                        >
                          &times;
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              <Button type="button" variant="outline" onClick={addSurgery}>
                Add Surgery
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allergies</CardTitle>
            <CardDescription>Do you have any allergies?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={hasAllergies} onValueChange={setHasAllergies}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="allergies-yes" />
                <Label htmlFor="allergies-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="allergies-no" />
                <Label htmlFor="allergies-no">No</Label>
              </div>
            </RadioGroup>

            {hasAllergies === "yes" && (
              <div className="space-y-4 pt-4">
                {Array.isArray(allergies) &&
                  allergies.map((allergy, index) => (
                    <div key={index} className="grid gap-4 md:grid-cols-2 items-start">
                      <div className="space-y-2">
                        <Label htmlFor={`allergy-name-${index}`}>Allergy</Label>
                        <Input
                          id={`allergy-name-${index}`}
                          value={allergy.name}
                          onChange={(e) => updateAllergy(index, "name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`allergy-reaction-${index}`}>Reaction</Label>
                        <div className="flex space-x-2">
                          <Input
                            id={`allergy-reaction-${index}`}
                            value={allergy.reaction}
                            onChange={(e) => updateAllergy(index, "reaction", e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeAllergy(index)}
                            disabled={allergies.length <= 1}
                          >
                            &times;
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                <Button type="button" variant="outline" onClick={addAllergy}>
                  Add Allergy
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Medications</CardTitle>
            <CardDescription>List any medications you are currently taking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(currentMedications) &&
                currentMedications.map((medication, index) => (
                  <div key={index} className="grid gap-4 md:grid-cols-3 items-start">
                    <div className="space-y-2">
                      <Label htmlFor={`medication-name-${index}`}>Medication Name</Label>
                      <Input
                        id={`medication-name-${index}`}
                        value={medication.name}
                        onChange={(e) => updateMedication(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`medication-dosage-${index}`}>Dosage</Label>
                      <Input
                        id={`medication-dosage-${index}`}
                        value={medication.dosage}
                        onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`medication-frequency-${index}`}>Frequency</Label>
                      <div className="flex space-x-2">
                        <Input
                          id={`medication-frequency-${index}`}
                          value={medication.frequency}
                          onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeMedication(index)}
                          disabled={currentMedications.length <= 1}
                        >
                          &times;
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              <Button type="button" variant="outline" onClick={addMedication}>
                Add Medication
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Family History</CardTitle>
            <CardDescription>List any medical conditions that run in your family</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(familyHistory) &&
                familyHistory.map((history, index) => (
                  <div key={index} className="grid gap-4 md:grid-cols-2 items-start">
                    <div className="space-y-2">
                      <Label htmlFor={`family-condition-${index}`}>Condition</Label>
                      <Input
                        id={`family-condition-${index}`}
                        value={history.condition}
                        onChange={(e) => updateFamilyHistory(index, "condition", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`family-relation-${index}`}>Family Relation</Label>
                      <div className="flex space-x-2">
                        <Input
                          id={`family-relation-${index}`}
                          value={history.relation}
                          onChange={(e) => updateFamilyHistory(index, "relation", e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeFamilyHistory(index)}
                          disabled={familyHistory.length <= 1}
                        >
                          &times;
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              <Button type="button" variant="outline" onClick={addFamilyHistory}>
                Add Family History
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Medical History"}
          </Button>
        </div>
      </form>
    </div>
  )
}
