# Hooks de Testing Automático - Proyecto Mandorla

## Descripción General

Este conjunto de hooks proporciona testing automático y validación de calidad de código para el proyecto Mandorla. Los hooks están diseñados para ejecutar tests relacionados, validar cobertura de código, ejecutar tests de integración en cambios críticos y generar reportes automáticos de calidad.

## Hooks Implementados

### 1. `run-related-tests.kiro.hook`

**Propósito**: Ejecuta automáticamente tests relacionados al guardar archivos de código.

**Características**:

- Identifica tests relacionados usando análisis estático
- Ejecuta tests en orden de prioridad (unitarios → integración → E2E)
- Optimiza tiempo de ejecución con Jest's `--findRelatedTests`
- Detecta regresiones temprano
- Proporciona feedback inmediato sobre cambios

**Archivos monitoreados**:

- `src/**/*.{ts,tsx}`
- `types/**/*.ts`
- `lib/**/*.ts`

**Estrategia de ejecución**:

```bash
# Tests unitarios (prioridad alta)
npx jest --findRelatedTests [archivo-modificado]

# Tests de integración (prioridad media)
npx jest src/modules/[modulo]/**/*.test.ts

# Tests E2E (prioridad baja, solo cambios críticos)
npx jest --testPathPattern=e2e
```

### 2. `coverage-validator.kiro.hook`

**Propósito**: Valida que los cambios mantengan o mejoren la cobertura mínima.

**Características**:

- Umbrales específicos por tipo de módulo
- Análisis diferencial (antes/después)
- Detección de líneas sin cobertura
- Sugerencias específicas de tests
- Reportes detallados de cobertura

**Umbrales de cobertura**:

- **Dominio**: 85% (líneas, ramas, funciones, statements)
- **Aplicación**: 80% (líneas, ramas, funciones, statements)
- **Infraestructura**: 70% (líneas, ramas, funciones, statements)
- **Componentes**: 75% (líneas, ramas, funciones, statements)
- **Hooks**: 80% (líneas, ramas, funciones, statements)

### 3. `integration-tests-trigger.kiro.hook`

**Propósito**: Ejecuta tests de integración cuando se modifican componentes críticos.

**Características**:

- Identifica componentes críticos automáticamente
- Ejecuta flujos completos de negocio
- Tests de APIs end-to-end
- Validación de integraciones entre módulos
- Configuración de entorno de testing

**Componentes críticos monitoreados**:

- `src/modules/**/domain/entities/*.ts`
- `src/modules/**/application/services/*.ts`
- `src/modules/**/infrastructure/repositories/*.ts`
- `src/app/api/**/*.ts`
- `src/stores/*.ts`

**Flujos de integración probados**:

- Flujo completo de checkout (carrito → pedido → pago)
- Búsqueda y filtrado de productos
- Gestión de carrito (agregar, modificar, eliminar)
- APIs críticas (productos, carrito, pedidos, clientes)

### 4. `test-reports-generator.kiro.hook`

**Propósito**: Genera reportes automáticos de resultados de testing y métricas.

**Características**:

- Reportes por categoría (unitarios, integración, cobertura)
- Análisis de tendencias históricas
- Detección de test smells y anti-patrones
- Métricas de calidad avanzadas
- Exportación para herramientas externas

**Tipos de reportes generados**:

- Reporte de tests unitarios por módulo
- Reporte de tests de integración por flujo
- Reporte detallado de cobertura
- Análisis de tendencias (30 días)
- Detección de problemas de calidad

## Configuración de Testing

### Umbrales de Cobertura por Módulo

```javascript
// Configuración en hooks-config.json
{
  "umbrales_cobertura": {
    "domain": {
      "lines": 85, "functions": 85, "branches": 85, "statements": 85
    },
    "application": {
      "lines": 80, "functions": 80, "branches": 80, "statements": 80
    },
    "infrastructure": {
      "lines": 70, "functions": 70, "branches": 70, "statements": 70
    },
    "components": {
      "lines": 75, "functions": 75, "branches": 70, "statements": 75
    }
  }
}
```

