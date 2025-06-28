import Link from "next/link"
import Image from "next/image"
import { Button } from "../ui/button"

export function HeroSection() {
  return (
    <section className="mandorla-gradient py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              <span className="mandorla-text-gradient">Galletas Caseras</span> Hechas con Amor
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Descubre nuestra colección artesanal de galletas recién horneadas, elaboradas con recetas tradicionales y
              los mejores ingredientes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/products">Comprar Ahora</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                <Link href="/about">Nuestra Historia</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <Image
              src="/placeholder.svg?height=500&width=500"
              alt="Deliciosas galletas caseras"
              width={500}
              height={500}
              className="rounded-2xl shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
