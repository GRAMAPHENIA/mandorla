/**
 * Exportaciones del dominio de pedidos
 * Proyecto Mandorla - Panadería E-commerce
 */

// Value Objects
export { PedidoId } from './value-objects/pedido-id';
export { Dinero } from './value-objects/dinero';
export { EstadoPedido, EstadoPedidoEnum } from './value-objects/estado-pedido';
export {
  InformacionPago,
  MetodoPago,
  EstadoPago,
  type DatosMercadoPago,
} from './value-objects/informacion-pago';

// Entities
export { ItemPedido, type DatosProducto } from './entities/item-pedido';
export { PedidoEntity, type DatosCliente, type DatosEntrega } from './entities/pedido-entity';

// Repositories
export {
  type IPedidoRepository,
  type FiltrosPedidos,
  type OpcionesPaginacion,
  type ResultadoPaginado,
  type EstadisticasPedidos,
} from './repositories/pedido-repository.interface';

// Services
export {
  type IPagoService,
  type ItemPago,
  type DatosCompradorPago,
  type ConfiguracionPreference,
  type RespuestaPreference,
  type DatosPago,
  type NotificacionMercadoPago,
  type ResultadoReembolso,
} from './services/pago-service.interface';

// Errors
export {
  PedidoError,
  PedidoIdInvalidoError,
  DatosClienteInvalidosError,
  ItemsPedidoInvalidosError,
  DatosEntregaInvalidosError,
  CantidadInvalidaError,
  MontoInvalidoError,
  EstadoPedidoInvalidoError,
  PedidoNoPuedeSerCanceladoError,
  PedidoYaFinalizadoError,
  PagoNoConfiguradoError,
  MetodoPagoInvalidoError,
  ProductoNoEncontradoEnPedidoError,
  DeliveryDireccionRequeridaError,
  PedidoNoEncontradoError,
  PedidosClienteNoEncontradosError,
  PagoYaConfirmadoError,
  PagoRechazadoError,
  ErrorMercadoPagoError,
  PreferenceIdInvalidoError,
  PaymentIdInvalidoError,
  MontoNoCoincideError,
  ErrorRepositorioPedidosError,
  ErrorServicioPagosError,
  ErrorNotificacionError,
} from './errors/pedido-errors';
