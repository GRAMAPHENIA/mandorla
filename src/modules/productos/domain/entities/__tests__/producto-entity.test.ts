import { ProductoEntity } from '../producto-entity';
import { Money } from '../../value-objects/money';
import { CategoriaProducto } from '../../types';
import { ProductoFactory, DATOS_INVALIDOS } from '@/test-utils/fixtures/producto-fixtures';
import { expectToThrow } from '@/test-utils/test-helpers';
import {
  NombreProductoVacioError,
  PrecioProductoInvalidoError,
  StockProductoInvalidoError,
  CantidadInvalidaError,
} from '../../errors/producto-errors';

describe('ProductoEntity', () => {
  describe('crear', () => {
    it('debería crear un producto válido correctamente', () => {
      // Arrange
      const datosProducto = ProductoFactory.crearProductoValido();

      // Act
      const producto = ProductoEntity.crear(datosProducto);

      // Assert
      expect(producto).toBeInstanceOf(ProductoEntity);
      expect(producto.nombre).toBe(datosProducto.nombre);
      expect(producto.precio.valor).toBe(datosProducto.precio);
      expect(producto.categoria).toBe(datosProducto.categoria);
      expect(producto.disponible).toBe(true);
      expect(producto.stock).toBe(datosProducto.stock);
    });

    it('debería generar un ID único para cada producto', () => {
      // Arrange
      const datosProducto = ProductoFactory.crearProductoValido();

      // Act
      const producto1 = ProductoEntity.crear(datosProducto);
      const producto2 = ProductoEntity.crear(datosProducto);

      // Assert
      expect(producto1.id.valor).not.toBe(producto2.id.valor);
      expect(producto1.id.valor).toBeTruthy();
      expect(producto2.id.valor).toBeTruthy();
    });

    it('debería lanzar error con nombre vacío', async () => {
      // Arrange
      const datosInvalidos = DATOS_INVALIDOS.NOMBRE_VACIO;

      // Act & Assert
      await expectToThrow(
        () => ProductoEntity.crear(datosInvalidos as any),
        NombreProductoVacioError
      );
    });

    it('debería lanzar error con precio negativo', async () => {
      // Arrange
      const datosInvalidos = DATOS_INVALIDOS.PRECIO_NEGATIVO;

      // Act & Assert
      await expectToThrow(
        () => ProductoEntity.crear(datosInvalidos as any),
        PrecioProductoInvalidoError
      );
    });

    it('debería lanzar error con precio cero', async () => {
      // Arrange
      const datosInvalidos = DATOS_INVALIDOS.PRECIO_CERO;

      // Act & Assert
      await expectToThrow(
        () => ProductoEntity.crear(datosInvalidos as any),
        PrecioProductoInvalidoError
      );
    });

    it('debería lanzar error con stock negativo', async () => {
      // Arrange
      const datosInvalidos = DATOS_INVALIDOS.STOCK_NEGATIVO;

      // Act & Assert
      await expectToThrow(
        () => ProductoEntity.crear(datosInvalidos as any),
        StockProductoInvalidoError
      );
    });
  });

  describe('actualizarPrecio', () => {
    it('debería actualizar el precio correctamente', () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto();
      const nuevoPrecio = Money.crear(3000);

      // Act
      producto.actualizarPrecio(nuevoPrecio);

      // Assert
      expect(producto.precio.valor).toBe(3000);
    });

    it('debería lanzar error con precio inválido', async () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto();
      const precioInvalido = Money.crear(-100);

      // Act & Assert
      await expectToThrow(
        () => producto.actualizarPrecio(precioInvalido),
        PrecioProductoInvalidoError
      );
    });

    it('debería actualizar la fecha de modificación', () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto();
      const fechaOriginal = producto.fechaActualizacion;
      const nuevoPrecio = Money.crear(3000);

      // Act
      producto.actualizarPrecio(nuevoPrecio);

      // Assert
      expect(producto.fechaActualizacion.getTime()).toBeGreaterThan(fechaOriginal.getTime());
    });
  });

  describe('actualizarStock', () => {
    it('debería actualizar el stock correctamente', () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto({ stock: 10 });

      // Act
      producto.actualizarStock(15);

      // Assert
      expect(producto.stock).toBe(15);
    });

    it('debería lanzar error con stock negativo', async () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto();

      // Act & Assert
      await expectToThrow(() => producto.actualizarStock(-5), StockProductoInvalidoError);
    });

    it('debería permitir stock cero', () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto({ stock: 5 });

      // Act
      producto.actualizarStock(0);

      // Assert
      expect(producto.stock).toBe(0);
    });
  });

  describe('reducirStock', () => {
    it('debería reducir el stock correctamente', () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto({ stock: 10 });

      // Act
      producto.reducirStock(3);

      // Assert
      expect(producto.stock).toBe(7);
    });

    it('debería lanzar error si no hay stock suficiente', async () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto({ stock: 5 });

      // Act & Assert
      await expectToThrow(() => producto.reducirStock(10), StockProductoInvalidoError);
    });

    it('debería lanzar error con cantidad inválida', async () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto();

      // Act & Assert
      await expectToThrow(() => producto.reducirStock(-1), CantidadInvalidaError);
    });

    it('debería permitir reducir todo el stock', () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto({ stock: 5 });

      // Act
      producto.reducirStock(5);

      // Assert
      expect(producto.stock).toBe(0);
    });
  });

  describe('tieneStock', () => {
    it('debería retornar true si hay stock suficiente', () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto({ stock: 10 });

      // Act & Assert
      expect(producto.tieneStock(5)).toBe(true);
      expect(producto.tieneStock(10)).toBe(true);
    });

    it('debería retornar false si no hay stock suficiente', () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto({ stock: 5 });

      // Act & Assert
      expect(producto.tieneStock(10)).toBe(false);
    });

    it('debería retornar false si el producto no está disponible', () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto({
        stock: 10,
        disponible: false,
      });

      // Act & Assert
      expect(producto.tieneStock(5)).toBe(false);
    });
  });

  describe('marcarComoNoDisponible', () => {
    it('debería marcar el producto como no disponible', () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto({ disponible: true });

      // Act
      producto.marcarComoNoDisponible();

      // Assert
      expect(producto.disponible).toBe(false);
    });
  });

  describe('marcarComoDisponible', () => {
    it('debería marcar el producto como disponible', () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto({ disponible: false });

      // Act
      producto.marcarComoDisponible();

      // Assert
      expect(producto.disponible).toBe(true);
    });
  });

  describe('calcularPrecioConDescuento', () => {
    it('debería calcular el precio con descuento correctamente', () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto({ precio: 1000 });
      const porcentajeDescuento = 0.15; // 15%

      // Act
      const precioConDescuento = producto.calcularPrecioConDescuento(porcentajeDescuento);

      // Assert
      expect(precioConDescuento.valor).toBe(850); // 1000 - (1000 * 0.15)
    });

    it('debería retornar el precio original con descuento cero', () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto({ precio: 1000 });

      // Act
      const precioConDescuento = producto.calcularPrecioConDescuento(0);

      // Assert
      expect(precioConDescuento.valor).toBe(1000);
    });

    it('debería lanzar error con descuento negativo', async () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto();

      // Act & Assert
      await expectToThrow(() => producto.calcularPrecioConDescuento(-0.1), Error);
    });

    it('debería lanzar error con descuento mayor a 100%', async () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto();

      // Act & Assert
      await expectToThrow(() => producto.calcularPrecioConDescuento(1.5), Error);
    });
  });

  describe('toPersistence', () => {
    it('debería convertir la entidad a formato de persistencia', () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto();

      // Act
      const persistenceData = producto.toPersistence();

      // Assert
      expect(persistenceData).toHaveProperty('id');
      expect(persistenceData).toHaveProperty('nombre');
      expect(persistenceData).toHaveProperty('precio');
      expect(persistenceData).toHaveProperty('categoria');
      expect(persistenceData).toHaveProperty('disponible');
      expect(persistenceData).toHaveProperty('stock');
      expect(persistenceData).toHaveProperty('fechaCreacion');
      expect(persistenceData).toHaveProperty('fechaActualizacion');
    });
  });

  describe('fromPersistence', () => {
    it('debería crear entidad desde datos de persistencia', () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto();
      const persistenceData = producto.toPersistence();

      // Act
      const productoRestaurado = ProductoEntity.fromPersistence(persistenceData);

      // Assert
      expect(productoRestaurado.id.valor).toBe(producto.id.valor);
      expect(productoRestaurado.nombre).toBe(producto.nombre);
      expect(productoRestaurado.precio.valor).toBe(producto.precio.valor);
      expect(productoRestaurado.categoria).toBe(producto.categoria);
    });
  });
});
