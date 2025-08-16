"use client"

import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { useCartStore } from "../../../stores/cart-store";
import { useRouter } from "next/navigation";

export function CartSummary() {
  const { items, totalPrice, totalItems } = useCartStore();
  const router = useRouter();

  const subtotal = totalPrice;
  const shipping = subtotal > 50 ? 0 : 5; // Envío gratis para pedidos > $50
  const total = subtotal + shipping;
  const itemCount = totalItems;

  const handleCheckout = () => {
    if (items.length > 0) {
      router.push('/checkout');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen del Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Productos ({itemCount})</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Envío</span>
            <span>
              {shipping === 0 ? (
                <span className="text-green-600">Gratis</span>
              ) : (
                `$${shipping.toFixed(2)}`
              )}
            </span>
          </div>

          {subtotal > 0 && subtotal <= 50 && (
            <p className="text-sm text-muted-foreground">
              Agrega ${(50 - subtotal).toFixed(2)} más para envío gratis
            </p>
          )}
        </div>

        <Separator />

        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleCheckout}
          disabled={items.length === 0}
        >
          Proceder al Checkout
        </Button>

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Agrega productos para continuar
          </p>
        )}
      </CardContent>
    </Card>
  );
}