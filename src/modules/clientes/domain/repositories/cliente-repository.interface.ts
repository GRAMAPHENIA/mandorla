/**
 * Interface del repositorio de clientes
 * Proyecto Mandorla - Panadería E-commerce
 */

import { ClienteEntity, TipoCliente, EstadoCliente } from '../entities/cliente-entity';
import { ClienteId } from '../value-objects/cliente-id';
import { Email } from '../value-objects/email';
import { Telefono } from '../value-objects/telefono';

export interface FiltrosClientes {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  tipo?: TipoCliente;
  estado?: EstadoCliente;
  ciudad?: string;
  provincia?: string;
  fechaRegistroDesde?: Date;
  fechaRegistroHasta?: Date;
  edadMinima?: number;
  edadMaxima?: number;
  esVIP?: boolean;
  tieneMultiplesDirecciones?: boolean;
  recibirPromociones?: boolean;
}

export interface OpcionesPaginacionClientes {
  pagina: number;
  limite: number;
  ordenarPor?:
    | 'nombre'
    | 'apellido'
    | 'email'
    | 'fechaRegistro'
    | 'fechaUltimaActualizacion'
    | 'totalPedidos'
    | 'totalGastado';
  direccion?: 'ASC' | 'DESC';
}

export interface ResultadoPaginadoClientes<T> {
  items: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
  tieneSiguiente: boolean;
  tieneAnterior: boolean;
}

export interface EstadisticasClientes {
  totalClientes: number;
  clientesPorTipo: Record<TipoCliente, number>;
  clientesPorEstado: Record<EstadoCliente, number>;
  clientesRegistradosUltimoMes: number;
  clientesActivosUltimoMes: number;
  edadPromedio: number;
  distribucionPorCiudad: Array<{ ciudad: string; cantidad: number }>;
  distribucionPorProvincia: Array<{ provincia: string; cantidad: number }>;
  clientesConMasPedidos: Array<{
    clienteId: string;
    nombre: string;
    email: string;
    totalPedidos: number;
    totalGastado: number;
  }>;
  clientesVIPMasActivos: Array<{
    clienteId: string;
    nombre: string;
    email: string;
    ultimoPedido: Date;
  }>;
  tasaRetencion: number;
  clientesNuevosVsRecurrentes: {
    nuevos: number;
    recurrentes: number;
  };
}

/**
 * Repositorio para la gestión de clientes
 * Implementa el patrón Repository para abstraer la persistencia
 */
export interface IClienteRepository {
  /**
   * Guarda un cliente (crear o actualizar)
   * @param cliente - Entidad del cliente a guardar
   * @returns Promise<void>
   * @throws ErrorRepositorioClientesError - Si hay error en la persistencia
   */
  guardar(cliente: ClienteEntity): Promise<void>;

