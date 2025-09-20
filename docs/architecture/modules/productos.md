# Diagrama de Arquitectura: Módulo Productos

## Descripción

Este diagrama muestra la arquitectura hexagonal del módulo de productos de la panadería Mandorla, incluyendo las capas de dominio, aplicación, infraestructura y presentación, así como sus interacciones y dependencias.

## Diagrama de Arquitectura Hexagonal

```mermaid
graph TB
    subgraph "Módulo Productos"
        subgraph "Domain Layer"
            PE[ProductEntity]
            PI[ProductId]
            M[Money]
            PC[ProductCategory]
            PER[ProductErrors]
            IPR[IProductRepository]
        end
        
        subgraph "Application Layer"
            PS[ProductService]
            DTO[ProductDTOs]
            AE[ApplicationErrors]
        end
        
        subgraph "Infrastructure Layer"
            PR[ProductRepository]
            PM[ProductMapper]
            LSA[LocalStorageAdapter]
            MDA[MockDataAdapter]
            IMPR[InMemoryProductRepository]
        end
        
        subgraph "Presentation Layer"
            PCard[ProductCard]
            PGrid[ProductGrid]
            PFilters[ProductFilters]
            UPA[useProductActions]
            UPF[useProductFilters]
            UP[useProducts]
        end
    end
    
    %% Dependencias entre capas
    PS --> PE
    PS --> IPR
    PS --> DTO
    
    PR --> IPR
    PR --> PE
    PR --> PM
    
    PM --> PE
    PM --> PI
    PM --> M
    
    PCard --> PS
    PGrid --> UP
    PFilters --> UPF
    
    UP --> PS
    UPA --> PS
    UPF --> PS
    
    %% Value Objects relationships
    PE --> PI
    PE --> M
    PE --> PC
    PE --> PER
    
    %% Infrastructure implementations
    LSA --> PR
    MDA --> PR
    IMPR --> IPR
    
    classDef domainClass fill:#e1f5fe
    classDef applicationClass fill:#f3e5f5
    classDef infrastructureClass fill:#e8f5e8
    classDef presentationClass fill:#fff3e0
    
    class PE,PI,M,PC,PER,IPR domainClass
    class PS,DTO,AE applicationClass
    class PR,PM,LSA,MDA,IMPR infrastructureClass
    class PCard,PGrid,PFilters,UPA,UPF,UP presentationClass
```

## Diagrama de Entidades de Dominio

```mermaid
classDiagram
    class ProductEntity {
        -_id: ProductId
        -_name: string
        -_description: string
        -_price: Money
        -_originalPrice?: Money
        -_image: string
        -_category: ProductCategory
        -_featured: boolean
        -_inStock: boolean
        -_ingredients: string[]
        -_allergens: string[]
        
        +updatePrice(newPrice: Money): void
        +setOriginalPrice(originalPrice: Money): void
        +removeOriginalPrice(): void
        +changeAvailability(available: boolean): void
        +setFeatured(featured: boolean): void
        +changeCategory(newCategory: ProductCategory): void
        +updateName(newName: string): void
        +updateDescription(newDescription: string): void
        +addIngredient(ingredient: string): void
        +removeIngredient(ingredient: string): void
        +addAllergen(allergen: string): void
        +removeAllergen(allergen: string): void
        +hasDiscount(): boolean
        +getDiscountPercentage(): number
        +isAvailable(): boolean
        +containsAllergen(allergen: string): boolean
        +containsIngredient(ingredient: string): boolean
        +checkAvailabilityForPurchase(): void
        +toJSON(): object
        +fromPlainObject(data: object): ProductEntity
    }
    
    class ProductId {
        -_value: string
        +value: string
        +equals(other: ProductId): boolean
        +toString(): string
    }
    
    class Money {
        -_amount: number
        -_currency: string
        +amount: number
        +currency: string
        +equals(other: Money): boolean
        +add(other: Money): Money
        +multiply(factor: number): Money
        +isGreaterThan(other: Money): boolean
        +toString(): string
        +toJSON(): object
    }
    
    class ProductCategory {
        -_value: string
        +value: string
        +fromString(value: string): ProductCategory
        +equals(other: ProductCategory): boolean
    }
    
    class ProductErrors {
        <<abstract>>
        +ProductNotFoundError
        +InvalidPriceError
        +InvalidProductNameError
        +InvalidProductDescriptionError
        +ProductOutOfStockError
        +InvalidIngredientError
        +InvalidAllergenError
    }
    
    ProductEntity --> ProductId : contains
    ProductEntity --> Money : contains
    ProductEntity --> ProductCategory : contains
    ProductEntity --> ProductErrors : throws
```

## Diagrama de Servicios de Aplicación

```mermaid
graph LR
    subgraph "Application Services"
        PS[ProductService]
    end
    
    subgraph "Domain Interfaces"
        IPR[IProductRepository]
    end
    
    subgraph "DTOs"
        PSC[ProductSearchCriteria]
        PUD[ProductUpdateData]
    end
    
    subgraph "Domain Entities"
        PE[ProductEntity]
    end
    
    PS --> IPR
    PS --> PSC
    PS --> PUD
    PS --> PE
    
    PS -.-> |"creates/updates"| PE
    PS -.-> |"uses"| IPR
```

## Diagrama de Testing

