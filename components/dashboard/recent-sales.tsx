import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const sales = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    amount: "+$249.00",
    fallback: "JD",
  },
  {
    name: "Alice Smith",
    email: "alice.smith@example.com",
    amount: "+$349.00",
    fallback: "AS",
  },
  {
    name: "Robert Johnson",
    email: "robert.j@example.com",
    amount: "+$199.00",
    fallback: "RJ",
  },
  {
    name: "Emily Brown",
    email: "emily.brown@example.com",
    amount: "+$129.00",
    fallback: "EB",
  },
  {
    name: "William Davis",
    email: "william.d@example.com",
    amount: "+$89.00",
    fallback: "WD",
  },
]

export function RecentSales() {
  return (
    <Card className="p-4 space-y-4 rounded-xl shadow-sm border border-border bg-background">
      {sales.map((sale, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center gap-4 transition-all duration-200 hover:bg-muted/30 px-2 py-2 rounded-md"
          )}
        >
          <Avatar className="h-10 w-10 border border-border shadow-sm">
            <AvatarImage src="/placeholder-user.jpg" alt={sale.name} />
            <AvatarFallback>{sale.fallback}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{sale.name}</p>
            <p className="text-sm text-muted-foreground">{sale.email}</p>
          </div>
          <div className="text-sm font-semibold text-primary">{sale.amount}</div>
        </div>
      ))}
    </Card>
  )
}
