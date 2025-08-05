import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  MessageCircle,
  Home,
  ShoppingBag,
} from "lucide-react";
import { Button } from "../../components/ui/button";

export default function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams.orderId || "ORD-XXXXXX";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              ¡Pedido Recibido con Éxito!
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              Gracias por confiar en Mandorla. Tu pedido ha sido registrado con
              el número:
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-8 inline-block border border-gray-200">
              <p className="font-mono text-lg font-semibold text-gray-900">
                {orderId}
              </p>
            </div>

            <div className="space-y-6 mb-8 text-left max-w-md mx-auto">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Procesando tu pedido
                  </h3>
                  <p className="text-gray-600">
                    Estamos preparando tus productos con mucho cuidado.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0">
                  <MessageCircle className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">¿Tienes dudas?</h3>
                  <p className="text-gray-600">
                    Estamos aquí para ayudarte. Contáctanos por WhatsApp y con
                    gusto atenderemos tus consultas.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-[#D6BD98] hover:bg-[#c7af82] text-white transition-colors"
              >
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Volver al inicio
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href="/products" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Seguir comprando
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <p className="text-center text-sm text-gray-500">
            Te enviaremos actualizaciones sobre tu pedido por correo
            electrónico.
          </p>
        </div>
      </div>
    </div>
  );
}
