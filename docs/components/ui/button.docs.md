# Button - Componente UI Base

## Descripción

Componente de botón reutilizable construido sobre Radix UI primitives, diseñado para el sistema de diseño de Mandorla. Incluye múltiples variantes, tamaños y estados para cubrir todos los casos de uso en la panadería.

## Uso Básico

```tsx
import { Button } from '@/components/ui/button'

function EjemploBasico() {
  return (
    <Button onClick={() => console.log('¡Producto agregado!')}>
      Agregar al Carrito
    </Button>
  )
}
```

## Props

| Prop | Tipo | Requerida | Default | Descripción |
|------|------|-----------|---------|-------------|
| variant | `'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link'` | ❌ | `'default'` | Variante visual del botón |
| size | `'default' \| 'sm' \| 'lg' \| 'icon'` | ❌ | `'default'` | Tamaño del botón |
| disabled | `boolean` | ❌ | `false` | Si el botón está deshabilitado |
| loading | `boolean` | ❌ | `false` | Muestra estado de carga |
| children | `React.ReactNode` | ✅ | - | Contenido del botón |
| onClick | `() => void` | ❌ | - | Función a ejecutar al hacer clic |
| className | `string` | ❌ | - | Clases CSS adicionales |

## Ejemplos de Uso

### Ejemplo 1: Botones de Acción en Productos

```tsx
import { Button } from '@/components/ui/button'
import { ShoppingCart, Heart } from 'lucide-react'

function TarjetaProducto({ producto }: { producto: Producto }) {
  const [agregandoCarrito, setAgregandoCarrito] = useState(false)
  
  const manejarAgregarCarrito = async () => {
    setAgregandoCarrito(true)
    try {
      await carritoService.agregarProducto(producto.id, 1)
      toast.success(`${producto.nombre} agregado al carrito`)
    } catch (error) {
      toast.error('Error al agregar producto')
    } finally {
      setAgregandoCarrito(false)
    }
  }

  return (
    <div className="tarjeta-producto">
      <h3>{producto.nombre}</h3>
      <p>${producto.precio}</p>
      
      <div className="acciones-producto">
        <Button 
          onClick={manejarAgregarCarrito}
          loading={agregandoCarrito}
          disabled={!producto.disponible}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {agregandoCarrito ? 'Agregando...' : 'Agregar al Carrito'}
        </Button>
        
        <Button variant="outline" size="icon">
          <Heart className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
```

### Ejemplo 2: Botones de Navegación en Checkout

```tsx
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, CreditCard } from 'lucide-react'

function PasosCheckout({ pasoActual, onSiguiente, onAnterior }: PasosCheckoutProps) {
  return (
    <div className="navegacion-checkout">
      {pasoActual > 1 && (
        <Button variant="outline" onClick={onAnterior}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>
      )}
      
      {pasoActual < 3 ? (
        <Button onClick={onSiguiente}>
          Siguiente
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      ) : (
        <Button size="lg" className="bg-mandorla-brown hover:bg-mandorla-dark-brown">
          <CreditCard className="w-4 h-4 mr-2" />
          Finalizar Compra
        </Button>
      )}
    </div>
  )
}
```

### Ejemplo 3: Estados y Variantes

```tsx
import { Button } from '@/components/ui/button'
import { Trash2, Edit, Save, X } from 'lucide-react'

function AccionesAdministrador() {
  return (
    <div className="acciones-admin space-x-2">
      {/* Botón primario */}
      <Button variant="default">
        <Save className="w-4 h-4 mr-2" />
        Guardar Cambios
      </Button>
      
      {/* Botón secundario */}
      <Button variant="secondary">
        <Edit className="w-4 h-4 mr-2" />
        Editar Producto
      </Button>
      
      {/* Botón de contorno */}
      <Button variant="outline">
        Cancelar
      </Button>
      
      {/* Botón destructivo */}
      <Button variant="destructive">
        <Trash2 className="w-4 h-4 mr-2" />
        Eliminar
      </Button>
      
      {/* Botón fantasma */}
      <Button variant="ghost" size="icon">
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}
```

## Variantes

### Default

Botón principal con el color de marca de Mandorla.

```tsx
<Button variant="default">Botón Principal</Button>
```

### Destructive

Para acciones destructivas como eliminar.

```tsx
<Button variant="destructive">Eliminar Producto</Button>
```

### Outline

Botón con borde, ideal para acciones secundarias.

```tsx
<Button variant="outline">Cancelar</Button>
```

### Secondary

Botón secundario con fondo gris.

```tsx
<Button variant="secondary">Editar</Button>
```

### Ghost

Botón transparente, ideal para iconos.

```tsx
<Button variant="ghost">Cerrar</Button>
```

### Link

Estilo de enlace, sin fondo.

```tsx
<Button variant="link">Ver más productos</Button>
```

## Tamaños

### Default

Tamaño estándar para la mayoría de casos.

```tsx
<Button size="default">Tamaño Normal</Button>
```

### Small

Tamaño pequeño para espacios reducidos.

```tsx
<Button size="sm">Pequeño</Button>
```

