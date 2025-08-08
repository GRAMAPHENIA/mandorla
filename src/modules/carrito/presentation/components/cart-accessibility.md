# Guía de Accesibilidad - Módulo de Carrito

## Componentes de Carrito Accesibles

### CartItem Component
```typescript
// Usar ARIA labels descriptivos
<div role="listitem" aria-label={`${item.name}, cantidad: ${item.quantity}, precio: ${item.price.format()}`}>
  <button 
    aria-label={`Eliminar ${item.name} del carrito`}
    onClick={() => removeItem(item.id)}
  >
    <Trash2 aria-hidden="true" />
  </button>
</div>
```

### CartSummary Component
```typescript
// Anunciar cambios en el total
<div role="status" aria-live="polite" aria-atomic="true">
  Total: {totalPrice.format()}
</div>
```

### Navegación por Teclado
- Todos los botones deben ser accesibles con Tab
- Enter y Space para activar acciones
- Escape para cerrar modales del carrito

### Contraste de Colores
- Verificar contraste mínimo 4.5:1 con colores de marca
- Usar `mandorla-dark-brown` para texto sobre fondos claros