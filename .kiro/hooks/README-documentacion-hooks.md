# Hooks de Documentación Automática - Proyecto Mandorla

## Descripción General

Este conjunto de hooks proporciona generación y mantenimiento automático de documentación para el proyecto Mandorla. Los hooks están diseñados para mantener la documentación sincronizada con el código, generar diagramas de arquitectura actualizados y crear un sistema de documentación coherente y navegable.

## Hooks Implementados

### 1. `update-component-docs.kiro.hook`

**Propósito**: Genera automáticamente documentación para componentes React.

**Características**:

- Extrae props y tipos automáticamente
- Genera ejemplos de uso funcionales
- Documenta casos de uso específicos del negocio
- Crea documentación en español
- Incluye información de accesibilidad

**Archivos monitoreados**:

- `src/components/**/*.{tsx,ts}`
- `src/modules/**/presentation/**/*.{tsx,ts}`
- `src/shared/components/**/*.{tsx,ts}`

**Salida**: Archivos `*.docs.md` junto a cada componente

### 2. `api-documentation-generator.kiro.hook`

**Propósito**: Genera documentación automática para APIs y endpoints.

**Características**:

- Documenta métodos HTTP y parámetros
- Genera ejemplos de requests/responses
- Incluye códigos de error y validaciones
- Crea ejemplos con cURL y JavaScript
- Documenta esquemas Zod

**Archivos monitoreados**:

- `src/app/api/**/*.{ts,js}`
- `src/pages/api/**/*.{ts,js}`
- `src/modules/**/infrastructure/api/**/*.{ts,js}`

**Salida**: Archivos `*.api.md` en `docs/apis/`

### 3. `architecture-diagram-updater.kiro.hook`

**Propósito**: Actualiza diagramas de arquitectura automáticamente.

**Características**:

- Genera diagramas Mermaid de arquitectura hexagonal
- Crea diagramas de flujo de datos
- Actualiza diagramas de dependencias entre módulos
- Genera diagramas de clases para entidades
- Mantiene diagramas sincronizados con el código

**Archivos monitoreados**:

- `src/modules/**/domain/**/*.ts`
- `src/modules/**/application/**/*.ts`
- `src/modules/**/infrastructure/**/*.ts`
- `src/modules/**/presentation/**/*.tsx`

**Salida**: Archivos de diagramas en `docs/architecture/`

### 4. `documentation-integrator.kiro.hook`

**Propósito**: Integra y organiza toda la documentación generada.

**Características**:

- Genera índices automáticos
- Crea enlaces cruzados entre documentos
- Valida consistencia de la documentación
- Mantiene metadatos actualizados
- Genera reportes de calidad

**Archivos monitoreados**:

- `docs/**/*.md`
- `src/**/*.docs.md`
- `src/**/*.api.md`

**Salida**: Índices y estructura organizativa en `docs/`

## Estructura de Documentación Generada

### Organización de Archivos

```
docs/
├── README.md                    # Índice principal
├── components/
│   ├── README.md               # Índice de componentes
│   ├── ui/
│   │   ├── button.docs.md
│   │   └── input.docs.md
│   └── products/
│       └── product-card.docs.md
├── apis/
│   ├── README.md               # Índice de APIs
│   ├── products.api.md
│   └── cart.api.md
├── architecture/
│   ├── README.md               # Índice de arquitectura
│   ├── overview.md
│   └── modules/
│       ├── productos.md
│       └── carrito.md
└── guides/
    ├── development.md
    └── testing.md
```

### Formatos de Documentación

#### Componentes (*.docs.md)

```markdown
# [NombreComponente]

## Descripción
[Propósito del componente]

## Props
| Prop | Tipo | Requerida | Default | Descripción |
|------|------|-----------|---------|-------------|

## Ejemplos de Uso
```tsx
// Ejemplo básico
```

## Accesibilidad

- [Características implementadas]

## Componentes Relacionados

- [Enlaces a componentes relacionados]

```

#### APIs (*.api.md)
```markdown
# API: [Nombre del Endpoint]

## Información General
- **Método**: GET/POST/PUT/DELETE
- **Ruta**: `/api/[ruta]`
- **Descripción**: [Propósito]

## Parámetros
[Tabla de parámetros]

## Respuestas
```json
// Ejemplos de respuestas
```

## Ejemplos de Uso

```bash
# cURL
```

```typescript
// JavaScript/TypeScript
```

```

#### Diagramas de Arquitectura
```markdown
# Diagrama: [Título]

## Descripción
[Explicación del diagrama]

## Diagrama
```mermaid
[Código Mermaid]
```

## Componentes

- [Descripción de componentes]

## Flujos Principales

1. [Descripción de flujos]

```

