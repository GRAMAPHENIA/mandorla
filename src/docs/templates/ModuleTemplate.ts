import { ModuleDocumentation } from '../types/DocumentationTypes'

/**
 * Plantillas de documentación para módulos en español
 */
export class ModuleTemplate {
  /**
   * Genera documentación completa en Markdown para un módulo
   * @param doc Documentación del módulo
   */
  static generateMarkdown(doc: ModuleDocumentation): string {
    return `# Módulo: ${doc.name}

## Descripción

${doc.description}

## Arquitectura

### Patrón Arquitectónico
${doc.architecture.pattern}

### Capas del Módulo

${this.generateLayersSection(doc)}

### Principios Aplicados

${doc.architecture.principles.map(principle => `- ${principle}`).join('\n')}

## Estructura del Módulo

\`\`\`
${doc.name}/
├── domain/          # Lógica de negocio
│   ├── entities/    # Entidades de dominio
│   ├── value-objects/ # Objetos de valor
│   ├── repositories/ # Interfaces de repositorios
│   └── errors/      # Errores específicos del dominio
├── application/     # Casos de uso
│   └── services/    # Servicios de aplicación
├── infrastructure/ # Implementaciones concretas
│   ├── repositories/ # Implementaciones de repositorios
│   └── adapters/    # Adaptadores externos
└── presentation/   # Interfaz de usuario
    ├── components/  # Componentes específicos
    └── hooks/       # Hooks personalizados
\`\`\`

## Componentes

${this.generateComponentsSection(doc)}

## Servicios

${this.generateServicesSection(doc)}

## Entidades de Dominio

${this.generateEntitiesSection(doc)}

## Ejemplos de Uso

${this.generateExamplesSection(doc)}

## Dependencias

${this.generateDependenciesSection(doc)}

## Exportaciones

${this.generateExportsSection(doc)}

---

*Documentación generada automáticamente para el módulo ${doc.name}*
`
  }

  /**
   * Genera la sección de capas del módulo
   * @param doc Documentación del módulo
   */
  private static generateLayersSection(doc: ModuleDocumentation): string {
    return doc.architecture.layers.map(layer => `#### ${layer.name}

**Descripción:** ${layer.description}

**Responsabilidades:**
${layer.responsibilities.map(resp => `- ${resp}`).join('\n')}

**Dependencias:** ${layer.dependencies.length > 0 ? layer.dependencies.join(', ') : 'Ninguna'}
`).join('\n')
  }

  /**
   * Genera la sección de componentes
   * @param doc Documentación del módulo
   */
  private static generateComponentsSection(doc: ModuleDocumentation): string {
    if (doc.components.length === 0) {
      return '*Este módulo no tiene componentes documentados.*'
    }

    return doc.components.map(component => `### ${component.name}

${component.description}

**Categoría:** ${component.category}  
**Props:** ${component.props.length} propiedades  
**Ejemplos:** ${component.examples.length} ejemplos disponibles
`).join('\n')
  }