### Configuración de Jest Optimizada

```javascript
// jest.config.js - Configuración para hooks
module.exports = {
  testTimeout: 10000,
  maxWorkers: '50%',
  cache: true,
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text', 'json', 'html'],
  coverageDirectory: 'coverage',
  
  // Umbrales específicos por módulo
  coverageThreshold: {
    'src/modules/**/domain/**': {
      branches: 85, functions: 85, lines: 85, statements: 85
    },
    'src/modules/**/application/**': {
      branches: 80, functions: 80, lines: 80, statements: 80
    }
  }
}
```

## Flujo de Trabajo de Testing

### 1. Desarrollo Normal

```
Modificar archivo → Hook detecta cambio → Ejecuta tests relacionados → Valida cobertura → Reporta resultados
```

### 2. Cambios Críticos

```
Modificar componente crítico → Ejecuta tests de integración → Valida flujos completos → Genera reporte detallado
```

### 3. Modificar Tests

```
Crear/modificar test → Analiza calidad del test → Detecta anti-patrones → Genera métricas → Actualiza reportes
```

## Tipos de Tests Ejecutados

### Tests Unitarios

- **Entidades de dominio**: Validaciones, métodos de negocio, value objects
- **Servicios de aplicación**: Casos de uso, manejo de errores, integración con repositorios
- **Componentes React**: Renderizado, props, eventos, estados
- **Hooks personalizados**: Valores de retorno, efectos, cleanup
- **Utilidades**: Funciones puras, transformaciones, validaciones

### Tests de Integración

- **Flujos de negocio**: Checkout completo, búsqueda de productos
- **APIs**: Endpoints con base de datos real o mocks
- **Módulos**: Integración entre capas (domain → application → infrastructure)
- **Stores**: Integración con servicios y persistencia

### Tests End-to-End (Selectivos)

- **Flujos críticos**: Solo para cambios en componentes principales
- **Regresiones**: Tests específicos para bugs conocidos
- **Performance**: Tests de carga para APIs críticas

## Reportes Generados

### Reporte de Tests Unitarios

```markdown
# 🧪 Reporte de Tests Unitarios

## Resumen Ejecutivo
- Total de tests: 162
- Tests exitosos: 159 (98.1%)
- Tests fallidos: 3 (1.9%)
- Cobertura promedio: 87%
- Tiempo de ejecución: 7.9s

## Detalles por Módulo
### Módulo de Productos
- Tests: 45 (✅ 42, ❌ 3)
- Cobertura: 87% líneas, 82% ramas
- Estado: ⚠️ 3 tests fallando

### Módulo de Carrito  
- Tests: 32 (✅ 32, ❌ 0)
- Cobertura: 92% líneas, 88% ramas
- Estado: ✅ Todos los tests pasan
```

### Reporte de Cobertura

```markdown
# 📊 Reporte de Cobertura

## Cobertura Global
- Líneas: 1,247/1,456 (85.6%)
- Ramas: 234/278 (84.2%)
- Funciones: 156/178 (87.6%)

## Archivos Sin Cobertura
1. src/utils/legacy-helpers.ts - 0% cobertura
2. src/modules/reportes/domain/entities/report-entity.ts - 30% cobertura

## Líneas Críticas Sin Cobertura
- Validaciones de seguridad: 12 líneas
- Manejo de errores: 8 líneas
- Cálculos de negocio: 15 líneas
```

### Reporte de Integración

```markdown
# 🔗 Reporte de Tests de Integración

## Flujos Críticos
### ✅ Flujo de Checkout
- Tests: 8/8 pasando
- Cobertura: Completa
- Tiempo: 15.2s

### ❌ Flujo de Búsqueda
- Tests: 5/7 pasando
- Problemas: Filtros avanzados fallan
- Acción requerida: Revisar lógica de filtros
```

## Detección de Problemas

### Test Smells Detectados

