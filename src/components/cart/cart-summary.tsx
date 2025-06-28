"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../ui/button" 
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { useCartStore } from "../../stores/cart-store"
import { CartItem } from "@/types/cart"

export function CartSummary() {
  const { items, clearCart } = useCartStore()
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const subtotal = items.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0)
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const orderData = {
      customer: customerInfo,
      items: items,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      orderDate: new Date().toISOString(),
    }

    // Create email body
    const emailBody = `
Nuevo Pedido desde el Sitio Web de Panadería Mandorla

Información del Cliente:
Nombre: ${customerInfo.name}
Email: ${customerInfo.email}
Teléfono: ${customerInfo.phone}
Dirección: ${customerInfo.address}

Productos del Pedido:
${items.map((item: CartItem) => `- ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join("\n")}

Resumen del Pedido:
Subtotal: $${subtotal.toFixed(2)}
Impuestos: $${tax.toFixed(2)}
Total: $${total.toFixed(2)}

Notas del Cliente:
${customerInfo.notes || "Ninguna"}

Fecha del Pedido: ${new Date().toLocaleString()}
    `

    // Create mailto link
    const mailtoLink = `mailto:dicoratojuanpablo@gmail.com?subject=Nuevo Pedido - Panadería Mandorla&body=${encodeURIComponent(emailBody)}`

    // Open email client
    window.location.href = mailtoLink

    // Clear cart after successful submission
    setTimeout(() => {
      clearCart()
      setIsSubmitting(false)
      alert("¡Pedido enviado! Por favor revisa tu cliente de email para enviar el pedido.")
    }, 1000)
  }

  if (items.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen del Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Impuestos</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              required
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              required
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="address">Dirección de Entrega *</Label>
            <Textarea
              id="address"
              required
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notas Especiales</Label>
            <Textarea
              id="notes"
              placeholder="Cualquier solicitud especial o notas..."
              value={customerInfo.notes}
              onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Procesando..." : "Realizar Pedido"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
