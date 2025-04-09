import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Contact from "@/models/Contact"
import { authMiddleware } from "@/lib/auth-middleware"

// PATCH - Update contact status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    const { status } = await req.json()

    // Validate status
    const validStatuses = ["new", "read", "replied", "archived"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 })
    }

    // Find existing contact
    const contact = await Contact.findById(params.id)
    if (!contact) {
      return NextResponse.json({ message: "Contact not found" }, { status: 404 })
    }

    // Update contact status
    const updatedContact = await Contact.findByIdAndUpdate(params.id, { status }, { new: true })

    return NextResponse.json(updatedContact)
  } catch (error) {
    console.error("Error updating contact status:", error)
    return NextResponse.json({ message: "Error updating contact status" }, { status: 500 })
  }
}
