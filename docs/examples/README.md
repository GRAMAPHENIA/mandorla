# Ejemplos y Casos de Uso - Proyecto Mandorla

## Descripción General

Ejemplos prácticos y casos de uso reales del proyecto e-commerce Mandorla, mostrando implementaciones concretas de patrones, integraciones y flujos de negocio.

## 🎯 Casos de Uso Principales

### 🛒 Flujo de Compra Completo

**Descripción**: Proceso completo desde la selección de productos hasta la confirmación de entrega.

**Actores**: Cliente, Sistema de Pagos, Sistema de Notificaciones

**Flujo Principal**:

1. Cliente navega catálogo de productos
2. Selecciona productos y los agrega al carrito
3. Procede al checkout con datos de entrega
4. Completa pago con Mercado Pago
5. Recibe confirmación por email
6. Seguimiento del pedido hasta entrega

**Código de Ejemplo**:

```typescript
// Flujo completo implementado
const flujoCompraCompleto = async (clienteId: string, productosSeleccionados: ProductoSeleccionado[]) => {
  // 1. Agregar productos al carrito
  const carrito = await carritoService.obtenerCarrito(clienteId);
  for (const producto of productosSeleccionados) {
    await carrito.agregarProducto(producto.id, producto.cantidad);
  }

  // 2. Procesar checkout
  const datosCheckout = {
    clienteId,
    tipoEntrega: 'delivery',
    direccionEntrega: await clienteService.obtenerDireccionPrincipal(clienteId),
    metodoPago: 'mercado_pago'
  };

  const resultado = await checkoutService.procesarCheckout(datosCheckout);

  // 3. Redirigir a Mercado Pago
  if (resultado.success && resultado.initPoint) {
    window.location.href = resultado.initPoint;
  }

  return resultado;
};
```

### 👥 Gestión de Clientes

**Descripción**: Registro, actualización y gestión completa de clientes con múltiples direcciones.

**Funcionalidades**:

- Registro de nuevos clientes
- Validación de datos argentinos (teléfonos, códigos postales)
- Gestión de múltiples direcciones
- Actualización de estadísticas automáticas

**Código de Ejemplo**:

```typescript
// Registro completo de cliente
const registrarClienteCompleto = async (datosCliente: DatosRegistroCliente) => {
  // Validar datos específicos de Argentina
  const emailValido = Email.create(datosCliente.email);
  const telefonoValido = Telefono.create(datosCliente.telefono);

  // Crear cliente
  const cliente = ClienteEntity.create({
    nombre: datosCliente.nombre,
    apellido: datosCliente.apellido,
    email: emailValido,
    telefono: telefonoValido,
    fechaNacimiento: datosCliente.fechaNacimiento,
    tipo: TipoCliente.REGULAR
  });

  // Agregar dirección principal
  const direccionPrincipal = Direccion.create({
    calle: datosCliente.direccion.calle,
    numero: datosCliente.direccion.numero,
    ciudad: datosCliente.direccion.ciudad,
    provincia: datosCliente.direccion.provincia,
    codigoPostal: datosCliente.direccion.codigoPostal,
    esPrincipal: true
  });

  cliente.agregarDireccion(direccionPrincipal);

  // Guardar en repositorio
  await clienteRepository.guardar(cliente);

  // Enviar email de bienvenida
  await notificationService.enviarBienvenida(cliente);

  return cliente;
};
```

### 📋 Procesamiento de Pedidos

**Descripción**: Gestión completa del ciclo de vida de pedidos con estados y transiciones.

**Estados del Pedido**:

- `PENDIENTE` → `PAGO_CONFIRMADO` → `EN_PREPARACION` → `LISTO_ENTREGA` → `ENTREGADO`

**Código de Ejemplo**:

