# Principios SOLID - Proyecto Mandorla

## Propósito

Estas reglas aseguran que el código generado siga los principios SOLID, creando un sistema mantenible, extensible y testeable para el e-commerce de panadería Mandorla.

## S - Single Responsibility Principle (SRP)

### Principio de Responsabilidad Única

Cada clase o función debe tener una sola razón para cambiar.

### Reglas de Aplicación

**Para Entidades de Dominio**

```typescript
// ✅ CORRECTO: ProductEntity solo maneja lógica del producto
export class ProductEntity {
  constructor(
    private readonly _id: ProductId,
    private _name: string,
    private _price: Money,
    private _category: ProductCategory
  ) {}

  // ✅ Solo métodos relacionados con el producto
  updatePrice(newPrice: Money): void {
    this.validatePrice(newPrice);
    this._price = newPrice;
  }

  changeCategory(category: ProductCategory): void {
    this._category = category;
  }

  private validatePrice(price: Money): void {
    if (price.value <= 0) {
      throw new InvalidPriceError('El precio debe ser mayor a cero');
    }
  }
}

// ❌ INCORRECTO: ProductEntity con múltiples responsabilidades
export class ProductEntity {
  // ❌ No debe manejar persistencia
  async save(): Promise<void> {
    // lógica de base de datos
  }

  // ❌ No debe manejar notificaciones
  async notifyPriceChange(): Promise<void> {
    // lógica de email
  }

  // ❌ No debe manejar validaciones de UI
  validateForUI(): ValidationResult {
    // lógica de validación de formularios
  }
}
```

**Para Servicios de Aplicación**

```typescript
// ✅ CORRECTO: ProductService solo maneja casos de uso de productos
export class ProductService {
  constructor(private productRepository: IProductRepository) {}

  async createProduct(data: CreateProductDto): Promise<ProductEntity> {
    const product = ProductEntity.create(data);
    await this.productRepository.save(product);
    return product;
  }

  async updateProductPrice(id: string, newPrice: number): Promise<void> {
    const product = await this.productRepository.findById(ProductId.create(id));
    if (!product) {
      throw new ProductNotFoundError(id);
    }
    
    product.updatePrice(Money.create(newPrice));
    await this.productRepository.save(product);
  }
}

// ❌ INCORRECTO: Servicio con múltiples responsabilidades
export class ProductService {
  // ❌ No debe manejar carrito
  async addToCart(productId: string, cartId: string): Promise<void> {}

  // ❌ No debe manejar pedidos
  async createOrder(products: Product[]): Promise<Order> {}

  // ❌ No debe manejar emails
  async sendProductNotification(productId: string): Promise<void> {}
}
```

### Detección de Violaciones SRP

- Clases con más de 5-7 métodos públicos
- Métodos que manejan múltiples conceptos de negocio
- Clases que importan de múltiples dominios
- Nombres de clase con "And", "Manager", "Handler" genéricos

## O - Open/Closed Principle (OCP)

### Principio Abierto/Cerrado

Las entidades deben estar abiertas para extensión pero cerradas para modificación.

### Reglas de Aplicación

**Usando Interfaces y Polimorfismo**

```typescript
// ✅ CORRECTO: Interface abierta para extensión
export interface IPaymentProcessor {
  processPayment(amount: Money, paymentData: PaymentData): Promise<PaymentResult>;
}

// ✅ Implementaciones específicas sin modificar la interface
export class CreditCardProcessor implements IPaymentProcessor {
  async processPayment(amount: Money, paymentData: PaymentData): Promise<PaymentResult> {
    // Lógica específica para tarjeta de crédito
    return new PaymentResult(true, 'Pago procesado con tarjeta');
  }
}

export class PayPalProcessor implements IPaymentProcessor {
  async processPayment(amount: Money, paymentData: PaymentData): Promise<PaymentResult> {
    // Lógica específica para PayPal
    return new PaymentResult(true, 'Pago procesado con PayPal');
  }
}

// ✅ Servicio cerrado para modificación, abierto para extensión
export class PaymentService {
  constructor(private paymentProcessor: IPaymentProcessor) {}

  async processOrderPayment(order: Order): Promise<PaymentResult> {
    return await this.paymentProcessor.processPayment(
      order.getTotal(),
      order.getPaymentData()
    );
  }
}
```

**Usando Strategy Pattern**

