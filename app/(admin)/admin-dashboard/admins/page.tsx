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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, AlertCircle, UserPlus, Trash2, Shield, Edit, RefreshCw, Database, Info } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

// Admin type definition
type Admin = {
  id: string
  email: string
  role: string
  created_at: string
  last_login?: string
}

// Helper function to safely check if a string includes a substring
const safeIncludes = (str: any, searchValue: string): boolean => {
  if (typeof str === "string") {
    return str.includes(searchValue)
  }
  return false
}

export default function AdminManagementPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null)
  const [adminToEdit, setAdminToEdit] = useState<Admin | null>(null)
  const [newAdmin, setNewAdmin] = useState({
    email: "",
    password: "",
    role: "admin",
  })
  const [editAdmin, setEditAdmin] = useState({
    email: "",
    role: "",
  })
  const [isTableExists, setIsTableExists] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [tableInitialized, setTableInitialized] = useState(false)
  const [showSqlDialog, setShowSqlDialog] = useState(false)

  // Function to check if the admins table exists
  const checkTableExists = async () => {
    try {
      // Try to query the table
      const { data, error } = await supabase.from("admins").select("id").limit(1)

      if (!error) {
        return true
      }

      // If we get here, there was an error - check if it's because the table doesn't exist
      const isTableNotExistError =
        error.code === "42P01" ||
        safeIncludes(error.message, "does not exist") ||
        safeIncludes(error.details, "does not exist") ||
        safeIncludes(error.hint, "does not exist")

      if (isTableNotExistError) {
        return false
      }

      // Some other error
      console.error("Error checking if table exists:", error)
      return false
    } catch (error: any) {
      console.error("Error in checkTableExists:", error)
      return false
    }
  }

  // Function to attempt to create a default admin directly
  const createDefaultAdmin = async () => {
    try {
      // Try to insert the default admin directly
      const { error } = await supabase.from("admins").insert({
        email: "medivaultdigihealth@gmail.com",
        password_hash: "Admin@2004",
        role: "superadmin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      // If there's an error but it's a duplicate key error, that's fine
      if (error && error.code !== "23505") {
        console.error("Error inserting default admin:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error creating default admin:", error)
      return false
    }
  }

  const initializeAdminTable = async () => {
    setIsInitializing(true)
    setError(null)

    try {
      // Check if the table exists
      const tableExists = await checkTableExists()

      if (tableExists) {
        // If the table exists, try to create the default admin
        const success = await createDefaultAdmin()

        if (success) {
          toast({
            title: "Admin Table Ready",
            description: "The admin table is ready to use.",
          })

          // Mark as initialized
          setTableInitialized(true)
          localStorage.setItem("adminTableInitialized", "true")

          // Refresh the admin list
          fetchAdmins()
          return
        }
      }

      // If we get here, either the table doesn't exist or we couldn't create the default admin
      // Show the SQL dialog
      setShowSqlDialog(true)
      setError("Admin table needs to be created manually. Please follow the instructions.")
    } catch (error: any) {
      console.error("Error initializing admin table:", error)
      setError(error?.message || "Failed to initialize admin table")

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initialize admin table. Please try again.",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  const fetchAdmins = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if we've already initialized the table
      const initialized = localStorage.getItem("adminTableInitialized") === "true" || tableInitialized

      // First check if the table exists
      const tableExists = await checkTableExists()
      setIsTableExists(tableExists)

      if (!tableExists) {
        setAdmins([])

        // If we haven't tried to initialize the table yet, do it automatically
        if (!initialized) {
          await initializeAdminTable()
          return
        }

        setError("Admin table does not exist. Please initialize it.")
        return
      }

      // Now fetch admins
      const { data, error } = await supabase.from("admins").select("*").order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setAdmins(data || [])

      if (isRefreshing) {
        toast({
          title: "Data Refreshed",
          description: "Admin list has been updated successfully.",
        })
      }
    } catch (error: any) {
      console.error("Error fetching admins:", error)
      setError(error?.message || "Failed to load admin users")

      const isTableNotExistError =
        error?.code === "42P01" ||
        safeIncludes(error?.message, "does not exist") ||
        safeIncludes(error?.details, "does not exist") ||
        safeIncludes(error?.hint, "does not exist")

      if (isTableNotExistError) {
        setIsTableExists(false)

        // If we haven't tried to initialize the table yet, do it automatically
        if (!tableInitialized) {
          await initializeAdminTable()
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load admin users. Please try again.",
        })
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // Check if we've already initialized the table
    const initialized = localStorage.getItem("adminTableInitialized") === "true"
    if (initialized) {
      setTableInitialized(true)
    }

    fetchAdmins()

    // Set up real-time subscription only if table exists
    if (isTableExists) {
      const subscription = supabase
        .channel("admins-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "admins" }, () => {
          fetchAdmins() // Refresh data when changes occur
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [isTableExists])

  const validateForm = () => {
    let isValid = true
    setPasswordError(null)
    setEmailError(null)

    // Validate email
    if (!newAdmin.email) {
      setEmailError("Email is required")
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(newAdmin.email)) {
      setEmailError("Please enter a valid email address")
      isValid = false
    }

    // Validate password
    if (!newAdmin.password) {
      setPasswordError("Password is required")
      isValid = false
    } else if (newAdmin.password.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
      isValid = false
    }

    return isValid
  }

  const handleAddAdmin = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Check if email already exists
      const { data: existingAdmin, error: checkError } = await supabase
        .from("admins")
        .select("id")
        .eq("email", newAdmin.email)
        .maybeSingle()

      if (checkError) throw checkError

      if (existingAdmin) {
        setEmailError("An admin with this email already exists")
        setIsLoading(false)
        return
      }

      // Insert the new admin
      const { error } = await supabase.from("admins").insert({
        email: newAdmin.email,
        role: newAdmin.role,
        password_hash: newAdmin.password, // In production, this should be properly hashed
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      // Close the dialog and reset the form
      setIsAddDialogOpen(false)
      setNewAdmin({
        email: "",
        password: "",
        role: "admin",
      })

      // Refresh the admin list
      fetchAdmins()

      toast({
        title: "Admin Added",
        description: `Admin ${newAdmin.email} has been added successfully.`,
      })

      // Log the admin creation
      try {
        await supabase.from("admin_logs").insert({
          admin_id: "system",
          action: "admin_created",
          details: `New admin created: ${newAdmin.email} with role ${newAdmin.role}`,
          ip_address: "system",
          created_at: new Date().toISOString(),
        })
      } catch (logError) {
        console.error("Error logging admin creation:", logError)
        // Don't throw here, just log the error
      }
    } catch (error: any) {
      console.error("Error adding admin:", error)
      setError(error?.message || "Failed to add admin user")

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add admin user. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditAdmin = async () => {
    if (!adminToEdit) return

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from("admins")
        .update({
          role: editAdmin.role,
          updated_at: new Date().toISOString(),
        })
        .eq("id", adminToEdit.id)

      if (error) throw error

      // Close the dialog and reset the form
      setIsEditDialogOpen(false)
      setAdminToEdit(null)
      setEditAdmin({
        email: "",
        role: "",
      })

      // Refresh the admin list
      fetchAdmins()

      toast({
        title: "Admin Updated",
        description: `Admin ${editAdmin.email} has been updated successfully.`,
      })

      // Log the admin update
      try {
        await supabase.from("admin_logs").insert({
          admin_id: "system",
          action: "admin_updated",
          details: `Admin updated: ${editAdmin.email} with new role ${editAdmin.role}`,
          ip_address: "system",
          created_at: new Date().toISOString(),
        })
      } catch (logError) {
        console.error("Error logging admin update:", logError)
        // Don't throw here, just log the error
      }
    } catch (error: any) {
      console.error("Error updating admin:", error)
      setError(error?.message || "Failed to update admin user")

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update admin user. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from("admins").delete().eq("id", adminToDelete.id)

      if (error) throw error

      // Close dialog and refresh list
      setIsDeleteDialogOpen(false)
      setAdminToDelete(null)
      fetchAdmins()

      toast({
        title: "Admin Deleted",
        description: `Admin ${adminToDelete.email} has been deleted successfully.`,
      })

      // Log the admin deletion
      try {
        await supabase.from("admin_logs").insert({
          admin_id: "system",
          action: "admin_deleted",
          details: `Admin deleted: ${adminToDelete.email}`,
          ip_address: "system",
          created_at: new Date().toISOString(),
        })
      } catch (logError) {
        console.error("Error logging admin deletion:", logError)
        // Don't throw here, just log the error
      }
    } catch (error: any) {
      console.error("Error deleting admin:", error)
      setError(error?.message || "Failed to delete admin user")

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete admin user. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchAdmins()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
          <p className="text-muted-foreground">Manage administrator access to the system</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing || !isTableExists} className="h-10">
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} disabled={!isTableExists}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Admin
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Administrator Users</CardTitle>
          <CardDescription>Users with administrative access to the MediVault system</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !isTableExists ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Database className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Admin Table Not Found</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                The admin table does not exist in the database. Please initialize it to manage admin users.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={initializeAdminTable} disabled={isInitializing}>
                  {isInitializing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    "Initialize Admin Table"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowSqlDialog(true)}>
                  <Info className="mr-2 h-4 w-4" />
                  Show SQL Instructions
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.length > 0 ? (
                    admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{admin.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Shield
                              className={`h-4 w-4 mr-2 ${
                                admin.role === "superadmin" ? "text-primary" : "text-muted-foreground"
                              }`}
                            />
                            {admin.role === "superadmin" ? "Super Admin" : "Admin"}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAdminToEdit(admin)
                                setEditAdmin({
                                  email: admin.email,
                                  role: admin.role,
                                })
                                setIsEditDialogOpen(true)
                              }}
                              disabled={admin.email === "medivaultdigihealth@gmail.com"} // Prevent editing the main admin
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only md:not-sr-only md:ml-2">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAdminToDelete(admin)
                                setIsDeleteDialogOpen(true)
                              }}
                              disabled={admin.email === "medivaultdigihealth@gmail.com"} // Prevent deleting the main admin
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only md:not-sr-only md:ml-2">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No admin users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>Create a new administrator account with access to the admin dashboard</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                className={emailError ? "border-red-500" : ""}
              />
              {emailError && <p className="text-sm text-red-500">{emailError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                className={passwordError ? "border-red-500" : ""}
              />
              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newAdmin.role} onValueChange={(value) => setNewAdmin({ ...newAdmin, role: value })}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAdmin} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Admin"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>Update administrator role and permissions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" value={editAdmin.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editAdmin.role} onValueChange={(value) => setEditAdmin({ ...editAdmin, role: value })}>
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAdmin} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Admin Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this admin?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the admin account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAdmin}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* SQL Instructions Dialog */}
      <Dialog open={showSqlDialog} onOpenChange={setShowSqlDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Admin Table Manually</DialogTitle>
            <DialogDescription>
              Run the following SQL in your Supabase SQL Editor to create the admin table
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-sm">
              <pre>
                {`-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Insert default admin
INSERT INTO admins (email, password_hash, role, created_at, updated_at)
VALUES (
  'medivaultdigihealth@gmail.com',
  'Admin@2004',
  'superadmin',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Create admin_logs table if needed
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`}
              </pre>
            </div>
            <p className="text-sm text-muted-foreground">
              After running this SQL in your Supabase SQL Editor, click the "Refresh" button to see the admin users.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSqlDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setShowSqlDialog(false)
                handleRefresh()
              }}
            >
              Refresh Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
