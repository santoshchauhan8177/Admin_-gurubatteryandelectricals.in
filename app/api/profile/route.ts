import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { uploadImage } from "@/lib/cloudinary"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// PUT - Update user profile
export async function PUT(req: NextRequest) {
  try {
    // Get user ID from token
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId

    await connectDB()

    const formData = await req.formData()

    // Extract profile data
    const name = formData.get("name") as string
    const email = formData.get("email") as string

    // Check if email already exists (excluding this user)
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } })
      if (existingUser) {
        return NextResponse.json({ message: "User with this email already exists" }, { status: 400 })
      }
    }

    // Find existing user
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Handle avatar upload
    let avatarUrl = user.avatar
    const avatarFile = formData.get("avatar") as File | null
    if (avatarFile) {
      const arrayBuffer = await avatarFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = `data:${avatarFile.type};base64,${buffer.toString("base64")}`

      avatarUrl = await uploadImage(base64)
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        avatar: avatarUrl,
      },
      { new: true },
    ).select("-password")

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ message: "Error updating profile" }, { status: 500 })
  }
}