- **Tests largos**: >50 líneas de código
- **Assertion Roulette**: >10 aserciones por test
- **Test Dependency**: Tests que dependen de otros
- **Complex Mocks**: Mocks muy complejos o desactualizados
- **Duplicated Tests**: Tests muy similares

### Métricas de Calidad

- **Complejidad promedio**: Número de aserciones por test
- **Mantenibilidad**: Código duplicado en tests
- **Efectividad**: Tests que detectan bugs reales
- **Performance**: Tests que tardan >5 segundos

## Optimizaciones Implementadas

### Ejecución Inteligente

- Priorizar tests unitarios sobre integración
- Usar caché de Jest para acelerar ejecución
- Ejecutar tests relacionados en lugar de toda la suite
- Limitar workers para optimizar recursos

### Configuración de Performance

```javascript
{
  maxWorkers: '50%',        // Usar 50% de CPUs disponibles
  cache: true,              // Habilitar caché de Jest
  watchman: true,           // Usar Watchman para detección de cambios
  collectCoverageOnlyFrom: {
    // Solo archivos modificados
  }
}
```

## Integración con CI/CD

### Pipeline de Testing

```yaml
# .github/workflows/testing.yml
name: Automated Testing
on:
  push:
    paths: ['src/**/*.{ts,tsx}']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Run related tests
        run: pnpm test:related
      - name: Validate coverage
        run: pnpm test:coverage
      - name: Integration tests
        run: pnpm test:integration
      - name: Generate reports
        run: pnpm test:reports
```

### Exportación de Métricas

- **JSON**: Para dashboards externos
- **JUnit XML**: Para integración con CI/CD
- **HTML**: Para reportes visuales
- **CSV**: Para análisis de tendencias

## Alertas y Notificaciones

### Criterios de Alerta

- **🔴 Crítico**: >5% tests fallando o cobertura <70%
- **🟡 Advertencia**: Degradación >3% en métricas
- **🟢 Información**: Mejoras significativas

### Canales de Notificación

- **Slack**: Alertas críticas inmediatas
- **Email**: Reportes semanales detallados
- **Dashboard**: Métricas en tiempo real
- **PR Comments**: Comentarios automáticos

## Personalización

### Habilitar/Deshabilitar Hooks

Modificar `"enabled": true/false` en cada archivo `.kiro.hook`.

### Ajustar Umbrales de Cobertura

Editar `hooks-config.json` en la sección `"umbrales_cobertura"`.

### Modificar Patrones de Archivos

Actualizar arrays `"patterns"` en cada hook.

### Configurar Tipos de Tests

Ajustar configuración en `"configuracion_jest"`.

## Troubleshooting

### Tests No Se Ejecutan

1. Verificar que `"enabled": true`
2. Confirmar que el archivo coincide con los patrones
3. Revisar configuración de Jest

### Cobertura Incorrecta

1. Verificar configuración de `collectCoverageFrom`
2. Revisar exclusiones en `.gitignore`
3. Confirmar que los tests realmente prueban el código

### Tests de Integración Fallan

1. Verificar configuración de base de datos de test
2. Revisar mocks de servicios externos
3. Confirmar que el entorno de test está limpio

## Beneficios

### Para Desarrolladores

- **Feedback inmediato** sobre cambios
- **Tests automáticos** sin configuración manual
- **Detección temprana** de regresiones
- **Métricas claras** de calidad de código

### Para el Proyecto

- **Cobertura consistente** y mejorada
- **Calidad de tests** monitoreada
- **Integración continua** optimizada
- **Documentación automática** de testing

### Para Mantenimiento

- **Detección automática** de problemas
- **Reportes regulares** de estado
- **Tendencias históricas** para toma de decisiones
- **Alertas proactivas** para degradación de calidad

## Roadmap

### Próximas Mejoras

1. **Mutation Testing**: Validar calidad real de tests
2. **Visual Regression Testing**: Para componentes UI
3. **Performance Testing**: Para APIs críticas
4. **Accessibility Testing**: Para componentes React
5. **Contract Testing**: Para integraciones externas
