# Arquitectura General - Proyecto Mandorla

## Descripción

Diagrama de arquitectura general del e-commerce de panadería Mandorla, mostrando la organización modular, las capas de la aplicación y las interacciones entre módulos.

## Diagrama de Arquitectura General

```mermaid
graph TB
    subgraph "Frontend - Next.js App"
        subgraph "Presentation Layer"
            UI[Componentes UI]
            Pages[Páginas Next.js]
            Layouts[Layouts]
            Hooks[Custom Hooks]
        end
        
        subgraph "Application Modules"
            subgraph "Productos Module"
                PM_D[Domain]
                PM_A[Application]
                PM_I[Infrastructure]
                PM_P[Presentation]
            end
            
            subgraph "Carrito Module"
                CM_D[Domain]
                CM_A[Application]
                CM_I[Infrastructure]
                CM_P[Presentation]
            end
            
            subgraph "Pedidos Module"
                OM_D[Domain]
                OM_A[Application]
                OM_I[Infrastructure]
                OM_P[Presentation]
            end
            
            subgraph "Clientes Module"
                CLM_D[Domain]
                CLM_A[Application]
                CLM_I[Infrastructure]
                CLM_P[Presentation]
            end
        end
        
        subgraph "Shared Layer"
            Utils[Utilities]
            Types[Shared Types]
            Components[UI Components]
            Stores[Zustand Stores]
        end
    end
    
    subgraph "API Layer"
        API[Next.js API Routes]
        Middleware[Middleware]
        Validation[Validation]
    end
    
    subgraph "External Services"
        Email[Email Services]
        Payment[Payment Gateway]
        Storage[File Storage]
    end
    
    subgraph "Data Layer"
        LocalStorage[Local Storage]
        SessionStorage[Session Storage]
        MockData[Mock Data]
    end
    
    %% Connections
    UI --> PM_P
    UI --> CM_P
    UI --> OM_P
    UI --> CLM_P
    
    Pages --> API
    API --> PM_A
    API --> CM_A
    API --> OM_A
    API --> CLM_A
    
    PM_A --> PM_D
    CM_A --> CM_D
    OM_A --> OM_D
    CLM_A --> CLM_D
    
    PM_I --> LocalStorage
    CM_I --> LocalStorage
    OM_I --> Email
    OM_I --> Payment
    
    Hooks --> Stores
    
    classDef moduleClass fill:#e3f2fd
    classDef sharedClass fill:#f3e5f5
    classDef apiClass fill:#e8f5e8
    classDef externalClass fill:#fff3e0
    classDef dataClass fill:#fce4ec
    
    class PM_D,PM_A,PM_I,PM_P,CM_D,CM_A,CM_I,CM_P,OM_D,OM_A,OM_I,OM_P,CLM_D,CLM_A,CLM_I,CLM_P moduleClass
    class Utils,Types,Components,Stores sharedClass
    class API,Middleware,Validation apiClass
    class Email,Payment,Storage externalClass
    class LocalStorage,SessionStorage,MockData dataClass
```

## Arquitectura Hexagonal por Módulo

```mermaid
graph LR
    subgraph "Hexagonal Architecture Pattern"
        subgraph "Domain Core"
            E[Entities]
            VO[Value Objects]
            DE[Domain Events]
            DR[Domain Rules]
        end
        
        subgraph "Application Layer"
            UC[Use Cases]
            S[Services]
            I[Interfaces]
            DTO[DTOs]
        end
        
        subgraph "Infrastructure Adapters"
            DB[Database]
            API_EXT[External APIs]
            FS[File System]
            CACHE[Cache]
        end
        
        subgraph "Presentation Adapters"
            WEB[Web UI]
            REST[REST API]
            CLI[CLI]
            EVENTS[Event Handlers]
        end
    end
    
    %% Hexagonal connections
    UC --> E
    S --> VO
    UC --> I
    
    DB --> I
    API_EXT --> I
    FS --> I
    CACHE --> I
    
    WEB --> UC
    REST --> UC
    CLI --> UC
    EVENTS --> UC
```

## Flujo de Datos Principal

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as Componente UI
    participant H as Hook
    participant S as Store (Zustand)
    participant API as API Route
    participant Svc as Service
    participant Repo as Repository
    participant Data as Data Source
    
    U->>UI: Interacción
    UI->>H: Llamada a hook
    H->>S: Actualizar estado
    H->>API: Fetch data
    API->>Svc: Procesar request
    Svc->>Repo: Consultar datos
    Repo->>Data: Query
    Data-->>Repo: Resultado
    Repo-->>Svc: Datos
    Svc-->>API: Response
    API-->>H: JSON response
    H->>S: Actualizar estado
    S-->>UI: Estado actualizado
    UI-->>U: UI actualizada
