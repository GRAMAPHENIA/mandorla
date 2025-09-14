# Patrones de Manejo de Errores - Proyecto Mandorla

## Propósito

Estas reglas establecen patrones consistentes para el manejo de errores en todo el proyecto, asegurando una experiencia de usuario coherente y debugging eficiente en el e-commerce de panadería Mandorla.

## Jerarquía de Errores

### Estructura Base de Errores

```typescript
// ✅ Error base para todo el proyecto
export abstract class MandorlaError extends Error {
  abstract readonly code: string;
  abstract readonly type: 'validation' | 'business' | 'infrastructure' | 'not-found';
  abstract readonly statusCode: number;
  
  constructor(
    message: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    
    // Mantener stack trace en V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      type: this.type,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: new Date().toISOString()
    };
  }
}
```

### Errores por Dominio

**Errores de Productos**

```typescript
// src/modules/productos/domain/errors/product-errors.ts
export class ProductNotFoundError extends MandorlaError {
  readonly code = 'PRODUCT_NOT_FOUND';
  readonly type = 'not-found' as const;
  readonly statusCode = 404;

  constructor(productId: string) {
    super(`Producto con ID ${productId} no encontrado`, { productId });
  }
}

export class InvalidProductPriceError extends MandorlaError {
  readonly code = 'INVALID_PRODUCT_PRICE';
  readonly type = 'validation' as const;
  readonly statusCode = 400;

  constructor(price: number) {
    super(`Precio de producto inválido: ${price}. Debe ser mayor a 0`, { price });
  }
}

export class ProductOutOfStockError extends MandorlaError {
  readonly code = 'PRODUCT_OUT_OF_STOCK';
  readonly type = 'business' as const;
  readonly statusCode = 409;

  constructor(productId: string, requestedQuantity: number, availableStock: number) {
    super(
      `Producto ${productId} sin stock suficiente. Solicitado: ${requestedQuantity}, Disponible: ${availableStock}`,
      { productId, requestedQuantity, availableStock }
    );
  }
}
```

**Errores de Carrito**

```typescript
// src/modules/carrito/domain/errors/cart-errors.ts
export class CartNotFoundError extends MandorlaError {
  readonly code = 'CART_NOT_FOUND';
  readonly type = 'not-found' as const;
  readonly statusCode = 404;

  constructor(cartId: string) {
    super(`Carrito con ID ${cartId} no encontrado`, { cartId });
  }
}

export class InvalidQuantityError extends MandorlaError {
  readonly code = 'INVALID_QUANTITY';
  readonly type = 'validation' as const;
  readonly statusCode = 400;

  constructor(quantity: number) {
    super(`Cantidad inválida: ${quantity}. Debe ser mayor a 0`, { quantity });
  }
}

export class CartItemNotFoundError extends MandorlaError {
  readonly code = 'CART_ITEM_NOT_FOUND';
  readonly type = 'not-found' as const;
  readonly statusCode = 404;

  constructor(cartId: string, productId: string) {
    super(`Item no encontrado en carrito ${cartId} para producto ${productId}`, {
      cartId,
      productId
    });
  }
}
```

**Errores de Pedidos**

```typescript
// src/modules/pedidos/domain/errors/order-errors.ts
export class OrderNotFoundError extends MandorlaError {
  readonly code = 'ORDER_NOT_FOUND';
  readonly type = 'not-found' as const;
  readonly statusCode = 404;

  constructor(orderId: string) {
    super(`Pedido con ID ${orderId} no encontrado`, { orderId });
  }
}

export class InvalidOrderStateError extends MandorlaError {
  readonly code = 'INVALID_ORDER_STATE';
  readonly type = 'business' as const;
  readonly statusCode = 409;

  constructor(orderId: string, currentState: string, attemptedAction: string) {
    super(
      `No se puede ${attemptedAction} el pedido ${orderId} en estado ${currentState}`,
      { orderId, currentState, attemptedAction }
    );
  }
}

export class PaymentFailedError extends MandorlaError {
  readonly code = 'PAYMENT_FAILED';
  readonly type = 'infrastructure' as const;
  readonly statusCode = 402;

  constructor(orderId: string, reason: string) {
    super(`Pago fallido para pedido ${orderId}: ${reason}`, { orderId, reason });
  }
}
```

## Patrones de Manejo por Capa

### Domain Layer - Errores de Negocio

