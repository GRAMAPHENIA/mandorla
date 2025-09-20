/**
 * Interface del repositorio de pedidos
 * Proyecto Mandorla - Panadería E-commerce
 */

import { PedidoEntity } from '../entities/pedido-entity';
import { PedidoId } from '../value-objects/pedido-id';
import { EstadoPedidoEnum } from '../value-objects/estado-pedido';

export interface FiltrosPedidos {
  clienteId?: string;
  estado?: EstadoPedidoEnum;
  fechaDesde?: Date;
  fechaHasta?: Date;
  metodoPago?: string;
  tipoEntrega?: 'RETIRO_LOCAL' | 'DELIVERY';
  montoMinimo?: number;
  montoMaximo?: number;
}

export interface OpcionesPaginacion {
  pagina: number;
  limite: number;
  ordenarPor?: 'fechaCreacion' | 'fechaActualizacion' | 'total' | 'estado';
  direccion?: 'ASC' | 'DESC';
}

export interface ResultadoPaginado<T> {
  items: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
  tieneSiguiente: boolean;
  tieneAnterior: boolean;
}

export interface EstadisticasPedidos {
  totalPedidos: number;
  pedidosPorEstado: Record<EstadoPedidoEnum, number>;
  ventasTotales: number;
  ventasPromedio: number;
  pedidosPorDia: Array<{ fecha: string; cantidad: number; ventas: number }>;
  productosMasVendidos: Array<{ productoId: string; nombre: string; cantidad: number }>;
  clientesRecurrentes: Array<{ clienteId: string; nombre: string; pedidos: number }>;
}

/**
 * Repositorio para la gestión de pedidos
 * Implementa el patrón Repository para abstraer la persistencia
 */
export interface IPedidoRepository {
  /**
   * Guarda un pedido (crear o actualizar)
   * @param pedido - Entidad del pedido a guardar
   * @returns Promise<void>
   * @throws ErrorRepositorioPedidosError - Si hay error en la persistencia
   */
  guardar(pedido: PedidoEntity): Promise<void>;

  /**
   * Busca un pedido por su ID
   * @param id - ID del pedido
   * @returns Promise<PedidoEntity | null> - Pedido encontrado o null
   * @throws ErrorRepositorioPedidosError - Si hay error en la consulta
   */
  buscarPorId(id: PedidoId): Promise<PedidoEntity | null>;

  /**
   * Busca un pedido por su ID como string
   * @param id - ID del pedido como string
   * @returns Promise<PedidoEntity | null> - Pedido encontrado o null
   * @throws ErrorRepositorioPedidosError - Si hay error en la consulta
   */
  buscarPorIdString(id: string): Promise<PedidoEntity | null>;

  /**
   * Busca pedidos por ID del cliente
   * @param clienteId - ID del cliente
   * @param opciones - Opciones de paginación
   * @returns Promise<ResultadoPaginado<PedidoEntity>> - Pedidos del cliente paginados
   * @throws ErrorRepositorioPedidosError - Si hay error en la consulta
   */
  buscarPorCliente(
    clienteId: string,
    opciones?: OpcionesPaginacion
  ): Promise<ResultadoPaginado<PedidoEntity>>;

  /**
   * Busca pedidos por estado
   * @param estado - Estado del pedido
   * @param opciones - Opciones de paginación
   * @returns Promise<ResultadoPaginado<PedidoEntity>> - Pedidos con el estado especificado
   * @throws ErrorRepositorioPedidosError - Si hay error en la consulta
   */
  buscarPorEstado(
    estado: EstadoPedidoEnum,
    opciones?: OpcionesPaginacion
  ): Promise<ResultadoPaginado<PedidoEntity>>;

  /**
   * Busca pedidos con filtros avanzados
   * @param filtros - Filtros a aplicar
   * @param opciones - Opciones de paginación
   * @returns Promise<ResultadoPaginado<PedidoEntity>> - Pedidos filtrados
   * @throws ErrorRepositorioPedidosError - Si hay error en la consulta
   */
  buscarConFiltros(
    filtros: FiltrosPedidos,
    opciones?: OpcionesPaginacion
  ): Promise<ResultadoPaginado<PedidoEntity>>;

  /**
   * Busca un pedido por external reference de Mercado Pago
   * @param externalReference - External reference del pago
   * @returns Promise<PedidoEntity | null> - Pedido encontrado o null
   * @throws ErrorRepositorioPedidosError - Si hay error en la consulta
   */
  buscarPorExternalReference(externalReference: string): Promise<PedidoEntity | null>;