## Configuración

### Patrones de Archivos Monitoreados
Los hooks están configurados para monitorear archivos específicos según su tipo:

- **Componentes**: Archivos `.tsx` y `.ts` en carpetas de componentes
- **APIs**: Archivos de rutas de Next.js en `api/`
- **Arquitectura**: Archivos de módulos de dominio
- **Documentación**: Archivos `.md` existentes

### Estructura de Salida
La documentación se organiza automáticamente en:
- `docs/components/` - Documentación de componentes
- `docs/apis/` - Documentación de APIs
- `docs/architecture/` - Diagramas y documentación arquitectónica
- `docs/guides/` - Guías de desarrollo

### Metadatos Automáticos
Cada archivo generado incluye metadatos YAML:
```yaml
---
title: [Título]
category: [components/apis/architecture]
tags: [tag1, tag2]
lastUpdated: [fecha]
author: Sistema de documentación automática
status: [stable/beta/deprecated]
---
```

## Uso

### Activación Automática

Los hooks se ejecutan automáticamente cuando:

- Se guarda un componente React
- Se modifica una ruta de API
- Se actualiza un módulo de dominio
- Se edita documentación existente

### Flujo de Trabajo

1. **Modificar código** → Hook detecta cambio
2. **Analizar archivo** → Extrae información relevante
3. **Generar documentación** → Crea/actualiza archivos .md
4. **Integrar documentación** → Actualiza índices y enlaces
5. **Validar consistencia** → Verifica enlaces y coherencia

### Respuestas de los Hooks

Cada hook proporciona feedback detallado:

- 📝 **Documentación generada**: Archivos creados/actualizados
- 🔍 **Elementos documentados**: Props, endpoints, diagramas
- ⚠️ **Advertencias**: Información faltante o inconsistencias
- 💡 **Sugerencias**: Mejoras recomendadas

## Integración con el Proyecto

### Arquitectura Modular

Los hooks respetan y documentan la arquitectura hexagonal:

- Documentan separación de capas
- Generan diagramas de módulos
- Mantienen coherencia arquitectónica

### Principios SOLID

- Documentan interfaces y contratos
- Explican inversión de dependencias
- Muestran separación de responsabilidades

### Clean Code

- Generan documentación clara y concisa
- Incluyen ejemplos funcionales
- Mantienen nomenclatura consistente

## Personalización

### Habilitar/Deshabilitar Hooks

Modificar `"enabled": true/false` en cada archivo `.kiro.hook`.

### Modificar Patrones de Archivos

Actualizar arrays `"patterns"` en la sección `"when"`.

### Ajustar Estructura de Salida

Editar `hooks-config.json` en la sección `"estructura_documentacion"`.

### Personalizar Plantillas

Los prompts en cada hook pueden modificarse para ajustar el formato de salida.

## Mantenimiento

### Validación Automática

Los hooks incluyen validaciones para:

- Enlaces rotos
- Documentación desactualizada
- Inconsistencias en la información
- Archivos huérfanos

### Reportes de Calidad

El sistema genera reportes automáticos sobre:

- Cobertura de documentación
- Enlaces válidos/rotos
- Archivos sin documentar
- Sugerencias de mejora

### Limpieza Automática

- Elimina documentación de componentes eliminados
- Actualiza enlaces cuando se mueven archivos
- Regenera índices automáticamente

## Troubleshooting

### Hook No Genera Documentación

1. Verificar que `"enabled": true`
2. Confirmar que el archivo coincide con los patrones
3. Revisar sintaxis del código fuente

### Documentación Incompleta

1. Verificar que el componente/API esté bien tipado
2. Agregar comentarios JSDoc si es necesario
3. Revisar que las props estén documentadas

### Enlaces Rotos

1. El integrador detecta y reporta enlaces rotos
2. Se actualizan automáticamente cuando se mueven archivos
3. Se validan referencias cruzadas

## Contribución

Para agregar nuevos hooks de documentación:

1. Crear archivo `.kiro.hook` siguiendo la estructura existente
2. Actualizar `hooks-config.json` con la nueva configuración
3. Documentar en este README
4. Probar con casos de uso reales del proyecto

## Beneficios

### Para Desarrolladores

- Documentación siempre actualizada
- Ejemplos de uso automáticos
- Menos tiempo dedicado a documentar manualmente

### Para el Proyecto

- Documentación consistente y completa
- Mejor onboarding de nuevos desarrolladores
- Arquitectura bien documentada y visible

### Para Mantenimiento

- Detección automática de inconsistencias
- Validación de enlaces y referencias
- Reportes de calidad de documentación
