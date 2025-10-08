export const dynamic = "force-dynamic";
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Sparkles, Heart, Shield, Award, Users, Leaf, Mail, Truck, RotateCcw, FileText, Cookie, ExternalLink, ArrowRight } from 'lucide-react'

interface PageProps {
  params: { slug: string }
}

// FAQ Preview Component
function FAQPreview({ count = 3 }: { count?: number }) {
  const sampleFAQs = [
    {
      question: "Are your perfumes authentic?",
      answer: "Absolutely! We are an authorized retailer for all the brands we carry. Every product is 100% authentic and comes directly from the manufacturer or authorized distributors."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can also track your order by visiting our Track Your Order page."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days within the US. Express shipping takes 1-2 business days. International shipping varies by location."
    },
    {
      question: "What if I don't like my purchase?",
      answer: "We offer a 7-day exchange policy for unopened products. If you're not completely satisfied, you can exchange your purchase for a different product. Terms and conditions apply."
    },
    {
      question: "How should I store my fragrances?",
      answer: "Store your fragrances in a cool, dry place away from direct sunlight. Avoid storing them in the bathroom due to humidity and temperature fluctuations."
    }
  ]

  const displayedFAQs = sampleFAQs.slice(0, count)

  return (
    <div className="space-y-3">
      {displayedFAQs.map((faq, index) => (
        <div key={index} className="border-l-2 border-primary/30 pl-4 py-2">
          <h4 className="font-semibold text-sm text-foreground mb-1">{faq.question}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
        </div>
      ))}
      <div className="pt-2">
        <Link 
          href="/faq" 
          className="inline-flex items-center text-xs text-primary hover:text-primary/80 transition-colors font-medium"
        >
          View All FAQs <ArrowRight className="w-3 h-3 ml-1" />
        </Link>
      </div>
    </div>
  )
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
  // Next.js 15+ requires params to be awaited before using its properties
  const awaitedParams = await params;
  const metaPage = await getPage(awaitedParams.slug);
  if (!metaPage) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.'
    }
  }
  return {
    title: metaPage.metaTitle || metaPage.title,
    description: metaPage.metaDescription || `Learn more about ${metaPage.title}`,
    alternates: {
  canonical: `https://zauperfumes.com/${awaitedParams.slug}`
    }
  }
}

