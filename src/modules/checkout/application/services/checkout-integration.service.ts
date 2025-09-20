/**
 * Servicio de integración para el proceso de checkout
 * Conecta los módulos de clientes y pedidos
 * Proyecto Mandorla - Panadería E-commerce
 */

import {
  ICheckoutIntegrationService,
  DatosCheckout,
  ResultadoCheckout,
} from '../../domain/services/checkout-integration.interface';

// Importaciones del módulo de pedidos
import {
  PedidoEntity,
  ItemPedido,
  DatosProducto,
  DatosCliente,
  DatosEntrega,
  IPedidoRepository,
  IPagoService,
  PedidoService,
  PagoPedidoService,
  PedidoNoEncontradoError,
} from '../../../pedidos';

// Importaciones del módulo de clientes
import {
  ClienteEntity,
  ClienteId,
  IClienteRepository,
  ClienteService,
  ClienteNoEncontradoError,
  ClienteNoActivoError,
} from '../../../clientes';

export class CheckoutIntegrationService implements ICheckoutIntegrationService {
  private readonly pedidoService: PedidoService;
  private readonly pagoPedidoService: PagoPedidoService;
  private readonly clienteService: ClienteService;

  constructor(
    private readonly pedidoRepository: IPedidoRepository,
    private readonly clienteRepository: IClienteRepository,
    private readonly pagoService: IPagoService
  ) {
    this.pedidoService = new PedidoService(pedidoRepository);
    this.pagoPedidoService = new PagoPedidoService(pedidoRepository, pagoService);
    this.clienteService = new ClienteService(clienteRepository);
  }

