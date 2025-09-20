/**
 * DTOs para gestión de pagos de pedidos
 * Proyecto Mandorla - Panadería E-commerce
 */

export interface ConfigurarPagoMercadoPagoDto {
  pedidoId: string;
  urlsCallback: {
    success: string;
    failure: string;
    pending: string;
  };
  autoReturn?: 'approved' | 'all';
  metodosExcluidos?: Array<{ id: string }>;
  tiposPagoExcluidos?: Array<{ id: string }>;
  cuotasMaximas?: number;
}

export interface ConfigurarPagoRespuestaDto {
  pedidoId: string;
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
  externalReference: string;
  fechaCreacion: string;
  estado: {
    pedido: string;
    pago: string;
  };
  total: {
    monto: number;
    moneda: string;
    formateado: string;
  };
}

export interface ConfirmarPagoDto {
  pedidoId?: string;
  paymentId: string;
  externalReference?: string;
  paymentStatus: string;
  paymentType?: string;
  installments?: number;
  transactionAmount?: number;
  merchantOrderId?: string;
}

export interface ConfirmarPagoRespuestaDto {
  pedidoId: string;
  paymentId: string;
  estado: {
    pedido: string;
    pago: string;
    descripcion: string;
  };
  pago: {
    monto: number;
    moneda: string;
    formateado: string;
    metodoPago: string;
    tipoTransaccion?: string;
    cuotas?: number;
    fechaAprobacion: string;
  };
  fechaActualizacion: string;
}

export interface RechazarPagoDto {
  pedidoId?: string;
  paymentId?: string;
  externalReference?: string;
  motivo?: string;
  detalleError?: string;
}

export interface RechazarPagoRespuestaDto {
  pedidoId: string;
  paymentId?: string;
  estado: {
    pedido: string;
    pago: string;
    descripcion: string;
  };
  motivo?: string;
  fechaRechazo: string;
}

export interface ConsultarEstadoPagoDto {
  pedidoId?: string;
  paymentId?: string;
  externalReference?: string;
}

export interface ConsultarEstadoPagoRespuestaDto {
  pedidoId: string;
  pago?: {
    paymentId?: string;
    preferenceId?: string;
    estado: string;
    descripcionEstado: string;
    monto: number;
    moneda: string;
    formateado: string;
    metodoPago: string;
    fechaCreacion: string;
    fechaActualizacion: string;
    fechaAprobacion?: string;
    detallesMercadoPago?: {
      paymentType?: string;
      installments?: number;
      transactionAmount?: number;
      merchantOrderId?: string;
    };
  };
  estadoPedido: {
    estado: string;
    descripcion: string;
    fechaCambio: string;
  };
}

export interface ProcesarNotificacionMercadoPagoDto {
  id: number;
  live_mode: boolean;
  type: string;
  date_created: string;
  application_id: number;
  user_id: number;
  version: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

export interface ProcesarNotificacionRespuestaDto {
  procesado: boolean;
  pedidoId?: string;
  paymentId?: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  accionRealizada?: string;
  mensaje: string;
  fechaProcesamiento: string;
}

export interface ReembolsarPagoDto {
  pedidoId: string;
  monto?: number; // Si no se especifica, reembolsa todo
  motivo?: string;
}

export interface ReembolsarPagoRespuestaDto {
  pedidoId: string;
  paymentId: string;
  reembolsoId: number;
  monto: {
    reembolsado: number;
    moneda: string;
    formateado: string;
  };
  estado: {
    pedido: string;
    pago: string;
    descripcion: string;
  };
  fechaReembolso: string;
  motivo?: string;
}
