# Patrones de Clean Code - Proyecto Mandorla

## Propósito

Estas reglas establecen patrones de código limpio específicos para el proyecto e-commerce Mandorla, asegurando legibilidad, mantenibilidad y calidad del código.

## Principios Fundamentales

### 1. Nombres Significativos

**Variables y Funciones**

```typescript
// ✅ CORRECTO: Nombres descriptivos y específicos
const precioTotalConImpuestos = calcularPrecioFinal(subtotal, impuestos);
const productosDisponiblesEnStock = filtrarProductosPorDisponibilidad(productos);
const clienteConDireccionValidada = validarDireccionEntrega(cliente);

// ❌ INCORRECTO: Nombres genéricos o abreviados
const total = calc(sub, tax);
const prods = filter(products);
const c = validate(customer);
```

**Clases y Interfaces**

```typescript
// ✅ CORRECTO: Nombres que expresan responsabilidad clara
export class CalculadoraPrecioProducto {
  calcularPrecioConDescuento(precio: Money, descuento: Descuento): Money {
    // implementación
  }
}

export interface ValidadorDatosCliente {
  validarEmail(email: string): boolean;
  validarTelefono(telefono: string): boolean;
}

// ❌ INCORRECTO: Nombres genéricos
export class ProductManager {
  doStuff(data: any): any {
    // implementación
  }
}
```

**Constantes y Enums**

```typescript
// ✅ CORRECTO: Constantes descriptivas
export const PRECIO_MINIMO_PRODUCTO = 1;
export const CANTIDAD_MAXIMA_CARRITO = 99;
export const TIEMPO_EXPIRACION_SESION_MINUTOS = 30;

export enum EstadoPedido {
  PENDIENTE_PAGO = 'PENDIENTE_PAGO',
  PAGO_CONFIRMADO = 'PAGO_CONFIRMADO',
  EN_PREPARACION = 'EN_PREPARACION',
  LISTO_ENTREGA = 'LISTO_ENTREGA',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO'
}

// ❌ INCORRECTO: Constantes poco descriptivas
export const MIN = 1;
export const MAX = 99;
export const TIME = 30;
```

### 2. Funciones Pequeñas y Enfocadas

**Principio de Responsabilidad Única en Funciones**

```typescript
// ✅ CORRECTO: Funciones pequeñas con una responsabilidad
export class ProductoService {
  async crearProducto(datos: CrearProductoDto): Promise<Producto> {
    this.validarDatosProducto(datos);
    const producto = this.construirEntidadProducto(datos);
    await this.guardarProducto(producto);
    this.notificarProductoCreado(producto);
    return producto;
  }

  private validarDatosProducto(datos: CrearProductoDto): void {
    if (!datos.nombre || datos.nombre.trim().length === 0) {
      throw new DatosProductoInvalidosError('El nombre es requerido');
    }
    
    if (datos.precio <= 0) {
      throw new DatosProductoInvalidosError('El precio debe ser mayor a 0');
    }
  }

  private construirEntidadProducto(datos: CrearProductoDto): Producto {
    return new Producto({
      nombre: datos.nombre.trim(),
      precio: new Money(datos.precio),
      categoria: datos.categoria,
      descripcion: datos.descripcion || ''
    });
  }

  private async guardarProducto(producto: Producto): Promise<void> {
    await this.repositorioProductos.guardar(producto);
  }

  private notificarProductoCreado(producto: Producto): void {
    this.eventBus.publicar(new ProductoCreadoEvent(producto.id));
  }
}

// ❌ INCORRECTO: Función larga con múltiples responsabilidades
export class ProductoService {
  async crearProducto(datos: CrearProductoDto): Promise<Producto> {
    // Validación mezclada con lógica de negocio
    if (!datos.nombre || datos.nombre.trim().length === 0) {
      throw new Error('Nombre requerido');
    }
    if (datos.precio <= 0) {
      throw new Error('Precio inválido');
    }
    
    // Construcción mezclada con persistencia
    const producto = new Producto({
      nombre: datos.nombre.trim(),
      precio: new Money(datos.precio),
      categoria: datos.categoria
    });
    
    // Persistencia mezclada con notificación
    await this.repositorioProductos.guardar(producto);
    this.eventBus.publicar(new ProductoCreadoEvent(producto.id));
    
    // Logging mezclado con lógica de negocio
    console.log(`Producto creado: ${producto.id}`);
    
    return producto;
  }
}
```

**Parámetros de Función**

