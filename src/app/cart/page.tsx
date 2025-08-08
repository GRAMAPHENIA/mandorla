import { LazyCartItems } from "../../components/lazy/LazyCartItems"
import { LazyCartSummary } from "../../components/lazy/LazyCartSummary"

export const metadata = {
  title: "Carrito de Compras - Panadería Mandorla",
  description: "Revisa tus productos seleccionados y procede al checkout.",
}

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tu Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <LazyCartItems />
        </div>

        <div className="lg:col-span-1">
          <LazyCartSummary />
        </div>
      </div>
    </div>
  )
}
