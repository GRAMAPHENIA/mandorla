'use client'

import React, { useState, useMemo } from 'react'
import { ComponentDocumentation, ModuleDocumentation, APIDocumentation } from '../types/DocumentationTypes'
import { ComponentTemplate } from '../templates/ComponentTemplate'
import { ModuleTemplate } from '../templates/ModuleTemplate'
import { APITemplate } from '../templates/APITemplate'
import { MermaidDiagram, ArchitectureDiagramGenerator } from './MermaidDiagram'

interface DocumentationViewerProps {
  components?: ComponentDocumentation[]
  modules?: ModuleDocumentation[]
  apis?: APIDocumentation[]
  className?: string
}

/**
 * Visor principal de documentación con navegación y búsqueda
 */
export function DocumentationViewer({ 
  components = [], 
  modules = [], 
  apis = [],
  className = ''
}: DocumentationViewerProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'modules' | 'components' | 'apis'>('overview')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'preview' | 'markdown' | 'html'>('preview')

  // Filtrar elementos basado en búsqueda
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return {
      components: components.filter(comp => 
        comp.name.toLowerCase().includes(term) || 
        comp.description.toLowerCase().includes(term)
      ),
      modules: modules.filter(mod => 
        mod.name.toLowerCase().includes(term) || 
        mod.description.toLowerCase().includes(term)
      ),
      apis: apis.filter(api => 
        api.endpoint.toLowerCase().includes(term) || 
        api.description.toLowerCase().includes(term)
      )
    }
  }, [components, modules, apis, searchTerm])

  const renderContent = () => {
    if (selectedItem) {
      return renderSelectedItem()
    }

    switch (activeSection) {
      case 'overview':
        return renderOverview()
      case 'modules':
        return renderModulesList()
      case 'components':
        return renderComponentsList()
      case 'apis':
        return renderAPIsList()
      default:
        return renderOverview()
    }
  }

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📚 Documentación del Proyecto
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Documentación completa de la arquitectura modular, componentes y APIs del proyecto Mandorla
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-blue-600">{modules.length}</div>
          <div className="text-blue-800 font-medium">Módulos</div>
          <div className="text-sm text-blue-600 mt-1">Arquitectura modular</div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-green-600">{components.length}</div>
          <div className="text-green-800 font-medium">Componentes</div>
          <div className="text-sm text-green-600 mt-1">UI reutilizables</div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-purple-600">{apis.length}</div>
          <div className="text-purple-800 font-medium">APIs</div>
          <div className="text-sm text-purple-600 mt-1">Endpoints documentados</div>
        </div>
      </div>

      {/* Diagrama de arquitectura */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Arquitectura del Sistema</h2>
        <MermaidDiagram
          title="Arquitectura Modular"
          description="Vista general de la arquitectura hexagonal implementada"
          chart={ArchitectureDiagramGenerator.generateHexagonalArchitecture('Sistema')}
        />
      </div>

      {/* Enlaces rápidos */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.slice(0, 6).map(module => (
            <button
              key={module.id}
              onClick={() => {
                setActiveSection('modules')
                setSelectedItem(module.id)
              }}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <h3 className="font-semibold text-gray-900">{module.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{module.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderModulesList = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Módulos del Sistema</h2>
      <div className="grid gap-6">
        {filteredData.modules.map(module => (
          <div key={module.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{module.name}</h3>
                <p className="text-gray-600 mt-2">{module.description}</p>
                <div className="flex gap-2 mt-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {module.architecture.pattern}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {module.components.length} componentes
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    {module.services.length} servicios
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(module.id)}
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Ver Detalles
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderComponentsList = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Componentes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.components.map(component => (
          <div key={component.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900">{component.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{component.description}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {component.category}
              </span>
              <button
                onClick={() => setSelectedItem(component.id)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAPIsList = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">APIs</h2>
      <div className="space-y-4">
        {filteredData.apis.map(api => (
          <div key={`${api.method}_${api.endpoint}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded text-sm font-medium ${getMethodColor(api.method)}`}>
                {api.method}
              </span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">{api.endpoint}</code>
              <button
                onClick={() => setSelectedItem(`${api.method}_${api.endpoint}`)}
                className="ml-auto text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver Documentación →
              </button>
            </div>
            <p className="text-gray-600 mt-2">{api.description}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSelectedItem = () => {
    const component = components.find(c => c.id === selectedItem)
    const module = modules.find(m => m.id === selectedItem)
    const api = apis.find(a => `${a.method}_${a.endpoint}` === selectedItem)

    if (component) {
      return renderComponentDetail(component)
    } else if (module) {
      return renderModuleDetail(module)
    } else if (api) {
      return renderAPIDetail(api)
    }

    return <div>Elemento no encontrado</div>
  }

  const renderComponentDetail = (component: ComponentDocumentation) => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setSelectedItem(null)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Volver
        </button>
        <div className="flex gap-2">
          {(['preview', 'markdown', 'html'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode === 'preview' ? 'Vista' : mode === 'markdown' ? 'Markdown' : 'HTML'}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'preview' && (
        <div className="prose max-w-none">
          <h1>{component.name}</h1>
          <p>{component.description}</p>
          {/* Renderizar contenido de vista previa */}
        </div>
      )}

      {viewMode === 'markdown' && (
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{ComponentTemplate.generateMarkdown(component)}</code>
        </pre>
      )}

      {viewMode === 'html' && (
        <div 
          className="border rounded-lg overflow-hidden"
          dangerouslySetInnerHTML={{ __html: ComponentTemplate.generateHTML(component) }}
        />
      )}
    </div>
  )

  const renderModuleDetail = (module: ModuleDocumentation) => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setSelectedItem(null)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Volver
        </button>
        <div className="flex gap-2">
          {(['preview', 'markdown', 'html'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode === 'preview' ? 'Vista' : mode === 'markdown' ? 'Markdown' : 'HTML'}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'preview' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{module.name}</h1>
            <p className="text-xl text-gray-600 mt-2">{module.description}</p>
          </div>
          
          <MermaidDiagram
            title={`Arquitectura del Módulo ${module.name}`}
            chart={ArchitectureDiagramGenerator.generateHexagonalArchitecture(module.name)}
          />
        </div>
      )}

      {viewMode === 'markdown' && (
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{ModuleTemplate.generateMarkdown(module)}</code>
        </pre>
      )}

      {viewMode === 'html' && (
        <div 
          className="border rounded-lg overflow-hidden"
          dangerouslySetInnerHTML={{ __html: ModuleTemplate.generateHTML(module) }}
        />
      )}
    </div>
  )

  const renderAPIDetail = (api: APIDocumentation) => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setSelectedItem(null)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Volver
        </button>
        <div className="flex gap-2">
          {(['preview', 'markdown', 'html'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode === 'preview' ? 'Vista' : mode === 'markdown' ? 'Markdown' : 'HTML'}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'preview' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded font-medium ${getMethodColor(api.method)}`}>
              {api.method}
            </span>
            <code className="bg-gray-100 px-3 py-1 rounded">{api.endpoint}</code>
          </div>
          <p className="text-gray-600">{api.description}</p>
        </div>
      )}

      {viewMode === 'markdown' && (
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{APITemplate.generateMarkdown(api)}</code>
        </pre>
      )}

      {viewMode === 'html' && (
        <div 
          className="border rounded-lg overflow-hidden"
          dangerouslySetInnerHTML={{ __html: APITemplate.generateHTML(api) }}
        />
      )}
    </div>
  )

  return (
    <div className={`documentation-viewer flex h-screen bg-gray-50 ${className}`}>
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Documentación</h2>
          
          {/* Search */}
          <div className="mt-3">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {[
              { id: 'overview', label: '🏠 Visión General', count: null },
              { id: 'modules', label: '📦 Módulos', count: modules.length },
              { id: 'components', label: '🧩 Componentes', count: components.length },
              { id: 'apis', label: '🔌 APIs', count: apis.length }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as any)
                  setSelectedItem(null)
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.count !== null && (
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                      {item.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    'GET': 'bg-green-100 text-green-800',
    'POST': 'bg-blue-100 text-blue-800',
    'PUT': 'bg-yellow-100 text-yellow-800',
    'DELETE': 'bg-red-100 text-red-800',
    'PATCH': 'bg-purple-100 text-purple-800'
  }
  return colors[method] || 'bg-gray-100 text-gray-800'
}