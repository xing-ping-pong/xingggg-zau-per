import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, MessageSquare, FileText, Users, TrendingUp } from "lucide-react"

export default function AdminDashboard() {
  const stats = [
    { title: "Total Products", value: "24", icon: Package, change: "+2 this week" },
    { title: "Orders", value: "156", icon: ShoppingCart, change: "+12 today" },
    { title: "Messages", value: "8", icon: MessageSquare, change: "3 unread" },
    { title: "Blog Posts", value: "12", icon: FileText, change: "+1 this month" },
    { title: "Categories", value: "6", icon: Users, change: "All active" },
    { title: "Revenue", value: "$12,450", icon: TrendingUp, change: "+8% this month" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-playfair font-bold text-amber-400 mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Welcome to ROSIA Admin Panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-gray-900 border-gray-800 hover:border-amber-400/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-amber-400">Recent Orders</CardTitle>
            <CardDescription className="text-gray-400">Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: "#007", customer: "Ayesha", amount: "$69.50", status: "Pending" },
                { id: "#006", customer: "John Doe", amount: "$125.00", status: "Processing" },
                { id: "#005", customer: "Sarah Wilson", amount: "$89.99", status: "Shipped" },
              ].map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
                >
                  <div>
                    <p className="font-medium text-white">
                      {order.id} - {order.customer}
                    </p>
                    <p className="text-sm text-gray-400">{order.amount}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      order.status === "Pending"
                        ? "bg-yellow-900 text-yellow-300"
                        : order.status === "Processing"
                          ? "bg-blue-900 text-blue-300"
                          : "bg-green-900 text-green-300"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-amber-400">Recent Messages</CardTitle>
            <CardDescription className="text-gray-400">Customer inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Lays", email: "lays@gmail.com", message: "Lays", status: "Unread" },
                { name: "Ali Jan", email: "ali.mahesar04@gmail.com", message: "Testing.", status: "Replied" },
                { name: "jjaannn", email: "ali.jan.startitup@gmail.com", message: "hello world", status: "Read" },
              ].map((msg, index) => (
                <div key={index} className="py-2 border-b border-gray-800 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-white">{msg.name}</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        msg.status === "Unread"
                          ? "bg-red-900 text-red-300"
                          : msg.status === "Replied"
                            ? "bg-green-900 text-green-300"
                            : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{msg.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
