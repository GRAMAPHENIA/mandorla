import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden mandorla-gradient">
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 to-background/80" />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Texto y CTA */}
          <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-12">
              <span className="block text-7xl mb-3 mt-6">
                <span className="mandorla-text-gradient">Mandorla</span>
              </span>
              <span className="block text-3xl md:text-4xl lg:text-5xl font-medium">
              Bakery Cookies
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Descubre nuestra colección artesanal de galletas recién horneadas,
              elaboradas con recetas tradicionales y los mejores ingredientes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="px-8 h-12 text-base">
                <Link href="/products">Comprar Ahora</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="px-8 h-12 text-base"
              >
                <Link href="/about">Nuestra Historia</Link>
              </Button>
            </div>
          </div>

          {/* Imagen */}
          <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full max-w-2xl mx-auto">
            <Image
              src="/placeholder.svg?height=500&width=500"
              alt="Deliciosas galletas caseras"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Onda decorativa en la parte inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-background rounded-t-3xl" />
    </section>
  );
}
