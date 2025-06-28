import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/images/logo.png" alt="Panadería Mandorla" width={32} height={32} className="h-8 w-auto" />
              <span className="font-bold text-lg mandorla-text-gradient">Mandorla</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Creando deliciosas galletas caseras y productos horneados artesanales con amor y tradición.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-primary">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary">
                  Acerca de Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-primary">
                  Carrito
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categorías</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products?category=cookies" className="hover:text-primary">
                  Galletas
                </Link>
              </li>
              <li>
                <Link href="/products?category=pastries" className="hover:text-primary">
                  Pasteles
                </Link>
              </li>
              <li>
                <Link href="/products?category=breads" className="hover:text-primary">
                  Panes
                </Link>
              </li>
              <li>
                <Link href="/products?category=seasonal" className="hover:text-primary">
                  Temporada
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Email: dicoratojuanpablo@gmail.com</p>
              <p>Hecho con ❤️ para los amantes de las galletas</p>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Panadería Mandorla. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
