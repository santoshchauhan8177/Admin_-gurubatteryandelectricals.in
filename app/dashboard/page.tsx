"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { LayoutDashboard, BarChart, FileText, Bell, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

import { useState } from "react"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { Overview } from "@/components/dashboard/overview"
import { StatsCards } from "@/components/dashboard/stats-cards"

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setRefreshKey(prev => prev + 1)
      setLoading(false)
    }, 1200) // Simulate network delay
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCcw
            className={`w-4 h-4 transition-transform ${
              loading ? "animate-spin" : ""
            }`}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key forces re-render only of this block */}
          <div key={refreshKey} className="space-y-4">
            <StatsCards />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                  <CardDescription>
                    View your store performance over the last 30 days.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>
                    You made 265 sales this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  You have 12 orders that need processing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentOrders />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="text-muted-foreground">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Coming Soon</CardTitle>
              <CardDescription>Stay tuned for advanced analytics!</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">This section will include sales trends, top products, conversion rates, and more.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="text-muted-foreground">
          <Card>
            <CardHeader>
              <CardTitle>Reports Section</CardTitle>
              <CardDescription>Generate and export detailed reports.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Customizable PDF/Excel reports will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="text-muted-foreground">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Recent alerts and updates.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">No new notifications at the moment.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
