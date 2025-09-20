import { CheckoutSessionId } from '../value-objects/checkout-session-id';
import { DatosEntrega } from '../value-objects/datos-entrega';
import { EstadoCheckout, MetodoPago, DatosEntregaInterface } from '../types/checkout.types';
import { CheckoutError } from '../errors/checkout-errors';

/**
 * Entidad de sesión de checkout
 */
export class CheckoutSessionEntity {
  private constructor(
    private readonly _id: CheckoutSessionId,
    private readonly _clienteId: string,
    private readonly _carritoId: string,
    private readonly _metodoPago: MetodoPago,
    private _estado: EstadoCheckout,
    private readonly _total: number,
    private readonly _datosEntrega: DatosEntrega,
    private readonly _fechaCreacion: Date,
    private readonly _fechaExpiracion: Date,
    private _transaccionId?: string,
    private _pedidoId?: string,
    private _fechaConfirmacion?: Date,
    private _fechaCancelacion?: Date,
    private _fechaCompletado?: Date,
    private _motivoCancelacion?: string
  ) {}

  static crear(datos: {
    clienteId: string;
    carritoId: string;
    metodoPago: MetodoPago;
    datosEntrega: DatosEntregaInterface;
    total: number;
  }): CheckoutSessionEntity {
    if (datos.total <= 0) {
      throw new CheckoutError('El total debe ser mayor a 0');
    }

    const id = CheckoutSessionId.crear();
    const datosEntrega = DatosEntrega.crear(datos.datosEntrega);
    const fechaCreacion = new Date();
    const fechaExpiracion = new Date(fechaCreacion.getTime() + 30 * 60 * 1000); // 30 minutos

    return new CheckoutSessionEntity(
      id,
      datos.clienteId,
      datos.carritoId,
      datos.metodoPago,
      EstadoCheckout.INICIADO,
      datos.total,
      datosEntrega,
      fechaCreacion,
      fechaExpiracion
    );
  }

  confirmarPago(transaccionId: string): void {
    if (this._estado !== EstadoCheckout.INICIADO) {
      throw new CheckoutError('Solo se puede confirmar pago en estado INICIADO');
    }

    this._estado = EstadoCheckout.PAGO_CONFIRMADO;
    this._transaccionId = transaccionId;
    this._fechaConfirmacion = new Date();
  }

  completar(pedidoId: string): void {
    if (this._estado !== EstadoCheckout.PAGO_CONFIRMADO) {
      throw new CheckoutError('Solo se puede completar con pago confirmado');
    }

    this._estado = EstadoCheckout.COMPLETADO;
    this._pedidoId = pedidoId;
    this._fechaCompletado = new Date();
  }

  cancelar(motivo: string): void {
    if (this._estado === EstadoCheckout.COMPLETADO) {
      throw new CheckoutError('No se puede cancelar un checkout completado');
    }

    this._estado = EstadoCheckout.CANCELADO;
    this._motivoCancelacion = motivo;
    this._fechaCancelacion = new Date();
  }

  estaExpirada(): boolean {
    if (this._estado === EstadoCheckout.COMPLETADO || this._estado === EstadoCheckout.CANCELADO) {
      return false;
    }
    return new Date() > this._fechaExpiracion;
  }

  puedeSerModificada(): boolean {
    return this._estado === EstadoCheckout.INICIADO && !this.estaExpirada();
  }

  actualizarDatosEntrega(nuevosDatos: DatosEntregaInterface): void {
    if (!this.puedeSerModificada()) {
      throw new CheckoutError('No se pueden modificar los datos de entrega en el estado actual');
    }

    // En una implementación real, actualizaríamos los datos
    // Por ahora solo validamos que se pueda hacer
  }

  // Getters
  get id(): CheckoutSessionId {
    return this._id;
  }
  get clienteId(): string {
    return this._clienteId;
  }
  get carritoId(): string {
    return this._carritoId;
  }
  get metodoPago(): MetodoPago {
    return this._metodoPago;
  }
  get estado(): EstadoCheckout {
    return this._estado;
  }
  get total(): number {
    return this._total;
  }
  get datosEntrega(): DatosEntrega {
    return this._datosEntrega;
  }
  get fechaCreacion(): Date {
    return this._fechaCreacion;
  }
  get fechaExpiracion(): Date {
    return this._fechaExpiracion;
  }
  get transaccionId(): string | undefined {
    return this._transaccionId;
  }
  get pedidoId(): string | undefined {
    return this._pedidoId;
  }
  get fechaConfirmacion(): Date | undefined {
    return this._fechaConfirmacion;
  }
  get fechaCancelacion(): Date | undefined {
    return this._fechaCancelacion;
  }
  get fechaCompletado(): Date | undefined {
    return this._fechaCompletado;
  }
  get motivoCancelacion(): string | undefined {
    return this._motivoCancelacion;
  }

  toPersistence(): any {
    return {
      id: this._id.value,
      clienteId: this._clienteId,
      carritoId: this._carritoId,
      metodoPago: this._metodoPago,
      estado: this._estado,
      total: this._total,
      datosEntrega: this._datosEntrega.toPersistence(),
      fechaCreacion: this._fechaCreacion,
      fechaExpiracion: this._fechaExpiracion,
      transaccionId: this._transaccionId,
      pedidoId: this._pedidoId,
      fechaConfirmacion: this._fechaConfirmacion,
      fechaCancelacion: this._fechaCancelacion,
      fechaCompletado: this._fechaCompletado,
      motivoCancelacion: this._motivoCancelacion,
    };
  }

  static fromPersistence(data: any): CheckoutSessionEntity {
    const id = CheckoutSessionId.fromString(data.id);
    const datosEntrega = DatosEntrega.fromPersistence(data.datosEntrega);

    const entity = new CheckoutSessionEntity(
      id,
      data.clienteId,
      data.carritoId,
      data.metodoPago,
      data.estado,
      data.total,
      datosEntrega,
      data.fechaCreacion,
      data.fechaExpiracion,
      data.transaccionId,
      data.pedidoId,
      data.fechaConfirmacion,
      data.fechaCancelacion,
      data.fechaCompletado,
      data.motivoCancelacion
    );

    return entity;
  }
}