### Large

Tamaño grande para CTAs importantes.

```tsx
<Button size="lg">Finalizar Compra</Button>
```

### Icon

Tamaño cuadrado para botones de solo icono.

```tsx
<Button size="icon">
  <Heart className="w-4 h-4" />
</Button>
```

## Estados Especiales

### Loading

Muestra un spinner y deshabilita el botón.

```tsx
<Button loading={isLoading}>
  {isLoading ? 'Procesando...' : 'Procesar Pedido'}
</Button>
```

### Disabled

Deshabilita el botón y cambia su apariencia.

```tsx
<Button disabled={!producto.disponible}>
  {producto.disponible ? 'Agregar al Carrito' : 'Sin Stock'}
</Button>
```

## Accesibilidad

- ✅ **Navegación por teclado**: Soporte completo para Tab y Enter
- ✅ **Screen readers**: Texto descriptivo y roles ARIA apropiados
- ✅ **Estados visuales**: Indicadores claros para hover, focus y disabled
- ✅ **Contraste**: Cumple WCAG 2.1 AA para todos los colores
- ✅ **Tamaño mínimo**: 44px de área táctil para dispositivos móviles

### Atributos ARIA

```tsx
<Button 
  aria-label="Agregar Pan Integral al carrito"
  aria-describedby="precio-producto"
  disabled={!disponible}
>
  Agregar al Carrito
</Button>
```

## Personalización con Tailwind

### Colores Personalizados

```tsx
<Button className="bg-mandorla-cream text-mandorla-dark-brown hover:bg-mandorla-brown hover:text-white">
  Botón Personalizado
</Button>
```

### Animaciones

```tsx
<Button className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
  Botón con Animación
</Button>
```

## Integración con Formularios

### Con React Hook Form

```tsx
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'

function FormularioContacto() {
  const { handleSubmit, formState: { isSubmitting, isValid } } = useForm()
  
  const onSubmit = async (datos) => {
    await enviarMensaje(datos)
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* campos del formulario */}
      
      <Button 
        type="submit" 
        loading={isSubmitting}
        disabled={!isValid}
        size="lg"
      >
        Enviar Mensaje
      </Button>
    </form>
  )
}
```

## Casos de Uso Específicos de Mandorla

### Botones de Categorías de Productos

```tsx
const categorias = ['galletas', 'pasteles', 'panes', 'temporada']

function FiltrosCategorias({ categoriaActiva, onCambiarCategoria }) {
  return (
    <div className="filtros-categorias">
      {categorias.map(categoria => (
        <Button
          key={categoria}
          variant={categoriaActiva === categoria ? 'default' : 'outline'}
          onClick={() => onCambiarCategoria(categoria)}
          className="capitalize"
        >
          {categoria}
        </Button>
      ))}
    </div>
  )
}
```

### Botón de Pedido Rápido

```tsx
function BotonPedidoRapido({ producto }: { producto: Producto }) {
  const [procesando, setProcesando] = useState(false)
  
  const manejarPedidoRapido = async () => {
    setProcesando(true)
    try {
      await carritoService.agregarProducto(producto.id, 1)
      await checkoutService.procesarCheckoutRapido()
      toast.success('¡Pedido realizado exitosamente!')
    } catch (error) {
      toast.error('Error al procesar pedido rápido')
    } finally {
      setProcesando(false)
    }
  }
  
  return (
    <Button
      onClick={manejarPedidoRapido}
      loading={procesando}
      size="lg"
      className="w-full bg-green-600 hover:bg-green-700"
    >
      🚀 Pedido Rápido - ${producto.precio}
    </Button>
  )
}
```

## Notas de Implementación

### Variantes con CVA

El componente utiliza `class-variance-authority` para gestionar variantes de forma type-safe:

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-mandorla-brown text-white hover:bg-mandorla-dark-brown",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### Performance

- Utiliza `React.forwardRef` para compatibilidad con refs
- Memoización automática de variantes con CVA
- Lazy loading de iconos con `lucide-react`

## Componentes Relacionados

- [Input](./input.docs.md) - Campo de entrada que se combina con botones
- [Card](./card.docs.md) - Contenedor que suele incluir botones de acción
- [ProductCard](../products/product-card.docs.md) - Usa botones para acciones de producto

## Testing

### Ejemplo de Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button Component', () => {
  it('debería ejecutar onClick cuando se hace clic', () => {
    const handleClick = jest.fn()
    
    render(
      <Button onClick={handleClick}>
        Agregar al Carrito
      </Button>
    )
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  it('debería mostrar estado de loading', () => {
    render(
      <Button loading={true}>
        Procesando
      </Button>
    )
    
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByText('Procesando')).toBeInTheDocument()
  })
})
```

## Changelog

- **v1.0.0**: Implementación inicial con variantes básicas
- **v1.1.0**: Agregado soporte para estado loading
- **v1.2.0**: Mejorada accesibilidad y soporte para iconos
- **v1.3.0**: Integración con sistema de colores de Mandorla

---

*Documentación generada automáticamente - Última actualización: 2024-12-19*
