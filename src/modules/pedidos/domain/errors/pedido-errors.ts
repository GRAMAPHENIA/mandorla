/**
 * Errores específicos del dominio de pedidos
 * Proyecto Mandorla - Panadería E-commerce
 */

export abstract class PedidoError extends Error {
  abstract readonly code: string;
  abstract readonly type: 'validation' | 'business' | 'not-found' | 'payment';

  constructor(message: string, public readonly context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      type: this.type,
      message: this.message,
      context: this.context,
      timestamp: new Date().toISOString(),
    };
  }
}

// Errores de validación
export class PedidoIdInvalidoError extends PedidoError {
  readonly code = 'PEDIDO_ID_INVALIDO';
  readonly type = 'validation' as const;

  constructor(pedidoId: string) {
    super(`ID de pedido inválido: ${pedidoId}`, { pedidoId });
  }
}

export class DatosClienteInvalidosError extends PedidoError {
  readonly code = 'DATOS_CLIENTE_INVALIDOS';
  readonly type = 'validation' as const;

  constructor(campo: string, valor?: any) {
    super(`Datos del cliente inválidos: ${campo}`, { campo, valor });
  }
}

export class ItemsPedidoInvalidosError extends PedidoError {
  readonly code = 'ITEMS_PEDIDO_INVALIDOS';
  readonly type = 'validation' as const;

  constructor(motivo: string, items?: any[]) {
    super(`Items del pedido inválidos: ${motivo}`, { motivo, cantidadItems: items?.length });
  }
}

export class DatosEntregaInvalidosError extends PedidoError {
  readonly code = 'DATOS_ENTREGA_INVALIDOS';
  readonly type = 'validation' as const;

  constructor(campo: string, valor?: any) {
    super(`Datos de entrega inválidos: ${campo}`, { campo, valor });
  }
}

export class CantidadInvalidaError extends PedidoError {
  readonly code = 'CANTIDAD_INVALIDA';
  readonly type = 'validation' as const;

  constructor(cantidad: number, productoId?: string) {
    super(`Cantidad inválida: ${cantidad}. Debe ser mayor a 0 y menor a 100`, {
      cantidad,
      productoId,
    });
  }
}

export class MontoInvalidoError extends PedidoError {
  readonly code = 'MONTO_INVALIDO';
  readonly type = 'validation' as const;

  constructor(monto: number, contexto?: string) {
    super(`Monto inválido: ${monto}. ${contexto || 'Debe ser mayor a 0'}`, {
      monto,
      contexto,
    });
  }
}

// Errores de negocio
export class EstadoPedidoInvalidoError extends PedidoError {
  readonly code = 'ESTADO_PEDIDO_INVALIDO';
  readonly type = 'business' as const;

  constructor(estadoActual: string, estadoDeseado: string, pedidoId?: string) {
    super(`No se puede cambiar el estado del pedido de ${estadoActual} a ${estadoDeseado}`, {
      estadoActual,
      estadoDeseado,
      pedidoId,
    });
  }
}

export class PedidoNoPuedeSerCanceladoError extends PedidoError {
  readonly code = 'PEDIDO_NO_PUEDE_SER_CANCELADO';
  readonly type = 'business' as const;

  constructor(pedidoId: string, estadoActual: string) {
    super(`El pedido ${pedidoId} no puede ser cancelado en estado ${estadoActual}`, {
      pedidoId,
      estadoActual,
    });
  }
}

export class PedidoYaFinalizadoError extends PedidoError {
  readonly code = 'PEDIDO_YA_FINALIZADO';
  readonly type = 'business' as const;

  constructor(pedidoId: string, estadoActual: string) {
    super(`El pedido ${pedidoId} ya está finalizado (${estadoActual}) y no puede ser modificado`, {
      pedidoId,
      estadoActual,
    });
  }
}

export class PagoNoConfiguradoError extends PedidoError {
  readonly code = 'PAGO_NO_CONFIGURADO';
  readonly type = 'business' as const;

  constructor(pedidoId: string) {
    super(`El pedido ${pedidoId} no tiene información de pago configurada`, { pedidoId });
  }
}

export class MetodoPagoInvalidoError extends PedidoError {
  readonly code = 'METODO_PAGO_INVALIDO';
  readonly type = 'business' as const;

  constructor(metodo: string, operacion: string) {
    super(`El método de pago ${metodo} no es válido para la operación ${operacion}`, {
      metodo,
      operacion,
    });
  }
}

export class ProductoNoEncontradoEnPedidoError extends PedidoError {
  readonly code = 'PRODUCTO_NO_ENCONTRADO_EN_PEDIDO';
  readonly type = 'business' as const;

