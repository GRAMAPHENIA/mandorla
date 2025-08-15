# Hooks de Formateo Automático - Proyecto Mandorla

## Descripción General

Este conjunto de hooks proporciona formateo automático y validación de código al guardar archivos en el proyecto Mandorla. Los hooks están diseñados para mantener la consistencia del código, aplicar principios de clean code y seguir las convenciones establecidas para el proyecto.

## Hooks Implementados

### 1. `auto-format-on-save.kiro.hook`

**Propósito**: Hook principal que coordina el formateo automático al guardar archivos.

**Características**:

- Formateo automático con reglas específicas del proyecto
- Validación de principios SOLID y clean code
- Organización automática de imports
- Verificación de tipos TypeScript

**Archivos afectados**: `src/**/*.{ts,tsx,js,jsx}`, `types/**/*.ts`, `lib/**/*.ts`

### 2. `prettier-formatter.kiro.hook`

**Propósito**: Aplica formateo Prettier consistente con configuración personalizada.

**Configuración Prettier**:

```json
{
  "semi": true,
  "trailingComma": "es5", 
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

**Archivos afectados**: Todos los archivos de código y configuración

### 3. `eslint-integration.kiro.hook`

**Propósito**: Ejecuta validaciones ESLint automáticas y aplica correcciones.

**Validaciones incluidas**:

- Errores de sintaxis TypeScript/JavaScript
- Imports no utilizados
- Variables declaradas pero no usadas
- Reglas de React Hooks
- Validaciones específicas de Next.js

### 4. `naming-conventions-validator.kiro.hook`

**Propósito**: Valida convenciones de nomenclatura en español.

**Convenciones aplicadas**:

- **Componentes**: PascalCase en español (`ListaProductos`, `FormularioCliente`)
- **Variables**: camelCase en español (`precioTotal`, `datosCliente`)
- **Funciones**: camelCase con verbos en español (`calcularPrecio`, `agregarAlCarrito`)
- **Tipos**: PascalCase con sufijo (`ProductoInterface`, `ClienteType`)

## Configuración

### Archivo de Configuración

Los hooks están configurados centralmente en `hooks-config.json` que define:

- Hooks activos
- Patrones de archivos
- Configuración de herramientas
- Orden de ejecución

### Orden de Ejecución

1. `prettier-formatter` - Formateo básico
2. `eslint-integration` - Validaciones y correcciones
3. `naming-conventions-validator` - Validación de nomenclatura
4. `auto-format-on-save` - Validaciones finales

## Uso

### Activación Automática

Los hooks se ejecutan automáticamente al guardar archivos que coincidan con los patrones definidos.

### Patrones de Archivos Monitoreados

- `src/**/*.{ts,tsx,js,jsx}` - Código fuente principal
- `types/**/*.ts` - Definiciones de tipos
- `lib/**/*.ts` - Utilidades y librerías
- `scripts/**/*.{js,ts}` - Scripts de automatización

### Respuestas de los Hooks

Cada hook proporciona feedback estructurado:

- ✅ **Éxito**: Operaciones completadas correctamente
- 🔧 **Cambios**: Lista de modificaciones aplicadas
- ⚠️ **Advertencias**: Problemas menores detectados
- ❌ **Errores**: Problemas críticos que requieren atención
- 💡 **Sugerencias**: Mejoras recomendadas

## Integración con el Proyecto

### Arquitectura Modular

Los hooks respetan la arquitectura hexagonal del proyecto:

- Validan separación de capas (domain, application, infrastructure)
- Detectan dependencias circulares entre módulos
- Verifican que componentes UI no importen lógica de negocio

### Principios SOLID

- Detectan violaciones de responsabilidad única
- Sugieren mejoras para principio abierto/cerrado
- Validan inversión de dependencias

### Clean Code

- Verifican nombres descriptivos
- Detectan funciones muy largas o complejas
- Sugieren eliminación de código duplicado

## Personalización

### Habilitar/Deshabilitar Hooks

Modificar el campo `"enabled": true/false` en cada archivo `.kiro.hook`.

### Modificar Patrones de Archivos

Actualizar el array `"patterns"` en la sección `"when"` de cada hook.

### Ajustar Configuración

Editar `hooks-config.json` para cambiar configuraciones globales.

## Troubleshooting

### Hook No Se Ejecuta

1. Verificar que `"enabled": true`
2. Confirmar que el archivo coincide con los patrones
3. Revisar sintaxis JSON del archivo hook

### Conflictos de Formateo

1. Los hooks priorizan legibilidad sobre reglas estrictas
2. El orden de ejecución está optimizado para evitar conflictos
3. Prettier se ejecuta primero para establecer formato base

### Errores de Validación

1. Los errores críticos se reportan sin aplicar cambios
2. Las advertencias se reportan pero permiten continuar
3. Las sugerencias son opcionales y no bloquean el flujo

## Mantenimiento

### Actualización de Reglas

1. Modificar los prompts en los archivos `.kiro.hook`
2. Actualizar `hooks-config.json` con nuevas configuraciones
3. Probar con archivos de ejemplo antes de aplicar globalmente

### Monitoreo de Rendimiento

- Los hooks están optimizados para ejecución rápida
- Se enfocan en cambios incrementales
- Evitan procesamiento innecesario de archivos no modificados

## Contribución

Para agregar nuevos hooks de formateo:

1. Crear archivo `.kiro.hook` siguiendo la estructura existente
2. Actualizar `hooks-config.json` con la nueva configuración
3. Documentar en este README
4. Probar con casos de uso reales del proyecto Mandorla
