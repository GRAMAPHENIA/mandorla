# Validación de Interfaces y Contratos - Proyecto Mandorla

## Propósito

Estas reglas aseguran que todas las interfaces estén correctamente implementadas y que los contratos entre módulos se mantengan consistentes, garantizando la integridad arquitectónica del proyecto e-commerce Mandorla.

## Definición de Contratos

### Contratos de Dominio

Los contratos de dominio definen las reglas de negocio que deben cumplirse:

```typescript
// ✅ CORRECTO: Interface de repositorio con contrato claro
export interface IProductRepository {
  /**
   * Busca un producto por ID
   * @param id - ID único del producto
   * @returns Promise<ProductEntity | null> - Producto encontrado o null
   * @throws ProductRepositoryError - Si hay error de infraestructura
   */
  findById(id: ProductId): Promise<ProductEntity | null>;

  /**
   * Guarda un producto
   * @param product - Entidad de producto válida
   * @returns Promise<void>
   * @throws DuplicateProductError - Si el producto ya existe
   * @throws ProductRepositoryError - Si hay error de infraestructura
   */
  save(product: ProductEntity): Promise<void>;

  /**
   * Obtiene todos los productos disponibles
   * @returns Promise<ProductEntity[]> - Lista de productos (puede estar vacía)
   * @throws ProductRepositoryError - Si hay error de infraestructura
   */
  findAll(): Promise<ProductEntity[]>;
}
```

### Contratos de Aplicación

Los contratos de aplicación definen casos de uso y sus precondiciones/postcondiciones:

```typescript
// ✅ CORRECTO: Servicio con contrato bien definido
export interface IProductService {
  /**
   * Crea un nuevo producto
   * Precondiciones:
   * - Los datos del producto deben ser válidos
   * - El nombre no debe estar vacío
   * - El precio debe ser mayor a 0
   * 
   * Postcondiciones:
   * - El producto se guarda en el repositorio
   * - Se retorna la entidad creada con ID asignado
   * 
   * @param data - Datos para crear el producto
   * @returns Promise<ProductEntity> - Producto creado
   * @throws InvalidProductDataError - Si los datos son inválidos
   * @throws DuplicateProductError - Si ya existe un producto con el mismo nombre
   */
  createProduct(data: CreateProductDto): Promise<ProductEntity>;

  /**
   * Actualiza el precio de un producto
   * Precondiciones:
   * - El producto debe existir
   * - El nuevo precio debe ser mayor a 0
   * 
   * Postcondiciones:
   * - El precio del producto se actualiza
   * - Se persiste el cambio
   * 
   * @param id - ID del producto
   * @param newPrice - Nuevo precio (debe ser > 0)
   * @returns Promise<void>
   * @throws ProductNotFoundError - Si el producto no existe
   * @throws InvalidPriceError - Si el precio es inválido
   */
  updatePrice(id: string, newPrice: number): Promise<void>;
}
```

## Validación de Implementaciones

### Verificación de Contratos de Repository

```typescript
// ✅ CORRECTO: Implementación que cumple el contrato
export class DatabaseProductRepository implements IProductRepository {
  async findById(id: ProductId): Promise<ProductEntity | null> {
    try {
      const data = await this.db.findOne({ _id: id.value });
      
      // ✅ Cumple contrato: retorna ProductEntity o null
      return data ? ProductEntity.fromPersistence(data) : null;
      
    } catch (error) {
      // ✅ Cumple contrato: lanza ProductRepositoryError en caso de error
      throw new ProductRepositoryError(
        `Error al buscar producto ${id.value}`,
        { productId: id.value, originalError: error.message }
      );
    }
  }

  async save(product: ProductEntity): Promise<void> {
    try {
      const data = product.toPersistence();
      
      await this.db.replaceOne(
        { _id: product.id.value },
        data,
        { upsert: true }
      );
      
      // ✅ Cumple contrato: no retorna nada en caso de éxito
      
    } catch (error) {
      if (error.code === 11000) {
        // ✅ Cumple contrato: lanza DuplicateProductError para duplicados
        throw new DuplicateProductError(
          `Producto ${product.id.value} ya existe`
        );
      }
      
      // ✅ Cumple contrato: lanza ProductRepositoryError para otros errores
      throw new ProductRepositoryError(
        `Error al guardar producto ${product.id.value}`,
        { productId: product.id.value, originalError: error.message }
      );
    }
  }
}

// ❌ INCORRECTO: Implementación que viola el contrato
export class BadProductRepository implements IProductRepository {
  async findById(id: ProductId): Promise<ProductEntity | null> {
    const data = await this.db.findOne({ _id: id.value });
    
    // ❌ Viola contrato: puede lanzar error no especificado
    if (!data) {
      throw new Error('Not found'); // Debería retornar null
    }
    
    // ❌ Viola contrato: puede retornar undefined
    return data ? ProductEntity.fromPersistence(data) : undefined as any;
  }

  async save(product: ProductEntity): Promise<void> {
    // ❌ Viola contrato: no maneja errores según especificación
    await this.db.save(product.toPersistence());
    
    // ❌ Viola contrato: retorna algo cuando debería ser void
    return 'saved' as any;
  }
}
```

