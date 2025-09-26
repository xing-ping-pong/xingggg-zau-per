import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface PageProps {
  params: { slug: string }
}

async function getPage(slug: string) {
  try {
    // Import the database connection and model directly for server-side rendering
    const connectDB = (await import('@/lib/mongodb')).default
    const Page = (await import('@/lib/models/page')).default
    
    await connectDB()
    
    const page = await Page.findOne({ slug, isActive: true })
    
    if (!page) {
      console.error(`Page not found: ${slug}`)
      return null
    }
    
    return page
  } catch (error) {
    console.error('Error fetching page:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await getPage(params.slug)
  
  if (!page) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.'
    }
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || `Learn more about ${page.title}`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://zauperfumes.com'}/${params.slug}`
    }
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const page = await getPage(params.slug)
  
  if (!page) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Page Header */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6 text-center">
            {page.title}
          </h1>
        </div>
      </section>

      {/* Page Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div 
            className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </section>

      <Footer />
    </main>
  )
}

// Generate static params for known pages
export async function generateStaticParams() {
  const knownPages = [
    'about-us',
    'our-story', 
    'sustainability',
    'press',
    'help-center',
    'shipping-info',
    'returns',
    'privacy-policy',
    'terms-conditions',
    'cookie-policy'
  ]

  return knownPages.map((slug) => ({
    slug,
  }))
}
