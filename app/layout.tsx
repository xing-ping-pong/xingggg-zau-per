import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { CartProvider } from "@/lib/contexts/cart-context"
import { SettingsProvider } from "@/lib/contexts/settings-context"
import { ToastProvider } from "@/lib/contexts/toast-context"
import { StructuredData } from "@/components/structured-data"
import "./globals.css"

// Font configuration with error handling
import { Playfair_Display, Inter } from "next/font/google";
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap"
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

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
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{__html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-PGLSF4QK');
        `}} />
        <meta name="google-site-verification" content="nXivXieiXtJxZBXjbUhwTFNJyKzG0FHRCKL_lX2jsJk" />
        {/* Google Analytics gtag.js */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-Z15S3WB42T"></script>
        <script dangerouslySetInnerHTML={{__html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-Z15S3WB42T');
        `}} />
        {/* Additional Meta Tags for SEO and Social Sharing */}
        <meta name="author" content="ZAU Perfumes" />
        <meta name="theme-color" content="#6D28D9" />
        <meta name="description" content="Discover ZAU Perfumes' exclusive collection of luxury fragrances and premium colognes." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="ZAU Perfumes - Luxury Fragrances Collection" />
        <meta property="og:description" content="Sophisticated simplicity for the independent mind." />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content="https://zauperfumes.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ZAU Perfumes - Luxury Fragrances Collection" />
        <meta name="twitter:description" content="Discover ZAU Perfumes' exclusive collection of luxury fragrances and premium colognes." />
        <meta name="twitter:image" content="/logo.png" />
        <meta name="robots" content="index, follow" />
        <StructuredData />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
  <body className={`font-sans ${playfair.variable} ${inter.variable} antialiased`}>
    {/* Google Tag Manager (noscript) */}
    <noscript>
      <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PGLSF4QK" height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe>
    </noscript>
        <SettingsProvider>
          <CartProvider>
            <ToastProvider>
              <Suspense fallback={null}>{children}</Suspense>
            </ToastProvider>
          </CartProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