  /**
   * Busca un pedido por payment ID de Mercado Pago
   * @param paymentId - Payment ID del pago
   * @returns Promise<PedidoEntity | null> - Pedido encontrado o null
   * @throws ErrorRepositorioPedidosError - Si hay error en la consulta
   */
  buscarPorPaymentId(paymentId: string): Promise<PedidoEntity | null>;

  /**
   * Obtiene todos los pedidos con paginación
   * @param opciones - Opciones de paginación
   * @returns Promise<ResultadoPaginado<PedidoEntity>> - Todos los pedidos paginados
   * @throws ErrorRepositorioPedidosError - Si hay error en la consulta
   */
  obtenerTodos(opciones?: OpcionesPaginacion): Promise<ResultadoPaginado<PedidoEntity>>;

  /**
   * Obtiene pedidos recientes (últimos 30 días)
   * @param limite - Número máximo de pedidos a retornar
   * @returns Promise<PedidoEntity[]> - Pedidos recientes
   * @throws ErrorRepositorioPedidosError - Si hay error en la consulta
   */
  obtenerRecientes(limite?: number): Promise<PedidoEntity[]>;

  /**
   * Obtiene pedidos pendientes de pago (más de X minutos)
   * @param minutosVencimiento - Minutos después de los cuales se considera vencido
   * @returns Promise<PedidoEntity[]> - Pedidos pendientes vencidos
   * @throws ErrorRepositorioPedidosError - Si hay error en la consulta
   */
  obtenerPendientesVencidos(minutosVencimiento?: number): Promise<PedidoEntity[]>;

  /**
   * Obtiene pedidos listos para entrega
   * @returns Promise<PedidoEntity[]> - Pedidos listos para entrega
   * @throws ErrorRepositorioPedidosError - Si hay error en la consulta
   */
  obtenerListosParaEntrega(): Promise<PedidoEntity[]>;

  /**
   * Cuenta pedidos por estado
   * @param estado - Estado a contar (opcional, si no se especifica cuenta todos)
   * @returns Promise<number> - Cantidad de pedidos
   * @throws ErrorRepositorioPedidosError - Si hay error en la consulta
   */
  contarPorEstado(estado?: EstadoPedidoEnum): Promise<number>;

  /**
   * Obtiene estadísticas de pedidos
   * @param fechaDesde - Fecha desde (opcional)
   * @param fechaHasta - Fecha hasta (opcional)
   * @returns Promise<EstadisticasPedidos> - Estadísticas calculadas
   * @throws ErrorRepositorioPedidosError - Si hay error en la consulta
   */
  obtenerEstadisticas(fechaDesde?: Date, fechaHasta?: Date): Promise<EstadisticasPedidos>;

  /**
   * Elimina un pedido (solo para casos excepcionales)
   * @param id - ID del pedido a eliminar
   * @returns Promise<boolean> - true si se eliminó, false si no existía
   * @throws ErrorRepositorioPedidosError - Si hay error en la eliminación
   */
  eliminar(id: PedidoId): Promise<boolean>;

  /**
   * Verifica si existe un pedido con el ID especificado
   * @param id - ID del pedido
   * @returns Promise<boolean> - true si existe, false si no
   * @throws ErrorRepositorioPedidosError - Si hay error en la consulta
   */
  existe(id: PedidoId): Promise<boolean>;

  /**
   * Obtiene el último pedido de un cliente
   * @param clienteId - ID del cliente
   * @returns Promise<PedidoEntity | null> - Último pedido del cliente o null
   * @throws ErrorRepositorioPedidosError - Si hay error en la consulta
   */
  obtenerUltimoPedidoCliente(clienteId: string): Promise<PedidoEntity | null>;

  /**
   * Busca pedidos por rango de fechas
   * @param fechaDesde - Fecha desde
   * @param fechaHasta - Fecha hasta
   * @param opciones - Opciones de paginación
   * @returns Promise<ResultadoPaginado<PedidoEntity>> - Pedidos en el rango de fechas
   * @throws ErrorRepositorioPedidosError - Si hay error en la consulta
   */
  buscarPorRangoFechas(
    fechaDesde: Date,
    fechaHasta: Date,
    opciones?: OpcionesPaginacion
  ): Promise<ResultadoPaginado<PedidoEntity>>;
}
