# Estructura del Proyecto

## Organización de Carpetas

### Raíz del Proyecto

```
├── .env.local              # Variables de entorno locales
├── .kiro/                  # Configuración de Kiro
├── components.json         # Configuración de shadcn/ui
├── next.config.mjs         # Configuración de Next.js
├── package.json            # Dependencias y scripts
├── tailwind.config.ts      # Configuración de Tailwind CSS
├── tsconfig.json           # Configuración de TypeScript
├── public/                 # Archivos estáticos
├── lib/                    # Utilidades compartidas
└── types/                  # Definiciones de tipos TypeScript
```

### Directorio `src/`

```
src/
├── app/                    # App Router de Next.js (páginas y rutas)
│   ├── about/             # Página acerca de
│   ├── api/               # Rutas API
│   ├── cart/              # Página del carrito
│   ├── contact/           # Página de contacto
│   ├── favorites/         # Página de favoritos
│   ├── order-confirmation/ # Confirmación de pedido
│   ├── products/          # Páginas de productos
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de inicio
├── components/            # Componentes React reutilizables
│   ├── cart/             # Componentes del carrito
│   ├── checkout/         # Componentes de checkout
│   ├── emails/           # Plantillas de email
│   ├── favorites/        # Componentes de favoritos
│   ├── layout/           # Componentes de layout
│   ├── products/         # Componentes de productos
│   ├── sections/         # Secciones de página
│   └── ui/               # Componentes UI base (shadcn/ui)
├── data/                 # Datos mock y configuración
├── hooks/                # Hooks personalizados de React
├── lib/                  # Utilidades y configuración
├── stores/               # Stores de Zustand
└── utils/                # Funciones utilitarias
```

### Directorio `types/`

```
types/
├── cart.ts               # Tipos del carrito de compras
├── customer.ts           # Tipos de cliente y pedidos
└── product.ts            # Tipos de productos
```

## Convenciones de Arquitectura

### Componentes

- Componentes UI base en `src/components/ui/` (generados por shadcn/ui)
- Componentes de dominio organizados por funcionalidad
- Componentes de layout separados para reutilización

### Estado

- Stores de Zustand para estado global (carrito, favoritos)
- Hooks personalizados para lógica reutilizable
- Local Storage para persistencia del lado del cliente

### Rutas

- App Router de Next.js con estructura de carpetas
- Rutas API en `src/app/api/`
- Páginas dinámicas usando convenciones de Next.js

### Tipos

- Definiciones centralizadas en directorio `types/`
- Interfaces para entidades principales (Product, Customer, Order, Cart)
- Tipos extendidos para funcionalidad específica

### Estilos

- Tailwind CSS con configuración personalizada
- Variables CSS para colores de marca
- Componentes con variantes usando class-variance-authority
