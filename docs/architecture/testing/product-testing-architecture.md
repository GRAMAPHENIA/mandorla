# Arquitectura de Testing: Módulo Productos

## Descripción

Este diagrama muestra la estrategia de testing implementada para el módulo de productos, incluyendo la estructura de tests, fixtures y patrones de testing utilizados.

## Diagrama de Estructura de Testing

```mermaid
graph TB
    subgraph "Test Organization"
        subgraph "Domain Tests"
            PET[ProductEntity.test.ts]
            PIT[ProductId.test.ts]
            MT[Money.test.ts]
            PCT[ProductCategory.test.ts]
        end
        
        subgraph "Application Tests"
            PST[ProductService.test.ts]
            APST[Application Services Tests]
        end
        
        subgraph "Infrastructure Tests"
            PRT[ProductRepository.integration.test.ts]
            PMT[ProductMapper.test.ts]
            IMRT[InMemoryRepository.test.ts]
        end
        
        subgraph "Presentation Tests"
            PCT_UI[ProductCard.test.tsx]
            PGT[ProductGrid.test.tsx]
            HPT[Hooks.test.ts]
        end
        
        subgraph "Test Fixtures"
            TPF[productos-panaderia.ts]
            TMF[test-mocks.ts]
            TDF[test-data-factory.ts]
        end
    end
    
    subgraph "Testing Utilities"
        TU[Test Utils]
        MF[Mock Factory]
        AF[Assertion Helpers]
    end
    
    %% Dependencies
    PST --> TPF
    PRT --> TPF
    PCT_UI --> TMF
    PGT --> TMF
    
    PST --> TU
    PRT --> TU
    PCT_UI --> AF
    
    classDef domainTest fill:#e1f5fe
    classDef applicationTest fill:#f3e5f5
    classDef infrastructureTest fill:#e8f5e8
    classDef presentationTest fill:#fff3e0
    classDef fixture fill:#f0f0f0
    
    class PET,PIT,MT,PCT domainTest
    class PST,APST applicationTest
    class PRT,PMT,IMRT infrastructureTest
    class PCT_UI,PGT,HPT presentationTest
    class TPF,TMF,TDF fixture
```

## Diagrama de Flujo de Testing

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Test as Test Runner
    participant Unit as Unit Tests
    participant Int as Integration Tests
    participant Fix as Fixtures
    participant Mock as Mocks
    
    Dev->>Test: npm run test
    Test->>Fix: Load test data
    Fix-->>Test: productos-panaderia.ts
    Test->>Mock: Setup mocks
    Mock-->>Test: Mock repositories
    Test->>Unit: Run domain tests
    Unit->>Unit: ProductEntity tests
    Unit->>Unit: Value Objects tests
    Unit-->>Test: Results
    Test->>Int: Run integration tests
    Int->>Int: Repository tests
    Int->>Int: Service tests
    Int-->>Test: Results
    Test-->>Dev: Test report
```

## Cobertura de Testing por Capa

```mermaid
pie title Cobertura de Testing por Capa
    "Domain Layer" : 40
    "Application Layer" : 25
    "Infrastructure Layer" : 20
    "Presentation Layer" : 15
```

## Casos de Prueba Principales

### ProductEntity Tests

```mermaid
graph LR
    subgraph "ProductEntity Test Cases"
        subgraph "Creation Tests"
            CT1[Valid Product Creation]
            CT2[Default Values]
            CT3[Invalid Price Error]
        end
        
        subgraph "Price Update Tests"
            PT1[Valid Price Update]
            PT2[Negative Price Error]
            PT3[Zero Price Error]
        end
        
        subgraph "Stock Management Tests"
            ST1[Reduce Stock]
            ST2[Stock to Zero]
            ST3[Insufficient Stock Error]
            ST4[Invalid Quantity Error]
            ST5[Increase Stock]
        end
        
        subgraph "Availability Tests"
            AT1[Check Stock Availability]
            AT2[Get Available Stock]
        end
        
        subgraph "Serialization Tests"
            SER1[To Persistence Object]
            SER2[From Persistence Data]
        end
    end
    
    PE[ProductEntity] --> CT1
    PE --> CT2
    PE --> CT3
    PE --> PT1
    PE --> PT2
    PE --> PT3
    PE --> ST1
    PE --> ST2
    PE --> ST3
    PE --> ST4
    PE --> ST5
    PE --> AT1
    PE --> AT2
    PE --> SER1
    PE --> SER2
