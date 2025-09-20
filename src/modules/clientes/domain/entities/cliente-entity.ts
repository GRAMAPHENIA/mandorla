/**
 * Entidad Cliente - Agregado raíz del dominio
 * Proyecto Mandorla - Panadería E-commerce
 */

import { ClienteId } from '../value-objects/cliente-id';
import { Email } from '../value-objects/email';
import { Telefono } from '../value-objects/telefono';
import { Direccion, DatosDireccion } from '../value-objects/direccion';

export enum TipoCliente {
  REGULAR = 'REGULAR',
  VIP = 'VIP',
  MAYORISTA = 'MAYORISTA',
  CORPORATIVO = 'CORPORATIVO',
}

export enum EstadoCliente {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  SUSPENDIDO = 'SUSPENDIDO',
  BLOQUEADO = 'BLOQUEADO',
}

export interface PreferenciasCliente {
  recibirPromociones: boolean;
  recibirNotificacionesPedidos: boolean;
  recibirNewsletters: boolean;
  metodoPagoPreferido?: string;
  tipoEntregaPreferido?: 'RETIRO_LOCAL' | 'DELIVERY';
  horarioPreferidoEntrega?: string;
  diasPreferidosEntrega?: string[];
}

export interface EstadisticasCliente {
  totalPedidos: number;
  totalGastado: number;
  promedioGastoPorPedido: number;
  ultimoPedido?: Date;
  primerPedido?: Date;
  productosFavoritos: string[];
  categoriasFavoritas: string[];
  frecuenciaCompra: 'ALTA' | 'MEDIA' | 'BAJA';
}

export class ClienteEntity {
  private readonly _id: ClienteId;
  private _nombre: string;
  private _apellido: string;
  private readonly _email: Email;
  private _telefono: Telefono;
  private _direcciones: Direccion[];
  private _direccionPrincipal?: Direccion;
  private _fechaNacimiento?: Date;
  private _tipo: TipoCliente;
  private _estado: EstadoCliente;
  private _preferencias: PreferenciasCliente;
  private _estadisticas: EstadisticasCliente;
  private readonly _fechaRegistro: Date;
  private _fechaUltimaActualizacion: Date;
  private _notas?: string;

  constructor(
    id: ClienteId,
    nombre: string,
    apellido: string,
    email: Email,
    telefono: Telefono,
    direcciones: Direccion[] = [],
    fechaNacimiento?: Date,
    tipo: TipoCliente = TipoCliente.REGULAR,
    estado: EstadoCliente = EstadoCliente.ACTIVO,
    preferencias?: Partial<PreferenciasCliente>,
    fechaRegistro: Date = new Date(),
    notas?: string
  ) {
    this.validarDatos(nombre, apellido);

    this._id = id;
    this._nombre = nombre.trim();
    this._apellido = apellido.trim();
    this._email = email;
    this._telefono = telefono;
    this._direcciones = [...direcciones];
    this._direccionPrincipal = direcciones.length > 0 ? direcciones[0] : undefined;
    this._fechaNacimiento = fechaNacimiento;
    this._tipo = tipo;
    this._estado = estado;
    this._preferencias = this.crearPreferenciasDefault(preferencias);
    this._estadisticas = this.crearEstadisticasDefault();
    this._fechaRegistro = fechaRegistro;
    this._fechaUltimaActualizacion = new Date();
    this._notas = notas;
  }

  static crear(
    nombre: string,
    apellido: string,
    email: string,
    telefono: string,
    direccion?: DatosDireccion,
    fechaNacimiento?: Date,
    notas?: string
  ): ClienteEntity {
    const id = ClienteId.create();
    const emailVO = Email.create(email);
    const telefonoVO = Telefono.create(telefono);
    const direcciones = direccion ? [Direccion.create(direccion)] : [];

    return new ClienteEntity(
      id,
      nombre,
      apellido,
      emailVO,
      telefonoVO,
      direcciones,
      fechaNacimiento,
      TipoCliente.REGULAR,
      EstadoCliente.ACTIVO,
      undefined,
      new Date(),
      notas
    );
  }

  // Getters
  get id(): ClienteId {
    return this._id;
  }

  get nombre(): string {
    return this._nombre;
  }

  get apellido(): string {
    return this._apellido;
  }

  get nombreCompleto(): string {
    return `${this._nombre} ${this._apellido}`;
  }

