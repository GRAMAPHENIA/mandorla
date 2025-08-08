import { ModuleDocumentation } from '../types/DocumentationTypes'

/**
 * Generador automático de diagramas de arquitectura
 */
export class DiagramGenerator {
  /**
   * Genera diagrama de visión general de todos los módulos
   * @param modules Lista de módulos documentados
   */
  static generateModulesOverview(modules: ModuleDocumentation[]): string {
    const moduleNodes = modules.map(module => 
      `    ${module.name}[${module.name}<br/>${module.components.length} componentes<br/>${module.services.length} servicios]`
    ).join('\n')

    const connections = modules.flatMap(module =>
      module.dependencies.map(dep => `    ${module.name} --> ${dep}`)
    ).join('\n')

    return `
graph TB
    subgraph "Arquitectura Modular - Mandorla"
${moduleNodes}
    end
    
    subgraph "Capas Compartidas"
        UI[Componentes UI]
        Shared[Utilidades Compartidas]
        Types[Tipos Globales]
    end
    
${connections}
    
    ${modules.map(m => `${m.name} --> UI`).join('\n    ')}
    ${modules.map(m => `${m.name} --> Shared`).join('\n    ')}
    ${modules.map(m => `${m.name} --> Types`).join('\n    ')}
    
    style UI fill:#e3f2fd
    style Shared fill:#f3e5f5
    style Types fill:#e8f5e8
    `
  }

  /**
   * Genera diagrama detallado de un módulo específico
   * @param module Documentación del módulo
   */
  static generateModuleDetail(module: ModuleDocumentation): string {
    return `
graph TB
    subgraph "Módulo ${module.name}"
        subgraph "Domain Layer"
            E[Entidades<br/>${module.entities.length} entidades]
            VO[Value Objects]
            R[Repository Interfaces]
            ER[Domain Errors]
        end
        
        subgraph "Application Layer"
            S[Servicios<br/>${module.services.length} servicios]
            UC[Casos de Uso]
        end
        
        subgraph "Infrastructure Layer"
            RI[Repository Implementations]
            A[Adaptadores]
            EXT[Servicios Externos]
        end
        
        subgraph "Presentation Layer"
            C[Componentes<br/>${module.components.length} componentes]
            H[Hooks Personalizados]
        end
    end
    
    C --> S
    H --> S
    S --> E
    S --> VO
    S --> R
    RI --> R
    A --> EXT
    S --> RI
    
    style E fill:#e1f5fe
    style VO fill:#e1f5fe
    style S fill:#f3e5f5
    style UC fill:#f3e5f5
    style RI fill:#fce4ec
    style A fill:#fce4ec
    style C fill:#e8f5e8
    style H fill:#e8f5e8
    `
  }

  /**
   * Genera diagrama de flujo de datos entre módulos
   * @param modules Lista de módulos
   */
  static generateDataFlow(modules: ModuleDocumentation[]): string {
    // Identificar flujos comunes basados en nombres de módulos
    const flows = this.identifyDataFlows(modules)
    
    const flowDiagram = flows.map(flow => 
      `    ${flow.from} -->|${flow.data}| ${flow.to}`
    ).join('\n')

    return `
graph LR
    subgraph "Flujo de Datos - E-commerce"
${flowDiagram}
    end
    
    style Productos fill:#e3f2fd
    style Carrito fill:#f3e5f5
    style Pedidos fill:#e8f5e8
    style Clientes fill:#fff3e0
    `
  }

  /**
   * Genera diagrama de componentes UI
   * @param modules Lista de módulos con componentes
   */
  static generateUIComponentsTree(modules: ModuleDocumentation[]): string {
    const componentNodes = modules.flatMap(module =>
      module.components.map(comp => 
        `    ${comp.name}[${comp.name}<br/>${comp.category}]`
      )
    ).join('\n')

    const categoryGroups = this.groupComponentsByCategory(modules)
    
    const subgraphs = Object.entries(categoryGroups).map(([category, components]) => `
    subgraph "${category}"
        ${components.map(comp => comp.name).join('\n        ')}
    end`).join('\n')

    return `
graph TB
${subgraphs}
${componentNodes}
    `
  }

  /**
   * Genera diagrama de dependencias entre servicios
   * @param modules Lista de módulos
   */
  static generateServiceDependencies(modules: ModuleDocumentation[]): string {
    const serviceNodes = modules.flatMap(module =>
      module.services.map(service => 
        `    ${service.name}[${service.name}<br/>${module.name}]`
      )
    ).join('\n')

    const dependencies = modules.flatMap(module =>
      module.services.flatMap(service =>
        service.dependencies.map(dep => `    ${service.name} --> ${dep}`)
      )
    ).join('\n')

    return `
graph TD
    subgraph "Dependencias de Servicios"
${serviceNodes}
    end
    
${dependencies}
    `
  }

