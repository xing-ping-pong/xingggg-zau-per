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
          <div className="space-y-8">
            {/* Structured Content Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Information We Collect */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Information We Collect</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-light mb-4">
                  We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.
                </p>
                <div className="space-y-2">
                  <div className="text-muted-foreground text-sm font-light">• Personal Information</div>
                  <div className="text-muted-foreground text-sm font-light">• Usage Information</div>
                  <div className="text-muted-foreground text-sm font-light">• Device Information</div>
                </div>
              </div>

              {/* How We Use Your Information */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-3">How We Use Your Information</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-light mb-4">
                  We use the information we collect to provide, maintain, and improve our services.
                </p>
                <div className="space-y-2">
                  <div className="text-muted-foreground text-sm font-light">• Process and fulfill orders</div>
                  <div className="text-muted-foreground text-sm font-light">• Provide customer support</div>
                  <div className="text-muted-foreground text-sm font-light">• Send marketing communications</div>
                </div>
              </div>

              {/* Information Sharing */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Information Sharing</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-light mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.
                </p>
                <div className="space-y-2">
                  <div className="text-muted-foreground text-sm font-light">• Service providers</div>
                  <div className="text-muted-foreground text-sm font-light">• Legal requirements</div>
                  <div className="text-muted-foreground text-sm font-light">• Business transfers</div>
                </div>
              </div>

              {/* Data Security */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Data Security</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-light mb-4">
                  We implement appropriate security measures to protect your personal information against unauthorized access.
                </p>
                <div className="space-y-2">
                  <div className="text-muted-foreground text-sm font-light">• Encryption in transit</div>
                  <div className="text-muted-foreground text-sm font-light">• Secure data storage</div>
                  <div className="text-muted-foreground text-sm font-light">• Regular security audits</div>
                </div>
              </div>

              {/* Your Rights */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Your Rights</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-light mb-4">
                  You have certain rights regarding your personal information, including the right to access, update, or delete your data.
                </p>
                <div className="space-y-2">
                  <div className="text-muted-foreground text-sm font-light">• Access your data</div>
                  <div className="text-muted-foreground text-sm font-light">• Update your information</div>
                  <div className="text-muted-foreground text-sm font-light">• Delete your account</div>
                </div>
              </div>

              {/* Contact Us */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Contact Us</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-light mb-4">
                  If you have any questions about this privacy policy, please contact us.
                </p>
                <div className="space-y-2">
                  <div className="text-muted-foreground text-sm font-light">• Email: privacy@zauperfumes.com</div>
                  <div className="text-muted-foreground text-sm font-light">• Phone: +1 (555) 123-4567</div>
                  <div className="text-muted-foreground text-sm font-light">• Address: 123 Perfume St, NY</div>
                </div>
              </div>
            </div>

            {/* Fallback for content that doesn't fit the structured layout */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-8 shadow-lg">
              <div 
                className="prose prose-sm max-w-none
                  prose-headings:font-serif prose-headings:text-foreground prose-headings:font-semibold
                  prose-h2:text-lg prose-h2:mb-4 prose-h2:mt-6 prose-h2:first:mt-0
                  prose-h3:text-base prose-h3:mb-3 prose-h3:mt-4
                  prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-sm prose-p:mb-3 prose-p:font-light
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-ul:text-muted-foreground prose-ul:space-y-1 prose-ul:my-3
                  prose-li:text-sm prose-li:leading-relaxed prose-li:font-light
                  prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:bg-muted/10 prose-blockquote:rounded-r prose-blockquote:pl-3 prose-blockquote:py-2 prose-blockquote:my-3
                  prose-blockquote:text-muted-foreground prose-blockquote:italic prose-blockquote:text-sm prose-blockquote:font-light"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
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
