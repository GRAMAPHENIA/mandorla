/**
 * Exportaciones de la capa de aplicación de clientes
 * Proyecto Mandorla - Panadería E-commerce
 */

// Services
export { ClienteService } from './services/cliente.service';

// DTOs - Crear Cliente
export {
  type CrearClienteDto,
  type CrearDireccionDto,
  type CrearPreferenciasClienteDto,
  type CrearClienteRespuestaDto,
} from './dtos/crear-cliente.dto';

// DTOs - Consultar Clientes
export {
  type ConsultarClientesDto,
  type ClienteResumenDto,
  type ConsultarClientesRespuestaDto,
  type ObtenerClienteDto,
  type ClienteDetalleDto,
  type EstadisticasClientesDto,
} from './dtos/consultar-clientes.dto';

// DTOs - Actualizar Cliente
export {
  type ActualizarDatosPersonalesDto,
  type ActualizarDireccionDto,
  type AgregarDireccionDto,
  type AgregarDireccionRespuestaDto,
  type EliminarDireccionDto,
  type EliminarDireccionRespuestaDto,
  type EstablecerDireccionPrincipalDto,
  type ActualizarPreferenciasDto,
  type CambiarTipoClienteDto,
  type CambiarTipoClienteRespuestaDto,
  type CambiarEstadoClienteDto,
  type CambiarEstadoClienteRespuestaDto,
  type ActualizarEstadisticasClienteDto,
  type RegistrarPedidoClienteDto,
  type ActualizarClienteRespuestaDto,
  type ActualizarEstadisticasRespuestaDto,
} from './dtos/actualizar-cliente.dto';
