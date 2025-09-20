/**
 * DTOs para consulta de pedidos
 * Proyecto Mandorla - Panadería E-commerce
 */

export interface ConsultarPedidosDto {
  clienteId?: string;
  estado?: string;
  fechaDesde?: string; // ISO string
  fechaHasta?: string; // ISO string
  metodoPago?: string;
  tipoEntrega?: 'RETIRO_LOCAL' | 'DELIVERY';
  montoMinimo?: number;
  montoMaximo?: number;
  pagina?: number;
  limite?: number;
  ordenarPor?: 'fechaCreacion' | 'fechaActualizacion' | 'total' | 'estado';
  direccion?: 'ASC' | 'DESC';
}

export interface PedidoResumenDto {
  id: string;
  cliente: {
    id: string;
    nombre: string;
    email: string;
  };
  estado: {
    estado: string;
    descripcion: string;
    fechaCambio: string;
  };
  totales: {
    subtotal: number;
    costoEnvio: number;
    total: number;
    formateado: string;
  };
  datosEntrega: {
    tipo: string;
    direccion?: {
      calle: string;
      numero: string;
      ciudad: string;
    };
  };
  pago?: {
    metodo: string;
    estado: string;
    paymentId?: string;
  };
  cantidadItems: number;
  cantidadTiposProductos: number;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface ConsultarPedidosRespuestaDto {
  pedidos: PedidoResumenDto[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
    tieneSiguiente: boolean;
    tieneAnterior: boolean;
  };
  filtrosAplicados: {
    clienteId?: string;
    estado?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    metodoPago?: string;
    tipoEntrega?: string;
    rangoMonto?: {
      minimo?: number;
      maximo?: number;
    };
  };
}

export interface ObtenerPedidoDto {
  pedidoId: string;
  incluirHistorialEstados?: boolean;
  incluirDetallesPago?: boolean;
}

export interface PedidoDetalleDto {
  id: string;
  cliente: {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    direccion?: {
      calle: string;
      numero: string;
      ciudad: string;
      codigoPostal: string;
      referencias?: string;
    };
  };
  items: Array<{
    id: string;
    producto: {
      id: string;
      nombre: string;
      precio: number;
      categoria: string;
      descripcion?: string;
      imagen?: string;
    };
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    tieneDescuento: boolean;
    descuento?: number;
  }>;
  estado: {
    estado: string;
    descripcion: string;
    fechaCambio: string;
  };
  historialEstados?: Array<{
    estado: string;
    descripcion: string;
    fechaCambio: string;
    motivo?: string;
  }>;
  pago?: {
    metodo: string;
    estado: string;
    descripcionEstado: string;
    monto: number;
    moneda: string;
    formateado: string;
    fechaCreacion: string;
    fechaActualizacion: string;
    detallesMercadoPago?: {
      preferenceId?: string;
      paymentId?: string;
      externalReference?: string;
      paymentType?: string;
      installments?: number;
      fechaAprobacion?: string;
    };
  };
  datosEntrega: {
    tipo: string;
    direccion?: {
      calle: string;
      numero: string;
      ciudad: string;
      codigoPostal: string;
      referencias?: string;
    };
    fechaEstimada?: string;
    costoEnvio: number;
    instrucciones?: string;
  };
  totales: {
    subtotal: number;
    costoEnvio: number;
    total: number;
    formateado: string;
  };
  cantidadItems: number;
  cantidadTiposProductos: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  notas?: string;
  resumenItems: string;
  descripcionCompleta: string;
}

export interface EstadisticasPedidosDto {
  periodo: {
    fechaDesde?: string;
    fechaHasta?: string;
  };
  resumen: {
    totalPedidos: number;
    ventasTotales: number;
    ventasPromedio: number;
    ticketPromedio: number;
  };
  pedidosPorEstado: Array<{
    estado: string;
    cantidad: number;
    porcentaje: number;
  }>;
  ventasPorDia: Array<{
    fecha: string;
    pedidos: number;
    ventas: number;
    ventasFormateadas: string;
  }>;
  productosMasVendidos: Array<{
    productoId: string;
    nombre: string;
    categoria: string;
    cantidadVendida: number;
    ventasTotales: number;
    ventasFormateadas: string;
  }>;
  clientesRecurrentes: Array<{
    clienteId: string;
    nombre: string;
    email: string;
    pedidos: number;
    ventasTotales: number;
    ventasFormateadas: string;
    ultimoPedido: string;
  }>;
  metodosPagoMasUsados: Array<{
    metodo: string;
    cantidad: number;
    porcentaje: number;
    ventasTotales: number;
  }>;
  tiposEntregaMasUsados: Array<{
    tipo: string;
    cantidad: number;
    porcentaje: number;
  }>;
}