```typescript
// ✅ CORRECTO: Pocos parámetros, uso de objetos para múltiples parámetros
interface ParametrosCalculoPrecio {
  precioBase: Money;
  descuento?: Descuento;
  impuestos: Impuesto[];
  clienteVip: boolean;
}

export function calcularPrecioFinal(parametros: ParametrosCalculoPrecio): Money {
  let precioFinal = parametros.precioBase;
  
  if (parametros.descuento) {
    precioFinal = aplicarDescuento(precioFinal, parametros.descuento);
  }
  
  precioFinal = aplicarImpuestos(precioFinal, parametros.impuestos);
  
  if (parametros.clienteVip) {
    precioFinal = aplicarDescuentoVip(precioFinal);
  }
  
  return precioFinal;
}

// ❌ INCORRECTO: Demasiados parámetros
export function calcularPrecioFinal(
  precioBase: number,
  descuento: number,
  tipoDescuento: string,
  impuesto1: number,
  impuesto2: number,
  esClienteVip: boolean,
  fechaCompra: Date,
  codigoPromocional: string
): number {
  // implementación compleja
}
```

### 3. Comentarios Significativos

**Comentarios que Explican el Por Qué, No el Qué**

```typescript
// ✅ CORRECTO: Comentarios que explican decisiones de negocio
export class CalculadoraDescuentos {
  calcularDescuentoCliente(cliente: Cliente, pedido: Pedido): Descuento {
    // Los clientes VIP obtienen 15% de descuento porque generan
    // el 80% de nuestros ingresos y queremos fidelizarlos
    if (cliente.esVip()) {
      return new Descuento(0.15, 'Descuento VIP');
    }
    
    // Aplicamos descuento por volumen solo en pedidos grandes
    // para incentivar compras mayores y optimizar logística
    if (pedido.cantidadItems() >= 10) {
      return new Descuento(0.10, 'Descuento por volumen');
    }
    
    return Descuento.ninguno();
  }

  // Los descuentos se acumulan hasta un máximo del 25% para
  // mantener márgenes de ganancia sostenibles
  private readonly DESCUENTO_MAXIMO = 0.25;
}

// ❌ INCORRECTO: Comentarios que repiten el código
export class CalculadoraDescuentos {
  calcularDescuentoCliente(cliente: Cliente, pedido: Pedido): Descuento {
    // Verificar si el cliente es VIP
    if (cliente.esVip()) {
      // Retornar descuento del 15%
      return new Descuento(0.15, 'Descuento VIP');
    }
    
    // Verificar si el pedido tiene 10 o más items
    if (pedido.cantidadItems() >= 10) {
      // Retornar descuento del 10%
      return new Descuento(0.10, 'Descuento por volumen');
    }
    
    // Retornar sin descuento
    return Descuento.ninguno();
  }
}
```

**Documentación de APIs Públicas**

```typescript
/**
 * Servicio para gestionar operaciones del carrito de compras
 * 
 * Este servicio maneja la lógica de negocio relacionada con:
 * - Agregar/remover productos del carrito
 * - Calcular totales con descuentos e impuestos
 * - Validar disponibilidad de stock
 * - Persistir estado del carrito
 */
export class CarritoService {
  /**
   * Agrega un producto al carrito del cliente
   * 
   * @param clienteId - ID único del cliente
   * @param productoId - ID del producto a agregar
   * @param cantidad - Cantidad a agregar (debe ser > 0)
   * @returns Promise que resuelve cuando el producto se agrega exitosamente
   * 
   * @throws ProductoNoEncontradoError - Si el producto no existe
   * @throws StockInsuficienteError - Si no hay stock suficiente
   * @throws CantidadInvalidaError - Si la cantidad es <= 0
   * 
   * @example
   * ```typescript
   * await carritoService.agregarProducto('cliente-123', 'producto-456', 2);
   * ```
   */
  async agregarProducto(
    clienteId: string, 
    productoId: string, 
    cantidad: number
  ): Promise<void> {
    // implementación
  }
}
```

### 4. Formateo y Estructura Consistente

**Organización de Imports**

