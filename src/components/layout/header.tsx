"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Menu, Sun, Moon, X } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "../ui/sheet";
import { useTheme } from "next-themes";
import { useCartStore } from "../../stores/cart-store";
import { useFavoritesStore } from "../../stores/favorites-store";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const favoriteItems = useFavoritesStore((state) => state.items);

  // Efecto para manejar el scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Agregar el event listener
    window.addEventListener("scroll", handleScroll);

    // Limpiar el event listener al desmontar
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const cartItemsCount = cartItems.reduce(
    (total: number, item: { quantity: number }) => total + item.quantity,
    0
  );

  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Productos", href: "/products" },
    { name: "Acerca de", href: "/about" },
    { name: "Contacto", href: "/contact" },
  ];

  return (
    <>
      {/* Header principal */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/90 backdrop-blur-md border-b border-border/40 shadow-sm"
            : "bg-background/80 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <div className="relative h-8 w-8 transition-transform duration-300 group-hover:rotate-6">
                <Image
                  src="/images/logo.png"
                  alt="Panadería Mandorla"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="ml-2 text-lg font-medium text-foreground/90">
                Mandorla
              </span>
            </Link>

            {/* Navegación desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                              ${
                                isActive
                                  ? "text-[#D6BD98]"
                                  : "text-foreground/80 hover:text-foreground"
                              }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Acciones */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-foreground/80 hover:text-foreground hover:bg-foreground/5"
                aria-label="Cambiar tema"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              <Link href="/favorites">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-foreground/80 hover:text-foreground hover:bg-foreground/5"
                  aria-label="Favoritos"
                >
                  <Heart className="h-5 w-5" />
                  {favoriteItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#D6BD98] text-[10px] font-medium text-[#1A3636] flex items-center justify-center">
                      {favoriteItems.length}
                    </span>
                  )}
                </Button>
              </Link>

              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-foreground/80 hover:text-foreground hover:bg-foreground/5"
                  aria-label="Carrito"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#D6BD98] text-[10px] font-medium text-[#1A3636] flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Menú móvil */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-foreground/80 hover:text-foreground hover:bg-foreground/5"
                    aria-label="Menú"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[280px] sm:w-[350px] p-0"
                >
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-border/40">
                      <div className="flex items-center justify-between">
                        <Link
                          href="/"
                          className="flex items-center"
                          onClick={() =>
                            document.dispatchEvent(
                              new KeyboardEvent("keydown", { key: "Escape" })
                            )
                          }
                        >
                          <div className="relative h-7 w-7 mr-2">
                            <Image
                              src="/images/logo.png"
                              alt="Panadería Mandorla"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span className="text-lg font-medium">Mandorla</span>
                        </Link>
                        <SheetClose asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </SheetClose>
                      </div>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                      {navigation.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          (item.href !== "/" && pathname.startsWith(item.href));

                        return (
                          <SheetClose asChild key={item.name}>
                            <Link
                              href={item.href}
                              className={`flex items-center h-12 px-4 rounded-lg transition-colors
                                        ${
                                          isActive
                                            ? "text-[#D6BD98]"
                                            : "text-foreground/80 hover:text-foreground hover:bg-foreground/5"
                                        }`}
                            >
                              {item.name}
                            </Link>
                          </SheetClose>
                        );
                      })}
                    </nav>

                    <div className="p-4 border-t border-border/40">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setTheme(theme === "dark" ? "light" : "dark")
                        }
                        className="w-full justify-start text-foreground/80 hover:text-foreground"
                      >
                        {theme === "dark" ? (
                          <Sun className="h-4 w-4 mr-2" />
                        ) : (
                          <Moon className="h-4 w-4 mr-2" />
                        )}
                        {theme === "dark" ? "Modo claro" : "Modo oscuro"}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Espacio reservado para el header */}
      <div className="h-16" />
    </>
  );
}