### Verificación de Contratos de Service

```typescript
// ✅ CORRECTO: Servicio que valida precondiciones y garantiza postcondiciones
export class ProductService implements IProductService {
  constructor(private productRepository: IProductRepository) {}

  async createProduct(data: CreateProductDto): Promise<ProductEntity> {
    // ✅ Validar precondiciones
    if (!data.name || data.name.trim().length === 0) {
      throw new InvalidProductDataError('El nombre del producto es requerido');
    }
    
    if (data.price <= 0) {
      throw new InvalidProductDataError('El precio debe ser mayor a 0');
    }

    try {
      // ✅ Crear entidad siguiendo reglas de dominio
      const product = ProductEntity.create({
        name: data.name.trim(),
        price: Money.create(data.price),
        category: data.category
      });

      // ✅ Persistir usando repositorio
      await this.productRepository.save(product);

      // ✅ Postcondición: retornar entidad creada
      return product;
      
    } catch (error) {
      if (error instanceof DuplicateProductError) {
        // ✅ Cumple contrato: re-lanzar error específico
        throw error;
      }
      
      // ✅ Convertir errores inesperados
      throw new ProductServiceError(
        'Error al crear producto',
        { productData: data, originalError: error.message }
      );
    }
  }

  async updatePrice(id: string, newPrice: number): Promise<void> {
    // ✅ Validar precondiciones
    if (newPrice <= 0) {
      throw new InvalidPriceError(`Precio inválido: ${newPrice}`);
    }

    try {
      // ✅ Verificar que el producto existe
      const product = await this.productRepository.findById(ProductId.create(id));
      
      if (!product) {
        throw new ProductNotFoundError(id);
      }

      // ✅ Aplicar cambio usando lógica de dominio
      product.updatePrice(Money.create(newPrice));

      // ✅ Persistir cambio
      await this.productRepository.save(product);

      // ✅ Postcondición: void en caso de éxito
      
    } catch (error) {
      if (error instanceof ProductNotFoundError || error instanceof InvalidPriceError) {
        // ✅ Re-lanzar errores del contrato
        throw error;
      }
      
      throw new ProductServiceError(
        `Error al actualizar precio del producto ${id}`,
        { productId: id, newPrice, originalError: error.message }
      );
    }
  }
}
```

## Validación de Interfaces entre Módulos

### Contratos de Comunicación entre Módulos

```typescript
// ✅ CORRECTO: Facade que define contrato claro entre módulos
export interface ICartFacade {
  /**
   * Agrega un producto al carrito
   * Precondiciones:
   * - El producto debe existir
   * - La cantidad debe ser mayor a 0
   * - Debe haber stock suficiente
   * 
   * Postcondiciones:
   * - El producto se agrega al carrito
   * - El stock se reserva temporalmente
   * - Se actualiza el total del carrito
   * 
   * @param productData - Datos del producto a agregar
   * @returns Promise<CartOperationResult> - Resultado de la operación
   */
  addProduct(productData: AddToCartDto): Promise<CartOperationResult>;

  /**
   * Obtiene el contenido actual del carrito
   * Postcondiciones:
   * - Retorna información actualizada del carrito
   * - Los precios reflejan valores actuales
   * 
   * @returns Promise<CartInfoDto> - Información del carrito
   */
  getCartInfo(): Promise<CartInfoDto>;
}

// ✅ Implementación que cumple el contrato
export class CartFacade implements ICartFacade {
  constructor(
    private cartService: CartService,
    private productService: ProductService
  ) {}

  async addProduct(productData: AddToCartDto): Promise<CartOperationResult> {
    try {
      // ✅ Validar precondiciones
      if (productData.quantity <= 0) {
        return CartOperationResult.failure(
          'INVALID_QUANTITY',
          'La cantidad debe ser mayor a 0'
        );
      }

      // ✅ Verificar que el producto existe
      const product = await this.productService.getProduct(productData.productId);
      if (!product) {
        return CartOperationResult.failure(
          'PRODUCT_NOT_FOUND',
          'Producto no encontrado'
        );
      }

      // ✅ Verificar stock
      if (!product.hasStock(productData.quantity)) {
        return CartOperationResult.failure(
          'INSUFFICIENT_STOCK',
          `Solo hay ${product.getAvailableStock()} unidades disponibles`
        );
      }

      // ✅ Agregar al carrito
      await this.cartService.addItem(
        productData.productId,
        productData.quantity
      );

      // ✅ Postcondición: operación exitosa
      return CartOperationResult.success('Producto agregado al carrito');
      
    } catch (error) {
      // ✅ Manejo de errores según contrato
      return CartOperationResult.failure(
        'OPERATION_FAILED',
        'Error al agregar producto al carrito'
      );
    }
  }
}
```

