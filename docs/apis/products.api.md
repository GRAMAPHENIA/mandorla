# API de Productos - Mandorla

## Información General

- **Versión**: 1.0.0
- **Base URL**: `/api/products`
- **Descripción**: API para gestión completa del catálogo de productos de la panadería Mandorla
- **Autenticación**: No requerida para operaciones de lectura
- **Rate Limiting**: 100 requests/minuto por IP

## Endpoints

### Listar Productos

**GET** `/api/products`

Obtiene la lista completa de productos disponibles con opciones de filtrado y paginación.

#### Parámetros de Query

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| categoria | `string` | ❌ | `'todos'` | Filtrar por categoría: `'galletas'`, `'pasteles'`, `'panes'`, `'temporada'`, `'todos'` |
| disponible | `boolean` | ❌ | `true` | Solo productos disponibles |
| limite | `number` | ❌ | `10` | Número de productos por página (máx: 50) |
| pagina | `number` | ❌ | `1` | Número de página |
| ordenar | `string` | ❌ | `'nombre'` | Ordenar por: `'nombre'`, `'precio'`, `'fecha'` |
| direccion | `string` | ❌ | `'asc'` | Dirección: `'asc'`, `'desc'` |
| buscar | `string` | ❌ | - | Búsqueda por nombre o descripción |

#### Respuesta Exitosa (200)

```json
{
  "success": true,
  "data": {
    "productos": [
      {
        "id": "prod-001",
        "nombre": "Croissants de Mantequilla",
        "descripcion": "Deliciosos croissants artesanales con mantequilla francesa",
        "precio": 1200,
        "categoria": "pasteles",
        "imagen": "/images/croissants-mantequilla.jpg",
        "disponible": true,
        "stock": 15,
        "ingredientes": ["harina", "mantequilla", "levadura", "sal"],
        "alergenos": ["gluten", "lactosa"],
        "fechaCreacion": "2024-01-15T10:30:00Z",
        "fechaActualizacion": "2024-12-19T14:20:00Z"
      },
      {
        "id": "prod-002", 
        "nombre": "Pan Integral Artesanal",
        "descripcion": "Pan integral con semillas, horneado diariamente",
        "precio": 2500,
        "categoria": "panes",
        "imagen": "/images/pan-integral.jpg",
        "disponible": true,
        "stock": 8,
        "ingredientes": ["harina integral", "semillas", "sal", "levadura"],
        "alergenos": ["gluten"],
        "fechaCreacion": "2024-01-10T08:00:00Z",
        "fechaActualizacion": "2024-12-19T09:15:00Z"
      }
    ],
    "paginacion": {
      "pagina": 1,
      "limite": 10,
      "total": 25,
      "totalPaginas": 3,
      "tieneSiguiente": true,
      "tieneAnterior": false
    }
  },
  "meta": {
    "timestamp": "2024-12-19T15:30:00Z",
    "requestId": "req-12345"
  }
}
```

#### Ejemplo de Uso

```bash
# Obtener todos los productos
curl -X GET "http://localhost:3000/api/products"

# Filtrar por categoría galletas
curl -X GET "http://localhost:3000/api/products?categoria=galletas"

# Buscar productos con paginación
curl -X GET "http://localhost:3000/api/products?buscar=chocolate&limite=5&pagina=2"

# Ordenar por precio descendente
curl -X GET "http://localhost:3000/api/products?ordenar=precio&direccion=desc"
```

```typescript
// Usando fetch en TypeScript
const obtenerProductos = async (filtros?: FiltrosProductos) => {
  const params = new URLSearchParams()
  
  if (filtros?.categoria) params.append('categoria', filtros.categoria)
  if (filtros?.buscar) params.append('buscar', filtros.buscar)
  if (filtros?.limite) params.append('limite', filtros.limite.toString())
  
  const response = await fetch(`/api/products?${params}`)
  const data = await response.json()
  
  if (data.success) {
    return data.data.productos
  } else {
    throw new Error(data.error.message)
  }
}

// Ejemplo de uso en componente React
function ListaProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const productosObtenidos = await obtenerProductos({
          categoria: 'galletas',
          disponible: true
        })
        setProductos(productosObtenidos)
      } catch (error) {
        console.error('Error al cargar productos:', error)
      } finally {
        setLoading(false)
      }
    }
    
    cargarProductos()
  }, [])
  
  if (loading) return <div>Cargando productos...</div>
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {productos.map(producto => (
        <TarjetaProducto key={producto.id} producto={producto} />
      ))}
    </div>
  )
}
```

