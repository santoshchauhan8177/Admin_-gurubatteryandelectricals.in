import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Category from "@/models/Category"
import Product from "@/models/Product"
import { authMiddleware } from "@/lib/auth-middleware"
import { uploadImage } from "@/lib/cloudinary"

// GET - Get a single category by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const category = await Category.findById(params.id).populate("parent", "name")

    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ message: "Error fetching category" }, { status: 500 })
  }
}

// PUT - Update a category
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    const formData = await req.formData()

    // Extract category data
    const name = formData.get("name") as string
    const description = formData.get("description") as string | null
    const parent = formData.get("parent") as string | null
    const isActive = formData.get("isActive") === "true"

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Check if slug already exists (excluding this category)
    const existingCategory = await Category.findOne({ slug, _id: { $ne: params.id } })
    if (existingCategory) {
      return NextResponse.json({ message: "A category with this name already exists" }, { status: 400 })
    }

    // Find existing category
    const category = await Category.findById(params.id)
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 })
    }

    // Check if this category is being set as its own parent
    if (parent === params.id) {
      return NextResponse.json({ message: "A category cannot be its own parent" }, { status: 400 })
    }

    // Handle image upload
    let imageUrl = category.image
    const imageFile = formData.get("image") as File | null
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = `data:${imageFile.type};base64,${buffer.toString("base64")}`

      imageUrl = await uploadImage(base64)
    }

    // Update category
    const categoryData: any = {
      name,
      slug,
      isActive,
    }

    if (description) categoryData.description = description
    if (parent) categoryData.parent = parent
    if (imageUrl) categoryData.image = imageUrl
    if (!parent) categoryData.parent = undefined

    const updatedCategory = await Category.findByIdAndUpdate(params.id, categoryData, { new: true })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ message: "Error updating category" }, { status: 500 })
  }
}

// DELETE - Delete a category
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    // Check if category exists
    const category = await Category.findById(params.id)
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 })
    }

    // Check if category has child categories
    const childCategories = await Category.countDocuments({ parent: params.id })
    if (childCategories > 0) {
      return NextResponse.json(
        {
          message: "Cannot delete category with child categories. Please reassign or delete child categories first.",
        },
        { status: 400 },
      )
    }

    // Update products that use this category to have no category
    await Product.updateMany({ category: params.id }, { $unset: { category: "" } })

    // Delete the category
    await Category.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ message: "Error deleting category" }, { status: 500 })
  }
}