### DTOs para Contratos entre Capas

```typescript
// ✅ CORRECTO: DTOs que definen contratos claros
export interface CreateProductDto {
  readonly name: string;        // Requerido, no vacío
  readonly price: number;       // Requerido, > 0
  readonly category: string;    // Requerido, valor válido
  readonly description?: string; // Opcional
  readonly image?: string;      // Opcional, URL válida si se proporciona
}

export interface ProductInfoDto {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly category: string;
  readonly description: string;
  readonly image?: string;
  readonly available: boolean;
  readonly stock: number;
  readonly createdAt: string;   // ISO string
  readonly updatedAt: string;   // ISO string
}

export interface CartOperationResult {
  readonly success: boolean;
  readonly message: string;
  readonly code?: string;
  readonly data?: any;

  static success(message: string, data?: any): CartOperationResult {
    return { success: true, message, data };
  }

  static failure(code: string, message: string): CartOperationResult {
    return { success: false, message, code };
  }
}
```

## Validaciones Automáticas de Contratos

### Verificación de Implementación de Interfaces

```typescript
// ✅ Reglas conceptuales para validar implementaciones
{
  rules: {
    'mandorla/interface-implementation': {
      'require-all-methods': true,
      'validate-return-types': true,
      'check-parameter-types': true,
      'enforce-error-handling': true
    },
    'mandorla/contract-validation': {
      'validate-preconditions': true,
      'validate-postconditions': true,
      'check-error-specifications': true
    }
  }
}
```

### Testing de Contratos

```typescript
// ✅ CORRECTO: Tests que validan contratos
describe('ProductRepository Contract', () => {
  let repository: IProductRepository;

  beforeEach(() => {
    repository = new DatabaseProductRepository(mockDb);
  });

  describe('findById', () => {
    it('debería retornar ProductEntity cuando el producto existe', async () => {
      // Arrange
      const productId = ProductId.create('test-id');
      const expectedProduct = ProductEntity.create({
        name: 'Test Product',
        price: Money.create(100),
        category: ProductCategory.BREAD
      });

      mockDb.findOne.mockResolvedValue(expectedProduct.toPersistence());

      // Act
      const result = await repository.findById(productId);

      // Assert - Validar contrato
      expect(result).toBeInstanceOf(ProductEntity);
      expect(result?.id.value).toBe('test-id');
    });

    it('debería retornar null cuando el producto no existe', async () => {
      // Arrange
      const productId = ProductId.create('non-existent');
      mockDb.findOne.mockResolvedValue(null);

      // Act
      const result = await repository.findById(productId);

      // Assert - Validar contrato
      expect(result).toBeNull();
    });

    it('debería lanzar ProductRepositoryError en caso de error de DB', async () => {
      // Arrange
      const productId = ProductId.create('test-id');
      mockDb.findOne.mockRejectedValue(new Error('DB Error'));

      // Act & Assert - Validar contrato de errores
      await expect(repository.findById(productId))
        .rejects
        .toThrow(ProductRepositoryError);
    });
  });

  describe('save', () => {
    it('debería guardar producto sin retornar valor', async () => {
      // Arrange
      const product = ProductEntity.create({
        name: 'Test Product',
        price: Money.create(100),
        category: ProductCategory.BREAD
      });

      mockDb.replaceOne.mockResolvedValue({ acknowledged: true });

      // Act
      const result = await repository.save(product);

      // Assert - Validar contrato (void)
      expect(result).toBeUndefined();
      expect(mockDb.replaceOne).toHaveBeenCalledWith(
        { _id: product.id.value },
        product.toPersistence(),
        { upsert: true }
      );
    });

    it('debería lanzar DuplicateProductError para productos duplicados', async () => {
      // Arrange
      const product = ProductEntity.create({
        name: 'Test Product',
        price: Money.create(100),
        category: ProductCategory.BREAD
      });

      mockDb.replaceOne.mockRejectedValue({ code: 11000 });

      // Act & Assert - Validar contrato de errores específicos
      await expect(repository.save(product))
        .rejects
        .toThrow(DuplicateProductError);
    });
  });
});
```

