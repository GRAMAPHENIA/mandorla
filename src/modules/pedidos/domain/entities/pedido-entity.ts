/**
 * Entidad Pedido - Agregado raíz del dominio
 * Proyecto Mandorla - Panadería E-commerce
 */

import { PedidoId } from '../value-objects/pedido-id';
import { Dinero } from '../value-objects/dinero';
import { EstadoPedido, EstadoPedidoEnum } from '../value-objects/estado-pedido';
import { InformacionPago, MetodoPago } from '../value-objects/informacion-pago';
import { ItemPedido, DatosProducto } from './item-pedido';

export interface DatosCliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion?: {
    calle: string;
    numero: string;
    ciudad: string;
    codigoPostal: string;
    referencias?: string;
  };
}

export interface DatosEntrega {
  tipo: 'RETIRO_LOCAL' | 'DELIVERY';
  direccion?: {
    calle: string;
    numero: string;
    ciudad: string;
    codigoPostal: string;
    referencias?: string;
  };
  fechaEstimada?: Date;
  costoEnvio?: number;
  instrucciones?: string;
}

export class PedidoEntity {
  private readonly _id: PedidoId;
  private readonly _cliente: DatosCliente;
  private readonly _items: ItemPedido[];
  private _estado: EstadoPedido;
  private _informacionPago?: InformacionPago;
  private readonly _datosEntrega: DatosEntrega;
  private readonly _fechaCreacion: Date;
  private _fechaActualizacion: Date;
  private readonly _notas?: string;
  private readonly _historialEstados: EstadoPedido[];

  constructor(
    id: PedidoId,
    cliente: DatosCliente,
    items: ItemPedido[],
    datosEntrega: DatosEntrega,
    estado: EstadoPedido = EstadoPedido.pendientePago(),
    informacionPago?: InformacionPago,
    fechaCreacion: Date = new Date(),
    notas?: string
  ) {
    this.validarDatos(cliente, items, datosEntrega);

    this._id = id;
    this._cliente = { ...cliente };
    this._items = [...items];
    this._estado = estado;
    this._informacionPago = informacionPago;
    this._datosEntrega = { ...datosEntrega };
    this._fechaCreacion = fechaCreacion;
    this._fechaActualizacion = new Date();
    this._notas = notas;
    this._historialEstados = [estado];
  }

  static crear(
    cliente: DatosCliente,
    items: ItemPedido[],
    datosEntrega: DatosEntrega,
    notas?: string
  ): PedidoEntity {
    const id = PedidoId.create();
    return new PedidoEntity(
      id,
      cliente,
      items,
      datosEntrega,
      EstadoPedido.pendientePago(),
      undefined,
      new Date(),
      notas
    );
  }

  // Getters
  get id(): PedidoId {
    return this._id;
  }

  get cliente(): DatosCliente {
    return { ...this._cliente };
  }

  get items(): ItemPedido[] {
    return [...this._items];
  }

  get estado(): EstadoPedido {
    return this._estado;
  }

  get informacionPago(): InformacionPago | undefined {
    return this._informacionPago;
  }

  get datosEntrega(): DatosEntrega {
    return { ...this._datosEntrega };
  }

  get fechaCreacion(): Date {
    return this._fechaCreacion;
  }

  get fechaActualizacion(): Date {
    return this._fechaActualizacion;
  }

  get notas(): string | undefined {
    return this._notas;
  }

  get historialEstados(): EstadoPedido[] {
    return [...this._historialEstados];
  }

  // Métodos de cálculo
  calcularSubtotal(): Dinero {
    return this._items.reduce((total, item) => total.sumar(item.calcularSubtotal()), Dinero.cero());
  }

  calcularCostoEnvio(): Dinero {
    if (this._datosEntrega.tipo === 'RETIRO_LOCAL') {
      return Dinero.cero();
    }

    return Dinero.create(this._datosEntrega.costoEnvio || 0);
  }

  calcularTotal(): Dinero {
    const subtotal = this.calcularSubtotal();
    const costoEnvio = this.calcularCostoEnvio();
    return subtotal.sumar(costoEnvio);
  }

