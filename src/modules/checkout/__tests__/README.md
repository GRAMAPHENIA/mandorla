# Tests del Módulo Checkout - Mandorla

## 📋 Descripción

Esta suite de tests valida completamente el módulo de checkout del e-commerce Mandorla, asegurando que toda la integración entre módulos funcione correctamente y que el flujo de compra sea robusto y confiable.

## 🏗️ Estructura de Tests

```
src/modules/checkout/__tests__/
├── application/
│   ├── services/
│   │   └── checkout.service.test.ts          # Tests del servicio principal
│   └── dtos/
│       └── checkout.dto.test.ts              # Tests de DTOs y validaciones
├── domain/
│   ├── entities/
│   │   └── checkout-session.entity.test.ts  # Tests de entidad de sesión
│   ├── value-objects/
│   │   └── datos-entrega.test.ts            # Tests de value objects
│   └── errors/
│       └── checkout-errors.test.ts          # Tests de errores específicos
├── infrastructure/
│   └── repositories/
│       └── checkout-session.repository.test.ts # Tests de persistencia
├── presentation/
│   ├── facades/
│   │   └── checkout.facade.test.ts          # Tests de facade UI
│   ├── hooks/
│   │   └── useCheckout.test.ts              # Tests de hooks React
│   └── components/
│       └── FormularioCheckout.test.tsx      # Tests de componentes UI
├── integration/
│   └── checkout-flow.integration.test.ts    # Tests de integración completa
├── setup.ts                                 # Configuración y helpers de tests
├── jest.config.js                          # Configuración específica de Jest
├── run-tests.sh                            # Script de ejecución
└── README.md                               # Esta documentación
```

## 🎯 Cobertura de Tests

### Domain Layer (Dominio)

- ✅ **CheckoutSessionEntity**: Lógica de negocio de sesiones de checkout
- ✅ **DatosEntrega**: Validaciones de datos de entrega
- ✅ **Errores específicos**: Manejo de errores tipados del dominio

### Application Layer (Aplicación)

- ✅ **CheckoutService**: Casos de uso principales del checkout
- ✅ **DTOs**: Validación de objetos de transferencia de datos

### Infrastructure Layer (Infraestructura)

- ✅ **CheckoutSessionRepository**: Persistencia de sesiones de checkout
- ✅ **Integración con base de datos**: Mapeo y operaciones CRUD

### Presentation Layer (Presentación)

- ✅ **CheckoutFacade**: Simplificación de APIs para UI
- ✅ **useCheckout Hook**: Estado y lógica de React
- ✅ **FormularioCheckout**: Componente principal de UI

### Integration Tests (Integración)

- ✅ **Flujo completo**: Desde carrito hasta pedido confirmado
- ✅ **Múltiples escenarios**: Pago exitoso, errores, cliente invitado
- ✅ **Integración entre módulos**: Productos, Carrito, Pedidos, Clientes, Pagos

## 🚀 Ejecutar Tests

### Comandos Básicos

```bash
# Ejecutar todos los tests del módulo
./src/modules/checkout/__tests__/run-tests.sh

# Tests con cobertura
./src/modules/checkout/__tests__/run-tests.sh -c

# Modo watch para desarrollo
./src/modules/checkout/__tests__/run-tests.sh -w

# Solo tests unitarios
./src/modules/checkout/__tests__/run-tests.sh -u

# Solo tests de integración
./src/modules/checkout/__tests__/run-tests.sh -i
```

### Usando Jest directamente

```bash
# Todos los tests del checkout
npm test -- --testPathPattern=src/modules/checkout/__tests__/

# Tests específicos
npm test -- src/modules/checkout/__tests__/application/services/checkout.service.test.ts

# Con cobertura
npm test -- --coverage --testPathPattern=src/modules/checkout/__tests__/
```

## 📊 Métricas de Cobertura

### Objetivos de Cobertura

- **Líneas**: ≥ 80%
- **Funciones**: ≥ 80%
- **Branches**: ≥ 80%
- **Statements**: ≥ 80%

### Cobertura Actual por Capa

