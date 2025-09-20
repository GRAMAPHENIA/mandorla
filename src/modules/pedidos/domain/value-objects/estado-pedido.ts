/**
 * Value Object para el estado del pedido
 * Proyecto Mandorla - Panadería E-commerce
 */

export enum EstadoPedidoEnum {
  PENDIENTE_PAGO = 'PENDIENTE_PAGO',
  PAGO_PROCESANDO = 'PAGO_PROCESANDO',
  PAGO_CONFIRMADO = 'PAGO_CONFIRMADO',
  PAGO_RECHAZADO = 'PAGO_RECHAZADO',
  EN_PREPARACION = 'EN_PREPARACION',
  LISTO_ENTREGA = 'LISTO_ENTREGA',
  EN_CAMINO = 'EN_CAMINO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

export class EstadoPedido {
  private readonly _estado: EstadoPedidoEnum;
  private readonly _fechaCambio: Date;
  private readonly _motivo?: string;

  private constructor(estado: EstadoPedidoEnum, fechaCambio: Date = new Date(), motivo?: string) {
    this._estado = estado;
    this._fechaCambio = fechaCambio;
    this._motivo = motivo;
  }

  static crear(estado: EstadoPedidoEnum, motivo?: string): EstadoPedido {
    return new EstadoPedido(estado, new Date(), motivo);
  }

  static pendientePago(): EstadoPedido {
    return new EstadoPedido(
      EstadoPedidoEnum.PENDIENTE_PAGO,
      new Date(),
      'Pedido creado, esperando pago'
    );
  }

  static pagoConfirmado(): EstadoPedido {
    return new EstadoPedido(
      EstadoPedidoEnum.PAGO_CONFIRMADO,
      new Date(),
      'Pago confirmado por Mercado Pago'
    );
  }

  get estado(): EstadoPedidoEnum {
    return this._estado;
  }

  get fechaCambio(): Date {
    return this._fechaCambio;
  }

  get motivo(): string | undefined {
    return this._motivo;
  }

  // Transiciones válidas de estado
  puedeTransicionarA(nuevoEstado: EstadoPedidoEnum): boolean {
    const transicionesValidas = this.obtenerTransicionesValidas();
    return transicionesValidas.includes(nuevoEstado);
  }

  transicionarA(nuevoEstado: EstadoPedidoEnum, motivo?: string): EstadoPedido {
    if (!this.puedeTransicionarA(nuevoEstado)) {
      throw new Error(
        `Transición inválida de ${this._estado} a ${nuevoEstado}. ` +
          `Transiciones válidas: ${this.obtenerTransicionesValidas().join(', ')}`
      );
    }

    return new EstadoPedido(nuevoEstado, new Date(), motivo);
  }

  esPendientePago(): boolean {
    return this._estado === EstadoPedidoEnum.PENDIENTE_PAGO;
  }

  estaPagado(): boolean {
    return (
      this._estado === EstadoPedidoEnum.PAGO_CONFIRMADO ||
      this._estado === EstadoPedidoEnum.EN_PREPARACION ||
      this._estado === EstadoPedidoEnum.LISTO_ENTREGA ||
      this._estado === EstadoPedidoEnum.EN_CAMINO ||
      this._estado === EstadoPedidoEnum.ENTREGADO
    );
  }

  estaCancelado(): boolean {
    return (
      this._estado === EstadoPedidoEnum.CANCELADO ||
      this._estado === EstadoPedidoEnum.PAGO_RECHAZADO
    );
  }

  estaFinalizado(): boolean {
    return (
      this._estado === EstadoPedidoEnum.ENTREGADO ||
      this._estado === EstadoPedidoEnum.CANCELADO ||
      this._estado === EstadoPedidoEnum.PAGO_RECHAZADO
    );
  }

  puedeSerCancelado(): boolean {
    return (
      this._estado === EstadoPedidoEnum.PENDIENTE_PAGO ||
      this._estado === EstadoPedidoEnum.PAGO_PROCESANDO ||
      this._estado === EstadoPedidoEnum.PAGO_CONFIRMADO ||
      this._estado === EstadoPedidoEnum.EN_PREPARACION
    );
  }

  obtenerDescripcion(): string {
    const descripciones: Record<EstadoPedidoEnum, string> = {
      [EstadoPedidoEnum.PENDIENTE_PAGO]: 'Esperando confirmación de pago',
      [EstadoPedidoEnum.PAGO_PROCESANDO]: 'Procesando pago con Mercado Pago',
      [EstadoPedidoEnum.PAGO_CONFIRMADO]: 'Pago confirmado, preparando pedido',
      [EstadoPedidoEnum.PAGO_RECHAZADO]: 'Pago rechazado',
      [EstadoPedidoEnum.EN_PREPARACION]: 'Preparando productos en panadería',
      [EstadoPedidoEnum.LISTO_ENTREGA]: 'Pedido listo para entrega',
      [EstadoPedidoEnum.EN_CAMINO]: 'Pedido en camino',
      [EstadoPedidoEnum.ENTREGADO]: 'Pedido entregado exitosamente',
      [EstadoPedidoEnum.CANCELADO]: 'Pedido cancelado',
    };

    return descripciones[this._estado];
  }

  equals(otro: EstadoPedido): boolean {
    return this._estado === otro._estado;
  }

  toJSON(): { estado: string; fechaCambio: string; motivo?: string; descripcion: string } {
    return {
      estado: this._estado,
      fechaCambio: this._fechaCambio.toISOString(),
      motivo: this._motivo,
      descripcion: this.obtenerDescripcion(),
    };
  }

  private obtenerTransicionesValidas(): EstadoPedidoEnum[] {
    const transiciones: Record<EstadoPedidoEnum, EstadoPedidoEnum[]> = {
      [EstadoPedidoEnum.PENDIENTE_PAGO]: [
        EstadoPedidoEnum.PAGO_PROCESANDO,
        EstadoPedidoEnum.CANCELADO,
      ],
      [EstadoPedidoEnum.PAGO_PROCESANDO]: [
        EstadoPedidoEnum.PAGO_CONFIRMADO,
        EstadoPedidoEnum.PAGO_RECHAZADO,
        EstadoPedidoEnum.CANCELADO,
      ],
      [EstadoPedidoEnum.PAGO_CONFIRMADO]: [
        EstadoPedidoEnum.EN_PREPARACION,
        EstadoPedidoEnum.CANCELADO,
      ],
      [EstadoPedidoEnum.PAGO_RECHAZADO]: [], // Estado final
      [EstadoPedidoEnum.EN_PREPARACION]: [
        EstadoPedidoEnum.LISTO_ENTREGA,
        EstadoPedidoEnum.CANCELADO,
      ],
      [EstadoPedidoEnum.LISTO_ENTREGA]: [EstadoPedidoEnum.EN_CAMINO, EstadoPedidoEnum.ENTREGADO],
      [EstadoPedidoEnum.EN_CAMINO]: [EstadoPedidoEnum.ENTREGADO],
      [EstadoPedidoEnum.ENTREGADO]: [], // Estado final
      [EstadoPedidoEnum.CANCELADO]: [], // Estado final
    };

    return transiciones[this._estado] || [];
  }
}
