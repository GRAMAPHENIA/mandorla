/**
 * Tipos del dominio de checkout
 */

export type MetodoPago = 'efectivo' | 'tarjeta_credito' | 'tarjeta_debito' | 'transferencia';

export enum EstadoCheckout {
  INICIADO = 'INICIADO',
  PAGO_CONFIRMADO = 'PAGO_CONFIRMADO',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO',
  EXPIRADO = 'EXPIRADO',
}

export interface DatosEntregaInterface {
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  telefono: string;
  instrucciones?: string;
}

export interface DatosPagoInterface {
  numeroTarjeta: string;
  vencimiento: string;
  cvv: string;
  titular: string;
}

export interface DatosClienteInterface {
  nombre: string;
  email: string;
  telefono: string;
}