```

## Dependencias entre Módulos

```mermaid
graph TD
    Shared[Shared/Common]
    
    subgraph "Core Modules"
        Products[Módulo Productos]
        Cart[Módulo Carrito]
        Orders[Módulo Pedidos]
        Customers[Módulo Clientes]
    end
    
    subgraph "Feature Modules"
        Checkout[Módulo Checkout]
        Favorites[Módulo Favoritos]
        Search[Módulo Búsqueda]
    end
    
    %% Dependencies
    Products --> Shared
    Cart --> Shared
    Orders --> Shared
    Customers --> Shared
    
    Cart -.-> Products
    Orders -.-> Products
    Orders -.-> Cart
    Orders -.-> Customers
    
    Checkout --> Cart
    Checkout --> Orders
    Checkout --> Customers
    
    Favorites --> Products
    Search --> Products
    
    classDef coreModule fill:#e1f5fe
    classDef featureModule fill:#f3e5f5
    classDef sharedModule fill:#e8f5e8
    
    class Products,Cart,Orders,Customers coreModule
    class Checkout,Favorites,Search featureModule
    class Shared sharedModule
```

## Stack Tecnológico

```mermaid
graph TB
    subgraph "Frontend Stack"
        subgraph "Framework"
            NextJS[Next.js 15.2.4]
            React[React 19]
            TS[TypeScript 5]
        end
        
        subgraph "UI & Styling"
            Tailwind[Tailwind CSS]
            Shadcn[shadcn/ui]
            Radix[Radix UI]
            Lucide[Lucide Icons]
        end
        
        subgraph "State Management"
            Zustand[Zustand]
            RHF[React Hook Form]
            Zod[Zod Validation]
        end
    end
    
    subgraph "Development Tools"
        ESLint[ESLint]
        Prettier[Prettier]
        Jest[Jest Testing]
        PNPM[PNPM Package Manager]
    end
    
    subgraph "External Services"
        EmailJS[EmailJS]
        SendGrid[SendGrid]
        Resend[Resend API]
    end
    
    NextJS --> React
    NextJS --> TS
    React --> Shadcn
    Shadcn --> Radix
    Shadcn --> Tailwind
    
    Zustand --> React
    RHF --> Zod
```

## Patrones Arquitectónicos Implementados

### 1. Hexagonal Architecture (Ports & Adapters)

```mermaid
graph LR
    subgraph "Hexagonal Pattern"
        subgraph "Core"
            Domain[Domain Logic]
        end
        
        subgraph "Ports"
            IP[Input Ports]
            OP[Output Ports]
        end
        
        subgraph "Adapters"
            WA[Web Adapter]
            DA[Database Adapter]
            EA[Email Adapter]
        end
    end
    
    WA --> IP
    IP --> Domain
    Domain --> OP
    OP --> DA
    OP --> EA
```

### 2. Repository Pattern

```mermaid
graph LR
    Service[Application Service] --> IRepo[Repository Interface]
    IRepo <|-- MemRepo[In-Memory Repository]
    IRepo <|-- LocalRepo[LocalStorage Repository]
    IRepo <|-- APIRepo[API Repository]
```

### 3. Facade Pattern

```mermaid
graph LR
    UI[UI Components] --> Facade[Module Facade]
    Facade --> Service1[Service A]
    Facade --> Service2[Service B]
    Facade --> Service3[Service C]
