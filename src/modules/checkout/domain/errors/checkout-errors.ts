/**
 * Errores específicos del dominio de checkout
 */

export abstract class MandorlaError extends Error {
  abstract readonly code: string;
  abstract readonly type: 'validation' | 'business' | 'infrastructure' | 'not-found';
  abstract readonly statusCode: number;

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
      statusCode: this.statusCode,
      context: this.context,
      timestamp: new Date().toISOString(),
    };
  }
}

export class CheckoutError extends MandorlaError {
  readonly code = 'CHECKOUT_ERROR';
  readonly type = 'business' as const;
  readonly statusCode = 400;
}

export class CarritoVacioError extends CheckoutError {
  readonly code = 'CARRITO_VACIO';
  readonly type = 'validation' as const;
  readonly statusCode = 400;

  constructor(carritoId: string) {
    super(`El carrito ${carritoId} está vacío. Agrega productos antes de continuar`, { carritoId });
  }
}

export class PagoFallidoError extends CheckoutError {
  readonly code = 'PAGO_FALLIDO';
  readonly type = 'infrastructure' as const;
  readonly statusCode = 402;
}

export class DatosEntregaInvalidosError extends CheckoutError {
  readonly code = 'DATOS_ENTREGA_INVALIDOS';
  readonly type = 'validation' as const;
  readonly statusCode = 400;
}

export class CheckoutExpiradoError extends CheckoutError {
  readonly code = 'CHECKOUT_EXPIRADO';
  readonly type = 'business' as const;
  readonly statusCode = 410;

  constructor(checkoutId: string, fechaExpiracion: Date) {
    super(`La sesión de checkout ${checkoutId} ha expirado`, {
      checkoutId,
      fechaExpiracion: fechaExpiracion.toISOString(),
    });
  }
}

export class CheckoutYaConfirmadoError extends CheckoutError {
  readonly code = 'CHECKOUT_YA_CONFIRMADO';
  readonly type = 'business' as const;
  readonly statusCode = 409;

  constructor(checkoutId: string, transaccionId?: string) {
    super(`El checkout ${checkoutId} ya fue confirmado`, {
      checkoutId,
      transaccionId,
    });
  }
}

export class StockInsuficienteError extends CheckoutError {
  readonly code = 'STOCK_INSUFICIENTE';
  readonly type = 'business' as const;
  readonly statusCode = 409;

  constructor(
    productoId: string,
    cantidadSolicitada: number,
    stockDisponible: number,
    context?: Record<string, any>
  ) {
    super(
      `Stock insuficiente para el producto ${productoId}. Solicitado: ${cantidadSolicitada}, Disponible: ${stockDisponible}`,
      {
        productoId,
        cantidadSolicitada,
        stockDisponible,
        ...context,
      }
    );
  }
}

export class CheckoutSessionNotFoundError extends CheckoutError {
  readonly code = 'CHECKOUT_SESSION_NOT_FOUND';
  readonly type = 'not-found' as const;
  readonly statusCode = 404;

  constructor(sessionId: string) {
    super(`Sesión de checkout ${sessionId} no encontrada`, { sessionId });
  }
}
