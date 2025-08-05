import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { useState } from "react";
import emailjs from "@emailjs/browser";

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export function CheckoutForm() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validar datos del cliente
    if (!formData.name || !formData.phone) {
      setError("Por favor completa los campos obligatorios");
      setIsLoading(false);
      return;
    }

    const orderId = `ORD-${Date.now()}`;
    const orderTotal = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Crear el mensaje del pedido
    const orderItems = cart.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: (item.price * item.quantity).toFixed(2),
    }));

    try {
      // Enviar el correo usando EmailJS
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "",
        {
          to_email:
            process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "compras@tudominio.com",
          from_name: "Tienda Mandorla",
          order_id: orderId,
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: formData.address,
          customer_email: formData.email,
          customer_notes: formData.notes || "Sin notas adicionales",
          order_items: orderItems
            .map((item) => `${item.name} x${item.quantity} - $${item.total}`)
            .join("\n"),
          order_total: orderTotal.toFixed(2),
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ""
      );

      // Limpiar el carrito y redirigir
      clearCart();
      router.push(`/order-confirmation?orderId=${orderId}`);
    } catch (err) {
      console.error("Error al enviar el pedido:", err);
      setError(
        "Ocurrió un error al procesar tu pedido. Por favor, inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="name">Nombre completo *</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="Tu nombre completo"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="tucorreo@ejemplo.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Teléfono *</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          value={formData.phone}
          onChange={handleChange}
          placeholder="Tu número de teléfono"
        />
      </div>

      <div className="form-group">
        <label htmlFor="address">Dirección de entrega *</label>
        <input
          type="text"
          id="address"
          name="address"
          required
          value={formData.address}
          onChange={handleChange}
          placeholder="Tu dirección completa"
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notas adicionales (opcional)</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Instrucciones especiales para la entrega, etc."
        />
      </div>

      <button
        type="submit"
        className="checkout-button"
        disabled={isLoading || cart.length === 0}
      >
        {isLoading ? "Procesando..." : "Realizar pedido"}
      </button>
    </form>
  );
}