```typescript
// ✅ CORRECTO: Errores específicos del dominio
export class ProductEntity {
  updatePrice(newPrice: Money): void {
    if (newPrice.value <= 0) {
      throw new InvalidProductPriceError(newPrice.value);
    }
    
    if (newPrice.value > 1000000) {
      throw new ProductPriceTooHighError(newPrice.value);
    }
    
    this._price = newPrice;
  }

  reduceStock(quantity: number): void {
    if (quantity <= 0) {
      throw new InvalidQuantityError(quantity);
    }
    
    if (this._stock < quantity) {
      throw new ProductOutOfStockError(this._id.value, quantity, this._stock);
    }
    
    this._stock -= quantity;
  }
}
```

### Application Layer - Manejo de Casos de Uso

```typescript
// ✅ CORRECTO: Servicios manejan errores de dominio y crean errores de aplicación
export class ProductService {
  constructor(private productRepository: IProductRepository) {}

  async updateProductPrice(id: string, newPrice: number): Promise<void> {
    try {
      const product = await this.productRepository.findById(ProductId.create(id));
      
      if (!product) {
        throw new ProductNotFoundError(id);
      }

      // El dominio puede lanzar InvalidProductPriceError
      product.updatePrice(Money.create(newPrice));
      
      await this.productRepository.save(product);
      
    } catch (error) {
      if (error instanceof MandorlaError) {
        // Re-lanzar errores de dominio
        throw error;
      }
      
      // Convertir errores inesperados
      throw new ProductServiceError(
        `Error al actualizar precio del producto ${id}`,
        { originalError: error.message, productId: id, newPrice }
      );
    }
  }

  async addToCart(productId: string, cartId: string, quantity: number): Promise<void> {
    try {
      const product = await this.productRepository.findById(ProductId.create(productId));
      
      if (!product) {
        throw new ProductNotFoundError(productId);
      }

      // Verificar stock antes de agregar al carrito
      if (!product.hasStock(quantity)) {
        throw new ProductOutOfStockError(
          productId, 
          quantity, 
          product.getAvailableStock()
        );
      }

      // Continuar con lógica de agregar al carrito...
      
    } catch (error) {
      if (error instanceof MandorlaError) {
        throw error;
      }
      
      throw new CartOperationError(
        `Error al agregar producto ${productId} al carrito`,
        { productId, cartId, quantity, originalError: error.message }
      );
    }
  }
}
```

### Infrastructure Layer - Errores de Infraestructura

```typescript
// ✅ CORRECTO: Repositorios manejan errores de infraestructura
export class DatabaseProductRepository implements IProductRepository {
  async findById(id: ProductId): Promise<ProductEntity | null> {
    try {
      const data = await this.db.collection('products').findOne({ 
        _id: id.value 
      });
      
      return data ? ProductEntity.fromPersistence(data) : null;
      
    } catch (error) {
      throw new DatabaseConnectionError(
        'Error al buscar producto en base de datos',
        { productId: id.value, originalError: error.message }
      );
    }
  }

  async save(product: ProductEntity): Promise<void> {
    try {
      const data = product.toPersistence();
      
      await this.db.collection('products').replaceOne(
        { _id: product.id.value },
        data,
        { upsert: true }
      );
      
    } catch (error) {
      if (error.code === 11000) {
        throw new DuplicateProductError(
          `Producto con ID ${product.id.value} ya existe`,
          { productId: product.id.value }
        );
      }
      
      throw new DatabaseOperationError(
        'Error al guardar producto en base de datos',
        { productId: product.id.value, originalError: error.message }
      );
    }
  }
}
```

### Presentation Layer - Manejo de Errores de UI

```typescript
// ✅ CORRECTO: Componentes manejan errores de forma user-friendly
export function ProductCard({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async (quantity: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await cartService.addProduct(productId, quantity);
      toast.success('Producto agregado al carrito');
      
    } catch (error) {
      if (error instanceof ProductOutOfStockError) {
        setError(`Solo quedan ${error.context.availableStock} unidades disponibles`);
        toast.error('Producto sin stock suficiente');
        
      } else if (error instanceof ProductNotFoundError) {
        setError('Producto no disponible');
        toast.error('Producto no encontrado');
        
      } else if (error instanceof MandorlaError) {
        setError('Error al agregar producto al carrito');
        toast.error(error.message);
        
      } else {
        setError('Error inesperado. Por favor intenta de nuevo');
        toast.error('Error inesperado');
        console.error('Error no manejado:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-card">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={() => handleAddToCart(1)}
        disabled={loading}
      >
        {loading ? 'Agregando...' : 'Agregar al Carrito'}
      </Button>
    </div>
  );
}
```

## Manejo de Errores en APIs

### API Routes - Manejo Centralizado

