import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Contact from "@/models/Contact"

// GET - Get all contacts with pagination and filtering
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ]
    }

    if (status) {
      query.status = status
    }

    // Build sort
    const sort: any = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    // Execute query
    const contacts = await Contact.find(query).sort(sort).skip(skip).limit(limit)

    const total = await Contact.countDocuments(query)

    return NextResponse.json({
      contacts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json({ message: "Error fetching contacts" }, { status: 500 })
  }
}

// POST - Create a new contact (this would typically be called from the customer-facing site)
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const contactData = await req.json()

    // Create the contact
    const contact = await Contact.create(contactData)

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error("Error creating contact:", error)
    return NextResponse.json({ message: "Error creating contact" }, { status: 500 })
  }
}