---

### Obtener Producto Específico

**GET** `/api/products/[id]`

Obtiene los detalles completos de un producto específico por su ID.

#### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | `string` | ID único del producto (formato: `prod-XXX`) |

#### Respuesta Exitosa (200)

```json
{
  "success": true,
  "data": {
    "id": "prod-001",
    "nombre": "Croissants de Mantequilla",
    "descripcion": "Deliciosos croissants artesanales elaborados con mantequilla francesa de primera calidad. Horneados frescos cada mañana siguiendo recetas tradicionales.",
    "precio": 1200,
    "categoria": "pasteles",
    "imagen": "/images/croissants-mantequilla.jpg",
    "galeria": [
      "/images/croissants-1.jpg",
      "/images/croissants-2.jpg",
      "/images/croissants-proceso.jpg"
    ],
    "disponible": true,
    "stock": 15,
    "ingredientes": ["harina de trigo", "mantequilla francesa", "levadura fresca", "sal marina", "azúcar"],
    "alergenos": ["gluten", "lactosa"],
    "informacionNutricional": {
      "calorias": 280,
      "grasas": 18,
      "carbohidratos": 24,
      "proteinas": 6,
      "fibra": 2,
      "sodio": 320
    },
    "tiempoPreparacion": "24 horas",
    "conservacion": "Consumir preferentemente el mismo día. Conservar en lugar fresco y seco.",
    "peso": 85,
    "fechaCreacion": "2024-01-15T10:30:00Z",
    "fechaActualizacion": "2024-12-19T14:20:00Z",
    "valoraciones": {
      "promedio": 4.8,
      "total": 127,
      "distribucion": {
        "5": 89,
        "4": 28,
        "3": 8,
        "2": 2,
        "1": 0
      }
    }
  }
}
```

