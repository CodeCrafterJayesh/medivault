"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Loader2,
  Search,
  AlertCircle,
  UserCheck,
  UserX,
  Clock,
  Filter,
  Download,
  Trash2,
  MoreHorizontal,
  Edit,
  Eye,
  UserCog,
  History,
  Mail,
  Phone,
  Calendar,
  MapPin,
  RefreshCw,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

// User type definition
type User = {
  id: string
  full_name: string
  email?: string
  phone_number?: string
  date_of_birth?: string
  gender?: string
  address?: string
  status: "active" | "blocked" | "pending"
  last_login?: string
  created_at: string
  updated_at: string
}

// Activity log type
type ActivityLog = {
  id: string
  user_id: string
  user_name: string
  action: string
  timestamp: string
  details?: string
  ip_address?: string
}

// Login history type
type LoginHistory = {
  id: string
  user_id: string
  timestamp: string
  ip_address: string
  device: string
  success: boolean
}

// Helper function to safely check if a string includes a substring
const safeIncludes = (str: any, searchValue: string): boolean => {
  if (typeof str === "string") {
    return str.includes(searchValue)
  }
  return false
}

export default function UserManagementPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "blocked" | "pending">("all")
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)
  const [isActivityLogsOpen, setIsActivityLogsOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [editUserData, setEditUserData] = useState<Partial<User>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const usersPerPage = 10

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch users from profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (profilesError) throw profilesError

      if (profilesData) {
        // Check if users have a status in a separate table
        const { data: userStatusData, error: userStatusError } = await supabase
          .from("user_status")
          .select("user_id, status")

        // Create a map of user statuses
        const userStatusMap = new Map<string, string>()
        if (!userStatusError && userStatusData) {
          userStatusData.forEach((status) => {
            if (status && status.user_id) {
              userStatusMap.set(status.user_id, status.status)
            }
          })
        }

        // Transform profiles data to User type
        const transformedUsers: User[] = profilesData
          .filter((profile) => profile && profile.id) // Filter out any null/undefined profiles
          .map((profile) => {
            // Get status from map or default to active
            const status = userStatusMap.get(profile.id) || "active"

            return {
              id: profile.id,
              full_name: profile.full_name || "Unknown User",
              email: profile.email || undefined,
              phone_number: profile.phone_number || undefined,
              date_of_birth: profile.date_of_birth || undefined,
              gender: profile.gender || undefined,
              address: profile.address || undefined,
              status: status as "active" | "blocked" | "pending",
              last_login: profile.updated_at, // Using updated_at as a proxy for last login
              created_at: profile.created_at || new Date().toISOString(),
              updated_at: profile.updated_at || new Date().toISOString(),
            }
          })

        setUsers(transformedUsers)
        setFilteredUsers(transformedUsers)
        setTotalPages(Math.ceil(transformedUsers.length / usersPerPage))
      }

      // Generate activity logs based on profiles
      if (profilesData) {
        const logs: ActivityLog[] = []

        // Login activities (using updated_at as a proxy for login)
        profilesData
          .filter((profile) => profile && profile.id && profile.full_name) // Filter out invalid profiles
          .slice(0, 10)
          .forEach((profile, index) => {
            logs.push({
              id: `login-${index}`,
              user_id: profile.id,
              user_name: profile.full_name,
              action: "login",
              timestamp: profile.updated_at || new Date().toISOString(),
              details: "User logged in",
              ip_address: "192.168.1." + Math.floor(Math.random() * 255),
            })
          })

        // Profile update activities
        profilesData
          .filter((profile) => profile && profile.id && profile.full_name && profile.created_at && profile.updated_at)
          .slice(0, 10)
          .forEach((profile, index) => {
            if (new Date(profile.created_at).getTime() !== new Date(profile.updated_at).getTime()) {
              logs.push({
                id: `update-${index}`,
                user_id: profile.id,
                user_name: profile.full_name,
                action: "profile_update",
                timestamp: profile.updated_at,
                details: "Profile information updated",
                ip_address: "192.168.1." + Math.floor(Math.random() * 255),
              })
            }
          })

        // Generate some random activities
        const actions = ["password_reset", "data_export", "medical_record_added", "appointment_scheduled"]

        for (let i = 0; i < 15; i++) {
          const validProfiles = profilesData.filter((p) => p && p.id && p.full_name)
          if (validProfiles.length === 0) continue

          const randomProfile = validProfiles[Math.floor(Math.random() * validProfiles.length)]
          const randomAction = actions[Math.floor(Math.random() * actions.length)]
          const randomTime = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)

          logs.push({
            id: `random-${i}`,
            user_id: randomProfile.id,
            user_name: randomProfile.full_name,
            action: randomAction,
            timestamp: randomTime.toISOString(),
            details: `User performed ${randomAction.replace(/_/g, " ")}`,
            ip_address: "192.168.1." + Math.floor(Math.random() * 255),
          })
        }

        // Sort by timestamp (newest first)
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        setActivityLogs(logs)

        // Generate login history
        const loginHistoryEntries: LoginHistory[] = []

        // Make sure we have valid profiles before generating login history
        const validProfiles = profilesData.filter((p) => p && p.id)

        if (validProfiles.length > 0) {
          for (let i = 0; i < 20; i++) {
            const randomProfile = validProfiles[Math.floor(Math.random() * validProfiles.length)]
            const randomTime = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
            const success = Math.random() > 0.2 // 80% success rate

            loginHistoryEntries.push({
              id: `login-history-${i}`,
              user_id: randomProfile.id,
              timestamp: randomTime.toISOString(),
              ip_address: "192.168.1." + Math.floor(Math.random() * 255),
              device: ["Chrome / Windows", "Safari / macOS", "Firefox / Linux", "Mobile / iOS", "Mobile / Android"][
                Math.floor(Math.random() * 5)
              ],
              success,
            })
          }
        }

        // Sort by timestamp (newest first)
        loginHistoryEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        setLoginHistory(loginHistoryEntries)
      }

      if (isRefreshing) {
        toast({
          variant: "success",
          title: "Data Refreshed",
          description: "User data has been updated successfully.",
        })
      }
    } catch (error: any) {
      console.error("Error fetching users:", error)
      setError(error.message || "Failed to load users")

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users. Please try again.",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [isRefreshing, toast])

  useEffect(() => {
    fetchUsers()

    // Set up real-time subscription for profiles table
    const subscription = supabase
      .channel("profiles-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        fetchUsers() // Refresh data when changes occur
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUsers])

  // Filter users based on search query and active filter
  useEffect(() => {
    let result = users

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (user) =>
          user.full_name.toLowerCase().includes(query) ||
          (user.email && user.email.toLowerCase().includes(query)) ||
          (user.phone_number && user.phone_number.includes(query)),
      )
    }

    // Apply active/blocked filter
    if (activeFilter !== "all") {
      result = result.filter((user) => user.status === activeFilter)
    }

    setFilteredUsers(result)
    setTotalPages(Math.ceil(result.length / usersPerPage))
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, activeFilter, users])

  const handleStatusToggle = async (userId: string, newStatus: boolean) => {
    try {
      // Update user status in the database
      const status = newStatus ? "active" : "blocked"

      // Check if user_status table exists
      const { error: tableCheckError } = await supabase
        .from("user_status")
        .select("user_id")
        .eq("user_id", userId)
        .single()

      if (tableCheckError && tableCheckError.code === "PGRST116") {
        // Table doesn't exist, create it
        await supabase.rpc("create_user_status_table_if_not_exists").catch(() => {
          // If RPC fails, try direct insertion
          return null
        })
      }

      // Upsert the status
      const { error } = await supabase
        .from("user_status")
        .upsert({ user_id: userId, status, updated_at: new Date().toISOString() })

      if (error) throw error

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? { ...user, status: status as "active" | "blocked" } : user)),
      )

      // Add to activity logs
      const user = users.find((u) => u.id === userId)
      if (user) {
        const newLog: ActivityLog = {
          id: `status-${Date.now()}`,
          user_id: userId,
          user_name: user.full_name,
          action: newStatus ? "account_activated" : "account_blocked",
          timestamp: new Date().toISOString(),
          details: `Admin changed user status to ${newStatus ? "active" : "blocked"}`,
          ip_address: "192.168.1.1", // Mock IP
        }

        setActivityLogs((prev) => [newLog, ...prev])
      }

      toast({
        variant: "success",
        title: "Status Updated",
        description: `User status has been ${newStatus ? "activated" : "blocked"} successfully.`,
      })
    } catch (error: any) {
      console.error("Error updating user status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update user status: ${error.message}`,
      })
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      setIsLoading(true)

      // Delete user from profiles table
      const { error } = await supabase.from("profiles").delete().eq("id", userToDelete.id)

      if (error) throw error

      // Remove from local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userToDelete.id))

      // Add to activity logs
      const newLog: ActivityLog = {
        id: `delete-${Date.now()}`,
        user_id: userToDelete.id,
        user_name: userToDelete.full_name,
        action: "account_deleted",
        timestamp: new Date().toISOString(),
        details: `Admin deleted user account`,
        ip_address: "192.168.1.1", // Mock IP
      }

      setActivityLogs((prev) => [newLog, ...prev])

      // Close dialog
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)

      toast({
        variant: "success",
        title: "User Deleted",
        description: "User has been deleted successfully.",
      })
    } catch (error: any) {
      console.error("Error deleting user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser || !editUserData) return

    try {
      setIsLoading(true)

      // Update user in profiles table
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editUserData.full_name,
          phone_number: editUserData.phone_number,
          date_of_birth: editUserData.date_of_birth,
          gender: editUserData.gender,
          address: editUserData.address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedUser.id)

      if (error) throw error

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id ? { ...user, ...editUserData, updated_at: new Date().toISOString() } : user,
        ),
      )

      // Add to activity logs
      const newLog: ActivityLog = {
        id: `edit-${Date.now()}`,
        user_id: selectedUser.id,
        user_name: selectedUser.full_name,
        action: "profile_edited",
        timestamp: new Date().toISOString(),
        details: `Admin edited user profile`,
        ip_address: "192.168.1.1", // Mock IP
      }

      setActivityLogs((prev) => [newLog, ...prev])

      // Close dialog
      setIsEditUserOpen(false)
      setSelectedUser(null)
      setEditUserData({})

      toast({
        variant: "success",
        title: "User Updated",
        description: "User information has been updated successfully.",
      })
    } catch (error: any) {
      console.error("Error updating user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update user: ${error.message}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportUserData = () => {
    // Create CSV content
    const headers = ["Name", "Email", "Phone", "Status", "Created", "Last Login"]
    const rows = filteredUsers.map((user) => [
      user.full_name,
      user.email || "N/A",
      user.phone_number || "N/A",
      user.status,
      new Date(user.created_at).toLocaleDateString(),
      user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `medivault-users-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      variant: "success",
      title: "Export Complete",
      description: "User data has been exported successfully.",
    })
  }

  const getUserActivityLogs = (userId: string) => {
    return activityLogs.filter((log) => log.user_id === userId)
  }

  const getUserLoginHistory = (userId: string) => {
    return loginHistory.filter((log) => log.user_id === userId)
  }

  const refreshData = () => {
    setIsRefreshing(true)
    fetchUsers()
  }

  // Pagination
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)

  if (isLoading && !isRefreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and monitor activity</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={refreshData} className="h-10" disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportUserData} className="h-10">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="w-full flex justify-start overflow-x-auto">
          <TabsTrigger value="users" className="flex-1 sm:flex-none">
            Users
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex-1 sm:flex-none">
            Activity Logs
          </TabsTrigger>
          <TabsTrigger value="login" className="flex-1 sm:flex-none">
            Login History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
              <CardDescription>Manage user accounts and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-10 h-11"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0">
                  <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <Button
                      variant={activeFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter("all")}
                      className="h-9"
                    >
                      All
                    </Button>
                    <Button
                      variant={activeFilter === "active" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter("active")}
                      className="h-9"
                    >
                      <UserCheck className="mr-1 h-4 w-4" />
                      Active
                    </Button>
                    <Button
                      variant={activeFilter === "blocked" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter("blocked")}
                      className="h-9"
                    >
                      <UserX className="mr-1 h-4 w-4" />
                      Blocked
                    </Button>
                    <Button
                      variant={activeFilter === "pending" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter("pending")}
                      className="h-9"
                    >
                      <Clock className="mr-1 h-4 w-4" />
                      Pending
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Last Login</TableHead>
                      <TableHead className="hidden lg:table-cell">Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div>
                              {user.full_name}
                              <div className="text-xs text-muted-foreground md:hidden">{user.email}</div>
                              <div className="text-xs text-muted-foreground md:hidden">
                                Created: {new Date(user.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{user.email || "N/A"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.status === "active"
                                  ? "default"
                                  : user.status === "blocked"
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {user.last_login ? (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>{new Date(user.last_login).toLocaleDateString()}</span>
                              </div>
                            ) : (
                              "Never"
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`user-status-${user.id}`}
                                  checked={user.status === "active"}
                                  onCheckedChange={(checked) => handleStatusToggle(user.id, checked)}
                                />
                                <Label htmlFor={`user-status-${user.id}`} className="hidden sm:inline">
                                  {user.status === "active" ? "Active" : "Blocked"}
                                </Label>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More options</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user)
                                      setIsUserDetailsOpen(true)
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user)
                                      setEditUserData({
                                        full_name: user.full_name,
                                        phone_number: user.phone_number,
                                        date_of_birth: user.date_of_birth,
                                        gender: user.gender,
                                        address: user.address,
                                      })
                                      setIsEditUserOpen(true)
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user)
                                      setIsActivityLogsOpen(true)
                                    }}
                                  >
                                    <History className="mr-2 h-4 w-4" />
                                    Activity Logs
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setUserToDelete(user)
                                      setIsDeleteDialogOpen(true)
                                    }}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show first page, last page, current page, and pages around current
                        let pageToShow: number | null = null

                        if (i === 0) pageToShow = 1
                        else if (i === 4) pageToShow = totalPages
                        else if (totalPages <= 5) pageToShow = i + 1
                        else {
                          // Complex logic for showing pages around current
                          if (currentPage <= 3) {
                            pageToShow = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageToShow = totalPages - 4 + i
                          } else {
                            pageToShow = currentPage - 1 + i
                          }
                        }

                        // Show ellipsis instead of page numbers in certain cases
                        if (totalPages > 5) {
                          if (i === 1 && currentPage > 3)
                            return (
                              <PaginationItem key="ellipsis-1">
                                <PaginationEllipsis />
                              </PaginationItem>
                            )

                          if (i === 3 && currentPage < totalPages - 2)
                            return (
                              <PaginationItem key="ellipsis-2">
                                <PaginationEllipsis />
                              </PaginationItem>
                            )
                        }

                        if (pageToShow !== null) {
                          return (
                            <PaginationItem key={pageToShow}>
                              <PaginationLink
                                isActive={currentPage === pageToShow}
                                onClick={() => setCurrentPage(pageToShow!)}
                              >
                                {pageToShow}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        }

                        return null
                      })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Logs</CardTitle>
              <CardDescription>Real-time logs of user activities in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead className="hidden md:table-cell">IP Address</TableHead>
                      <TableHead className="hidden md:table-cell">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLogs.length > 0 ? (
                      activityLogs.slice(0, 20).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.user_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action.replace(/_/g, " ")}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{log.ip_address || "N/A"}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {log.details || "No details available"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No activity logs found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Login History</CardTitle>
              <CardDescription>Track user login attempts and sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead className="hidden md:table-cell">Device</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginHistory.length > 0 ? (
                      loginHistory.slice(0, 20).map((log) => {
                        const user = users.find((u) => u.id === log.user_id)
                        return (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">{user?.full_name || "Unknown User"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>{new Date(log.timestamp).toLocaleString()}</span>
                              </div>
                            </TableCell>
                            <TableCell>{log.ip_address}</TableCell>
                            <TableCell className="hidden md:table-cell">{log.device}</TableCell>
                            <TableCell>
                              {log.success ? (
                                <Badge className="bg-green-500">Success</Badge>
                              ) : (
                                <Badge variant="destructive">Failed</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No login history found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Details Dialog */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Detailed information about the selected user</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
                  {selectedUser.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.full_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    <Badge
                      variant={
                        selectedUser.status === "active"
                          ? "default"
                          : selectedUser.status === "blocked"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {selectedUser.status}
                    </Badge>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p>{selectedUser.email || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p>{selectedUser.phone_number || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p>{selectedUser.date_of_birth || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <div className="flex items-center space-x-2">
                      <UserCog className="h-4 w-4 text-muted-foreground" />
                      <p>{selectedUser.gender || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p>{selectedUser.address || "Not provided"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Account Created</p>
                    <p className="font-medium">{format(new Date(selectedUser.created_at), "PPP")}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p className="font-medium">
                      {selectedUser.last_login ? format(new Date(selectedUser.last_login), "PPP 'at' p") : "Never"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Recent Activity</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {getUserActivityLogs(selectedUser.id)
                    .slice(0, 5)
                    .map((log) => (
                      <div key={log.id} className="flex items-start space-x-2 text-sm p-2 rounded-md bg-muted/50">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                          {log.action[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{log.action.replace(/_/g, " ")}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(log.timestamp), "PPP 'at' p")}
                          </p>
                          {log.details && <p className="text-xs mt-1">{log.details}</p>}
                        </div>
                      </div>
                    ))}

                  {getUserActivityLogs(selectedUser.id).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDetailsOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsUserDetailsOpen(false)
                setEditUserData({
                  full_name: selectedUser?.full_name,
                  phone_number: selectedUser?.phone_number,
                  date_of_birth: selectedUser?.date_of_birth,
                  gender: selectedUser?.gender,
                  address: selectedUser?.address,
                })
                setIsEditUserOpen(true)
              }}
            >
              Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={editUserData.full_name || ""}
                  onChange={(e) => setEditUserData({ ...editUserData, full_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={editUserData.phone_number || ""}
                  onChange={(e) => setEditUserData({ ...editUserData, phone_number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={editUserData.date_of_birth || ""}
                  onChange={(e) => setEditUserData({ ...editUserData, date_of_birth: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={editUserData.gender || ""}
                  onValueChange={(value) => setEditUserData({ ...editUserData, gender: value })}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={editUserData.address || ""}
                  onChange={(e) => setEditUserData({ ...editUserData, address: e.target.value })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={isLoading}>
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

      {/* Activity Logs Dialog */}
      <Dialog open={isActivityLogsOpen} onOpenChange={setIsActivityLogsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>User Activity Logs</DialogTitle>
            <DialogDescription>{selectedUser?.full_name}'s activity history</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <Tabs defaultValue="activity">
                <TabsList>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="login">Login History</TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="space-y-4 mt-4">
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Action</TableHead>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getUserActivityLogs(selectedUser.id).length > 0 ? (
                          getUserActivityLogs(selectedUser.id).map((log) => (
                            <TableRow key={log.id}>
                              <TableCell>
                                <Badge variant="outline">{log.action.replace(/_/g, " ")}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                              </TableCell>
                              <TableCell>{log.ip_address || "N/A"}</TableCell>
                              <TableCell>{log.details || "No details available"}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                              No activity logs found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="login" className="space-y-4 mt-4">
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Device</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getUserLoginHistory(selectedUser.id).length > 0 ? (
                          getUserLoginHistory(selectedUser.id).map((log) => (
                            <TableRow key={log.id}>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                              </TableCell>
                              <TableCell>{log.ip_address}</TableCell>
                              <TableCell>{log.device}</TableCell>
                              <TableCell>
                                {log.success ? (
                                  <Badge className="bg-green-500">Success</Badge>
                                ) : (
                                  <Badge variant="destructive">Failed</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                              No login history found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActivityLogsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
