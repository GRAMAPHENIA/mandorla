/**
 * Value Object para email con validaciones
 * Proyecto Mandorla - Panadería E-commerce
 */

export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value.toLowerCase().trim();
  }

  static create(value: string): Email {
    this.validate(value);
    return new Email(value);
  }

  get value(): string {
    return this._value;
  }

  get dominio(): string {
    return this._value.split('@')[1];
  }

  get usuario(): string {
    return this._value.split('@')[0];
  }

  esGmail(): boolean {
    return this.dominio === 'gmail.com';
  }

  esHotmail(): boolean {
    return ['hotmail.com', 'outlook.com', 'live.com'].includes(this.dominio);
  }

  esYahoo(): boolean {
    return ['yahoo.com', 'yahoo.com.ar'].includes(this.dominio);
  }

  esProveedorConocido(): boolean {
    const proveedoresConocidos = [
      'gmail.com',
      'hotmail.com',
      'outlook.com',
      'live.com',
      'yahoo.com',
      'yahoo.com.ar',
      'icloud.com',
      'protonmail.com',
    ];

    return proveedoresConocidos.includes(this.dominio);
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  toJSON(): string {
    return this._value;
  }

  private static validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('El email es requerido');
    }

    const email = value.toLowerCase().trim();

    // Validación básica de formato
    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!patronEmail.test(email)) {
      throw new Error('El formato del email no es válido');
    }

    // Validaciones adicionales
    if (email.length > 254) {
      throw new Error('El email no puede exceder 254 caracteres');
    }

    const [usuario, dominio] = email.split('@');

    if (usuario.length > 64) {
      throw new Error('La parte del usuario del email no puede exceder 64 caracteres');
    }

    if (dominio.length > 253) {
      throw new Error('El dominio del email no puede exceder 253 caracteres');
    }

    // Validar caracteres especiales
    if (usuario.startsWith('.') || usuario.endsWith('.')) {
      throw new Error('El usuario del email no puede comenzar o terminar con punto');
    }

    if (usuario.includes('..')) {
      throw new Error('El usuario del email no puede contener puntos consecutivos');
    }

    // Validar dominio
    if (dominio.startsWith('-') || dominio.endsWith('-')) {
      throw new Error('El dominio no puede comenzar o terminar con guión');
    }

    if (!dominio.includes('.')) {
      throw new Error('El dominio debe contener al menos un punto');
    }

    // Validar que el dominio tenga al menos una extensión válida
    const partesdominio = dominio.split('.');
    const extension = partesdominio[partesdominio.length - 1];

    if (extension.length < 2) {
      throw new Error('La extensión del dominio debe tener al menos 2 caracteres');
    }
  }
}
