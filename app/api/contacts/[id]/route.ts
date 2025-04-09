import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Contact from "@/models/Contact"
import { authMiddleware } from "@/lib/auth-middleware"

// GET - Get a single contact by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const contact = await Contact.findById(params.id)

    if (!contact) {
      return NextResponse.json({ message: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json(contact)
  } catch (error) {
    console.error("Error fetching contact:", error)
    return NextResponse.json({ message: "Error fetching contact" }, { status: 500 })
  }
}

// DELETE - Delete a contact
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    // Check if contact exists
    const contact = await Contact.findById(params.id)
    if (!contact) {
      return NextResponse.json({ message: "Contact not found" }, { status: 404 })
    }

    // Delete the contact
    await Contact.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Contact deleted successfully" })
  } catch (error) {
    console.error("Error deleting contact:", error)
    return NextResponse.json({ message: "Error deleting contact" }, { status: 500 })
  }
}