export default async function DynamicPage({ params }: PageProps) {
  // Next.js 15+ requires params to be awaited before using its properties
  const awaitedParams = await params;
  const page = await getPage(awaitedParams.slug);
  // ...existing code...
  // ...existing code...
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

  const PageIcon = getPageIcon(awaitedParams.slug)

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
                {page.metaDescription.replace(/30[- ]?day(s)?/gi, '7-day').replace(/zauperfumes@gmail.com|support@zauperfumes.com.pk/gi, 'zauperfumes@gmail.com').replace(/zauperfumes.com(?!\/)/gi, 'zauperfumes.com')}
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
                // Improved HTML parsing to always show the initial <h1> and intro <p>
                const content = page.content;
                const sections = [];
                // ...existing code...

                // Find the initial <h1> and its following <p>
                const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
                let introTitle = h1Match ? h1Match[1].replace(/<[^>]*>/g, '').trim() : '';
                // Find the first <p> after <h1>
                let introDescription = '';
                if (h1Match) {
                  // Get content after <h1>
                  const afterH1 = content.slice(content.indexOf(h1Match[0]) + h1Match[0].length);
                  const pMatch = afterH1.match(/<p[^>]*>(.*?)<\/p>/i);
                  introDescription = pMatch ? pMatch[1].replace(/<[^>]*>/g, '').trim() : '';
                }
                // If we have an intro, add it as the first section
                if (introTitle || introDescription) {
                  sections.push({
                    title: introTitle || 'Information',
                    description: introDescription.replace(/30[- ]?day(s)?/gi, '7-day').replace(/zauperfumes@gmail.com|support@zauperfumes.com.pk/gi, 'zauperfumes@gmail.com').replace(/zauperfumes.com(?!\/)/gi, 'zauperfumes.com'),
                    listItems: [],
                    buttons: [],
                    dynamicContent: []
                  });
                }

                // Split content by H2 and H3 headings
                const headingRegex = /<h[23][^>]*>(.*?)<\/h[23]>/gi;
                const parts = content.split(headingRegex);
                for (let i = 1; i < parts.length; i += 2) {
                  const title = parts[i].replace(/<[^>]*>/g, '').trim();
                  const contentAfterTitle = parts[i + 1] || '';
                  // Extract first paragraph
                  const pMatch = contentAfterTitle.match(/<p[^>]*>(.*?)<\/p>/i);
                  let description = pMatch ? pMatch[1].replace(/<[^>]*>/g, '').trim() : '';
                  description = description.replace(/30[- ]?day(s)?/gi, '7-day').replace(/zauperfumes@gmail.com|support@zauperfumes.com.pk/gi, 'zauperfumes@gmail.com').replace(/zauperfumes.com(?!\/)/gi, 'zauperfumes.com').replace(/delivery charges[^.]*\./gi, 'Delivery charges depend on your location.').replace(/tax[^.]*\./gi, '').replace(/tax/gi, '');
                  // Extract all list items (ul and ol)
                  const listItems: string[] = [];
                  // Extract <ul> lists
                  const ulMatches = contentAfterTitle.match(/<ul[^>]*>(.*?)<\/ul>/gi);
                  if (ulMatches) {
                    ulMatches.forEach((ul: string) => {
                      const liMatches = ul.match(/<li[^>]*>(.*?)<\/li>/gi);
                      if (liMatches) {
                        listItems.push(...liMatches.map((li: string) => li.replace(/<[^>]*>/g, '').trim()));
                      }
                    });
                  }
                  // Extract <ol> lists
                  const olMatches = contentAfterTitle.match(/<ol[^>]*>(.*?)<\/ol>/gi);
                  if (olMatches) {
                    olMatches.forEach((ol: string) => {
                      const liMatches = ol.match(/<li[^>]*>(.*?)<\/li>/gi);
                      if (liMatches) {
                        listItems.push(...liMatches.map((li: string) => li.replace(/<[^>]*>/g, '').trim()));
                      }
                    });
                  }
                  // Extract buttons and links
                  const buttons: { text: string; href: string }[] = [];
                  const buttonMatches = contentAfterTitle.match(/<button[^>]*>(.*?)<\/button>/gi);
                  if (buttonMatches) {
                    buttonMatches.forEach((button: string) => {
                      const hrefMatch = button.match(/href="([^\"]*)"/);
                      const textMatch = button.match(/>([^<]*)</);
                      if (hrefMatch && textMatch) {
                        buttons.push({
                          text: textMatch[1].trim(),
                          href: hrefMatch[1]
                        });
                      }
                    });
                  }
                  // Extract special dynamic content
                  const dynamicContent: any[] = [];
                  const faqMatch = contentAfterTitle.match(/<faq-preview[^>]*><\/faq-preview>/i);
                  if (faqMatch) {
                    dynamicContent.push({
                      type: 'faq-preview',
                      count: 3 // Show 3 FAQ items by default
                    });
                  }
                  const section: {
                    title: string;
                    description: string;
                    listItems: string[];
                    buttons: { text: string; href: string }[];
                    dynamicContent: any[];
                  } = {
                    title,
                    description,
                    listItems,
                    buttons,
                    dynamicContent
                  };
                  sections.push(section);
                }
                // ...existing code...
                // If no sections found, fallback to a single card
                if (sections.length === 0) {
                  const pMatch = content.match(/<p[^>]*>(.*?)<\/p>/i);
                  const description = pMatch ? pMatch[1].replace(/<[^>]*>/g, '').trim() : content.replace(/<[^>]*>/g, '').trim();
                  sections.push({
                    title: 'Information',
                    description: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
                    listItems: [],
                    buttons: [],
                    dynamicContent: []
                  });
                }
                return sections.map((section, index) => (
                  <div key={index} className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-3">{section.title}</h3>
                    {section.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed font-light mb-4">
                        {section.description}
                      </p>
                    )}
                    {section.listItems.length > 0 && (
                      <div className="space-y-2">
                        {section.listItems.map((item, itemIndex) => (
                          <div key={itemIndex} className="text-muted-foreground text-sm font-light">
                            • {item.replace(/30[- ]?day(s)?/gi, '7-day').replace(/zauperfumes@gmail.com|support@zauperfumes.com.pk/gi, 'zauperfumes@gmail.com').replace(/zauperfumes.com(?!\/)/gi, 'zauperfumes.com').replace(/delivery charges[^.]*\./gi, 'Delivery charges depend on your location.').replace(/tax[^.]*\./gi, '').replace(/tax/gi, '')}
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Render dynamic content */}
                    {section.dynamicContent.map((content, contentIndex) => (
                      <div key={contentIndex} className="mt-4">
                        {content.type === 'faq-preview' && (
                          <FAQPreview count={content.count} />
                        )}
                      </div>
                    ))}
                    {/* Render buttons */}
                    {section.buttons.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        {section.buttons.map((button, buttonIndex) => (
                          <Link
                            key={buttonIndex}
                            href={button.href}
                            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                          >
                            {button.text}
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ));
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
// export async function generateStaticParams() {
//   const knownPages = [
//     'about-us',
//     'our-story', 
//     'sustainability',
//     'press',
//     'help-center',
//     'shipping-info',
//     'returns',
//     'privacy-policy',
//     'terms-conditions',
//     'cookie-policy'
//   ]
//
//   return knownPages.map((slug) => ({
//     slug,
//   }))
// }
