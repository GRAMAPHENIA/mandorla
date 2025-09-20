/**
 * DTO para crear un nuevo cliente
 * Proyecto Mandorla - Panadería E-commerce
 */

export interface CrearDireccionDto {
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

export interface CrearPreferenciasClienteDto {
  recibirPromociones?: boolean;
  recibirNotificacionesPedidos?: boolean;
  recibirNewsletters?: boolean;
  metodoPagoPreferido?: string;
  tipoEntregaPreferido?: 'RETIRO_LOCAL' | 'DELIVERY';
  horarioPreferidoEntrega?: string;
  diasPreferidosEntrega?: string[];
}

export interface CrearClienteDto {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion?: CrearDireccionDto;
  fechaNacimiento?: string; // ISO string
  preferencias?: CrearPreferenciasClienteDto;
  notas?: string;
}

export interface CrearClienteRespuestaDto {
  clienteId: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  email: string;
  telefono: {
    value: string;
    formateado: string;
    formatoLocal: string;
    esCelular: boolean;
  };
  direccion?: {
    formateadaCompleta: string;
    formateadaCorta: string;
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
  };
  fechaRegistro: string;
  esMayorDeEdad: boolean;
  puedeRealizarPedidos: boolean;
  resumen: string;
}
