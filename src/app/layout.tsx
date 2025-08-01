import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Panadería Mandorla - Galletas Caseras y Productos Artesanales",
  description:
    "Descubre nuestras deliciosas galletas caseras y productos horneados artesanales. Hechos con amor y los mejores ingredientes para una experiencia auténtica de panadería.",
  keywords:
    "panadería, galletas, caseras, artesanales, productos horneados, mandorla",
  authors: [{ name: "Panadería Mandorla" }],
  openGraph: {
    title: "Panadería Mandorla - Galletas Caseras",
    description:
      "Deliciosas galletas caseras y productos horneados artesanales",
    type: "website",
    locale: "es_ES",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster
              position="top-center"
              toastOptions={{
                className: "font-sans",
                style: {
                  background: "hsl(var(--background))",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                },
              }}
            />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
