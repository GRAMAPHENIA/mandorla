/**
 * Exportaciones del dominio de clientes
 * Proyecto Mandorla - Panadería E-commerce
 */

// Value Objects
export { ClienteId } from './value-objects/cliente-id';
export { Email } from './value-objects/email';
export { Telefono } from './value-objects/telefono';
export { Direccion, type DatosDireccion } from './value-objects/direccion';

// Entities
export {
  ClienteEntity,
  TipoCliente,
  EstadoCliente,
  type PreferenciasCliente,
  type EstadisticasCliente,
} from './entities/cliente-entity';

// Repositories
export {
  type IClienteRepository,
  type FiltrosClientes,
  type OpcionesPaginacionClientes,
  type ResultadoPaginadoClientes,
  type EstadisticasClientes,
} from './repositories/cliente-repository.interface';

// Errors
export {
  ClienteError,
  ClienteIdInvalidoError,
  NombreInvalidoError,
  ApellidoInvalidoError,
  EmailInvalidoError,
  TelefonoInvalidoError,
  DireccionInvalidaError,
  FechaNacimientoInvalidaError,
  ClienteNoActivoError,
  ClienteSuspendidoError,
  ClienteBloqueadoError,
  ClienteMenorDeEdadError,
  DireccionDuplicadaError,
  DireccionNoValidaParaDeliveryError,
  IndicesDireccionInvalidoError,
  NoSePuedeEliminarUnicaDireccionError,
  CambioEstadoInvalidoError,
  ClienteNoEncontradoError,
  ClientesNoEncontradosError,
  EmailYaRegistradoError,
  TelefonoYaRegistradoError,
  ClienteDuplicadoError,
  ErrorRepositorioClientesError,
  ErrorServicioClientesError,
  ErrorValidacionClienteError,
  ErrorActualizacionClienteError,
  OperacionNoPermitidaError,
} from './errors/cliente-errors';
