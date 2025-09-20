import { PedidoEntity } from '@/modules/pedidos/domain/entities/pedido-entity';
import { EstadoPedido } from '@/modules/pedidos/domain/types';
import { ClienteFactory } from './cliente-fixtures';
import { ProductoFactory } from './producto-fixtures';
import type { CrearPedidoDto } from '@/modules/pedidos/application/dtos/crear-pedido.dto';

/**
 * Factory para crear pedidos de prueba en el contexto de la panadería Mandorla
 * Proporciona datos realistas para testing de funcionalidades de pedidos
 */
export class PedidoFactory {
  /**
   * Crea un pedido válido con datos por defecto de la panadería
   * @param overrides - Propiedades a sobrescribir en el pedido
   * @returns DTO para crear un pedido válido
   */
  static crearPedidoValido(overrides: Partial<CrearPedidoDto> = {}): CrearPedidoDto {
    const cliente = ClienteFactory.crearClienteValido();
    const producto1 = ProductoFactory.crearProductoValido();
    const producto2 = ProductoFactory.crearProductoGalleta();

    return {
      cliente: {
        id: 'cliente-123',
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        email: cliente.email,
        telefono: cliente.telefono,
        direccion: cliente.direccion,
      },
      items: [
        {
          productoId: 'producto-1',
          nombre: producto1.nombre,
          precio: producto1.precio,
          cantidad: 2,
        },
        {
          productoId: 'producto-2',
          nombre: producto2.nombre,
          precio: producto2.precio,
          cantidad: 1,
        },
      ],
      metodoPago: 'tarjeta_credito',
      notas: 'Entrega en la mañana',
      ...overrides,
    };
  }

  /**
   * Crea una entidad de pedido completa para testing
   * @param overrides - Propiedades a sobrescribir
   * @returns Entidad de pedido creada
   */
  static crearEntidadPedido(overrides: Partial<CrearPedidoDto> = {}): PedidoEntity {
    const datos = this.crearPedidoValido(overrides);
    return PedidoEntity.crear(datos);
  }

  /**
   * Crea un pedido grande con múltiples productos para testing de volumen
   * @returns DTO de pedido con muchos items de panadería
   */
  static crearPedidoGrande(): CrearPedidoDto {
    const cliente = ClienteFactory.crearClienteVip();

    return this.crearPedidoValido({
      cliente: {
        id: 'cliente-vip-456',
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        email: cliente.email,
        telefono: cliente.telefono,
        direccion: cliente.direccion,
      },
      items: [
        {
          productoId: 'producto-1',
          nombre: 'Pan Integral Grande',
          precio: 2500,
          cantidad: 5,
        },
        {
          productoId: 'producto-2',
          nombre: 'Galletas Premium Surtidas',
          precio: 3000,
          cantidad: 3,
        },
        {
          productoId: 'producto-3',
          nombre: 'Torta de Chocolate Especial',
          precio: 25000,
          cantidad: 1,
        },
      ],
    });
  }

  /**
   * Crea un pedido con pago en efectivo
   * @returns DTO de pedido configurado para pago en efectivo
   */
  static crearPedidoEfectivo(): CrearPedidoDto {
    return this.crearPedidoValido({
      metodoPago: 'efectivo',
    });
  }

  /**
   * Crea un pedido con notas especiales para testing de casos complejos
   * @returns DTO de pedido con notas detalladas
   */
  static crearPedidoConNotas(): CrearPedidoDto {
    return this.crearPedidoValido({
      notas: 'Sin gluten por favor. Alérgico al trigo. Entregar antes de las 3 PM.',
    });
  }
}

/**
 * Fixtures predefinidos de pedidos para tests comunes
 * Contiene pedidos típicos de la panadería Mandorla
 */
export const PEDIDO_FIXTURES = {
  PEDIDO_BASICO: PedidoFactory.crearPedidoValido(),
  PEDIDO_GRANDE: PedidoFactory.crearPedidoGrande(),
  PEDIDO_EFECTIVO: PedidoFactory.crearPedidoEfectivo(),
  PEDIDO_CON_NOTAS: PedidoFactory.crearPedidoConNotas(),
};

/**
 * Estados de pedido disponibles para testing de flujos
 * Incluye todos los estados del ciclo de vida de un pedido
 */
export const ESTADOS_PEDIDO_FIXTURES = {
  PENDIENTE: EstadoPedido.PENDIENTE,
  CONFIRMADO: EstadoPedido.CONFIRMADO,
  EN_PREPARACION: EstadoPedido.EN_PREPARACION,
  LISTO_ENTREGA: EstadoPedido.LISTO_ENTREGA,
  ENTREGADO: EstadoPedido.ENTREGADO,
  CANCELADO: EstadoPedido.CANCELADO,
};

/**
 * Datos inválidos para testing de validaciones y manejo de errores
 * Casos edge que deben ser rechazados por el sistema
 */
export const PEDIDO_DATOS_INVALIDOS = {
  SIN_ITEMS: {
    cliente: ClienteFactory.crearClienteValido(),
    items: [],
    metodoPago: 'tarjeta_credito',
  },
  ITEM_CANTIDAD_CERO: {
    cliente: ClienteFactory.crearClienteValido(),
    items: [
      {
        productoId: 'producto-1',
        nombre: 'Pan Test',
        precio: 2500,
        cantidad: 0,
      },
    ],
    metodoPago: 'tarjeta_credito',
  },
  METODO_PAGO_INVALIDO: {
    cliente: ClienteFactory.crearClienteValido(),
    items: [
      {
        productoId: 'producto-1',
        nombre: 'Pan Test',
        precio: 2500,
        cantidad: 1,
      },
    ],
    metodoPago: 'metodo_inexistente',
  },
  PRECIO_NEGATIVO: {
    cliente: ClienteFactory.crearClienteValido(),
    items: [
      {
        productoId: 'producto-1',
        nombre: 'Pan Test',
        precio: -100,
        cantidad: 1,
      },
    ],
    metodoPago: 'tarjeta_credito',
  },
};
