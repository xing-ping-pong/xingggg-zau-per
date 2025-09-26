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

export default async function DynamicPage({ params }: PageProps) {
  const page = await getPage(params.slug)
  
  if (!page) {
    notFound()
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
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 md:p-12 shadow-xl shadow-black/5 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/10 via-transparent to-amber-600/10"></div>
            </div>
            <div 
              className="prose prose-lg max-w-none relative z-10
                prose-headings:font-serif prose-headings:text-foreground prose-headings:font-semibold prose-headings:tracking-tight
                prose-h1:text-2xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:first:mt-0 prose-h1:leading-tight
                prose-h2:text-xl prose-h2:mb-4 prose-h2:mt-6 prose-h2:leading-tight prose-h2:font-semibold
                prose-h3:text-lg prose-h3:mb-3 prose-h3:mt-4 prose-h3:leading-tight prose-h3:font-semibold
                prose-h4:text-base prose-h4:mb-2 prose-h4:mt-3 prose-h4:leading-tight prose-h4:font-medium
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-base prose-p:mb-4 prose-p:font-light
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-a:transition-colors
                prose-strong:text-foreground prose-strong:font-semibold
                prose-ul:text-muted-foreground prose-ul:space-y-2 prose-ul:my-4
                prose-ol:text-muted-foreground prose-ol:space-y-2 prose-ol:my-4
                prose-li:text-base prose-li:leading-relaxed prose-li:font-light
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/20 prose-blockquote:rounded-r-lg prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:my-4
                prose-blockquote:text-muted-foreground prose-blockquote:italic prose-blockquote:text-base prose-blockquote:font-light prose-blockquote:leading-relaxed
                prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-foreground
                prose-pre:bg-muted prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-pre:p-4 prose-pre:overflow-x-auto
                prose-table:text-muted-foreground prose-table:border-collapse prose-table:my-6 prose-table:rounded-lg prose-table:overflow-hidden
                prose-th:bg-muted/50 prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-foreground
                prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2 prose-td:text-muted-foreground
                prose-hr:border-border prose-hr:my-8"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
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
