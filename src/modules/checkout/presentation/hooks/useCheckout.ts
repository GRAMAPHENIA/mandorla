import { useState } from 'react';
import { MetodoPago, DatosEntregaInterface } from '../../domain/types/checkout.types';
import {
  CrearCheckoutDto,
  ResumenCheckoutDto,
  ResultadoCheckoutDto,
} from '../../application/dtos/checkout.dto';

/**
 * Hook para manejar el estado del checkout
 */
export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [checkoutData, setCheckoutData] = useState<ResultadoCheckoutDto | null>(null);
  const [resumenCheckout, setResumenCheckout] = useState<ResumenCheckoutDto | null>(null);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<MetodoPago | null>(null);
  const [datosEntrega, setDatosEntrega] = useState<DatosEntregaInterface | null>(null);

  const iniciarCheckout = async (datos: CrearCheckoutDto): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Simulación - en implementación real usaría CheckoutFacade
      const resultado: ResultadoCheckoutDto = {
        exitoso: true,
        pedidoId: 'pedido-test',
        pagoId: 'pago-test',
        total: 5940,
        mensaje: 'Checkout procesado exitosamente',
      };

      setCheckoutData(resultado);
    } catch (err) {
      setError({
        code: 'CHECKOUT_ERROR',
        message: 'Error inesperado en el proceso de checkout',
        type: 'internal',
      });
    } finally {
      setLoading(false);
    }
  };

  const obtenerResumen = async (carritoId: string, codigoDescuento?: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Simulación
      const resumen: ResumenCheckoutDto = {
        items: [],
        subtotal: 5500,
        descuentos: 0,
        impuestos: 440,
        total: 5940,
      };

      setResumenCheckout(resumen);
    } catch (err) {
      setError({
        code: 'CHECKOUT_ERROR',
        message: 'Error al obtener resumen del checkout',
        type: 'internal',
      });
    } finally {
      setLoading(false);
    }
  };

  const validarDatos = async (datos: any): Promise<boolean> => {
    try {
      // Simulación
      return true;
    } catch (err) {
      setError({
        code: 'VALIDATION_ERROR',
        message: 'Error de validación',
        type: 'validation',
      });
      return false;
    }
  };

  const cancelarCheckout = async (checkoutId: string): Promise<void> => {
    // Simulación
    setCheckoutData(null);
  };

  const limpiarError = (): void => {
    setError(null);
  };

  const resetear = (): void => {
    setLoading(false);
    setError(null);
    setCheckoutData(null);
    setResumenCheckout(null);
    setMetodoPagoSeleccionado(null);
    setDatosEntrega(null);
  };

  return {
    loading,
    error,
    checkoutData,
    resumenCheckout,
    metodoPagoSeleccionado,
    datosEntrega,
    iniciarCheckout,
    obtenerResumen,
    validarDatos,
    cancelarCheckout,
    setMetodoPagoSeleccionado,
    setDatosEntrega,
    limpiarError,
    resetear,
  };
}
