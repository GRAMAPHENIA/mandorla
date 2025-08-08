import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Componente de ejemplo para probar la configuración
function ExampleComponent() {
  return (
    <div>
      <h1>Mandorla Bakery</h1>
      <p>Configuración de tests funcionando correctamente</p>
    </div>
  )
}

describe('Configuración de Tests', () => {
  it('debería renderizar el componente de ejemplo', () => {
    render(<ExampleComponent />)
    
    expect(screen.getByText('Mandorla Bakery')).toBeInTheDocument()
    expect(screen.getByText('Configuración de tests funcionando correctamente')).toBeInTheDocument()
  })

  it('debería tener acceso a las utilidades de testing', () => {
    const testElement = document.createElement('div')
    testElement.textContent = 'Test element'
    
    expect(testElement).toBeDefined()
    expect(testElement.textContent).toBe('Test element')
  })
})