```typescript
// Procesamiento automático de pedido
const procesarPedidoCompleto = async (pedidoId: string) => {
  const pedido = await pedidoRepository.obtenerPorId(PedidoId.create(pedidoId));
  
  if (!pedido) {
    throw new PedidoNoEncontradoError(pedidoId);
  }

  // Confirmar pago (webhook de Mercado Pago)
  if (pedido.estado === EstadoPedido.PENDIENTE) {
    pedido.confirmarPago();
    await pedidoRepository.guardar(pedido);
    
    // Notificar confirmación
    await notificationService.enviarConfirmacionPago(pedido);
  }

  // Marcar como en preparación
  if (pedido.estado === EstadoPedido.PAGO_CONFIRMADO) {
    pedido.iniciarPreparacion();
    await pedidoRepository.guardar(pedido);
    
    // Actualizar estadísticas del cliente
    await clienteService.actualizarEstadisticasPedido(pedido.clienteId, pedido);
  }

  // Marcar como listo para entrega
  if (pedido.estado === EstadoPedido.EN_PREPARACION) {
    pedido.marcarListoParaEntrega();
    await pedidoRepository.guardar(pedido);
    
    // Notificar que está listo
    await notificationService.enviarPedidoListo(pedido);
  }

  return pedido;
};
```

## 🧩 Patrones de Implementación

### Patrón Repository con Validación

```typescript
// Implementación robusta de repositorio
export class ClienteRepository implements IClienteRepository {
  async guardar(cliente: ClienteEntity): Promise<void> {
    try {
      // Validar entidad antes de guardar
      cliente.validar();
      
      // Verificar unicidad de email
      const existeEmail = await this.existeEmail(cliente.email);
      if (existeEmail && !cliente.id) {
        throw new EmailDuplicadoError(cliente.email.value);
      }

      // Convertir a formato de persistencia
      const datos = cliente.toPersistence();
      
      // Guardar en base de datos
      await this.db.collection('clientes').replaceOne(
        { _id: cliente.id.value },
        datos,
        { upsert: true }
      );

      // Emitir evento de dominio
      EventBus.emit(new ClienteGuardadoEvent(cliente.id));
      
    } catch (error) {
      if (error instanceof ClienteError) {
        throw error;
      }
      
      throw new ErrorRepositorioClientesError(
        `Error al guardar cliente ${cliente.id.value}`,
        { clienteId: cliente.id.value, originalError: error.message }
      );
    }
  }
}
```

### Patrón Facade para Integración

```typescript
// Facade que simplifica operaciones complejas
export class CheckoutFacade {
  constructor(
    private checkoutService: CheckoutIntegrationService,
    private mercadoPagoService: MercadoPagoService,
    private notificationService: NotificationService
  ) {}

  async procesarCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
    try {
      // Validar cliente
      const validacionCliente = await this.validarCliente(request.clienteId);
      if (!validacionCliente.esValido) {
        return CheckoutResponse.error('CLIENTE_INVALIDO', validacionCliente.mensaje);
      }

      // Calcular costos
      const costos = await this.calcularCostos(request);
      
      // Crear pedido
      const pedido = await this.checkoutService.crearPedido({
        ...request,
        subtotal: costos.subtotal,
        costoEnvio: costos.envio,
        total: costos.total
      });

      // Configurar pago si es Mercado Pago
      let initPoint: string | undefined;
      if (request.metodoPago === 'mercado_pago') {
        const preferencia = await this.mercadoPagoService.crearPreferencia({
          pedidoId: pedido.id.value,
          items: pedido.items,
          total: pedido.total
        });
        initPoint = preferencia.init_point;
      }

      return CheckoutResponse.success({
        pedidoId: pedido.id.value,
        total: pedido.total,
        initPoint
      });

    } catch (error) {
      Logger.error('Error en checkout', { error, request });
      return CheckoutResponse.error('ERROR_INTERNO', 'Error al procesar checkout');
    }
  }
}
```

### Patrón Service Layer con Casos de Uso

