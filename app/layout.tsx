import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { CartProvider } from "@/lib/contexts/cart-context"
import { ToastProvider } from "@/lib/contexts/toast-context"
import { StructuredData } from "@/components/structured-data"
import "./globals.css"

// Font configuration with error handling
let playfair: any = null
let inter: any = null

try {
  const { Playfair_Display, Inter } = require("next/font/google")
  
  playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    display: "swap",
    fallback: ["serif"],
  })

  inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
    fallback: ["system-ui", "arial"],
  })
} catch (error) {
  console.warn("Failed to load Google Fonts, using fallback fonts:", error)
  // Create fallback font objects
  playfair = { variable: "--font-playfair" }
  inter = { variable: "--font-inter" }
}

export const metadata: Metadata = {
  title: "ZAU Perfumes - Luxury Fragrances Collection",
  description: "Discover ZAU Perfumes' exclusive collection of luxury fragrances and premium colognes. Sophisticated simplicity for the independent mind. Shop authentic designer perfumes.",
  alternates: {
    canonical: 'https://zauperfumes.com'
  },
  keywords: "luxury perfumes, designer fragrances, premium cologne, ZAU perfumes, authentic perfumes, luxury scents, exclusive fragrances",
  authors: [{ name: "ZAU Perfumes" }],
  creator: "ZAU Perfumes",
  publisher: "ZAU Perfumes",
  generator: "Next.js",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zauperfumes.com',
    title: 'ZAU Perfumes - Luxury Fragrances Collection',
    description: 'Discover ZAU Perfumes\' exclusive collection of luxury fragrances and premium colognes. Sophisticated simplicity for the independent mind.',
    siteName: 'ZAU Perfumes',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'ZAU Perfumes - Luxury Fragrances',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZAU Perfumes - Luxury Fragrances Collection',
    description: 'Discover ZAU Perfumes\' exclusive collection of luxury fragrances and premium colognes.',
    images: ['/logo.png'],
  },
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
      <head>
        <StructuredData />
      </head>
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