```typescript
// ✅ CORRECTO: Imports organizados por grupos
// 1. Librerías externas
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { z } from 'zod';

// 2. Imports internos del proyecto (absolutos)
import { ProductoEntity } from '@/modules/productos/domain/entities/producto-entity';
import { IProductoRepository } from '@/modules/productos/domain/repositories/producto-repository.interface';
import { ProductoNoEncontradoError } from '@/modules/productos/domain/errors/producto-errors';

// 3. Imports relativos (mismo módulo)
import { CrearProductoDto } from '../dtos/crear-producto.dto';
import { ProductoMapper } from '../mappers/producto.mapper';

// ❌ INCORRECTO: Imports desordenados
import { ProductoMapper } from '../mappers/producto.mapper';
import { Injectable } from '@nestjs/common';
import { ProductoEntity } from '@/modules/productos/domain/entities/producto-entity';
import { z } from 'zod';
import { CrearProductoDto } from '../dtos/crear-producto.dto';
```

**Estructura de Clases**

```typescript
// ✅ CORRECTO: Estructura consistente de clase
export class ProductoService {
  // 1. Propiedades privadas primero
  private readonly logger = new Logger(ProductoService.name);
  private readonly PRECIO_MAXIMO = 1000000;

  // 2. Constructor
  constructor(
    private readonly productoRepository: IProductoRepository,
    private readonly eventBus: IEventBus
  ) {}

  // 3. Métodos públicos
  async crearProducto(datos: CrearProductoDto): Promise<ProductoEntity> {
    // implementación
  }

  async obtenerProducto(id: string): Promise<ProductoEntity> {
    // implementación
  }

  // 4. Métodos privados al final
  private validarDatosProducto(datos: CrearProductoDto): void {
    // implementación
  }

  private construirEntidad(datos: CrearProductoDto): ProductoEntity {
    // implementación
  }
}
```

### 5. Manejo de Errores Limpio

**Errores Específicos y Descriptivos**

```typescript
// ✅ CORRECTO: Errores específicos con contexto
export class ProductoService {
  async actualizarPrecio(id: string, nuevoPrecio: number): Promise<void> {
    // Validación temprana con errores específicos
    if (nuevoPrecio <= 0) {
      throw new PrecioInvalidoError(
        `El precio ${nuevoPrecio} no es válido. Debe ser mayor a 0`,
        { productoId: id, precioIntentado: nuevoPrecio }
      );
    }

    if (nuevoPrecio > this.PRECIO_MAXIMO) {
      throw new PrecioDemasiadoAltoError(
        `El precio ${nuevoPrecio} excede el máximo permitido de ${this.PRECIO_MAXIMO}`,
        { productoId: id, precioIntentado: nuevoPrecio, precioMaximo: this.PRECIO_MAXIMO }
      );
    }

    try {
      const producto = await this.productoRepository.obtenerPorId(id);
      
      if (!producto) {
        throw new ProductoNoEncontradoError(
          `Producto con ID ${id} no encontrado`,
          { productoId: id }
        );
      }

      producto.actualizarPrecio(Money.create(nuevoPrecio));
      await this.productoRepository.guardar(producto);

    } catch (error) {
      if (error instanceof ProductoError) {
        // Re-lanzar errores de dominio
        throw error;
      }

      // Envolver errores inesperados
      throw new ErrorServicioProducto(
        `Error inesperado al actualizar precio del producto ${id}`,
        { productoId: id, nuevoPrecio, errorOriginal: error.message }
      );
    }
  }
}

// ❌ INCORRECTO: Errores genéricos sin contexto
export class ProductoService {
  async actualizarPrecio(id: string, nuevoPrecio: number): Promise<void> {
    if (nuevoPrecio <= 0) {
      throw new Error('Precio inválido');
    }

    try {
      const producto = await this.productoRepository.obtenerPorId(id);
      producto.actualizarPrecio(Money.create(nuevoPrecio));
      await this.productoRepository.guardar(producto);
    } catch (error) {
      throw new Error('Error al actualizar precio');
    }
  }
}
```

### 6. Evitar Duplicación de Código

**Extracción de Funciones Comunes**

