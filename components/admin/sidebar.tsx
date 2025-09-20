"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Package, ShoppingCart, MessageSquare, FileText, Users, BarChart3, Settings } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: BarChart3 },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Users },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Blog Posts", href: "/admin/blog", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800">
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <h1 className="text-2xl font-playfair font-bold text-amber-400">ROSIA</h1>
        <span className="ml-2 text-sm text-gray-400">Admin</span>
      </div>

      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                      : "text-gray-300 hover:text-white hover:bg-gray-800",
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
