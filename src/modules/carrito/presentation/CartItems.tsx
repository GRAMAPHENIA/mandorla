"use client"

import Image from "next/image";
import { Minus, Plus, Trash2 } from "../../../lib/optimized-imports";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { useCartStore } from "../../../stores/cart-store";
import { CartItem } from "../domain/types";

export function CartItems() {
  const { items, updateQuantity, removeItem } = useCartStore();

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Tu carrito está vacío</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item: CartItem) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                width={80}
                height={80}
                className="rounded-md"
              />

              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-muted-foreground">
                  ${item.price.toFixed(2)} cada uno
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <span className="w-8 text-center">{item.quantity}</span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-right">
                <p className="font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}