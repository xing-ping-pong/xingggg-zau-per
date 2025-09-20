import { Button } from "@/components/ui/button"

export function CollectionsSection() {
  return (
    <section id="collections" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">Our Collections</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Curated fragrances for every personality, crafted with the finest ingredients
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Women's Collection */}
          <div className="group relative overflow-hidden rounded-2xl hover-lift">
            <div className="aspect-[4/5] relative">
              <img
                src="/elegant-woman-with-luxury-perfume-bottle-in-sophis.jpg"
                alt="Women's Perfume Collection"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h3 className="font-serif text-3xl font-bold text-white mb-2">Women's Perfume</h3>
              <p className="text-white/80 mb-4">Elegant and captivating fragrances for the modern woman</p>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black transition-colors bg-transparent"
              >
                Shop Women's
              </Button>
            </div>
          </div>

          {/* Men's Collection */}
          <div className="group relative overflow-hidden rounded-2xl hover-lift">
            <div className="aspect-[4/5] relative">
              <img
                src="/sophisticated-man-with-luxury-cologne-bottle-in-mo.jpg"
                alt="Men's Perfume Collection"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h3 className="font-serif text-3xl font-bold text-white mb-2">Men's Perfume</h3>
              <p className="text-white/80 mb-4">Bold and refined scents for the distinguished gentleman</p>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black transition-colors bg-transparent"
              >
                Shop Men's
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
