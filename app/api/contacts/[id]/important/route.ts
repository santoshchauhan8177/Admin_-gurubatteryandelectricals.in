import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Contact from "@/models/Contact"
import { authMiddleware } from "@/lib/auth-middleware"

// PATCH - Toggle contact importance
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    const { isImportant } = await req.json()

    // Find existing contact
    const contact = await Contact.findById(params.id)
    if (!contact) {
      return NextResponse.json({ message: "Contact not found" }, { status: 404 })
    }

    // Update contact importance
    const updatedContact = await Contact.findByIdAndUpdate(params.id, { isImportant }, { new: true })

    return NextResponse.json(updatedContact)
  } catch (error) {
    console.error("Error updating contact importance:", error)
    return NextResponse.json({ message: "Error updating contact importance" }, { status: 500 })
  }
}
