"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Plus, Loader2, Activity, Heart, Moon, Footprints } from "lucide-react"
import { format, subDays } from "date-fns"
import { supabase } from "@/lib/supabase"

type HealthMetric = {
  id: string
  user_id: string
  metric_type: string
  value: number
  unit: string
  date: string
  notes: string | null
  created_at: string
}

type MetricConfig = {
  name: string
  color: string
  unit: string
  icon: React.ReactNode
  minValue: number
  maxValue: number
  step: number
}

const metricConfigs: Record<string, MetricConfig> = {
  blood_pressure: {
    name: "Blood Pressure",
    color: "#ef4444",
    unit: "mmHg",
    icon: <Activity className="h-5 w-5" />,
    minValue: 70,
    maxValue: 200,
    step: 1,
  },
  heart_rate: {
    name: "Heart Rate",
    color: "#ec4899",
    unit: "bpm",
    icon: <Heart className="h-5 w-5" />,
    minValue: 40,
    maxValue: 200,
    step: 1,
  },
  sleep: {
    name: "Sleep",
    color: "#8b5cf6",
    unit: "hours",
    icon: <Moon className="h-5 w-5" />,
    minValue: 0,
    maxValue: 12,
    step: 0.5,
  },
  steps: {
    name: "Steps",
    color: "#3b82f6",
    unit: "steps",
    icon: <Footprints className="h-5 w-5" />,
    minValue: 0,
    maxValue: 30000,
    step: 100,
  },
}