  /**
   * Genera la sección de servicios
   * @param doc Documentación del módulo
   */
  private static generateServicesSection(doc: ModuleDocumentation): string {
    if (doc.services.length === 0) {
      return '*Este módulo no tiene servicios documentados.*'
    }

    return doc.services.map(service => `### ${service.name}

${service.description}

**Métodos disponibles:**
${service.methods.map(method => `- \`${method.name}(${method.parameters.map(p => `${p.name}: ${p.type}`).join(', ')})\`: ${method.description}`).join('\n')}

**Dependencias:** ${service.dependencies.length > 0 ? service.dependencies.join(', ') : 'Ninguna'}
`).join('\n')
  }

  /**
   * Genera la sección de entidades
   * @param doc Documentación del módulo
   */
  private static generateEntitiesSection(doc: ModuleDocumentation): string {
    if (doc.entities.length === 0) {
      return '*Este módulo no tiene entidades documentadas.*'
    }

    return doc.entities.map(entity => `### ${entity.name}

${entity.description}

**Propiedades:**
${entity.properties.map(prop => `- \`${prop.name}: ${prop.type}\` - ${prop.description}`).join('\n')}

**Métodos:**
${entity.methods.map(method => `- \`${method.name}()\` - ${method.description}`).join('\n')}

**Reglas de Negocio:**
${entity.businessRules.map(rule => `- ${rule}`).join('\n')}
`).join('\n')
  }

  /**
   * Genera la sección de ejemplos
   * @param doc Documentación del módulo
   */
  private static generateExamplesSection(doc: ModuleDocumentation): string {
    if (doc.examples.length === 0) {
      return '*No hay ejemplos disponibles para este módulo.*'
    }

    return doc.examples.map(example => `### ${example.title}

${example.description}

**Escenario:** ${example.scenario}

\`\`\`typescript
${example.code}
\`\`\`

**Explicación:** ${example.explanation}
`).join('\n')
  }

  /**
   * Genera la sección de dependencias
   * @param doc Documentación del módulo
   */
  private static generateDependenciesSection(doc: ModuleDocumentation): string {
    if (doc.dependencies.length === 0) {
      return '*Este módulo no tiene dependencias externas.*'
    }

    return doc.dependencies.map(dep => `- ${dep}`).join('\n')
  }

  /**
   * Genera la sección de exportaciones
   * @param doc Documentación del módulo
   */
  private static generateExportsSection(doc: ModuleDocumentation): string {
    if (doc.exports.length === 0) {
      return '*Este módulo no tiene exportaciones documentadas.*'
    }

    const groupedExports = doc.exports.reduce((groups, exp) => {
      if (!groups[exp.type]) {
        groups[exp.type] = []
      }
      groups[exp.type].push(exp)
      return groups
    }, {} as Record<string, typeof doc.exports>)

    return Object.entries(groupedExports).map(([type, exports]) => `#### ${type.charAt(0).toUpperCase() + type.slice(1)}s

${exports.map(exp => `- \`${exp.name}\`${exp.public ? ' (público)' : ' (privado)'} - ${exp.description}`).join('\n')}
`).join('\n')
  }

  /**
   * Genera documentación en formato HTML
   * @param doc Documentación del módulo
   */
  static generateHTML(doc: ModuleDocumentation): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Módulo ${doc.name} - Documentación</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6;
            color: #333;
        }
        .container { max-width: 1000px; margin: 0 auto; padding: 20px; }
        .header { 
            border-bottom: 3px solid #2196F3; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 30px;
            border-radius: 8px;
        }
        .section { margin: 30px 0; }
        .layer-card { 
            background: #f8f9fa; 
            border-left: 4px solid #2196F3; 
            padding: 20px; 
            margin: 15px 0; 
            border-radius: 0 8px 8px 0;
        }
        .component-card { 
            background: #fff; 
            border: 1px solid #e0e0e0; 
            padding: 20px; 
            margin: 15px 0; 
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .code-block { 
            background: #f1f3f4; 
            padding: 20px; 
            border-radius: 8px; 
            font-family: 'Courier New', monospace; 
            overflow-x: auto;
        }
        .badge { 
            background: #e3f2fd; 
            color: #1976d2; 
            padding: 4px 12px; 
            border-radius: 16px; 
            font-size: 12px; 
            margin: 0 5px;
        }
        .architecture-diagram {
            background: #fff;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        h1 { color: #1976d2; }
        h2 { color: #424242; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; }
        h3 { color: #616161; }
        ul { padding-left: 20px; }
        li { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📦 Módulo: ${doc.name}</h1>
            <p style="font-size: 18px; margin: 10px 0;">${doc.description}</p>
            <div>
                <span class="badge">Patrón: ${doc.architecture.pattern}</span>
                <span class="badge">${doc.components.length} Componentes</span>
                <span class="badge">${doc.services.length} Servicios</span>
                <span class="badge">${doc.entities.length} Entidades</span>
            </div>
        </div>

        <div class="section">
            <h2>🏗️ Arquitectura</h2>
            <div class="architecture-diagram">
                <h3>Capas del Módulo</h3>
                ${this.generateLayersHTML(doc)}
            </div>
            
            <h3>Principios Aplicados</h3>
            <ul>
                ${doc.architecture.principles.map(principle => `<li><strong>${principle}</strong></li>`).join('')}
            </ul>
        </div>

        <div class="section">
            <h2>📁 Estructura del Módulo</h2>
            <div class="code-block">
${doc.name}/<br>
├── domain/          # Lógica de negocio<br>
│   ├── entities/    # Entidades de dominio<br>
│   ├── value-objects/ # Objetos de valor<br>
│   ├── repositories/ # Interfaces de repositorios<br>
│   └── errors/      # Errores específicos del dominio<br>
├── application/     # Casos de uso<br>
│   └── services/    # Servicios de aplicación<br>
├── infrastructure/ # Implementaciones concretas<br>
│   ├── repositories/ # Implementaciones de repositorios<br>
│   └── adapters/    # Adaptadores externos<br>
└── presentation/   # Interfaz de usuario<br>
    ├── components/  # Componentes específicos<br>
    └── hooks/       # Hooks personalizados
            </div>
        </div>

        ${doc.components.length > 0 ? `
        <div class="section">
            <h2>🧩 Componentes</h2>
            ${this.generateComponentsHTML(doc)}
        </div>
        ` : ''}

        ${doc.services.length > 0 ? `
        <div class="section">
            <h2>⚙️ Servicios</h2>
            ${this.generateServicesHTML(doc)}
        </div>
        ` : ''}

        ${doc.entities.length > 0 ? `
        <div class="section">
            <h2>🏛️ Entidades de Dominio</h2>
            ${this.generateEntitiesHTML(doc)}
        </div>
        ` : ''}

        ${doc.examples.length > 0 ? `
        <div class="section">
            <h2>💡 Ejemplos de Uso</h2>
            ${this.generateExamplesHTML(doc)}
        </div>
        ` : ''}

        <div class="section">
            <h2>📋 Información Adicional</h2>
            
            <h3>Dependencias</h3>
            ${doc.dependencies.length > 0 ? 
                `<ul>${doc.dependencies.map(dep => `<li><code>${dep}</code></li>`).join('')}</ul>` :
                '<p><em>Este módulo no tiene dependencias externas.</em></p>'
            }
            
            <h3>Exportaciones</h3>
            ${this.generateExportsHTML(doc)}
        </div>
    </div>
</body>
</html>`
  }

  /**
   * Genera las capas en HTML
   * @param doc Documentación del módulo
   */
  private static generateLayersHTML(doc: ModuleDocumentation): string {
    return doc.architecture.layers.map(layer => `
      <div class="layer-card">
        <h4>📋 ${layer.name}</h4>
        <p>${layer.description}</p>
        <strong>Responsabilidades:</strong>
        <ul>
          ${layer.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
        </ul>
        <strong>Dependencias:</strong> ${layer.dependencies.length > 0 ? layer.dependencies.join(', ') : 'Ninguna'}
      </div>
    `).join('')
  }

  /**
   * Genera componentes en HTML
   * @param doc Documentación del módulo
   */
  private static generateComponentsHTML(doc: ModuleDocumentation): string {
    return doc.components.map(component => `
      <div class="component-card">
        <h3>🧩 ${component.name}</h3>
        <p>${component.description}</p>
        <div>
          <span class="badge">${component.category}</span>
          <span class="badge">${component.props.length} props</span>
          <span class="badge">${component.examples.length} ejemplos</span>
        </div>
      </div>
    `).join('')
  }

  /**
   * Genera servicios en HTML
   * @param doc Documentación del módulo
   */
  private static generateServicesHTML(doc: ModuleDocumentation): string {
    return doc.services.map(service => `
      <div class="component-card">
        <h3>⚙️ ${service.name}</h3>
        <p>${service.description}</p>
        <strong>Métodos:</strong>
        <ul>
          ${service.methods.map(method => `
            <li>
              <code>${method.name}(${method.parameters.map(p => `${p.name}: ${p.type}`).join(', ')})</code>
              - ${method.description}
            </li>
          `).join('')}
        </ul>
        <strong>Dependencias:</strong> ${service.dependencies.length > 0 ? service.dependencies.join(', ') : 'Ninguna'}
      </div>
    `).join('')
  }

  /**
   * Genera entidades en HTML
   * @param doc Documentación del módulo
   */
  private static generateEntitiesHTML(doc: ModuleDocumentation): string {
    return doc.entities.map(entity => `
      <div class="component-card">
        <h3>🏛️ ${entity.name}</h3>
        <p>${entity.description}</p>
        
        <strong>Propiedades:</strong>
        <ul>
          ${entity.properties.map(prop => `<li><code>${prop.name}: ${prop.type}</code> - ${prop.description}</li>`).join('')}
        </ul>
        
        <strong>Métodos:</strong>
        <ul>
          ${entity.methods.map(method => `<li><code>${method.name}()</code> - ${method.description}</li>`).join('')}
        </ul>
        
        <strong>Reglas de Negocio:</strong>
        <ul>
          ${entity.businessRules.map(rule => `<li>${rule}</li>`).join('')}
        </ul>
      </div>
    `).join('')
  }

  /**
   * Genera ejemplos en HTML
   * @param doc Documentación del módulo
   */
  private static generateExamplesHTML(doc: ModuleDocumentation): string {
    return doc.examples.map(example => `
      <div class="component-card">
        <h3>💡 ${example.title}</h3>
        <p>${example.description}</p>
        <p><strong>Escenario:</strong> ${example.scenario}</p>
        <div class="code-block">
          <pre><code>${example.code}</code></pre>
        </div>
        <p><strong>Explicación:</strong> ${example.explanation}</p>
      </div>
    `).join('')
  }

  /**
   * Genera exportaciones en HTML
   * @param doc Documentación del módulo
   */
  private static generateExportsHTML(doc: ModuleDocumentation): string {
    if (doc.exports.length === 0) {
      return '<p><em>Este módulo no tiene exportaciones documentadas.</em></p>'
    }

    const groupedExports = doc.exports.reduce((groups, exp) => {
      if (!groups[exp.type]) {
        groups[exp.type] = []
      }
      groups[exp.type].push(exp)
      return groups
    }, {} as Record<string, typeof doc.exports>)

    return Object.entries(groupedExports).map(([type, exports]) => `
      <h4>${type.charAt(0).toUpperCase() + type.slice(1)}s</h4>
      <ul>
        ${exports.map(exp => `
          <li>
            <code>${exp.name}</code>
            ${exp.public ? '<span class="badge">público</span>' : '<span class="badge">privado</span>'}
            - ${exp.description}
          </li>
        `).join('')}
      </ul>
    `).join('')
  }
}