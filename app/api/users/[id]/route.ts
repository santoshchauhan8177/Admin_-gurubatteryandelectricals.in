import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { authMiddleware } from "@/lib/auth-middleware"
import bcrypt from "bcryptjs"

// GET - Get a single user by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const user = await User.findById(params.id).select("-password")

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ message: "Error fetching user" }, { status: 500 })
  }
}

// PUT - Update a user
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    const userData = await req.json()

    // Check if email already exists (excluding this user)
    if (userData.email) {
      const existingUser = await User.findOne({ email: userData.email, _id: { $ne: params.id } })
      if (existingUser) {
        return NextResponse.json({ message: "User with this email already exists" }, { status: 400 })
      }
    }

    // Find existing user
    const user = await User.findById(params.id)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // If password is provided, hash it
    if (userData.password) {
      const salt = await bcrypt.genSalt(10)
      userData.password = await bcrypt.hash(userData.password, salt)
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(params.id, userData, { new: true }).select("-password")

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ message: "Error updating user" }, { status: 500 })
  }
}

// DELETE - Delete a user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    // Check if user exists
    const user = await User.findById(params.id)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Delete the user
    await User.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ message: "Error deleting user" }, { status: 500 })
  }
}