```typescript
// ✅ CORRECTO: Middleware de manejo de errores
export function withErrorHandling(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
      
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof MandorlaError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            type: error.type,
            message: error.message,
            ...(process.env.NODE_ENV === 'development' && {
              context: error.context,
              stack: error.stack
            })
          }
        });
      }
      
      // Error no manejado
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          type: 'infrastructure',
          message: 'Error interno del servidor',
          ...(process.env.NODE_ENV === 'development' && {
            originalError: error.message,
            stack: error.stack
          })
        }
      });
    }
  };
}

// ✅ Uso del middleware
export default withErrorHandling(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { productId, quantity } = req.body;
    
    // Los errores se propagan automáticamente al middleware
    const result = await productService.addToCart(productId, 'default-cart', quantity);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  }
  
  return res.status(405).json({
    success: false,
    error: {
      code: 'METHOD_NOT_ALLOWED',
      type: 'validation',
      message: 'Método no permitido'
    }
  });
});
```

### Respuestas Consistentes de API

```typescript
// ✅ CORRECTO: Formato estándar de respuestas
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    type: string;
    message: string;
    context?: Record<string, any>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

// ✅ Helper para crear respuestas consistentes
export class ApiResponseBuilder {
  static success<T>(data: T, meta?: any): ApiResponse<T> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    };
  }

  static error(error: MandorlaError, requestId?: string): ApiResponse {
    return {
      success: false,
      error: {
        code: error.code,
        type: error.type,
        message: error.message,
        ...(error.context && { context: error.context })
      },
      meta: {
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId })
      }
    };
  }
}
```

## Logging y Monitoreo

### Configuración de Logging

```typescript
// ✅ CORRECTO: Logger estructurado
export class Logger {
  static error(error: Error, context?: Record<string, any>) {
    const logEntry = {
      level: 'error',
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      ...(error instanceof MandorlaError && {
        code: error.code,
        type: error.type,
        errorContext: error.context
      }),
      ...context
    };

    console.error(JSON.stringify(logEntry));
    
    // En producción, enviar a servicio de logging
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(logEntry);
    }
  }

  static warn(message: string, context?: Record<string, any>) {
    const logEntry = {
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      ...context
    };

    console.warn(JSON.stringify(logEntry));
  }

  private static async sendToLoggingService(logEntry: any) {
    // Implementar envío a servicio de logging (Sentry, LogRocket, etc.)
  }
}
```

### Métricas de Errores

```typescript
// ✅ CORRECTO: Tracking de errores para métricas
export class ErrorMetrics {
  private static errorCounts = new Map<string, number>();

  static trackError(error: MandorlaError) {
    const key = `${error.type}:${error.code}`;
    const currentCount = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, currentCount + 1);

    // Alertar si hay muchos errores del mismo tipo
    if (currentCount > 10) {
      this.alertHighErrorRate(error.code, currentCount);
    }
  }

  static getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }

  private static alertHighErrorRate(errorCode: string, count: number) {
    Logger.warn(`Alto número de errores ${errorCode}`, { count });
    // Implementar alertas (Slack, email, etc.)
  }
}
```

## Validaciones y Testing

### Testing de Manejo de Errores

```typescript
// ✅ CORRECTO: Tests específicos para errores
describe('ProductService', () => {
  describe('updateProductPrice', () => {
    it('debería lanzar ProductNotFoundError cuando el producto no existe', async () => {
      // Arrange
      const productId = 'non-existent-id';
      const mockRepository = {
        findById: jest.fn().mockResolvedValue(null)
      };
      const service = new ProductService(mockRepository);

      // Act & Assert
      await expect(service.updateProductPrice(productId, 100))
        .rejects
        .toThrow(ProductNotFoundError);
      
      expect(mockRepository.findById).toHaveBeenCalledWith(
        ProductId.create(productId)
      );
    });

    it('debería lanzar InvalidProductPriceError con precio negativo', async () => {
      // Arrange
      const product = ProductEntity.create({
        name: 'Pan',
        price: Money.create(50),
        category: ProductCategory.BREAD
      });
      
      const mockRepository = {
        findById: jest.fn().mockResolvedValue(product),
        save: jest.fn()
      };
      
      const service = new ProductService(mockRepository);

      // Act & Assert
      await expect(service.updateProductPrice('prod-1', -10))
        .rejects
        .toThrow(InvalidProductPriceError);
    });
  });
});
```

## Beneficios del Manejo Consistente de Errores

### Para Desarrolladores

- Debugging más eficiente con contexto detallado
- Patrones consistentes en todo el proyecto
- Fácil identificación del origen de errores

### Para Usuarios

- Mensajes de error claros y útiles
- Experiencia consistente en toda la aplicación
- Mejor manejo de casos edge

### Para Operaciones

- Logging estructurado para análisis
- Métricas de errores para monitoreo
- Alertas automáticas para problemas críticos

### Para Mantenimiento

- Errores tipados facilitan refactoring
- Jerarquía clara de errores
- Testing más completo de casos de error