```

## Estructura de Directorios

```
src/
├── app/                    # Next.js App Router
│   ├── (pages)/           # Páginas agrupadas
│   ├── api/               # API Routes
│   └── globals.css        # Estilos globales
├── components/            # Componentes compartidos
│   ├── ui/               # Componentes base (shadcn/ui)
│   └── layout/           # Componentes de layout
├── modules/              # Módulos de dominio
│   ├── productos/        # Módulo de productos
│   ├── carrito/          # Módulo de carrito
│   ├── pedidos/          # Módulo de pedidos
│   └── clientes/         # Módulo de clientes
├── lib/                  # Utilidades y configuración
├── hooks/                # Hooks compartidos
├── stores/               # Stores de Zustand
├── utils/                # Funciones utilitarias
└── types/                # Tipos TypeScript globales
```

## Principios de Diseño

### SOLID Principles

1. **Single Responsibility**: Cada clase/módulo tiene una responsabilidad
2. **Open/Closed**: Abierto para extensión, cerrado para modificación
3. **Liskov Substitution**: Las implementaciones son intercambiables
4. **Interface Segregation**: Interfaces específicas y cohesivas
5. **Dependency Inversion**: Dependencias hacia abstracciones

### Clean Architecture

- **Independencia de Frameworks**: Lógica de negocio independiente
- **Testabilidad**: Fácil testing de componentes aislados
- **Independencia de UI**: Lógica separada de la presentación
- **Independencia de Base de Datos**: Abstracciones para persistencia

## Comunicación entre Módulos

### Eventos de Dominio

```mermaid
graph LR
    subgraph "Event-Driven Communication"
        PM[Productos Module] --> E[Event Bus]
        E --> CM[Carrito Module]
        E --> OM[Pedidos Module]
        E --> NM[Notifications Module]
    end
```

### Facades para UI

```mermaid
graph LR
    subgraph "UI Communication"
        UI[UI Components] --> PF[Products Facade]
        UI --> CF[Cart Facade]
        UI --> OF[Orders Facade]
        
        PF --> PS[Product Service]
        CF --> CS[Cart Service]
        OF --> OS[Order Service]
    end
```

## Testing Strategy

### Pirámide de Testing

```mermaid
graph TB
    subgraph "Testing Pyramid"
        E2E[E2E Tests<br/>10%]
        Integration[Integration Tests<br/>20%]
        Unit[Unit Tests<br/>70%]
    end
    
    E2E --> Integration
    Integration --> Unit
```

### Testing por Capa

- **Domain**: Unit tests para entidades y value objects
- **Application**: Unit tests para servicios con mocks
- **Infrastructure**: Integration tests para repositorios
- **Presentation**: Component tests para UI

## Performance & Optimization

### Code Splitting

```mermaid
graph LR
    subgraph "Bundle Strategy"
        Main[Main Bundle]
        Products[Products Chunk]
        Cart[Cart Chunk]
        Orders[Orders Chunk]
        Vendor[Vendor Chunk]
    end
    
    Main -.-> Products
    Main -.-> Cart
    Main -.-> Orders
    Main --> Vendor
```

### Lazy Loading

- Módulos cargados bajo demanda
- Componentes pesados con React.lazy()
- Imágenes optimizadas con Next.js Image

## Security Considerations

### Data Validation

- Validación en frontend con Zod
- Sanitización de inputs
- Validación de tipos TypeScript

### Error Handling

- Errores tipados por dominio
- Logging estructurado
- Fallbacks para errores de UI

## Deployment Architecture

```mermaid
graph LR
    subgraph "Deployment"
        Dev[Development] --> Build[Build Process]
        Build --> Static[Static Generation]
        Static --> CDN[CDN Distribution]
        
        Build --> API[API Routes]
        API --> Serverless[Serverless Functions]
    end
```

## Métricas y Monitoreo

### Performance Metrics

- Core Web Vitals
- Bundle size analysis
- Runtime performance
- Error tracking

### Business Metrics

- Conversion rates
- User engagement
- Feature usage
- Performance impact

## Roadmap Arquitectónico

### Fase Actual: Modular Foundation

- ✅ Arquitectura hexagonal implementada
- ✅ Módulos de productos, carrito, pedidos
- ✅ Testing strategy establecida
- ✅ Code splitting configurado

### Próximas Fases

- 🔄 Módulo de clientes completo
- 📋 Sistema de notificaciones
- 🔍 Búsqueda avanzada
- 📊 Analytics y métricas
- 🚀 Optimizaciones de performance

## Última Actualización

- **Fecha**: 2024-12-19
- **Cambios**:
  - Actualización completa de arquitectura general
  - Integración de módulos implementados
  - Documentación de patrones y principios
  - Roadmap arquitectónico actualizado

## Archivos Relacionados

- [Módulo Productos](./modules/productos.md)
- [Módulo Carrito](./modules/carrito.md)
- [Módulo Pedidos](./modules/pedidos.md)
- [Módulo Clientes](./modules/clientes.md)
- [Testing Architecture](./testing/product-testing-architecture.md)
- [API Documentation](./apis/overview.md)
