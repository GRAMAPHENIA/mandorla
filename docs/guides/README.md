# Guías de Desarrollo - Proyecto Mandorla

## Descripción General

Guías completas para desarrolladores que trabajen en el proyecto e-commerce Mandorla, cubriendo desde la configuración inicial hasta el deployment en producción.

## 🚀 Configuración Inicial

### Requisitos del Sistema

- **Node.js**: 18.0.0 o superior
- **pnpm**: 8.0.0 o superior (gestor de paquetes recomendado)
- **Git**: Para control de versiones
- **VS Code**: Editor recomendado con extensiones específicas

### Setup Rápido

```bash
# Clonar el repositorio
git clone [repository-url]
cd mandorla

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local

# Iniciar servidor de desarrollo
pnpm dev
```

## 📚 Guías por Categoría

### 🏗️ Arquitectura y Diseño

#### Principios Fundamentales

- [🏛️ Arquitectura Hexagonal](./architecture/hexagonal-architecture.md) - Implementación de capas y separación de responsabilidades
- [🎯 Principios SOLID](./architecture/solid-principles.md) - Aplicación práctica en el proyecto
- [🧩 Diseño Modular](./architecture/modular-design.md) - Organización de módulos y dependencias
- [🔄 Patrones de Diseño](./architecture/design-patterns.md) - Repository, Facade, Service Layer

#### Estructura del Proyecto

- [📁 Organización de Archivos](./architecture/file-organization.md) - Convenciones de carpetas y archivos
- [🔗 Gestión de Dependencias](./architecture/dependency-management.md) - Inyección y inversión de dependencias
- [📦 Módulos y Exportaciones](./architecture/modules-exports.md) - Índices y exportaciones limpias

### 💻 Desarrollo y Código

#### Estándares de Código

- [✨ Clean Code](./development/clean-code.md) - Principios y patrones de código limpio
- [🇪🇸 Nomenclatura en Español](./development/spanish-naming.md) - Convenciones de nombres en español
- [📝 Documentación de Código](./development/code-documentation.md) - JSDoc y comentarios útiles
- [🔍 Code Review](./development/code-review.md) - Proceso y checklist de revisión

#### TypeScript y React

- [⚡ TypeScript Avanzado](./development/typescript-advanced.md) - Tipos avanzados y patrones
- [⚛️ Patrones React](./development/react-patterns.md) - Hooks, componentes y estado
- [🎨 Componentes UI](./development/ui-components.md) - Creación de componentes reutilizables
- [🏪 Gestión de Estado](./development/state-management.md) - Zustand y patrones de estado

#### APIs y Servicios

- [🔌 Desarrollo de APIs](./development/api-development.md) - Next.js API routes y mejores prácticas
- [🌐 Integraciones Externas](./development/external-integrations.md) - Mercado Pago, EmailJS, SendGrid
- [📊 Manejo de Datos](./development/data-handling.md) - DTOs, validación y transformación
- [🚨 Manejo de Errores](./development/error-handling.md) - Errores tipados y propagación

### 🧪 Testing y Calidad

#### Estrategias de Testing

- [🧪 Testing Unitario](./testing/unit-testing.md) - Jest y React Testing Library
- [🔗 Testing de Integración](./testing/integration-testing.md) - APIs y flujos completos
- [🎭 Testing E2E](./testing/e2e-testing.md) - Playwright y casos de usuario
- [📊 Coverage y Métricas](./testing/coverage-metrics.md) - Medición de calidad

#### Herramientas de Calidad

- [🔍 ESLint y Prettier](./quality/linting-formatting.md) - Configuración y reglas personalizadas
- [🤖 Hooks Automáticos](./quality/automated-hooks.md) - Pre-commit y validaciones
- [📏 Métricas de Código](./quality/code-metrics.md) - Complejidad y mantenibilidad
- [🔒 Análisis de Seguridad](./quality/security-analysis.md) - Vulnerabilidades y mejores prácticas

### 🚀 Deployment y Producción

#### Configuración de Entornos