  /**
   * Procesa un checkout completo integrando clientes y pedidos
   */
  async procesarCheckout(datos: DatosCheckout): Promise<ResultadoCheckout> {
    try {
      // 1. Validar y obtener cliente
      const cliente = await this.validarYObtenerCliente(datos.clienteId);

      // 2. Crear el pedido
      const pedido = await this.crearPedido(datos, cliente);

      // 3. Configurar pago si es necesario
      let configuracionPago;
      if (datos.metodoPago === 'MERCADO_PAGO') {
        configuracionPago = await this.configurarPagoMercadoPago(pedido);
      }

      // 4. Actualizar estadísticas del cliente
      await this.actualizarEstadisticasClientePostPedido(datos.clienteId, pedido);

      // 5. Preparar resultado
      const resultado: ResultadoCheckout = {
        pedido,
        cliente,
        configuracionPago,
        resumen: {
          subtotal: pedido.calcularSubtotal().valor,
          costoEnvio: pedido.calcularCostoEnvio().valor,
          total: pedido.calcularTotal().valor,
          cantidadItems: pedido.obtenerCantidadItems(),
          metodoPago: datos.metodoPago,
          tipoEntrega: datos.datosEntrega.tipo,
        },
      };

      return resultado;
    } catch (error) {
      if (
        error instanceof ClienteNoEncontradoError ||
        error instanceof ClienteNoActivoError ||
        error instanceof PedidoNoEncontradoError
      ) {
        throw error;
      }

      throw new Error(
        `Error en checkout: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }

  /**
   * Valida que un cliente pueda realizar un pedido
   */
  async validarClienteParaPedido(clienteId: string): Promise<boolean> {
    try {
      const cliente = await this.clienteService.obtenerCliente({ clienteId });
      return cliente.puedeRealizarPedidos && cliente.estaActivo;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene el historial de pedidos de un cliente
   */
  async obtenerHistorialPedidosCliente(
    clienteId: string,
    limite: number = 10
  ): Promise<PedidoEntity[]> {
    try {
      const resultado = await this.pedidoService.obtenerPedidosCliente(clienteId, 1, limite);

      // Convertir los DTOs de vuelta a entidades (esto es una simplificación)
      // En una implementación real, el servicio debería retornar entidades directamente
      const pedidos: PedidoEntity[] = [];

      for (const pedidoDto of resultado.pedidos) {
        const pedido = await this.pedidoService.obtenerPedido({
          pedidoId: pedidoDto.id,
          incluirHistorialEstados: true,
          incluirDetallesPago: true,
        });

        // Aquí necesitaríamos un método para convertir DTO a entidad
        // Por ahora retornamos un array vacío como placeholder
      }

      return pedidos;
    } catch (error) {
      throw new Error(
        `Error obteniendo historial: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`
      );
    }
  }

  /**
   * Actualiza las estadísticas del cliente después de un pedido
   */
  async actualizarEstadisticasClientePostPedido(
    clienteId: string,
    pedido: PedidoEntity
  ): Promise<void> {
    try {
      // Extraer información del pedido para actualizar estadísticas
      const montoPedido = pedido.calcularTotal().valor;
      const productos = pedido.items.map(item => item.producto.id);
      const categorias = [...new Set(pedido.items.map(item => item.producto.categoria))];

      // Actualizar estadísticas usando el servicio de clientes
      await this.clienteService.registrarPedidoCliente({
        clienteId,
        montoPedido,
        productos,
        categorias,
      });
    } catch (error) {
      // Log del error pero no fallar el checkout por esto
      console.error('Error actualizando estadísticas del cliente:', error);
    }
  }

  // Métodos privados

  private async validarYObtenerCliente(clienteId: string): Promise<ClienteEntity> {
    const clienteDto = await this.clienteService.obtenerCliente({
      clienteId,
      incluirEstadisticas: true,
    });

    if (!clienteDto.puedeRealizarPedidos) {
      throw new ClienteNoActivoError(clienteId, clienteDto.estado);
    }

    // Convertir DTO a entidad (simplificado)
    // En una implementación real, necesitaríamos un mapper completo
    const cliente = ClienteEntity.crear(
      clienteDto.nombre,
      clienteDto.apellido,
      clienteDto.email,
      clienteDto.telefono.value,
      clienteDto.direccionPrincipal
        ? {
            calle: clienteDto.direccionPrincipal.ciudad, // Simplificado
            numero: '1',
            ciudad: clienteDto.direccionPrincipal.ciudad,
            provincia: clienteDto.direccionPrincipal.provincia,
            codigoPostal: '1000',
            pais: 'Argentina',
          }
        : undefined,
      clienteDto.fechaNacimiento ? new Date(clienteDto.fechaNacimiento) : undefined
    );

    return cliente;
  }

  private async crearPedido(datos: DatosCheckout, cliente: ClienteEntity): Promise<PedidoEntity> {
    // Convertir datos del checkout a formato del servicio de pedidos
    const crearPedidoDto = {
      cliente: {
        id: cliente.id.value,
        nombre: cliente.nombre,
        email: cliente.email.value,
        telefono: cliente.telefono.value,
        direccion: datos.datosEntrega.direccion,
      },
      items: datos.items.map(item => ({
        productoId: item.productoId,
        nombre: item.nombre,
        precio: item.precio,
        categoria: item.categoria,
        cantidad: item.cantidad,
        descripcion: item.descripcion,
        imagen: item.imagen,
      })),
      datosEntrega: {
        tipo: datos.datosEntrega.tipo,
        direccion: datos.datosEntrega.direccion,
        fechaEstimada: datos.datosEntrega.fechaEstimada?.toISOString(),
        costoEnvio: datos.datosEntrega.costoEnvio,
        instrucciones: datos.datosEntrega.instrucciones,
      },
      notas: datos.notas,
    };

    // Crear pedido usando el servicio
    const pedidoRespuesta = await this.pedidoService.crearPedido(crearPedidoDto);

    // Obtener la entidad completa del pedido
    const pedidoCompleto = await this.pedidoService.obtenerPedido({
      pedidoId: pedidoRespuesta.pedidoId,
      incluirHistorialEstados: true,
      incluirDetallesPago: false,
    });

    // Convertir DTO a entidad (simplificado)
    // En una implementación real, necesitaríamos un mapper completo
    const datosCliente: DatosCliente = {
      id: pedidoCompleto.cliente.id,
      nombre: pedidoCompleto.cliente.nombre,
      email: pedidoCompleto.cliente.email,
      telefono: pedidoCompleto.cliente.telefono,
      direccion: pedidoCompleto.cliente.direccion,
    };

    const items = pedidoCompleto.items.map(item => {
      const datosProducto: DatosProducto = {
        id: item.producto.id,
        nombre: item.producto.nombre,
        precio: item.producto.precio,
        categoria: item.producto.categoria,
        descripcion: item.producto.descripcion,
        imagen: item.producto.imagen,
      };
      return ItemPedido.crear(datosProducto, item.cantidad);
    });

    const datosEntrega: DatosEntrega = {
      tipo: pedidoCompleto.datosEntrega.tipo as 'RETIRO_LOCAL' | 'DELIVERY',
      direccion: pedidoCompleto.datosEntrega.direccion,
      fechaEstimada: pedidoCompleto.datosEntrega.fechaEstimada
        ? new Date(pedidoCompleto.datosEntrega.fechaEstimada)
        : undefined,
      costoEnvio: pedidoCompleto.datosEntrega.costoEnvio,
      instrucciones: pedidoCompleto.datosEntrega.instrucciones,
    };

    const pedido = PedidoEntity.crear(datosCliente, items, datosEntrega, pedidoCompleto.notas);

    return pedido;
  }

  private async configurarPagoMercadoPago(pedido: PedidoEntity): Promise<{
    preferenceId: string;
    initPoint: string;
    externalReference: string;
  }> {
    const configuracionPago = {
      pedidoId: pedido.id.value,
      urlsCallback: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/pending`,
      },
      autoReturn: 'approved' as const,
      cuotasMaximas: 12,
    };

    const respuestaPago = await this.pagoPedidoService.configurarPagoMercadoPago(configuracionPago);

    return {
      preferenceId: respuestaPago.preferenceId,
      initPoint: respuestaPago.initPoint,
      externalReference: respuestaPago.externalReference,
    };
  }
}
