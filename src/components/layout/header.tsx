"use client";

import Link from "next/link";
import {
  ShoppingCart,
  Heart as HeartIcon,
  Menu,
  Sun,
  Moon,
  X,
  Home,
  Cookie,
  Info,
  Mail,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetHeader,
} from "../ui/sheet";
import { useTheme } from "next-themes";
import { useCartStore } from "../../stores/cart-store";
import { useFavoritesStore } from "../../stores/favorites-store";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "../ui/logo";

export function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Obtener el estado del carrito y favoritos
  const cartItems = useCartStore((state) => state.items);
  const favoriteItems = useFavoritesStore((state) => state.items);

  // Calcular totales
  const cartItemsCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );
  const favoritesCount = favoriteItems.length;

  // Efecto para manejar el scroll y la hidratación
  useEffect(() => {
    setIsMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Evitar hidratación hasta que el componente esté montado en el cliente
  if (!isMounted) {
    return (
      <header className="h-16">{/* Placeholder mientras se carga */}</header>
    );
  }

  const navigation = [
    { name: "Inicio", href: "/", icon: <Home className="mr-2 h-5 w-5" /> },
    {
      name: "Productos",
      href: "/products",
      icon: <Cookie className="mr-2 h-5 w-5" />,
    },
    {
      name: "Acerca de",
      href: "/about",
      icon: <Info className="mr-2 h-5 w-5" />,
    },
    {
      name: "Contacto",
      href: "/contact",
      icon: <Mail className="mr-2 h-5 w-5" />,
    },
  ];

  return (
    <>
      <header
        className={`fixed m-2 md:mx-12 rounded-lg top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/90 backdrop-blur-md border-b border-border/40 shadow-sm"
            : "bg-background/80 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <Logo
                className="transition-transform duration-300 group-hover:rotate-6"
                width={32}
                height={32}
              />
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

            {/* Acciones - Solo se muestra en desktop */}
            <div className="hidden md:flex items-center space-x-2">
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
                  <HeartIcon className="h-5 w-5" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#D6BD98] text-[10px] font-medium text-[#1A3636] flex items-center justify-center">
                      {favoritesCount > 9 ? "9+" : favoritesCount}
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
                      {cartItemsCount > 9 ? "9+" : cartItemsCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>

            {/* Menú móvil - Solo botón de menú */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground/80 hover:text-foreground hover:bg-foreground/5"
                    aria-label="Menú"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[280px] sm:w-[350px] p-0 flex flex-col"
                >
                  <SheetHeader className="p-4 border-b border-border/40">
                    <div className="flex items-center">
                      <Logo width={20} height={20} className="mr-2" />
                      <SheetTitle className="sr-only">
                        Menú de navegación
                      </SheetTitle>
                    </div>
                  </SheetHeader>

                  {/* Navegación móvil */}
                  <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navigation.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));

                      return (
                        <SheetClose asChild key={item.name}>
                          <Link
                            href={item.href}
                            className={`flex items-center px-4 py-3 rounded-md text-sm font-medium ${
                              isActive
                                ? "bg-foreground/5 text-[#D6BD98]"
                                : "text-foreground/80 hover:bg-foreground/5"
                            }`}
                          >
                            {item.icon}
                            {item.name}
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </nav>

                  {/* Acciones móviles */}
                  <div className="p-4 border-t border-border/40 space-y-2">
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-sm font-medium">Tema</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setTheme(theme === "dark" ? "light" : "dark")
                        }
                        className="text-foreground/80"
                      >
                        {theme === "dark" ? (
                          <Sun className="h-4 w-4 mr-2" />
                        ) : (
                          <Moon className="h-4 w-4 mr-2" />
                        )}
                        {theme === "dark" ? "Claro" : "Oscuro"}
                      </Button>
                    </div>

                    <SheetClose asChild>
                      <Link href="/favorites">
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2"
                        >
                          <HeartIcon className="h-5 w-5" />
                          Favoritos
                          {favoritesCount > 0 && (
                            <span className="ml-auto bg-[#D6BD98] text-[#1A3636] text-xs font-medium px-2 py-0.5 rounded-full">
                              {favoritesCount}
                            </span>
                          )}
                        </Button>
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link href="/cart">
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2"
                        >
                          <ShoppingCart className="h-5 w-5" />
                          Carrito
                          {cartItemsCount > 0 && (
                            <span className="ml-auto bg-[#D6BD98] text-[#1A3636] text-xs font-medium px-2 py-0.5 rounded-full">
                              {cartItemsCount}
                            </span>
                          )}
                        </Button>
                      </Link>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      {/* Espacio para el header fijo */}
      <div className="h-16" />
    </>
  );
}
