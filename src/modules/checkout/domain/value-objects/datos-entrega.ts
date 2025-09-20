import { DatosEntregaInvalidosError } from '../errors/checkout-errors';
import { DatosEntregaInterface } from '../types/checkout.types';

/**
 * Value Object para datos de entrega
 */
export class DatosEntrega {
  private constructor(
    private readonly _direccion: string,
    private readonly _ciudad: string,
    private readonly _codigoPostal: string,
    private readonly _telefono: string,
    private readonly _instrucciones?: string
  ) {}

  static crear(datos: DatosEntregaInterface): DatosEntrega {
    // Normalizar datos
    const direccion = datos.direccion?.trim();
    const ciudad = datos.ciudad?.trim();
    const codigoPostal = datos.codigoPostal?.trim();
    const telefono = datos.telefono?.trim();
    const instrucciones = datos.instrucciones?.trim() || undefined;

    // Validaciones
    this.validarDireccion(direccion);
    this.validarCiudad(ciudad);
    this.validarCodigoPostal(codigoPostal);
    this.validarTelefono(telefono);
    this.validarInstrucciones(instrucciones);

    return new DatosEntrega(direccion, ciudad, codigoPostal, telefono, instrucciones);
  }

  private static validarDireccion(direccion: string): void {
    if (!direccion || direccion.length < 5) {
      throw new DatosEntregaInvalidosError('La dirección debe tener al menos 5 caracteres');
    }
    if (direccion.length > 200) {
      throw new DatosEntregaInvalidosError('La dirección no puede exceder 200 caracteres');
    }
  }

  private static validarCiudad(ciudad: string): void {
    if (!ciudad || ciudad.length < 2) {
      throw new DatosEntregaInvalidosError('La ciudad es requerida');
    }
    if (ciudad.length > 100) {
      throw new DatosEntregaInvalidosError('La ciudad no puede exceder 100 caracteres');
    }
  }

  private static validarCodigoPostal(codigoPostal: string): void {
    if (!codigoPostal || !/^\d{4}$/.test(codigoPostal)) {
      throw new DatosEntregaInvalidosError('El código postal debe tener 4 dígitos');
    }
  }

  private static validarTelefono(telefono: string): void {
    if (!telefono) {
      throw new DatosEntregaInvalidosError('El teléfono es requerido');
    }

    // Patrón flexible para teléfonos argentinos
    const patronTelefono = /^(\+54)?[\s\-\(\)]?[0-9\s\-\(\)]{8,15}$/;
    if (!patronTelefono.test(telefono)) {
      throw new DatosEntregaInvalidosError('Formato de teléfono inválido');
    }
  }

  private static validarInstrucciones(instrucciones?: string): void {
    if (instrucciones && instrucciones.length > 500) {
      throw new DatosEntregaInvalidosError('Las instrucciones no pueden exceder 500 caracteres');
    }
  }

  get direccion(): string {
    return this._direccion;
  }

  get ciudad(): string {
    return this._ciudad;
  }

  get codigoPostal(): string {
    return this._codigoPostal;
  }

  get telefono(): string {
    return this._telefono;
  }

  get instrucciones(): string | undefined {
    return this._instrucciones;
  }

  equals(other: DatosEntrega): boolean {
    if (!other) return false;

    return (
      this._direccion === other._direccion &&
      this._ciudad === other._ciudad &&
      this._codigoPostal === other._codigoPostal &&
      this._telefono === other._telefono &&
      this._instrucciones === other._instrucciones
    );
  }

  toPersistence(): DatosEntregaInterface {
    return {
      direccion: this._direccion,
      ciudad: this._ciudad,
      codigoPostal: this._codigoPostal,
      telefono: this._telefono,
      instrucciones: this._instrucciones,
    };
  }

  static fromPersistence(data: DatosEntregaInterface): DatosEntrega {
    return DatosEntrega.crear(data);
  }
}