```typescript
// ✅ CORRECTO: Estrategias de descuento extensibles
export interface IDiscountStrategy {
  calculateDiscount(order: Order): Money;
}

export class PercentageDiscountStrategy implements IDiscountStrategy {
  constructor(private percentage: number) {}

  calculateDiscount(order: Order): Money {
    const total = order.getTotal();
    return Money.create(total.value * (this.percentage / 100));
  }
}

export class FixedAmountDiscountStrategy implements IDiscountStrategy {
  constructor(private amount: Money) {}

  calculateDiscount(order: Order): Money {
    return this.amount;
  }
}

// ✅ Contexto que usa estrategias sin modificarse
export class OrderService {
  async applyDiscount(order: Order, strategy: IDiscountStrategy): Promise<void> {
    const discount = strategy.calculateDiscount(order);
    order.applyDiscount(discount);
  }
}
```

**Evitando Modificaciones Directas**

```typescript
// ❌ INCORRECTO: Modificar clase existente para nueva funcionalidad
export class ProductService {
  async createProduct(data: CreateProductDto): Promise<ProductEntity> {
    // lógica original
  }

  // ❌ Agregar método modifica la clase existente
  async createBulkProducts(products: CreateProductDto[]): Promise<ProductEntity[]> {
    // nueva funcionalidad que modifica la clase
  }
}

// ✅ CORRECTO: Extender funcionalidad sin modificar
export class BulkProductService extends ProductService {
  async createBulkProducts(products: CreateProductDto[]): Promise<ProductEntity[]> {
    const results: ProductEntity[] = [];
    for (const productData of products) {
      const product = await this.createProduct(productData);
      results.push(product);
    }
    return results;
  }
}
```

## L - Liskov Substitution Principle (LSP)

### Principio de Sustitución de Liskov

Los objetos de una superclase deben ser reemplazables por objetos de sus subclases sin alterar el funcionamiento del programa.

### Reglas de Aplicación

**Contratos Consistentes**

```typescript
// ✅ CORRECTO: Subclases mantienen el contrato
export abstract class PaymentMethod {
  abstract processPayment(amount: Money): Promise<PaymentResult>;
  
  // Precondición: amount debe ser positivo
  protected validateAmount(amount: Money): void {
    if (amount.value <= 0) {
      throw new InvalidAmountError('El monto debe ser positivo');
    }
  }
}

export class CreditCardPayment extends PaymentMethod {
  async processPayment(amount: Money): Promise<PaymentResult> {
    // ✅ Mantiene la precondición
    this.validateAmount(amount);
    
    // ✅ Cumple el contrato: siempre retorna PaymentResult
    return new PaymentResult(true, 'Procesado con tarjeta');
  }
}

export class CashPayment extends PaymentMethod {
  async processPayment(amount: Money): Promise<PaymentResult> {
    // ✅ Mantiene la precondición
    this.validateAmount(amount);
    
    // ✅ Cumple el contrato
    return new PaymentResult(true, 'Pago en efectivo registrado');
  }
}

// ❌ INCORRECTO: Subclase que viola el contrato
export class InvalidPayment extends PaymentMethod {
  async processPayment(amount: Money): Promise<PaymentResult> {
    // ❌ Viola precondición: acepta montos negativos
    if (amount.value < -100) {
      throw new Error('Monto demasiado negativo');
    }
    
    // ❌ Viola postcondición: puede retornar null
    return null as any;
  }
}
```

**Comportamiento Consistente**

```typescript
// ✅ CORRECTO: Todas las implementaciones son intercambiables
export interface IProductRepository {
  findById(id: ProductId): Promise<ProductEntity | null>;
  save(product: ProductEntity): Promise<void>;
}

export class InMemoryProductRepository implements IProductRepository {
  private products = new Map<string, ProductEntity>();

  async findById(id: ProductId): Promise<ProductEntity | null> {
    return this.products.get(id.value) || null;
  }

  async save(product: ProductEntity): Promise<void> {
    this.products.set(product.id.value, product);
  }
}

export class DatabaseProductRepository implements IProductRepository {
  async findById(id: ProductId): Promise<ProductEntity | null> {
    // Implementación con base de datos
    const data = await this.db.findOne({ id: id.value });
    return data ? ProductEntity.fromPersistence(data) : null;
  }

  async save(product: ProductEntity): Promise<void> {
    await this.db.save(product.toPersistence());
  }
}
```