  obtenerCantidadItems(): number {
    return this._items.reduce((total, item) => total + item.cantidad, 0);
  }

  obtenerCantidadTiposProductos(): number {
    return this._items.length;
  }

  // Métodos de negocio - Gestión de pago
  configurarPagoMercadoPago(preferenceId: string): void {
    if (!this._estado.esPendientePago()) {
      throw new Error('Solo se puede configurar pago en pedidos pendientes');
    }

    const total = this.calcularTotal();
    const externalReference = this._id.value;
    const descripcion = `Pedido Mandorla - ${this.obtenerResumenItems()}`;

    this._informacionPago = InformacionPago.crearMercadoPago(
      total.valor,
      preferenceId,
      externalReference,
      descripcion
    );

    this.actualizarFechaModificacion();
  }

  confirmarPago(paymentId: string, paymentType?: string, installments?: number): void {
    if (!this._informacionPago) {
      throw new Error('No hay información de pago configurada');
    }

    if (!this._informacionPago.esMercadoPago()) {
      throw new Error('Solo se puede confirmar pago de Mercado Pago');
    }

    this._informacionPago = this._informacionPago.confirmarPago(
      paymentId,
      paymentType,
      installments
    );
    this.cambiarEstado(EstadoPedidoEnum.PAGO_CONFIRMADO, 'Pago confirmado por Mercado Pago');
  }

  rechazarPago(motivo?: string): void {
    if (!this._informacionPago) {
      throw new Error('No hay información de pago configurada');
    }

    this._informacionPago = this._informacionPago.rechazarPago(motivo);
    this.cambiarEstado(EstadoPedidoEnum.PAGO_RECHAZADO, motivo || 'Pago rechazado');
  }

  // Métodos de negocio - Gestión de estado
  cambiarEstado(nuevoEstado: EstadoPedidoEnum, motivo?: string): void {
    if (!this._estado.puedeTransicionarA(nuevoEstado)) {
      throw new Error(`No se puede cambiar el estado de ${this._estado.estado} a ${nuevoEstado}`);
    }

    const estadoAnterior = this._estado;
    this._estado = this._estado.transicionarA(nuevoEstado, motivo);
    this._historialEstados.push(this._estado);
    this.actualizarFechaModificacion();

    // Validaciones específicas de negocio
    this.validarCambioEstado(estadoAnterior, this._estado);
  }

  iniciarPreparacion(): void {
    if (!this._estado.estaPagado()) {
      throw new Error('No se puede iniciar preparación sin pago confirmado');
    }

    this.cambiarEstado(EstadoPedidoEnum.EN_PREPARACION, 'Iniciando preparación en panadería');
  }

  marcarListoParaEntrega(): void {
    this.cambiarEstado(EstadoPedidoEnum.LISTO_ENTREGA, 'Pedido listo para entrega');
  }

  marcarEnCamino(): void {
    if (this._datosEntrega.tipo === 'RETIRO_LOCAL') {
      throw new Error('Los pedidos para retiro no pueden estar "en camino"');
    }

    this.cambiarEstado(EstadoPedidoEnum.EN_CAMINO, 'Pedido en camino al cliente');
  }

  marcarEntregado(): void {
    this.cambiarEstado(EstadoPedidoEnum.ENTREGADO, 'Pedido entregado exitosamente');
  }

  cancelar(motivo: string): void {
    if (!this._estado.puedeSerCancelado()) {
      throw new Error('El pedido no puede ser cancelado en su estado actual');
    }

    this.cambiarEstado(EstadoPedidoEnum.CANCELADO, motivo);
  }

  // Métodos de consulta
  estaPendientePago(): boolean {
    return this._estado.esPendientePago();
  }

  estaPagado(): boolean {
    return this._estado.estaPagado();
  }

  estaFinalizado(): boolean {
    return this._estado.estaFinalizado();
  }

  puedeSerCancelado(): boolean {
    return this._estado.puedeSerCancelado();
  }

