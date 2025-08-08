/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placeholder.svg',
      },
    ],
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Configuración de webpack para optimizar chunks
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!dev && !isServer) {
      // Configurar splitChunks para separar módulos
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Chunk para módulos de dominio
          modules: {
            name: 'modules',
            test: /[\\/]src[\\/]modules[\\/]/,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
          // Chunk para componentes UI
          ui: {
            name: 'ui-components',
            test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
            chunks: 'all',
            priority: 8,
            reuseExistingChunk: true,
          },
          // Chunk para Radix UI
          radix: {
            name: 'radix-ui',
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            chunks: 'all',
            priority: 15,
            reuseExistingChunk: true,
          },
          // Chunk para Lucide React
          lucide: {
            name: 'lucide-react',
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            chunks: 'all',
            priority: 12,
            reuseExistingChunk: true,
          },
          // Chunk común para librerías compartidas
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },
}

export default nextConfig