#### Respuesta de Error (404)

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "type": "not-found",
    "message": "Producto con ID 'prod-999' no encontrado",
    "details": {
      "productId": "prod-999"
    }
  },
  "meta": {
    "timestamp": "2024-12-19T15:30:00Z"
  }
}
```

#### Ejemplo de Uso

```bash
# Obtener producto específico
curl -X GET "http://localhost:3000/api/products/prod-001"
```

```typescript
// Hook personalizado para obtener producto
function useProducto(productoId: string) {
  const [producto, setProducto] = useState<Producto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const obtenerProducto = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/products/${productoId}`)
        const data = await response.json()
        
        if (data.success) {
          setProducto(data.data)
        } else {
          setError(data.error.message)
        }
      } catch (err) {
        setError('Error al cargar el producto')
      } finally {
        setLoading(false)
      }
    }
    
    if (productoId) {
      obtenerProducto()
    }
  }, [productoId])
  
  return { producto, loading, error }
}

// Uso en componente
function DetalleProducto({ productoId }: { productoId: string }) {
  const { producto, loading, error } = useProducto(productoId)
  
  if (loading) return <SkeletonProducto />
  if (error) return <ErrorProducto mensaje={error} />
  if (!producto) return <ProductoNoEncontrado />
  
  return (
    <div className="detalle-producto">
      <h1>{producto.nombre}</h1>
      <p className="precio">${producto.precio}</p>
      <p className="descripcion">{producto.descripcion}</p>
      
      <div className="ingredientes">
        <h3>Ingredientes:</h3>
        <ul>
          {producto.ingredientes.map(ingrediente => (
            <li key={ingrediente}>{ingrediente}</li>
          ))}
        </ul>
      </div>
      
      <BotonAgregarCarrito producto={producto} />
    </div>
  )
}
```

---

### Buscar Productos

**POST** `/api/products/search`

Búsqueda avanzada de productos con múltiples criterios y filtros.

#### Body de la Solicitud

```json
{
  "termino": "chocolate",
  "filtros": {
    "categorias": ["galletas", "pasteles"],
    "precioMinimo": 500,
    "precioMaximo": 3000,
    "disponible": true,
    "conStock": true,
    "alergenos": {
      "excluir": ["nueces", "maní"],
      "incluir": []
    },
    "ingredientes": {
      "incluir": ["chocolate"],
      "excluir": ["azúcar refinada"]
    }
  },
  "ordenamiento": {
    "campo": "precio",
    "direccion": "asc"
  },
  "paginacion": {
    "pagina": 1,
    "limite": 20
  }
}
```

#### Respuesta Exitosa (200)

```json
{
  "success": true,
  "data": {
    "productos": [
      {
        "id": "prod-015",
        "nombre": "Galletas de Chocolate Artesanales",
        "descripcion": "Galletas crujientes con chips de chocolate belga",
        "precio": 800,
        "categoria": "galletas",
        "imagen": "/images/galletas-chocolate.jpg",
        "disponible": true,
        "stock": 24,
        "relevancia": 0.95,
        "coincidencias": ["nombre", "ingredientes"]
      }
    ],
    "estadisticas": {
      "totalEncontrados": 8,
      "tiempoBusqueda": "45ms",
      "sugerencias": ["chocolate blanco", "brownie", "torta chocolate"]
    },
    "paginacion": {
      "pagina": 1,
      "limite": 20,
      "total": 8,
      "totalPaginas": 1
    }
  }
}
```

#### Ejemplo de Uso

```typescript
// Servicio de búsqueda avanzada
class ProductSearchService {
  async buscarProductos(criterios: CriteriosBusqueda): Promise<ResultadoBusqueda> {
    const response = await fetch('/api/products/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(criterios)
    })
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error.message)
    }
    
    return data.data
  }
}

// Hook para búsqueda con debounce
function useBusquedaProductos() {
  const [termino, setTermino] = useState('')
  const [resultados, setResultados] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  
  const buscarProductos = useMemo(
    () => debounce(async (terminoBusqueda: string) => {
      if (!terminoBusqueda.trim()) {
        setResultados([])
        return
      }
      
      setLoading(true)
      try {
        const searchService = new ProductSearchService()
        const resultado = await searchService.buscarProductos({
          termino: terminoBusqueda,
          filtros: {
            disponible: true,
            conStock: true
          }
        })
        
        setResultados(resultado.productos)
      } catch (error) {
        console.error('Error en búsqueda:', error)
        setResultados([])
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )
  
  useEffect(() => {
    buscarProductos(termino)
  }, [termino, buscarProductos])
  
  return {
    termino,
    setTermino,
    resultados,
    loading
  }
}
```

---

### Crear Producto

**POST** `/api/products`

Crea un nuevo producto en el catálogo. Requiere autenticación de administrador.

#### Body de la Solicitud

```json
{
  "nombre": "Empanadas de Carne Caseras",
  "descripcion": "Empanadas artesanales con relleno de carne, cebolla y especias tradicionales",
  "precio": 1800,
  "categoria": "temporada",
  "imagen": "/images/empanadas-carne.jpg",
  "stock": 20,
  "ingredientes": ["masa de empanada", "carne molida", "cebolla", "pimiento", "comino", "pimentón"],
  "alergenos": ["gluten"],
  "peso": 120,
  "tiempoPreparacion": "2 horas",
  "conservacion": "Consumir caliente. Se puede refrigerar hasta 3 días."
}
```

#### Validación con Zod

```typescript
const CrearProductoSchema = z.object({
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  descripcion: z.string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  
  precio: z.number()
    .positive('El precio debe ser mayor a 0')
    .max(100000, 'El precio no puede exceder $100,000'),
  
  categoria: z.enum(['galletas', 'pasteles', 'panes', 'temporada'], {
    errorMap: () => ({ message: 'Categoría inválida' })
  }),
  
  stock: z.number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo'),
  
  ingredientes: z.array(z.string())
    .min(1, 'Debe especificar al menos un ingrediente'),
  
  alergenos: z.array(z.string()).optional(),
  
  imagen: z.string()
    .url('La imagen debe ser una URL válida')
    .optional()
})
```

#### Respuesta Exitosa (201)

```json
{
  "success": true,
  "data": {
    "id": "prod-026",
    "nombre": "Empanadas de Carne Caseras",
    "descripcion": "Empanadas artesanales con relleno de carne, cebolla y especias tradicionales",
    "precio": 1800,
    "categoria": "temporada",
    "imagen": "/images/empanadas-carne.jpg",
    "disponible": true,
    "stock": 20,
    "ingredientes": ["masa de empanada", "carne molida", "cebolla", "pimiento", "comino", "pimentón"],
    "alergenos": ["gluten"],
    "fechaCreacion": "2024-12-19T15:45:00Z",
    "fechaActualizacion": "2024-12-19T15:45:00Z"
  },
  "message": "Producto creado exitosamente"
}
```

---

## Códigos de Estado HTTP

| Código | Descripción | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa (GET, PUT) |
| 201 | Created | Producto creado exitosamente |
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | Autenticación requerida |
| 403 | Forbidden | Sin permisos para la operación |
| 404 | Not Found | Producto no encontrado |
| 409 | Conflict | Producto duplicado |
| 422 | Unprocessable Entity | Validación de negocio fallida |
| 500 | Internal Server Error | Error interno del servidor |

## Esquemas de Validación

### Producto Base

```typescript
interface Producto {
  id: string                    // Formato: prod-XXX
  nombre: string               // 3-100 caracteres
  descripcion: string          // 10-500 caracteres  
  precio: number              // > 0, <= 100000
  categoria: CategoriaProducto // Enum válido
  imagen?: string             // URL válida
  disponible: boolean         // Default: true
  stock: number              // >= 0
  ingredientes: string[]     // Mínimo 1 elemento
  alergenos?: string[]       // Opcional
  fechaCreacion: string      // ISO 8601
  fechaActualizacion: string // ISO 8601
}

type CategoriaProducto = 'galletas' | 'pasteles' | 'panes' | 'temporada'
```

### Filtros de Búsqueda

```typescript
interface FiltrosProductos {
  categoria?: CategoriaProducto | 'todos'
  disponible?: boolean
  precioMinimo?: number
  precioMaximo?: number
  buscar?: string
  alergenos?: {
    incluir?: string[]
    excluir?: string[]
  }
  ingredientes?: {
    incluir?: string[]
    excluir?: string[]
  }
}
```

## Ejemplos de Integración

### Componente de Catálogo Completo

```typescript
function CatalogoProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [filtros, setFiltros] = useState<FiltrosProductos>({})
  const [loading, setLoading] = useState(false)
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    limite: 12,
    total: 0
  })
  
  const cargarProductos = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        ...filtros,
        pagina: paginacion.pagina.toString(),
        limite: paginacion.limite.toString()
      })
      
      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setProductos(data.data.productos)
        setPaginacion(prev => ({
          ...prev,
          total: data.data.paginacion.total
        }))
      }
    } catch (error) {
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [filtros, paginacion.pagina, paginacion.limite])
  
  useEffect(() => {
    cargarProductos()
  }, [cargarProductos])
  
  return (
    <div className="catalogo-productos">
      <FiltrosProductos 
        filtros={filtros}
        onChange={setFiltros}
      />
      
      {loading ? (
        <SkeletonGrid />
      ) : (
        <GridProductos productos={productos} />
      )}
      
      <PaginacionProductos
        paginacion={paginacion}
        onChange={setPaginacion}
      />
    </div>
  )
}
```

## Testing de la API

### Tests de Integración

```typescript
describe('Products API', () => {
  describe('GET /api/products', () => {
    it('debería retornar lista de productos', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200)
      
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data.productos)).toBe(true)
      expect(response.body.data.paginacion).toBeDefined()
    })
    
    it('debería filtrar por categoría', async () => {
      const response = await request(app)
        .get('/api/products?categoria=galletas')
        .expect(200)
      
      const productos = response.body.data.productos
      productos.forEach(producto => {
        expect(producto.categoria).toBe('galletas')
      })
    })
  })
  
  describe('POST /api/products/search', () => {
    it('debería buscar productos por término', async () => {
      const criterios = {
        termino: 'chocolate',
        filtros: { disponible: true }
      }
      
      const response = await request(app)
        .post('/api/products/search')
        .send(criterios)
        .expect(200)
      
      const productos = response.body.data.productos
      productos.forEach(producto => {
        expect(
          producto.nombre.toLowerCase().includes('chocolate') ||
          producto.descripcion.toLowerCase().includes('chocolate')
        ).toBe(true)
      })
    })
  })
})
```

---

*Documentación generada automáticamente - Última actualización: 2024-12-19*