### Validación de DTOs

```typescript
// ✅ CORRECTO: Validación de DTOs con esquemas
import { z } from 'zod';

export const CreateProductDtoSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  price: z.number()
    .positive('El precio debe ser mayor a 0')
    .max(1000000, 'El precio no puede exceder $1,000,000'),
  
  category: z.enum(['galletas', 'pasteles', 'panes', 'temporada'], {
    errorMap: () => ({ message: 'Categoría inválida' })
  }),
  
  description: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  
  image: z.string()
    .url('Debe ser una URL válida')
    .optional()
});

export type CreateProductDto = z.infer<typeof CreateProductDtoSchema>;

// ✅ Validación automática en servicios
export class ProductService {
  async createProduct(data: unknown): Promise<ProductEntity> {
    // ✅ Validar contrato de entrada
    const validatedData = CreateProductDtoSchema.parse(data);
    
    // Continuar con lógica...
  }
}
```

## Documentación de Contratos

### Especificación de Interfaces

```typescript
/**
 * Repositorio para operaciones de productos
 * 
 * Contratos:
 * - Todas las operaciones son asíncronas
 * - Los errores de infraestructura se envuelven en ProductRepositoryError
 * - Los IDs inválidos no lanzan error, retornan null
 * - Las operaciones de escritura son atómicas
 */
export interface IProductRepository {
  /**
   * Busca un producto por su ID único
   * 
   * Contrato:
   * - Precondición: id debe ser un ProductId válido
   * - Postcondición: retorna ProductEntity si existe, null si no existe
   * - Errores: ProductRepositoryError para problemas de infraestructura
   * 
   * @param id - Identificador único del producto
   * @returns Promise que resuelve a ProductEntity o null
   * @throws ProductRepositoryError - Error de infraestructura
   */
  findById(id: ProductId): Promise<ProductEntity | null>;
}
```

### Ejemplos de Uso de Contratos

```typescript
// ✅ CORRECTO: Uso que respeta contratos
export class ProductController {
  constructor(private productService: IProductService) {}

  async createProduct(req: Request, res: Response) {
    try {
      // ✅ Validar entrada según contrato del DTO
      const productData = CreateProductDtoSchema.parse(req.body);
      
      // ✅ Usar servicio según su contrato
      const product = await this.productService.createProduct(productData);
      
      // ✅ Responder según contrato de API
      res.status(201).json({
        success: true,
        data: {
          id: product.id.value,
          name: product.name,
          price: product.price.value,
          category: product.category
        }
      });
      
    } catch (error) {
      // ✅ Manejar errores según contratos definidos
      if (error instanceof InvalidProductDataError) {
        res.status(400).json({
          success: false,
          error: {
            code: error.code,
            message: error.message
          }
        });
      } else if (error instanceof DuplicateProductError) {
        res.status(409).json({
          success: false,
          error: {
            code: error.code,
            message: error.message
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Error interno del servidor'
          }
        });
      }
    }
  }
}
```

## Beneficios de la Validación de Contratos

### Para Desarrollo

- Interfaces claras y predecibles
- Menos bugs por malentendidos de API
- Mejor experiencia de desarrollo con TypeScript

### Para Testing

- Tests más enfocados en contratos
- Validación automática de implementaciones
- Mejor cobertura de casos edge

### Para Mantenimiento

- Cambios seguros con validación de contratos
- Refactoring más confiable
- Documentación siempre actualizada

### Para Integración

- APIs consistentes entre módulos
- Contratos claros para equipos distribuidos
- Validación automática en CI/CD
