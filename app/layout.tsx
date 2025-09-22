import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { Suspense } from "react"
import { CartProvider } from "@/lib/contexts/cart-context"
import { ToastProvider } from "@/lib/contexts/toast-context"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ROSIA Perfumes - Luxury Fragrances",
  description: "Sophisticated simplicity for the independent mind. Discover our curated collection of luxury perfumes.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${playfair.variable} ${inter.variable} antialiased`}>
        <CartProvider>
          <ToastProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  )
}
