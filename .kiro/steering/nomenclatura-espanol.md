# Reglas de Nomenclatura en Español - Proyecto Mandorla

## Propósito

Estas reglas aseguran que todo el código generado siga convenciones consistentes de nomenclatura en español para variables de negocio, manteniendo claridad y coherencia en el proyecto e-commerce de Mandorla.

## Reglas de Nomenclatura por Tipo

### Componentes React

- **Formato**: PascalCase con nombres descriptivos en español
- **Ejemplos válidos**:
  - `ListaProductos` - para mostrar lista de productos
  - `FormularioCliente` - para formularios de datos del cliente
  - `BotonAgregarCarrito` - para botón de agregar al carrito
  - `TarjetaProducto` - para tarjeta individual de producto
  - `ResumenPedido` - para resumen del pedido

- **Ejemplos inválidos**:
  - `ProductList` - usar `ListaProductos`
  - `ClientForm` - usar `FormularioCliente`
  - `add_to_cart_btn` - usar `BotonAgregarCarrito`

### Variables de Negocio

- **Formato**: camelCase con nombres en español
- **Ejemplos válidos**:
  - `precioTotal` - precio total del pedido
  - `cantidadProductos` - cantidad de productos
  - `datosCliente` - información del cliente
  - `fechaEntrega` - fecha de entrega del pedido
  - `estadoPedido` - estado actual del pedido
  - `categoriaProducto` - categoría del producto

- **Ejemplos inválidos**:
  - `totalPrice` - usar español `precioTotal`
  - `product_count` - usar camelCase `cantidadProductos`
  - `customerData` - usar español `datosCliente`

### Funciones y Métodos

- **Formato**: camelCase con verbos descriptivos en español
- **Ejemplos válidos**:
  - `calcularPrecioTotal()` - calcular precio total
  - `agregarAlCarrito()` - agregar producto al carrito
  - `validarFormulario()` - validar datos del formulario
  - `obtenerProductos()` - obtener listas de productos
  - `procesarPedido()` - procesar un pedido
  - `enviarNotificacion()` - enviar notificación

- **Ejemplos inválidos**:
  - `calculateTotal()` - usar español `calcularPrecioTotal()`
  - `addToCart()` - usar español `agregarAlCarrito()`
  - `validateForm()` - usar español `validarFormulario()`

### Tipos TypeScript e Interfaces

- **Formato**: PascalCase con sufijo descriptivo
- **Ejemplos válidos**:
  - `ProductoInterface` - interfaz para producto
  - `ClienteType` - tipo para cliente
  - `PedidoEntity` - entidad para pedido
  - `CarritoState` - estado del carrito
  - `EstadoPedido` - enum para estado de pedido

- **Ejemplos inválidos**:
  - `ProductInterface` - usar español `ProductoInterface`
  - `CustomerType` - usar español `ClienteType`

### Archivos y Carpetas

- **Componentes**: Mismo nombre que el componente
  - `ListaProductos.tsx`
  - `FormularioCliente.tsx`
  - `BotonAgregarCarrito.tsx`

- **Utilidades**: kebab-case en español
  - `validaciones-formulario.ts`
  - `utilidades-precio.ts`
  - `helpers-fecha.ts`

- **Módulos**: kebab-case en español
  - `modulos/productos/`
  - `modulos/carrito/`
  - `modulos/pedidos/`
  - `modulos/clientes/`

## Excepciones Permitidas

### APIs y Librerías Externas

- Mantener nombres originales para mantener consistencia
- Props de React: `useState`, `useEffect`
- Nombres de librerías: `onClick`, `onChange`
- Campos de base de datos establecidos: `id`, `email`, `url`

### Constantes Globales

- **Formato**: UPPER_SNAKE_CASE
- **Ejemplos**:
  - `API_BASE_URL`
  - `MAX_PRODUCTOS_CARRITO`
  - `TIEMPO_EXPIRACION_SESION`

### Nombres Técnicos Establecidos