- [⚙️ Variables de Entorno](./deployment/environment-variables.md) - Configuración por ambiente
- [🏗️ Build y Optimización](./deployment/build-optimization.md) - Next.js y performance
- [🐳 Docker y Contenedores](./deployment/docker-containers.md) - Containerización del proyecto
- [☁️ Deployment en la Nube](./deployment/cloud-deployment.md) - Vercel, AWS, otros proveedores

#### Monitoreo y Mantenimiento

- [📊 Logging y Monitoreo](./deployment/logging-monitoring.md) - Structured logging y métricas
- [🚨 Alertas y Notificaciones](./deployment/alerts-notifications.md) - Sistemas de alerta
- [🔄 CI/CD Pipeline](./deployment/cicd-pipeline.md) - Automatización de deployment
- [📈 Performance Monitoring](./deployment/performance-monitoring.md) - APM y optimización

### 🤖 Automatización

#### Agent Hooks

- [🔧 Configuración de Hooks](./automation/hooks-configuration.md) - Setup y personalización
- [📝 Hooks de Documentación](./automation/documentation-hooks.md) - Generación automática
- [🧪 Hooks de Testing](./automation/testing-hooks.md) - Ejecución automática de tests
- [✨ Hooks de Formateo](./automation/formatting-hooks.md) - Prettier y ESLint automático

#### Agent Steering

- [🎯 Reglas de Steering](./automation/steering-rules.md) - Configuración y personalización
- [🏗️ Validación Arquitectónica](./automation/architecture-validation.md) - Reglas automáticas
- [📏 Estándares de Código](./automation/code-standards.md) - Enforcement automático
- [📚 Documentación Consistente](./automation/documentation-standards.md) - Formato y calidad

## 🎯 Flujos de Trabajo

### Desarrollo de Nuevas Funcionalidades

#### 1. Planificación

```bash
# Crear rama de feature
git checkout -b feature/nueva-funcionalidad

# Analizar requisitos
# - Definir casos de uso
# - Identificar módulos afectados
# - Planificar tests
```

#### 2. Implementación

```bash
# Seguir arquitectura hexagonal
# 1. Domain: Entidades y value objects
# 2. Application: Servicios y casos de uso
# 3. Infrastructure: Repositorios e implementaciones
# 4. Presentation: Componentes y hooks

# Ejecutar hooks automáticos
pnpm run hooks:validate
```

#### 3. Testing

```bash
# Tests unitarios
pnpm run test:unit

# Tests de integración
pnpm run test:integration

# Validar coverage
pnpm run test:coverage
```

#### 4. Documentación

```bash
# Generar documentación automática
pnpm run docs:generate

# Validar documentación
pnpm run docs:validate
```

#### 5. Review y Merge

```bash
# Code review checklist
# - Arquitectura respetada
# - Tests completos
# - Documentación actualizada
# - Performance validada

# Merge a main
git checkout main
git merge feature/nueva-funcionalidad
```

### Debugging y Resolución de Problemas

#### Herramientas de Debug

```bash
# Debug del servidor
pnpm run dev:debug

# Análisis de bundle
pnpm run analyze:bundle

# Logs estructurados
pnpm run logs:tail

# Performance profiling
pnpm run profile:performance
```

#### Problemas Comunes

- [🐛 Errores de TypeScript](./troubleshooting/typescript-errors.md)
- [⚛️ Problemas de React](./troubleshooting/react-issues.md)
- [🔌 Errores de API](./troubleshooting/api-errors.md)
- [🎨 Problemas de Styling](./troubleshooting/styling-issues.md)

## 📋 Checklists de Desarrollo

### Checklist de Nueva Funcionalidad

- [ ] **Arquitectura**
  - [ ] Módulo identificado correctamente
  - [ ] Capas hexagonales respetadas
  - [ ] Principios SOLID aplicados
  - [ ] Dependencias correctas

- [ ] **Código**
  - [ ] Nomenclatura en español para negocio
  - [ ] TypeScript estricto
  - [ ] Errores tipados específicos
  - [ ] Clean code aplicado

