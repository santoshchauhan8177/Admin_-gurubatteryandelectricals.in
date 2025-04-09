import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Contact from "@/models/Contact"
import { authMiddleware } from "@/lib/auth-middleware"

// POST - Add a reply to a contact
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    const { reply } = await req.json()

    // Find existing contact
    const contact = await Contact.findById(params.id)
    if (!contact) {
      return NextResponse.json({ message: "Contact not found" }, { status: 404 })
    }

    // Update contact with reply
    const updatedContact = await Contact.findByIdAndUpdate(
      params.id,
      {
        reply,
        replyDate: new Date(),
        status: "replied",
      },
      { new: true },
    )

    return NextResponse.json(updatedContact)
  } catch (error) {
    console.error("Error adding reply to contact:", error)
    return NextResponse.json({ message: "Error adding reply to contact" }, { status: 500 })
  }
}