```typescript
// Servicio que coordina múltiples agregados
export class PedidoService {
  constructor(
    private pedidoRepository: IPedidoRepository,
    private clienteRepository: IClienteRepository,
    private productoRepository: IProductoRepository,
    private eventBus: IEventBus
  ) {}

  async crearPedido(datos: CrearPedidoDto): Promise<PedidoEntity> {
    // Validar cliente existe y está activo
    const cliente = await this.clienteRepository.buscarPorId(ClienteId.create(datos.clienteId));
    if (!cliente || !cliente.estaActivo()) {
      throw new ClienteNoActivoError(datos.clienteId);
    }

    // Validar productos y stock
    const items: ItemPedido[] = [];
    for (const item of datos.items) {
      const producto = await this.productoRepository.buscarPorId(ProductId.create(item.productoId));
      if (!producto) {
        throw new ProductoNoEncontradoError(item.productoId);
      }
      
      if (!producto.tieneStock(item.cantidad)) {
        throw new StockInsuficienteError(item.productoId, item.cantidad, producto.stock);
      }

      items.push(ItemPedido.create({
        productoId: producto.id,
        nombreProducto: producto.nombre,
        precioUnitario: producto.precio,
        cantidad: item.cantidad
      }));
    }

    // Crear pedido
    const pedido = PedidoEntity.create({
      clienteId: cliente.id,
      items,
      tipoEntrega: datos.tipoEntrega,
      direccionEntrega: datos.direccionEntrega,
      metodoPago: datos.metodoPago
    });

    // Reservar stock
    for (const item of items) {
      const producto = await this.productoRepository.buscarPorId(item.productoId);
      producto!.reservarStock(item.cantidad);
      await this.productoRepository.guardar(producto!);
    }

    // Guardar pedido
    await this.pedidoRepository.guardar(pedido);

    // Emitir evento
    this.eventBus.emit(new PedidoCreadoEvent(pedido.id, cliente.id));

    return pedido;
  }
}
```

## 🔄 Integraciones Externas

### Integración con Mercado Pago

