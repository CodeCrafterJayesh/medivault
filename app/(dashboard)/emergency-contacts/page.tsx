"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function EmergencyContactsPage() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const fetchContacts = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("emergency_contacts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })

        if (error) {
          console.error("Error fetching contacts:", error)
          return
        }

        if (data && data.length > 0) {
          setContacts(data)
        } else {
          // Initialize with an empty contact form
          setContacts([
            {
              id: null,
              full_name: "",
              relationship: "",
              phone_number: "",
              alternate_number: "",
              email: "",
              address: "",
              notes: "",
            },
          ])
        }
      }
    }

    fetchContacts()
  }, [user])

  const handleAddContact = () => {
    setContacts([
      ...contacts,
      {
        id: null,
        full_name: "",
        relationship: "",
        phone_number: "",
        alternate_number: "",
        email: "",
        address: "",
        notes: "",
      },
    ])
  }

  const handleRemoveContact = async (index: number) => {
    const contact = contacts[index]

    if (contact.id) {
      // Delete from database if it exists
      setIsLoading(true)

      try {
        const { error } = await supabase.from("emergency_contacts").delete().eq("id", contact.id)

        if (error) throw error

        const updatedContacts = [...contacts]
        updatedContacts.splice(index, 1)
        setContacts(
          updatedContacts.length
            ? updatedContacts
            : [
                {
                  id: null,
                  full_name: "",
                  relationship: "",
                  phone_number: "",
                  alternate_number: "",
                  email: "",
                  address: "",
                  notes: "",
                },
              ],
        )

        setMessage({ type: "success", text: "Contact deleted successfully" })
      } catch (error: any) {
        setMessage({ type: "error", text: error.message || "Failed to delete contact" })
      } finally {
        setIsLoading(false)
      }
    } else {
      // Just remove from state if it's a new contact
      const updatedContacts = [...contacts]
      updatedContacts.splice(index, 1)
      setContacts(
        updatedContacts.length
          ? updatedContacts
          : [
              {
                id: null,
                full_name: "",
                relationship: "",
                phone_number: "",
                alternate_number: "",
                email: "",
                address: "",
                notes: "",
              },
            ],
      )
    }
  }

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedContacts = [...contacts]
    updatedContacts[index] = { ...updatedContacts[index], [field]: value }
    setContacts(updatedContacts)
  }

  const handleSaveContact = async (index: number) => {
    const contact = contacts[index]

    if (!contact.full_name || !contact.relationship || !contact.phone_number) {
      setMessage({ type: "error", text: "Name, relationship, and phone number are required" })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      if (contact.id) {
        // Update existing contact
        const { error } = await supabase
          .from("emergency_contacts")
          .update({
            full_name: contact.full_name,
            relationship: contact.relationship,
            phone_number: contact.phone_number,
            alternate_number: contact.alternate_number,
            email: contact.email,
            address: contact.address,
            notes: contact.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", contact.id)

        if (error) throw error
      } else {
        // Insert new contact
        const { data, error } = await supabase
          .from("emergency_contacts")
          .insert({
            user_id: user?.id,
            full_name: contact.full_name,
            relationship: contact.relationship,
            phone_number: contact.phone_number,
            alternate_number: contact.alternate_number,
            email: contact.email,
            address: contact.address,
            notes: contact.notes,
          })
          .select()

        if (error) throw error

        // Update the contact in state with the new ID
        if (data && data.length > 0) {
          const updatedContacts = [...contacts]
          updatedContacts[index] = data[0]
          setContacts(updatedContacts)
        }
      }

      setMessage({ type: "success", text: "Contact saved successfully" })
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to save contact" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Emergency Contacts</h1>
        <Button onClick={handleAddContact}>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-6">
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {contacts.map((contact, index) => (
          <Card key={contact.id || index}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{contact.full_name || "New Contact"}</CardTitle>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveContact(index)}
                  disabled={isLoading || (contacts.length === 1 && !contact.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {contact.relationship ? `${contact.relationship}` : "Add a new emergency contact"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`}>Full Name *</Label>
                  <Input
                    id={`name-${index}`}
                    value={contact.full_name}
                    onChange={(e) => handleInputChange(index, "full_name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`relationship-${index}`}>Relationship *</Label>
                  <Input
                    id={`relationship-${index}`}
                    value={contact.relationship}
                    onChange={(e) => handleInputChange(index, "relationship", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`phone-${index}`}>Phone Number *</Label>
                  <Input
                    id={`phone-${index}`}
                    value={contact.phone_number}
                    onChange={(e) => handleInputChange(index, "phone_number", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`alternate-phone-${index}`}>Alternate Number</Label>
                  <Input
                    id={`alternate-phone-${index}`}
                    value={contact.alternate_number}
                    onChange={(e) => handleInputChange(index, "alternate_number", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`email-${index}`}>Email</Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    value={contact.email}
                    onChange={(e) => handleInputChange(index, "email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`address-${index}`}>Address</Label>
                  <Input
                    id={`address-${index}`}
                    value={contact.address}
                    onChange={(e) => handleInputChange(index, "address", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`notes-${index}`}>Notes</Label>
                  <Textarea
                    id={`notes-${index}`}
                    value={contact.notes}
                    onChange={(e) => handleInputChange(index, "notes", e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={() => handleSaveContact(index)} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Contact"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
