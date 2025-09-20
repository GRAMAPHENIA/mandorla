/**
 * Value Object para dirección completa
 * Proyecto Mandorla - Panadería E-commerce
 */

export interface DatosDireccion {
  calle: string;
  numero: string;
  piso?: string;
  departamento?: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
  referencias?: string;
  entreCalles?: string;
}

export class Direccion {
  private readonly _calle: string;
  private readonly _numero: string;
  private readonly _piso?: string;
  private readonly _departamento?: string;
  private readonly _ciudad: string;
  private readonly _provincia: string;
  private readonly _codigoPostal: string;
  private readonly _pais: string;
  private readonly _referencias?: string;
  private readonly _entreCalles?: string;

  private constructor(datos: DatosDireccion) {
    this._calle = datos.calle.trim();
    this._numero = datos.numero.trim();
    this._piso = datos.piso?.trim();
    this._departamento = datos.departamento?.trim();
    this._ciudad = datos.ciudad.trim();
    this._provincia = datos.provincia.trim();
    this._codigoPostal = datos.codigoPostal.trim();
    this._pais = datos.pais.trim();
    this._referencias = datos.referencias?.trim();
    this._entreCalles = datos.entreCalles?.trim();
  }

  static create(datos: DatosDireccion): Direccion {
    this.validate(datos);
    return new Direccion(datos);
  }

  get calle(): string {
    return this._calle;
  }

  get numero(): string {
    return this._numero;
  }

  get piso(): string | undefined {
    return this._piso;
  }

  get departamento(): string | undefined {
    return this._departamento;
  }

  get ciudad(): string {
    return this._ciudad;
  }

  get provincia(): string {
    return this._provincia;
  }

  get codigoPostal(): string {
    return this._codigoPostal;
  }

  get pais(): string {
    return this._pais;
  }

  get referencias(): string | undefined {
    return this._referencias;
  }

  get entreCalles(): string | undefined {
    return this._entreCalles;
  }

  // Métodos de formateo
  formatearCompleta(): string {
    let direccion = `${this._calle} ${this._numero}`;

    if (this._piso) {
      direccion += `, Piso ${this._piso}`;
    }

    if (this._departamento) {
      direccion += `, Depto ${this._departamento}`;
    }

    direccion += `, ${this._ciudad}, ${this._provincia}`;
    direccion += ` (${this._codigoPostal})`;

    if (this._pais !== 'Argentina') {
      direccion += `, ${this._pais}`;
    }

    return direccion;
  }

  formatearCorta(): string {
    let direccion = `${this._calle} ${this._numero}`;

    if (this._piso && this._departamento) {
      direccion += ` ${this._piso}°${this._departamento}`;
    } else if (this._piso) {
      direccion += ` Piso ${this._piso}`;
    }

    direccion += `, ${this._ciudad}`;

    return direccion;
  }

  formatearParaEntrega(): string {
    let direccion = this.formatearCompleta();

    if (this._referencias) {
      direccion += `\nReferencias: ${this._referencias}`;
    }

    if (this._entreCalles) {
      direccion += `\nEntre calles: ${this._entreCalles}`;
    }

    return direccion;
  }

  formatearParaGoogleMaps(): string {
    return `${this._calle} ${this._numero}, ${this._ciudad}, ${this._provincia}, ${this._pais}`;
  }

  // Métodos de consulta
  esArgentina(): boolean {
    return this._pais.toLowerCase() === 'argentina';
  }

  esBuenosAires(): boolean {
    return (
      this.esArgentina() &&
      (this._provincia.toLowerCase().includes('buenos aires') ||
        this._ciudad.toLowerCase().includes('buenos aires'))
    );
  }

  esCABA(): boolean {
    return (
      this.esArgentina() &&
      (this._provincia.toLowerCase().includes('capital federal') ||
        this._provincia.toLowerCase().includes('caba') ||
        this._ciudad.toLowerCase().includes('capital federal'))
    );
  }

  tieneDetallesAdicionales(): boolean {
    return !!(this._piso || this._departamento || this._referencias || this._entreCalles);
  }

  esCompleta(): boolean {
    return !!(
      this._calle &&
      this._numero &&
      this._ciudad &&
      this._provincia &&
      this._codigoPostal &&
      this._pais
    );
  }

