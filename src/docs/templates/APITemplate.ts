import { APIDocumentation } from '../types/DocumentationTypes'

/**
 * Plantillas de documentación para APIs en español
 */
export class APITemplate {
  /**
   * Genera documentación completa en Markdown para una API
   * @param doc Documentación de la API
   */
  static generateMarkdown(doc: APIDocumentation): string {
    return `# API: ${doc.method} ${doc.endpoint}

## Descripción

${doc.description}

## Detalles del Endpoint

**Método:** \`${doc.method}\`  
**Endpoint:** \`${doc.endpoint}\`  
${doc.authentication ? `**Autenticación:** ${doc.authentication.type} - ${doc.authentication.description}` : '**Autenticación:** No requerida'}

## Parámetros

${this.generateParametersSection(doc)}

${doc.requestBody ? `## Cuerpo de la Petición

**Tipo de Contenido:** \`${doc.requestBody.contentType}\`

${doc.requestBody.description}

### Esquema

\`\`\`json
${JSON.stringify(doc.requestBody.schema, null, 2)}
\`\`\`

### Ejemplos

${doc.requestBody.examples.map(example => `\`\`\`json
${JSON.stringify(example, null, 2)}
\`\`\``).join('\n\n')}
` : ''}

## Respuestas

${this.generateResponsesSection(doc)}

## Ejemplos de Uso

${this.generateExamplesSection(doc)}

---

*Documentación de API generada automáticamente*
`
  }

  /**
   * Genera la sección de parámetros
   * @param doc Documentación de la API
   */
  private static generateParametersSection(doc: APIDocumentation): string {
    if (doc.parameters.length === 0) {
      return '*Esta API no requiere parámetros.*'
    }

    const headers = '| Parámetro | Ubicación | Tipo | Requerido | Descripción | Ejemplo |'
    const separator = '|-----------|-----------|------|-----------|-------------|---------|'
    
    const rows = doc.parameters.map(param => {
      const example = param.example !== undefined ? 
        `\`${JSON.stringify(param.example)}\`` : '-'
      
      return `| \`${param.name}\` | ${param.location} | \`${param.type}\` | ${param.required ? '✅' : '❌'} | ${param.description} | ${example} |`
    }).join('\n')

    return `${headers}\n${separator}\n${rows}`
  }

  /**
   * Genera la sección de respuestas
   * @param doc Documentación de la API
   */
  private static generateResponsesSection(doc: APIDocumentation): string {
    if (doc.responses.length === 0) {
      return '*No hay respuestas documentadas.*'
    }

    return doc.responses.map(response => `### ${response.statusCode} - ${this.getStatusText(response.statusCode)}

${response.description}

${response.schema ? `**Esquema de Respuesta:**

\`\`\`json
${JSON.stringify(response.schema, null, 2)}
\`\`\`` : ''}

${response.examples.length > 0 ? `**Ejemplos:**

${response.examples.map(example => `\`\`\`json
${JSON.stringify(example, null, 2)}
\`\`\``).join('\n\n')}` : ''}
`).join('\n')
  }

  /**
   * Genera la sección de ejemplos
   * @param doc Documentación de la API
   */
  private static generateExamplesSection(doc: APIDocumentation): string {
    if (doc.examples.length === 0) {
      return '*No hay ejemplos disponibles.*'
    }

    return doc.examples.map(example => `### ${example.title}

${example.description}

**Petición:**
\`\`\`json
${JSON.stringify(example.request, null, 2)}
\`\`\`

**Respuesta:**
\`\`\`json
${JSON.stringify(example.response, null, 2)}
\`\`\`

**Explicación:** ${example.explanation}
`).join('\n')
  }

  /**
   * Genera documentación en formato HTML
   * @param doc Documentación de la API
   */
  static generateHTML(doc: APIDocumentation): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API ${doc.method} ${doc.endpoint} - Documentación</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container { max-width: 1000px; margin: 0 auto; padding: 20px; }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .method-badge { 
            background: ${this.getMethodColor(doc.method)};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            margin-right: 15px;
        }
        .endpoint-code { 
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 16px;
        }
        .section { margin: 30px 0; }
        .param-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .param-table th { 
            background: #f5f5f5; 
            padding: 15px;
            text-align: left;
            border-bottom: 2px solid #ddd;
        }
        .param-table td { 
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
        }
        .response-card { 
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            margin: 20px 0;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .response-header { 
            background: ${this.getStatusColor(200)};
            color: white;
            padding: 15px 20px;
            font-weight: bold;
        }
        .response-body { padding: 20px; }
        .code-block { 
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 20px;
            font-family: 'Courier New', monospace;
            overflow-x: auto;
            margin: 15px 0;
        }
        .example-card {
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .auth-info {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
        }
        h1 { margin: 0; font-size: 28px; }
        h2 { color: #495057; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; }
        h3 { color: #6c757d; }
        .required { color: #28a745; font-weight: bold; }
        .optional { color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <span class="method-badge">${doc.method}</span>
                <code class="endpoint-code">${doc.endpoint}</code>
            </div>
            <h1>Documentación de API</h1>
            <p style="margin: 0; font-size: 18px; opacity: 0.9;">${doc.description}</p>
        </div>

        ${doc.authentication ? `
        <div class="auth-info">
            <h3>🔐 Autenticación Requerida</h3>
            <p><strong>Tipo:</strong> ${doc.authentication.type}</p>
            <p><strong>Descripción:</strong> ${doc.authentication.description}</p>
            ${doc.authentication.location ? `<p><strong>Ubicación:</strong> ${doc.authentication.location}</p>` : ''}
        </div>
        ` : ''}

        <div class="section">
            <h2>📋 Parámetros</h2>
            ${this.generateParametersHTML(doc)}
        </div>

        ${doc.requestBody ? `
        <div class="section">
            <h2>📤 Cuerpo de la Petición</h2>
            <p><strong>Tipo de Contenido:</strong> <code>${doc.requestBody.contentType}</code></p>
            <p>${doc.requestBody.description}</p>
            
            <h3>Esquema</h3>
            <div class="code-block">
                <pre>${JSON.stringify(doc.requestBody.schema, null, 2)}</pre>
            </div>
            
            ${doc.requestBody.examples.length > 0 ? `
            <h3>Ejemplos</h3>
            ${doc.requestBody.examples.map(example => `
                <div class="code-block">
                    <pre>${JSON.stringify(example, null, 2)}</pre>
                </div>
            `).join('')}
            ` : ''}
        </div>
        ` : ''}

        <div class="section">
            <h2>📥 Respuestas</h2>
            ${this.generateResponsesHTML(doc)}
        </div>

        ${doc.examples.length > 0 ? `
        <div class="section">
            <h2>💡 Ejemplos de Uso</h2>
            ${this.generateExamplesHTML(doc)}
        </div>
        ` : ''}
    </div>
</body>
</html>`
  }

  /**
   * Genera parámetros en HTML
   * @param doc Documentación de la API
   */
  private static generateParametersHTML(doc: APIDocumentation): string {
    if (doc.parameters.length === 0) {
      return '<p><em>Esta API no requiere parámetros.</em></p>'
    }

    const rows = doc.parameters.map(param => {
      const example = param.example !== undefined ? 
        `<code>${JSON.stringify(param.example)}</code>` : '-'
      
      return `<tr>
        <td><code>${param.name}</code></td>
        <td><span class="badge">${param.location}</span></td>
        <td><code>${param.type}</code></td>
        <td class="${param.required ? 'required' : 'optional'}">${param.required ? '✅ Requerido' : '❌ Opcional'}</td>
        <td>${param.description}</td>
        <td>${example}</td>
      </tr>`
    }).join('')

    return `<table class="param-table">
      <thead>
        <tr>
          <th>Parámetro</th>
          <th>Ubicación</th>
          <th>Tipo</th>
          <th>Requerido</th>
          <th>Descripción</th>
          <th>Ejemplo</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`
  }

  /**
   * Genera respuestas en HTML
   * @param doc Documentación de la API
   */
  private static generateResponsesHTML(doc: APIDocumentation): string {
    if (doc.responses.length === 0) {
      return '<p><em>No hay respuestas documentadas.</em></p>'
    }

    return doc.responses.map(response => `
      <div class="response-card">
        <div class="response-header" style="background: ${this.getStatusColor(response.statusCode)};">
          ${response.statusCode} - ${this.getStatusText(response.statusCode)}
        </div>
        <div class="response-body">
          <p>${response.description}</p>
          
          ${response.schema ? `
          <h4>Esquema de Respuesta</h4>
          <div class="code-block">
            <pre>${JSON.stringify(response.schema, null, 2)}</pre>
          </div>
          ` : ''}
          
          ${response.examples.length > 0 ? `
          <h4>Ejemplos</h4>
          ${response.examples.map(example => `
            <div class="code-block">
              <pre>${JSON.stringify(example, null, 2)}</pre>
            </div>
          `).join('')}
          ` : ''}
        </div>
      </div>
    `).join('')
  }

  /**
   * Genera ejemplos en HTML
   * @param doc Documentación de la API
   */
  private static generateExamplesHTML(doc: APIDocumentation): string {
    return doc.examples.map(example => `
      <div class="example-card">
        <h3>${example.title}</h3>
        <p>${example.description}</p>
        
        <h4>Petición</h4>
        <div class="code-block">
          <pre>${JSON.stringify(example.request, null, 2)}</pre>
        </div>
        
        <h4>Respuesta</h4>
        <div class="code-block">
          <pre>${JSON.stringify(example.response, null, 2)}</pre>
        </div>
        
        <p><strong>Explicación:</strong> ${example.explanation}</p>
      </div>
    `).join('')
  }

  /**
   * Obtiene el color para un método HTTP
   * @param method Método HTTP
   */
  private static getMethodColor(method: string): string {
    const colors: Record<string, string> = {
      'GET': '#28a745',
      'POST': '#007bff',
      'PUT': '#ffc107',
      'DELETE': '#dc3545',
      'PATCH': '#6f42c1'
    }
    return colors[method] || '#6c757d'
  }

  /**
   * Obtiene el color para un código de estado
   * @param statusCode Código de estado HTTP
   */
  private static getStatusColor(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return '#28a745'
    if (statusCode >= 300 && statusCode < 400) return '#17a2b8'
    if (statusCode >= 400 && statusCode < 500) return '#ffc107'
    if (statusCode >= 500) return '#dc3545'
    return '#6c757d'
  }

  /**
   * Obtiene el texto descriptivo para un código de estado
   * @param statusCode Código de estado HTTP
   */
  private static getStatusText(statusCode: number): string {
    const statusTexts: Record<number, string> = {
      200: 'OK',
      201: 'Creado',
      204: 'Sin Contenido',
      400: 'Petición Incorrecta',
      401: 'No Autorizado',
      403: 'Prohibido',
      404: 'No Encontrado',
      422: 'Entidad No Procesable',
      500: 'Error Interno del Servidor'
    }
    return statusTexts[statusCode] || 'Estado Desconocido'
  }
}