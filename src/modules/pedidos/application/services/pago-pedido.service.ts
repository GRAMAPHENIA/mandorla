/**
 * Servicio de aplicación para gestión de pagos de pedidos
 * Proyecto Mandorla - Panadería E-commerce
 */

import {
  PedidoEntity,
  PedidoId,
  IPedidoRepository,
  IPagoService,
  ConfiguracionPreference,
  ItemPago,
  DatosCompradorPago,
  NotificacionMercadoPago,
  PedidoNoEncontradoError,
  PagoNoConfiguradoError,
  ErrorMercadoPagoError,
  ErrorServicioPagosError,
  PaymentIdInvalidoError,
  MontoNoCoincideError,
  PagoYaConfirmadoError,
} from '../../domain';

import {
  ConfigurarPagoMercadoPagoDto,
  ConfigurarPagoRespuestaDto,
  ConfirmarPagoDto,
  ConfirmarPagoRespuestaDto,
  RechazarPagoDto,
  RechazarPagoRespuestaDto,
  ConsultarEstadoPagoDto,
  ConsultarEstadoPagoRespuestaDto,
  ProcesarNotificacionMercadoPagoDto,
  ProcesarNotificacionRespuestaDto,
  ReembolsarPagoDto,
  ReembolsarPagoRespuestaDto,
} from '../dtos';

export class PagoPedidoService {
  constructor(
    private readonly pedidoRepository: IPedidoRepository,
    private readonly pagoService: IPagoService
  ) {}

  /**
   * Configura el pago con Mercado Pago para un pedido
   */
  async configurarPagoMercadoPago(
    datos: ConfigurarPagoMercadoPagoDto
  ): Promise<ConfigurarPagoRespuestaDto> {
    try {
      // Buscar el pedido
      const pedidoId = PedidoId.fromString(datos.pedidoId);
      const pedido = await this.pedidoRepository.buscarPorId(pedidoId);

      if (!pedido) {
        throw new PedidoNoEncontradoError(datos.pedidoId);
      }

      // Verificar que el pedido esté pendiente de pago
      if (!pedido.estaPendientePago()) {
        throw new ErrorMercadoPagoError(`El pedido ${datos.pedidoId} no está pendiente de pago`, {
          estadoActual: pedido.estado.estado,
        });
      }

      // Crear configuración de preferencia
      const configuracion = this.crearConfiguracionPreferencia(pedido, datos);

      // Crear preferencia en Mercado Pago
      const respuestaPreferencia = await this.pagoService.crearPreferencia(configuracion);

      // Configurar pago en el pedido
      pedido.configurarPagoMercadoPago(respuestaPreferencia.id);

      // Guardar cambios
      await this.pedidoRepository.guardar(pedido);

      // Retornar respuesta
      return {
        pedidoId: datos.pedidoId,
        preferenceId: respuestaPreferencia.id,
        initPoint: respuestaPreferencia.init_point,
        sandboxInitPoint: respuestaPreferencia.sandbox_init_point,
        externalReference: respuestaPreferencia.external_reference,
        fechaCreacion: respuestaPreferencia.date_created,
        estado: {
          pedido: pedido.estado.estado,
          pago: pedido.informacionPago?.estado || 'PENDIENTE',
        },
        total: {
          monto: pedido.calcularTotal().valor,
          moneda: pedido.calcularTotal().moneda,
          formateado: pedido.calcularTotal().formatear(),
        },
      };
    } catch (error) {
      if (error instanceof PedidoNoEncontradoError || error instanceof ErrorMercadoPagoError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ErrorServicioPagosError('configurar pago', error.message, datos.pedidoId);
      }
      throw error;
    }
  }