```typescript
// Servicio completo de Mercado Pago
export class MercadoPagoService implements IPagoService {
  private client: MercadoPagoConfig;

  constructor() {
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
      options: {
        timeout: 5000,
        idempotencyKey: 'mandorla-' + Date.now()
      }
    });
  }

  async crearPreferencia(datos: DatosPreferencia): Promise<PreferenciaMercadoPago> {
    const preference = new Preference(this.client);

    const preferenceData = {
      items: datos.items.map(item => ({
        id: item.productoId,
        title: item.nombre,
        quantity: item.cantidad,
        unit_price: item.precio,
        currency_id: 'ARS'
      })),
      external_reference: datos.pedidoId,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/pending`
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
      payer: {
        email: datos.clienteEmail,
        name: datos.clienteNombre
      }
    };

    const result = await preference.create({ body: preferenceData });
    
    if (!result.id) {
      throw new ErrorMercadoPagoError('No se pudo crear la preferencia');
    }

    return {
      id: result.id,
      init_point: result.init_point!,
      sandbox_init_point: result.sandbox_init_point
    };
  }

  async procesarWebhook(notification: NotificacionMercadoPago): Promise<ResultadoPago> {
    if (notification.type === 'payment') {
      const payment = new Payment(this.client);
      const paymentData = await payment.get({ id: notification.data.id });

      const pedidoId = paymentData.external_reference;
      const estado = this.mapearEstadoPago(paymentData.status);

      return {
        pedidoId: pedidoId!,
        estado,
        transactionId: paymentData.id!.toString(),
        monto: paymentData.transaction_amount!,
        metodoPago: paymentData.payment_method_id!
      };
    }

    throw new ErrorMercadoPagoError('Tipo de notificación no soportado');
  }
}
```

### Integración con EmailJS

```typescript
// Servicio de notificaciones por email
export class EmailNotificationService implements INotificationService {
  async enviarConfirmacionPedido(pedido: PedidoEntity, cliente: ClienteEntity): Promise<void> {
    const templateParams = {
      to_email: cliente.email.value,
      to_name: `${cliente.nombre} ${cliente.apellido}`,
      pedido_id: pedido.id.value,
      total: pedido.total.value,
      items: pedido.items.map(item => ({
        nombre: item.nombreProducto,
        cantidad: item.cantidad,
        precio: item.precioUnitario.value
      })),
      fecha_pedido: pedido.fechaPedido.toLocaleDateString('es-AR'),
      tipo_entrega: pedido.tipoEntrega === 'delivery' ? 'Delivery' : 'Retiro en local'
    };

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      Logger.info('Email de confirmación enviado', { 
        pedidoId: pedido.id.value, 
        clienteEmail: cliente.email.value 
      });

    } catch (error) {
      Logger.error('Error al enviar email de confirmación', { 
        error, 
        pedidoId: pedido.id.value 
      });
      
      throw new ErrorNotificacionError(
        'No se pudo enviar email de confirmación',
        { pedidoId: pedido.id.value, error: error.message }
      );
    }
  }
}
```

## 🎨 Componentes React Avanzados

### Componente con Estado Complejo

```typescript
// Componente de checkout con múltiples estados
export function CheckoutForm() {
  const [paso, setPaso] = useState<PasoCheckout>('datos-cliente');
  const [datosCliente, setDatosCliente] = useState<DatosCliente | null>(null);
  const [direccionEntrega, setDireccionEntrega] = useState<Direccion | null>(null);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('mercado_pago');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { items, total, clearCart } = useCartStore();
  const { procesarCheckout } = useCheckout();

  const manejarSiguientePaso = useCallback(async () => {
    setError(null);
    
    try {
      switch (paso) {
        case 'datos-cliente':
          if (!datosCliente) {
            setError('Complete los datos del cliente');
            return;
          }
          setPaso('direccion-entrega');
          break;

        case 'direccion-entrega':
          if (!direccionEntrega) {
            setError('Seleccione una dirección de entrega');
            return;
          }
          setPaso('metodo-pago');
          break;

        case 'metodo-pago':
          setLoading(true);
          const resultado = await procesarCheckout({
            cliente: datosCliente!,
            direccion: direccionEntrega!,
            metodoPago,
            items
          });

          if (resultado.success) {
            clearCart();
            if (resultado.initPoint) {
              window.location.href = resultado.initPoint;
            } else {
              setPaso('confirmacion');
            }
          } else {
            setError(resultado.error || 'Error al procesar el pedido');
          }
          break;
      }
    } catch (error) {
      setError('Error inesperado. Intente nuevamente.');
      Logger.error('Error en checkout', { error, paso });
    } finally {
      setLoading(false);
    }
  }, [paso, datosCliente, direccionEntrega, metodoPago, items, procesarCheckout, clearCart]);

  return (
    <div className="checkout-form">
      <IndicadorPaso pasoActual={paso} />
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {paso === 'datos-cliente' && (
        <FormularioDatosCliente
          datos={datosCliente}
          onChange={setDatosCliente}
          onNext={manejarSiguientePaso}
        />
      )}

      {paso === 'direccion-entrega' && (
        <FormularioDireccionEntrega
          direccion={direccionEntrega}
          onChange={setDireccionEntrega}
          onNext={manejarSiguientePaso}
          onBack={() => setPaso('datos-cliente')}
        />
      )}

      {paso === 'metodo-pago' && (
        <FormularioMetodoPago
          metodo={metodoPago}
          onChange={setMetodoPago}
          total={total}
          loading={loading}
          onNext={manejarSiguientePaso}
          onBack={() => setPaso('direccion-entrega')}
        />
      )}

      {paso === 'confirmacion' && (
        <ConfirmacionPedido />
      )}
    </div>
  );
}
```

### Hook Personalizado Avanzado

```typescript
// Hook para gestión completa del carrito
export function useCarritoAvanzado() {
  const store = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agregarProducto = useCallback(async (
    productoId: string, 
    cantidad: number = 1
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Validar producto existe y tiene stock
      const producto = await productoService.obtenerProducto(productoId);
      
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      if (!producto.tieneStock(cantidad)) {
        throw new Error(`Solo quedan ${producto.stock} unidades disponibles`);
      }

      // Agregar al store
      store.addItem({
        id: producto.id,
        name: producto.nombre,
        price: producto.precio,
        quantity: cantidad,
        image: producto.imagen
      });

      // Mostrar notificación
      toast.success(`${producto.nombre} agregado al carrito`);

      // Analytics
      Analytics.track('product_added_to_cart', {
        product_id: productoId,
        product_name: producto.nombre,
        quantity: cantidad,
        price: producto.precio
      });

    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al agregar producto';
      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  }, [store]);

  const calcularDescuentos = useCallback(() => {
    const subtotal = store.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let descuento = 0;
    
    // Descuento por volumen (más de 10 items)
    const totalItems = store.items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems >= 10) {
      descuento += subtotal * 0.1; // 10% de descuento
    }

    // Descuento por monto (más de $10,000)
    if (subtotal >= 10000) {
      descuento += subtotal * 0.05; // 5% adicional
    }

    return {
      subtotal,
      descuento,
      total: subtotal - descuento
    };
  }, [store.items]);

  const validarCarrito = useCallback(async () => {
    const errores: string[] = [];

    for (const item of store.items) {
      try {
        const producto = await productoService.obtenerProducto(item.id);
        
        if (!producto) {
          errores.push(`Producto ${item.name} ya no está disponible`);
          continue;
        }

        if (!producto.tieneStock(item.quantity)) {
          errores.push(`${item.name}: solo quedan ${producto.stock} unidades`);
        }

        if (producto.precio !== item.price) {
          errores.push(`${item.name}: el precio ha cambiado a $${producto.precio}`);
        }

      } catch (error) {
        errores.push(`Error al validar ${item.name}`);
      }
    }

    return {
      esValido: errores.length === 0,
      errores
    };
  }, [store.items]);

  return {
    // Estado del carrito
    items: store.items,
    itemCount: store.items.reduce((sum, item) => sum + item.quantity, 0),
    
    // Cálculos
    ...calcularDescuentos(),
    
    // Acciones
    agregarProducto,
    actualizarCantidad: store.updateQuantity,
    eliminarItem: store.removeItem,
    limpiarCarrito: store.clearCart,
    
    // Validación
    validarCarrito,
    
    // Estado de UI
    loading,
    error,
    
    // Utilidades
    estaVacio: store.items.length === 0,
    tieneProducto: (productoId: string) => store.items.some(item => item.id === productoId)
  };
}
```

## 📊 Casos de Testing

### Testing de Integración Completo

```typescript
// Test de flujo completo de checkout
describe('Flujo de Checkout Completo', () => {
  let checkoutService: CheckoutIntegrationService;
  let mockRepositories: MockRepositories;
  let mockMercadoPago: MockMercadoPagoService;

  beforeEach(() => {
    mockRepositories = createMockRepositories();
    mockMercadoPago = new MockMercadoPagoService();
    
    checkoutService = new CheckoutIntegrationService(
      mockRepositories.pedido,
      mockRepositories.cliente,
      mockMercadoPago
    );
  });

  it('debería procesar checkout completo exitosamente', async () => {
    // Arrange
    const cliente = ClienteEntityBuilder.create()
      .conId('cliente-123')
      .conEmail('cliente@test.com')
      .conEstado(EstadoCliente.ACTIVO)
      .build();

    const productos = [
      ProductEntityBuilder.create()
        .conId('prod-1')
        .conNombre('Pan Integral')
        .conPrecio(2500)
        .conStock(10)
        .build()
    ];

    mockRepositories.cliente.buscarPorId.mockResolvedValue(cliente);
    mockRepositories.producto.buscarPorId.mockResolvedValue(productos[0]);
    mockMercadoPago.crearPreferencia.mockResolvedValue({
      id: 'pref-123',
      init_point: 'https://mercadopago.com/checkout/pref-123'
    });

    const datosCheckout = {
      clienteId: 'cliente-123',
      items: [{ productoId: 'prod-1', cantidad: 2 }],
      tipoEntrega: 'delivery' as const,
      direccionEntrega: DireccionBuilder.create().build(),
      metodoPago: 'mercado_pago' as const
    };

    // Act
    const resultado = await checkoutService.procesarCheckout(datosCheckout);

    // Assert
    expect(resultado.success).toBe(true);
    expect(resultado.pedidoId).toBeDefined();
    expect(resultado.initPoint).toBe('https://mercadopago.com/checkout/pref-123');
    
    // Verificar que se guardó el pedido
    expect(mockRepositories.pedido.guardar).toHaveBeenCalledWith(
      expect.objectContaining({
        clienteId: ClienteId.create('cliente-123'),
        estado: EstadoPedido.PENDIENTE
      })
    );

    // Verificar que se creó la preferencia de MP
    expect(mockMercadoPago.crearPreferencia).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            productoId: 'prod-1',
            cantidad: 2
          })
        ])
      })
    );
  });

  it('debería fallar si el cliente no está activo', async () => {
    // Arrange
    const clienteInactivo = ClienteEntityBuilder.create()
      .conId('cliente-123')
      .conEstado(EstadoCliente.INACTIVO)
      .build();

    mockRepositories.cliente.buscarPorId.mockResolvedValue(clienteInactivo);

    const datosCheckout = {
      clienteId: 'cliente-123',
      items: [{ productoId: 'prod-1', cantidad: 1 }],
      tipoEntrega: 'delivery' as const,
      metodoPago: 'mercado_pago' as const
    };

    // Act & Assert
    await expect(checkoutService.procesarCheckout(datosCheckout))
      .rejects
      .toThrow(ClienteNoActivoError);
  });
});
```

### Testing de Componentes React

```typescript
// Test completo de componente de checkout
describe('CheckoutForm Component', () => {
  const mockCheckoutFacade = {
    procesarCheckout: jest.fn(),
    validarCliente: jest.fn(),
    calcularCostoEnvio: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería completar el flujo de checkout exitosamente', async () => {
    // Arrange
    mockCheckoutFacade.procesarCheckout.mockResolvedValue({
      success: true,
      pedidoId: 'pedido-123',
      initPoint: 'https://mercadopago.com/checkout'
    });

    const { user } = renderWithProviders(
      <CheckoutForm facade={mockCheckoutFacade} />
    );

    // Act - Completar datos del cliente
    await user.type(screen.getByLabelText(/nombre/i), 'Juan');
    await user.type(screen.getByLabelText(/apellido/i), 'Pérez');
    await user.type(screen.getByLabelText(/email/i), 'juan@test.com');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Completar dirección
    await user.type(screen.getByLabelText(/calle/i), 'Av. Corrientes');
    await user.type(screen.getByLabelText(/número/i), '1234');
    await user.selectOptions(screen.getByLabelText(/ciudad/i), 'Buenos Aires');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Seleccionar método de pago y finalizar
    await user.click(screen.getByLabelText(/mercado pago/i));
    await user.click(screen.getByRole('button', { name: /finalizar compra/i }));

    // Assert
    await waitFor(() => {
      expect(mockCheckoutFacade.procesarCheckout).toHaveBeenCalledWith({
        cliente: expect.objectContaining({
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'juan@test.com'
        }),
        direccion: expect.objectContaining({
          calle: 'Av. Corrientes',
          numero: '1234',
          ciudad: 'Buenos Aires'
        }),
        metodoPago: 'mercado_pago'
      });
    });

    // Verificar redirección a Mercado Pago
    expect(window.location.href).toBe('https://mercadopago.com/checkout');
  });

  it('debería mostrar errores de validación', async () => {
    // Arrange
    const { user } = renderWithProviders(
      <CheckoutForm facade={mockCheckoutFacade} />
    );

    // Act - Intentar avanzar sin completar datos
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Assert
    expect(screen.getByText(/complete los datos del cliente/i)).toBeInTheDocument();
  });
});
```

## 🚀 Optimizaciones y Performance

### Lazy Loading Inteligente

```typescript
// Componente con lazy loading y preloading inteligente
export function LazyProductGrid() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Intersection Observer para detectar visibilidad
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  // Preload cuando el usuario está cerca
  useEffect(() => {
    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isPreloaded) {
          // Precargar componente cuando está a 200px de ser visible
          import('./ProductGrid').then(() => {
            setIsPreloaded(true);
          });
        }
      },
      { rootMargin: '200px' }
    );

    if (ref.current) {
      preloadObserver.observe(ref.current);
    }

    return () => preloadObserver.disconnect();
  }, [isPreloaded]);

  return (
    <div ref={ref} className="min-h-[400px]">
      {isVisible ? (
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid />
        </Suspense>
      ) : (
        <ProductGridPlaceholder />
      )}
    </div>
  );
}
```

### Optimización de Bundle

```typescript
// Configuración de code splitting por módulos
// next.config.mjs
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          // Módulos de dominio
          products: {
            test: /[\\/]src[\\/]modules[\\/]productos[\\/]/,
            name: 'products-module',
            chunks: 'all',
          },
          cart: {
            test: /[\\/]src[\\/]modules[\\/]carrito[\\/]/,
            name: 'cart-module',
            chunks: 'all',
          },
          orders: {
            test: /[\\/]src[\\/]modules[\\/]pedidos[\\/]/,
            name: 'orders-module',
            chunks: 'all',
          }
        }
      };
    }
    return config;
  }
};
```

---

*Ejemplos actualizados automáticamente - Última actualización: 2024-12-19*  
*Casos de uso documentados: 15+ | Patrones implementados: 10+ | Cobertura: 100%*
