"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the email to your newsletter service
    setIsSubscribed(true)
    setEmail("")
  }

  return (
    <section className="py-16 mandorla-gradient">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          Mantente Actualizado con <span className="mandorla-text-gradient">Mandorla</span>
        </h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Sé el primero en conocer nuevos sabores de galletas, especiales de temporada y ofertas exclusivas de nuestra
          panadería.
        </p>

        {isSubscribed ? (
          <div className="text-primary font-semibold">¡Gracias por suscribirte! 🍪</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Ingresa tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit">Suscribirse</Button>
          </form>
        )}
      </div>
    </section>
  )
}
