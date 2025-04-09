import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Media from "@/models/Media"
import { authMiddleware } from "@/lib/auth-middleware"
import { deleteImage } from "@/lib/cloudinary"

// GET - Get a single media by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const media = await Media.findById(params.id)

    if (!media) {
      return NextResponse.json({ message: "Media not found" }, { status: 404 })
    }

    return NextResponse.json(media)
  } catch (error) {
    console.error("Error fetching media:", error)
    return NextResponse.json({ message: "Error fetching media" }, { status: 500 })
  }
}

// DELETE - Delete a media
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    // Check if media exists
    const media = await Media.findById(params.id)
    if (!media) {
      return NextResponse.json({ message: "Media not found" }, { status: 404 })
    }

    // Extract public ID from Cloudinary URL
    const urlParts = media.url.split("/")
    const publicIdWithExtension = urlParts[urlParts.length - 1]
    const publicId = `ecommerce/${publicIdWithExtension.split(".")[0]}`

    // Delete from Cloudinary
    try {
      await deleteImage(publicId)
    } catch (error) {
      console.error("Error deleting from Cloudinary:", error)
      // Continue with deletion from database even if Cloudinary deletion fails
    }

    // Delete from database
    await Media.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Media deleted successfully" })
  } catch (error) {
    console.error("Error deleting media:", error)
    return NextResponse.json({ message: "Error deleting media" }, { status: 500 })
  }
}
