/**
 * Servicio de aplicación para gestión de pedidos
 * Proyecto Mandorla - Panadería E-commerce
 */

import {
  PedidoEntity,
  PedidoId,
  ItemPedido,
  DatosProducto,
  DatosCliente,
  DatosEntrega,
  EstadoPedidoEnum,
  IPedidoRepository,
  FiltrosPedidos,
  OpcionesPaginacion,
  ResultadoPaginado,
  EstadisticasPedidos,
  PedidoNoEncontradoError,
  EstadoPedidoInvalidoError,
  PedidoNoPuedeSerCanceladoError,
  DatosClienteInvalidosError,
  ItemsPedidoInvalidosError,
  DatosEntregaInvalidosError,
  ErrorRepositorioPedidosError,
} from '../../domain';

import {
  CrearPedidoDto,
  CrearPedidoRespuestaDto,
  ConsultarPedidosDto,
  ConsultarPedidosRespuestaDto,
  ObtenerPedidoDto,
  PedidoDetalleDto,
  PedidoResumenDto,
  EstadisticasPedidosDto,
} from '../dtos';

export class PedidoService {
  constructor(private readonly pedidoRepository: IPedidoRepository) {}

  /**
   * Crea un nuevo pedido
   */
  async crearPedido(datos: CrearPedidoDto): Promise<CrearPedidoRespuestaDto> {
    try {
      // Validar datos de entrada
      this.validarDatosCreacion(datos);

      // Convertir DTOs a objetos de dominio
      const cliente = this.convertirDatosCliente(datos.cliente);
      const items = this.convertirItems(datos.items);
      const datosEntrega = this.convertirDatosEntrega(datos.datosEntrega);

      // Crear entidad de pedido
      const pedido = PedidoEntity.crear(cliente, items, datosEntrega, datos.notas);

      // Guardar en repositorio
      await this.pedidoRepository.guardar(pedido);

      // Convertir a DTO de respuesta
      return this.convertirACrearPedidoRespuesta(pedido);
    } catch (error) {
      if (error instanceof Error) {
        throw new ErrorRepositorioPedidosError('crear pedido', error.message);
      }
      throw error;
    }
  }

  /**
   * Obtiene un pedido por su ID
   */
  async obtenerPedido(datos: ObtenerPedidoDto): Promise<PedidoDetalleDto> {
    try {
      const pedidoId = PedidoId.fromString(datos.pedidoId);
      const pedido = await this.pedidoRepository.buscarPorId(pedidoId);

      if (!pedido) {
        throw new PedidoNoEncontradoError(datos.pedidoId);
      }

      return this.convertirAPedidoDetalle(pedido, {
        incluirHistorialEstados: datos.incluirHistorialEstados,
        incluirDetallesPago: datos.incluirDetallesPago,
      });
    } catch (error) {
      if (error instanceof PedidoNoEncontradoError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ErrorRepositorioPedidosError('obtener pedido', error.message, datos.pedidoId);
      }
      throw error;
    }
  }

  /**
   * Consulta pedidos con filtros y paginación
   */
  async consultarPedidos(datos: ConsultarPedidosDto): Promise<ConsultarPedidosRespuestaDto> {
    try {
      // Convertir DTO a filtros de dominio
      const filtros = this.convertirFiltros(datos);
      const opciones = this.convertirOpcionesPaginacion(datos);

      // Consultar repositorio
      const resultado = await this.pedidoRepository.buscarConFiltros(filtros, opciones);

      // Convertir a DTO de respuesta
      return this.convertirAConsultarPedidosRespuesta(resultado, datos);
    } catch (error) {
      if (error instanceof Error) {
        throw new ErrorRepositorioPedidosError('consultar pedidos', error.message);
      }
      throw error;
    }
  }

