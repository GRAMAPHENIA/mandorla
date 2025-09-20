/**
 * Value Object para información de pago con Mercado Pago
 * Proyecto Mandorla - Panadería E-commerce
 */

export enum MetodoPago {
  MERCADO_PAGO = 'MERCADO_PAGO',
  EFECTIVO = 'EFECTIVO',
  TRANSFERENCIA = 'TRANSFERENCIA',
}

export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  PROCESANDO = 'PROCESANDO',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  CANCELADO = 'CANCELADO',
  REEMBOLSADO = 'REEMBOLSADO',
}

export interface DatosMercadoPago {
  preferenceId?: string;
  paymentId?: string;
  merchantOrderId?: string;
  externalReference?: string;
  paymentStatus?: string;
  paymentType?: string;
  installments?: number;
  transactionAmount?: number;
  dateCreated?: Date;
  dateApproved?: Date;
}

export class InformacionPago {
  private readonly _metodo: MetodoPago;
  private readonly _estado: EstadoPago;
  private readonly _monto: number;
  private readonly _moneda: string;
  private readonly _datosMercadoPago?: DatosMercadoPago;
  private readonly _fechaCreacion: Date;
  private readonly _fechaActualizacion: Date;
  private readonly _descripcion?: string;

  private constructor(
    metodo: MetodoPago,
    estado: EstadoPago,
    monto: number,
    moneda: string = 'ARS',
    datosMercadoPago?: DatosMercadoPago,
    fechaCreacion: Date = new Date(),
    fechaActualizacion: Date = new Date(),
    descripcion?: string
  ) {
    this._metodo = metodo;
    this._estado = estado;
    this._monto = monto;
    this._moneda = moneda;
    this._datosMercadoPago = datosMercadoPago;
    this._fechaCreacion = fechaCreacion;
    this._fechaActualizacion = fechaActualizacion;
    this._descripcion = descripcion;
  }

  static crearMercadoPago(
    monto: number,
    preferenceId: string,
    externalReference: string,
    descripcion?: string
  ): InformacionPago {
    this.validarMonto(monto);

    const datosMercadoPago: DatosMercadoPago = {
      preferenceId,
      externalReference,
      transactionAmount: monto,
      dateCreated: new Date(),
    };

    return new InformacionPago(
      MetodoPago.MERCADO_PAGO,
      EstadoPago.PENDIENTE,
      monto,
      'ARS',
      datosMercadoPago,
      new Date(),
      new Date(),
      descripcion
    );
  }

  static crearEfectivo(monto: number, descripcion?: string): InformacionPago {
    this.validarMonto(monto);

    return new InformacionPago(
      MetodoPago.EFECTIVO,
      EstadoPago.PENDIENTE,
      monto,
      'ARS',
      undefined,
      new Date(),
      new Date(),
      descripcion
    );
  }

  get metodo(): MetodoPago {
    return this._metodo;
  }

  get estado(): EstadoPago {
    return this._estado;
  }

  get monto(): number {
    return this._monto;
  }

  get moneda(): string {
    return this._moneda;
  }

  get datosMercadoPago(): DatosMercadoPago | undefined {
    return this._datosMercadoPago;
  }

  get fechaCreacion(): Date {
    return this._fechaCreacion;
  }

  get fechaActualizacion(): Date {
    return this._fechaActualizacion;
  }

  get descripcion(): string | undefined {
    return this._descripcion;
  }

  // Métodos para actualizar estado del pago
  actualizarEstado(
    nuevoEstado: EstadoPago,
    datosMercadoPago?: Partial<DatosMercadoPago>
  ): InformacionPago {
    if (!this.puedeTransicionarA(nuevoEstado)) {
      throw new Error(`Transición de estado inválida de ${this._estado} a ${nuevoEstado}`);
    }

    const datosActualizados = this._datosMercadoPago
      ? {
          ...this._datosMercadoPago,
          ...datosMercadoPago,
        }
      : (datosMercadoPago as DatosMercadoPago);

    return new InformacionPago(
      this._metodo,
      nuevoEstado,
      this._monto,
      this._moneda,
      datosActualizados,
      this._fechaCreacion,
      new Date(),
      this._descripcion
    );
  }