## I - Interface Segregation Principle (ISP)

### Principio de Segregación de Interfaces

Los clientes no deben depender de interfaces que no usan.

### Reglas de Aplicación

**Interfaces Específicas**

```typescript
// ❌ INCORRECTO: Interface muy amplia
export interface IProductOperations {
  // Operaciones de lectura
  findById(id: string): Promise<Product>;
  findAll(): Promise<Product[]>;
  search(criteria: SearchCriteria): Promise<Product[]>;
  
  // Operaciones de escritura
  create(product: Product): Promise<void>;
  update(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
  
  // Operaciones de inventario
  updateStock(id: string, quantity: number): Promise<void>;
  reserveStock(id: string, quantity: number): Promise<void>;
  
  // Operaciones de precios
  updatePrice(id: string, price: number): Promise<void>;
  applyDiscount(id: string, discount: number): Promise<void>;
}

// ✅ CORRECTO: Interfaces segregadas
export interface IProductReader {
  findById(id: string): Promise<Product>;
  findAll(): Promise<Product[]>;
  search(criteria: SearchCriteria): Promise<Product[]>;
}

export interface IProductWriter {
  create(product: Product): Promise<void>;
  update(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IProductInventory {
  updateStock(id: string, quantity: number): Promise<void>;
  reserveStock(id: string, quantity: number): Promise<void>;
}

export interface IProductPricing {
  updatePrice(id: string, price: number): Promise<void>;
  applyDiscount(id: string, discount: number): Promise<void>;
}
```

**Composición de Interfaces**

```typescript
// ✅ CORRECTO: Servicios usan solo las interfaces que necesitan
export class ProductDisplayService {
  constructor(private productReader: IProductReader) {}

  async getProductsForDisplay(): Promise<ProductDisplayDto[]> {
    const products = await this.productReader.findAll();
    return products.map(p => this.toDisplayDto(p));
  }
}

export class ProductManagementService {
  constructor(
    private productReader: IProductReader,
    private productWriter: IProductWriter
  ) {}

  async updateProduct(id: string, updates: ProductUpdates): Promise<void> {
    const product = await this.productReader.findById(id);
    if (product) {
      const updatedProduct = product.applyUpdates(updates);
      await this.productWriter.update(updatedProduct);
    }
  }
}

export class InventoryService {
  constructor(private productInventory: IProductInventory) {}

  async processStockUpdate(id: string, quantity: number): Promise<void> {
    await this.productInventory.updateStock(id, quantity);
  }
}
```

## D - Dependency Inversion Principle (DIP)

### Principio de Inversión de Dependencias

Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones.

### Reglas de Aplicación

**Inyección de Dependencias**

```typescript
// ✅ CORRECTO: Servicio depende de abstracción
export class OrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private paymentProcessor: IPaymentProcessor,
    private emailService: IEmailService
  ) {}

  async processOrder(orderData: CreateOrderDto): Promise<Order> {
    // Crear orden
    const order = Order.create(orderData);
    await this.orderRepository.save(order);

    // Procesar pago
    const paymentResult = await this.paymentProcessor.processPayment(
      order.getTotal(),
      orderData.paymentData
    );

    if (paymentResult.success) {
      order.markAsPaid();
      await this.orderRepository.save(order);
      
      // Enviar confirmación
      await this.emailService.sendOrderConfirmation(order);
    }

    return order;
  }
}

// ❌ INCORRECTO: Servicio depende de implementaciones concretas
export class OrderService {
  private orderRepository = new DatabaseOrderRepository(); // ❌
  private paymentProcessor = new StripePaymentProcessor(); // ❌
  private emailService = new SendGridEmailService(); // ❌

  async processOrder(orderData: CreateOrderDto): Promise<Order> {
    // Lógica acoplada a implementaciones específicas
  }
}
```

**Factory Pattern para Inversión**

```typescript
// ✅ CORRECTO: Factory que maneja dependencias
export interface IServiceFactory {
  createProductService(): ProductService;
  createOrderService(): OrderService;
  createCartService(): CartService;
}

export class ServiceFactory implements IServiceFactory {
  constructor(
    private productRepository: IProductRepository,
    private orderRepository: IOrderRepository,
    private cartRepository: ICartRepository,
    private emailService: IEmailService
  ) {}

  createProductService(): ProductService {
    return new ProductService(this.productRepository);
  }

  createOrderService(): OrderService {
    return new OrderService(
      this.orderRepository,
      new StripePaymentProcessor(),
      this.emailService
    );
  }

  createCartService(): CartService {
    return new CartService(this.cartRepository);
  }
}
```

