# Módulo de Productos - Arquitectura Hexagonal

Este módulo implementa la funcionalidad de productos siguiendo los principios SOLID y la arquitectura hexagonal (Clean Architecture).

## Estructura del Módulo

```
src/modules/productos/
├── domain/                 # Capa de dominio - Lógica de negocio pura
│   ├── entities/          # Entidades de dominio
│   ├── value-objects/     # Objetos de valor
│   ├── errors/           # Errores específicos del dominio
│   └── __tests__/        # Tests unitarios del dominio
├── application/           # Capa de aplicación - Casos de uso
│   ├── services/         # Servicios de aplicación
│   ├── interfaces/       # Interfaces (puertos)
│   ├── dto/             # Objetos de transferencia de datos
│   ├── errors/          # Errores de aplicación
│   └── __tests__/       # Tests unitarios de aplicación
├── infrastructure/       # Capa de infraestructura - Implementaciones concretas
│   ├── repositories/    # Implementaciones de repositorios
│   ├── adapters/        # Adaptadores para servicios externos
│   ├── mappers/         # Mappers entre capas
│   └── __tests__/       # Tests de integración
├── presentation/         # Capa de presentación - UI y hooks
│   ├── components/      # Componentes React refactorizados
│   └── hooks/           # Hooks personalizados
└── README.md            # Este archivo
```

## Principios Aplicados

### 1. Principio de Responsabilidad Única (SRP)
- Cada clase y componente tiene una sola responsabilidad
- `ProductEntity`: Solo maneja la lógica de negocio del producto
- `ProductService`: Solo maneja casos de uso de productos
- `ProductRepository`: Solo maneja persistencia de productos

### 2. Principio Abierto/Cerrado (OCP)
- Las interfaces están abiertas para extensión pero cerradas para modificación
- `IProductRepository` permite diferentes implementaciones sin cambiar el código existente

### 3. Principio de Sustitución de Liskov (LSP)
- Las implementaciones concretas pueden sustituir a sus abstracciones
- `ProductRepository` puede sustituir a `IProductRepository` sin romper funcionalidad

### 4. Principio de Segregación de Interfaces (ISP)
- Las interfaces son específicas y no fuerzan implementaciones innecesarias
- `IProductRepository` solo define métodos relacionados con persistencia

### 5. Principio de Inversión de Dependencias (DIP)
- Las capas superiores no dependen de las inferiores
- `ProductService` depende de `IProductRepository`, no de implementaciones concretas

## Capas de la Arquitectura

### Dominio (Domain)
Contiene la lógica de negocio pura, sin dependencias externas.

**Entidades:**
- `ProductEntity`: Representa un producto con toda su lógica de negocio

**Value Objects:**
- `ProductId`: Identificador único del producto
- `Money`: Representa valores monetarios con validaciones
- `ProductCategory`: Categorías válidas de productos

**Errores:**
- Errores específicos del dominio como `ProductNotFoundError`, `InvalidPriceError`

### Aplicación (Application)
Define los casos de uso y orquesta las operaciones del dominio.

**Servicios:**
- `ProductService`: Implementa casos de uso como buscar, filtrar, actualizar productos

**Interfaces:**
- `IProductRepository`: Define el contrato para persistencia de productos

**DTOs:**
- `ProductSearchCriteria`: Criterios de búsqueda
- `ProductUpdateData`: Datos para actualización

### Infraestructura (Infrastructure)
Implementa los detalles técnicos y adaptadores externos.

**Repositorios:**
- `ProductRepository`: Implementación concreta que usa localStorage y datos mock

**Adaptadores:**
- `LocalStorageAdapter`: Maneja persistencia en localStorage
- `MockDataAdapter`: Proporciona datos de prueba

**Mappers:**
- `ProductMapper`: Convierte entre entidades de dominio y DTOs

### Presentación (Presentation)
Componentes React y hooks para la interfaz de usuario.

**Componentes:**
- `ProductCard`: Tarjeta de producto refactorizada
- `ProductGrid`: Grilla de productos con filtros
- `ProductFilters`: Panel de filtros avanzados

**Hooks:**
- `useProducts`: Gestión de productos
- `useProductFilters`: Gestión de filtros
- `useProductActions`: Acciones de productos (carrito, favoritos)

## Uso del Módulo

### Importar componentes refactorizados:
```typescript
import { ProductCard, ProductGrid, ProductFilters } from '@/modules/productos'
```

### Usar hooks personalizados:
```typescript
import { useProducts, useProductFilters, useProductActions } from '@/modules/productos'

function MyComponent() {
  const { products, loading, error } = useProducts()
  const { filters, searchProducts } = useProductFilters()
  const { handleAddToCart } = useProductActions()
  
  // ... lógica del componente
}
```

### Trabajar con entidades de dominio:
```typescript
import { ProductEntity, ProductId, Money, ProductCategory } from '@/modules/productos'

const product = new ProductEntity({
  id: new ProductId('1'),
  name: 'Galletas de Chocolate',
  price: new Money(12.99),
  category: new ProductCategory('cookies'),
  // ... otros campos
})

// Usar métodos de dominio
product.updatePrice(new Money(15.99))
product.setFeatured(true)
const hasDiscount = product.hasDiscount()
```

## Testing

El módulo incluye tests completos para todas las capas:

- **Tests unitarios de dominio**: Validan la lógica de negocio
- **Tests unitarios de aplicación**: Validan casos de uso
- **Tests de integración**: Validan la interacción entre capas

Ejecutar tests:
```bash
# Todos los tests del módulo
pnpm test src/modules/productos

# Solo tests de dominio
pnpm test src/modules/productos/domain

# Solo tests de aplicación
pnpm test src/modules/productos/application

# Solo tests de infraestructura
pnpm test src/modules/productos/infrastructure
```

## Beneficios de esta Arquitectura

1. **Mantenibilidad**: Código organizado y fácil de mantener
2. **Testabilidad**: Cada capa se puede testear independientemente
3. **Flexibilidad**: Fácil cambiar implementaciones sin afectar otras capas
4. **Escalabilidad**: Estructura preparada para crecimiento
5. **Separación de responsabilidades**: Cada capa tiene un propósito claro
6. **Reutilización**: Componentes y hooks reutilizables
7. **Tipado fuerte**: TypeScript en todas las capas para mayor seguridad

## Próximos Pasos

1. Implementar más casos de uso en `ProductService`
2. Agregar más adaptadores (API REST, GraphQL)
3. Crear más componentes de presentación especializados
4. Implementar caching y optimizaciones de rendimiento
5. Agregar más validaciones de dominio
6. Implementar eventos de dominio para desacoplamiento