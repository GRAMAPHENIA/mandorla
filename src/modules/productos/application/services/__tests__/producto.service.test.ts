import { ProductoService } from '../producto.service';
import { ProductoEntity } from '../../../domain/entities/producto-entity';
import { ProductoFactory, DATOS_INVALIDOS } from '@/test-utils/fixtures/producto-fixtures';
import { createMockProductoRepository } from '@/test-utils/mocks/repository-mocks';
import { expectToThrow } from '@/test-utils/test-helpers';
import {
  ProductoNoEncontradoError,
  NombreProductoVacioError,
  PrecioProductoInvalidoError,
  ProductoDuplicadoError,
} from '../../../domain/errors/producto-errors';

describe('ProductoService', () => {
  let productoService: ProductoService;
  let mockRepository: ReturnType<typeof createMockProductoRepository>;

  beforeEach(() => {
    mockRepository = createMockProductoRepository();
    productoService = new ProductoService(mockRepository);
  });

  describe('crearProducto', () => {
    it('debería crear un producto correctamente', async () => {
      // Arrange
      const datosProducto = ProductoFactory.crearProductoValido();
      mockRepository.existeConNombre.mockResolvedValue(false);
      mockRepository.guardar.mockResolvedValue();

      // Act
      const resultado = await productoService.crearProducto(datosProducto);

      // Assert
      expect(resultado).toBeInstanceOf(ProductoEntity);
      expect(resultado.nombre).toBe(datosProducto.nombre);
      expect(mockRepository.existeConNombre).toHaveBeenCalledWith(datosProducto.nombre);
      expect(mockRepository.guardar).toHaveBeenCalledWith(resultado);
    });

    it('debería lanzar error si el producto ya existe', async () => {
      // Arrange
      const datosProducto = ProductoFactory.crearProductoValido();
      mockRepository.existeConNombre.mockResolvedValue(true);

      // Act & Assert
      await expectToThrow(
        () => productoService.crearProducto(datosProducto),
        ProductoDuplicadoError
      );

      expect(mockRepository.guardar).not.toHaveBeenCalled();
    });

    it('debería lanzar error con datos inválidos', async () => {
      // Arrange
      const datosInvalidos = DATOS_INVALIDOS.NOMBRE_VACIO;

      // Act & Assert
      await expectToThrow(
        () => productoService.crearProducto(datosInvalidos as any),
        NombreProductoVacioError
      );

      expect(mockRepository.existeConNombre).not.toHaveBeenCalled();
      expect(mockRepository.guardar).not.toHaveBeenCalled();
    });
  });

  describe('obtenerProducto', () => {
    it('debería obtener un producto por ID', async () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto();
      mockRepository.obtenerPorId.mockResolvedValue(producto);

      // Act
      const resultado = await productoService.obtenerProducto(producto.id.valor);

      // Assert
      expect(resultado).toBe(producto);
      expect(mockRepository.obtenerPorId).toHaveBeenCalledWith(producto.id);
    });

    it('debería lanzar error si el producto no existe', async () => {
      // Arrange
      const productoId = 'producto-inexistente';
      mockRepository.obtenerPorId.mockResolvedValue(null);

      // Act & Assert
      await expectToThrow(
        () => productoService.obtenerProducto(productoId),
        ProductoNoEncontradoError
      );
    });
  });

  describe('obtenerTodosLosProductos', () => {
    it('debería obtener todos los productos', async () => {
      // Arrange
      const productos = [
        ProductoFactory.crearEntidadProducto(),
        ProductoFactory.crearEntidadProducto({ nombre: 'Producto 2' }),
      ];
      mockRepository.obtenerTodos.mockResolvedValue(productos);

      // Act
      const resultado = await productoService.obtenerTodosLosProductos();

      // Assert
      expect(resultado).toBe(productos);
      expect(mockRepository.obtenerTodos).toHaveBeenCalled();
    });

    it('debería retornar array vacío si no hay productos', async () => {
      // Arrange
      mockRepository.obtenerTodos.mockResolvedValue([]);

      // Act
      const resultado = await productoService.obtenerTodosLosProductos();

      // Assert
      expect(resultado).toEqual([]);
    });
  });

  describe('buscarProductosPorCategoria', () => {
    it('debería buscar productos por categoría', async () => {
      // Arrange
      const categoria = 'panes';
      const productos = [ProductoFactory.crearEntidadProducto({ categoria: 'panes' as any })];
      mockRepository.buscarPorCategoria.mockResolvedValue(productos);

      // Act
      const resultado = await productoService.buscarProductosPorCategoria(categoria);

      // Assert
      expect(resultado).toBe(productos);
      expect(mockRepository.buscarPorCategoria).toHaveBeenCalledWith(categoria);
    });
  });

  describe('buscarProductosPorNombre', () => {
    it('debería buscar productos por nombre', async () => {
      // Arrange
      const termino = 'pan';
      const productos = [ProductoFactory.crearEntidadProducto({ nombre: 'Pan Integral' })];
      mockRepository.buscarPorNombre.mockResolvedValue(productos);

      // Act
      const resultado = await productoService.buscarProductosPorNombre(termino);

      // Assert
      expect(resultado).toBe(productos);
      expect(mockRepository.buscarPorNombre).toHaveBeenCalledWith(termino);
    });
  });

  describe('actualizarPrecio', () => {
    it('debería actualizar el precio de un producto', async () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto({ precio: 2000 });
      const nuevoPrecio = 2500;
      mockRepository.obtenerPorId.mockResolvedValue(producto);
      mockRepository.guardar.mockResolvedValue();

      // Act
      await productoService.actualizarPrecio(producto.id.valor, nuevoPrecio);

      // Assert
      expect(producto.precio.valor).toBe(nuevoPrecio);
      expect(mockRepository.guardar).toHaveBeenCalledWith(producto);
    });

    it('debería lanzar error si el producto no existe', async () => {
      // Arrange
      const productoId = 'producto-inexistente';
      const nuevoPrecio = 2500;
      mockRepository.obtenerPorId.mockResolvedValue(null);

      // Act & Assert
      await expectToThrow(
        () => productoService.actualizarPrecio(productoId, nuevoPrecio),
        ProductoNoEncontradoError
      );

      expect(mockRepository.guardar).not.toHaveBeenCalled();
    });

    it('debería lanzar error con precio inválido', async () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto();
      const precioInvalido = -100;
      mockRepository.obtenerPorId.mockResolvedValue(producto);

      // Act & Assert
      await expectToThrow(
        () => productoService.actualizarPrecio(producto.id.valor, precioInvalido),
        PrecioProductoInvalidoError
      );

      expect(mockRepository.guardar).not.toHaveBeenCalled();
    });
  });

  describe('actualizarStock', () => {
    it('debería actualizar el stock de un producto', async () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto({ stock: 10 });
      const nuevoStock = 15;
      mockRepository.obtenerPorId.mockResolvedValue(producto);
      mockRepository.guardar.mockResolvedValue();

      // Act
      await productoService.actualizarStock(producto.id.valor, nuevoStock);

      // Assert
      expect(producto.stock).toBe(nuevoStock);
      expect(mockRepository.guardar).toHaveBeenCalledWith(producto);
    });

    it('debería lanzar error si el producto no existe', async () => {
      // Arrange
      const productoId = 'producto-inexistente';
      const nuevoStock = 15;
      mockRepository.obtenerPorId.mockResolvedValue(null);

      // Act & Assert
      await expectToThrow(
        () => productoService.actualizarStock(productoId, nuevoStock),
        ProductoNoEncontradoError
      );
    });
  });

  describe('eliminarProducto', () => {
    it('debería eliminar un producto correctamente', async () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto();
      mockRepository.obtenerPorId.mockResolvedValue(producto);
      mockRepository.eliminar.mockResolvedValue();

      // Act
      await productoService.eliminarProducto(producto.id.valor);

      // Assert
      expect(mockRepository.eliminar).toHaveBeenCalledWith(producto.id);
    });

    it('debería lanzar error si el producto no existe', async () => {
      // Arrange
      const productoId = 'producto-inexistente';
      mockRepository.obtenerPorId.mockResolvedValue(null);

      // Act & Assert
      await expectToThrow(
        () => productoService.eliminarProducto(productoId),
        ProductoNoEncontradoError
      );

      expect(mockRepository.eliminar).not.toHaveBeenCalled();
    });
  });

  describe('obtenerProductosDisponibles', () => {
    it('debería obtener solo productos disponibles', async () => {
      // Arrange
      const productosDisponibles = [
        ProductoFactory.crearEntidadProducto({ disponible: true }),
        ProductoFactory.crearEntidadProducto({ disponible: true, nombre: 'Producto 2' }),
      ];
      mockRepository.obtenerDisponibles.mockResolvedValue(productosDisponibles);

      // Act
      const resultado = await productoService.obtenerProductosDisponibles();

      // Assert
      expect(resultado).toBe(productosDisponibles);
      expect(mockRepository.obtenerDisponibles).toHaveBeenCalled();
    });
  });

  describe('verificarDisponibilidad', () => {
    it('debería retornar true si el producto tiene stock suficiente', async () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto({
        stock: 10,
        disponible: true,
      });
      mockRepository.obtenerPorId.mockResolvedValue(producto);

      // Act
      const resultado = await productoService.verificarDisponibilidad(producto.id.valor, 5);

      // Assert
      expect(resultado).toBe(true);
    });

    it('debería retornar false si no hay stock suficiente', async () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto({
        stock: 3,
        disponible: true,
      });
      mockRepository.obtenerPorId.mockResolvedValue(producto);

      // Act
      const resultado = await productoService.verificarDisponibilidad(producto.id.valor, 5);

      // Assert
      expect(resultado).toBe(false);
    });

    it('debería retornar false si el producto no está disponible', async () => {
      // Arrange
      const producto = ProductoFactory.crearEntidadProducto({
        stock: 10,
        disponible: false,
      });
      mockRepository.obtenerPorId.mockResolvedValue(producto);

      // Act
      const resultado = await productoService.verificarDisponibilidad(producto.id.valor, 5);

      // Assert
      expect(resultado).toBe(false);
    });

    it('debería lanzar error si el producto no existe', async () => {
      // Arrange
      const productoId = 'producto-inexistente';
      mockRepository.obtenerPorId.mockResolvedValue(null);

      // Act & Assert
      await expectToThrow(
        () => productoService.verificarDisponibilidad(productoId, 5),
        ProductoNoEncontradoError
      );
    });
  });
});
