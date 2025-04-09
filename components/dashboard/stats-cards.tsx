import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CreditCard,
  DollarSign,
  Package,
  Users,
} from "lucide-react"

export function StatsCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Revenue */}
      <Card className="border-l-[4px] border-emerald-500 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$45,231.89</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-emerald-600 flex items-center">
              <ArrowUpIcon className="mr-1 h-4 w-4" />
              +20.1%
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>

      {/* New Customers */}
      <Card className="border-l-[4px] border-blue-500 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Customers</CardTitle>
          <Users className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+2,350</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-blue-600 flex items-center">
              <ArrowUpIcon className="mr-1 h-4 w-4" />
              +18.2%
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>

      {/* Total Orders */}
      <Card className="border-l-[4px] border-purple-500 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Package className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+12,234</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-purple-600 flex items-center">
              <ArrowUpIcon className="mr-1 h-4 w-4" />
              +12.2%
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>

      {/* Refunded */}
      <Card className="border-l-[4px] border-rose-500 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Refunded</CardTitle>
          <CreditCard className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">-$6,078</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-rose-600 flex items-center">
              <ArrowDownIcon className="mr-1 h-4 w-4" />
              +4.1%
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