  // Validaciones específicas
  esValidaParaDelivery(): boolean {
    return this.esCompleta() && this._calle.length >= 3 && this._numero.length >= 1;
  }

  obtenerDistanciaEstimada(otraDireccion: Direccion): string {
    // Implementación simplificada basada en ciudad/provincia
    if (this._ciudad === otraDireccion._ciudad) {
      return 'Misma ciudad';
    } else if (this._provincia === otraDireccion._provincia) {
      return 'Misma provincia';
    } else if (this._pais === otraDireccion._pais) {
      return 'Mismo país';
    } else {
      return 'Internacional';
    }
  }

  equals(other: Direccion): boolean {
    return (
      this._calle === other._calle &&
      this._numero === other._numero &&
      this._piso === other._piso &&
      this._departamento === other._departamento &&
      this._ciudad === other._ciudad &&
      this._provincia === other._provincia &&
      this._codigoPostal === other._codigoPostal &&
      this._pais === other._pais
    );
  }

  toJSON(): DatosDireccion & {
    formateadaCompleta: string;
    formateadaCorta: string;
    formateadaParaEntrega: string;
    esCompleta: boolean;
    esValidaParaDelivery: boolean;
  } {
    return {
      calle: this._calle,
      numero: this._numero,
      piso: this._piso,
      departamento: this._departamento,
      ciudad: this._ciudad,
      provincia: this._provincia,
      codigoPostal: this._codigoPostal,
      pais: this._pais,
      referencias: this._referencias,
      entreCalles: this._entreCalles,
      formateadaCompleta: this.formatearCompleta(),
      formateadaCorta: this.formatearCorta(),
      formateadaParaEntrega: this.formatearParaEntrega(),
      esCompleta: this.esCompleta(),
      esValidaParaDelivery: this.esValidaParaDelivery(),
    };
  }

  private static validate(datos: DatosDireccion): void {
    if (!datos.calle || datos.calle.trim().length === 0) {
      throw new Error('La calle es requerida');
    }

    if (datos.calle.trim().length < 3) {
      throw new Error('La calle debe tener al menos 3 caracteres');
    }

    if (!datos.numero || datos.numero.trim().length === 0) {
      throw new Error('El número es requerido');
    }

    if (!datos.ciudad || datos.ciudad.trim().length === 0) {
      throw new Error('La ciudad es requerida');
    }

    if (datos.ciudad.trim().length < 2) {
      throw new Error('La ciudad debe tener al menos 2 caracteres');
    }

    if (!datos.provincia || datos.provincia.trim().length === 0) {
      throw new Error('La provincia es requerida');
    }

    if (!datos.codigoPostal || datos.codigoPostal.trim().length === 0) {
      throw new Error('El código postal es requerido');
    }

    // Validar formato de código postal argentino
    if (datos.pais.toLowerCase() === 'argentina') {
      const codigoPostalArgentino = /^[A-Z]?\d{4}[A-Z]{3}?$|^\d{4}$/i;
      if (!codigoPostalArgentino.test(datos.codigoPostal.trim())) {
        throw new Error('El código postal argentino debe tener formato NNNN o ANNNNAAA');
      }
    }

    if (!datos.pais || datos.pais.trim().length === 0) {
      throw new Error('El país es requerido');
    }

    // Validaciones de longitud
    if (datos.calle.length > 100) {
      throw new Error('La calle no puede exceder 100 caracteres');
    }

    if (datos.numero.length > 20) {
      throw new Error('El número no puede exceder 20 caracteres');
    }

    if (datos.piso && datos.piso.length > 10) {
      throw new Error('El piso no puede exceder 10 caracteres');
    }

    if (datos.departamento && datos.departamento.length > 10) {
      throw new Error('El departamento no puede exceder 10 caracteres');
    }

    if (datos.ciudad.length > 50) {
      throw new Error('La ciudad no puede exceder 50 caracteres');
    }

    if (datos.provincia.length > 50) {
      throw new Error('La provincia no puede exceder 50 caracteres');
    }

    if (datos.referencias && datos.referencias.length > 200) {
      throw new Error('Las referencias no pueden exceder 200 caracteres');
    }

    if (datos.entreCalles && datos.entreCalles.length > 100) {
      throw new Error('Entre calles no puede exceder 100 caracteres');
    }
  }
}
