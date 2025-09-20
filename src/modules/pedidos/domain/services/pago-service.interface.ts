/**
 * Interface del servicio de pagos con Mercado Pago
 * Proyecto Mandorla - Panadería E-commerce
 */

export interface ItemPago {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
  category_id?: string;
}

export interface DatosCompradorPago {
  name: string;
  surname: string;
  email: string;
  phone?: {
    area_code: string;
    number: string;
  };
  identification?: {
    type: string;
    number: string;
  };
  address?: {
    street_name: string;
    street_number: number;
    zip_code: string;
  };
}

export interface ConfiguracionPreference {
  items: ItemPago[];
  payer: DatosCompradorPago;
  external_reference: string;
  notification_url?: string;
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: 'approved' | 'all';
  payment_methods?: {
    excluded_payment_methods?: Array<{ id: string }>;
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
  };
  shipments?: {
    cost: number;
    mode: 'not_specified' | 'custom';
  };
  metadata?: Record<string, any>;
}

export interface RespuestaPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  date_created: string;
  items: ItemPago[];
  payer: DatosCompradorPago;
  external_reference: string;
  auto_return: string;
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
}

export interface DatosPago {
  id: number;
  date_created: string;
  date_approved?: string;
  date_last_updated: string;
  money_release_date?: string;
  payment_method_id: string;
  payment_type_id: string;
  status:
    | 'pending'
    | 'approved'
    | 'authorized'
    | 'in_process'
    | 'in_mediation'
    | 'rejected'
    | 'cancelled'
    | 'refunded'
    | 'charged_back';
  status_detail: string;
  currency_id: string;
  description?: string;
  external_reference?: string;
  live_mode: boolean;
  order?: {
    id: number;
    type: string;
  };
  payer: {
    id?: string;
    email?: string;
    identification?: {
      type: string;
      number: string;
    };
    type?: string;
  };
  transaction_amount: number;
  transaction_amount_refunded: number;
  coupon_amount: number;
  installments: number;
  transaction_details: {
    net_received_amount: number;
    total_paid_amount: number;
    overpaid_amount: number;
    installment_amount: number;
  };
  fee_details?: Array<{
    type: string;
    amount: number;
    fee_payer: string;
  }>;
  captured: boolean;
  binary_mode: boolean;
  call_for_authorize_id?: string;
  statement_descriptor?: string;
  card?: {
    id?: string;
    last_four_digits?: string;
    first_six_digits?: string;
    expiration_month?: number;
    expiration_year?: number;
    date_created?: string;
    date_last_updated?: string;
    cardholder?: {
      name?: string;
      identification?: {
        type: string;
        number: string;
      };
    };
  };
  notification_url?: string;
  refunds?: Array<{
    id: number;
    payment_id: number;
    amount: number;
    metadata: any;
    source: any;
    date_created: string;
  }>;
}

export interface NotificacionMercadoPago {
  id: number;
  live_mode: boolean;
  type: 'payment' | 'plan' | 'subscription' | 'invoice' | 'point_integration_wh';
  date_created: string;
  application_id: number;
  user_id: number;
  version: number;
  api_version: string;
  action:
    | 'payment.created'
    | 'payment.updated'
    | 'application.deauthorized'
    | 'application.authorized';
  data: {
    id: string;
  };
}

export interface ResultadoReembolso {
  id: number;
  payment_id: number;
  amount: number;
  metadata?: any;
  source: {
    id: string;
    name: string;
    type: string;
  };
  date_created: string;
  unique_sequence_number?: string;
}

/**
 * Servicio para integración con Mercado Pago
 * Maneja la creación de preferencias, procesamiento de pagos y webhooks
 */
export interface IPagoService {
  /**
   * Crea una preferencia de pago en Mercado Pago
   * @param configuracion - Configuración de la preferencia
   * @returns Promise<RespuestaPreference> - Datos de la preferencia creada
   * @throws ErrorServicioPagosError - Si hay error creando la preferencia
   */
  crearPreferencia(configuracion: ConfiguracionPreference): Promise<RespuestaPreference>;

  /**
   * Obtiene información de un pago por su ID
   * @param paymentId - ID del pago en Mercado Pago
   * @returns Promise<DatosPago> - Información completa del pago
   * @throws ErrorServicioPagosError - Si hay error obteniendo el pago
   */
  obtenerPago(paymentId: string): Promise<DatosPago>;

  /**
   * Busca pagos por external reference
   * @param externalReference - External reference del pedido
   * @returns Promise<DatosPago[]> - Lista de pagos asociados
   * @throws ErrorServicioPagosError - Si hay error en la búsqueda
   */
  buscarPagosPorExternalReference(externalReference: string): Promise<DatosPago[]>;

  /**
   * Procesa una notificación webhook de Mercado Pago
   * @param notificacion - Datos de la notificación
   * @returns Promise<DatosPago | null> - Datos del pago actualizado o null si no es relevante
   * @throws ErrorServicioPagosError - Si hay error procesando la notificación
   */
  procesarNotificacion(notificacion: NotificacionMercadoPago): Promise<DatosPago | null>;

  /**
   * Reembolsa un pago total o parcialmente
   * @param paymentId - ID del pago a reembolsar
   * @param monto - Monto a reembolsar (opcional, si no se especifica reembolsa todo)
   * @returns Promise<ResultadoReembolso> - Información del reembolso
   * @throws ErrorServicioPagosError - Si hay error procesando el reembolso
   */
  reembolsarPago(paymentId: string, monto?: number): Promise<ResultadoReembolso>;

  /**
   * Cancela una preferencia de pago
   * @param preferenceId - ID de la preferencia a cancelar
   * @returns Promise<boolean> - true si se canceló exitosamente
   * @throws ErrorServicioPagosError - Si hay error cancelando la preferencia
   */
  cancelarPreferencia(preferenceId: string): Promise<boolean>;

  /**
   * Obtiene información de una preferencia
   * @param preferenceId - ID de la preferencia
   * @returns Promise<RespuestaPreference> - Información de la preferencia
   * @throws ErrorServicioPagosError - Si hay error obteniendo la preferencia
   */
  obtenerPreferencia(preferenceId: string): Promise<RespuestaPreference>;

  /**
   * Valida la firma de una notificación webhook
   * @param payload - Cuerpo de la notificación
   * @param signature - Firma recibida en el header
   * @returns boolean - true si la firma es válida
   */
  validarFirmaNotificacion(payload: string, signature: string): boolean;

  /**
   * Obtiene las URLs de callback configuradas
   * @returns object - URLs de success, failure y pending
   */
  obtenerUrlsCallback(): {
    success: string;
    failure: string;
    pending: string;
  };

  /**
   * Obtiene la URL del webhook para notificaciones
   * @returns string - URL del webhook
   */
  obtenerUrlWebhook(): string;

  /**
   * Verifica si el servicio está configurado correctamente
   * @returns Promise<boolean> - true si está configurado
   */
  verificarConfiguracion(): Promise<boolean>;

  /**
   * Obtiene información de la cuenta de Mercado Pago
   * @returns Promise<any> - Información de la cuenta
   * @throws ErrorServicioPagosError - Si hay error obteniendo la información
   */
  obtenerInformacionCuenta(): Promise<any>;
}
