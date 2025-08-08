"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface ChunkInfo {
  name: string;
  size: number;
  loaded: boolean;
  loadTime?: number;
}

interface PerformanceMetrics {
  chunks: ChunkInfo[];
  totalSize: number;
  loadedSize: number;
  averageLoadTime: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    chunks: [],
    totalSize: 0,
    loadedSize: 0,
    averageLoadTime: 0
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Solo mostrar en desarrollo
    if (process.env.NODE_ENV !== 'development') return;

    // Simular métricas de chunks (en producción esto vendría de webpack stats)
    const mockChunks: ChunkInfo[] = [
      { name: 'productos.chunk.js', size: 45000, loaded: true, loadTime: 120 },
      { name: 'carrito.chunk.js', size: 32000, loaded: true, loadTime: 95 },
      { name: 'ui-components.chunk.js', size: 78000, loaded: true, loadTime: 180 },
      { name: 'radix-ui.chunk.js', size: 156000, loaded: true, loadTime: 250 },
      { name: 'lucide-react.chunk.js', size: 23000, loaded: true, loadTime: 80 },
      { name: 'checkout.chunk.js', size: 28000, loaded: false },
      { name: 'favorites.chunk.js', size: 18000, loaded: false },
    ];

    const totalSize = mockChunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const loadedSize = mockChunks
      .filter(chunk => chunk.loaded)
      .reduce((sum, chunk) => sum + chunk.size, 0);
    
    const loadedChunks = mockChunks.filter(chunk => chunk.loaded && chunk.loadTime);
    const averageLoadTime = loadedChunks.length > 0
      ? loadedChunks.reduce((sum, chunk) => sum + (chunk.loadTime || 0), 0) / loadedChunks.length
      : 0;

    setMetrics({
      chunks: mockChunks,
      totalSize,
      loadedSize,
      averageLoadTime
    });
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const formatSize = (bytes: number) => {
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const loadedPercentage = (metrics.loadedSize / metrics.totalSize) * 100;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
      >
        {isVisible ? 'Ocultar' : 'Performance'}
      </button>

      {isVisible && (
        <Card className="w-80 max-h-96 overflow-auto">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Code Splitting Monitor</CardTitle>
            <div className="text-xs text-muted-foreground">
              Cargado: {formatSize(metrics.loadedSize)} / {formatSize(metrics.totalSize)} 
              ({loadedPercentage.toFixed(1)}%)
            </div>
          </CardHeader>
          
          <CardContent className="space-y-2">
            <div className="text-xs">
              <div className="flex justify-between mb-1">
                <span>Tiempo promedio de carga:</span>
                <span>{metrics.averageLoadTime.toFixed(0)}ms</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium">Chunks:</div>
              {metrics.chunks.map((chunk) => (
                <div key={chunk.name} className="flex items-center justify-between text-xs">
                  <span className="truncate flex-1">{chunk.name}</span>
                  <div className="flex items-center gap-2">
                    <span>{formatSize(chunk.size)}</span>
                    <Badge 
                      variant={chunk.loaded ? 'default' : 'secondary'}
                      className="text-xs px-1 py-0"
                    >
                      {chunk.loaded ? 'Cargado' : 'Lazy'}
                    </Badge>
                    {chunk.loadTime && (
                      <span className="text-muted-foreground">
                        {chunk.loadTime}ms
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}