  constructor(productoId: string, pedidoId: string) {
    super(`El producto ${productoId} no se encuentra en el pedido ${pedidoId}`, {
      productoId,
      pedidoId,
    });
  }
}

export class DeliveryDireccionRequeridaError extends PedidoError {
  readonly code = 'DELIVERY_DIRECCION_REQUERIDA';
  readonly type = 'business' as const;

  constructor(pedidoId: string) {
    super(`El pedido ${pedidoId} configurado para delivery requiere dirección de entrega`, {
      pedidoId,
      tipoEntrega: 'DELIVERY',
    });
  }
}

// Errores de búsqueda
export class PedidoNoEncontradoError extends PedidoError {
  readonly code = 'PEDIDO_NO_ENCONTRADO';
  readonly type = 'not-found' as const;

  constructor(pedidoId: string) {
    super(`Pedido con ID ${pedidoId} no encontrado`, { pedidoId });
  }
}

export class PedidosClienteNoEncontradosError extends PedidoError {
  readonly code = 'PEDIDOS_CLIENTE_NO_ENCONTRADOS';
  readonly type = 'not-found' as const;

  constructor(clienteId: string) {
    super(`No se encontraron pedidos para el cliente ${clienteId}`, { clienteId });
  }
}

// Errores de pago
export class PagoYaConfirmadoError extends PedidoError {
  readonly code = 'PAGO_YA_CONFIRMADO';
  readonly type = 'payment' as const;

  constructor(pedidoId: string, paymentId?: string) {
    super(`El pago del pedido ${pedidoId} ya fue confirmado`, { pedidoId, paymentId });
  }
}

export class PagoRechazadoError extends PedidoError {
  readonly code = 'PAGO_RECHAZADO';
  readonly type = 'payment' as const;

  constructor(pedidoId: string, motivo?: string, paymentId?: string) {
    super(`El pago del pedido ${pedidoId} fue rechazado${motivo ? `: ${motivo}` : ''}`, {
      pedidoId,
      motivo,
      paymentId,
    });
  }
}

export class ErrorMercadoPagoError extends PedidoError {
  readonly code = 'ERROR_MERCADO_PAGO';
  readonly type = 'payment' as const;

  constructor(mensaje: string, detalles?: any) {
    super(`Error de Mercado Pago: ${mensaje}`, { detalles });
  }
}

export class PreferenceIdInvalidoError extends PedidoError {
  readonly code = 'PREFERENCE_ID_INVALIDO';
  readonly type = 'payment' as const;

  constructor(preferenceId: string, pedidoId?: string) {
    super(`Preference ID inválido: ${preferenceId}`, { preferenceId, pedidoId });
  }
}

export class PaymentIdInvalidoError extends PedidoError {
  readonly code = 'PAYMENT_ID_INVALIDO';
  readonly type = 'payment' as const;

  constructor(paymentId: string, pedidoId?: string) {
    super(`Payment ID inválido: ${paymentId}`, { paymentId, pedidoId });
  }
}

export class MontoNoCoincideError extends PedidoError {
  readonly code = 'MONTO_NO_COINCIDE';
  readonly type = 'payment' as const;

  constructor(montoEsperado: number, montoRecibido: number, pedidoId?: string) {
    super(
      `El monto del pago (${montoRecibido}) no coincide con el total del pedido (${montoEsperado})`,
      { montoEsperado, montoRecibido, pedidoId }
    );
  }
}

// Errores de infraestructura
export class ErrorRepositorioPedidosError extends PedidoError {
  readonly code = 'ERROR_REPOSITORIO_PEDIDOS';
  readonly type = 'business' as const;

  constructor(operacion: string, error: string, pedidoId?: string) {
    super(`Error en repositorio de pedidos durante ${operacion}: ${error}`, {
      operacion,
      error,
      pedidoId,
    });
  }
}

export class ErrorServicioPagosError extends PedidoError {
  readonly code = 'ERROR_SERVICIO_PAGOS';
  readonly type = 'payment' as const;

  constructor(operacion: string, error: string, pedidoId?: string) {
    super(`Error en servicio de pagos durante ${operacion}: ${error}`, {
      operacion,
      error,
      pedidoId,
    });
  }
}

export class ErrorNotificacionError extends PedidoError {
  readonly code = 'ERROR_NOTIFICACION';
  readonly type = 'business' as const;

  constructor(tipo: string, destinatario: string, error: string) {
    super(`Error enviando notificación ${tipo} a ${destinatario}: ${error}`, {
      tipo,
      destinatario,
      error,
    });
  }
}
