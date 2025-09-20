/**
 * DTO para crear un nuevo pedido
 * Proyecto Mandorla - Panadería E-commerce
 */

export interface CrearItemPedidoDto {
  productoId: string;
  nombre: string;
  precio: number;
  categoria: string;
  cantidad: number;
  descripcion?: string;
  imagen?: string;
}

export interface CrearDatosClienteDto {
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
}

export interface CrearDatosEntregaDto {
  tipo: 'RETIRO_LOCAL' | 'DELIVERY';
  direccion?: {
    calle: string;
    numero: string;
    ciudad: string;
    codigoPostal: string;
    referencias?: string;
  };
  fechaEstimada?: string; // ISO string
  costoEnvio?: number;
  instrucciones?: string;
}

export interface CrearPedidoDto {
  cliente: CrearDatosClienteDto;
  items: CrearItemPedidoDto[];
  datosEntrega: CrearDatosEntregaDto;
  notas?: string;
}

export interface CrearPedidoRespuestaDto {
  pedidoId: string;
  cliente: {
    id: string;
    nombre: string;
    email: string;
  };
  items: Array<{
    id: string;
    producto: {
      id: string;
      nombre: string;
      precio: number;
    };
    cantidad: number;
    subtotal: number;
  }>;
  estado: {
    estado: string;
    descripcion: string;
    fechaCambio: string;
  };
  totales: {
    subtotal: number;
    costoEnvio: number;
    total: number;
  };
  datosEntrega: {
    tipo: string;
    direccion?: {
      calle: string;
      numero: string;
      ciudad: string;
      codigoPostal: string;
    };
    costoEnvio: number;
  };
  fechaCreacion: string;
  notas?: string;
}
