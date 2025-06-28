import Image from "next/image"

export function AboutSection() {
  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Image
              src="/placeholder.svg?height=400&width=500"
              alt="Cocina de Panadería Mandorla"
              width={500}
              height={400}
              className="rounded-2xl shadow-lg"
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              La Historia de <span className="mandorla-text-gradient">Mandorla</span>
            </h2>
            <p className="text-muted-foreground">
              Nombrada por la palabra italiana para almendra, Panadería Mandorla representa el corazón y alma de la
              repostería tradicional. Nuestro viaje comenzó con una pasión simple: crear la galleta perfecta que une a
              las familias.
            </p>
            <p className="text-muted-foreground">
              Cada galleta es elaborada artesanalmente usando recetas tradicionales transmitidas a través de
              generaciones, combinadas con los mejores ingredientes de proveedores de confianza. Creemos que las grandes
              galletas se hacen con paciencia, amor y atención al detalle.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Ingredientes Naturales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">Diario</div>
                <div className="text-sm text-muted-foreground">Recién Horneado</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
