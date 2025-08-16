# Prevención de Dependencias Circulares - Proyecto Mandorla

## Propósito

Estas reglas previenen la creación de dependencias circulares entre módulos y capas, asegurando una arquitectura limpia y mantenible en el proyecto e-commerce Mandorla.

## Definición de Dependencias Circulares

### Qué son las Dependencias Circulares

Una dependencia circular ocurre cuando dos o más módulos se importan mutuamente, creando un ciclo de dependencias que puede causar:

- Problemas de compilación
- Dificultades en testing
- Código difícil de mantener
- Problemas de rendimiento en bundling

### Tipos de Dependencias Circulares

**Directas (A → B → A)**

```typescript
// ❌ PROBLEMA: Dependencia circular directa
// src/modules/productos/services/product.service.ts
import { CartService } from '../../carrito/services/cart.service';

// src/modules/carrito/services/cart.service.ts
import { ProductService } from '../../productos/services/product.service';
```

**Indirectas (A → B → C → A)**

```typescript
// ❌ PROBLEMA: Dependencia circular indirecta
// A → B
import { ModuleB } from '../moduleB';

// B → C  
import { ModuleC } from '../moduleC';

// C → A (cierra el ciclo)
import { ModuleA } from '../moduleA';
```

## Reglas de Prevención por Capa

### Regla 1: Domain es Independiente

La capa Domain NO puede importar de ninguna otra capa:

```typescript
// ✅ PERMITIDO en Domain
// src/modules/productos/domain/entities/product-entity.ts
import { Money } from '../value-objects/money'; // ✅ Mismo dominio
import { ProductId } from '../value-objects/product-id'; // ✅ Mismo dominio

// ❌ PROHIBIDO en Domain
import { ProductService } from '../../application/services/product.service'; // ❌
import { ProductRepository } from '../../infrastructure/repositories/product.repository'; // ❌
import { ProductComponent } from '../../presentation/components/ProductComponent'; // ❌
```

### Regla 2: Application Solo Depende de Domain

La capa Application solo puede importar de Domain:

```typescript
// ✅ PERMITIDO en Application
// src/modules/productos/application/services/product.service.ts
import { ProductEntity } from '../../domain/entities/product-entity'; // ✅
import { IProductRepository } from '../../domain/repositories/product-repository.interface'; // ✅

// ❌ PROHIBIDO en Application
import { ProductRepository } from '../../infrastructure/repositories/product.repository'; // ❌
import { ProductComponent } from '../../presentation/components/ProductComponent'; // ❌
```

### Regla 3: Infrastructure Depende de Domain y Application

```typescript
// ✅ PERMITIDO en Infrastructure
// src/modules/productos/infrastructure/repositories/product.repository.ts
import { ProductEntity } from '../../domain/entities/product-entity'; // ✅
import { IProductRepository } from '../../domain/repositories/product-repository.interface'; // ✅
import { CreateProductDto } from '../../application/dtos/create-product.dto'; // ✅

// ❌ PROHIBIDO en Infrastructure
import { ProductComponent } from '../../presentation/components/ProductComponent'; // ❌
```

### Regla 4: Presentation Puede Depender de Todas las Capas

```typescript
// ✅ PERMITIDO en Presentation
// src/modules/productos/presentation/components/ProductList.tsx
import { ProductEntity } from '../../domain/entities/product-entity'; // ✅
import { ProductService } from '../../application/services/product.service'; // ✅
import { ProductRepository } from '../../infrastructure/repositories/product.repository'; // ✅
```

## Reglas de Comunicación entre Módulos

### Regla 5: No Importación Directa entre Módulos

Los módulos NO deben importarse directamente entre sí:

```typescript
// ❌ PROHIBIDO: Importación directa entre módulos
// src/modules/productos/presentation/components/ProductCard.tsx
import { CartService } from '../../../carrito/application/services/cart.service'; // ❌
import { CartEntity } from '../../../carrito/domain/entities/cart-entity'; // ❌

// ✅ PERMITIDO: Usar facades o eventos
import { CartFacade } from '../../../carrito/presentation/facades/cart.facade'; // ✅
```

### Regla 6: Comunicación a través de Facades

```typescript
// ✅ CORRECTO: Usar facade para comunicación
// src/modules/productos/presentation/components/ProductCard.tsx
import { CartFacade } from '../../../carrito/presentation/facades/cart.facade';

export function ProductCard({ producto }: { producto: Producto }) {
  const cartFacade = new CartFacade();
  
  const handleAddToCart = async () => {
    await cartFacade.addProduct({
      id: producto.id,
      name: producto.nombre,
      price: producto.precio
    });
  };
  
  return <button onClick={handleAddToCart}>Agregar</button>;
}
```

## Patrones para Evitar Dependencias Circulares

### Patrón 1: Inversión de Dependencias

```typescript
// ✅ SOLUCIÓN: Definir interface en Domain
// src/modules/productos/domain/repositories/product-repository.interface.ts
export interface IProductRepository {
  save(product: ProductEntity): Promise<void>;
  findById(id: string): Promise<ProductEntity | null>;
}

// ✅ Application depende de la interface, no de la implementación
// src/modules/productos/application/services/product.service.ts
import { IProductRepository } from '../../domain/repositories/product-repository.interface';

export class ProductService {
  constructor(private productRepository: IProductRepository) {}
}

// ✅ Infrastructure implementa la interface
// src/modules/productos/infrastructure/repositories/product.repository.ts
import { IProductRepository } from '../../domain/repositories/product-repository.interface';

export class ProductRepository implements IProductRepository {
  // implementación
}
```

### Patrón 2: Eventos de Dominio

