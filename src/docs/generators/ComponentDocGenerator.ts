import { ComponentDocumentation, PropDefinition, CodeExample } from '../types/DocumentationTypes'

/**
 * Generador automático de documentación para componentes React
 */
export class ComponentDocGenerator {
  /**
   * Genera documentación completa para un componente
   * @param componentPath Ruta del archivo del componente
   */
  async generateDocumentation(componentPath: string): Promise<ComponentDocumentation> {
    const componentInfo = await this.analyzeComponentFile(componentPath)
    
    return {
      id: componentInfo.name.toLowerCase(),
      name: componentInfo.name,
      description: componentInfo.description || this.generateDefaultDescription(componentInfo.name),
      category: this.inferCategory(componentPath),
      props: componentInfo.props,
      examples: this.generateExamples(componentInfo),
      useCases: this.generateUseCases(componentInfo),
      relatedComponents: await this.findRelatedComponents(componentInfo),
      lastUpdated: new Date(),
      author: 'Generador Automático'
    }
  }

  /**
   * Extrae información de props de un componente TypeScript
   * @param componentCode Código del componente
   */
  extractProps(componentCode: string): PropDefinition[] {
    const props: PropDefinition[] = []
    
    // Buscar interfaces de props
    const interfaceRegex = /interface\s+(\w+Props)\s*{([^}]+)}/g
    let match
    
    while ((match = interfaceRegex.exec(componentCode)) !== null) {
      const interfaceBody = match[2]
      const propMatches = interfaceBody.match(/(\w+)(\?)?:\s*([^;\n]+)/g)
      
      if (propMatches) {
        propMatches.forEach(propMatch => {
          const propRegex = /(\w+)(\?)?:\s*([^;\n]+)/
          const propInfo = propMatch.match(propRegex)
          
          if (propInfo) {
            props.push({
              name: propInfo[1],
              type: propInfo[3].trim(),
              required: !propInfo[2], // Si no tiene ?, es requerido
              description: this.generatePropDescription(propInfo[1], propInfo[3]),
              examples: this.generatePropExamples(propInfo[1], propInfo[3])
            })
          }
        })
      }
    }
    