  /**
   * Busca un cliente por su ID
   * @param id - ID del cliente
   * @returns Promise<ClienteEntity | null> - Cliente encontrado o null
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  buscarPorId(id: ClienteId): Promise<ClienteEntity | null>;

  /**
   * Busca un cliente por su ID como string
   * @param id - ID del cliente como string
   * @returns Promise<ClienteEntity | null> - Cliente encontrado o null
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  buscarPorIdString(id: string): Promise<ClienteEntity | null>;

  /**
   * Busca un cliente por email
   * @param email - Email del cliente
   * @returns Promise<ClienteEntity | null> - Cliente encontrado o null
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  buscarPorEmail(email: Email): Promise<ClienteEntity | null>;

  /**
   * Busca un cliente por email como string
   * @param email - Email del cliente como string
   * @returns Promise<ClienteEntity | null> - Cliente encontrado o null
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  buscarPorEmailString(email: string): Promise<ClienteEntity | null>;

  /**
   * Busca un cliente por teléfono
   * @param telefono - Teléfono del cliente
   * @returns Promise<ClienteEntity | null> - Cliente encontrado o null
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  buscarPorTelefono(telefono: Telefono): Promise<ClienteEntity | null>;

  /**
   * Busca un cliente por teléfono como string
   * @param telefono - Teléfono del cliente como string
   * @returns Promise<ClienteEntity | null> - Cliente encontrado o null
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  buscarPorTelefonoString(telefono: string): Promise<ClienteEntity | null>;

  /**
   * Busca clientes por nombre (búsqueda parcial)
   * @param nombre - Nombre a buscar
   * @param opciones - Opciones de paginación
   * @returns Promise<ResultadoPaginadoClientes<ClienteEntity>> - Clientes encontrados
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  buscarPorNombre(
    nombre: string,
    opciones?: OpcionesPaginacionClientes
  ): Promise<ResultadoPaginadoClientes<ClienteEntity>>;

  /**
   * Busca clientes por tipo
   * @param tipo - Tipo de cliente
   * @param opciones - Opciones de paginación
   * @returns Promise<ResultadoPaginadoClientes<ClienteEntity>> - Clientes del tipo especificado
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  buscarPorTipo(
    tipo: TipoCliente,
    opciones?: OpcionesPaginacionClientes
  ): Promise<ResultadoPaginadoClientes<ClienteEntity>>;

  /**
   * Busca clientes por estado
   * @param estado - Estado del cliente
   * @param opciones - Opciones de paginación
   * @returns Promise<ResultadoPaginadoClientes<ClienteEntity>> - Clientes con el estado especificado
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  buscarPorEstado(
    estado: EstadoCliente,
    opciones?: OpcionesPaginacionClientes
  ): Promise<ResultadoPaginadoClientes<ClienteEntity>>;

  /**
   * Busca clientes con filtros avanzados
   * @param filtros - Filtros a aplicar
   * @param opciones - Opciones de paginación
   * @returns Promise<ResultadoPaginadoClientes<ClienteEntity>> - Clientes filtrados
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  buscarConFiltros(
    filtros: FiltrosClientes,
    opciones?: OpcionesPaginacionClientes
  ): Promise<ResultadoPaginadoClientes<ClienteEntity>>;

  /**
   * Obtiene todos los clientes con paginación
   * @param opciones - Opciones de paginación
   * @returns Promise<ResultadoPaginadoClientes<ClienteEntity>> - Todos los clientes paginados
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  obtenerTodos(
    opciones?: OpcionesPaginacionClientes
  ): Promise<ResultadoPaginadoClientes<ClienteEntity>>;

  /**
   * Obtiene clientes VIP activos
   * @param limite - Número máximo de clientes a retornar
   * @returns Promise<ClienteEntity[]> - Clientes VIP activos
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  obtenerClientesVIP(limite?: number): Promise<ClienteEntity[]>;

  /**
   * Obtiene clientes registrados recientemente
   * @param dias - Número de días hacia atrás (por defecto 30)
   * @param limite - Número máximo de clientes a retornar
   * @returns Promise<ClienteEntity[]> - Clientes registrados recientemente
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  obtenerClientesRecientes(dias?: number, limite?: number): Promise<ClienteEntity[]>;

  /**
   * Obtiene clientes inactivos (sin pedidos en X días)
   * @param diasInactividad - Días sin actividad para considerar inactivo
   * @param limite - Número máximo de clientes a retornar
   * @returns Promise<ClienteEntity[]> - Clientes inactivos
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  obtenerClientesInactivos(diasInactividad?: number, limite?: number): Promise<ClienteEntity[]>;

  /**
   * Obtiene clientes por ubicación
   * @param ciudad - Ciudad a filtrar (opcional)
   * @param provincia - Provincia a filtrar (opcional)
   * @param opciones - Opciones de paginación
   * @returns Promise<ResultadoPaginadoClientes<ClienteEntity>> - Clientes de la ubicación
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  obtenerClientesPorUbicacion(
    ciudad?: string,
    provincia?: string,
    opciones?: OpcionesPaginacionClientes
  ): Promise<ResultadoPaginadoClientes<ClienteEntity>>;

  /**
   * Obtiene clientes que cumplen años en un rango de fechas
   * @param fechaDesde - Fecha desde
   * @param fechaHasta - Fecha hasta
   * @returns Promise<ClienteEntity[]> - Clientes que cumplen años
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  obtenerClientesCumpleanos(fechaDesde: Date, fechaHasta: Date): Promise<ClienteEntity[]>;

  /**
   * Cuenta clientes por estado
   * @param estado - Estado a contar (opcional, si no se especifica cuenta todos)
   * @returns Promise<number> - Cantidad de clientes
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  contarPorEstado(estado?: EstadoCliente): Promise<number>;

  /**
   * Cuenta clientes por tipo
   * @param tipo - Tipo a contar (opcional, si no se especifica cuenta todos)
   * @returns Promise<number> - Cantidad de clientes
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  contarPorTipo(tipo?: TipoCliente): Promise<number>;

  /**
   * Obtiene estadísticas de clientes
   * @param fechaDesde - Fecha desde (opcional)
   * @param fechaHasta - Fecha hasta (opcional)
   * @returns Promise<EstadisticasClientes> - Estadísticas calculadas
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  obtenerEstadisticas(fechaDesde?: Date, fechaHasta?: Date): Promise<EstadisticasClientes>;

  /**
   * Verifica si existe un cliente con el email especificado
   * @param email - Email a verificar
   * @returns Promise<boolean> - true si existe, false si no
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  existeEmail(email: Email): Promise<boolean>;

  /**
   * Verifica si existe un cliente con el email especificado (string)
   * @param email - Email a verificar como string
   * @returns Promise<boolean> - true si existe, false si no
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  existeEmailString(email: string): Promise<boolean>;

  /**
   * Verifica si existe un cliente con el teléfono especificado
   * @param telefono - Teléfono a verificar
   * @returns Promise<boolean> - true si existe, false si no
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  existeTelefono(telefono: Telefono): Promise<boolean>;

  /**
   * Verifica si existe un cliente con el teléfono especificado (string)
   * @param telefono - Teléfono a verificar como string
   * @returns Promise<boolean> - true si existe, false si no
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  existeTelefonoString(telefono: string): Promise<boolean>;

  /**
   * Verifica si existe un cliente con el ID especificado
   * @param id - ID del cliente
   * @returns Promise<boolean> - true si existe, false si no
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  existe(id: ClienteId): Promise<boolean>;

  /**
   * Elimina un cliente (solo para casos excepcionales)
   * @param id - ID del cliente a eliminar
   * @returns Promise<boolean> - true si se eliminó, false si no existía
   * @throws ErrorRepositorioClientesError - Si hay error en la eliminación
   */
  eliminar(id: ClienteId): Promise<boolean>;