- Mantener nombres técnicos cuando sean estándares
- Campos de datos: `id`, `email`, `url`
- Nombres de eventos DOM: `onClick`, `onChange`

## Reglas Específicas por Dominio

### Módulo de Productos

```typescript
// ✅ Correcto
interface ProductoInterface {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: CategoriaProducto;
  disponible: boolean;
  fechaCreacion: Date;
}

function obtenerProductosPorCategoria(categoria: string): Producto[] {
  // implementación
}

const precioConDescuento = calcularDescuento(precioOriginal, porcentajeDescuento);
```

### Módulo de Carrito

```typescript
// ✅ Correcto
interface CarritoInterface {
  id: string;
  productos: Producto[];
  precioTotal: number;
  cantidadItems: number;
  fechaCreacion: Date;
}

function agregarProductoAlCarrito(producto: Producto, cantidad: number): void {
  // implementación
}

const totalConImpuestos = calcularTotalConImpuestos(subtotal, impuestos);
```

### Módulo de Pedidos

```typescript
// ✅ Correcto
interface PedidoInterface {
  id: string;
  cliente: Cliente;
  productos: ProductoPedido[];
  estadoPedido: EstadoPedido;
  fechaPedido: Date;
  fechaEntrega?: Date;
}

enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  PROCESANDO = 'PROCESANDO',
  ENVIADO = 'ENVIADO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO'
}

function crearNuevoPedido(datosPedido: DatosPedido): Pedido {
  // implementación
}
```

## Validaciones Automáticas

### Patrones a Detectar

- Variables en inglés que deberían estar en español
- Funciones que no siguen PascalCase
- Componentes que no usan verbos descriptivos

### Sugerencias Automáticas

Cuando se detecte nomenclatura incorrecta, sugerir:

1. La versión correcta en español
2. Explicación del patrón a seguir
3. Ejemplo de refactorización

### Reglas de ESLint (Conceptuales)

```javascript
// Reglas que se podrían implementar
{
  rules: {
    'mandorla/spanish-business-variables': 'error',
    'mandorla/component-naming-spanish': 'error',
    'mandorla/function-naming-spanish': 'error'
  }
}
```

## Herramientas de Validación

### Búsquedas de Patrones

- Detectar variables comunes en inglés: `price`, `total`, `customer`, `product`
- Sugerir equivalentes en español: `precio`, `total`, `cliente`, `producto`

### Ejemplos de Refactorización

**Antes (Incorrecto):**

```typescript
const ProductCard = ({ product }: { product: Product }) => {
  const totalPrice = product.price * qty;
  
  function addToCart(product: Product, qty: number) {
    // ...
  }

  return <div>{product.name}</div>;
};
```

**Después (Correcto):**

```typescript
const TarjetaProducto = ({ producto }: { producto: ProductoInterface }) => {
  const precioTotal = producto.precio * cantidad;
  
  function agregarAlCarrito(producto: ProductoInterface, cantidad: number) {
    // ...
  }

  return <div>{producto.nombre}</div>;
};
```

## Aplicación de Reglas

### Durante Desarrollo

- Aplicar reglas al crear componentes nuevos
- Sugerir mejoras en code reviews
- Validar nomenclatura durante refactoring

### Durante Reviews

- Priorizar variables de negocio para traducir
- Mantener consistencia en módulos relacionados
- Actualizar documentación al realizar cambios

### Excepciones Aprobadas

- Mantener nombres originales cuando corresponda
- Documentar excepciones y por qué se mantienen
- Revisar periódicamente excepciones para justificar

## Beneficios

### Para el Equipo

- Código más legible para desarrolladores hispanohablantes
- Mejor comprensión del dominio de negocio
- Consistencia en toda la aplicación

### Para el Proyecto

- Mejor trazabilidad de funcionalidades de negocio
- Documentación más intuitiva
- Menor curva de aprendizaje para nuevos desarrolladores

### Para Mantenimiento

- Más fácil debugging
- Mejor alineación con el contexto de negocio (panadería)
- Mejores percepciones de calidad del código
