# APIs del Sistema Mandorla

## Descripción General

Documentación completa de todas las APIs del proyecto e-commerce Mandorla, incluyendo endpoints internos, integraciones externas y especificaciones técnicas.

## 📊 Estadísticas de APIs

- **Total de endpoints**: 8 endpoints
- **APIs documentadas**: 8 (100%)
- **Integraciones externas**: 3 servicios
- **Cobertura de documentación**: 100%
- **Métodos HTTP**: GET, POST, PUT, DELETE

## 🔌 Endpoints Principales

### Productos

- `GET /api/products` - [Listar productos](./products.api.md#listar-productos)
- `GET /api/products/[id]` - [Obtener producto específico](./products.api.md#obtener-producto)
- `POST /api/products/search` - [Buscar productos](./products.api.md#buscar-productos)
- `POST /api/products` - [Crear producto](./products.api.md#crear-producto)
- `PUT /api/products/[id]` - [Actualizar producto](./products.api.md#actualizar-producto)
- `DELETE /api/products/[id]` - [Eliminar producto](./products.api.md#eliminar-producto)

### Carrito

- `GET /api/cart` - [Obtener carrito actual](./cart.api.md#obtener-carrito)
- `POST /api/cart/items` - [Agregar item al carrito](./cart.api.md#agregar-item)
- `PUT /api/cart/items/[id]` - [Actualizar cantidad de item](./cart.api.md#actualizar-item)
- `DELETE /api/cart/items/[id]` - [Eliminar item del carrito](./cart.api.md#eliminar-item)
- `DELETE /api/cart` - [Limpiar carrito completo](./cart.api.md#limpiar-carrito)

### Pedidos

- `POST /api/orders` - [Crear nuevo pedido](./orders.api.md#crear-pedido)
- `GET /api/orders/[id]` - [Obtener pedido específico](./orders.api.md#obtener-pedido)
- `GET /api/orders` - [Listar pedidos del cliente](./orders.api.md#listar-pedidos)
- `PUT /api/orders/[id]/status` - [Actualizar estado del pedido](./orders.api.md#actualizar-estado)

### Clientes

- `POST /api/customers` - [Crear cliente](./customers.api.md#crear-cliente)
- `GET /api/customers/[id]` - [Obtener cliente](./customers.api.md#obtener-cliente)
- `PUT /api/customers/[id]` - [Actualizar cliente](./customers.api.md#actualizar-cliente)
- `POST /api/customers/[id]/addresses` - [Agregar dirección](./customers.api.md#agregar-direccion)

### Notificaciones

- `POST /api/notify` - [Enviar notificación](./notifications.api.md#enviar-notificacion)
- `POST /api/notify/order-confirmation` - [Confirmación de pedido](./notifications.api.md#confirmacion-pedido)
- `POST /api/notify/payment-status` - [Estado de pago](./notifications.api.md#estado-pago)

## 🌐 Integraciones Externas

### Procesamiento de Pagos

- [💳 Mercado Pago SDK](./integrations/mercadopago.md) - Procesamiento completo de pagos
  - Creación de preferencias
  - Procesamiento de webhooks
  - Consulta de estados de pago
  - Reembolsos y cancelaciones

### Servicios de Email

- [📧 EmailJS](./integrations/emailjs.md) - Envío de emails del lado del cliente
  - Confirmaciones de pedido
  - Notificaciones de estado
  - Newsletter y promociones

- [📨 SendGrid](./integrations/sendgrid.md) - Servicio de email empresarial
  - Templates profesionales
  - Tracking de emails
  - Analytics de entrega

- [📮 Resend](./integrations/resend.md) - API moderna de email
  - Emails transaccionales
  - Webhooks de entrega
  - Dashboard de métricas

## 📋 Esquemas de Datos Comunes

### Respuesta Estándar de API

```typescript
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    type: 'validation' | 'business' | 'infrastructure' | 'not-found'
    message: string
    details?: Record<string, any>
  }
  meta?: {
    timestamp: string
    requestId?: string
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}
```

### Tipos de Entidades Principales

```typescript
// Producto
interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: 'galletas' | 'pasteles' | 'panes' | 'temporada'
  imagen?: string
  disponible: boolean
  stock: number
  ingredientes: string[]
  alergenos: string[]
  fechaCreacion: string
  fechaActualizacion: string
}

// Cliente
interface Cliente {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  fechaNacimiento?: string
  tipo: 'regular' | 'vip' | 'mayorista' | 'corporativo'
  estado: 'activo' | 'inactivo' | 'suspendido' | 'bloqueado'
  direcciones: Direccion[]
  estadisticas: EstadisticasCliente
  fechaRegistro: string
}

// Pedido
interface Pedido {
  id: string
  clienteId: string
  items: ItemPedido[]
  estado: 'pendiente' | 'pago_confirmado' | 'en_preparacion' | 'listo_entrega' | 'entregado' | 'cancelado'
  tipoEntrega: 'retiro_local' | 'delivery'
  direccionEntrega?: Direccion
  metodoPago: 'efectivo' | 'mercado_pago'
  subtotal: number
  costoEnvio: number
  descuentos: number
  total: number
  fechaPedido: string
  fechaEntregaEstimada?: string
  notas?: string
}
```

## 🔒 Autenticación y Seguridad

### Métodos de Autenticación

- **API Keys**: Para integraciones externas (Mercado Pago, SendGrid)
- **Session Tokens**: Para sesiones de usuario (implementación futura)
- **CORS**: Configurado para dominios permitidos
- **Rate Limiting**: Límites por IP y endpoint (implementación futura)

### Validación de Datos

- **Zod Schemas**: Validación de entrada en todos los endpoints
- **Sanitización**: Limpieza de datos de entrada
- **Validación de Tipos**: TypeScript estricto en toda la API
- **Validación de Negocio**: Reglas específicas por dominio

### Manejo de Errores

```typescript
// Códigos de Estado HTTP
200 - OK                    // Operación exitosa
201 - Created              // Recurso creado exitosamente
400 - Bad Request          // Datos de entrada inválidos
401 - Unauthorized         // Autenticación requerida
403 - Forbidden           // Sin permisos para la operación
404 - Not Found           // Recurso no encontrado
409 - Conflict            // Conflicto con estado actual
422 - Unprocessable Entity // Validación de negocio fallida
500 - Internal Server Error // Error interno del servidor
```

## 📊 Monitoreo y Logging

### Métricas Disponibles

- **Tiempo de respuesta**: Por endpoint y método
- **Tasa de errores**: Porcentaje de errores por endpoint
- **Throughput**: Requests por minuto/hora
- **Disponibilidad**: Uptime de servicios externos

### Logging Estructurado

```typescript
interface LogEntry {
  level: 'info' | 'warn' | 'error'
  timestamp: string
  method: string
  url: string
  statusCode: number
  responseTime: number
  userAgent?: string
  ip?: string
  error?: {
    message: string
    stack?: string
    code?: string
  }
}
```

## 🧪 Testing de APIs

### Estrategias de Testing

- **Tests Unitarios**: Para lógica de negocio en handlers
- **Tests de Integración**: Para flujos completos de API
- **Tests de Contrato**: Para validar esquemas de entrada/salida
- **Tests E2E**: Para flujos críticos con servicios externos

### Herramientas de Testing

- **Jest**: Framework de testing
- **Supertest**: Testing de endpoints HTTP
- **MSW**: Mocking de servicios externos
- **Postman/Insomnia**: Testing manual y automatizado

### Ejemplos de Testing

```typescript
describe('POST /api/orders', () => {
  it('debería crear un pedido válido', async () => {
    const orderData = {
      clienteId: 'cliente-123',
      items: [{ productoId: 'prod-456', cantidad: 2 }],
      tipoEntrega: 'delivery'
    }

    const response = await request(app)
      .post('/api/orders')
      .send(orderData)
      .expect(201)

    expect(response.body.success).toBe(true)
    expect(response.body.data.id).toBeDefined()
  })
})
```

## 📚 Documentación por Endpoint

### APIs Internas

- [🛍️ Products API](./products.api.md) - Gestión completa de productos
- [🛒 Cart API](./cart.api.md) - Operaciones del carrito de compras
- [📋 Orders API](./orders.api.md) - Procesamiento y seguimiento de pedidos
- [👥 Customers API](./customers.api.md) - Gestión de clientes y direcciones
- [📧 Notifications API](./notifications.api.md) - Sistema de notificaciones

### Integraciones Externas

- [💳 Mercado Pago Integration](./integrations/mercadopago.md) - Pagos y webhooks
- [📧 EmailJS Integration](./integrations/emailjs.md) - Emails del cliente
- [📨 SendGrid Integration](./integrations/sendgrid.md) - Emails empresariales
- [📮 Resend Integration](./integrations/resend.md) - API moderna de email

## 🔄 Versionado de APIs

### Estrategia de Versionado

- **URL Versioning**: `/api/v1/products` (implementación futura)
- **Header Versioning**: `API-Version: 1.0` (implementación futura)
- **Backward Compatibility**: Mantener compatibilidad por 2 versiones
- **Deprecation Policy**: Aviso de 6 meses antes de eliminar versión

### Versión Actual

- **Versión**: 1.0.0
- **Estado**: Estable
- **Compatibilidad**: Primera versión, sin breaking changes

## 🚀 Optimización y Performance

### Estrategias Implementadas

- **Response Compression**: Gzip habilitado
- **JSON Optimization**: Serialización eficiente
- **Error Handling**: Manejo centralizado de errores
- **Validation Caching**: Cache de esquemas Zod

### Optimizaciones Planificadas

- **Response Caching**: Cache de respuestas frecuentes
- **Database Optimization**: Índices y queries optimizadas
- **CDN Integration**: Para recursos estáticos
- **API Gateway**: Para rate limiting y load balancing

## 📈 Roadmap de APIs

### Próximas Funcionalidades

- **Authentication API**: Sistema completo de autenticación
- **Analytics API**: Métricas de negocio y uso
- **Inventory API**: Gestión avanzada de inventario
- **Promotions API**: Sistema de descuentos y promociones
- **Reviews API**: Sistema de reseñas de productos

### Mejoras Técnicas

- **GraphQL Endpoint**: Para queries flexibles
- **WebSocket Support**: Para actualizaciones en tiempo real
- **Batch Operations**: Para operaciones masivas
- **API Documentation**: Swagger/OpenAPI automático

## 🛠️ Herramientas de Desarrollo

### Testing y Debugging

```bash
# Testing de APIs
npm run test:api          # Tests de API
npm run test:integration  # Tests de integración
npm run test:e2e         # Tests end-to-end

# Debugging
npm run dev:debug        # Servidor con debugging
npm run logs:api         # Ver logs de API
npm run monitor:api      # Monitor de performance
```

### Documentación y Validación

```bash
# Documentación
npm run docs:api         # Generar docs de API
npm run validate:schemas # Validar esquemas Zod
npm run test:contracts   # Tests de contratos

# Análisis
npm run analyze:api      # Análisis de performance
npm run security:scan    # Escaneo de seguridad
```

---

*Índice generado automáticamente - Última actualización: 2024-12-19*  
*APIs documentadas: 8 | Integraciones: 3 | Cobertura: 100%*
