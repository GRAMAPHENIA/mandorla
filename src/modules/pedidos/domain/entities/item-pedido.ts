/**
 * Entidad Item de Pedido
 * Proyecto Mandorla - Panadería E-commerce
 */

import { Dinero } from '../value-objects/dinero';

export interface DatosProducto {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  descripcion?: string;
  imagen?: string;
}

export class ItemPedido {
  private readonly _id: string;
  private readonly _producto: DatosProducto;
  private _cantidad: number;
  private readonly _precioUnitario: Dinero;
  private readonly _fechaAgregado: Date;

  constructor(
    id: string,
    producto: DatosProducto,
    cantidad: number,
    precioUnitario?: Dinero,
    fechaAgregado: Date = new Date()
  ) {
    this.validarDatos(id, producto, cantidad);

    this._id = id;
    this._producto = { ...producto };
    this._cantidad = cantidad;
    this._precioUnitario = precioUnitario || Dinero.create(producto.precio);
    this._fechaAgregado = fechaAgregado;
  }

  static crear(producto: DatosProducto, cantidad: number): ItemPedido {
    const id = this.generarId();
    return new ItemPedido(id, producto, cantidad);
  }

  static desde(datos: {
    id: string;
    producto: DatosProducto;
    cantidad: number;
    precioUnitario: number;
    fechaAgregado: Date;
  }): ItemPedido {
    return new ItemPedido(
      datos.id,
      datos.producto,
      datos.cantidad,
      Dinero.create(datos.precioUnitario),
      datos.fechaAgregado
    );
  }

  get id(): string {
    return this._id;
  }

  get producto(): DatosProducto {
    return { ...this._producto };
  }

  get cantidad(): number {
    return this._cantidad;
  }

  get precioUnitario(): Dinero {
    return this._precioUnitario;
  }

  get fechaAgregado(): Date {
    return this._fechaAgregado;
  }

  // Métodos de negocio
  calcularSubtotal(): Dinero {
    return this._precioUnitario.multiplicar(this._cantidad);
  }

  actualizarCantidad(nuevaCantidad: number): void {
    this.validarCantidad(nuevaCantidad);
    this._cantidad = nuevaCantidad;
  }

  incrementarCantidad(incremento: number = 1): void {
    this.validarCantidad(incremento);
    this._cantidad += incremento;
  }

  decrementarCantidad(decremento: number = 1): void {
    const nuevaCantidad = this._cantidad - decremento;
    this.validarCantidad(nuevaCantidad);
    this._cantidad = nuevaCantidad;
  }

  esDelProducto(productoId: string): boolean {
    return this._producto.id === productoId;
  }

  tieneDescuento(): boolean {
    return this._precioUnitario.valor < this._producto.precio;
  }

  calcularDescuento(): Dinero {
    if (!this.tieneDescuento()) {
      return Dinero.cero();
    }

    const precioOriginal = Dinero.create(this._producto.precio);
    return precioOriginal.restar(this._precioUnitario).multiplicar(this._cantidad);
  }

  obtenerResumen(): string {
    const subtotal = this.calcularSubtotal();
    return `${this._cantidad}x ${this._producto.nombre} - ${subtotal.formatear()}`;
  }

  // Métodos de comparación
  equals(otro: ItemPedido): boolean {
    return this._id === otro._id;
  }

  esIgualProducto(otro: ItemPedido): boolean {
    return this._producto.id === otro._producto.id;
  }

  // Serialización
  toJSON(): any {
    return {
      id: this._id,
      producto: this._producto,
      cantidad: this._cantidad,
      precioUnitario: this._precioUnitario.toJSON(),
      subtotal: this.calcularSubtotal().toJSON(),
      fechaAgregado: this._fechaAgregado.toISOString(),
      tieneDescuento: this.tieneDescuento(),
      descuento: this.tieneDescuento() ? this.calcularDescuento().toJSON() : null,
      resumen: this.obtenerResumen(),
    };
  }

  // Validaciones privadas
  private validarDatos(id: string, producto: DatosProducto, cantidad: number): void {
    if (!id || id.trim().length === 0) {
      throw new Error('El ID del item es requerido');
    }

    if (!producto) {
      throw new Error('Los datos del producto son requeridos');
    }

    if (!producto.id || producto.id.trim().length === 0) {
      throw new Error('El ID del producto es requerido');
    }

    if (!producto.nombre || producto.nombre.trim().length === 0) {
      throw new Error('El nombre del producto es requerido');
    }

    if (typeof producto.precio !== 'number' || producto.precio <= 0) {
      throw new Error('El precio del producto debe ser un número mayor a cero');
    }

    this.validarCantidad(cantidad);
  }

  private validarCantidad(cantidad: number): void {
    if (typeof cantidad !== 'number' || isNaN(cantidad)) {
      throw new Error('La cantidad debe ser un número válido');
    }

    if (cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a cero');
    }

    if (cantidad > 99) {
      throw new Error('La cantidad no puede exceder 99 unidades por item');
    }

    if (!Number.isInteger(cantidad)) {
      throw new Error('La cantidad debe ser un número entero');
    }
  }

  private static generarId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ITEM-${timestamp}${random}`.toUpperCase();
  }
}