  /**
   * Genera diagrama de arquitectura de testing
   * @param modules Lista de módulos
   */
  static generateTestingArchitecture(modules: ModuleDocumentation[]): string {
    return `
graph TB
    subgraph "Estrategia de Testing"
        subgraph "Unit Tests"
            UT1[Domain Entities]
            UT2[Value Objects]
            UT3[Services]
            UT4[Components]
        end
        
        subgraph "Integration Tests"
            IT1[Repository Implementations]
            IT2[API Endpoints]
            IT3[Module Interactions]
        end
        
        subgraph "E2E Tests"
            E2E1[User Flows]
            E2E2[Critical Paths]
            E2E3[Cross-Module Scenarios]
        end
    end
    
    UT1 --> IT3
    UT2 --> IT3
    UT3 --> IT2
    UT4 --> E2E1
    IT1 --> E2E2
    IT2 --> E2E3
    
    style UT1 fill:#e8f5e8
    style UT2 fill:#e8f5e8
    style UT3 fill:#e8f5e8
    style UT4 fill:#e8f5e8
    style IT1 fill:#fff3e0
    style IT2 fill:#fff3e0
    style IT3 fill:#fff3e0
    style E2E1 fill:#fce4ec
    style E2E2 fill:#fce4ec
    style E2E3 fill:#fce4ec
    `
  }

  /**
   * Identifica flujos de datos comunes entre módulos
   * @param modules Lista de módulos
   */
  private static identifyDataFlows(modules: ModuleDocumentation[]): Array<{
    from: string
    to: string
    data: string
  }> {
    const flows = []
    
    // Flujos típicos de e-commerce
    const moduleNames = modules.map(m => m.name.toLowerCase())
    
    if (moduleNames.includes('productos') && moduleNames.includes('carrito')) {
      flows.push({ from: 'Productos', to: 'Carrito', data: 'Producto Info' })
    }
    
    if (moduleNames.includes('carrito') && moduleNames.includes('pedidos')) {
      flows.push({ from: 'Carrito', to: 'Pedidos', data: 'Items del Carrito' })
    }
    
    if (moduleNames.includes('clientes') && moduleNames.includes('pedidos')) {
      flows.push({ from: 'Clientes', to: 'Pedidos', data: 'Info del Cliente' })
    }
    
    if (moduleNames.includes('pedidos') && moduleNames.includes('productos')) {
      flows.push({ from: 'Pedidos', to: 'Productos', data: 'Stock Update' })
    }
    
    return flows
  }

  /**
   * Agrupa componentes por categoría
   * @param modules Lista de módulos
   */
  private static groupComponentsByCategory(modules: ModuleDocumentation[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {}
    
    modules.forEach(module => {
      module.components.forEach(component => {
        if (!groups[component.category]) {
          groups[component.category] = []
        }
        groups[component.category].push(component)
      })
    })
    
    return groups
  }

  /**
   * Genera diagrama de deployment
   */
  static generateDeploymentDiagram(): string {
    return `
graph TB
    subgraph "Deployment Architecture"
        subgraph "Frontend"
            APP[Next.js App<br/>Vercel/Netlify]
            CDN[Static Assets<br/>CDN]
        end
        
        subgraph "Backend Services"
            API[API Routes<br/>Next.js API]
            EMAIL[Email Service<br/>SendGrid/Resend]
        end
        
        subgraph "Storage"
            LS[Local Storage<br/>Browser]
            CACHE[Cache<br/>Browser/CDN]
        end
        
        subgraph "External"
            ANALYTICS[Analytics<br/>Google Analytics]
            MONITORING[Monitoring<br/>Vercel Analytics]
        end
    end
    
    APP --> API
    APP --> LS
    APP --> CDN
    API --> EMAIL
    CDN --> CACHE
    APP --> ANALYTICS
    APP --> MONITORING
    
    style APP fill:#e3f2fd
    style API fill:#f3e5f5
    style LS fill:#e8f5e8
    style EMAIL fill:#fff3e0
    `
  }

  /**
   * Genera todos los diagramas para un conjunto de módulos
   * @param modules Lista de módulos
   */
  static generateAllDiagrams(modules: ModuleDocumentation[]) {
    return {
      overview: this.generateModulesOverview(modules),
      dataFlow: this.generateDataFlow(modules),
      uiComponents: this.generateUIComponentsTree(modules),
      serviceDependencies: this.generateServiceDependencies(modules),
      testingArchitecture: this.generateTestingArchitecture(),
      deployment: this.generateDeploymentDiagram(),
      moduleDetails: modules.reduce((acc, module) => {
        acc[module.name] = this.generateModuleDetail(module)
        return acc
      }, {} as Record<string, string>)
    }
  }
}