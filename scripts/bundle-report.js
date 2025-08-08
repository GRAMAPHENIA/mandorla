#!/usr/bin/env node

/**
 * Script para generar un reporte completo de análisis de bundles
 */

const fs = require('fs');
const path = require('path');
const { analyzeBundle } = require('./analyze-bundle');
const { analyzeTreeShaking, checkNextConfig } = require('./analyze-tree-shaking');

function generateBundleReport() {
  console.log('📊 Generando reporte completo de bundles...\n');
  
  const reportData = {
    timestamp: new Date().toISOString(),
    analysis: {
      bundles: [],
      treeShaking: [],
      recommendations: []
    }
  };

  // Ejecutar análisis
  console.log('='.repeat(60));
  console.log('📦 ANÁLISIS DE BUNDLES');
  console.log('='.repeat(60));
  analyzeBundle();

  console.log('\n' + '='.repeat(60));
  console.log('🌳 ANÁLISIS DE TREE SHAKING');
  console.log('='.repeat(60));
  analyzeTreeShaking();
  checkNextConfig();

  console.log('\n' + '='.repeat(60));
  console.log('💡 RECOMENDACIONES GENERALES');
  console.log('='.repeat(60));

  const recommendations = [
    {
      category: 'Code Splitting',
      items: [
        'Implementar lazy loading para rutas no críticas',
        'Separar vendor chunks de application chunks',
        'Usar dynamic imports para componentes pesados',
        'Configurar preloading inteligente'
      ]
    },
    {
      category: 'Tree Shaking',
      items: [
        'Usar importaciones específicas en lugar de namespace imports',
        'Configurar sideEffects: false en package.json',
        'Evitar importaciones de librerías completas',
        'Usar babel-plugin-import para librerías grandes'
      ]
    },
    {
      category: 'Bundle Optimization',
      items: [
        'Configurar splitChunks para separar common code',
        'Implementar compression (gzip/brotli)',
        'Optimizar imágenes con Next.js Image',
        'Usar CDN para assets estáticos'
      ]
    },
    {
      category: 'Performance',
      items: [
        'Implementar Service Worker para caching',
        'Usar prefetch para recursos críticos',
        'Optimizar CSS con purging',
        'Minimizar JavaScript y CSS'
      ]
    }
  ];

  recommendations.forEach(category => {
    console.log(`\n📋 ${category.category}:`);
    category.items.forEach(item => {
      console.log(`  • ${item}`);
    });
  });

  // Generar métricas de performance
  console.log('\n' + '='.repeat(60));
  console.log('📈 MÉTRICAS DE PERFORMANCE');
  console.log('='.repeat(60));

  const performanceMetrics = {
    'Bundle Size Target': '< 250KB (gzipped)',
    'Chunk Size Target': '< 100KB per chunk',
    'Tree Shaking Efficiency': 'Eliminar 30%+ código no usado',
    'Load Time Target': '< 3s en 3G',
    'First Contentful Paint': '< 1.5s',
    'Largest Contentful Paint': '< 2.5s'
  };

  Object.entries(performanceMetrics).forEach(([metric, target]) => {
    console.log(`  📊 ${metric}: ${target}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('🔧 COMANDOS ÚTILES');
  console.log('='.repeat(60));

  const commands = [
    'npm run build:analyze - Construir y analizar bundles',
    'npm run analyze - Solo analizar bundles existentes',
    'npx @next/bundle-analyzer - Análisis visual de bundles',
    'npx webpack-bundle-analyzer .next/static/chunks/*.js - Análisis detallado'
  ];

  commands.forEach(cmd => {
    console.log(`  💻 ${cmd}`);
  });

  // Guardar reporte en archivo
  const reportPath = path.join(process.cwd(), 'bundle-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  
  console.log(`\n📄 Reporte guardado en: ${reportPath}`);
  console.log('\n✅ Análisis completo finalizado');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  generateBundleReport();
}

module.exports = { generateBundleReport };