  get email(): Email {
    return this._email;
  }

  get telefono(): Telefono {
    return this._telefono;
  }

  get direcciones(): Direccion[] {
    return [...this._direcciones];
  }

  get direccionPrincipal(): Direccion | undefined {
    return this._direccionPrincipal;
  }

  get fechaNacimiento(): Date | undefined {
    return this._fechaNacimiento;
  }

  get tipo(): TipoCliente {
    return this._tipo;
  }

  get estado(): EstadoCliente {
    return this._estado;
  }

  get preferencias(): PreferenciasCliente {
    return { ...this._preferencias };
  }

  get estadisticas(): EstadisticasCliente {
    return { ...this._estadisticas };
  }

  get fechaRegistro(): Date {
    return this._fechaRegistro;
  }

  get fechaUltimaActualizacion(): Date {
    return this._fechaUltimaActualizacion;
  }

  get notas(): string | undefined {
    return this._notas;
  }

  // Métodos de negocio - Información personal
  actualizarNombre(nombre: string, apellido: string): void {
    this.validarNombre(nombre);
    this.validarApellido(apellido);

    this._nombre = nombre.trim();
    this._apellido = apellido.trim();
    this.actualizarFechaModificacion();
  }

  actualizarTelefono(telefono: string): void {
    this._telefono = Telefono.create(telefono);
    this.actualizarFechaModificacion();
  }

  actualizarFechaNacimiento(fecha: Date): void {
    this.validarFechaNacimiento(fecha);
    this._fechaNacimiento = fecha;
    this.actualizarFechaModificacion();
  }

  // Métodos de negocio - Direcciones
  agregarDireccion(direccion: DatosDireccion, esPrincipal: boolean = false): void {
    const nuevaDireccion = Direccion.create(direccion);

    // Verificar que no sea duplicada
    const existeDireccion = this._direcciones.some(dir => dir.equals(nuevaDireccion));
    if (existeDireccion) {
      throw new Error('La dirección ya existe para este cliente');
    }

    this._direcciones.push(nuevaDireccion);

    if (esPrincipal || this._direcciones.length === 1) {
      this._direccionPrincipal = nuevaDireccion;
    }

    this.actualizarFechaModificacion();
  }

  actualizarDireccion(indice: number, direccion: DatosDireccion): void {
    if (indice < 0 || indice >= this._direcciones.length) {
      throw new Error('Índice de dirección inválido');
    }

    const nuevaDireccion = Direccion.create(direccion);
    const direccionAnterior = this._direcciones[indice];

    this._direcciones[indice] = nuevaDireccion;

    // Si era la dirección principal, actualizar referencia
    if (this._direccionPrincipal?.equals(direccionAnterior)) {
      this._direccionPrincipal = nuevaDireccion;
    }

    this.actualizarFechaModificacion();
  }

  eliminarDireccion(indice: number): void {
    if (indice < 0 || indice >= this._direcciones.length) {
      throw new Error('Índice de dirección inválido');
    }

    if (this._direcciones.length === 1) {
      throw new Error('No se puede eliminar la única dirección del cliente');
    }

    const direccionEliminada = this._direcciones[indice];
    this._direcciones.splice(indice, 1);

    // Si era la dirección principal, asignar la primera como principal
    if (this._direccionPrincipal?.equals(direccionEliminada)) {
      this._direccionPrincipal = this._direcciones[0];
    }

    this.actualizarFechaModificacion();
  }

  establecerDireccionPrincipal(indice: number): void {
    if (indice < 0 || indice >= this._direcciones.length) {
      throw new Error('Índice de dirección inválido');
    }

    this._direccionPrincipal = this._direcciones[indice];
    this.actualizarFechaModificacion();
  }

  // Métodos de negocio - Estado y tipo
  cambiarTipo(nuevoTipo: TipoCliente, motivo?: string): void {
    if (this._tipo === nuevoTipo) {
      return;
    }

    this._tipo = nuevoTipo;
    this.agregarNota(`Tipo cambiado a ${nuevoTipo}${motivo ? `: ${motivo}` : ''}`);
    this.actualizarFechaModificacion();
  }

  activar(): void {
    if (this._estado === EstadoCliente.ACTIVO) {
      return;
    }

    this._estado = EstadoCliente.ACTIVO;
    this.agregarNota('Cliente activado');
    this.actualizarFechaModificacion();
  }