    return props
  }

  /**
   * Genera ejemplos de código para un componente
   * @param componentInfo Información del componente
   */
  private generateExamples(componentInfo: any): CodeExample[] {
    const examples: CodeExample[] = []
    
    // Ejemplo básico
    examples.push({
      id: `${componentInfo.name}-basic`,
      title: 'Uso Básico',
      description: `Ejemplo básico del componente ${componentInfo.name}`,
      code: this.generateBasicExample(componentInfo),
      language: 'tsx',
      editable: true
    })
    
    // Ejemplo con props
    if (componentInfo.props.length > 0) {
      examples.push({
        id: `${componentInfo.name}-with-props`,
        title: 'Con Propiedades',
        description: `Ejemplo del componente ${componentInfo.name} con propiedades`,
        code: this.generatePropsExample(componentInfo),
        language: 'tsx',
        editable: true
      })
    }
    
    return examples
  }

  /**
   * Genera casos de uso para un componente
   * @param componentInfo Información del componente
   */
  private generateUseCases(componentInfo: any): any[] {
    return [
      {
        id: `${componentInfo.name}-primary`,
        title: 'Caso de Uso Principal',
        description: `Uso principal del componente ${componentInfo.name}`,
        scenario: `Cuando necesitas mostrar ${componentInfo.name.toLowerCase()}`,
        implementation: `Utiliza <${componentInfo.name} /> en tu JSX`
      }
    ]
  }

  /**
   * Analiza un archivo de componente para extraer información
   * @param componentPath Ruta del archivo
   */
  private async analyzeComponentFile(componentPath: string): Promise<any> {
    // En una implementación real, aquí se leería y analizaría el archivo
    const componentName = this.extractComponentName(componentPath)
    
    return {
      name: componentName,
      description: null,
      props: [], // Se extraerían del código real
      imports: [],
      exports: [componentName]
    }
  }

  /**
   * Extrae el nombre del componente de la ruta del archivo
   * @param componentPath Ruta del archivo
   */
  private extractComponentName(componentPath: string): string {
    const fileName = componentPath.split('/').pop() || ''
    return fileName.replace(/\.(tsx|ts|jsx|js)$/, '')
  }

  /**
   * Infiere la categoría del componente basada en su ruta
   * @param componentPath Ruta del componente
   */
  private inferCategory(componentPath: string): string {
    if (componentPath.includes('/ui/')) return 'Componentes UI Base'
    if (componentPath.includes('/layout/')) return 'Layout'
    if (componentPath.includes('/products/')) return 'Productos'
    if (componentPath.includes('/cart/')) return 'Carrito'
    if (componentPath.includes('/checkout/')) return 'Checkout'
    if (componentPath.includes('/sections/')) return 'Secciones'
    return 'General'
  }

  /**
   * Genera una descripción por defecto para un componente
   * @param componentName Nombre del componente
   */
  private generateDefaultDescription(componentName: string): string {
    return `Componente ${componentName} - Generado automáticamente`
  }

  /**
   * Genera descripción para una prop
   * @param propName Nombre de la prop
   * @param propType Tipo de la prop
   */
  private generatePropDescription(propName: string, propType: string): string {
    const commonDescriptions: Record<string, string> = {
      'className': 'Clases CSS adicionales para personalizar el estilo',
      'children': 'Contenido hijo del componente',
      'onClick': 'Función que se ejecuta al hacer clic',
      'onSubmit': 'Función que se ejecuta al enviar el formulario',
      'disabled': 'Indica si el componente está deshabilitado',
      'loading': 'Indica si el componente está en estado de carga',
      'title': 'Título del componente',
      'description': 'Descripción del componente',
      'id': 'Identificador único del elemento'
    }
    
    return commonDescriptions[propName] || `Propiedad ${propName} de tipo ${propType}`
  }

  /**
   * Genera ejemplos para una prop
   * @param propName Nombre de la prop
   * @param propType Tipo de la prop
   */
  private generatePropExamples(propName: string, propType: string): string[] {
    if (propType.includes('string')) {
      return [`"ejemplo de ${propName}"`]
    }
    if (propType.includes('number')) {
      return ['42', '0', '100']
    }
    if (propType.includes('boolean')) {
      return ['true', 'false']
    }
    if (propType.includes('function') || propType.includes('=>')) {
      return [`() => console.log('${propName} ejecutado')`]
    }
    return []
  }

  /**
   * Genera ejemplo básico de uso
   * @param componentInfo Información del componente
   */
  private generateBasicExample(componentInfo: any): string {
    return `import { ${componentInfo.name} } from './components'

export default function Example() {
  return (
    <${componentInfo.name} />
  )
}`
  }

  /**
   * Genera ejemplo con props
   * @param componentInfo Información del componente
   */
  private generatePropsExample(componentInfo: any): string {
    const propsString = componentInfo.props
      .slice(0, 3) // Solo los primeros 3 props
      .map((prop: PropDefinition) => {
        const example = prop.examples?.[0] || this.getDefaultValue(prop.type)
        return `${prop.name}={${example}}`
      })
      .join('\n      ')

    return `import { ${componentInfo.name} } from './components'

export default function Example() {
  return (
    <${componentInfo.name}
      ${propsString}
    />
  )
}`
  }

  /**
   * Obtiene un valor por defecto para un tipo
   * @param type Tipo de la prop
   */
  private getDefaultValue(type: string): string {
    if (type.includes('string')) return '"ejemplo"'
    if (type.includes('number')) return '42'
    if (type.includes('boolean')) return 'true'
    if (type.includes('function')) return '() => {}'
    return 'undefined'
  }

  /**
   * Encuentra componentes relacionados
   * @param componentInfo Información del componente
   */
  private async findRelatedComponents(componentInfo: any): Promise<string[]> {
    // En una implementación real, analizaría las importaciones y uso
    return []
  }
}