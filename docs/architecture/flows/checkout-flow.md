# Flujo de Checkout - Proceso Completo

## Descripción

Este diagrama documenta el flujo completo del proceso de checkout, desde la iniciación hasta la confirmación del pedido, mostrando todas las integraciones entre módulos.

## Flujo Principal de Checkout

```mermaid
flowchart TD
    Start([Usuario inicia Checkout]) --> ValidateCart{Validar Carrito}
    
    ValidateCart -->|Carrito vacío| EmptyCartError[Error: Carrito Vacío]
    ValidateCart -->|Carrito válido| ValidateCustomer{Validar Cliente}
    
    ValidateCustomer -->|Cliente inválido| CustomerError[Error: Cliente Inválido]
    ValidateCustomer -->|Cliente válido| SelectDelivery[Seleccionar Tipo de Entrega]
    
    SelectDelivery --> DeliveryType{Tipo de Entrega}
    
    DeliveryType -->|Retiro Local| LocalPickup[Configurar Retiro Local]
    DeliveryType -->|Delivery| ConfigureDelivery[Configurar Delivery]
    
    ConfigureDelivery --> CalculateShipping[Calcular Costo de Envío]
    CalculateShipping --> AddressValidation{Validar Dirección}
    
    AddressValidation -->|Dirección inválida| AddressError[Error: Dirección Inválida]
    AddressValidation -->|Dirección válida| SelectPayment[Seleccionar Método de Pago]
    
    LocalPickup --> SelectPayment
    
    SelectPayment --> PaymentMethod{Método de Pago}
    
    PaymentMethod -->|Mercado Pago| ConfigureMP[Configurar Mercado Pago]
    PaymentMethod -->|Efectivo| CashPayment[Pago en Efectivo]
    PaymentMethod -->|Transferencia| BankTransfer[Transferencia Bancaria]
    
    ConfigureMP --> CreateMPPreference[Crear Preferencia MP]
    CreateMPPreference --> CreateOrder[Crear Pedido]
    
    CashPayment --> CreateOrder
    BankTransfer --> CreateOrder
    
    CreateOrder --> UpdateCustomerStats[Actualizar Estadísticas Cliente]
    UpdateCustomerStats --> ClearCart[Limpiar Carrito]
    ClearCart --> Success([Checkout Exitoso])
    
    EmptyCartError --> End([Fin])
    CustomerError --> End
    AddressError --> End
    Success --> End
    
    style Start fill:#e8f5e8
    style Success fill:#c8e6c9
    style End fill:#ffcdd2
    style EmptyCartError fill:#ffcdd2
    style CustomerError fill:#ffcdd2
    style AddressError fill:#ffcdd2
```

## Flujo Detallado por Servicios

```mermaid
sequenceDiagram
    participant UI as CheckoutForm
    participant CF as CheckoutFacade
    participant CIS as CheckoutIntegrationService
    participant CS as ClienteService
    participant CARS as CarritoService
    participant PS as PedidoService
    participant PPS as PagoPedidoService
    participant PAGS as PagoService
    
    Note over UI,PAGS: Inicio del Proceso de Checkout
    
    UI->>CF: procesarCheckout(request)
    CF->>CIS: procesarCheckout(datosCheckout)
    
    Note over CIS: 1. Validación de Cliente
    CIS->>CS: obtenerCliente(clienteId)
    CS-->>CIS: ClienteDto
    
    alt Cliente no encontrado o inactivo
        CIS-->>CF: Error: Cliente inválido
        CF-->>UI: CheckoutResponse (error)
    else Cliente válido
        Note over CIS: 2. Validación de Carrito (implícita en datos)
        
        Note over CIS: 3. Creación de Pedido
        CIS->>PS: crearPedido(crearPedidoDto)
        PS-->>CIS: PedidoCreado
        
        CIS->>PS: obtenerPedido(pedidoId)
        PS-->>CIS: PedidoCompleto
        
        Note over CIS: 4. Configuración de Pago (si es necesario)
        alt Método de pago: Mercado Pago
            CIS->>PPS: configurarPagoMercadoPago(configuracion)
            PPS->>PAGS: crearPreferencia(datos)
            PAGS-->>PPS: PreferenciaCreada
            PPS-->>CIS: ConfiguracionPago
        end
        
        Note over CIS: 5. Actualización de Estadísticas
        CIS->>CS: registrarPedidoCliente(estadisticas)
        CS-->>CIS: EstadisticasActualizadas
        
        Note over CIS: 6. Preparación de Resultado
        CIS-->>CF: ResultadoCheckout
        CF-->>UI: CheckoutResponse (éxito)
    end
```

## Validaciones en Cada Paso

### 1. Validación de Carrito

```mermaid
flowchart LR
    A[Datos del Carrito] --> B{Items > 0?}
    B -->|No| C[Error: Carrito Vacío]
    B -->|Sí| D{Stock Disponible?}
    D -->|No| E[Error: Stock Insuficiente]
    D -->|Sí| F{Precios Actualizados?}
    F -->|No| G[Actualizar Precios]
    F -->|Sí| H[Carrito Válido]
    G --> H
```

### 2. Validación de Cliente

```mermaid
flowchart LR
    A[Cliente ID] --> B{Cliente Existe?}
    B -->|No| C[Error: Cliente No Encontrado]
    B -->|Sí| D{Cliente Activo?}
    D -->|No| E[Error: Cliente Inactivo]
    D -->|Sí| F{Puede Realizar Pedidos?}
    F -->|No| G[Error: Cliente Restringido]
    F -->|Sí| H[Cliente Válido]
```

