import { CrearCheckoutDto } from '../dtos/checkout.dto';
import {
  MetodoPago,
  DatosEntregaInterface,
  DatosPagoInterface,
  DatosClienteInterface,
} from '../../domain/types/checkout.types';
import { CheckoutError, DatosEntregaInvalidosError } from '../../domain/errors/checkout-errors';

/**
 * Validador para datos de checkout
 */
export class CheckoutValidator {
  static validarDatosCheckout(datos: CrearCheckoutDto): void {
    // Validar que hay cliente o datos de cliente
    if (!datos.clienteId && !datos.datosCliente) {
      throw new CheckoutError('Se requiere clienteId o datosCliente');
    }

    if (!datos.carritoId) {
      throw new CheckoutError('carritoId es requerido');
    }

    this.validarMetodoPago(datos.metodoPago);
    this.validarDatosEntrega(datos.datosEntrega);

    // Si es pago con tarjeta, validar datos de pago
    if (
      (datos.metodoPago === 'tarjeta_credito' || datos.metodoPago === 'tarjeta_debito') &&
      !datos.datosPago
    ) {
      throw new CheckoutError('Se requieren datos de pago para tarjeta');
    }

    if (datos.datosPago) {
      this.validarDatosPago(datos.datosPago);
    }

    if (datos.datosCliente) {
      this.validarDatosCliente(datos.datosCliente);
    }
  }

  static validarDatosEntrega(datos: DatosEntregaInterface): void {
    if (!datos.direccion || datos.direccion.trim().length < 5) {
      throw new DatosEntregaInvalidosError(
        'La dirección es requerida y debe tener al menos 5 caracteres'
      );
    }

    if (datos.direccion.length > 200) {
      throw new DatosEntregaInvalidosError('La dirección no puede exceder 200 caracteres');
    }

    if (!datos.ciudad || datos.ciudad.trim().length === 0) {
      throw new DatosEntregaInvalidosError('La ciudad es requerida');
    }

    if (datos.ciudad.length > 100) {
      throw new DatosEntregaInvalidosError('La ciudad no puede exceder 100 caracteres');
    }

    if (!datos.codigoPostal || !/^\d{4}$/.test(datos.codigoPostal)) {
      throw new DatosEntregaInvalidosError('El código postal debe tener 4 dígitos');
    }

    if (!datos.telefono) {
      throw new DatosEntregaInvalidosError('El teléfono es requerido');
    }

    const patronTelefono = /^(\+54)?[\s\-\(\)]?[0-9\s\-\(\)]{8,15}$/;
    if (!patronTelefono.test(datos.telefono)) {
      throw new DatosEntregaInvalidosError('Formato de teléfono inválido');
    }

    if (datos.instrucciones && datos.instrucciones.length > 500) {
      throw new DatosEntregaInvalidosError('Las instrucciones no pueden exceder 500 caracteres');
    }
  }

  static validarDatosPago(datos: DatosPagoInterface): void {
    // Validar número de tarjeta (Luhn algorithm básico)
    const numeroLimpio = datos.numeroTarjeta.replace(/[\s\-]/g, '');
    if (!/^\d{13,19}$/.test(numeroLimpio)) {
      throw new CheckoutError('Número de tarjeta inválido');
    }

    // Validar vencimiento
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(datos.vencimiento)) {
      throw new CheckoutError('Formato de vencimiento inválido (MM/YY)');
    }

    const [mes, año] = datos.vencimiento.split('/');
    const fechaVencimiento = new Date(2000 + parseInt(año), parseInt(mes) - 1);
    if (fechaVencimiento < new Date()) {
      throw new CheckoutError('La tarjeta está vencida');
    }

    // Validar CVV
    if (!/^\d{3}$/.test(datos.cvv)) {
      throw new CheckoutError('CVV debe tener 3 dígitos');
    }

    // Validar titular
    if (!datos.titular || datos.titular.trim().length < 2) {
      throw new CheckoutError('El nombre del titular es requerido');
    }

    if (datos.titular.length > 100) {
      throw new CheckoutError('El nombre del titular no puede exceder 100 caracteres');
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(datos.titular)) {
      throw new CheckoutError('El nombre del titular solo puede contener letras y espacios');
    }
  }

  static validarDatosCliente(datos: DatosClienteInterface): void {
    if (!datos.nombre || datos.nombre.trim().length === 0) {
      throw new CheckoutError('El nombre es requerido');
    }

    if (!datos.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
      throw new CheckoutError('Email inválido');
    }

    if (!datos.telefono) {
      throw new CheckoutError('El teléfono es requerido');
    }
  }

  static validarMetodoPago(metodoPago: MetodoPago): void {
    const metodosValidos: MetodoPago[] = [
      'efectivo',
      'tarjeta_credito',
      'tarjeta_debito',
      'transferencia',
    ];

    if (!metodosValidos.includes(metodoPago)) {
      throw new CheckoutError(`Método de pago inválido: ${metodoPago}`);
    }
  }
}