```typescript
// ✅ SOLUCIÓN: Comunicación a través de eventos
// src/modules/productos/domain/events/product-added-to-cart.event.ts
export class ProductAddedToCartEvent {
  constructor(
    public readonly productId: string,
    public readonly quantity: number,
    public readonly timestamp: Date = new Date()
  ) {}
}

// ✅ Emitir evento en lugar de llamar directamente
// src/modules/productos/application/services/product.service.ts
import { EventEmitter } from '../../../shared/events/event-emitter';
import { ProductAddedToCartEvent } from '../../domain/events/product-added-to-cart.event';

export class ProductService {
  async addToCart(productId: string, quantity: number) {
    // Lógica de negocio
    
    // Emitir evento en lugar de llamar CartService directamente
    EventEmitter.emit(new ProductAddedToCartEvent(productId, quantity));
  }
}

// ✅ Escuchar evento en el módulo correspondiente
// src/modules/carrito/application/event-handlers/product-added-handler.ts
import { EventEmitter } from '../../../shared/events/event-emitter';
import { ProductAddedToCartEvent } from '../../../productos/domain/events/product-added-to-cart.event';

EventEmitter.on(ProductAddedToCartEvent, async (event) => {
  // Manejar el evento sin crear dependencia circular
  await cartService.addItem(event.productId, event.quantity);
});
```

### Patrón 3: Shared Kernel

```typescript
// ✅ SOLUCIÓN: Crear módulo compartido para tipos comunes
// src/shared/types/common.types.ts
export interface Money {
  value: number;
  currency: string;
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Ambos módulos pueden usar tipos compartidos sin dependencia circular
// src/modules/productos/domain/entities/product-entity.ts
import { Money, BaseEntity } from '../../../shared/types/common.types';

// src/modules/carrito/domain/entities/cart-entity.ts
import { Money, BaseEntity } from '../../../shared/types/common.types';
```

## Detección Automática de Dependencias Circulares

### Herramientas de Análisis

```typescript
// Configuración conceptual para detectar dependencias circulares
{
  "rules": {
    "import/no-cycle": ["error", { 
      "maxDepth": 10,
      "ignoreExternal": true 
    }],
    "mandorla/no-cross-module-dependencies": "error",
    "mandorla/enforce-layer-dependencies": "error"
  }
}
```

### Script de Validación

```javascript
// scripts/check-circular-dependencies.js
const madge = require('madge');

async function checkCircularDependencies() {
  const result = await madge('src/', {
    fileExtensions: ['ts', 'tsx'],
    excludeRegExp: ['node_modules', '.test.', '.spec.']
  });
  
  const circular = result.circular();
  
  if (circular.length > 0) {
    console.error('❌ Dependencias circulares detectadas:');
    circular.forEach(cycle => {
      console.error(`  ${cycle.join(' → ')}`);
    });
    process.exit(1);
  } else {
    console.log('✅ No se encontraron dependencias circulares');
  }
}

checkCircularDependencies();
```

## Casos Específicos del Proyecto Mandorla

### Módulo Productos ↔ Carrito

```typescript
// ❌ PROBLEMA: Dependencia circular común
// ProductService necesita agregar al carrito
// CartService necesita información del producto

// ✅ SOLUCIÓN 1: Usar eventos
// src/modules/productos/application/services/product.service.ts
export class ProductService {
  async addToCart(productId: string, quantity: number) {
    const product = await this.getProduct(productId);
    
    // Emitir evento en lugar de llamar CartService
    EventEmitter.emit(new ProductAddedToCartEvent(productId, quantity));
  }
}

// ✅ SOLUCIÓN 2: Usar facade compartido
// src/shared/facades/ecommerce.facade.ts
export class EcommerceFacade {
  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}
  
  async addProductToCart(productId: string, quantity: number) {
    const product = await this.productService.getProduct(productId);
    await this.cartService.addItem(product, quantity);
  }
}
```

### Módulo Carrito ↔ Pedidos

```typescript
// ❌ PROBLEMA: CartService crea pedidos, OrderService necesita carrito

// ✅ SOLUCIÓN: Separar responsabilidades
// src/modules/carrito/application/services/cart.service.ts
export class CartService {
  // Solo maneja operaciones del carrito
  async getCartForCheckout(cartId: string): Promise<CartCheckoutDto> {
    // Retorna DTO para checkout, no crea pedido directamente
  }
}

// src/modules/pedidos/application/services/order.service.ts
export class OrderService {
  async createOrderFromCart(cartData: CartCheckoutDto): Promise<Order> {
    // Crea pedido basado en datos del carrito
  }
}

// src/modules/checkout/application/services/checkout.service.ts
export class CheckoutService {
  constructor(
    private cartService: CartService,
    private orderService: OrderService
  ) {}
  
  async processCheckout(cartId: string): Promise<Order> {
    const cartData = await this.cartService.getCartForCheckout(cartId);
    const order = await this.orderService.createOrderFromCart(cartData);
    await this.cartService.clearCart(cartId);
    return order;
  }
}
```

## Validaciones en Tiempo de Desarrollo

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run check-circular-deps && npm run lint"
    }
  }
}
```

### CI/CD Pipeline

```yaml
# .github/workflows/quality-check.yml
- name: Check Circular Dependencies
  run: |
    npm run check-circular-deps
    npm run validate-architecture
```

## Beneficios de Evitar Dependencias Circulares

### Técnicos

- Compilación más rápida
- Bundle splitting más eficiente
- Testing más fácil
- Debugging simplificado

### Arquitectónicos

- Código más mantenible
- Módulos verdaderamente independientes
- Refactoring más seguro
- Escalabilidad mejorada

### De Desarrollo

- Menos bugs relacionados con inicialización
- Mejor comprensión del flujo de datos
- Equipos pueden trabajar independientemente
- Onboarding más fácil para nuevos desarrolladores
