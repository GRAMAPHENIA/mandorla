# {{componentName}}

## Descripción

{{description}}

Este componente forma parte del sistema de e-commerce de la panadería Mandorla y está diseñado para {{businessPurpose}}.

## Uso Básico

```tsx
import { {{componentName}} } from '@/components/{{modulePath}}'

function EjemploBasico() {
  return (
    <{{componentName}}
      {{basicProps}}
    />
  )
}
```

## Props

| Prop | Tipo | Requerida | Default | Descripción |
|------|------|-----------|---------|-------------|
{{propsTable}}

## Ejemplos de Uso

### Ejemplo 1: Caso Básico

```tsx
// Ejemplo con datos reales de la panadería Mandorla
<{{componentName}} 
  {{basicExampleProps}}
/>
```

### Ejemplo 2: Caso Avanzado

```tsx
// Ejemplo con funcionalidad completa
<{{componentName}}
  {{advancedExampleProps}}
/>
```

{{#if hasVariants}}

## Variantes

{{variants}}
{{/if}}

## Accesibilidad

- ✅ Soporte para lectores de pantalla
- ✅ Navegación por teclado
- ✅ Contraste de colores adecuado
- ✅ Etiquetas ARIA apropiadas

{{#if hasBusinessLogic}}

## Integración con Servicios

Este componente se integra con los siguientes servicios del dominio:

{{serviceIntegrations}}
{{/if}}

## Estados de Carga y Error

```tsx
// Manejo de estados asíncronos
<{{componentName}}
  loading={cargando}
  error={error}
  onRetry={reintentar}
/>
```

## Notas de Implementación

- Construido siguiendo principios SOLID
- Utiliza arquitectura hexagonal para separación de responsabilidades
- Implementa patrones de clean code
- Compatible con el sistema de temas de Mandorla

## Componentes Relacionados

{{relatedComponents}}

## Testing

```tsx
// Ejemplo de test básico
import { render, screen } from '@testing-library/react'
import { {{componentName}} } from './{{componentName}}'

describe('{{componentName}}', () => {
  it('debería renderizar correctamente', () => {
    render(<{{componentName}} {{testProps}} />)
    expect(screen.getByRole('{{expectedRole}}')).toBeInTheDocument()
  })
})
```

## Changelog

- **{{currentDate}}**: Componente creado
- Documentación generada automáticamente

---

*Documentación generada automáticamente para el proyecto Mandorla - Panadería E-commerce*
