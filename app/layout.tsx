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
  title: "ZAU Perfumes - Luxury Fragrances",
  description: "Sophisticated simplicity for the independent mind. Discover our curated collection of luxury perfumes.",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/api/favicon", sizes: "32x32", type: "image/png" }
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  manifest: "/site.webmanifest",
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