  esParaDelivery(): boolean {
    return this._datosEntrega.tipo === 'DELIVERY';
  }

  esParaRetiro(): boolean {
    return this._datosEntrega.tipo === 'RETIRO_LOCAL';
  }

  tieneProducto(productoId: string): boolean {
    return this._items.some(item => item.esDelProducto(productoId));
  }

  obtenerItem(productoId: string): ItemPedido | undefined {
    return this._items.find(item => item.esDelProducto(productoId));
  }

  // Métodos de presentación
  obtenerResumenItems(): string {
    if (this._items.length === 0) return 'Sin items';

    if (this._items.length === 1) {
      return this._items[0].obtenerResumen();
    }

    return `${this._items.length} productos (${this.obtenerCantidadItems()} items)`;
  }

  obtenerDescripcionCompleta(): string {
    const cliente = this._cliente.nombre;
    const total = this.calcularTotal().formatear();
    const estado = this._estado.obtenerDescripcion();
    const items = this.obtenerResumenItems();

    return `Pedido ${this._id.value} - ${cliente} - ${items} - ${total} - ${estado}`;
  }

  // Serialización
  toJSON(): any {
    return {
      id: this._id.value,
      cliente: this._cliente,
      items: this._items.map(item => item.toJSON()),
      estado: this._estado.toJSON(),
      informacionPago: this._informacionPago?.toJSON(),
      datosEntrega: this._datosEntrega,
      fechaCreacion: this._fechaCreacion.toISOString(),
      fechaActualizacion: this._fechaActualizacion.toISOString(),
      notas: this._notas,
      historialEstados: this._historialEstados.map(estado => estado.toJSON()),
      // Campos calculados
      subtotal: this.calcularSubtotal().toJSON(),
      costoEnvio: this.calcularCostoEnvio().toJSON(),
      total: this.calcularTotal().toJSON(),
      cantidadItems: this.obtenerCantidadItems(),
      cantidadTiposProductos: this.obtenerCantidadTiposProductos(),
      resumenItems: this.obtenerResumenItems(),
      descripcionCompleta: this.obtenerDescripcionCompleta(),
    };
  }

  // Métodos privados
  private validarDatos(
    cliente: DatosCliente,
    items: ItemPedido[],
    datosEntrega: DatosEntrega
  ): void {
    if (!cliente) {
      throw new Error('Los datos del cliente son requeridos');
    }

    if (!cliente.id || cliente.id.trim().length === 0) {
      throw new Error('El ID del cliente es requerido');
    }

    if (!cliente.nombre || cliente.nombre.trim().length === 0) {
      throw new Error('El nombre del cliente es requerido');
    }

    if (!cliente.email || !this.validarEmail(cliente.email)) {
      throw new Error('El email del cliente es requerido y debe ser válido');
    }

    if (!items || items.length === 0) {
      throw new Error('El pedido debe tener al menos un item');
    }

    if (items.length > 50) {
      throw new Error('El pedido no puede tener más de 50 items diferentes');
    }

    if (!datosEntrega) {
      throw new Error('Los datos de entrega son requeridos');
    }

    if (datosEntrega.tipo === 'DELIVERY' && !datosEntrega.direccion) {
      throw new Error('La dirección es requerida para delivery');
    }
  }

  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private validarCambioEstado(estadoAnterior: EstadoPedido, nuevoEstado: EstadoPedido): void {
    // Validaciones específicas de negocio para cambios de estado
    if (nuevoEstado.estado === EstadoPedidoEnum.PAGO_CONFIRMADO && !this._informacionPago) {
      throw new Error('No se puede confirmar pago sin información de pago');
    }

    if (
      nuevoEstado.estado === EstadoPedidoEnum.EN_CAMINO &&
      this._datosEntrega.tipo === 'RETIRO_LOCAL'
    ) {
      throw new Error('Los pedidos para retiro no pueden estar en camino');
    }
  }

  private actualizarFechaModificacion(): void {
    this._fechaActualizacion = new Date();
  }
}
