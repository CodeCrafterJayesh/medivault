"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Download, Trash2, AlertCircle, Search, RefreshCw } from "lucide-react"

export default function DatabaseSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tables, setTables] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const fetchTables = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // This is a mock implementation since we can't directly query table metadata in this context
      // In a real implementation, you would use a server-side API to get this information

      const mockTables = [
        {
          name: "profiles",
          rowCount: 125,
          lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          schema: [
            { column: "id", type: "uuid", nullable: false },
            { column: "full_name", type: "varchar", nullable: false },
            { column: "phone_number", type: "varchar", nullable: true },
            { column: "date_of_birth", type: "date", nullable: true },
            { column: "gender", type: "varchar", nullable: true },
            { column: "address", type: "text", nullable: true },
            { column: "avatar_url", type: "text", nullable: true },
            { column: "created_at", type: "timestamp", nullable: false },
            { column: "updated_at", type: "timestamp", nullable: false },
          ],
        },
        {
          name: "medical_history",
          rowCount: 98,
          lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
          schema: [
            { column: "id", type: "uuid", nullable: false },
            { column: "user_id", type: "uuid", nullable: false },
            { column: "chronic_illnesses", type: "jsonb", nullable: true },
            { column: "previous_surgeries", type: "jsonb", nullable: true },
            { column: "allergies", type: "jsonb", nullable: true },
            { column: "current_medications", type: "jsonb", nullable: true },
            { column: "family_history", type: "jsonb", nullable: true },
            { column: "created_at", type: "timestamp", nullable: false },
            { column: "updated_at", type: "timestamp", nullable: false },
          ],
        },
        {
          name: "appointments",
          rowCount: 42,
          lastUpdated: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          schema: [
            { column: "id", type: "uuid", nullable: false },
            { column: "user_id", type: "uuid", nullable: false },
            { column: "title", type: "varchar", nullable: false },
            { column: "doctor_name", type: "varchar", nullable: true },
            { column: "location", type: "varchar", nullable: true },
            { column: "date", type: "timestamp", nullable: false },
            { column: "notes", type: "text", nullable: true },
            { column: "reminder_enabled", type: "boolean", nullable: true },
            { column: "created_at", type: "timestamp", nullable: false },
            { column: "updated_at", type: "timestamp", nullable: false },
          ],
        },
        {
          name: "emergency_contacts",
          rowCount: 78,
          lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
          schema: [
            { column: "id", type: "uuid", nullable: false },
            { column: "user_id", type: "uuid", nullable: false },
            { column: "full_name", type: "varchar", nullable: false },
            { column: "relationship", type: "varchar", nullable: false },
            { column: "phone_number", type: "varchar", nullable: false },
            { column: "alternate_number", type: "varchar", nullable: true },
            { column: "email", type: "varchar", nullable: true },
            { column: "address", type: "text", nullable: true },
            { column: "notes", type: "text", nullable: true },
            { column: "created_at", type: "timestamp", nullable: false },
            { column: "updated_at", type: "timestamp", nullable: false },
          ],
        },
        {
          name: "medical_reports",
          rowCount: 36,
          lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24 hours ago
          schema: [
            { column: "id", type: "uuid", nullable: false },
            { column: "user_id", type: "uuid", nullable: false },
            { column: "title", type: "varchar", nullable: false },
            { column: "file_url", type: "text", nullable: false },
            { column: "file_type", type: "varchar", nullable: false },
            { column: "date", type: "date", nullable: false },
            { column: "notes", type: "text", nullable: true },
            { column: "created_at", type: "timestamp", nullable: false },
            { column: "updated_at", type: "timestamp", nullable: false },
          ],
        },
      ]

      setTables(mockTables)
    } catch (error: any) {
      console.error("Error fetching tables:", error)
      setError(error.message || "Failed to load database tables")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [])

  const handleExportTable = (tableName: string) => {
    alert(`Exporting ${tableName} as CSV...`)
    // In a real implementation, this would trigger a server-side export
  }

  const handleDeleteTestData = (tableName: string) => {
    if (confirm(`Are you sure you want to delete all test data from ${tableName}?`)) {
      alert(`Deleting test data from ${tableName}...`)
      // In a real implementation, this would trigger a server-side deletion
    }
  }

  const filteredTables = tables.filter((table) => table.name.toLowerCase().includes(searchQuery.toLowerCase()))

  if (isLoading) {
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Database Settings</h1>
        <p className="text-muted-foreground">Manage your Supabase database tables and settings</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tables..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={fetchTables} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database Tables</CardTitle>
          <CardDescription>View and manage your Supabase database tables</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table Name</TableHead>
                <TableHead>Row Count</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTables.map((table) => (
                <TableRow key={table.name}>
                  <TableCell className="font-medium">{table.name}</TableCell>
                  <TableCell>{table.rowCount}</TableCell>
                  <TableCell>{new Date(table.lastUpdated).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleExportTable(table.name)}>
                        <Download className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:ml-2">Export</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteTestData(table.name)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:ml-2">Delete Test Data</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTables.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No tables found matching your search
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Table Schema</CardTitle>
          <CardDescription>Select a table to view its schema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredTables.map((table) => (
              <div key={`schema-${table.name}`} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">{table.name}</h3>
                  <Badge variant="outline">{table.rowCount} rows</Badge>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Column</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Nullable</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.schema.map((column: any) => (
                      <TableRow key={`${table.name}-${column.column}`}>
                        <TableCell className="font-medium">{column.column}</TableCell>
                        <TableCell>{column.type}</TableCell>
                        <TableCell>{column.nullable ? "Yes" : "No"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