**Configuración de Dependencias**

```typescript
// ✅ CORRECTO: Configuración centralizada de dependencias
export class DependencyContainer {
  private static instance: DependencyContainer;
  private services = new Map<string, any>();

  static getInstance(): DependencyContainer {
    if (!this.instance) {
      this.instance = new DependencyContainer();
    }
    return this.instance;
  }

  register<T>(key: string, factory: () => T): void {
    this.services.set(key, factory);
  }

  resolve<T>(key: string): T {
    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service ${key} not registered`);
    }
    return factory();
  }

  // Configuración de servicios
  configure(): void {
    // Repositorios
    this.register('IProductRepository', () => new DatabaseProductRepository());
    this.register('IOrderRepository', () => new DatabaseOrderRepository());
    
    // Servicios
    this.register('ProductService', () => 
      new ProductService(this.resolve('IProductRepository'))
    );
    
    this.register('OrderService', () => 
      new OrderService(
        this.resolve('IOrderRepository'),
        new StripePaymentProcessor(),
        new SendGridEmailService()
      )
    );
  }
}
```

## Validaciones Automáticas de SOLID

### Detección de Violaciones SRP

```typescript
// Reglas conceptuales para detectar violaciones
{
  rules: {
    'mandorla/single-responsibility': {
      'max-methods': 7,
      'max-imports-from-different-domains': 2,
      'detect-multiple-concerns': true
    }
  }
}
```

### Detección de Violaciones OCP

```typescript
{
  rules: {
    'mandorla/open-closed': {
      'prefer-composition-over-inheritance': true,
      'require-interfaces-for-extension': true,
      'detect-direct-modifications': true
    }
  }
}
```

### Detección de Violaciones LSP

```typescript
{
  rules: {
    'mandorla/liskov-substitution': {
      'validate-contract-consistency': true,
      'check-precondition-strengthening': true,
      'check-postcondition-weakening': true
    }
  }
}
```

### Detección de Violaciones ISP

```typescript
{
  rules: {
    'mandorla/interface-segregation': {
      'max-interface-methods': 5,
      'detect-unused-interface-methods': true,
      'suggest-interface-splitting': true
    }
  }
}
```

### Detección de Violaciones DIP

```typescript
{
  rules: {
    'mandorla/dependency-inversion': {
      'require-interface-dependencies': true,
      'detect-concrete-dependencies': true,
      'enforce-dependency-injection': true
    }
  }
}
```

## Beneficios de Aplicar SOLID

### Mantenibilidad

- Código más fácil de entender y modificar
- Cambios aislados y predecibles
- Menos efectos secundarios

### Testabilidad

- Fácil creación de mocks y stubs
- Tests unitarios más simples
- Mejor cobertura de código

### Extensibilidad

- Nuevas funcionalidades sin modificar código existente
- Polimorfismo para comportamientos variables
- Composición flexible de servicios

### Reutilización

- Componentes más granulares y específicos
- Interfaces claras y bien definidas
- Menor acoplamiento entre módulos

## Aplicación Específica en Mandorla

### Módulo de Productos

- **SRP**: ProductEntity solo maneja lógica de producto
- **OCP**: Estrategias de descuento extensibles
- **LSP**: Diferentes tipos de productos intercambiables
- **ISP**: Interfaces separadas para lectura/escritura
- **DIP**: ProductService depende de IProductRepository

### Módulo de Carrito

- **SRP**: CartEntity solo maneja operaciones de carrito
- **OCP**: Diferentes estrategias de cálculo de precios
- **LSP**: Diferentes implementaciones de persistencia
- **ISP**: Interfaces específicas para operaciones de carrito
- **DIP**: CartService usa abstracciones

### Módulo de Pedidos

- **SRP**: OrderEntity solo maneja lógica de pedidos
- **OCP**: Diferentes procesadores de pago
- **LSP**: Diferentes métodos de entrega
- **ISP**: Interfaces segregadas por responsabilidad
- **DIP**: OrderService depende de abstracciones
