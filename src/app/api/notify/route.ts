import { NextResponse } from "next/server";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type CustomerData = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type OrderData = {
  customer: CustomerData;
  items: OrderItem[];
  total: number;
  notes?: string;
};

export async function POST(request: Request) {
  try {
    const orderData: OrderData = await request.json();
    const orderId = `ORD-${Date.now()}`;

    // Validar que hay productos en el pedido
    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: "El pedido no contiene productos" },
        { status: 400 }
      );
    }

    // Validar datos del cliente
    if (
      !orderData.customer ||
      !orderData.customer.name ||
      !orderData.customer.phone
    ) {
      return NextResponse.json(
        { error: "Datos del cliente incompletos" },
        { status: 400 }
      );
    }

    // Mostrar el pedido en consola (solo para desarrollo)
    console.log("=== NUEVO PEDIDO ===");
    console.log("ID:", orderId);
    console.log("Cliente:", orderData.customer.name);
    console.log("Teléfono:", orderData.customer.phone);
    console.log("Dirección:", orderData.customer.address);
    console.log("Email:", orderData.customer.email);
    console.log("Productos:", orderData.items);
    console.log("Total:", orderData.total);
    if (orderData.notes) {
      console.log("Notas:", orderData.notes);
    }
    console.log("===================");

    return NextResponse.json({
      success: true,
      orderId,
      message: "Pedido registrado con éxito",
    });
  } catch (error) {
    console.error("Error al procesar el pedido:", error);
    return NextResponse.json(
      {
        error: "Error al procesar el pedido. Por favor, inténtalo de nuevo.",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
