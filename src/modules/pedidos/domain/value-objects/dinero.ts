/**
 * Value Object para representar dinero con validaciones
 * Proyecto Mandorla - Panadería E-commerce
 */

export class Dinero {
  private readonly _valor: number;
  private readonly _moneda: string;

  private constructor(valor: number, moneda: string = 'ARS') {
    this._valor = valor;
    this._moneda = moneda;
  }

  static create(valor: number, moneda: string = 'ARS'): Dinero {
    this.validate(valor, moneda);
    return new Dinero(valor, moneda);
  }

  static cero(): Dinero {
    return new Dinero(0, 'ARS');
  }

  get valor(): number {
    return this._valor;
  }

  get moneda(): string {
    return this._moneda;
  }

  sumar(otro: Dinero): Dinero {
    this.validarMismaMoneda(otro);
    return new Dinero(this._valor + otro._valor, this._moneda);
  }

  restar(otro: Dinero): Dinero {
    this.validarMismaMoneda(otro);
    const resultado = this._valor - otro._valor;

    if (resultado < 0) {
      throw new Error('El resultado de la resta no puede ser negativo');
    }

    return new Dinero(resultado, this._moneda);
  }

  multiplicar(factor: number): Dinero {
    if (factor < 0) {
      throw new Error('El factor de multiplicación no puede ser negativo');
    }

    return new Dinero(this._valor * factor, this._moneda);
  }

  aplicarDescuento(porcentaje: number): Dinero {
    if (porcentaje < 0 || porcentaje > 100) {
      throw new Error('El porcentaje de descuento debe estar entre 0 y 100');
    }

    const descuento = this._valor * (porcentaje / 100);
    return new Dinero(this._valor - descuento, this._moneda);
  }

  esMayorQue(otro: Dinero): boolean {
    this.validarMismaMoneda(otro);
    return this._valor > otro._valor;
  }

  esMenorQue(otro: Dinero): boolean {
    this.validarMismaMoneda(otro);
    return this._valor < otro._valor;
  }

  esIgualA(otro: Dinero): boolean {
    this.validarMismaMoneda(otro);
    return Math.abs(this._valor - otro._valor) < 0.01; // Tolerancia para decimales
  }

  formatear(): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: this._moneda,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(this._valor);
  }

  toJSON(): { valor: number; moneda: string } {
    return {
      valor: this._valor,
      moneda: this._moneda,
    };
  }

  private static validate(valor: number, moneda: string): void {
    if (typeof valor !== 'number' || isNaN(valor)) {
      throw new Error('El valor debe ser un número válido');
    }

    if (valor < 0) {
      throw new Error('El valor no puede ser negativo');
    }

    if (!moneda || moneda.trim().length === 0) {
      throw new Error('La moneda es requerida');
    }

    // Validar que sea una moneda soportada
    const monedasSoportadas = ['ARS', 'USD', 'EUR'];
    if (!monedasSoportadas.includes(moneda.toUpperCase())) {
      throw new Error(
        `Moneda no soportada: ${moneda}. Soportadas: ${monedasSoportadas.join(', ')}`
      );
    }
  }

  private validarMismaMoneda(otro: Dinero): void {
    if (this._moneda !== otro._moneda) {
      throw new Error(`No se pueden operar diferentes monedas: ${this._moneda} vs ${otro._moneda}`);
    }
  }
}
