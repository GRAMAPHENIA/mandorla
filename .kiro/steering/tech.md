# Stack Tecnológico

## Framework y Runtime
- **Next.js 15.2.4** - Framework de React con App Router
- **React 19** - Librería de UI
- **TypeScript 5** - Seguridad de tipos y experiencia de desarrollo
- **Node.js** - Entorno de ejecución

## Estilos y UI
- **Tailwind CSS 3.4.17** - Framework CSS utility-first
- **shadcn/ui** - Librería de componentes construida sobre primitivos de Radix UI
- **Radix UI** - Componentes UI headless para accesibilidad
- **Lucide React** - Librería de iconos
- **next-themes** - Soporte para tema oscuro/claro
- **tailwindcss-animate** - Utilidades de animación

## Gestión de Estado y Datos
- **Zustand** - Gestión de estado ligera
- **React Hook Form** - Manejo de formularios con validación Zod
- **Zod** - Validación de esquemas
- **Local Storage** - Persistencia del lado del cliente para carrito y favoritos

## Email y Comunicación
- **EmailJS** - Envío de emails del lado del cliente
- **SendGrid** - Servicio de email
- **Resend** - API de email
- **React Email** - Componentes de plantillas de email

## Herramientas de Desarrollo
- **pnpm** - Gestor de paquetes
- **ESLint** - Linting de código (errores de build ignorados)
- **PostCSS** - Procesamiento de CSS
- **Autoprefixer** - Prefijos de vendor CSS

## Comandos Comunes

### Desarrollo
```bash
pnpm dev          # Iniciar servidor de desarrollo
pnpm build        # Construir para producción
pnpm start        # Iniciar servidor de producción
pnpm lint         # Ejecutar ESLint
```

### Gestión de Paquetes
```bash
pnpm install      # Instalar dependencias
pnpm add <pkg>    # Agregar nueva dependencia
```

## Notas de Configuración
- Los errores de TypeScript y ESLint son ignorados durante builds
- Optimización de imágenes deshabilitada para compatibilidad con exportación estática
- Optimización experimental de importación de paquetes habilitada para Lucide React
- Alias de rutas configurados: `@/*` mapea a la raíz del proyecto