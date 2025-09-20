import type React from "react"
import { Inter, Playfair_Display } from "next/font/google"
import { Sidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.variable} ${playfair.variable} min-h-screen bg-black text-white`}>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <AdminHeader />
          <main className="p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