```typescript
// ✅ CORRECTO: Lógica común extraída
export class ValidadorDatos {
  static validarEmail(email: string): void {
    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !patronEmail.test(email)) {
      throw new EmailInvalidoError(`Email inválido: ${email}`);
    }
  }

  static validarTelefono(telefono: string): void {
    const patronTelefono = /^\+?[\d\s\-\(\)]{10,}$/;
    
    if (!telefono || !patronTelefono.test(telefono)) {
      throw new TelefonoInvalidoError(`Teléfono inválido: ${telefono}`);
    }
  }

  static validarTextoRequerido(texto: string, nombreCampo: string): void {
    if (!texto || texto.trim().length === 0) {
      throw new CampoRequeridoError(`${nombreCampo} es requerido`);
    }
  }
}

export class ClienteService {
  async crearCliente(datos: CrearClienteDto): Promise<Cliente> {
    // Reutilizar validaciones comunes
    ValidadorDatos.validarTextoRequerido(datos.nombre, 'Nombre');
    ValidadorDatos.validarEmail(datos.email);
    ValidadorDatos.validarTelefono(datos.telefono);

    // Lógica específica del cliente
    const cliente = new Cliente(datos);
    return await this.clienteRepository.guardar(cliente);
  }
}

// ❌ INCORRECTO: Duplicación de lógica de validación
export class ClienteService {
  async crearCliente(datos: CrearClienteDto): Promise<Cliente> {
    // Validación duplicada
    if (!datos.nombre || datos.nombre.trim().length === 0) {
      throw new Error('Nombre requerido');
    }
    
    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!datos.email || !patronEmail.test(datos.email)) {
      throw new Error('Email inválido');
    }
    
    // ... más validaciones duplicadas
  }
}

export class ProveedorService {
  async crearProveedor(datos: CrearProveedorDto): Promise<Proveedor> {
    // Misma validación duplicada
    if (!datos.nombre || datos.nombre.trim().length === 0) {
      throw new Error('Nombre requerido');
    }
    
    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!datos.email || !patronEmail.test(datos.email)) {
      throw new Error('Email inválido');
    }
    
    // ... validaciones duplicadas
  }
}
```

### 7. Uso Efectivo de TypeScript

**Tipos Específicos y Descriptivos**

```typescript
// ✅ CORRECTO: Tipos específicos que expresan intención
export type ProductoId = string & { readonly __brand: 'ProductoId' };
export type ClienteId = string & { readonly __brand: 'ClienteId' };
export type PedidoId = string & { readonly __brand: 'PedidoId' };

export interface DatosContactoCliente {
  readonly email: EmailValido;
  readonly telefono: TelefonoValido;
  readonly direccion: DireccionCompleta;
}

export interface ConfiguracionDescuento {
  readonly porcentaje: number; // 0-1 (ej: 0.15 = 15%)
  readonly montoMinimo?: Money;
  readonly fechaVencimiento?: Date;
  readonly aplicableA: CategoriaProducto[];
}

// ❌ INCORRECTO: Tipos genéricos poco descriptivos
export interface Data {
  id: string;
  info: any;
  config: object;
}

export function processStuff(data: any): any {
  // implementación
}
```

**Enums vs Union Types**

```typescript
// ✅ CORRECTO: Usar enums para valores conocidos y fijos
export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADO = 'CONFIRMADO',
  EN_PREPARACION = 'EN_PREPARACION',
  LISTO = 'LISTO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO'
}

// ✅ CORRECTO: Usar union types para valores más flexibles
export type MetodoPago = 'efectivo' | 'tarjeta_credito' | 'tarjeta_debito' | 'transferencia';
export type TipoNotificacion = 'email' | 'sms' | 'push' | 'whatsapp';

// ❌ INCORRECTO: Usar strings genéricos
export interface Pedido {
  estado: string; // Debería ser EstadoPedido
  metodoPago: string; // Debería ser MetodoPago
}
```

## Patrones de Refactoring

### Extracción de Métodos

