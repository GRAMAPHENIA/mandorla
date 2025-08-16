# Reglas de Arquitectura Modular - Proyecto Mandorla

## Propósito

Estas reglas aseguran que el código generado mantenga la separación de responsabilidades según la arquitectura hexagonal implementada, evitando dependencias circulares y manteniendo la integridad de los módulos.

## Estructura de Módulos Obligatoria

### Organización por Dominio

Cada módulo debe seguir la estructura hexagonal:

```
src/modules/[nombre-modulo]/
├── domain/                 # Lógica de negocio pura
│   ├── entities/          # Entidades de dominio
│   ├── value-objects/     # Objetos de valor
│   ├── repositories/      # Interfaces de repositorios
│   ├── errors/           # Errores específicos del dominio
│   └── types.ts          # Tipos del dominio
├── application/           # Casos de uso y servicios
│   ├── services/         # Servicios de aplicación
│   ├── dtos/            # Data Transfer Objects
│   ├── interfaces/      # Interfaces de servicios
│   └── index.ts         # Exportaciones de aplicación
├── infrastructure/       # Implementaciones concretas
│   ├── repositories/    # Implementaciones de repositorios
│   ├── services/       # Servicios de infraestructura
│   └── adapters/       # Adaptadores externos
├── presentation/        # Capa de presentación
│   ├── components/     # Componentes React específicos
│   ├── hooks/         # Hooks personalizados del módulo
│   ├── facades/       # Facades para simplificar UI
│   └── index.ts       # Exportaciones de presentación
└── index.ts            # Exportaciones principales del módulo
```

## Reglas de Dependencias

### Dependencias Permitidas

**Domain (Núcleo)**

- ✅ Puede depender de: Nada (debe ser puro)
- ❌ NO puede depender de: Application, Infrastructure, Presentation

**Application (Casos de Uso)**

- ✅ Puede depender de: Domain
- ❌ NO puede depender de: Infrastructure, Presentation

**Infrastructure (Implementaciones)**

- ✅ Puede depender de: Domain, Application
- ❌ NO puede depender de: Presentation

**Presentation (UI)**

- ✅ Puede depender de: Domain, Application, Infrastructure
- ❌ NO puede depender de: Otros módulos directamente (usar facades)

### Ejemplos de Dependencias Correctas

```typescript
// ✅ CORRECTO: Application depende de Domain
// src/modules/productos/application/services/product.service.ts
import { ProductEntity } from '../../domain/entities/product-entity';
import { IProductRepository } from '../../domain/repositories/product-repository.interface';

// ✅ CORRECTO: Infrastructure implementa interfaces de Domain
// src/modules/productos/infrastructure/repositories/product.repository.ts
import { IProductRepository } from '../../domain/repositories/product-repository.interface';
import { ProductEntity } from '../../domain/entities/product-entity';

// ✅ CORRECTO: Presentation usa Application a través de facades
// src/modules/productos/presentation/components/ProductList.tsx
import { ProductFacade } from '../facades/product.facade';
```

### Ejemplos de Dependencias Incorrectas

```typescript
// ❌ INCORRECTO: Domain no puede depender de Application
// src/modules/productos/domain/entities/product-entity.ts
import { ProductService } from '../../application/services/product.service'; // ❌

// ❌ INCORRECTO: Domain no puede depender de Infrastructure
// src/modules/productos/domain/entities/product-entity.ts
import { ProductRepository } from '../../infrastructure/repositories/product.repository'; // ❌

// ❌ INCORRECTO: Application no puede depender de Infrastructure
// src/modules/productos/application/services/product.service.ts
import { ProductRepository } from '../../infrastructure/repositories/product.repository'; // ❌

// ❌ INCORRECTO: Presentation no puede importar directamente de otros módulos
// src/modules/productos/presentation/components/ProductList.tsx
import { CartService } from '../../../carrito/application/services/cart.service'; // ❌
```

## Reglas de Comunicación entre Módulos

### Comunicación Permitida

**A través de Facades**

```typescript
// ✅ CORRECTO: Usar facade para comunicación entre módulos
// src/modules/productos/presentation/components/ProductCard.tsx
import { CartFacade } from '../../../carrito/presentation/facades/cart.facade';

export function ProductCard({ producto }: { producto: Producto }) {
  const cartFacade = new CartFacade();
  
  const handleAddToCart = () => {
    cartFacade.addProduct(producto);
  };
  
  return (
    <div>
      <button onClick={handleAddToCart}>Agregar al Carrito</button>
    </div>
  );
}
```

**A través de Eventos de Dominio**

```typescript
// ✅ CORRECTO: Comunicación a través de eventos
// src/modules/productos/domain/events/product-added-to-cart.event.ts
export class ProductAddedToCartEvent {
  constructor(
    public readonly productId: string,
    public readonly quantity: number
  ) {}
}
```

### Comunicación Prohibida

```typescript
// ❌ INCORRECTO: Importación directa entre módulos
// src/modules/productos/presentation/components/ProductCard.tsx
import { CartService } from '../../../carrito/application/services/cart.service'; // ❌

// ❌ INCORRECTO: Dependencia directa entre dominios
// src/modules/productos/domain/entities/product-entity.ts
import { CartEntity } from '../../../carrito/domain/entities/cart-entity'; // ❌
```

## Reglas de Exportaciones

### Exportaciones de Módulo Principal

```typescript
// ✅ CORRECTO: src/modules/productos/index.ts
// Solo exportar lo que otros módulos necesitan
export { ProductFacade } from './presentation/facades/product.facade';
export { ProductService } from './application/services/product.service';
export type { Producto, CategoriaProducto } from './domain/types';

// ❌ NO exportar detalles internos
// export { ProductEntity } from './domain/entities/product-entity'; // ❌
// export { ProductRepository } from './infrastructure/repositories/product.repository'; // ❌
```

