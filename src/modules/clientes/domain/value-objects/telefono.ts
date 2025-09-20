/**
 * Value Object para teléfono con validaciones
 * Proyecto Mandorla - Panadería E-commerce
 */

export class Telefono {
  private readonly _value: string;
  private readonly _codigoArea: string;
  private readonly _numero: string;
  private readonly _pais: string;

  private constructor(value: string, codigoArea: string, numero: string, pais: string = 'AR') {
    this._value = value;
    this._codigoArea = codigoArea;
    this._numero = numero;
    this._pais = pais;
  }

  static create(value: string): Telefono {
    const telefono = this.limpiarTelefono(value);
    this.validate(telefono);

    const { codigoArea, numero, pais } = this.parsearTelefono(telefono);

    return new Telefono(telefono, codigoArea, numero, pais);
  }

  get value(): string {
    return this._value;
  }

  get codigoArea(): string {
    return this._codigoArea;
  }

  get numero(): string {
    return this._numero;
  }

  get pais(): string {
    return this._pais;
  }

  formatear(): string {
    if (this._pais === 'AR') {
      // Formato argentino: +54 11 1234-5678
      return `+54 ${this._codigoArea} ${this._numero.substring(0, 4)}-${this._numero.substring(4)}`;
    }

    // Formato genérico
    return `+${this._value}`;
  }

  formatearLocal(): string {
    if (this._pais === 'AR') {
      // Formato local argentino: (011) 1234-5678
      return `(0${this._codigoArea}) ${this._numero.substring(0, 4)}-${this._numero.substring(4)}`;
    }

    return this._value;
  }

  formatearWhatsApp(): string {
    // Formato para WhatsApp (sin espacios ni guiones)
    if (this._pais === 'AR') {
      return `549${this._codigoArea}${this._numero}`;
    }

    return this._value;
  }

  esCelular(): boolean {
    if (this._pais === 'AR') {
      // En Argentina, los celulares tienen 8 dígitos después del código de área
      return this._numero.length === 8;
    }

    return true; // Asumir celular para otros países
  }

  esTelefonoFijo(): boolean {
    return !this.esCelular();
  }

  esArgentino(): boolean {
    return this._pais === 'AR';
  }

  obtenerCodigoAreaCompleto(): string {
    if (this._pais === 'AR') {
      return `54${this._codigoArea}`;
    }

    return this._codigoArea;
  }

  equals(other: Telefono): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this.formatear();
  }

  toJSON(): {
    value: string;
    codigoArea: string;
    numero: string;
    pais: string;
    formateado: string;
    formatoLocal: string;
    formatoWhatsApp: string;
    esCelular: boolean;
  } {
    return {
      value: this._value,
      codigoArea: this._codigoArea,
      numero: this._numero,
      pais: this._pais,
      formateado: this.formatear(),
      formatoLocal: this.formatearLocal(),
      formatoWhatsApp: this.formatearWhatsApp(),
      esCelular: this.esCelular(),
    };
  }

  private static limpiarTelefono(value: string): string {
    // Remover todos los caracteres que no sean dígitos o +
    return value.replace(/[^\d+]/g, '');
  }

  private static validate(value: string): void {
    if (!value || value.length === 0) {
      throw new Error('El teléfono es requerido');
    }

    // Validar que tenga al menos 8 dígitos (mínimo para un teléfono válido)
    const soloDigitos = value.replace(/\D/g, '');
    if (soloDigitos.length < 8) {
      throw new Error('El teléfono debe tener al menos 8 dígitos');
    }

    if (soloDigitos.length > 15) {
      throw new Error('El teléfono no puede tener más de 15 dígitos');
    }

    // Si comienza con +, validar formato internacional
    if (value.startsWith('+')) {
      if (value.length < 10) {
        throw new Error('El formato internacional debe tener al menos 10 caracteres');
      }
    }
  }

  private static parsearTelefono(value: string): {
    codigoArea: string;
    numero: string;
    pais: string;
  } {
    let telefono = value;
    let pais = 'AR';
    let codigoArea = '';
    let numero = '';

    // Detectar si es formato internacional
    if (telefono.startsWith('+54') || telefono.startsWith('54')) {
      // Teléfono argentino
      pais = 'AR';
      telefono = telefono.replace(/^\+?54/, '');

      // Extraer código de área (2-4 dígitos)
      if (telefono.startsWith('11')) {
        // Buenos Aires
        codigoArea = '11';
        numero = telefono.substring(2);
      } else if (telefono.startsWith('9')) {
        // Código de área de 3 dígitos que comienza con 9
        codigoArea = telefono.substring(0, 3);
        numero = telefono.substring(3);
      } else {
        // Otros códigos de área
        const posiblesCodigosArea = ['221', '223', '261', '341', '351', '381', '388'];
        const codigoEncontrado = posiblesCodigosArea.find(codigo => telefono.startsWith(codigo));

        if (codigoEncontrado) {
          codigoArea = codigoEncontrado;
          numero = telefono.substring(codigoEncontrado.length);
        } else {
          // Asumir código de área de 2 dígitos
          codigoArea = telefono.substring(0, 2);
          numero = telefono.substring(2);
        }
      }
    } else if (telefono.startsWith('0')) {
      // Formato nacional argentino
      telefono = telefono.substring(1); // Remover el 0 inicial

      if (telefono.startsWith('11')) {
        codigoArea = '11';
        numero = telefono.substring(2);
      } else {
        // Asumir código de área de 3 dígitos
        codigoArea = telefono.substring(0, 3);
        numero = telefono.substring(3);
      }
    } else {
      // Formato local o internacional de otro país
      if (telefono.length === 8 || telefono.length === 7) {
        // Probablemente un número local de Buenos Aires
        codigoArea = '11';
        numero = telefono;
      } else if (telefono.startsWith('+')) {
        // Formato internacional de otro país
        pais = 'INTL';
        codigoArea = telefono.substring(1, 4); // Asumir código de país de 3 dígitos
        numero = telefono.substring(4);
      } else {
        // Asumir formato local con código de área incluido
        codigoArea = telefono.substring(0, 3);
        numero = telefono.substring(3);
      }
    }

    return { codigoArea, numero, pais };
  }
}
