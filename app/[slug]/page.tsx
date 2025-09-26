import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Sparkles, Heart, Shield, Award, Users, Leaf, Mail, Truck, RotateCcw, FileText, Cookie } from 'lucide-react'

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

  // Icon mapping for different page types
  const getPageIcon = (slug: string) => {
    const iconMap: { [key: string]: any } = {
      'about-us': Users,
      'our-story': Heart,
      'sustainability': Leaf,
      'press': Award,
      'help-center': Mail,
      'shipping-info': Truck,
      'returns': RotateCcw,
      'privacy-policy': Shield,
      'terms-conditions': FileText,
      'cookie-policy': Cookie,
    }
    return iconMap[slug] || Sparkles
  }

  const PageIcon = getPageIcon(params.slug)

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background">
      <Header />
      
      {/* Hero Section with Icon */}
      <section className="pt-24 pb-16 px-4 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-600/5"></div>
        <div className="absolute top-32 right-10 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-16 left-10 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
        
        <div className="container mx-auto max-w-5xl relative">
          <div className="text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl mb-8 shadow-lg shadow-amber-500/25">
              <PageIcon className="w-10 h-10 text-white" />
            </div>
            
            {/* Title */}
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6 bg-gradient-to-r from-foreground via-amber-600 to-foreground bg-clip-text text-transparent">
              {page.title}
            </h1>
            
            {/* Meta Description */}
            {page.metaDescription && (
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {page.metaDescription}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {/* Parse and structure the content into cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                // Simple HTML parsing to extract sections
                const content = page.content
                const sections = []
                
                // Split content by H2 headings
                const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi
                const parts = content.split(h2Regex)
                
                for (let i = 1; i < parts.length; i += 2) {
                  const title = parts[i].replace(/<[^>]*>/g, '').trim()
                  const contentAfterTitle = parts[i + 1] || ''
                  
                  // Extract first paragraph
                  const pMatch = contentAfterTitle.match(/<p[^>]*>(.*?)<\/p>/i)
                  const description = pMatch ? pMatch[1].replace(/<[^>]*>/g, '').trim() : ''
                  
                  // Extract list items
                  const listItems = []
                  const ulMatch = contentAfterTitle.match(/<ul[^>]*>(.*?)<\/ul>/is)
                  if (ulMatch) {
                    const liMatches = ulMatch[1].match(/<li[^>]*>(.*?)<\/li>/gi)
                    if (liMatches) {
                      listItems.push(...liMatches.map(li => li.replace(/<[^>]*>/g, '').trim()))
                    }
                  }
                  
                  sections.push({
                    title,
                    description,
                    listItems
                  })
                }
                
                // If no H2 sections found, create a single card with the content
                if (sections.length === 0) {
                  const pMatch = content.match(/<p[^>]*>(.*?)<\/p>/i)
                  const description = pMatch ? pMatch[1].replace(/<[^>]*>/g, '').trim() : content.replace(/<[^>]*>/g, '').trim()
                  
                  sections.push({
                    title: 'Information',
                    description: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
                    listItems: []
                  })
                }
                
                return sections.map((section, index) => (
                ))
              })()}
            </div>

          </div>
        </div>
      </section>

      {/* Decorative Bottom Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex justify-center space-x-8 opacity-30">
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse delay-300" />
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse delay-700" />
          </div>
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
