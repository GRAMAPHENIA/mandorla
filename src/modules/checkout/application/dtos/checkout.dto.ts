import {
  MetodoPago,
  DatosEntregaInterface,
  DatosPagoInterface,
  DatosClienteInterface,
} from '../../domain/types/checkout.types';

/**
 * DTOs para el módulo de checkout
 */

export interface CrearCheckoutDto {
  clienteId?: string;
  carritoId: string;
  metodoPago: MetodoPago;
  datosEntrega: DatosEntregaInterface;
  datosPago?: DatosPagoInterface;
  datosCliente?: DatosClienteInterface;
}

export interface ResumenCheckoutDto {
  items: Array<{
    productoId: string;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    imagen?: string;
  }>;
  subtotal: number;
  descuentos: number;
  impuestos: number;
  total: number;
  codigoDescuento?: string;
  metodoPagoSeleccionado?: MetodoPago;
}

export interface ResultadoCheckoutDto {
  exitoso: boolean;
  pedidoId?: string;
  pagoId?: string;
  total?: number;
  transaccionId?: string;
  mensaje?: string;
  estadoPago?: string;
  error?: {
    codigo: string;
    mensaje: string;
    detalles?: Record<string, any>;
  };
}

export interface ValidarCheckoutDto {
  clienteId?: string;
  carritoId: string;
  metodoPago: MetodoPago;
  datosEntrega: DatosEntregaInterface;
  validarStock?: boolean;
  validarPrecio?: boolean;
}

export interface ActualizarDatosEntregaDto {
  checkoutId: string;
  datosEntrega: DatosEntregaInterface;
}
