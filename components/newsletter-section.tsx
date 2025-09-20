import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterSection() {
  return (
    <section className="py-20 px-4 bg-card">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">Join Our Rosia Circle</h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Be the first to discover new fragrances, exclusive offers, and insider stories from the world of luxury
            perfumery. Join our community of scent enthusiasts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-background border-border py-6"
            />
            <Button className="luxury-gradient text-black font-semibold px-8 py-6">Subscribe</Button>
          </div>

          <p className="text-sm text-muted-foreground mt-4">We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </div>
    </section>
  )
}
