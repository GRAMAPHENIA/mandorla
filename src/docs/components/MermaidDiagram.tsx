'use client'

import React, { useEffect, useRef, useState } from 'react'

interface MermaidDiagramProps {
  chart: string
  title?: string
  description?: string
  className?: string
}

/**
 * Componente para renderizar diagramas Mermaid
 */
export function MermaidDiagram({ chart, title, description, className = '' }: MermaidDiagramProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mermaid, setMermaid] = useState<any>(null)

  useEffect(() => {
    // Cargar Mermaid dinámicamente
    const loadMermaid = async () => {
      try {
        // En un entorno real, instalarías mermaid: npm install mermaid
        // Por ahora, simulamos la carga
        const mermaidModule = await import('mermaid').catch(() => null)
        
        if (mermaidModule) {
          const mermaidInstance = mermaidModule.default
          mermaidInstance.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          })
          setMermaid(mermaidInstance)
        } else {
          // Fallback si Mermaid no está disponible
          setError('Mermaid no está disponible. Instala el paquete mermaid para ver diagramas.')
        }
      } catch (err) {
        setError('Error al cargar Mermaid: ' + (err instanceof Error ? err.message : 'Error desconocido'))
      } finally {
        setIsLoading(false)
      }
    }

    loadMermaid()
  }, [])

  useEffect(() => {
    if (mermaid && elementRef.current && chart) {
      const renderDiagram = async () => {
        try {
          setIsLoading(true)
          setError(null)
          
          // Limpiar el contenido anterior
          elementRef.current!.innerHTML = ''
          
          // Generar ID único para el diagrama
          const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          
          // Renderizar el diagrama
          const { svg } = await mermaid.render(id, chart)
          elementRef.current!.innerHTML = svg
          
        } catch (err) {
          setError('Error al renderizar el diagrama: ' + (err instanceof Error ? err.message : 'Error desconocido'))
        } finally {
          setIsLoading(false)
        }
      }

      renderDiagram()
    }
  }, [mermaid, chart])

  if (error) {
    return (
      <div className={`mermaid-diagram border rounded-lg p-6 bg-red-50 ${className}`}>
        {title && <h3 className="text-lg font-semibold text-red-900 mb-2">{title}</h3>}
        <div className="text-red-700">
          <p className="font-medium">Error al cargar el diagrama</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        
        {/* Mostrar el código del diagrama como fallback */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-red-800 hover:text-red-900">
            Ver código del diagrama
          </summary>
          <pre className="mt-2 p-3 bg-red-100 rounded text-sm overflow-x-auto">
            <code>{chart}</code>
          </pre>
        </details>
      </div>
    )
  }

  return (
    <div className={`mermaid-diagram border rounded-lg overflow-hidden bg-white ${className}`}>
      {/* Header */}
      {(title || description) && (
        <div className="bg-gray-50 px-4 py-3 border-b">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-gray-600 mt-1">{description}</p>}
        </div>
      )}
      
      {/* Diagram Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Cargando diagrama...</span>
            </div>
          </div>
        ) : (
          <div 
            ref={elementRef}
            className="mermaid-content flex justify-center"
            style={{ minHeight: '200px' }}
          />
        )}
      </div>
      
      {/* Actions */}
      <div className="bg-gray-50 px-4 py-3 border-t flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Diagrama generado con Mermaid
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              // Copiar código del diagrama
              navigator.clipboard.writeText(chart)
            }}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Copiar Código
          </button>
          <button
            onClick={() => {
              // Exportar como imagen (requeriría implementación adicional)
              console.log('Exportar diagrama como imagen')
            }}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Exportar PNG
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Componente para mostrar múltiples diagramas en pestañas
 */
export function MermaidDiagramTabs({ 
  diagrams 
}: { 
  diagrams: Array<{
    id: string
    title: string
    chart: string
    description?: string
  }>
}) {
  const [activeTab, setActiveTab] = useState(diagrams[0]?.id || '')

  if (diagrams.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay diagramas disponibles</p>
      </div>
    )
  }

  const activeDiagram = diagrams.find(d => d.id === activeTab) || diagrams[0]

  return (
    <div className="mermaid-diagram-tabs">
      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {diagrams.map((diagram) => (
            <button
              key={diagram.id}
              onClick={() => setActiveTab(diagram.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === diagram.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {diagram.title}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Content */}
      <div className="mt-4">
        <MermaidDiagram
          chart={activeDiagram.chart}
          title={activeDiagram.title}
          description={activeDiagram.description}
        />
      </div>
    </div>
  )
}

/**
 * Generador de diagramas de arquitectura comunes
 */
export class ArchitectureDiagramGenerator {
  /**
   * Genera diagrama de arquitectura hexagonal
   */
  static generateHexagonalArchitecture(moduleName: string): string {
    return `
graph TB
    subgraph "Módulo ${moduleName}"
        subgraph "Core"
            D[Domain Layer<br/>Entidades y Reglas]
            A[Application Layer<br/>Casos de Uso]
        end
        
        subgraph "Adapters"
            UI[UI Components<br/>Presentación]
            API[API Routes<br/>Controladores]
            DB[Repositories<br/>Persistencia]
            EXT[External Services<br/>APIs Externas]
        end
        
        UI --> A
        API --> A
        A --> D
        A --> DB
        A --> EXT
    end
    
    style D fill:#e1f5fe
    style A fill:#f3e5f5
    style UI fill:#e8f5e8
    style API fill:#fff3e0
    style DB fill:#fce4ec
    style EXT fill:#f1f8e9
    `
  }

  /**
   * Genera diagrama de flujo de datos
   */
  static generateDataFlow(steps: Array<{ id: string, label: string, type?: string }>): string {
    const nodes = steps.map((step, index) => {
      const shape = step.type === 'decision' ? `{${step.label}}` : `[${step.label}]`
      return `    ${step.id}${shape}`
    }).join('\n')

    const connections = steps.slice(0, -1).map((step, index) => {
      return `    ${step.id} --> ${steps[index + 1].id}`
    }).join('\n')

    return `
graph TD
${nodes}
${connections}
    `
  }

  /**
   * Genera diagrama de componentes
   */
  static generateComponentDiagram(components: Array<{ name: string, dependencies: string[] }>): string {
    const nodes = components.map(comp => `    ${comp.name}[${comp.name}]`).join('\n')
    
    const connections = components.flatMap(comp =>
      comp.dependencies.map(dep => `    ${comp.name} --> ${dep}`)
    ).join('\n')

    return `
graph TD
${nodes}
${connections}
    `
  }
}