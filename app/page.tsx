import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CollectionsSection } from "@/components/collections-section"
import { FeaturedSection } from "@/components/featured-section"
import { DealsSection } from "@/components/deals-section"
import { BlogSection } from "@/components/blog-section"
import { ContactSection } from "@/components/contact-section"
import { NewsletterSection } from "@/components/newsletter-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <CollectionsSection />
      <FeaturedSection />
      <DealsSection />
      <BlogSection />
      <ContactSection />
      <NewsletterSection />
      <Footer />
    </main>
  )
}
