"use client"

import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/luxury-perfume-bottle-in-ethereal-lighting-with-go.jpg"
          alt="Luxury perfume bottle"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 text-balance">
          ZAU
          <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mt-2 text-primary">
            Perfumes
          </span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto text-pretty leading-relaxed">
          Sophisticated simplicity for the independent mind. Discover fragrances that tell your story.
        </p>
        <Button
          size="lg"
          className="luxury-gradient text-black font-semibold px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg hover:scale-105 transition-transform duration-300"
          onClick={() => document.getElementById("collections")?.scrollIntoView({ behavior: "smooth" })}
        >
          Explore the Collection
        </Button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-2 sm:h-3 bg-white/70 rounded-full mt-1 sm:mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  )
}
