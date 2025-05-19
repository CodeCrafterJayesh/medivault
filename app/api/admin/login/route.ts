import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Special case for demo admin
    if (email === "medivaultdigihealth@gmail.com" && password === "Admin@2004") {
      return NextResponse.json({
        id: "default-admin",
        email: "medivaultdigihealth@gmail.com",
        role: "superadmin",
      })
    }

    // Check if admins table exists
    const { error: tableCheckError } = await supabase.from("admins").select("id").limit(1)

    if (tableCheckError && tableCheckError.code === "PGRST116") {
      // Table doesn't exist, create it and add a default admin
      await supabase.rpc("create_admins_table_if_not_exists")

      // Create a default admin (for demo purposes)
      const defaultAdminEmail = "medivaultdigihealth@gmail.com"
      const defaultAdminPassword = "Admin@2004" // In a real app, use a secure password

      // Hash the password (simple hash for demo)
      const encoder = new TextEncoder()
      const data = encoder.encode(defaultAdminPassword)
      const hashBuffer = await crypto.subtle.digest("SHA-256", data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

      // Insert default admin
      await supabase.from("admins").insert({
        email: defaultAdminEmail,
        password_hash: hashHex,
        role: "superadmin",
        created_at: new Date().toISOString(),
      })

      // If the user is trying to log in with the default credentials, let them through
      if (email === defaultAdminEmail && password === defaultAdminPassword) {
        return NextResponse.json({
          id: "default-admin",
          email: defaultAdminEmail,
          role: "superadmin",
        })
      }
    }

    // Hash the provided password for comparison
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

    // Find the admin by email and password hash
    const { data: admin, error } = await supabase
      .from("admins")
      .select("id, email, role")
      .eq("email", email)
      .eq("password_hash", hashHex)
      .single()

    if (error || !admin) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check if user has admin role
    if (admin.role !== "admin" && admin.role !== "superadmin") {
      return NextResponse.json({ error: "You don't have admin privileges" }, { status: 403 })
    }

    // Log successful login
    await supabase
      .from("admin_logs")
      .insert({
        admin_id: admin.id,
        action: "login",
        details: "Admin login successful",
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        created_at: new Date().toISOString(),
      })
      .catch((err) => console.error("Failed to log admin login:", err))

    // Return admin data (without sensitive information)
    return NextResponse.json(admin)
  } catch (error: any) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
