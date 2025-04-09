import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Since we're using JWT and storing the token in localStorage,
    // we don't need to do anything server-side for logout.
    // The client will remove the token from localStorage.

    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ message: "Error during logout" }, { status: 500 })
  }
}