```typescript
// ✅ ANTES: Método largo y complejo
export class ProcesadorPedidos {
  async procesarPedido(pedido: Pedido): Promise<ResultadoProcesamiento> {
    // Validar pedido
    if (!pedido.items || pedido.items.length === 0) {
      throw new PedidoVacioError('El pedido debe tener al menos un item');
    }
    
    for (const item of pedido.items) {
      if (item.cantidad <= 0) {
        throw new CantidadInvalidaError(`Cantidad inválida para ${item.producto.nombre}`);
      }
    }
    
    // Calcular total
    let subtotal = 0;
    for (const item of pedido.items) {
      subtotal += item.producto.precio * item.cantidad;
    }
    
    let descuento = 0;
    if (pedido.cliente.esVip()) {
      descuento = subtotal * 0.15;
    }
    
    const impuestos = subtotal * 0.08;
    const total = subtotal - descuento + impuestos;
    
    // Procesar pago
    const resultadoPago = await this.procesadorPagos.procesar({
      monto: total,
      metodoPago: pedido.metodoPago,
      cliente: pedido.cliente
    });
    
    if (!resultadoPago.exitoso) {
      throw new ErrorPagoError('Error al procesar pago');
    }
    
    // Actualizar inventario
    for (const item of pedido.items) {
      await this.inventario.reducirStock(item.producto.id, item.cantidad);
    }
    
    // Enviar notificaciones
    await this.notificador.enviarConfirmacion(pedido.cliente.email, pedido);
    
    return new ResultadoProcesamiento(true, total, resultadoPago.transaccionId);
  }
}

// ✅ DESPUÉS: Métodos extraídos y enfocados
export class ProcesadorPedidos {
  async procesarPedido(pedido: Pedido): Promise<ResultadoProcesamiento> {
    this.validarPedido(pedido);
    
    const calculoTotal = this.calcularTotalPedido(pedido);
    const resultadoPago = await this.procesarPago(calculoTotal.total, pedido);
    
    await this.actualizarInventario(pedido.items);
    await this.enviarNotificaciones(pedido);
    
    return new ResultadoProcesamiento(true, calculoTotal.total, resultadoPago.transaccionId);
  }

  private validarPedido(pedido: Pedido): void {
    if (!pedido.items || pedido.items.length === 0) {
      throw new PedidoVacioError('El pedido debe tener al menos un item');
    }
    
    for (const item of pedido.items) {
      if (item.cantidad <= 0) {
        throw new CantidadInvalidaError(`Cantidad inválida para ${item.producto.nombre}`);
      }
    }
  }

  private calcularTotalPedido(pedido: Pedido): CalculoTotal {
    const subtotal = this.calcularSubtotal(pedido.items);
    const descuento = this.calcularDescuento(subtotal, pedido.cliente);
    const impuestos = this.calcularImpuestos(subtotal);
    const total = subtotal - descuento + impuestos;
    
    return new CalculoTotal(subtotal, descuento, impuestos, total);
  }

  private calcularSubtotal(items: ItemPedido[]): number {
    return items.reduce((total, item) => 
      total + (item.producto.precio * item.cantidad), 0
    );
  }

  private calcularDescuento(subtotal: number, cliente: Cliente): number {
    return cliente.esVip() ? subtotal * 0.15 : 0;
  }

  private calcularImpuestos(subtotal: number): number {
    return subtotal * 0.08;
  }

  private async procesarPago(monto: number, pedido: Pedido): Promise<ResultadoPago> {
    const resultadoPago = await this.procesadorPagos.procesar({
      monto,
      metodoPago: pedido.metodoPago,
      cliente: pedido.cliente
    });
    
    if (!resultadoPago.exitoso) {
      throw new ErrorPagoError('Error al procesar pago');
    }
    
    return resultadoPago;
  }

  private async actualizarInventario(items: ItemPedido[]): Promise<void> {
    for (const item of items) {
      await this.inventario.reducirStock(item.producto.id, item.cantidad);
    }
  }

  private async enviarNotificaciones(pedido: Pedido): Promise<void> {
    await this.notificador.enviarConfirmacion(pedido.cliente.email, pedido);
  }
}
```

## Herramientas de Validación

### ESLint Rules para Clean Code

```javascript
// .eslintrc.js - Reglas específicas para clean code
module.exports = {
  rules: {
    // Nombres descriptivos
    'prefer-const': 'error',
    'no-var': 'error',
    'camelcase': ['error', { properties: 'always' }],
    
    // Funciones pequeñas
    'max-lines-per-function': ['warn', { max: 50 }],
    'max-params': ['error', 4],
    'complexity': ['warn', 10],
    
    // Comentarios útiles
    'no-inline-comments': 'warn',
    'spaced-comment': ['error', 'always'],
    
    // Evitar duplicación
    'no-duplicate-imports': 'error',
    'no-unreachable': 'error',
    
    // TypeScript específico
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/prefer-readonly': 'error'
  }
};
```

### Prettier Configuration

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

## Beneficios del Clean Code

### Para el Desarrollo

- Código más fácil de leer y entender
- Menos tiempo dedicado a descifrar código existente
- Debugging más eficiente

### Para el Mantenimiento

- Cambios más seguros y predecibles
- Refactoring menos riesgoso
- Menos bugs introducidos por malentendidos

### Para el Equipo

- Onboarding más rápido para nuevos desarrolladores
- Revisiones de código más efectivas
- Estándares consistentes en todo el proyecto

### Para el Negocio

- Desarrollo más rápido de nuevas funcionalidades
- Menos tiempo dedicado a corregir bugs
- Mayor confiabilidad del sistema
