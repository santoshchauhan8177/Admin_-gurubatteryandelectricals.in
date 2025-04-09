import multer from "multer"
import type { NextApiRequest } from "next"
import { NextResponse } from "next/server"

// Configure storage
const storage = multer.memoryStorage()

// Configure multer
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only image files are allowed!"))
    }
    cb(null, true)
  },
})

// Middleware to handle file uploads
export function uploadMiddleware(fieldName: string) {
  return async (req: NextApiRequest) => {
    try {
      const multerSingle = upload.single(fieldName)

      await new Promise<void>((resolve, reject) => {
        multerSingle(req as any, {} as any, (err: any) => {
          if (err) {
            reject(err)
          }
          resolve()
        })
      })

      return NextResponse.next()
    } catch (error) {
      console.error("Multer error:", error)
      return NextResponse.json({ error: "File upload failed" }, { status: 500 })
    }
  }
}

export default upload
