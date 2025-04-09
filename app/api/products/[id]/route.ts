import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/models/Product"
import { uploadImage } from "@/lib/cloudinary"
import { authMiddleware } from "@/lib/auth-middleware"

// GET - Get a single product by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const product = await Product.findById(params.id).populate("category", "name")

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ message: "Error fetching product" }, { status: 500 })
  }
}

// PUT - Update a product
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    // Find existing product
    const existingProduct = await Product.findById(params.id)

    if (!existingProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Handle image uploads
    const imageFiles = formData.getAll("newImages") as File[]
    let imageUrls = [...existingProduct.images]

    // Add new images
    for (const file of imageFiles) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

      const imageUrl = await uploadImage(base64)
      imageUrls.push(imageUrl)
    }

    // Remove images if specified
    const imagesToRemove = formData.get("removeImages") ? (formData.get("removeImages") as string).split(",") : []
    if (imagesToRemove.length > 0) {
      imageUrls = imageUrls.filter((url) => !imagesToRemove.includes(url))
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      {
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
      },
      { new: true },
    )

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ message: "Error updating product" }, { status: 500 })
  }
}

// DELETE - Delete a product
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    const product = await Product.findByIdAndDelete(params.id)

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ message: "Error deleting product" }, { status: 500 })
  }
}