### 3. Validación de Entrega

```mermaid
flowchart LR
    A[Tipo de Entrega] --> B{Retiro Local?}
    B -->|Sí| C[Validar Horarios]
    B -->|No| D[Delivery]
    
    C --> E{Horario Disponible?}
    E -->|No| F[Error: Horario No Disponible]
    E -->|Sí| G[Entrega Configurada]
    
    D --> H{Dirección Completa?}
    H -->|No| I[Error: Dirección Incompleta]
    H -->|Sí| J[Calcular Costo Envío]
    J --> K{Zona de Cobertura?}
    K -->|No| L[Error: Zona No Cubierta]
    K -->|Sí| G
```

## Manejo de Errores por Módulo

### Errores del Módulo Checkout

```mermaid
classDiagram
    class CheckoutError {
        +code: string
        +message: string
        +context: object
    }
    
    class CarritoVacioError {
        +code: "CARRITO_VACIO"
    }
    
    class DatosEntregaInvalidosError {
        +code: "DATOS_ENTREGA_INVALIDOS"
    }
    
    class PagoFallidoError {
        +code: "PAGO_FALLIDO"
    }
    
    CheckoutError <|-- CarritoVacioError
    CheckoutError <|-- DatosEntregaInvalidosError
    CheckoutError <|-- PagoFallidoError
```

### Propagación de Errores entre Módulos

```mermaid
flowchart TD
    subgraph "Errores de Módulos Dependientes"
        CE[ClienteNoEncontradoError]
        PE[ProductoNoEncontradoError]
        SE[StockInsuficienteError]
        PAE[PagoFallidoError]
    end
    
    subgraph "Procesamiento en Checkout"
        CIS[CheckoutIntegrationService]
    end
    
    subgraph "Errores de Checkout"
        CHE[CheckoutError]
        CVE[CarritoVacioError]
        DEI[DatosEntregaInvalidosError]
    end
    
    CE --> CIS
    PE --> CIS
    SE --> CIS
    PAE --> CIS
    
    CIS --> CHE
    CIS --> CVE
    CIS --> DEI
```

## Estados del Proceso de Checkout

```mermaid
stateDiagram-v2
    [*] --> Iniciando
    
    Iniciando --> ValidandoCliente : Datos recibidos
    ValidandoCliente --> ErrorCliente : Cliente inválido
    ValidandoCliente --> ValidandoCarrito : Cliente válido
    
    ValidandoCarrito --> ErrorCarrito : Carrito inválido
    ValidandoCarrito --> ConfigurandoEntrega : Carrito válido
    
    ConfigurandoEntrega --> ErrorEntrega : Datos de entrega inválidos
    ConfigurandoEntrega --> CreandoPedido : Entrega configurada
    
    CreandoPedido --> ErrorPedido : Error al crear pedido
    CreandoPedido --> ConfigurandoPago : Pedido creado
    
    ConfigurandoPago --> ErrorPago : Error en configuración de pago
    ConfigurandoPago --> ActualizandoEstadisticas : Pago configurado
    
    ActualizandoEstadisticas --> Completado : Estadísticas actualizadas
    
    ErrorCliente --> [*]
    ErrorCarrito --> [*]
    ErrorEntrega --> [*]
    ErrorPedido --> [*]
    ErrorPago --> [*]
    Completado --> [*]
```

## Métricas y Monitoreo

### Puntos de Medición

```mermaid
flowchart LR
    A[Inicio Checkout] -->|Tiempo| B[Validación Cliente]
    B -->|Tiempo| C[Validación Carrito]
    C -->|Tiempo| D[Configuración Entrega]
    D -->|Tiempo| E[Creación Pedido]
    E -->|Tiempo| F[Configuración Pago]
    F -->|Tiempo| G[Actualización Stats]
    G -->|Tiempo Total| H[Checkout Completo]
    
    B -->|Error Rate| ER1[Errores Cliente]
    C -->|Error Rate| ER2[Errores Carrito]
    D -->|Error Rate| ER3[Errores Entrega]
    E -->|Error Rate| ER4[Errores Pedido]
    F -->|Error Rate| ER5[Errores Pago]
```

### KPIs del Checkout

| Métrica | Descripción | Objetivo |
|---------|-------------|----------|
| Tiempo Total | Tiempo promedio de checkout completo | < 5 segundos |
| Tasa de Éxito | % de checkouts completados exitosamente | > 95% |
| Tasa de Abandono | % de checkouts iniciados pero no completados | < 10% |
| Errores por Módulo | Distribución de errores por módulo dependiente | Monitoreo |
| Métodos de Pago | Distribución de uso por método de pago | Análisis |

## Optimizaciones Implementadas

### 1. Validaciones Paralelas

- Validación de cliente y carrito en paralelo cuando es posible
- Validaciones tempranas para fallar rápido

### 2. Caching

- Cache de información de cliente frecuentemente accedida
- Cache de cálculos de envío por zona

### 3. Manejo de Errores

- Errores específicos con contexto detallado
- Logging estructurado para debugging
- Rollback automático en caso de fallas

## Última Actualización

- **Fecha**: 2025-01-19
- **Cambios**:
  - Documentado flujo completo de checkout con integraciones
  - Agregados diagramas de validación por paso
  - Documentado manejo de errores entre módulos
  - Agregadas métricas y puntos de monitoreo