  /**
   * Busca clientes por rango de fechas de registro
   * @param fechaDesde - Fecha desde
   * @param fechaHasta - Fecha hasta
   * @param opciones - Opciones de paginación
   * @returns Promise<ResultadoPaginadoClientes<ClienteEntity>> - Clientes en el rango de fechas
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  buscarPorRangoFechasRegistro(
    fechaDesde: Date,
    fechaHasta: Date,
    opciones?: OpcionesPaginacionClientes
  ): Promise<ResultadoPaginadoClientes<ClienteEntity>>;

  /**
   * Busca clientes que aceptan recibir promociones
   * @param opciones - Opciones de paginación
   * @returns Promise<ResultadoPaginadoClientes<ClienteEntity>> - Clientes que aceptan promociones
   * @throws ErrorRepositorioClientesError - Si hay error en la consulta
   */
  buscarClientesParaPromociones(
    opciones?: OpcionesPaginacionClientes
  ): Promise<ResultadoPaginadoClientes<ClienteEntity>>;

  /**
   * Actualiza las estadísticas de un cliente
   * @param clienteId - ID del cliente
   * @param estadisticas - Nuevas estadísticas
   * @returns Promise<void>
   * @throws ErrorRepositorioClientesError - Si hay error en la actualización
   */
  actualizarEstadisticas(
    clienteId: ClienteId,
    estadisticas: Partial<import('../entities/cliente-entity').EstadisticasCliente>
  ): Promise<void>;
}