  confirmarPago(paymentId: string, paymentType?: string, installments?: number): InformacionPago {
    if (this._metodo !== MetodoPago.MERCADO_PAGO) {
      throw new Error('Solo se puede confirmar pago para Mercado Pago');
    }

    const datosActualizados: DatosMercadoPago = {
      ...this._datosMercadoPago,
      paymentId,
      paymentStatus: 'approved',
      paymentType,
      installments,
      dateApproved: new Date(),
    };

    return this.actualizarEstado(EstadoPago.APROBADO, datosActualizados);
  }

  rechazarPago(motivo?: string): InformacionPago {
    const datosActualizados = this._datosMercadoPago
      ? {
          ...this._datosMercadoPago,
          paymentStatus: 'rejected',
        }
      : undefined;

    return new InformacionPago(
      this._metodo,
      EstadoPago.RECHAZADO,
      this._monto,
      this._moneda,
      datosActualizados,
      this._fechaCreacion,
      new Date(),
      motivo || this._descripcion
    );
  }

  // Métodos de consulta
  esPendiente(): boolean {
    return this._estado === EstadoPago.PENDIENTE;
  }

  estaAprobado(): boolean {
    return this._estado === EstadoPago.APROBADO;
  }

  estaRechazado(): boolean {
    return this._estado === EstadoPago.RECHAZADO;
  }

  estaCancelado(): boolean {
    return this._estado === EstadoPago.CANCELADO;
  }

  esMercadoPago(): boolean {
    return this._metodo === MetodoPago.MERCADO_PAGO;
  }

  esEfectivo(): boolean {
    return this._metodo === MetodoPago.EFECTIVO;
  }

  obtenerPreferenceId(): string | undefined {
    return this._datosMercadoPago?.preferenceId;
  }

  obtenerPaymentId(): string | undefined {
    return this._datosMercadoPago?.paymentId;
  }

  obtenerExternalReference(): string | undefined {
    return this._datosMercadoPago?.externalReference;
  }

  formatearMonto(): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: this._moneda,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(this._monto);
  }

  obtenerDescripcionEstado(): string {
    const descripciones: Record<EstadoPago, string> = {
      [EstadoPago.PENDIENTE]: 'Pago pendiente',
      [EstadoPago.PROCESANDO]: 'Procesando pago',
      [EstadoPago.APROBADO]: 'Pago aprobado',
      [EstadoPago.RECHAZADO]: 'Pago rechazado',
      [EstadoPago.CANCELADO]: 'Pago cancelado',
      [EstadoPago.REEMBOLSADO]: 'Pago reembolsado',
    };

    return descripciones[this._estado];
  }

  toJSON(): any {
    return {
      metodo: this._metodo,
      estado: this._estado,
      monto: this._monto,
      moneda: this._moneda,
      datosMercadoPago: this._datosMercadoPago,
      fechaCreacion: this._fechaCreacion.toISOString(),
      fechaActualizacion: this._fechaActualizacion.toISOString(),
      descripcion: this._descripcion,
      montoFormateado: this.formatearMonto(),
      descripcionEstado: this.obtenerDescripcionEstado(),
    };
  }

  private puedeTransicionarA(nuevoEstado: EstadoPago): boolean {
    const transicionesValidas: Record<EstadoPago, EstadoPago[]> = {
      [EstadoPago.PENDIENTE]: [EstadoPago.PROCESANDO, EstadoPago.CANCELADO],
      [EstadoPago.PROCESANDO]: [EstadoPago.APROBADO, EstadoPago.RECHAZADO, EstadoPago.CANCELADO],
      [EstadoPago.APROBADO]: [EstadoPago.REEMBOLSADO],
      [EstadoPago.RECHAZADO]: [],
      [EstadoPago.CANCELADO]: [],
      [EstadoPago.REEMBOLSADO]: [],
    };

    return transicionesValidas[this._estado]?.includes(nuevoEstado) || false;
  }

  private static validarMonto(monto: number): void {
    if (typeof monto !== 'number' || isNaN(monto)) {
      throw new Error('El monto debe ser un número válido');
    }

    if (monto <= 0) {
      throw new Error('El monto debe ser mayor a cero');
    }

    if (monto > 999999.99) {
      throw new Error('El monto no puede exceder $999,999.99');
    }
  }
}
