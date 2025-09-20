import { CarritoEntity } from '@/modules/carrito/domain/entities/carrito-entity';
import { CarritoId } from '@/modules/carrito/domain/value-objects/carrito-id';
import { ItemCarrito } from '@/modules/carrito/domain/value-objects/item-carrito';
import { ProductoFactory } from './producto-fixtures';
import type { AgregarAlCarritoDto } from '@/modules/carrito/application/dtos/agregar-al-carrito.dto';

/**
 * Factory para crear carritos de prueba
 */
export class CarritoFactory {
  static crearCarritoVacio(): CarritoEntity {
    return CarritoEntity.crear();
  }

  static crearCarritoConItems(): CarritoEntity {
    const carrito = CarritoEntity.crear();

    // Agregar pan integral
    const panIntegral = ProductoFactory.crearEntidadProducto();
    carrito.agregarItem(panIntegral, 2);

    // Agregar galletas
    const galletas = ProductoFactory.crearEntidadProducto({
      nombre: 'Galletas de Avena',
      precio: 1200,
    });
    carrito.agregarItem(galletas, 1);

    return carrito;
  }

  static crearCarritoConMuchosItems(): CarritoEntity {
    const carrito = CarritoEntity.crear();

    // Agregar múltiples productos
    for (let i = 1; i <= 5; i++) {
      const producto = ProductoFactory.crearEntidadProducto({
        nombre: `Producto ${i}`,
        precio: 1000 * i,
      });
      carrito.agregarItem(producto, i);
    }

    return carrito;
  }

  static crearDtoAgregarItem(overrides: Partial<AgregarAlCarritoDto> = {}): AgregarAlCarritoDto {
    return {
      productoId: 'producto-123',
      cantidad: 1,
      ...overrides,
    };
  }
}

/**
 * Fixtures de carritos para tests
 */
export const CARRITO_FIXTURES = {
  CARRITO_VACIO: CarritoFactory.crearCarritoVacio(),
  CARRITO_CON_ITEMS: CarritoFactory.crearCarritoConItems(),
  CARRITO_MUCHOS_ITEMS: CarritoFactory.crearCarritoConMuchosItems(),
};

/**
 * Datos inválidos para tests de validación
 */
export const CARRITO_DATOS_INVALIDOS = {
  CANTIDAD_CERO: {
    productoId: 'producto-123',
    cantidad: 0,
  },
  CANTIDAD_NEGATIVA: {
    productoId: 'producto-123',
    cantidad: -1,
  },
  PRODUCTO_ID_VACIO: {
    productoId: '',
    cantidad: 1,
  },
  CANTIDAD_EXCESIVA: {
    productoId: 'producto-123',
    cantidad: 1000,
  },
};
