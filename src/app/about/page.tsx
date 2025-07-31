import Image from "next/image";
import { Card, CardContent } from "../../components/ui/card";
import { Leaf, ChefHat, Heart } from "lucide-react";
import { SectionTitle } from "../../components/ui/section-title";


export const metadata = {
  title: "Acerca de Nosotros - Panadería Mandorla",
  description:
    "Conoce nuestra historia, valores y el equipo detrás de Panadería Mandorla. Descubre nuestra pasión por la repostería artesanal y los ingredientes naturales.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="container mx-auto px-2 py-8 mt-4 md:py-24">
        <SectionTitle
          title="Nuestra "
          gradientText="Historia"
          subtitle="Desde 1995, Panadería Mandorla ha sido sinónimo de tradición, calidad y sabor auténtico en cada galleta que horneamos."
          align="left"
          titleClassName="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight"
          subtitleClassName="text-lg md:text-xl text-muted-foreground max-w-3xl"
        />
      </div>

      {/* Main Story */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <Image
            src="/placeholder.svg?height=500&width=600"
            alt="Panadería Mandorla - Cocina tradicional"
            width={600}
            height={500}
            className="rounded-2xl shadow-lg"
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold">El Origen de Mandorla</h2>
          <p className="text-muted-foreground">
            Todo comenzó con una receta familiar transmitida de generación en
            generación. El nombre "Mandorla", que significa almendra en
            italiano, representa el corazón de nuestra filosofía: ingredientes
            puros, naturales y llenos de sabor.
          </p>
          <p className="text-muted-foreground">
            Nuestra fundadora, inspirada por las tradiciones culinarias de su
            abuela italiana, decidió compartir estas recetas únicas con el
            mundo. Cada galleta es horneada con amor, paciencia y los mejores
            ingredientes seleccionados cuidadosamente.
          </p>
          <p className="text-muted-foreground">
            Hoy, más de 25 años después, seguimos comprometidos con la misma
            calidad artesanal que nos caracterizó desde el primer día,
            combinando tradición con innovación para crear experiencias únicas
            de sabor.
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <SectionTitle
          title="Nuestros"
          gradientText="Valores"
          subtitle="Lo que nos define y guía en cada paso de nuestro proceso de elaboración"
          align="left"
          className="mb-12"
          titleClassName="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
          subtitleClassName="text-lg md:text-xl text-muted-foreground max-w-3xl"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardContent className="p-6 text-center h-full flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#677D6A]">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                Ingredientes Naturales
              </h3>
              <p className="text-muted-foreground">
                Utilizamos únicamente ingredientes 100% naturales, sin
                conservantes artificiales ni aditivos químicos.
              </p>
            </CardContent>
          </Card>

          <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardContent className="p-6 text-center h-full flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#677D6A]">
                <ChefHat className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                Elaboración Artesanal
              </h3>
              <p className="text-muted-foreground">
                Cada galleta es elaborada a mano siguiendo métodos tradicionales
                que garantizan calidad y sabor únicos.
              </p>
            </CardContent>
          </Card>

          <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardContent className="p-6 text-center h-full flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#677D6A]">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                Pasión por la Calidad
              </h3>
              <p className="text-muted-foreground">
                Nuestro compromiso es ofrecer productos de la más alta calidad
                que superen las expectativas de nuestros clientes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <SectionTitle
          title="Nuestro"
          gradientText="Equipo"
          subtitle="Nuestro equipo es el corazón de nuestra panadería, cada miembro contribuye a crear un producto excepcional."
          align="left"
          className="mb-12"
          titleClassName="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
          subtitleClassName="text-lg md:text-xl text-muted-foreground max-w-3xl"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Image
                src="/placeholder.svg?height=200&width=200"
                alt="María González - Fundadora"
                width={200}
                height={200}
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">María González</h3>
              <p className="text-primary font-medium mb-2">
                Fundadora y Maestra Panadera
              </p>
              <p className="text-sm text-muted-foreground">
                Con más de 30 años de experiencia, María es el alma de Mandorla
                y guardiana de nuestras recetas tradicionales.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Image
                src="/placeholder.svg?height=200&width=200"
                alt="Carlos Ruiz - Chef Pastelero"
                width={200}
                height={200}
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Carlos Ruiz</h3>
              <p className="text-primary font-medium mb-2">Chef Pastelero</p>
              <p className="text-sm text-muted-foreground">
                Especialista en repostería fina, Carlos aporta innovación y
                creatividad a nuestras recetas clásicas.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Image
                src="/placeholder.svg?height=200&width=200"
                alt="Ana López - Gerente de Calidad"
                width={200}
                height={200}
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Ana López</h3>
              <p className="text-primary font-medium mb-2">
                Gerente de Calidad
              </p>
              <p className="text-sm text-muted-foreground">
                Ana se asegura de que cada producto cumpla con nuestros
                estándares de excelencia antes de llegar a ti.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="bg-card rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-6">Nuestra Misión</h2>
        <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
          En Panadería Mandorla, nuestra misión es crear momentos especiales a
          través de galletas artesanales que conecten a las familias y
          despierten sonrisas. Nos comprometemos a mantener viva la tradición de
          la repostería casera, utilizando ingredientes de la más alta calidad y
          técnicas que han sido perfeccionadas a lo largo de generaciones.
        </p>
      </div>
    </div>
  );
}