```

## Test Data Factory Pattern

```mermaid
classDiagram
    class TestDataFactory {
        +createValidProduct(): ProductEntity
        +createProductWithStock(stock: number): ProductEntity
        +createProductWithPrice(price: number): ProductEntity
        +createProductWithCategory(category: ProductCategory): ProductEntity
        +createInvalidProduct(): object
        +createProductArray(count: number): ProductEntity[]
    }
    
    class ProductTestFixtures {
        +PAN_INTEGRAL: ProductData
        +GALLETAS_CHOCOLATE: ProductData
        +CROISSANT: ProductData
        +MUFFIN: ProductData
        +TARTA: ProductData
        +EMPANADA: ProductData
        +BROWNIE: ProductData
        +DONUT: ProductData
    }
    
    class MockRepository {
        +findById(id: ProductId): Promise~ProductEntity~
        +save(product: ProductEntity): Promise~void~
        +findAll(): Promise~ProductEntity[]~
        +clear(): void
        +getCallHistory(): CallRecord[]
    }
    
    TestDataFactory --> ProductTestFixtures
    MockRepository --> ProductTestFixtures
```

## Estrategias de Testing por Tipo

### Unit Tests (Domain Layer)

```mermaid
graph TB
    subgraph "Unit Testing Strategy"
        subgraph "Entity Tests"
            ET1[Business Logic Validation]
            ET2[State Changes]
            ET3[Error Conditions]
            ET4[Edge Cases]
        end
        
        subgraph "Value Object Tests"
            VOT1[Immutability]
            VOT2[Equality]
            VOT3[Validation Rules]
            VOT4[Serialization]
        end
        
        subgraph "Error Tests"
            ERT1[Error Messages]
            ERT2[Error Codes]
            ERT3[Error Context]
        end
    end
    
    UT[Unit Tests] --> ET1
    UT --> ET2
    UT --> ET3
    UT --> ET4
    UT --> VOT1
    UT --> VOT2
    UT --> VOT3
    UT --> VOT4
    UT --> ERT1
    UT --> ERT2
    UT --> ERT3
```

### Integration Tests (Infrastructure Layer)

```mermaid
graph TB
    subgraph "Integration Testing Strategy"
        subgraph "Repository Tests"
            RT1[CRUD Operations]
            RT2[Data Persistence]
            RT3[Query Operations]
            RT4[Error Handling]
        end
        
        subgraph "Service Tests"
            ST1[End-to-End Flows]
            ST2[External Dependencies]
            ST3[Transaction Handling]
            ST4[Performance]
        end
        
        subgraph "Adapter Tests"
            AT1[Data Mapping]
            AT2[External API Calls]
            AT3[Storage Operations]
        end
    end
    
    IT[Integration Tests] --> RT1
    IT --> RT2
    IT --> RT3
    IT --> RT4
    IT --> ST1
    IT --> ST2
    IT --> ST3
    IT --> ST4
    IT --> AT1
    IT --> AT2
    IT --> AT3
```

## Test Configuration

### Jest Configuration for Products Module

```typescript
// jest.config.productos.js
module.exports = {
  displayName: 'Productos Module',
  testMatch: [
    '<rootDir>/src/modules/productos/**/*.test.ts',
    '<rootDir>/src/modules/productos/**/*.test.tsx'
  ],
  collectCoverageFrom: [
    'src/modules/productos/**/*.ts',
    'src/modules/productos/**/*.tsx',
    '!src/modules/productos/**/*.test.ts',
    '!src/modules/productos/**/*.test.tsx',
    '!src/modules/productos/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: [
    '<rootDir>/src/modules/productos/__tests__/setup.ts'
  ]
};
```

## Fixtures y Mock Data

### Productos de Panadería Test Data

```mermaid
graph LR
    subgraph "Test Fixtures Categories"
        subgraph "Panes"
            P1[Pan Integral]
            P2[Pan Francés]
            P3[Pan de Centeno]
        end
        
        subgraph "Galletas"
            G1[Galletas Chocolate]
            G2[Galletas Avena]
            G3[Galletas Mantequilla]
        end
        
        subgraph "Pasteles"
            PT1[Croissant]
            PT2[Muffin]
            PT3[Brownie]
            PT4[Tarta]
        end
        
        subgraph "Temporada"
            T1[Rosca Reyes]
            T2[Pan Dulce Navidad]
            T3[Huevos Pascua]
        end
    end
    
    TF[Test Fixtures] --> P1
    TF --> P2
    TF --> P3
    TF --> G1
    TF --> G2
    TF --> G3
    TF --> PT1
    TF --> PT2
    TF --> PT3
    TF --> PT4
    TF --> T1
    TF --> T2
    TF --> T3
