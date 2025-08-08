'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { InteractiveExample } from './InteractiveExample'

interface ComponentPlaygroundProps {
  component: React.ComponentType<any>
  componentName: string
  defaultProps?: Record<string, any>
  propTypes?: Record<string, {
    type: string
    required: boolean
    defaultValue?: any
    options?: any[]
    description?: string
  }>
}

/**
 * Playground interactivo para testing de componentes en vivo
 */
export function ComponentPlayground({ 
  component, 
  componentName, 
  defaultProps = {},
  propTypes = {}
}: ComponentPlaygroundProps) {
  const [currentProps, setCurrentProps] = useState(defaultProps)
  const [activeTab, setActiveTab] = useState<'preview' | 'props' | 'code'>('preview')
  const [generatedCode, setGeneratedCode] = useState('')

  // Generar código automáticamente cuando cambien las props
  useEffect(() => {
    const code = generateComponentCode(componentName, currentProps)
    setGeneratedCode(code)
  }, [componentName, currentProps])

  const example = useMemo(() => ({
    id: `${componentName}-playground`,
    title: `Playground: ${componentName}`,
    description: `Experimenta con el componente ${componentName} en tiempo real`,
    component,
    props: currentProps,
    code: generatedCode,
    editable: true,
    playground: true
  }), [component, componentName, currentProps, generatedCode])

  return (
    <div className="component-playground bg-white border rounded-lg shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              🎮 Playground: {componentName}
            </h2>
            <p className="text-gray-600 mt-1">
              Experimenta con las propiedades y ve los cambios en tiempo real
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentProps(defaultProps)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Resetear
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedCode)
                // Aquí podrías mostrar una notificación
              }}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Copiar Código
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex">
          {[
            { id: 'preview', label: '👁️ Vista Previa', count: null },
            { id: 'props', label: '⚙️ Propiedades', count: Object.keys(propTypes).length },
            { id: 'code', label: '💻 Código', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'preview' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vista Previa</h3>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 bg-gray-50">
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="w-full max-w-md">
                  {React.createElement(component, currentProps)}
                </div>
              </div>
            </div>
            
            {/* Props Summary */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Propiedades Actuales</h4>
              <pre className="text-sm text-blue-800 overflow-x-auto">
                {JSON.stringify(currentProps, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'props' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Configuración de Propiedades
            </h3>
            <div className="space-y-6">
              {Object.keys(propTypes).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay propiedades configurables para este componente.</p>
                  <p className="text-sm mt-2">
                    El componente se renderiza con su configuración por defecto.
                  </p>
                </div>
              ) : (
                Object.entries(propTypes).map(([propName, propConfig]) => (
                  <PropEditor
                    key={propName}
                    name={propName}
                    config={propConfig}
                    value={currentProps[propName]}
                    onChange={(value) => {
                      setCurrentProps(prev => ({ ...prev, [propName]: value }))
                    }}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Código Generado</h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre>
                <code>{generatedCode}</code>
              </pre>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(generatedCode)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                📋 Copiar al Portapapeles
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([generatedCode], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${componentName}Example.tsx`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                💾 Descargar Archivo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Editor para una propiedad individual
 */
function PropEditor({ 
  name, 
  config, 
  value, 
  onChange 
}: {
  name: string
  config: any
  value: any
  onChange: (value: any) => void
}) {
  const renderInput = () => {
    switch (config.type) {
      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">{value ? 'true' : 'false'}</span>
          </label>
        )
      
      case 'number':
        return (
          <input
            type="number"
            value={value || 0}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )
      
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {config.options?.map((option: any) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={config.defaultValue ? `Por defecto: ${config.defaultValue}` : ''}
          />
        )
    }
  }

  return (
    <div className="prop-editor border rounded-lg p-4 bg-gray-50">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">
            {name}
            {config.required && <span className="text-red-500 ml-1">*</span>}
          </h4>
          {config.description && (
            <p className="text-sm text-gray-600 mt-1">{config.description}</p>
          )}
        </div>
        <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
          {config.type}
        </div>
      </div>
      
      <div className="mb-2">
        {renderInput()}
      </div>
      
      {config.defaultValue !== undefined && (
        <div className="text-xs text-gray-500">
          Valor por defecto: <code>{JSON.stringify(config.defaultValue)}</code>
        </div>
      )}
    </div>
  )
}

/**
 * Genera código TypeScript/React para el componente con las props actuales
 */
function generateComponentCode(componentName: string, props: Record<string, any>): string {
  const propsString = Object.entries(props)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `  ${key}="${value}"`
      } else if (typeof value === 'boolean') {
        return value ? `  ${key}` : `  ${key}={false}`
      } else {
        return `  ${key}={${JSON.stringify(value)}}`
      }
    })
    .join('\n')

  return `import React from 'react'
import { ${componentName} } from './components'

export default function Example() {
  return (
    <${componentName}${propsString ? '\n' + propsString + '\n    ' : ' '}/>
  )
}`
}