export default function HealthStatisticsPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState("blood_pressure")
  const [timeRange, setTimeRange] = useState("7days")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Form state
  const [metricType, setMetricType] = useState("blood_pressure")
  const [metricValue, setMetricValue] = useState("")
  const [metricDate, setMetricDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [metricNotes, setMetricNotes] = useState("")
  const [diastolicValue, setDiastolicValue] = useState("")

  useEffect(() => {
    fetchMetrics()
  }, [user])

  const fetchMetrics = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Create health_metrics table if it doesn't exist
      await ensureHealthMetricsTableExists()

      const { data, error } = await supabase
        .from("health_metrics")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (error) throw error

      setMetrics(data || [])
    } catch (error: any) {
      console.error("Error fetching health metrics:", error)
      setMessage({ type: "error", text: error.message || "Failed to load health metrics" })
    } finally {
      setIsLoading(false)
    }
  }

  const ensureHealthMetricsTableExists = async () => {
    try {
      // Check if the table exists by trying to select from it
      const { error } = await supabase.from("health_metrics").select("id").limit(1)

      if (error && error.code === "42P01") {
        // Table doesn't exist
        // Create the table using SQL
        const { error: createError } = await supabase.rpc("create_health_metrics_table")

        if (createError) {
          console.error("Error creating health_metrics table:", createError)
        }
      }
    } catch (error) {
      console.error("Error checking/creating health_metrics table:", error)
    }
  }

  const handleAddMetric = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  const saveMetric = async () => {
    if (!user) return

    // Validate input
    if (!metricValue || (metricType === "blood_pressure" && !diastolicValue)) {
      setMessage({ type: "error", text: "Please fill in all required fields" })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      let value = Number.parseFloat(metricValue)
      let notes = metricNotes

      // Special handling for blood pressure
      if (metricType === "blood_pressure") {
        notes = `${metricValue}/${diastolicValue} mmHg${metricNotes ? ` - ${metricNotes}` : ""}`
        value = Number.parseFloat(metricValue) // Systolic as the main value
      }

      const metricData = {
        user_id: user.id,
        metric_type: metricType,
        value: value,
        unit: metricConfigs[metricType].unit,
        date: metricDate,
        notes: notes || null,
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("health_metrics").insert(metricData).select()

      if (error) throw error

      if (data) {
        setMetrics([...data, ...metrics])
      }

      setMessage({ type: "success", text: "Health metric added successfully" })
      setIsAddDialogOpen(false)

      // Update active tab to match the newly added metric
      setActiveTab(metricType)
    } catch (error: any) {
      console.error("Error saving health metric:", error)
      setMessage({ type: "error", text: error.message || "Failed to add health metric" })
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setMetricType("blood_pressure")
    setMetricValue("")
    setDiastolicValue("")
    setMetricDate(new Date().toISOString().split("T")[0])
    setMetricNotes("")
  }

  const getFilteredMetrics = () => {
    // Filter by metric type
    let filtered = metrics.filter((m) => m.metric_type === activeTab)

    // Filter by time range
    const today = new Date()
    let startDate: Date

    switch (timeRange) {
      case "7days":
        startDate = subDays(today, 7)
        break
      case "30days":
        startDate = subDays(today, 30)
        break
      case "90days":
        startDate = subDays(today, 90)
        break
      default:
        startDate = subDays(today, 7)
    }

    filtered = filtered.filter((m) => new Date(m.date) >= startDate)

    // Sort by date ascending for charts
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const prepareChartData = (filteredMetrics: HealthMetric[]) => {
    return filteredMetrics.map((metric) => ({
      date: format(new Date(metric.date), "MMM d"),
      value: metric.value,
      // For blood pressure, extract diastolic from notes
      diastolic:
        metric.metric_type === "blood_pressure" && metric.notes
          ? Number.parseInt(metric.notes.split("/")[1])
          : undefined,
    }))
  }

  const getMetricAverage = (filteredMetrics: HealthMetric[]) => {
    if (filteredMetrics.length === 0) return 0
    const sum = filteredMetrics.reduce((acc, metric) => acc + metric.value, 0)
    return Math.round((sum / filteredMetrics.length) * 10) / 10
  }

  const getMetricMin = (filteredMetrics: HealthMetric[]) => {
    if (filteredMetrics.length === 0) return 0
    return Math.min(...filteredMetrics.map((m) => m.value))
  }

  const getMetricMax = (filteredMetrics: HealthMetric[]) => {
    if (filteredMetrics.length === 0) return 0
    return Math.max(...filteredMetrics.map((m) => m.value))
  }

  const renderChart = () => {
    const filteredMetrics = getFilteredMetrics()
    const chartData = prepareChartData(filteredMetrics)

    if (filteredMetrics.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No data available</h3>
          <p className="text-muted-foreground mb-4">
            You haven't recorded any {metricConfigs[activeTab].name.toLowerCase()} data for this time period.
          </p>
          <Button onClick={handleAddMetric}>
            <Plus className="mr-2 h-4 w-4" />
            Add {metricConfigs[activeTab].name} Data
          </Button>
        </div>
      )
    }

    if (activeTab === "blood_pressure") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" name="Systolic" stroke="#ef4444" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#f97316" />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    if (activeTab === "steps") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name={metricConfigs[activeTab].name} fill={metricConfigs[activeTab].color} />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            name={metricConfigs[activeTab].name}
            stroke={metricConfigs[activeTab].color}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Statistics</h1>
          <p className="text-muted-foreground">Track and visualize your health metrics over time</p>
        </div>
        <Button onClick={handleAddMetric}>
          <Plus className="mr-2 h-4 w-4" />
          Add Health Data
        </Button>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-6">
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="blood_pressure" className="space-y-4" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="blood_pressure">Blood Pressure</TabsTrigger>
            <TabsTrigger value="heart_rate">Heart Rate</TabsTrigger>
            <TabsTrigger value="sleep">Sleep</TabsTrigger>
            <TabsTrigger value="steps">Steps</TabsTrigger>
          </TabsList>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <TabsContent value="blood_pressure" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-red-500" />
                    Blood Pressure
                  </CardTitle>
                  <CardDescription>Track your systolic and diastolic blood pressure</CardDescription>
                </CardHeader>
                <CardContent>{renderChart()}</CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getMetricAverage(getFilteredMetrics())} {metricConfigs[activeTab].unit}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Minimum</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getMetricMin(getFilteredMetrics())} {metricConfigs[activeTab].unit}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Maximum</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getMetricMax(getFilteredMetrics())} {metricConfigs[activeTab].unit}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="heart_rate" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2 h-5 w-5 text-pink-500" />
                    Heart Rate
                  </CardTitle>
                  <CardDescription>Track your heart rate in beats per minute</CardDescription>
                </CardHeader>
                <CardContent>{renderChart()}</CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getMetricAverage(getFilteredMetrics())} {metricConfigs[activeTab].unit}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Minimum</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getMetricMin(getFilteredMetrics())} {metricConfigs[activeTab].unit}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Maximum</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getMetricMax(getFilteredMetrics())} {metricConfigs[activeTab].unit}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sleep" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Moon className="mr-2 h-5 w-5 text-purple-500" />
                    Sleep
                  </CardTitle>
                  <CardDescription>Track your sleep duration in hours</CardDescription>
                </CardHeader>
                <CardContent>{renderChart()}</CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getMetricAverage(getFilteredMetrics())} {metricConfigs[activeTab].unit}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Minimum</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getMetricMin(getFilteredMetrics())} {metricConfigs[activeTab].unit}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Maximum</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getMetricMax(getFilteredMetrics())} {metricConfigs[activeTab].unit}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="steps" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Footprints className="mr-2 h-5 w-5 text-blue-500" />
                    Steps
                  </CardTitle>
                  <CardDescription>Track your daily step count</CardDescription>
                </CardHeader>
                <CardContent>{renderChart()}</CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getMetricAverage(getFilteredMetrics())} {metricConfigs[activeTab].unit}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Minimum</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getMetricMin(getFilteredMetrics())} {metricConfigs[activeTab].unit}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Maximum</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getMetricMax(getFilteredMetrics())} {metricConfigs[activeTab].unit}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Add Health Metric Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Health Data</DialogTitle>
            <DialogDescription>Record a new health measurement to track your progress</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="metricType">Metric Type</Label>
              <Select value={metricType} onValueChange={setMetricType}>
                <SelectTrigger id="metricType">
                  <SelectValue placeholder="Select metric type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                  <SelectItem value="heart_rate">Heart Rate</SelectItem>
                  <SelectItem value="sleep">Sleep</SelectItem>
                  <SelectItem value="steps">Steps</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {metricType === "blood_pressure" ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systolic">Systolic (mmHg)</Label>
                  <Input
                    id="systolic"
                    type="number"
                    value={metricValue}
                    onChange={(e) => setMetricValue(e.target.value)}
                    min={metricConfigs[metricType].minValue}
                    max={metricConfigs[metricType].maxValue}
                    step={metricConfigs[metricType].step}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    value={diastolicValue}
                    onChange={(e) => setDiastolicValue(e.target.value)}
                    min={40}
                    max={120}
                    step={1}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="value">Value ({metricConfigs[metricType].unit})</Label>
                <Input
                  id="value"
                  type="number"
                  value={metricValue}
                  onChange={(e) => setMetricValue(e.target.value)}
                  min={metricConfigs[metricType].minValue}
                  max={metricConfigs[metricType].maxValue}
                  step={metricConfigs[metricType].step}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={metricDate} onChange={(e) => setMetricDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={metricNotes}
                onChange={(e) => setMetricNotes(e.target.value)}
                placeholder="Any additional information"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveMetric} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