  desactivar(motivo?: string): void {
    this._estado = EstadoCliente.INACTIVO;
    this.agregarNota(`Cliente desactivado${motivo ? `: ${motivo}` : ''}`);
    this.actualizarFechaModificacion();
  }

  suspender(motivo: string): void {
    this._estado = EstadoCliente.SUSPENDIDO;
    this.agregarNota(`Cliente suspendido: ${motivo}`);
    this.actualizarFechaModificacion();
  }

  bloquear(motivo: string): void {
    this._estado = EstadoCliente.BLOQUEADO;
    this.agregarNota(`Cliente bloqueado: ${motivo}`);
    this.actualizarFechaModificacion();
  }

  // Métodos de negocio - Preferencias
  actualizarPreferencias(preferencias: Partial<PreferenciasCliente>): void {
    this._preferencias = {
      ...this._preferencias,
      ...preferencias,
    };
    this.actualizarFechaModificacion();
  }

  // Métodos de negocio - Estadísticas
  actualizarEstadisticas(estadisticas: Partial<EstadisticasCliente>): void {
    this._estadisticas = {
      ...this._estadisticas,
      ...estadisticas,
    };

    // Recalcular frecuencia de compra
    this._estadisticas.frecuenciaCompra = this.calcularFrecuenciaCompra();

    this.actualizarFechaModificacion();
  }

  registrarNuevoPedido(monto: number, productos: string[], categorias: string[]): void {
    this._estadisticas.totalPedidos += 1;
    this._estadisticas.totalGastado += monto;
    this._estadisticas.promedioGastoPorPedido =
      this._estadisticas.totalGastado / this._estadisticas.totalPedidos;
    this._estadisticas.ultimoPedido = new Date();

    if (!this._estadisticas.primerPedido) {
      this._estadisticas.primerPedido = new Date();
    }

    // Actualizar productos y categorías favoritas
    productos.forEach(producto => {
      if (!this._estadisticas.productosFavoritos.includes(producto)) {
        this._estadisticas.productosFavoritos.push(producto);
      }
    });

    categorias.forEach(categoria => {
      if (!this._estadisticas.categoriasFavoritas.includes(categoria)) {
        this._estadisticas.categoriasFavoritas.push(categoria);
      }
    });

    this._estadisticas.frecuenciaCompra = this.calcularFrecuenciaCompra();
    this.actualizarFechaModificacion();
  }

  // Métodos de consulta
  estaActivo(): boolean {
    return this._estado === EstadoCliente.ACTIVO;
  }

  estaSuspendido(): boolean {
    return this._estado === EstadoCliente.SUSPENDIDO;
  }

  estaBloqueado(): boolean {
    return this._estado === EstadoCliente.BLOQUEADO;
  }

  esVIP(): boolean {
    return this._tipo === TipoCliente.VIP;
  }

  esMayorista(): boolean {
    return this._tipo === TipoCliente.MAYORISTA;
  }

  puedeRealizarPedidos(): boolean {
    return this._estado === EstadoCliente.ACTIVO;
  }

  tieneEdad(): boolean {
    return !!this._fechaNacimiento;
  }

  calcularEdad(): number | undefined {
    if (!this._fechaNacimiento) {
      return undefined;
    }

    const hoy = new Date();
    let edad = hoy.getFullYear() - this._fechaNacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = this._fechaNacimiento.getMonth();

    if (
      mesActual < mesNacimiento ||
      (mesActual === mesNacimiento && hoy.getDate() < this._fechaNacimiento.getDate())
    ) {
      edad--;
    }

    return edad;
  }

  esMayorDeEdad(): boolean {
    const edad = this.calcularEdad();
    return edad !== undefined && edad >= 18;
  }

  tieneMultiplesDirecciones(): boolean {
    return this._direcciones.length > 1;
  }

  tieneDireccionValidaParaDelivery(): boolean {
    return this._direccionPrincipal?.esValidaParaDelivery() || false;
  }

  // Métodos de presentación
  obtenerResumen(): string {
    return `${this.nombreCompleto} (${this._email.value}) - ${this._tipo} - ${this._estado}`;
  }

  obtenerInformacionContacto(): string {
    let info = `${this.nombreCompleto}\n`;
    info += `Email: ${this._email.value}\n`;
    info += `Teléfono: ${this._telefono.formatear()}\n`;

    if (this._direccionPrincipal) {
      info += `Dirección: ${this._direccionPrincipal.formatearCorta()}`;
    }

    return info;
  }

