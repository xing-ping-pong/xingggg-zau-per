import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Clock } from "lucide-react"

const deals = [
  {
    id: 1,
    name: "Enchanted Garden",
    price: 120,
    originalPrice: 160,
    discount: 25,
    image: "/luxury-perfume-bottle-garden-floral-elegant.jpg",
    timeLeft: "2 days left",
  },
  {
    id: 2,
    name: "Mystic Woods",
    price: 95,
    originalPrice: 135,
    discount: 30,
    image: "/luxury-perfume-bottle-woods-forest-green.jpg",
    timeLeft: "5 hours left",
  },
  {
    id: 3,
    name: "Crystal Essence",
    price: 175,
    originalPrice: 220,
    discount: 20,
    image: "/luxury-perfume-bottle-crystal-clear-modern.jpg",
    timeLeft: "1 day left",
  },
]

export function DealsSection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">Exclusive Offers</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Limited-time deals on our most beloved fragrances
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {deals.map((deal) => (
            <Card key={deal.id} className="group hover-lift border-0 bg-card overflow-hidden relative">
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">-{deal.discount}%</div>
              </div>
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={deal.image || "/placeholder.svg"}
                  alt={deal.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{deal.name}</h3>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl font-bold text-foreground">${deal.price}</span>
                  <span className="text-lg text-muted-foreground line-through">${deal.originalPrice}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Clock className="w-4 h-4 mr-1" />
                  {deal.timeLeft}
                </div>
                <Button className="w-full luxury-gradient text-black font-semibold">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