  /**
   * Confirma un pago procesado por Mercado Pago
   */
  async confirmarPago(datos: ConfirmarPagoDto): Promise<ConfirmarPagoRespuestaDto> {
    try {
      // Buscar pedido por payment ID o external reference
      let pedido: PedidoEntity | null = null;

      if (datos.pedidoId) {
        const pedidoId = PedidoId.fromString(datos.pedidoId);
        pedido = await this.pedidoRepository.buscarPorId(pedidoId);
      } else if (datos.externalReference) {
        pedido = await this.pedidoRepository.buscarPorExternalReference(datos.externalReference);
      } else {
        pedido = await this.pedidoRepository.buscarPorPaymentId(datos.paymentId);
      }

      if (!pedido) {
        throw new PedidoNoEncontradoError(
          datos.pedidoId || datos.externalReference || datos.paymentId
        );
      }

      // Verificar que el pago no esté ya confirmado
      if (pedido.informacionPago?.estaAprobado()) {
        throw new PagoYaConfirmadoError(pedido.id.value, datos.paymentId);
      }

      // Obtener información completa del pago desde Mercado Pago
      const datosPago = await this.pagoService.obtenerPago(datos.paymentId);

      // Validar que el monto coincida
      const totalPedido = pedido.calcularTotal().valor;
      if (Math.abs(datosPago.transaction_amount - totalPedido) > 0.01) {
        throw new MontoNoCoincideError(totalPedido, datosPago.transaction_amount, pedido.id.value);
      }

      // Confirmar pago en el pedido
      pedido.confirmarPago(datos.paymentId, datosPago.payment_type_id, datosPago.installments);

      // Guardar cambios
      await this.pedidoRepository.guardar(pedido);

      // Retornar respuesta
      return {
        pedidoId: pedido.id.value,
        paymentId: datos.paymentId,
        estado: {
          pedido: pedido.estado.estado,
          pago: pedido.informacionPago?.estado || 'APROBADO',
          descripcion: pedido.estado.obtenerDescripcion(),
        },
        pago: {
          monto: datosPago.transaction_amount,
          moneda: datosPago.currency_id,
          formateado: new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: datosPago.currency_id,
          }).format(datosPago.transaction_amount),
          metodoPago: datosPago.payment_method_id,
          tipoTransaccion: datosPago.payment_type_id,
          cuotas: datosPago.installments,
          fechaAprobacion: datosPago.date_approved || new Date().toISOString(),
        },
        fechaActualizacion: pedido.fechaActualizacion.toISOString(),
      };
    } catch (error) {
      if (
        error instanceof PedidoNoEncontradoError ||
        error instanceof PagoYaConfirmadoError ||
        error instanceof MontoNoCoincideError
      ) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ErrorServicioPagosError('confirmar pago', error.message, datos.paymentId);
      }
      throw error;
    }
  }

  /**
   * Rechaza un pago
   */
  async rechazarPago(datos: RechazarPagoDto): Promise<RechazarPagoRespuestaDto> {
    try {
      // Buscar pedido
      let pedido: PedidoEntity | null = null;

      if (datos.pedidoId) {
        const pedidoId = PedidoId.fromString(datos.pedidoId);
        pedido = await this.pedidoRepository.buscarPorId(pedidoId);
      } else if (datos.externalReference) {
        pedido = await this.pedidoRepository.buscarPorExternalReference(datos.externalReference);
      } else if (datos.paymentId) {
        pedido = await this.pedidoRepository.buscarPorPaymentId(datos.paymentId);
      }

      if (!pedido) {
        throw new PedidoNoEncontradoError(
          datos.pedidoId || datos.externalReference || datos.paymentId || 'unknown'
        );
      }

      // Rechazar pago en el pedido
      const motivoCompleto = datos.motivo || 'Pago rechazado por Mercado Pago';
      if (datos.detalleError) {
        motivoCompleto + `: ${datos.detalleError}`;
      }

      pedido.rechazarPago(motivoCompleto);

      // Guardar cambios
      await this.pedidoRepository.guardar(pedido);

      // Retornar respuesta
      return {
        pedidoId: pedido.id.value,
        paymentId: datos.paymentId,
        estado: {
          pedido: pedido.estado.estado,
          pago: pedido.informacionPago?.estado || 'RECHAZADO',
          descripcion: pedido.estado.obtenerDescripcion(),
        },
        motivo: motivoCompleto,
        fechaRechazo: pedido.fechaActualizacion.toISOString(),
      };
    } catch (error) {
      if (error instanceof PedidoNoEncontradoError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ErrorServicioPagosError('rechazar pago', error.message, datos.paymentId);
      }
      throw error;
    }
  }

  /**
   * Consulta el estado de un pago
   */
  async consultarEstadoPago(
    datos: ConsultarEstadoPagoDto
  ): Promise<ConsultarEstadoPagoRespuestaDto> {
    try {
      // Buscar pedido
      let pedido: PedidoEntity | null = null;

      if (datos.pedidoId) {
        const pedidoId = PedidoId.fromString(datos.pedidoId);
        pedido = await this.pedidoRepository.buscarPorId(pedidoId);
      } else if (datos.externalReference) {
        pedido = await this.pedidoRepository.buscarPorExternalReference(datos.externalReference);
      } else if (datos.paymentId) {
        pedido = await this.pedidoRepository.buscarPorPaymentId(datos.paymentId);
      }

      if (!pedido) {
        throw new PedidoNoEncontradoError(
          datos.pedidoId || datos.externalReference || datos.paymentId || 'unknown'
        );
      }

      // Construir respuesta
      const respuesta: ConsultarEstadoPagoRespuestaDto = {
        pedidoId: pedido.id.value,
        estadoPedido: {
          estado: pedido.estado.estado,
          descripcion: pedido.estado.obtenerDescripcion(),
          fechaCambio: pedido.estado.fechaCambio.toISOString(),
        },
      };

      // Agregar información de pago si existe
      if (pedido.informacionPago) {
        const infoPago = pedido.informacionPago;
        respuesta.pago = {
          paymentId: infoPago.obtenerPaymentId(),
          preferenceId: infoPago.obtenerPreferenceId(),
          estado: infoPago.estado,
          descripcionEstado: infoPago.obtenerDescripcionEstado(),
          monto: infoPago.monto,
          moneda: infoPago.moneda,
          formateado: infoPago.formatearMonto(),
          metodoPago: infoPago.metodo,
          fechaCreacion: infoPago.fechaCreacion.toISOString(),
          fechaActualizacion: infoPago.fechaActualizacion.toISOString(),
          fechaAprobacion: infoPago.datosMercadoPago?.dateApproved?.toISOString(),
          detallesMercadoPago: infoPago.datosMercadoPago
            ? {
                paymentType: infoPago.datosMercadoPago.paymentType,
                installments: infoPago.datosMercadoPago.installments,
                transactionAmount: infoPago.datosMercadoPago.transactionAmount,
                merchantOrderId: infoPago.datosMercadoPago.merchantOrderId,
              }
            : undefined,
        };
      }

      return respuesta;
    } catch (error) {
      if (error instanceof PedidoNoEncontradoError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ErrorServicioPagosError('consultar estado pago', error.message);
      }
      throw error;
    }
  }

  /**
   * Procesa una notificación webhook de Mercado Pago
   */
  async procesarNotificacionMercadoPago(
    datos: ProcesarNotificacionMercadoPagoDto
  ): Promise<ProcesarNotificacionRespuestaDto> {
    try {
      // Convertir DTO a notificación de dominio
      const notificacion: NotificacionMercadoPago = {
        id: datos.id,
        live_mode: datos.live_mode,
        type: datos.type as any,
        date_created: datos.date_created,
        application_id: datos.application_id,
        user_id: datos.user_id,
        version: datos.version,
        api_version: datos.api_version,
        action: datos.action as any,
        data: datos.data,
      };

      // Procesar notificación usando el servicio de pagos
      const datosPago = await this.pagoService.procesarNotificacion(notificacion);

      if (!datosPago) {
        return {
          procesado: false,
          mensaje: 'Notificación no relevante o no procesable',
          fechaProcesamiento: new Date().toISOString(),
        };
      }

      // Buscar pedido por external reference o payment ID
      let pedido: PedidoEntity | null = null;

      if (datosPago.external_reference) {
        pedido = await this.pedidoRepository.buscarPorExternalReference(
          datosPago.external_reference
        );
      }

      if (!pedido && datosPago.id) {
        pedido = await this.pedidoRepository.buscarPorPaymentId(datosPago.id.toString());
      }

      if (!pedido) {
        return {
          procesado: false,
          paymentId: datosPago.id?.toString(),
          mensaje: 'Pedido no encontrado para la notificación',
          fechaProcesamiento: new Date().toISOString(),
        };
      }

      const estadoAnterior = pedido.estado.estado;
      let accionRealizada = 'ninguna';

      // Procesar según el estado del pago
      if (datosPago.status === 'approved' && !pedido.informacionPago?.estaAprobado()) {
        pedido.confirmarPago(
          datosPago.id.toString(),
          datosPago.payment_type_id,
          datosPago.installments
        );
        accionRealizada = 'pago_confirmado';
      } else if (datosPago.status === 'rejected' || datosPago.status === 'cancelled') {
        pedido.rechazarPago(`Pago ${datosPago.status}: ${datosPago.status_detail}`);
        accionRealizada = 'pago_rechazado';
      }

      // Guardar cambios si hubo modificaciones
      if (accionRealizada !== 'ninguna') {
        await this.pedidoRepository.guardar(pedido);
      }

      return {
        procesado: true,
        pedidoId: pedido.id.value,
        paymentId: datosPago.id?.toString(),
        estadoAnterior,
        estadoNuevo: pedido.estado.estado,
        accionRealizada,
        mensaje: `Notificación procesada exitosamente: ${accionRealizada}`,
        fechaProcesamiento: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ErrorServicioPagosError('procesar notificación', error.message);
      }
      throw error;
    }
  }

  /**
   * Reembolsa un pago
   */
  async reembolsarPago(datos: ReembolsarPagoDto): Promise<ReembolsarPagoRespuestaDto> {
    try {
      // Buscar pedido
      const pedidoId = PedidoId.fromString(datos.pedidoId);
      const pedido = await this.pedidoRepository.buscarPorId(pedidoId);

      if (!pedido) {
        throw new PedidoNoEncontradoError(datos.pedidoId);
      }

      // Verificar que el pedido tenga pago confirmado
      if (!pedido.informacionPago?.estaAprobado()) {
        throw new ErrorMercadoPagoError(
          `El pedido ${datos.pedidoId} no tiene un pago confirmado para reembolsar`
        );
      }

      const paymentId = pedido.informacionPago.obtenerPaymentId();
      if (!paymentId) {
        throw new PaymentIdInvalidoError('No disponible', datos.pedidoId);
      }

      // Procesar reembolso en Mercado Pago
      const resultadoReembolso = await this.pagoService.reembolsarPago(paymentId, datos.monto);

      // Actualizar información de pago en el pedido
      const nuevaInfoPago = pedido.informacionPago.actualizarEstado('REEMBOLSADO', {
        refundId: resultadoReembolso.id.toString(),
        refundAmount: resultadoReembolso.amount,
        refundDate: new Date(resultadoReembolso.date_created),
      });

      // Actualizar pedido (esto requeriría un método en la entidad)
      // Por ahora, guardamos el pedido tal como está
      await this.pedidoRepository.guardar(pedido);

      return {
        pedidoId: datos.pedidoId,
        paymentId,
        reembolsoId: resultadoReembolso.id,
        monto: {
          reembolsado: resultadoReembolso.amount,
          moneda: 'ARS', // Asumir ARS por defecto
          formateado: new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
          }).format(resultadoReembolso.amount),
        },
        estado: {
          pedido: pedido.estado.estado,
          pago: 'REEMBOLSADO',
          descripcion: 'Pago reembolsado exitosamente',
        },
        fechaReembolso: resultadoReembolso.date_created,
        motivo: datos.motivo,
      };
    } catch (error) {
      if (
        error instanceof PedidoNoEncontradoError ||
        error instanceof ErrorMercadoPagoError ||
        error instanceof PaymentIdInvalidoError
      ) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ErrorServicioPagosError('reembolsar pago', error.message, datos.pedidoId);
      }
      throw error;
    }
  }

  // Métodos privados

  private crearConfiguracionPreferencia(
    pedido: PedidoEntity,
    datos: ConfigurarPagoMercadoPagoDto
  ): ConfiguracionPreference {
    // Convertir items del pedido a items de Mercado Pago
    const items: ItemPago[] = pedido.items.map(item => ({
      id: item.producto.id,
      title: item.producto.nombre,
      description:
        item.producto.descripcion || `${item.producto.categoria} - ${item.producto.nombre}`,
      quantity: item.cantidad,
      unit_price: item.precioUnitario.valor,
      currency_id: 'ARS',
      category_id: item.producto.categoria,
    }));

    // Agregar costo de envío si aplica
    const costoEnvio = pedido.calcularCostoEnvio();
    if (costoEnvio.valor > 0) {
      items.push({
        id: 'shipping',
        title: 'Costo de envío',
        description: `Envío ${pedido.datosEntrega.tipo}`,
        quantity: 1,
        unit_price: costoEnvio.valor,
        currency_id: 'ARS',
        category_id: 'shipping',
      });
    }

    // Crear datos del comprador
    const payer: DatosCompradorPago = {
      name: pedido.cliente.nombre.split(' ')[0] || pedido.cliente.nombre,
      surname: pedido.cliente.nombre.split(' ').slice(1).join(' ') || '',
      email: pedido.cliente.email,
      phone: pedido.cliente.telefono
        ? {
            area_code: '11', // Código de área por defecto
            number: pedido.cliente.telefono.replace(/\D/g, ''),
          }
        : undefined,
      address: pedido.cliente.direccion
        ? {
            street_name: pedido.cliente.direccion.calle,
            street_number: parseInt(pedido.cliente.direccion.numero) || 0,
            zip_code: pedido.cliente.direccion.codigoPostal,
          }
        : undefined,
    };

    return {
      items,
      payer,
      external_reference: pedido.id.value,
      notification_url: this.pagoService.obtenerUrlWebhook(),
      back_urls: datos.urlsCallback,
      auto_return: datos.autoReturn || 'approved',
      payment_methods: {
        excluded_payment_methods: datos.metodosExcluidos,
        excluded_payment_types: datos.tiposPagoExcluidos,
        installments: datos.cuotasMaximas,
      },
      shipments:
        costoEnvio.valor > 0
          ? {
              cost: costoEnvio.valor,
              mode: 'custom',
            }
          : undefined,
      metadata: {
        pedido_id: pedido.id.value,
        cliente_id: pedido.cliente.id,
        tipo_entrega: pedido.datosEntrega.tipo,
        fecha_creacion: pedido.fechaCreacion.toISOString(),
      },
    };
  }
}
