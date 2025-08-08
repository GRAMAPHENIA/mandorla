#!/usr/bin/env node

/**
 * Script para analizar el tamaño de los bundles y verificar code splitting
 */

const fs = require('fs');
const path = require('path');

function analyzeBundle() {
  console.log('🔍 Analizando bundles de Next.js...\n');

  const buildDir = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(buildDir)) {
    console.log('❌ No se encontró el directorio .next. Ejecuta "npm run build" primero.');
    return;
  }

  // Analizar chunks estáticos
  const staticDir = path.join(buildDir, 'static', 'chunks');
  
  if (fs.existsSync(staticDir)) {
    console.log('📦 Chunks estáticos encontrados:');
    
    const chunks = fs.readdirSync(staticDir)
      .filter(file => file.endsWith('.js'))
      .map(file => {
        const filePath = path.join(staticDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          sizeKB: (stats.size / 1024).toFixed(2)
        };
      })
      .sort((a, b) => b.size - a.size);

    chunks.forEach(chunk => {
      const category = categorizeChunk(chunk.name);
      console.log(`  ${category} ${chunk.name} - ${chunk.sizeKB} KB`);
    });

    console.log(`\n📊 Total de chunks: ${chunks.length}`);
    console.log(`📊 Tamaño total: ${(chunks.reduce((sum, chunk) => sum + chunk.size, 0) / 1024).toFixed(2)} KB`);
  }

  // Verificar separación de módulos
  console.log('\n🔍 Verificando separación de módulos...');
  
  const hasModulesChunk = fs.readdirSync(staticDir).some(file => 
    file.includes('modules') || file.includes('productos') || file.includes('carrito')
  );
  
  const hasUIChunk = fs.readdirSync(staticDir).some(file => 
    file.includes('ui-components') || file.includes('radix')
  );

  console.log(`  ✅ Módulos de dominio separados: ${hasModulesChunk ? 'Sí' : 'No'}`);
  console.log(`  ✅ Componentes UI separados: ${hasUIChunk ? 'Sí' : 'No'}`);

  // Recomendaciones
  console.log('\n💡 Recomendaciones:');
  
  const largeChunks = chunks.filter(chunk => chunk.size > 100 * 1024); // > 100KB
  if (largeChunks.length > 0) {
    console.log('  ⚠️  Chunks grandes detectados (>100KB):');
    largeChunks.forEach(chunk => {
      console.log(`    - ${chunk.name} (${chunk.sizeKB} KB)`);
    });
  } else {
    console.log('  ✅ Todos los chunks están en un tamaño óptimo');
  }
}

function categorizeChunk(filename) {
  if (filename.includes('framework') || filename.includes('main')) return '🏗️ ';
  if (filename.includes('vendor') || filename.includes('node_modules')) return '📚';
  if (filename.includes('modules') || filename.includes('productos') || filename.includes('carrito')) return '🏪';
  if (filename.includes('ui') || filename.includes('radix')) return '🎨';
  if (filename.includes('pages') || filename.includes('app')) return '📄';
  return '📦';
}

// Ejecutar análisis
if (require.main === module) {
  analyzeBundle();
}

module.exports = { analyzeBundle };