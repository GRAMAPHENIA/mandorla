/**
 * DTOs para actualización de clientes
 * Proyecto Mandorla - Panadería E-commerce
 */

export interface ActualizarDatosPersonalesDto {
  clienteId: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  fechaNacimiento?: string; // ISO string
}

export interface ActualizarDireccionDto {
  clienteId: string;
  indiceDireccion: number;
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

export interface AgregarDireccionDto {
  clienteId: string;
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
  esPrincipal?: boolean;
}

export interface EliminarDireccionDto {
  clienteId: string;
  indiceDireccion: number;
}

export interface EstablecerDireccionPrincipalDto {
  clienteId: string;
  indiceDireccion: number;
}

export interface ActualizarPreferenciasDto {
  clienteId: string;
  recibirPromociones?: boolean;
  recibirNotificacionesPedidos?: boolean;
  recibirNewsletters?: boolean;
  metodoPagoPreferido?: string;
  tipoEntregaPreferido?: 'RETIRO_LOCAL' | 'DELIVERY';
  horarioPreferidoEntrega?: string;
  diasPreferidosEntrega?: string[];
}

export interface CambiarTipoClienteDto {
  clienteId: string;
  nuevoTipo: 'REGULAR' | 'VIP' | 'MAYORISTA' | 'CORPORATIVO';
  motivo?: string;
}

export interface CambiarEstadoClienteDto {
  clienteId: string;
  nuevoEstado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO' | 'BLOQUEADO';
  motivo?: string;
}

export interface ActualizarEstadisticasClienteDto {
  clienteId: string;
  totalPedidos?: number;
  totalGastado?: number;
  promedioGastoPorPedido?: number;
  ultimoPedido?: string; // ISO string
  primerPedido?: string; // ISO string
  productosFavoritos?: string[];
  categoriasFavoritas?: string[];
}

export interface RegistrarPedidoClienteDto {
  clienteId: string;
  montoPedido: number;
  productos: string[];
  categorias: string[];
}

// DTOs de respuesta
export interface ActualizarClienteRespuestaDto {
  clienteId: string;
  camposActualizados: string[];
  fechaActualizacion: string;
  mensaje: string;
}

export interface AgregarDireccionRespuestaDto {
  clienteId: string;
  indiceDireccion: number;
  direccion: {
    formateadaCompleta: string;
    formateadaCorta: string;
    esValidaParaDelivery: boolean;
  };
  esPrincipal: boolean;
  totalDirecciones: number;
  fechaActualizacion: string;
}

export interface EliminarDireccionRespuestaDto {
  clienteId: string;
  direccionEliminada: {
    formateadaCorta: string;
  };
  nuevaDireccionPrincipal?: {
    formateadaCorta: string;
  };
  totalDirecciones: number;
  fechaActualizacion: string;
}

export interface CambiarTipoClienteRespuestaDto {
  clienteId: string;
  tipoAnterior: string;
  tipoNuevo: string;
  motivo?: string;
  fechaCambio: string;
  beneficiosNuevoTipo?: string[];
}

export interface CambiarEstadoClienteRespuestaDto {
  clienteId: string;
  estadoAnterior: string;
  estadoNuevo: string;
  motivo?: string;
  fechaCambio: string;
  puedeRealizarPedidos: boolean;
  accionesDisponibles: string[];
}

export interface ActualizarEstadisticasRespuestaDto {
  clienteId: string;
  estadisticasActualizadas: {
    totalPedidos: number;
    totalGastado: number;
    totalGastadoFormateado: string;
    promedioGastoPorPedido: number;
    promedioGastoPorPedidoFormateado: string;
    ultimoPedido?: string;
    primerPedido?: string;
    frecuenciaCompra: string;
    cantidadProductosFavoritos: number;
    cantidadCategoriasFavoritas: number;
  };
  fechaActualizacion: string;
}