```

## Métricas de Testing

### Coverage Goals

```mermaid
graph TB
    subgraph "Coverage Metrics"
        subgraph "Domain Layer"
            DL[Target: 95%]
            DLA[Actual: 92%]
        end
        
        subgraph "Application Layer"
            AL[Target: 90%]
            ALA[Actual: 88%]
        end
        
        subgraph "Infrastructure Layer"
            IL[Target: 85%]
            ILA[Actual: 83%]
        end
        
        subgraph "Presentation Layer"
            PL[Target: 80%]
            PLA[Actual: 75%]
        end
    end
    
    TC[Total Coverage: 85%] --> DL
    TC --> AL
    TC --> IL
    TC --> PL
```

## Test Execution Flow

### Continuous Integration Pipeline

```mermaid
graph LR
    subgraph "CI/CD Testing Pipeline"
        C[Code Commit] --> L[Lint Check]
        L --> UT[Unit Tests]
        UT --> IT[Integration Tests]
        IT --> CT[Component Tests]
        CT --> E2E[E2E Tests]
        E2E --> CR[Coverage Report]
        CR --> D[Deploy]
    end
    
    subgraph "Test Stages"
        UT --> UT1[Domain Tests]
        UT --> UT2[Value Object Tests]
        IT --> IT1[Repository Tests]
        IT --> IT2[Service Tests]
        CT --> CT1[Component Tests]
        CT --> CT2[Hook Tests]
    end
```

## Best Practices Implementadas

### Testing Patterns

1. **AAA Pattern (Arrange, Act, Assert)**
   - Estructura clara en todos los tests
   - Separación de setup, ejecución y verificación

2. **Test Data Builders**
   - Factory pattern para crear datos de prueba
   - Datos realistas del dominio de panadería

3. **Mock Strategy**
   - Mocks solo para dependencias externas
   - Stubs para interfaces de repositorio

4. **Error Testing**
   - Tests específicos para cada tipo de error
   - Validación de mensajes y códigos de error

### Naming Conventions

- Tests descriptivos en español
- Formato: `debería [acción] cuando [condición]`
- Agrupación por funcionalidad con `describe`

## Herramientas de Testing

### Testing Stack

```mermaid
graph TB
    subgraph "Testing Tools"
        J[Jest] --> TR[Test Runner]
        RTL[React Testing Library] --> CT[Component Testing]
        MSW[Mock Service Worker] --> API[API Mocking]
        FC[Factory Constructor] --> TD[Test Data]
    end
    
    subgraph "Utilities"
        TU[Test Utils]
        AH[Assertion Helpers]
        MF[Mock Factory]
        DF[Data Factory]
    end
    
    J --> TU
    RTL --> AH
    MSW --> MF
    FC --> DF
```

## Última Actualización

- **Fecha**: 2024-12-19
- **Cambios**:
  - Documentación completa de arquitectura de testing
  - Análisis de estructura de tests del módulo productos
  - Patrones de testing implementados
  - Métricas de cobertura y objetivos
  - Integración con CI/CD pipeline

## Archivos Relacionados

- [Arquitectura del Módulo Productos](../modules/productos.md)
- [Guía de Testing](../../guides/testing-guide.md)
- [Fixtures de Productos](../../examples/product-fixtures.md)
- [Configuración de Jest](../../configuration/jest-config.md)