  // Serialización
  toJSON(): any {
    return {
      id: this._id.value,
      nombre: this._nombre,
      apellido: this._apellido,
      nombreCompleto: this.nombreCompleto,
      email: this._email.toJSON(),
      telefono: this._telefono.toJSON(),
      direcciones: this._direcciones.map(dir => dir.toJSON()),
      direccionPrincipal: this._direccionPrincipal?.toJSON(),
      fechaNacimiento: this._fechaNacimiento?.toISOString(),
      edad: this.calcularEdad(),
      tipo: this._tipo,
      estado: this._estado,
      preferencias: this._preferencias,
      estadisticas: this._estadisticas,
      fechaRegistro: this._fechaRegistro.toISOString(),
      fechaUltimaActualizacion: this._fechaUltimaActualizacion.toISOString(),
      notas: this._notas,
      // Campos calculados
      estaActivo: this.estaActivo(),
      esVIP: this.esVIP(),
      puedeRealizarPedidos: this.puedeRealizarPedidos(),
      esMayorDeEdad: this.esMayorDeEdad(),
      tieneDireccionValidaParaDelivery: this.tieneDireccionValidaParaDelivery(),
      resumen: this.obtenerResumen(),
    };
  }

  // Métodos privados
  private validarDatos(nombre: string, apellido: string): void {
    this.validarNombre(nombre);
    this.validarApellido(apellido);
  }

  private validarNombre(nombre: string): void {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error('El nombre es requerido');
    }

    if (nombre.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }

    if (nombre.length > 50) {
      throw new Error('El nombre no puede exceder 50 caracteres');
    }
  }

  private validarApellido(apellido: string): void {
    if (!apellido || apellido.trim().length === 0) {
      throw new Error('El apellido es requerido');
    }

    if (apellido.trim().length < 2) {
      throw new Error('El apellido debe tener al menos 2 caracteres');
    }

    if (apellido.length > 50) {
      throw new Error('El apellido no puede exceder 50 caracteres');
    }
  }

  private validarFechaNacimiento(fecha: Date): void {
    const hoy = new Date();

    if (fecha > hoy) {
      throw new Error('La fecha de nacimiento no puede ser futura');
    }

    const hace150Anos = new Date();
    hace150Anos.setFullYear(hoy.getFullYear() - 150);

    if (fecha < hace150Anos) {
      throw new Error('La fecha de nacimiento no puede ser anterior a 150 años');
    }
  }

  private crearPreferenciasDefault(
    preferencias?: Partial<PreferenciasCliente>
  ): PreferenciasCliente {
    return {
      recibirPromociones: true,
      recibirNotificacionesPedidos: true,
      recibirNewsletters: false,
      tipoEntregaPreferido: 'RETIRO_LOCAL',
      ...preferencias,
    };
  }

  private crearEstadisticasDefault(): EstadisticasCliente {
    return {
      totalPedidos: 0,
      totalGastado: 0,
      promedioGastoPorPedido: 0,
      productosFavoritos: [],
      categoriasFavoritas: [],
      frecuenciaCompra: 'BAJA',
    };
  }

  private calcularFrecuenciaCompra(): 'ALTA' | 'MEDIA' | 'BAJA' {
    if (!this._estadisticas.primerPedido || !this._estadisticas.ultimoPedido) {
      return 'BAJA';
    }

    const diasDesdeRegistro = Math.floor(
      (new Date().getTime() - this._fechaRegistro.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diasDesdeRegistro === 0) {
      return 'BAJA';
    }

    const pedidosPorDia = this._estadisticas.totalPedidos / diasDesdeRegistro;

    if (pedidosPorDia >= 0.1) {
      // Más de 1 pedido cada 10 días
      return 'ALTA';
    } else if (pedidosPorDia >= 0.03) {
      // Más de 1 pedido por mes
      return 'MEDIA';
    } else {
      return 'BAJA';
    }
  }

  private agregarNota(nota: string): void {
    const fecha = new Date().toISOString();
    const nuevaNota = `[${fecha}] ${nota}`;

    if (this._notas) {
      this._notas += `\n${nuevaNota}`;
    } else {
      this._notas = nuevaNota;
    }
  }

  private actualizarFechaModificacion(): void {
    this._fechaUltimaActualizacion = new Date();
  }
}
