/**
 * Interface para integración del proceso de checkout
 * Proyecto Mandorla - Panadería E-commerce
 */

import { PedidoEntity } from '../../../pedidos/domain';
import { ClienteEntity } from '../../../clientes/domain';

export interface DatosCheckout {
  clienteId: string;
  items: Array<{
    productoId: string;
    nombre: string;
    precio: number;
    categoria: string;
    cantidad: number;
    descripcion?: string;
    imagen?: string;
  }>;
  datosEntrega: {
    tipo: 'RETIRO_LOCAL' | 'DELIVERY';
    direccion?: {
      calle: string;
      numero: string;
      piso?: string;
      departamento?: string;
      ciudad: string;
      provincia: string;
      codigoPostal: string;
      referencias?: string;
    };
    fechaEstimada?: Date;
    costoEnvio?: number;
    instrucciones?: string;
  };
  metodoPago: 'MERCADO_PAGO' | 'EFECTIVO' | 'TRANSFERENCIA';
  notas?: string;
}

export interface ResultadoCheckout {
  pedido: PedidoEntity;
  cliente: ClienteEntity;
  configuracionPago?: {
    preferenceId: string;
    initPoint: string;
    externalReference: string;
  };
  resumen: {
    subtotal: number;
    costoEnvio: number;
    total: number;
    cantidadItems: number;
    metodoPago: string;
    tipoEntrega: string;
  };
}

export interface ICheckoutIntegrationService {
  /**
   * Procesa un checkout completo integrando clientes y pedidos
   * @param datos - Datos del checkout
   * @returns Promise<ResultadoCheckout> - Resultado del checkout
   */
  procesarCheckout(datos: DatosCheckout): Promise<ResultadoCheckout>;

  /**
   * Valida que un cliente pueda realizar un pedido
   * @param clienteId - ID del cliente
   * @returns Promise<boolean> - true si puede realizar pedidos
   */
  validarClienteParaPedido(clienteId: string): Promise<boolean>;

  /**
   * Obtiene el historial de pedidos de un cliente
   * @param clienteId - ID del cliente
   * @param limite - Número máximo de pedidos a retornar
   * @returns Promise<PedidoEntity[]> - Historial de pedidos
   */
  obtenerHistorialPedidosCliente(clienteId: string, limite?: number): Promise<PedidoEntity[]>;

  /**
   * Actualiza las estadísticas del cliente después de un pedido
   * @param clienteId - ID del cliente
   * @param pedido - Pedido realizado
   * @returns Promise<void>
   */
  actualizarEstadisticasClientePostPedido(clienteId: string, pedido: PedidoEntity): Promise<void>;
}
