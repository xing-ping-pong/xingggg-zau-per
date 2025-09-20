import { Button } from "@/components/ui/button"

export function CollectionsSection() {
  return (
    <section id="collections" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Our Collections
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto text-pretty">
            Curated fragrances for every personality, crafted with the finest ingredients
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {/* Women's Collection */}
          <div className="group relative overflow-hidden rounded-2xl hover-lift">
            <div className="aspect-[4/5] sm:aspect-[4/5] relative">
              <img
                src="/elegant-woman-with-luxury-perfume-bottle-in-sophis.jpg"
                alt="Women's Perfume Collection"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">Women's Perfume</h3>
              <p className="text-white/80 mb-4 text-sm sm:text-base">
                Elegant and captivating fragrances for the modern woman
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-white text-white hover:bg-white hover:text-black transition-colors bg-transparent text-sm sm:text-base"
              >
                Shop Women's
              </Button>
            </div>
          </div>

          {/* Men's Collection */}
          <div className="group relative overflow-hidden rounded-2xl hover-lift">
            <div className="aspect-[4/5] sm:aspect-[4/5] relative">
              <img
                src="/sophisticated-man-with-luxury-cologne-bottle-in-mo.jpg"
                alt="Men's Perfume Collection"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">Men's Perfume</h3>
              <p className="text-white/80 mb-4 text-sm sm:text-base">
                Bold and refined scents for the distinguished gentleman
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-white text-white hover:bg-white hover:text-black transition-colors bg-transparent text-sm sm:text-base"
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
