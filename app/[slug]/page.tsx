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
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 md:p-12 shadow-xl shadow-black/5 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/10 via-transparent to-amber-600/10"></div>
            </div>
            <div 
              className="prose prose-xl max-w-none relative z-10
                prose-headings:font-serif prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-12 prose-h1:first:mt-0 prose-h1:leading-tight prose-h1:bg-gradient-to-r prose-h1:from-foreground prose-h1:via-amber-600 prose-h1:to-foreground prose-h1:bg-clip-text prose-h1:text-transparent
                prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-10 prose-h2:text-amber-600 prose-h2:leading-tight prose-h2:border-b prose-h2:border-amber-600/20 prose-h2:pb-2 prose-h2:relative prose-h2:before:content-[''] prose-h2:before:absolute prose-h2:before:left-0 prose-h2:before:top-0 prose-h2:before:w-1 prose-h2:before:h-full prose-h2:before:bg-gradient-to-b prose-h2:before:from-amber-500 prose-h2:before:to-amber-600 prose-h2:before:rounded-full prose-h2:pl-4
                prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:text-amber-500 prose-h3:leading-tight prose-h3:font-semibold prose-h3:relative prose-h3:pl-3 prose-h3:before:content-[''] prose-h3:before:absolute prose-h3:before:left-0 prose-h3:before:top-1/2 prose-h3:before:transform prose-h3:before:-translate-y-1/2 prose-h3:before:w-2 prose-h3:before:h-2 prose-h3:before:bg-amber-500 prose-h3:before:rounded-full
                prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-6 prose-h4:text-amber-400 prose-h4:leading-tight prose-h4:font-medium
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-lg prose-p:mb-6 prose-p:font-light prose-p:tracking-wide prose-p:first-letter:text-4xl prose-p:first-letter:font-serif prose-p:first-letter:float-left prose-p:first-letter:mr-2 prose-p:first-letter:mt-1 prose-p:first-letter:text-amber-500
                prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline hover:prose-a:text-amber-500 prose-a:font-medium prose-a:transition-colors prose-a:relative prose-a:before:content-[''] prose-a:before:absolute prose-a:before:bottom-0 prose-a:before:left-0 prose-a:before:w-0 prose-a:before:h-0.5 prose-a:before:bg-amber-500 prose-a:before:transition-all prose-a:hover:before:w-full
                prose-strong:text-foreground prose-strong:font-semibold prose-strong:text-amber-100 prose-strong:relative prose-strong:px-1 prose-strong:py-0.5 prose-strong:bg-amber-500/10 prose-strong:rounded prose-strong:border prose-strong:border-amber-500/20
                prose-ul:text-muted-foreground prose-ul:space-y-3 prose-ul:my-6 prose-ul:relative
                prose-ol:text-muted-foreground prose-ol:space-y-3 prose-ol:my-6 prose-ol:relative
                prose-li:text-lg prose-li:leading-relaxed prose-li:font-light prose-li:tracking-wide prose-li:relative prose-li:pl-6 prose-li:before:content-[''] prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-2 prose-li:before:w-2 prose-li:before:h-2 prose-li:before:bg-gradient-to-br prose-li:before:from-amber-500 prose-li:before:to-amber-600 prose-li:before:rounded-full prose-li:before:shadow-sm
                prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-gradient-to-r prose-blockquote:from-amber-50/10 prose-blockquote:to-transparent prose-blockquote:rounded-r-lg prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:my-8 prose-blockquote:relative
                prose-blockquote:text-muted-foreground prose-blockquote:italic prose-blockquote:text-lg prose-blockquote:font-light prose-blockquote:leading-relaxed
                prose-code:bg-muted/80 prose-code:px-3 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:font-mono prose-code:text-amber-200 prose-code:border prose-code:border-amber-500/20 prose-code:shadow-sm
                prose-pre:bg-muted/80 prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-pre:p-6 prose-pre:overflow-x-auto prose-pre:shadow-lg
                prose-table:text-muted-foreground prose-table:border-collapse prose-table:my-8 prose-table:rounded-lg prose-table:overflow-hidden prose-table:shadow-lg
                prose-th:bg-muted/50 prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold prose-th:text-amber-200 prose-th:bg-gradient-to-r prose-th:from-amber-500/10 prose-th:to-amber-600/10
                prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-3 prose-td:text-muted-foreground prose-td:bg-card/30
                prose-hr:border-amber-500/30 prose-hr:my-12 prose-hr:relative prose-hr:before:content-[''] prose-hr:before:absolute prose-hr:before:top-1/2 prose-hr:before:left-1/2 prose-hr:before:transform prose-hr:before:-translate-x-1/2 prose-hr:before:-translate-y-1/2 prose-hr:before:w-8 prose-hr:before:h-8 prose-hr:before:bg-amber-500/20 prose-hr:before:rounded-full"
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
