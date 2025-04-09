import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Media from "@/models/Media"
import { authMiddleware } from "@/lib/auth-middleware"
import { uploadImage } from "@/lib/cloudinary"

// POST - Upload media files
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (authResult.status !== 200) {
      return authResult
    }

    await connectDB()

    const formData = await req.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ message: "No files provided" }, { status: 400 })
    }

    const uploadedMedia = []

    for (const file of files) {
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

      // Upload to Cloudinary
      const imageUrl = await uploadImage(base64)

      // Create media record
      const media = await Media.create({
        url: imageUrl,
        filename: file.name,
        type: file.type,
        size: file.size,
      })

      uploadedMedia.push(media)
    }

    return NextResponse.json({ media: uploadedMedia }, { status: 201 })
  } catch (error) {
    console.error("Error uploading media:", error)
    return NextResponse.json({ message: "Error uploading media" }, { status: 500 })
  }
}
