# Diagrama: Arquitectura de Testing - Módulo Productos

## Descripción

Diagrama completo de la arquitectura de testing del módulo de productos, mostrando la cobertura de tests por capa, estrategias de testing y flujos de validación implementados.

## Diagrama de Arquitectura de Testing

```mermaid
graph TB
    subgraph "Testing Architecture - Módulo Productos"
        subgraph "Domain Layer Tests"
            subgraph "Entity Tests"
                PET[ProductEntity.test.ts]
                PET_CREATE[Creación de producto]
                PET_PRICE[Actualización de precio]
                PET_STOCK[Gestión de stock]
                PET_AVAIL[Disponibilidad]
                PET_SERIAL[Serialización]
            end
            
            subgraph "Value Object Tests"
                MIT[Money.test.ts]
                PIT[ProductId.test.ts]
                PCT[ProductCategory.test.ts]
            end
            
            subgraph "Domain Error Tests"
                DET[Domain Errors Tests]
            end
        end
        
        subgraph "Application Layer Tests"
            subgraph "Service Tests"
                PST[ProductService.test.ts]
                PST_UNIT[Tests Unitarios]
                PST_MOCK[Mocks de Repository]
            end
            
            subgraph "DTO Tests"
                DTO_TESTS[DTO Validation Tests]
            end
        end
        
        subgraph "Infrastructure Layer Tests"
            subgraph "Repository Tests"
                PRT[ProductRepository.integration.test.ts]
                PRT_INTEGRATION[Tests de Integración]
            end
            
            subgraph "Mapper Tests"
                PMT[ProductMapper.test.ts]
                PMT_TRANSFORM[Transformación de Datos]
            end
        end
        
        subgraph "Presentation Layer Tests"
            subgraph "Component Tests"
                COMP_TESTS[Component Tests]
                HOOK_TESTS[Hook Tests]
            end
        end
        
        subgraph "Test Fixtures"
            FIXTURES[productos-panaderia.ts]
            MOCK_DATA[Mock Data]
        end
    end
    
    PET --> PET_CREATE
    PET --> PET_PRICE
    PET --> PET_STOCK
    PET --> PET_AVAIL
    PET --> PET_SERIAL
    
    PST --> PST_UNIT
    PST --> PST_MOCK
    
    PRT --> PRT_INTEGRATION
    PMT --> PMT_TRANSFORM
    
    FIXTURES --> PET
    FIXTURES --> PST
    FIXTURES --> PRT
    
    MIT --> Money
    PIT --> ProductId
    PCT --> ProductCategory
    
    DET --> ProductErrors
```

## Diagrama de Flujo de Testing

```mermaid
sequenceDiagram
    participant Dev as Desarrollador
    participant Test as Test Runner
    participant Domain as Domain Tests
    participant App as Application Tests
    participant Infra as Infrastructure Tests
    participant Fixtures as Test Fixtures
    
    Dev->>Test: npm test productos
    Test->>Fixtures: Cargar datos de prueba
    Fixtures-->>Test: Mock data panadería
    
    Test->>Domain: Ejecutar tests de dominio
    Domain->>Domain: ProductEntity tests
    Domain->>Domain: Value Objects tests
    Domain->>Domain: Domain Errors tests
    Domain-->>Test: ✅ Domain tests passed
    
    Test->>App: Ejecutar tests de aplicación
    App->>App: ProductService tests
    App->>App: DTO validation tests
    App-->>Test: ✅ Application tests passed
    
    Test->>Infra: Ejecutar tests de infraestructura
    Infra->>Infra: Repository integration tests
    Infra->>Infra: Mapper tests
    Infra-->>Test: ✅ Infrastructure tests passed
    
    Test-->>Dev: ✅ Todos los tests pasaron
```

## Cobertura de Testing por Capa

### Domain Layer (100% Coverage)