- [ ] **Testing**
  - [ ] Tests unitarios completos
  - [ ] Tests de integración
  - [ ] Coverage mínimo 80%
  - [ ] Tests de regresión

- [ ] **Documentación**
  - [ ] Componentes documentados
  - [ ] APIs documentadas
  - [ ] Ejemplos funcionales
  - [ ] Diagramas actualizados

### Checklist de Code Review

- [ ] **Funcionalidad**
  - [ ] Requisitos cumplidos
  - [ ] Casos edge manejados
  - [ ] Performance aceptable
  - [ ] Accesibilidad implementada

- [ ] **Código**
  - [ ] Legible y mantenible
  - [ ] Patrones consistentes
  - [ ] Sin duplicación
  - [ ] Errores manejados correctamente

- [ ] **Testing**
  - [ ] Tests pasan
  - [ ] Coverage adecuado
  - [ ] Tests significativos
  - [ ] Mocks apropiados

- [ ] **Documentación**
  - [ ] Código autodocumentado
  - [ ] Comentarios útiles
  - [ ] Documentación actualizada
  - [ ] Ejemplos claros

## 🛠️ Herramientas y Configuración

### Extensiones de VS Code Recomendadas

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### Configuración de Git

```bash
# Configurar hooks de Git
git config core.hooksPath .githooks

# Configurar usuario
git config user.name "Tu Nombre"
git config user.email "tu.email@ejemplo.com"

# Configurar editor
git config core.editor "code --wait"
```

### Scripts de Desarrollo

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "docs:generate": "node scripts/generate-docs.js",
    "hooks:validate": "node scripts/validate-hooks.js",
    "arch:validate": "node scripts/validate-architecture.js"
  }
}
```

## 📊 Métricas y KPIs

### Métricas de Desarrollo

- **Velocidad de desarrollo**: Features por sprint
- **Calidad de código**: Coverage, complejidad ciclomática
- **Bugs en producción**: Número y severidad
- **Tiempo de review**: Tiempo promedio de code review

### Métricas de Performance

- **Build time**: Tiempo de compilación
- **Bundle size**: Tamaño de bundles
- **Page load time**: Tiempo de carga de páginas
- **API response time**: Tiempo de respuesta de APIs

### Métricas de Calidad

- **Test coverage**: Porcentaje de cobertura
- **Documentation coverage**: Porcentaje documentado
- **Code duplication**: Porcentaje de duplicación
- **Technical debt**: Tiempo estimado de deuda técnica

## 🎓 Recursos de Aprendizaje

### Documentación Oficial

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Libros Recomendados

- "Clean Code" by Robert C. Martin
- "Clean Architecture" by Robert C. Martin
- "Domain-Driven Design" by Eric Evans
- "Refactoring" by Martin Fowler

### Cursos y Tutoriales

- [React Patterns](https://reactpatterns.com/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Testing JavaScript](https://testingjavascript.com/)
- [Next.js Learn](https://nextjs.org/learn)

## 🤝 Contribución y Comunidad

### Proceso de Contribución

1. **Fork** del repositorio
2. **Crear rama** para la funcionalidad
3. **Implementar** siguiendo las guías
4. **Testing** completo
5. **Documentar** cambios
6. **Pull Request** con descripción detallada

### Comunicación

- **Issues**: Para bugs y mejoras
- **Discussions**: Para preguntas y propuestas
- **Wiki**: Para documentación colaborativa
- **Code Reviews**: Para feedback constructivo

### Estándares de la Comunidad

- **Respeto**: Comunicación respetuosa y constructiva
- **Calidad**: Código de alta calidad y bien documentado
- **Colaboración**: Trabajo en equipo y ayuda mutua
- **Aprendizaje**: Compartir conocimiento y mejores prácticas

---

*Guías actualizadas automáticamente - Última actualización: 2024-12-19*  
*Guías disponibles: 40+ | Cobertura de temas: 100%*
