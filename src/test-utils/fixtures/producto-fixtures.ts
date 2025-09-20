import { ProductoEntity } from '@/modules/productos/domain/entities/producto-entity';
import { ProductoId } from '@/modules/productos/domain/value-objects/producto-id';
import { Money } from '@/modules/productos/domain/value-objects/money';
import { CategoriaProducto } from '@/modules/productos/domain/types';
import type { CrearProductoDto } from '@/modules/productos/application/dtos/crear-producto.dto';

/**
 * Factory para crear productos de prueba para el módulo de productos
 * Proyecto Mandorla - Panadería E-commerce
 */
export class ProductoFactory {
  static crearProductoValido(overrides: Partial<CrearProductoDto> = {}): CrearProductoDto {
    return {
      nombre: 'Pan Integral',
      precio: 2500,
      categoria: CategoriaProducto.PANES,
      descripcion: 'Pan integral artesanal con semillas',
      imagen: 'https://example.com/pan-integral.jpg',
      disponible: true,
      stock: 10,
      ingredientes: ['Harina integral', 'Agua', 'Levadura', 'Sal', 'Semillas'],
      alergenos: ['Gluten'],
      ...overrides,
    };
  }

  static crearEntidadProducto(overrides: Partial<CrearProductoDto> = {}): ProductoEntity {
    const datos = this.crearProductoValido(overrides);
    return ProductoEntity.crear(datos);
  }

  static crearProductoGalleta(): CrearProductoDto {
    return this.crearProductoValido({
      nombre: 'Galletas de Chocolate',
      precio: 1500,
      categoria: CategoriaProducto.GALLETAS,
      descripcion: 'Galletas artesanales con chips de chocolate',
      ingredientes: ['Harina', 'Mantequilla', 'Azúcar', 'Chocolate', 'Huevos'],
      alergenos: ['Gluten', 'Lácteos', 'Huevos'],
    });
  }

  static crearProductoPastel(): CrearProductoDto {
    return this.crearProductoValido({
      nombre: 'Torta de Chocolate',
      precio: 15000,
      categoria: CategoriaProducto.PASTELES,
      descripcion: 'Torta de chocolate con crema de mantequilla',
      ingredientes: ['Harina', 'Chocolate', 'Huevos', 'Mantequilla', 'Azúcar'],
      alergenos: ['Gluten', 'Lácteos', 'Huevos'],
    });
  }

  static crearProductoTemporada(): CrearProductoDto {
    return this.crearProductoValido({
      nombre: 'Roscón de Reyes',
      precio: 8000,
      categoria: CategoriaProducto.TEMPORADA,
      descripcion: 'Roscón tradicional de Reyes con frutas confitadas',
      ingredientes: ['Harina', 'Huevos', 'Mantequilla', 'Azúcar', 'Frutas confitadas'],
      alergenos: ['Gluten', 'Lácteos', 'Huevos'],
    });
  }

  static crearProductoSinStock(): CrearProductoDto {
    return this.crearProductoValido({
      nombre: 'Pan Agotado',
      stock: 0,
      disponible: false,
    });
  }

  static crearProductoConPrecioAlto(): CrearProductoDto {
    return this.crearProductoValido({
      nombre: 'Torta Premium',
      precio: 50000,
      categoria: CategoriaProducto.PASTELES,
    });
  }
}

/**
 * Fixtures de productos predefinidos para tests
 * Contiene datos de ejemplo realistas del negocio de panadería
 */
export const PRODUCTOS_FIXTURES = {
  PAN_INTEGRAL: ProductoFactory.crearProductoValido(),
  GALLETAS_CHOCOLATE: ProductoFactory.crearProductoGalleta(),
  TORTA_CHOCOLATE: ProductoFactory.crearProductoPastel(),
  ROSCON_REYES: ProductoFactory.crearProductoTemporada(),
  PRODUCTO_SIN_STOCK: ProductoFactory.crearProductoSinStock(),
  PRODUCTO_PRECIO_ALTO: ProductoFactory.crearProductoConPrecioAlto(),
};

/**
 * Datos inválidos para tests de validación
 * Casos edge para probar manejo de errores
 */
export const DATOS_INVALIDOS = {
  NOMBRE_VACIO: {
    nombre: '',
    precio: 2500,
    categoria: CategoriaProducto.PANES,
  },
  PRECIO_NEGATIVO: {
    nombre: 'Pan Test',
    precio: -100,
    categoria: CategoriaProducto.PANES,
  },
  PRECIO_CERO: {
    nombre: 'Pan Test',
    precio: 0,
    categoria: CategoriaProducto.PANES,
  },
  CATEGORIA_INVALIDA: {
    nombre: 'Pan Test',
    precio: 2500,
    categoria: 'categoria-inexistente' as CategoriaProducto,
  },
  STOCK_NEGATIVO: {
    nombre: 'Pan Test',
    precio: 2500,
    categoria: CategoriaProducto.PANES,
    stock: -5,
  },
};
