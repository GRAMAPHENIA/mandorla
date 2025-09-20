import { CheckoutSessionEntity } from '../../domain/entities/checkout-session.entity';
import { CrearCheckoutDto, ResumenCheckoutDto, ResultadoCheckoutDto } from '../dtos/checkout.dto';
import { MetodoPago } from '../../domain/types/checkout.types';

/**
 * Mapper para transformar datos entre capas
 */
export class CheckoutMapper {
  static toEntity(dto: CrearCheckoutDto, total: number): CheckoutSessionEntity {
    if (!dto.clienteId) {
      throw new Error('clienteId es requerido para crear entidad');
    }

    if (total <= 0) {
      throw new Error('El total debe ser mayor a 0');
    }

    return CheckoutSessionEntity.crear({
      clienteId: dto.clienteId,
      carritoId: dto.carritoId,
      metodoPago: dto.metodoPago,
      datosEntrega: dto.datosEntrega,
      total,
    });
  }

  static toDto(entity: CheckoutSessionEntity): any {
    return {
      id: entity.id.value,
      clienteId: entity.clienteId,
      carritoId: entity.carritoId,
      metodoPago: entity.metodoPago,
      estado: entity.estado,
      total: entity.total,
      datosEntrega: entity.datosEntrega.toPersistence(),
      transaccionId: entity.transaccionId,
      pedidoId: entity.pedidoId,
      fechaCreacion: entity.fechaCreacion,
      fechaExpiracion: entity.fechaExpiracion,
      fechaConfirmacion: entity.fechaConfirmacion,
      fechaCompletado: entity.fechaCompletado,
    };
  }

  static toResumenDto(
    carritoData: any,
    codigoDescuento?: string,
    metodoPago?: MetodoPago
  ): ResumenCheckoutDto {
    return {
      items: carritoData.items || [],
      subtotal: carritoData.subtotal || 0,
      descuentos: carritoData.descuentos || 0,
      impuestos: carritoData.impuestos || 0,
      total: carritoData.total || 0,
      codigoDescuento,
      metodoPagoSeleccionado: metodoPago,
    };
  }

  static toResultadoDto(
    exitoso: boolean,
    pedidoId?: string,
    pagoId?: string,
    total?: number,
    transaccionId?: string,
    error?: any,
    estadoPago?: string
  ): ResultadoCheckoutDto {
    if (exitoso) {
      return {
        exitoso: true,
        pedidoId,
        pagoId,
        total,
        transaccionId,
        estadoPago,
        mensaje:
          estadoPago === 'pendiente'
            ? 'Pedido creado, pago pendiente'
            : 'Checkout procesado exitosamente',
      };
    } else {
      return {
        exitoso: false,
        error,
      };
    }
  }

  static fromPersistence(data: any): CheckoutSessionEntity {
    return CheckoutSessionEntity.fromPersistence({
      id: data._id,
      clienteId: data.clienteId,
      carritoId: data.carritoId,
      metodoPago: data.metodoPago,
      estado: data.estado,
      total: data.total,
      datosEntrega: data.datosEntrega,
      transaccionId: data.transaccionId,
      pedidoId: data.pedidoId,
      fechaCreacion: data.fechaCreacion,
      fechaExpiracion: data.fechaExpiracion,
      fechaConfirmacion: data.fechaConfirmacion,
      fechaCancelacion: data.fechaCancelacion,
      fechaCompletado: data.fechaCompletado,
      motivoCancelacion: data.motivoCancelacion,
    });
  }

  static toPersistence(entity: CheckoutSessionEntity): any {
    const persistence = entity.toPersistence();
    return {
      _id: persistence.id,
      ...persistence,
    };
  }
}