  /**
   * Obtiene pedidos de un cliente específico
   */
  async obtenerPedidosCliente(
    clienteId: string,
    pagina: number = 1,
    limite: number = 10
  ): Promise<ConsultarPedidosRespuestaDto> {
    try {
      const opciones: OpcionesPaginacion = {
        pagina,
        limite,
        ordenarPor: 'fechaCreacion',
        direccion: 'DESC',
      };

      const resultado = await this.pedidoRepository.buscarPorCliente(clienteId, opciones);

      return {
        pedidos: resultado.items.map(pedido => this.convertirAPedidoResumen(pedido)),
        paginacion: {
          pagina: resultado.pagina,
          limite: resultado.limite,
          total: resultado.total,
          totalPaginas: resultado.totalPaginas,
          tieneSiguiente: resultado.tieneSiguiente,
          tieneAnterior: resultado.tieneAnterior,
        },
        filtrosAplicados: {
          clienteId,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ErrorRepositorioPedidosError('obtener pedidos cliente', error.message, clienteId);
      }
      throw error;
    }
  }

  /**
   * Cambia el estado de un pedido
   */
  async cambiarEstadoPedido(
    pedidoId: string,
    nuevoEstado: EstadoPedidoEnum,
    motivo?: string
  ): Promise<PedidoDetalleDto> {
    try {
      const id = PedidoId.fromString(pedidoId);
      const pedido = await this.pedidoRepository.buscarPorId(id);

      if (!pedido) {
        throw new PedidoNoEncontradoError(pedidoId);
      }

      // Cambiar estado usando lógica de dominio
      pedido.cambiarEstado(nuevoEstado, motivo);

      // Guardar cambios
      await this.pedidoRepository.guardar(pedido);

      return this.convertirAPedidoDetalle(pedido);
    } catch (error) {
      if (error instanceof PedidoNoEncontradoError || error instanceof EstadoPedidoInvalidoError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ErrorRepositorioPedidosError('cambiar estado pedido', error.message, pedidoId);
      }
      throw error;
    }
  }

  /**
   * Cancela un pedido
   */
  async cancelarPedido(pedidoId: string, motivo: string): Promise<PedidoDetalleDto> {
    try {
      const id = PedidoId.fromString(pedidoId);
      const pedido = await this.pedidoRepository.buscarPorId(id);

      if (!pedido) {
        throw new PedidoNoEncontradoError(pedidoId);
      }

      if (!pedido.puedeSerCancelado()) {
        throw new PedidoNoPuedeSerCanceladoError(pedidoId, pedido.estado.estado);
      }

      // Cancelar usando lógica de dominio
      pedido.cancelar(motivo);

      // Guardar cambios
      await this.pedidoRepository.guardar(pedido);

      return this.convertirAPedidoDetalle(pedido);
    } catch (error) {
      if (
        error instanceof PedidoNoEncontradoError ||
        error instanceof PedidoNoPuedeSerCanceladoError
      ) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ErrorRepositorioPedidosError('cancelar pedido', error.message, pedidoId);
      }
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de pedidos
   */
  async obtenerEstadisticas(fechaDesde?: Date, fechaHasta?: Date): Promise<EstadisticasPedidosDto> {
    try {
      const estadisticas = await this.pedidoRepository.obtenerEstadisticas(fechaDesde, fechaHasta);
      return this.convertirAEstadisticasDto(estadisticas, fechaDesde, fechaHasta);
    } catch (error) {
      if (error instanceof Error) {
        throw new ErrorRepositorioPedidosError('obtener estadísticas', error.message);
      }
      throw error;
    }
  }

  /**
   * Obtiene pedidos recientes
   */
  async obtenerPedidosRecientes(limite: number = 10): Promise<PedidoResumenDto[]> {
    try {
      const pedidos = await this.pedidoRepository.obtenerRecientes(limite);
      return pedidos.map(pedido => this.convertirAPedidoResumen(pedido));
    } catch (error) {
      if (error instanceof Error) {
        throw new ErrorRepositorioPedidosError('obtener pedidos recientes', error.message);
      }
      throw error;
    }
  }

  /**
   * Obtiene pedidos listos para entrega
   */
  async obtenerPedidosListosParaEntrega(): Promise<PedidoResumenDto[]> {
    try {
      const pedidos = await this.pedidoRepository.obtenerListosParaEntrega();
      return pedidos.map(pedido => this.convertirAPedidoResumen(pedido));
    } catch (error) {
      if (error instanceof Error) {
        throw new ErrorRepositorioPedidosError('obtener pedidos listos', error.message);
      }
      throw error;
    }
  }

  // Métodos privados de validación y conversión

  private validarDatosCreacion(datos: CrearPedidoDto): void {
    if (!datos.cliente) {
      throw new DatosClienteInvalidosError('cliente', 'Cliente es requerido');
    }

    if (!datos.items || datos.items.length === 0) {
      throw new ItemsPedidoInvalidosError('Items son requeridos', datos.items);
    }

    if (!datos.datosEntrega) {
      throw new DatosEntregaInvalidosError('datosEntrega', 'Datos de entrega son requeridos');
    }
  }

  private convertirDatosCliente(dto: any): DatosCliente {
    return {
      id: dto.id,
      nombre: dto.nombre,
      email: dto.email,
      telefono: dto.telefono,
      direccion: dto.direccion,
    };
  }

  private convertirItems(dtos: any[]): ItemPedido[] {
    return dtos.map(dto => {
      const producto: DatosProducto = {
        id: dto.productoId,
        nombre: dto.nombre,
        precio: dto.precio,
        categoria: dto.categoria,
        descripcion: dto.descripcion,
        imagen: dto.imagen,
      };

      return ItemPedido.crear(producto, dto.cantidad);
    });
  }

  private convertirDatosEntrega(dto: any): DatosEntrega {
    return {
      tipo: dto.tipo,
      direccion: dto.direccion,
      fechaEstimada: dto.fechaEstimada ? new Date(dto.fechaEstimada) : undefined,
      costoEnvio: dto.costoEnvio,
      instrucciones: dto.instrucciones,
    };
  }

  private convertirFiltros(dto: ConsultarPedidosDto): FiltrosPedidos {
    return {
      clienteId: dto.clienteId,
      estado: dto.estado as EstadoPedidoEnum,
      fechaDesde: dto.fechaDesde ? new Date(dto.fechaDesde) : undefined,
      fechaHasta: dto.fechaHasta ? new Date(dto.fechaHasta) : undefined,
      metodoPago: dto.metodoPago,
      tipoEntrega: dto.tipoEntrega,
      montoMinimo: dto.montoMinimo,
      montoMaximo: dto.montoMaximo,
    };
  }

  private convertirOpcionesPaginacion(dto: ConsultarPedidosDto): OpcionesPaginacion {
    return {
      pagina: dto.pagina || 1,
      limite: dto.limite || 10,
      ordenarPor: dto.ordenarPor || 'fechaCreacion',
      direccion: dto.direccion || 'DESC',
    };
  }

  private convertirACrearPedidoRespuesta(pedido: PedidoEntity): CrearPedidoRespuestaDto {
    const json = pedido.toJSON();

    return {
      pedidoId: json.id,
      cliente: {
        id: json.cliente.id,
        nombre: json.cliente.nombre,
        email: json.cliente.email,
      },
      items: json.items.map((item: any) => ({
        id: item.id,
        producto: {
          id: item.producto.id,
          nombre: item.producto.nombre,
          precio: item.producto.precio,
        },
        cantidad: item.cantidad,
        subtotal: item.subtotal.valor,
      })),
      estado: {
        estado: json.estado.estado,
        descripcion: json.estado.descripcion,
        fechaCambio: json.estado.fechaCambio,
      },
      totales: {
        subtotal: json.subtotal.valor,
        costoEnvio: json.costoEnvio.valor,
        total: json.total.valor,
      },
      datosEntrega: {
        tipo: json.datosEntrega.tipo,
        direccion: json.datosEntrega.direccion,
        costoEnvio: json.costoEnvio.valor,
      },
      fechaCreacion: json.fechaCreacion,
      notas: json.notas,
    };
  }

  private convertirAPedidoDetalle(
    pedido: PedidoEntity,
    opciones?: { incluirHistorialEstados?: boolean; incluirDetallesPago?: boolean }
  ): PedidoDetalleDto {
    const json = pedido.toJSON();

    return {
      id: json.id,
      cliente: json.cliente,
      items: json.items.map((item: any) => ({
        id: item.id,
        producto: item.producto,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario.valor,
        subtotal: item.subtotal.valor,
        tieneDescuento: item.tieneDescuento,
        descuento: item.descuento?.valor,
      })),
      estado: json.estado,
      historialEstados: opciones?.incluirHistorialEstados ? json.historialEstados : undefined,
      pago: opciones?.incluirDetallesPago ? json.informacionPago : undefined,
      datosEntrega: json.datosEntrega,
      totales: {
        subtotal: json.subtotal.valor,
        costoEnvio: json.costoEnvio.valor,
        total: json.total.valor,
        formateado: json.total.formateado,
      },
      cantidadItems: json.cantidadItems,
      cantidadTiposProductos: json.cantidadTiposProductos,
      fechaCreacion: json.fechaCreacion,
      fechaActualizacion: json.fechaActualizacion,
      notas: json.notas,
      resumenItems: json.resumenItems,
      descripcionCompleta: json.descripcionCompleta,
    };
  }

  private convertirAPedidoResumen(pedido: PedidoEntity): PedidoResumenDto {
    const json = pedido.toJSON();

    return {
      id: json.id,
      cliente: {
        id: json.cliente.id,
        nombre: json.cliente.nombre,
        email: json.cliente.email,
      },
      estado: json.estado,
      totales: {
        subtotal: json.subtotal.valor,
        costoEnvio: json.costoEnvio.valor,
        total: json.total.valor,
        formateado: json.total.formateado,
      },
      datosEntrega: {
        tipo: json.datosEntrega.tipo,
        direccion: json.datosEntrega.direccion
          ? {
              calle: json.datosEntrega.direccion.calle,
              numero: json.datosEntrega.direccion.numero,
              ciudad: json.datosEntrega.direccion.ciudad,
            }
          : undefined,
      },
      pago: json.informacionPago
        ? {
            metodo: json.informacionPago.metodo,
            estado: json.informacionPago.estado,
            paymentId: json.informacionPago.datosMercadoPago?.paymentId,
          }
        : undefined,
      cantidadItems: json.cantidadItems,
      cantidadTiposProductos: json.cantidadTiposProductos,
      fechaCreacion: json.fechaCreacion,
      fechaActualizacion: json.fechaActualizacion,
    };
  }

  private convertirAConsultarPedidosRespuesta(
    resultado: ResultadoPaginado<PedidoEntity>,
    filtrosOriginales: ConsultarPedidosDto
  ): ConsultarPedidosRespuestaDto {
    return {
      pedidos: resultado.items.map(pedido => this.convertirAPedidoResumen(pedido)),
      paginacion: {
        pagina: resultado.pagina,
        limite: resultado.limite,
        total: resultado.total,
        totalPaginas: resultado.totalPaginas,
        tieneSiguiente: resultado.tieneSiguiente,
        tieneAnterior: resultado.tieneAnterior,
      },
      filtrosAplicados: {
        clienteId: filtrosOriginales.clienteId,
        estado: filtrosOriginales.estado,
        fechaDesde: filtrosOriginales.fechaDesde,
        fechaHasta: filtrosOriginales.fechaHasta,
        metodoPago: filtrosOriginales.metodoPago,
        tipoEntrega: filtrosOriginales.tipoEntrega,
        rangoMonto:
          filtrosOriginales.montoMinimo || filtrosOriginales.montoMaximo
            ? {
                minimo: filtrosOriginales.montoMinimo,
                maximo: filtrosOriginales.montoMaximo,
              }
            : undefined,
      },
    };
  }

  private convertirAEstadisticasDto(
    estadisticas: EstadisticasPedidos,
    fechaDesde?: Date,
    fechaHasta?: Date
  ): EstadisticasPedidosDto {
    return {
      periodo: {
        fechaDesde: fechaDesde?.toISOString(),
        fechaHasta: fechaHasta?.toISOString(),
      },
      resumen: {
        totalPedidos: estadisticas.totalPedidos,
        ventasTotales: estadisticas.ventasTotales,
        ventasPromedio: estadisticas.ventasPromedio,
        ticketPromedio:
          estadisticas.totalPedidos > 0
            ? estadisticas.ventasTotales / estadisticas.totalPedidos
            : 0,
      },
      pedidosPorEstado: Object.entries(estadisticas.pedidosPorEstado).map(([estado, cantidad]) => ({
        estado,
        cantidad,
        porcentaje:
          estadisticas.totalPedidos > 0 ? (cantidad / estadisticas.totalPedidos) * 100 : 0,
      })),
      ventasPorDia: estadisticas.pedidosPorDia.map(dia => ({
        fecha: dia.fecha,
        pedidos: dia.cantidad,
        ventas: dia.ventas,
        ventasFormateadas: new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
        }).format(dia.ventas),
      })),
      productosMasVendidos: estadisticas.productosMasVendidos.map(producto => ({
        productoId: producto.productoId,
        nombre: producto.nombre,
        categoria: 'N/A', // Se podría obtener del servicio de productos
        cantidadVendida: producto.cantidad,
        ventasTotales: 0, // Se calcularía con precio * cantidad
        ventasFormateadas: 'N/A',
      })),
      clientesRecurrentes: estadisticas.clientesRecurrentes.map(cliente => ({
        clienteId: cliente.clienteId,
        nombre: cliente.nombre,
        email: 'N/A', // Se obtendría del servicio de clientes
        pedidos: cliente.pedidos,
        ventasTotales: 0, // Se calcularía sumando totales de pedidos
        ventasFormateadas: 'N/A',
        ultimoPedido: 'N/A',
      })),
      metodosPagoMasUsados: [], // Se implementaría con datos de pago
      tiposEntregaMasUsados: [], // Se implementaría con datos de entrega
    };
  }
}