```mermaid
graph LR
    subgraph "Domain Testing"
        subgraph "ProductEntity Tests"
            T1[✅ Creación válida]
            T2[✅ Valores por defecto]
            T3[✅ Actualizar precio]
            T4[✅ Precio inválido]
            T5[✅ Precio cero]
            T6[✅ Reducir stock]
            T7[✅ Stock insuficiente]
            T8[✅ Cantidad inválida]
            T9[✅ Aumentar stock]
            T10[✅ Verificar stock]
            T11[✅ Marcar no disponible]
            T12[✅ Marcar disponible]
            T13[✅ Disponible para venta]
            T14[✅ Serializar]
            T15[✅ Deserializar]
        end
        
        subgraph "Value Objects Tests"
            VT1[Money operations]
            VT2[ProductId validation]
            VT3[ProductCategory enum]
        end
        
        subgraph "Error Tests"
            ET1[InvalidProductPriceError]
            ET2[ProductOutOfStockError]
            ET3[InvalidQuantityError]
            ET4[Domain error hierarchy]
        end
    end
```

### Application Layer Tests

```mermaid
graph TB
    subgraph "Application Testing"
        subgraph "ProductService Tests"
            AS1[createProduct - caso exitoso]
            AS2[createProduct - datos inválidos]
            AS3[updateProduct - caso exitoso]
            AS4[updateProduct - producto no encontrado]
            AS5[deleteProduct - caso exitoso]
            AS6[getProducts - filtros]
            AS7[searchProducts - criterios]
        end
        
        subgraph "DTO Validation Tests"
            DT1[CreateProductDto validation]
            DT2[UpdateProductDto validation]
            DT3[SearchCriteria validation]
        end
        
        subgraph "Mock Strategy"
            MS1[Repository mocks]
            MS2[External service mocks]
            MS3[Event emitter mocks]
        end
    end
    
    AS1 --> MS1
    AS2 --> MS1
    AS3 --> MS1
    AS4 --> MS1
    AS5 --> MS1
    AS6 --> MS1
    AS7 --> MS1
```

### Infrastructure Layer Tests

```mermaid
graph TB
    subgraph "Infrastructure Testing"
        subgraph "Repository Integration Tests"
            IT1[save - persistencia correcta]
            IT2[findById - búsqueda exitosa]
            IT3[findById - no encontrado]
            IT4[findAll - lista completa]
            IT5[delete - eliminación exitosa]
            IT6[search - filtros complejos]
        end
        
        subgraph "Mapper Tests"
            MT1[toEntity - conversión correcta]
            MT2[toPersistence - serialización]
            MT3[fromAPI - datos externos]
            MT4[validation - datos inválidos]
        end
        
        subgraph "Adapter Tests"
            AT1[LocalStorage adapter]
            AT2[MockData adapter]
            AT3[API adapter]
        end
    end
```

## Estrategias de Testing Implementadas

### 1. Unit Testing (Domain & Application)

```typescript
// Ejemplo de test unitario de dominio
describe('ProductEntity', () => {
  describe('Actualización de precio', () => {
    let product: ProductEntity;

    beforeEach(() => {
      product = ProductEntity.create({
        name: 'Croissant',
        price: Money.create(1200),
        category: ProductCategory.PASTRIES,
      });
    });

    it('debería actualizar el precio correctamente', () => {
      // Arrange
      const newPrice = Money.create(1500);

      // Act
      product.updatePrice(newPrice);

      // Assert
      expect(product.price.value).toBe(1500);
    });
  });
});
```

### 2. Integration Testing (Infrastructure)

```typescript
// Ejemplo de test de integración
describe('ProductRepository Integration', () => {
  let repository: ProductRepository;
  
  beforeEach(async () => {
    repository = new ProductRepository();
    await repository.clear(); // Limpiar datos de prueba
  });

  it('debería persistir y recuperar producto correctamente', async () => {
    // Arrange
    const product = ProductEntity.create(mockProductData);
    
    // Act
    await repository.save(product);
    const retrieved = await repository.findById(product.id);
    
    // Assert
    expect(retrieved).toEqual(product);
  });
});
```

### 3. Mock Strategy (Application Layer)

```typescript
// Ejemplo de mocking en tests de servicio
describe('ProductService', () => {
  let service: ProductService;
  let mockRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };
    
    service = new ProductService(mockRepository);
  });

  it('debería crear producto correctamente', async () => {
    // Arrange
    const productData = { /* datos de prueba */ };
    mockRepository.save.mockResolvedValue();

    // Act
    const result = await service.createProduct(productData);

    // Assert
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.any(ProductEntity)
    );
  });
});
```

## Test Fixtures y Mock Data

### Estructura de Fixtures

