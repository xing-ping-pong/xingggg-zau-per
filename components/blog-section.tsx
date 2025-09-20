import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight } from "lucide-react"

const blogPosts = [
  {
    id: 1,
    title: "The Art of Layering Fragrances",
    excerpt:
      "Discover the secrets of creating your unique scent signature by masterfully layering different fragrances.",
    image: "/perfume-bottles-layering-artistic-arrangement.jpg",
    date: "March 15, 2024",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "Seasonal Scents: Spring Collection",
    excerpt: "Explore our curated selection of fresh, floral fragrances perfect for the blooming season.",
    image: "/spring-flowers-perfume-bottles-fresh-bright.jpg",
    date: "March 10, 2024",
    readTime: "3 min read",
  },
  {
    id: 3,
    title: "Behind the Scenes: Crafting Luxury",
    excerpt: "Take a journey into our atelier where master perfumers create each unique fragrance with passion.",
    image: "/perfume-laboratory-crafting-luxury-bottles-elegant.jpg",
    date: "March 5, 2024",
    readTime: "7 min read",
  },
]

export function BlogSection() {
  return (
    <section className="py-20 px-4 bg-card">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">The Art of Fragrance</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Insights, stories, and inspiration from the world of luxury perfumery
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="group hover-lift border-0 bg-background overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  {post.date}
                  <span className="mx-2">•</span>
                  {post.readTime}
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">{post.excerpt}</p>
                <Button variant="ghost" className="p-0 h-auto font-semibold text-primary hover:text-primary/80">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
