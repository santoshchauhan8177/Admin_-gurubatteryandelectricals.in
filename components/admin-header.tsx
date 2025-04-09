"use client"

import { Bell, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function AdminHeader() {
  const router = useRouter()

  const [user, setUser] = useState<{ name: string; avatar?: string }>({
    name: "Admin User",
    avatar: "/uploads/admin-avatar.jpg",
  })

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  // Fetch logged-in user
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) throw new Error("Failed to fetch user data")
        setUser(await response.json())
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [])

  // Search logic
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim() === "") {
        setResults([])
        setShowDropdown(false)
        return
      }

      const fetchResults = async () => {
        try {
          const token = localStorage.getItem("token")
          const res = await fetch(`/api/search?q=${query}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          const data = await res.json()
          setResults(data)
          setShowDropdown(true)
        } catch (err) {
          console.error("Search error:", err)
        }
      }

      fetchResults()
    }, 500) // debounce

    return () => clearTimeout(delayDebounce)
  }, [query])

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* Sidebar Toggle for Mobile */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <AdminSidebar />
        </SheetContent>
      </Sheet>

      {/* Search Bar with Dropdown */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full pl-8"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {showDropdown && results.length > 0 && (
          <div className="absolute top-full z-10 w-full bg-white dark:bg-zinc-900 shadow-md rounded-md mt-1 overflow-hidden">
            {results.map((item, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                onClick={() => {
                  router.push(`/dashboard/view/${item._id}`)
                  setQuery("")
                  setShowDropdown(false)
                }}
              >
                {item.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <Button variant="outline" size="icon" className="ml-auto">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Notifications</span>
      </Button>

      {/* User Avatar & Name */}
      <div
        className="cursor-pointer flex items-center gap-2 rounded-md p-1 pl-2 pr-3 hover:bg-muted transition"
        onClick={() => router.push("/dashboard/profile")}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={user?.avatar || "/placeholder-user.jpg"}
            alt="User Avatar"
          />
          <AvatarFallback>
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </AvatarFallback>
        </Avatar>
        <span className="hidden md:inline text-sm font-medium">{user?.name}</span>
      </div>
    </header>
  )
}
