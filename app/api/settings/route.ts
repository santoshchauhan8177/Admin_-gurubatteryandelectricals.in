import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Setting from "@/models/Setting"
import { authMiddleware } from "@/lib/auth-middleware"

// GET - Get store settings
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    // Get the first (and only) settings document
    const settings = await Setting.findOne()

    // If no settings exist yet, return default empty settings
    if (!settings) {
      return NextResponse.json(null)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ message: "Error fetching settings" }, { status: 500 })
  }
}

// PUT - Update store settings
export async function PUT(req: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    const settingsData = await req.json()

    // Find existing settings or create new
    const settings = await Setting.findOne()

    if (settings) {
      // Update existing settings
      const updatedSettings = await Setting.findByIdAndUpdate(settings._id, settingsData, { new: true })
      return NextResponse.json(updatedSettings)
    } else {
      // Create new settings
      const newSettings = await Setting.create(settingsData)
      return NextResponse.json(newSettings)
    }
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ message: "Error updating settings" }, { status: 500 })
  }
}
