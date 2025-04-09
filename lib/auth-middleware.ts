import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function authMiddleware(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    try {
      // Verify token
      jwt.verify(token, JWT_SECRET)

      // If verification succeeds, continue
      return NextResponse.json({ message: "Authorized" }, { status: 200 })
    } catch (error) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }
  } catch (error) {
    console.error("Auth middleware error:", error)
    return NextResponse.json({ message: "Authentication error" }, { status: 500 })
  }
}
