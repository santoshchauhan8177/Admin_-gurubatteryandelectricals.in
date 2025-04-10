"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  Box,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  Users,
  MessageSquare,
  ImageIcon,
  TicketPercent,
  Star,
  UserCog,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  onCollapseChange?: (collapsed: boolean) => void
  defaultCollapsed?: boolean
}

export function AdminSidebar({
  className,
  onCollapseChange,
  defaultCollapsed = false
}: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  // Define sidebar widths
  const SIDEBAR_WIDTH = {
    COLLAPSED: "w-16",
    EXPANDED: "w-64"
  }

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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      localStorage.removeItem("token")
      toast({ title: "Logged out successfully" })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout failed",
        variant: "destructive",
      })
    }
  }

  const toggleCollapse = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)
    onCollapseChange?.(newCollapsed)
  }

  const routes = [
    { label: "Dashboard", icon: Home, href: "/dashboard", active: pathname === "/dashboard" },
    { label: "Products", icon: Package, href: "/dashboard/products", active: pathname.includes("/dashboard/products") },
    { label: "Categories", icon: Tag, href: "/dashboard/categories", active: pathname.includes("/dashboard/categories") },
    { label: "Orders", icon: ShoppingCart, href: "/dashboard/orders", active: pathname.includes("/dashboard/orders") },
    { label: "Customers", icon: Users, href: "/dashboard/users", active: pathname.includes("/dashboard/users") },
    { label: "Staff", icon: UserCog, href: "/dashboard/staff", active: pathname.includes("/dashboard/staff") },
    { label: "Reviews", icon: Star, href: "/dashboard/reviews", active: pathname.includes("/dashboard/reviews") },
    { label: "Coupons", icon: TicketPercent, href: "/dashboard/coupons", active: pathname.includes("/dashboard/coupons") },
    { label: "Media", icon: ImageIcon, href: "/dashboard/media", active: pathname.includes("/dashboard/media") },
    { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics", active: pathname.includes("/dashboard/analytics") },
    { label: "Contact", icon: MessageSquare, href: "/dashboard/contact", active: pathname.includes("/dashboard/contact") },
    { label: "Settings", icon: Settings, href: "/dashboard/settings", active: pathname.includes("/dashboard/settings") },
    { label: "Profile", icon: User, href: "/dashboard/profile", active: pathname.includes("/dashboard/profile") },
  ]

  return (
    <aside
      className={cn(
        "fixed inset-y-0 z-30 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out",
        collapsed ? SIDEBAR_WIDTH.COLLAPSED : SIDEBAR_WIDTH.EXPANDED,
        className
      )}
      aria-label="Admin sidebar"
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
          aria-label="Dashboard home"
        >
          <Box className="h-6 w-6 text-primary" />
          {!collapsed && (
            <span className="whitespace-nowrap">Guru battery Admin</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="h-8 w-8"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <TooltipProvider>
          <nav className="grid gap-1 px-2" aria-label="Main navigation">
            {routes.map((route) => (
              <Tooltip key={route.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant={route.active ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "w-full justify-start",
                      collapsed ? "h-10 w-10 justify-center p-0" : "px-3",
                      route.active && "bg-accent text-accent-foreground"
                    )}
                    asChild
                    aria-current={route.active ? "page" : undefined}
                  >
                    <Link href={route.href} aria-label={route.label}>
                      <route.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <span className="ml-2 truncate">{route.label}</span>
                      )}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="z-30">
                    {route.label}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </nav>
        </TooltipProvider>
      </ScrollArea>

     {/* User Info */}
<div className="border-t px-4 py-3">
  <div
    className={cn(
      "flex items-center gap-3 rounded-md",
      collapsed ? "justify-center" : "justify-start"
    )}
  >
    <Avatar className="h-9 w-9">
      <AvatarImage
        src={user?.avatar || "/placeholder-user.jpg"}
        alt="User avatar"
      />
      <AvatarFallback>
        {user?.name?.charAt(0).toUpperCase() || "A"}
      </AvatarFallback>
    </Avatar>
    {!collapsed && (
      <div className="overflow-hidden">
        <p className="truncate text-sm font-medium">{user?.name || "Admin User"}</p>
        <p className="truncate text-xs text-muted-foreground">{user?.email || "admin@example.com"}</p>
      </div>
    )}
  </div>
</div>


      {/* Logout Button */}
      <div className="border-t px-2 py-3">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className={cn(
                  "w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
                  collapsed ? "h-10 w-10 justify-center p-0" : "px-3"
                )}
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span className="ml-2 truncate">Logout</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                Logout
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  )
}