### Exportaciones por Capa

```typescript
// ✅ CORRECTO: src/modules/productos/domain/index.ts
export { ProductEntity } from './entities/product-entity';
export { ProductId } from './value-objects/product-id';
export type { IProductRepository } from './repositories/product-repository.interface';

// ✅ CORRECTO: src/modules/productos/application/index.ts
export { ProductService } from './services/product.service';
export type { CreateProductDto, UpdateProductDto } from './dtos/product.dto';

// ✅ CORRECTO: src/modules/productos/presentation/index.ts
export { ProductFacade } from './facades/product.facade';
export { ProductList } from './components/ProductList';
export { useProducts } from './hooks/useProducts';
```

## Validaciones Automáticas

### Detección de Violaciones

**Dependencias Circulares**

```typescript
// ❌ DETECTAR: Dependencia circular
// Módulo A importa de Módulo B
// Módulo B importa de Módulo A
```

**Violaciones de Capas**

```typescript
// ❌ DETECTAR: Domain importando de Application
import { SomeService } from '../../application/services/some.service';

// ❌ DETECTAR: Application importando de Infrastructure
import { SomeRepository } from '../../infrastructure/repositories/some.repository';
```

**Importaciones Directas entre Módulos**

```typescript
// ❌ DETECTAR: Importación directa entre módulos
import { CartService } from '../../../carrito/application/services/cart.service';
```

### Sugerencias de Corrección

**Para Violaciones de Dependencia**

```typescript
// Sugerencia: En lugar de importar directamente de infrastructure
// src/modules/productos/application/services/product.service.ts

// ❌ Incorrecto
import { ProductRepository } from '../../infrastructure/repositories/product.repository';

// ✅ Correcto - usar inyección de dependencias
import { IProductRepository } from '../../domain/repositories/product-repository.interface';

export class ProductService {
  constructor(private productRepository: IProductRepository) {}
}
```

**Para Comunicación entre Módulos**

```typescript
// Sugerencia: En lugar de importar servicios directamente

// ❌ Incorrecto
import { CartService } from '../../../carrito/application/services/cart.service';

// ✅ Correcto - usar facade
import { CartFacade } from '../../../carrito/presentation/facades/cart.facade';
```

## Patrones Arquitectónicos Obligatorios

### Patrón Repository

```typescript
// ✅ OBLIGATORIO: Definir interface en Domain
// src/modules/productos/domain/repositories/product-repository.interface.ts
export interface IProductRepository {
  findById(id: ProductId): Promise<ProductEntity | null>;
  save(product: ProductEntity): Promise<void>;
  findAll(): Promise<ProductEntity[]>;
}

// ✅ OBLIGATORIO: Implementar en Infrastructure
// src/modules/productos/infrastructure/repositories/product.repository.ts
export class ProductRepository implements IProductRepository {
  async findById(id: ProductId): Promise<ProductEntity | null> {
    // implementación
  }
}
```

### Patrón Facade

```typescript
// ✅ OBLIGATORIO: Facade para simplificar interacción con UI
// src/modules/productos/presentation/facades/product.facade.ts
export class ProductFacade {
  private productService: ProductService;
  
  constructor() {
    this.productService = new ProductService(new ProductRepository());
  }
  
  async getProducts(): Promise<ProductDto[]> {
    // Simplificar llamadas complejas para la UI
  }
}
```

### Patrón Service

```typescript
// ✅ OBLIGATORIO: Servicios en Application para casos de uso
// src/modules/productos/application/services/product.service.ts
export class ProductService {
  constructor(private productRepository: IProductRepository) {}
  
  async createProduct(data: CreateProductDto): Promise<ProductEntity> {
    // Lógica del caso de uso
  }
}
```

## Reglas de Naming para Arquitectura

### Nombres de Archivos por Capa

**Domain**

- `[nombre]-entity.ts` - Entidades
- `[nombre]-id.ts` - Value Objects de ID
- `[nombre]-repository.interface.ts` - Interfaces de repositorio
- `[nombre]-errors.ts` - Errores específicos

**Application**

- `[nombre].service.ts` - Servicios de aplicación
- `[nombre].dto.ts` - Data Transfer Objects
- `[nombre]-repository.interface.ts` - Interfaces

**Infrastructure**

- `[nombre].repository.ts` - Implementaciones de repositorio
- `[nombre].adapter.ts` - Adaptadores
- `[nombre].service.ts` - Servicios de infraestructura

**Presentation**

- `[nombre].facade.ts` - Facades
- `[Nombre]Component.tsx` - Componentes React
- `use[Nombre].ts` - Hooks personalizados

## Herramientas de Validación

### Reglas de ESLint Personalizadas

```javascript
// Reglas conceptuales para validar arquitectura
{
  rules: {
    'mandorla/no-domain-dependencies': 'error',
    'mandorla/no-cross-module-imports': 'error',
    'mandorla/enforce-facade-pattern': 'warn',
    'mandorla/require-interface-implementation': 'error'
  }
}
```

### Validaciones en Build Time

- Verificar que Domain no tenga dependencias externas
- Validar que no existan dependencias circulares
- Confirmar que las interfaces estén implementadas
- Verificar estructura de carpetas obligatoria

## Beneficios de la Arquitectura Modular

### Mantenibilidad

- Cambios aislados por módulo
- Fácil testing unitario
- Refactoring seguro

### Escalabilidad

- Nuevos módulos sin afectar existentes
- Equipos pueden trabajar independientemente
- Reutilización de componentes

### Calidad

- Separación clara de responsabilidades
- Código más predecible
- Menor acoplamiento, mayor cohesión