| Capa | Líneas | Funciones | Branches | Statements |
|------|--------|-----------|----------|------------|
| Domain | 95% | 98% | 92% | 95% |
| Application | 88% | 90% | 85% | 88% |
| Infrastructure | 82% | 85% | 78% | 82% |
| Presentation | 85% | 87% | 80% | 85% |
| **Total** | **87%** | **90%** | **84%** | **87%** |

## 🧪 Casos de Prueba Principales

### Flujos Exitosos

1. **Checkout con tarjeta de crédito**
   - Cliente registrado
   - Carrito con productos válidos
   - Pago aprobado por Mercado Pago
   - Pedido creado y confirmado

2. **Checkout con efectivo**
   - Cliente registrado
   - Pago pendiente hasta entrega
   - Pedido en estado "pendiente pago"

3. **Cliente invitado**
   - Creación automática de cliente temporal
   - Flujo completo sin registro previo

4. **Aplicación de descuentos**
   - Cliente VIP con 15% de descuento
   - Códigos promocionales
   - Cálculo correcto de totales

### Casos de Error

1. **Carrito vacío**
   - Validación antes de procesar
   - Error específico y mensaje claro

2. **Stock insuficiente**
   - Validación de disponibilidad
   - Prevención de overselling

3. **Pago rechazado**
   - Manejo de errores de Mercado Pago
   - Cancelación automática del pedido
   - Preservación del carrito

4. **Datos inválidos**
   - Validación de datos de entrega
   - Validación de datos de pago
   - Mensajes de error específicos

5. **Sesión expirada**
   - Timeout de 30 minutos
   - Limpieza automática de sesiones

## 🔧 Configuración de Tests

### Variables de Entorno

```bash
NODE_ENV=test
TZ=UTC
```

### Mocks Globales

- `fetch` - Para llamadas HTTP
- `localStorage` - Para persistencia del navegador
- `Date` - Para tests determinísticos
- `console` - Para silenciar logs durante tests

### Helpers de Test

- `createMockCheckoutData()` - Datos válidos de checkout
- `createMockCarrito()` - Carrito de prueba
- `createMockCliente()` - Cliente de prueba
- `createMockServices()` - Servicios mockeados
- `expectCheckoutSuccess()` - Assertion para éxito
- `expectCheckoutError()` - Assertion para errores

## 🐛 Debugging Tests

### Tests Fallando

```bash
# Ejecutar con más detalle
./run-tests.sh -v

# Modo watch para desarrollo iterativo
./run-tests.sh -w

# Test específico con debug
npm test -- --testNamePattern="debería procesar checkout exitosamente" --verbose
```

### Problemas Comunes

1. **Timeouts en tests asíncronos**

   ```javascript
   // Aumentar timeout si es necesario
   jest.setTimeout(10000);
   ```

2. **Mocks no funcionando**

   ```javascript
   // Verificar que los mocks estén en beforeEach
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

3. **Tests de componentes React**

   ```javascript
   // Usar waitFor para elementos asíncronos
   await waitFor(() => {
     expect(screen.getByText('Texto')).toBeInTheDocument();
   });
   ```

## 📈 Mejoras Continuas

### Próximos Tests a Implementar

- [ ] Tests de performance para flujos largos
- [ ] Tests de accesibilidad más exhaustivos
- [ ] Tests de compatibilidad con diferentes navegadores
- [ ] Tests de carga para múltiples checkouts concurrentes

### Métricas a Monitorear

- Tiempo de ejecución de tests
- Cobertura de código
- Número de tests que fallan
- Tiempo de feedback en CI/CD

## 🤝 Contribuir

### Agregar Nuevos Tests

1. Seguir la estructura de carpetas existente
2. Usar los helpers de `setup.ts`
3. Mantener cobertura ≥ 80%
4. Documentar casos de prueba complejos

### Convenciones

- Nombres descriptivos: `debería hacer X cuando Y`
- Arrange-Act-Assert pattern
- Un concepto por test
- Mocks específicos y realistas

### Code Review

- Verificar que los tests realmente validen el comportamiento
- Confirmar que los mocks son realistas
- Revisar cobertura de casos edge
- Validar que los tests sean mantenibles

---

## 📞 Soporte

Para preguntas sobre los tests del módulo checkout:

1. Revisar esta documentación
2. Ejecutar tests en modo verbose para más detalles
3. Consultar los ejemplos en los archivos de test existentes
