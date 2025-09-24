"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"

export function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/luxury-perfume-bottle-in-ethereal-lighting-with-go.jpg"
          alt="Luxury perfume bottle in ethereal lighting with golden accents"
          fill
          className="object-cover"
          priority
          sizes="100vw"
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
          Sophisticated simplicity for the independent mind. Discover our exclusive collection of luxury fragrances and premium colognes, meticulously crafted with the finest ingredients from around the world. Each scent tells a unique story, designed for those who appreciate authentic elegance and timeless sophistication.
        </p>
        <div className="text-white/80 text-sm sm:text-base max-w-3xl mx-auto mb-6 sm:mb-8 space-y-2">
          <p>✨ Authentic designer perfumes from renowned brands</p>
          <p>🌍 Worldwide shipping with premium packaging</p>
          <p>💎 Exclusive limited edition collections</p>
          <p>🎁 Complimentary samples with every order</p>
        </div>
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
