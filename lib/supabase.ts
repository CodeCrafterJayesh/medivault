import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ursyapftzcyopuoyowns.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyc3lhcGZ0emN5b3B1b3lvd25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NDc2OTUsImV4cCI6MjA2MTMyMzY5NX0.f2lGSVTTSP8bvB6Z0XaccqdpjPIjzEMEnGL114fPhok"

// Create a single supabase client for the browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