```mermaid
graph TB
    subgraph "Test Fixtures"
        subgraph "productos-panaderia.ts"
            PF1[Productos de galletas]
            PF2[Productos de pasteles]
            PF3[Productos de panes]
            PF4[Productos de temporada]
            PF5[Productos con descuento]
            PF6[Productos sin stock]
        end
        
        subgraph "Mock Builders"
            MB1[ProductEntityBuilder]
            MB2[MoneyBuilder]
            MB3[ProductCategoryBuilder]
        end
        
        subgraph "Test Scenarios"
            TS1[Escenarios de éxito]
            TS2[Escenarios de error]
            TS3[Casos edge]
        end
    end
    
    PF1 --> MB1
    PF2 --> MB1
    PF3 --> MB1
    PF4 --> MB1
    PF5 --> MB1
    PF6 --> MB1
    
    MB1 --> TS1
    MB2 --> TS1
    MB3 --> TS1
    
    TS1 --> TS2
    TS2 --> TS3
```

### Datos de Prueba Específicos de Panadería

```typescript
// Ejemplo de fixtures específicas del negocio
export const productosGalletas = [
  {
    name: 'Galletas de Chocolate',
    price: 1500,
    category: ProductCategory.COOKIES,
    description: 'Galletas artesanales con chips de chocolate',
    ingredients: ['harina', 'chocolate', 'mantequilla', 'azúcar'],
    allergens: ['gluten', 'lácteos']
  },
  // ... más productos
];

export const productosSinStock = [
  {
    name: 'Pan Integral Agotado',
    price: 2500,
    category: ProductCategory.BREAD,
    stock: 0,
    available: false
  }
];
```

## Métricas de Testing

### Cobertura por Módulo

| Capa | Archivos | Tests | Cobertura |
|------|----------|-------|-----------|
| Domain | 4 | 25 | 100% |
| Application | 2 | 15 | 95% |
| Infrastructure | 3 | 12 | 90% |
| Presentation | 3 | 8 | 85% |
| **Total** | **12** | **60** | **92%** |

### Tipos de Tests

```mermaid
pie title Distribución de Tests por Tipo
    "Unit Tests (Domain)" : 25
    "Unit Tests (Application)" : 15
    "Integration Tests" : 12
    "Component Tests" : 8
```

## Comandos de Testing

### Ejecución de Tests

```bash
# Todos los tests del módulo
pnpm test src/modules/productos

# Solo tests de dominio
pnpm test src/modules/productos/domain

# Solo tests de aplicación
pnpm test src/modules/productos/application

# Solo tests de infraestructura
pnpm test src/modules/productos/infrastructure

# Tests con cobertura
pnpm test:coverage src/modules/productos

# Tests en modo watch
pnpm test:watch src/modules/productos
```

### Validación de Calidad

```bash
# Linting de tests
pnpm lint src/modules/productos/**/*.test.ts

# Verificar convenciones de naming
pnpm test:naming src/modules/productos

# Análisis de cobertura
pnpm coverage:report productos
```

## Beneficios de la Arquitectura de Testing

### Para el Desarrollo

- **Confianza**: Tests completos aseguran que los cambios no rompen funcionalidad
- **Documentación**: Tests sirven como documentación viva del comportamiento
- **Refactoring**: Permite refactorizar con seguridad

### Para el Negocio

- **Calidad**: Menos bugs en producción
- **Velocidad**: Desarrollo más rápido con tests automatizados
- **Mantenimiento**: Código más fácil de mantener y evolucionar

### Para el Equipo

- **Onboarding**: Nuevos desarrolladores entienden el comportamiento esperado
- **Colaboración**: Tests claros facilitan el trabajo en equipo
- **Estándares**: Convenciones consistentes de testing

## Componentes Relacionados

- [Entidad ProductEntity](./productos-domain-entity.md)
- [Servicio de Aplicación](./productos-service.md)
- [Repositorio de Productos](./productos-repository.md)
- [Arquitectura General del Módulo](./productos-module-overview.md)

## Changelog

- **2024-01-20**: Creación inicial de la arquitectura de testing
- **2024-01-20**: Implementación completa de tests de ProductEntity
- **2024-01-20**: Agregado análisis de cobertura y métricas
- **2024-01-20**: Documentación de estrategias y fixtures