```mermaid
graph TB
    subgraph "Test Structure"
        subgraph "Domain Tests"
            PET[ProductEntity.test.ts]
            PIT[ProductId.test.ts]
            MT[Money.test.ts]
            PCT[ProductCategory.test.ts]
        end
        
        subgraph "Application Tests"
            PST[ProductService.test.ts]
        end
        
        subgraph "Infrastructure Tests"
            PRT[ProductRepository.integration.test.ts]
            PMT[ProductMapper.test.ts]
        end
        
        subgraph "Test Fixtures"
            TPF[productos-panaderia.ts]
        end
    end
    
    subgraph "Tested Components"
        PE[ProductEntity]
        PS[ProductService]
        PR[ProductRepository]
        PM[ProductMapper]
    end
    
    PET --> PE
    PST --> PS
    PRT --> PR
    PMT --> PM
    
    PST --> TPF
    PRT --> TPF
```

## Flujos de Datos Principales

### Flujo de Creación de Producto

```mermaid
sequenceDiagram
    participant UI as Componente UI
    participant PS as ProductService
    participant PE as ProductEntity
    participant PR as ProductRepository
    participant DB as Almacenamiento
    
    UI->>PS: createProduct(productData)
    PS->>PE: ProductEntity.create(data)
    PE->>PE: validateData()
    PE-->>PS: productEntity
    PS->>PR: save(productEntity)
    PR->>DB: persist(data)
    DB-->>PR: success
    PR-->>PS: void
    PS-->>UI: productEntity
```

### Flujo de Actualización de Precio

```mermaid
sequenceDiagram
    participant UI as Componente UI
    participant PS as ProductService
    participant PR as ProductRepository
    participant PE as ProductEntity
    participant M as Money
    
    UI->>PS: updatePrice(id, newPrice)
    PS->>PR: findById(id)
    PR-->>PS: productEntity
    PS->>M: Money.create(newPrice)
    M-->>PS: moneyObject
    PS->>PE: updatePrice(moneyObject)
    PE->>PE: validatePrice()
    PE-->>PS: void
    PS->>PR: save(productEntity)
    PR-->>PS: void
    PS-->>UI: success
```

## Componentes y Responsabilidades

### Domain Layer

- **ProductEntity**: Entidad principal que encapsula la lógica de negocio de productos
- **ProductId**: Value Object para identificadores únicos de productos
- **Money**: Value Object para manejo de precios y monedas
- **ProductCategory**: Value Object para categorías de productos
- **ProductErrors**: Errores específicos del dominio de productos
- **IProductRepository**: Interface que define el contrato para persistencia

### Application Layer

- **ProductService**: Servicio que orquesta casos de uso de productos
- **ProductDTOs**: Objetos de transferencia de datos para la capa de aplicación
- **ApplicationErrors**: Errores específicos de la capa de aplicación

### Infrastructure Layer

- **ProductRepository**: Implementación concreta del repositorio de productos
- **ProductMapper**: Mapea entre entidades de dominio y datos de persistencia
- **LocalStorageAdapter**: Adaptador para almacenamiento local
- **MockDataAdapter**: Adaptador para datos de prueba
- **InMemoryProductRepository**: Implementación en memoria para testing

### Presentation Layer

- **ProductCard**: Componente para mostrar información de un producto
- **ProductGrid**: Componente para mostrar lista de productos
- **ProductFilters**: Componente para filtrar productos
- **useProducts**: Hook para gestionar estado de productos
- **useProductActions**: Hook para acciones de productos
- **useProductFilters**: Hook para filtros de productos

## Patrones de Diseño Implementados

### Repository Pattern

- Interface `IProductRepository` en Domain
- Implementación `ProductRepository` en Infrastructure
- Permite intercambiar implementaciones sin afectar la lógica de negocio

### Value Objects Pattern

- `ProductId`, `Money`, `ProductCategory`
- Encapsulan validaciones y comportamientos específicos
- Garantizan inmutabilidad y validez de datos

### Domain Events Pattern

- Errores específicos del dominio
- Validaciones en entidades
- Separación clara de responsabilidades

### Dependency Injection Pattern

- Servicios dependen de interfaces, no implementaciones
- Facilita testing y intercambio de implementaciones
- Inversión de control en capas superiores

## Testing Strategy

### Unit Tests

- **Domain**: Tests de entidades, value objects y errores
- **Application**: Tests de servicios con mocks de repositorios
- **Infrastructure**: Tests de mappers y adaptadores

### Integration Tests

- **Repository**: Tests con almacenamiento real
- **Service**: Tests end-to-end de casos de uso

### Test Fixtures

- Datos de prueba específicos para panadería
- Productos realistas (panes, galletas, pasteles)
- Escenarios de negocio comunes

## Notas de Implementación

### Validaciones de Dominio

- Precios deben ser positivos
- Nombres de productos no pueden estar vacíos
- Ingredientes y alérgenos deben ser válidos
- Stock debe ser manejado correctamente

### Manejo de Errores

- Errores específicos por tipo de validación
- Jerarquía clara de errores de dominio
- Mensajes descriptivos en español

### Persistencia

- Mapeo entre entidades de dominio y DTOs
- Soporte para múltiples adaptadores de almacenamiento
- Serialización/deserialización consistente

## Última Actualización

- **Fecha**: 2024-12-19
- **Cambios**:
  - Actualización basada en modificaciones en tests de ProductEntity
  - Corrección de imports en tests (value-objects path)
  - Validación de estructura de testing completa
  - Documentación de patrones de testing implementados

## Archivos Relacionados

- [Documentación de ProductEntity](../entities/product-entity.md)
- [Documentación de ProductService](../services/product-service.md)
- [API de Productos](../apis/products-api.md)
- [Flujo de Gestión de Productos](../flows/product-management-flow.md)
