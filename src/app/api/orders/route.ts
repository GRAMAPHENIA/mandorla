// src/app/api/orders/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const orderData = await request.json();

    // Validar los datos del pedido
    if (
      !orderData.customer ||
      !orderData.items ||
      orderData.items.length === 0
    ) {
      return NextResponse.json(
        { error: "Datos del pedido inválidos" },
        { status: 400 }
      );
    }

    // Generar un ID de pedido único
    const orderId = `ORD-${Date.now()}`;

    return NextResponse.json({
      success: true,
      orderId,
      message: "Pedido procesado exitosamente",
    });
  } catch (error) {
    console.error("Error al procesar el pedido:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
