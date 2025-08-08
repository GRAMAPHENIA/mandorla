import { ComponentDocumentation } from '../types/DocumentationTypes'

/**
 * Plantillas de documentación para componentes en español
 */
export class ComponentTemplate {
  /**
   * Genera documentación en formato Markdown para un componente
   * @param doc Documentación del componente
   */
  static generateMarkdown(doc: ComponentDocumentation): string {
    return `# ${doc.name}

## Descripción

${doc.description}

**Categoría:** ${doc.category}  
**Última actualización:** ${doc.lastUpdated.toLocaleDateString('es-ES')}  
**Autor:** ${doc.author}

## Propiedades

${this.generatePropsTable(doc)}

## Ejemplos de Uso

${this.generateExamples(doc)}

## Casos de Uso

${this.generateUseCases(doc)}

${doc.relatedComponents.length > 0 ? `## Componentes Relacionados

${doc.relatedComponents.map(comp => `- [${comp}](#${comp.toLowerCase()})`).join('\n')}` : ''}

---

*Documentación generada automáticamente*
`
  }

  /**
   * Genera tabla de propiedades en Markdown
   * @param doc Documentación del componente
   */
  private static generatePropsTable(doc: ComponentDocumentation): string {
    if (doc.props.length === 0) {
      return '*Este componente no tiene propiedades configurables.*'
    }

    const headers = '| Propiedad | Tipo | Requerida | Valor por Defecto | Descripción |'
    const separator = '|-----------|------|-----------|-------------------|-------------|'
    
    const rows = doc.props.map(prop => {
      const defaultValue = prop.defaultValue !== undefined ? 
        `\`${JSON.stringify(prop.defaultValue)}\`` : '-'
      
      return `| \`${prop.name}\` | \`${prop.type}\` | ${prop.required ? '✅' : '❌'} | ${defaultValue} | ${prop.description} |`
    }).join('\n')

    return `${headers}\n${separator}\n${rows}`
  }

  /**
   * Genera sección de ejemplos
   * @param doc Documentación del componente
   */
  private static generateExamples(doc: ComponentDocumentation): string {
    if (doc.examples.length === 0) {
      return '*No hay ejemplos disponibles.*'
    }

    return doc.examples.map(example => `### ${example.title}

${example.description}

\`\`\`${example.language}
${example.code}
\`\`\`
`).join('\n')
  }

  /**
   * Genera sección de casos de uso
   * @param doc Documentación del componente
   */
  private static generateUseCases(doc: ComponentDocumentation): string {
    if (doc.useCases.length === 0) {
      return '*No hay casos de uso documentados.*'
    }

    return doc.useCases.map(useCase => `### ${useCase.title}

**Descripción:** ${useCase.description}

**Escenario:** ${useCase.scenario}

**Implementación:**
\`\`\`tsx
${useCase.implementation}
\`\`\`
`).join('\n')
  }

  /**
   * Genera documentación en formato HTML
   * @param doc Documentación del componente
   */
  static generateHTML(doc: ComponentDocumentation): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${doc.name} - Documentación</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .prop-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .prop-table th, .prop-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .prop-table th { background-color: #f5f5f5; }
        .example { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .code { background-color: #f1f3f4; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
        .badge { background-color: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${doc.name}</h1>
            <p>${doc.description}</p>
            <div>
                <span class="badge">${doc.category}</span>
                <span style="margin-left: 10px; color: #666;">
                    Actualizado: ${doc.lastUpdated.toLocaleDateString('es-ES')}
                </span>
            </div>
        </div>

        <h2>Propiedades</h2>
        ${this.generatePropsHTML(doc)}

        <h2>Ejemplos de Uso</h2>
        ${this.generateExamplesHTML(doc)}

        <h2>Casos de Uso</h2>
        ${this.generateUseCasesHTML(doc)}

        ${doc.relatedComponents.length > 0 ? `
        <h2>Componentes Relacionados</h2>
        <ul>
            ${doc.relatedComponents.map(comp => `<li><a href="#${comp.toLowerCase()}">${comp}</a></li>`).join('')}
        </ul>
        ` : ''}
    </div>
</body>
</html>`
  }

  /**
   * Genera tabla de propiedades en HTML
   * @param doc Documentación del componente
   */
  private static generatePropsHTML(doc: ComponentDocumentation): string {
    if (doc.props.length === 0) {
      return '<p><em>Este componente no tiene propiedades configurables.</em></p>'
    }

    const rows = doc.props.map(prop => {
      const defaultValue = prop.defaultValue !== undefined ? 
        `<code>${JSON.stringify(prop.defaultValue)}</code>` : '-'
      
      return `<tr>
        <td><code>${prop.name}</code></td>
        <td><code>${prop.type}</code></td>
        <td>${prop.required ? '✅' : '❌'}</td>
        <td>${defaultValue}</td>
        <td>${prop.description}</td>
      </tr>`
    }).join('')

    return `<table class="prop-table">
      <thead>
        <tr>
          <th>Propiedad</th>
          <th>Tipo</th>
          <th>Requerida</th>
          <th>Valor por Defecto</th>
          <th>Descripción</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`
  }

  /**
   * Genera ejemplos en HTML
   * @param doc Documentación del componente
   */
  private static generateExamplesHTML(doc: ComponentDocumentation): string {
    if (doc.examples.length === 0) {
      return '<p><em>No hay ejemplos disponibles.</em></p>'
    }

    return doc.examples.map(example => `
      <div class="example">
        <h3>${example.title}</h3>
        <p>${example.description}</p>
        <pre><code>${example.code}</code></pre>
      </div>
    `).join('')
  }

  /**
   * Genera casos de uso en HTML
   * @param doc Documentación del componente
   */
  private static generateUseCasesHTML(doc: ComponentDocumentation): string {
    if (doc.useCases.length === 0) {
      return '<p><em>No hay casos de uso documentados.</em></p>'
    }

    return doc.useCases.map(useCase => `
      <div class="example">
        <h3>${useCase.title}</h3>
        <p><strong>Descripción:</strong> ${useCase.description}</p>
        <p><strong>Escenario:</strong> ${useCase.scenario}</p>
        <p><strong>Implementación:</strong></p>
        <pre><code>${useCase.implementation}</code></pre>
      </div>
    `).join('')
  }
}