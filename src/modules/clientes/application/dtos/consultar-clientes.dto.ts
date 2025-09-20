/**
 * DTOs para consulta de clientes
 * Proyecto Mandorla - Panadería E-commerce
 */

export interface ConsultarClientesDto {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  tipo?: 'REGULAR' | 'VIP' | 'MAYORISTA' | 'CORPORATIVO';
  estado?: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO' | 'BLOQUEADO';
  ciudad?: string;
  provincia?: string;
  fechaRegistroDesde?: string; // ISO string
  fechaRegistroHasta?: string; // ISO string
  edadMinima?: number;
  edadMaxima?: number;
  esVIP?: boolean;
  tieneMultiplesDirecciones?: boolean;
  recibirPromociones?: boolean;
  pagina?: number;
  limite?: number;
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

export interface ClienteResumenDto {
  id: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  email: string;
  telefono: {
    value: string;
    formateado: string;
    esCelular: boolean;
  };
  direccionPrincipal?: {
    formateadaCorta: string;
    ciudad: string;
    provincia: string;
  };
  edad?: number;
  tipo: string;
  estado: string;
  fechaRegistro: string;
  fechaUltimaActualizacion: string;
  estadisticas: {
    totalPedidos: number;
    totalGastado: number;
    ultimoPedido?: string;
    frecuenciaCompra: string;
  };
  estaActivo: boolean;
  esVIP: boolean;
  puedeRealizarPedidos: boolean;
}

export interface ConsultarClientesRespuestaDto {
  clientes: ClienteResumenDto[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
    tieneSiguiente: boolean;
    tieneAnterior: boolean;
  };
  filtrosAplicados: {
    nombre?: string;
    apellido?: string;
    email?: string;
    tipo?: string;
    estado?: string;
    ciudad?: string;
    provincia?: string;
    rangoFechas?: {
      desde?: string;
      hasta?: string;
    };
    rangoEdad?: {
      minima?: number;
      maxima?: number;
    };
    esVIP?: boolean;
  };
}

export interface ObtenerClienteDto {
  clienteId: string;
  incluirEstadisticas?: boolean;
  incluirHistorialDirecciones?: boolean;
}

export interface ClienteDetalleDto {
  id: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  email: string;
  telefono: {
    value: string;
    codigoArea: string;
    numero: string;
    pais: string;
    formateado: string;
    formatoLocal: string;
    formatoWhatsApp: string;
    esCelular: boolean;
  };
  direcciones: Array<{
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
    formateadaCompleta: string;
    formateadaCorta: string;
    formateadaParaEntrega: string;
    esCompleta: boolean;
    esValidaParaDelivery: boolean;
  }>;
  direccionPrincipal?: {
    formateadaCompleta: string;
    formateadaCorta: string;
    formateadaParaEntrega: string;
    ciudad: string;
    provincia: string;
    esValidaParaDelivery: boolean;
  };
  fechaNacimiento?: string;
  edad?: number;
  tipo: string;
  estado: string;
  preferencias: {
    recibirPromociones: boolean;
    recibirNotificacionesPedidos: boolean;
    recibirNewsletters: boolean;
    metodoPagoPreferido?: string;
    tipoEntregaPreferido?: string;
    horarioPreferidoEntrega?: string;
    diasPreferidosEntrega?: string[];
  };
  estadisticas?: {
    totalPedidos: number;
    totalGastado: number;
    promedioGastoPorPedido: number;
    ultimoPedido?: string;
    primerPedido?: string;
    productosFavoritos: string[];
    categoriasFavoritas: string[];
    frecuenciaCompra: string;
  };
  fechaRegistro: string;
  fechaUltimaActualizacion: string;
  notas?: string;
  // Campos calculados
  estaActivo: boolean;
  esVIP: boolean;
  puedeRealizarPedidos: boolean;
  esMayorDeEdad: boolean;
  tieneDireccionValidaParaDelivery: boolean;
  tieneMultiplesDirecciones: boolean;
  resumen: string;
  informacionContacto: string;
}

export interface EstadisticasClientesDto {
  periodo: {
    fechaDesde?: string;
    fechaHasta?: string;
  };
  resumen: {
    totalClientes: number;
    clientesActivos: number;
    clientesVIP: number;
    clientesRegistradosUltimoMes: number;
    clientesActivosUltimoMes: number;
    edadPromedio: number;
    tasaRetencion: number;
  };
  clientesPorTipo: Array<{
    tipo: string;
    cantidad: number;
    porcentaje: number;
  }>;
  clientesPorEstado: Array<{
    estado: string;
    cantidad: number;
    porcentaje: number;
  }>;
  distribucionGeografica: {
    porCiudad: Array<{
      ciudad: string;
      cantidad: number;
      porcentaje: number;
    }>;
    porProvincia: Array<{
      provincia: string;
      cantidad: number;
      porcentaje: number;
    }>;
  };
  clientesDestacados: {
    conMasPedidos: Array<{
      clienteId: string;
      nombre: string;
      email: string;
      totalPedidos: number;
      totalGastado: number;
      totalGastadoFormateado: string;
    }>;
    vipMasActivos: Array<{
      clienteId: string;
      nombre: string;
      email: string;
      ultimoPedido: string;
      diasSinPedido: number;
    }>;
  };
  segmentacion: {
    nuevosVsRecurrentes: {
      nuevos: number;
      recurrentes: number;
      porcentajeNuevos: number;
      porcentajeRecurrentes: number;
    };
    porFrecuenciaCompra: {
      alta: number;
      media: number;
      baja: number;
    };
  };
}
