'use client'

import React, { useState, useEffect } from 'react'
import { InteractiveExample as IInteractiveExample } from '../types/DocumentationTypes'

interface InteractiveExampleProps {
  example: IInteractiveExample
  onCodeChange?: (code: string) => void
}

/**
 * Componente para mostrar ejemplos interactivos de otros componentes
 */
export function InteractiveExample({ example, onCodeChange }: InteractiveExampleProps) {
  const [code, setCode] = useState(example.code)
  const [showCode, setShowCode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (onCodeChange) {
      onCodeChange(code)
    }
  }, [code, onCodeChange])

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
    setError(null)
    
    // Validación básica del código
    try {
      // Aquí se podría implementar validación más sofisticada
      if (newCode.trim().length === 0) {
        setError('El código no puede estar vacío')
      }
    } catch (err) {
      setError('Error en el código: ' + (err instanceof Error ? err.message : 'Error desconocido'))
    }
  }

  return (
    <div className="interactive-example border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{example.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{example.description}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            {showCode ? 'Ocultar Código' : 'Ver Código'}
          </button>
          {example.playground && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
              Playground
            </span>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="p-6">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Vista Previa</h4>
          <div className="border rounded-lg p-4 bg-gray-50 min-h-[100px] flex items-center justify-center">
            {error ? (
              <div className="text-red-600 text-sm">
                <span className="font-medium">Error:</span> {error}
              </div>
            ) : (
              <div className="w-full">
                {React.createElement(example.component, example.props)}
              </div>
            )}
          </div>
        </div>

        {/* Code Editor */}
        {showCode && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Código</h4>
            {example.editable ? (
              <div className="relative">
                <textarea
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="w-full h-64 p-3 font-mono text-sm border rounded-lg bg-gray-900 text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Escribe tu código aquí..."
                />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                    Editable
                  </span>
                </div>
              </div>
            ) : (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>{code}</code>
              </pre>
            )}
          </div>
        )}

        {/* Props Editor (si es playground) */}
        {example.playground && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Propiedades</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <PropsEditor 
                props={example.props}
                onChange={(newProps) => {
                  // Actualizar props del ejemplo
                  example.props = newProps
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Editor de propiedades para el playground
 */
function PropsEditor({ props, onChange }: { props: Record<string, any>, onChange: (props: Record<string, any>) => void }) {
  const [localProps, setLocalProps] = useState(props)

  const handlePropChange = (key: string, value: any) => {
    const newProps = { ...localProps, [key]: value }
    setLocalProps(newProps)
    onChange(newProps)
  }

  return (
    <div className="space-y-3">
      {Object.entries(localProps).map(([key, value]) => (
        <div key={key} className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600 w-24">
            {key}:
          </label>
          <input
            type={typeof value === 'boolean' ? 'checkbox' : typeof value === 'number' ? 'number' : 'text'}
            value={typeof value === 'boolean' ? undefined : value}
            checked={typeof value === 'boolean' ? value : undefined}
            onChange={(e) => {
              const newValue = typeof value === 'boolean' 
                ? e.target.checked
                : typeof value === 'number'
                ? parseFloat(e.target.value) || 0
                : e.target.value
              handlePropChange(key, newValue)
            }}
            className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      ))}
    </div>
  )
}