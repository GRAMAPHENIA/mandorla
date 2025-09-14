# API: {{endpointName}}

## Información General

- **Método**: {{method}}
- **Ruta**: `{{route}}`
- **Descripción**: {{description}}
- **Autenticación**: {{authRequired}}
- **Versión**: v1
- **Módulo**: {{module}}

## Contexto de Negocio

Este endpoint forma parte del sistema de e-commerce de la panadería Mandorla y permite {{businessContext}}.

## Parámetros

{{#if routeParams}}

### Parámetros de Ruta

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
{{routeParamsTable}}
{{/if}}

{{#if queryParams}}

### Parámetros de Query

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
{{queryParamsTable}}
{{/if}}

{{#if bodyParams}}

### Body ({{method}})

```json
{{bodyExample}}
```

#### Esquema de Validación

```typescript
{{validationSchema}}
```

{{/if}}

## Respuestas

### Respuesta Exitosa ({{successCode}})

```json
{{successResponse}}
```

### Respuestas de Error

#### 400 - Solicitud Inválida

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada inválidos",
    "details": {
      {{validationErrors}}
    }
  }
}
```

{{#if hasAuthError}}

#### 401 - No Autorizado

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token de autenticación requerido"
  }
}
```

{{/if}}

{{#if hasNotFoundError}}

#### 404 - No Encontrado

```json
{
  "success": false,
  "error": {
    "code": "{{notFoundCode}}",
    "message": "{{notFoundMessage}}"
  }
}
```

{{/if}}

#### 500 - Error Interno

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Error interno del servidor"
  }
}
```

## Ejemplos de Uso

### Ejemplo con cURL

```bash
# {{curlDescription}}
curl -X {{method}} "{{curlUrl}}" \
  -H "Content-Type: application/json"{{#if authRequired}} \
  -H "Authorization: Bearer YOUR_TOKEN"{{/if}}{{#if bodyParams}} \
  -d '{{curlBody}}'{{/if}}
```

### Ejemplo con JavaScript/TypeScript

```typescript
// Usando fetch para {{jsDescription}}
const {{functionName}} = async ({{jsParams}}) => {
  const response = await fetch('{{route}}', {
    method: '{{method}}',
    headers: {
      'Content-Type': 'application/json',{{#if authRequired}}
      'Authorization': `Bearer ${token}`,{{/if}}
    },{{#if bodyParams}}
    body: JSON.stringify({{jsBody}}){{/if}}
  })
  
  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.error.message)
  }
  
  return result.data
}

// Ejemplo de uso
try {
  const resultado = await {{functionName}}({{exampleUsage}})
  console.log('Éxito:', resultado)
} catch (error) {
  console.error('Error:', error.message)
}
```

### Ejemplo con React Hook

```tsx
// Hook personalizado para usar este endpoint
const use{{hookName}} = ({{hookParams}}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const {{actionName}} = useCallback(async ({{actionParams}}) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await {{functionName}}({{actionCall}})
      setData(result)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [{{dependencies}}])

  return { data, loading, error, {{actionName}} }
}

// Uso en componente
function {{componentExample}}() {
  const { data, loading, error, {{actionName}} } = use{{hookName}}()
  
  const handleAction = () => {
    {{actionName}}({{exampleData}})
  }
  
  return (
    <div>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <button onClick={handleAction}>{{buttonText}}</button>
    </div>
  )
}
```

## Integración con Módulos

Este endpoint utiliza los siguientes servicios y repositorios:

{{moduleIntegrations}}

## Casos de Uso del Negocio

{{businessUseCases}}

## Testing

```typescript
// Ejemplo de test de integración
describe('{{endpointName}} API', () => {
  it('debería {{testDescription}}', async () => {
    const response = await request(app)
      .{{method.toLowerCase()}}('{{route}}'){{#if bodyParams}}
      .send({{testBody}}){{/if}}
      .expect({{successCode}})
    
    expect(response.body.success).toBe(true)
    expect(response.body.data).toMatchObject({{expectedResponse}})
  })

  it('debería retornar error con datos inválidos', async () => {
    const response = await request(app)
      .{{method.toLowerCase()}}('{{route}}'){{#if bodyParams}}
      .send({{invalidTestBody}}){{/if}}
      .expect(400)
    
    expect(response.body.success).toBe(false)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })
})
```

## Notas de Implementación

- Implementa principios SOLID y clean architecture
- Utiliza validación con Zod para entrada de datos
- Manejo de errores tipados y consistentes
- Logging estructurado para debugging
- Rate limiting implementado para prevenir abuso

## Changelog

- **{{currentDate}}**: Endpoint creado
- Documentación generada automáticamente

---

*Documentación generada automáticamente para el proyecto Mandorla - Panadería E-commerce*
