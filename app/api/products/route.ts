import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/models/Product"
import { uploadImage } from "@/lib/cloudinary"
import { authMiddleware } from "@/lib/auth-middleware"

// GET - Get all products with pagination and filtering
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const featured = searchParams.get("featured") || ""
    const active = searchParams.get("active") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (search) {
      query.$text = { $search: search }
    }

    if (category) {
      query.category = category
    }

    if (featured === "true") {
      query.featured = true
    }

    if (active === "true") {
      query.isActive = true
    } else if (active === "false") {
      query.isActive = false
    }

    // Build sort
    const sort: any = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    // Execute query
    const products = await Product.find(query).sort(sort).skip(skip).limit(limit).populate("category", "name")

    const total = await Product.countDocuments(query)

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ message: "Error fetching products" }, { status: 500 })
  }
}

// POST - Create a new product
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    const formData = await req.formData()

    // Extract product data
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const comparePrice = formData.get("comparePrice")
      ? Number.parseFloat(formData.get("comparePrice") as string)
      : undefined
    const category = formData.get("category") as string
    const inventory = Number.parseInt(formData.get("inventory") as string)
    const sku = formData.get("sku") as string
    const featured = formData.get("featured") === "true"
    const isActive = formData.get("isActive") === "true"

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Handle image uploads
    const imageFiles = formData.getAll("images") as File[]
    const imageUrls: string[] = []

    for (const file of imageFiles) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

      const imageUrl = await uploadImage(base64)
      imageUrls.push(imageUrl)
    }

    // Create product
    const product = await Product.create({
      name,
      slug,
      description,
      price,
      comparePrice,
      images: imageUrls,
      category,
      inventory,
      sku,
      featured,
      isActive,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ message: "Error creating product" }, { status: 500 })
  }
}
