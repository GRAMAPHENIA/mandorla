#!/usr/bin/env node

/**
 * Script para analizar el tree shaking y detectar importaciones no optimizadas
 */

const fs = require('fs');
const path = require('path');

function analyzeTreeShaking() {
  console.log('🌳 Analizando tree shaking...\n');

  const srcDir = path.join(process.cwd(), 'src');
  const issues = [];
  
  // Patrones problemáticos para tree shaking
  const problematicPatterns = [
    {
      pattern: /import \* as .+ from ['"]lucide-react['"]/g,
      message: 'Importación completa de lucide-react detectada',
      suggestion: 'Usar importaciones específicas: import { Icon } from "lucide-react"'
    },
    {
      pattern: /import .+ from ['"]@radix-ui\/react-.+['"]/g,
      message: 'Importación de Radix UI detectada',
      suggestion: 'Verificar que solo se importen componentes necesarios'
    },
    {
      pattern: /import \* as .+ from ['"]date-fns['"]/g,
      message: 'Importación completa de date-fns detectada',
      suggestion: 'Usar importaciones específicas de funciones'
    },
    {
      pattern: /import .+ from ['"]lodash['"]/g,
      message: 'Importación de lodash completo detectada',
      suggestion: 'Usar lodash-es o importaciones específicas'
    }
  ];

  function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    problematicPatterns.forEach(({ pattern, message, suggestion }) => {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          file: relativePath,
          message,
          suggestion,
          matches: matches.length
        });
      }
    });
  }

  function walkDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        walkDirectory(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        analyzeFile(filePath);
      }
    });
  }

  walkDirectory(srcDir);

  // Mostrar resultados
  if (issues.length === 0) {
    console.log('✅ No se encontraron problemas de tree shaking');
  } else {
    console.log(`⚠️  Se encontraron ${issues.length} problemas potenciales:\n`);
    
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.file}`);
      console.log(`   ${issue.message}`);
      console.log(`   💡 ${issue.suggestion}`);
      console.log(`   📊 ${issue.matches} ocurrencia(s)\n`);
    });
  }

  // Análisis de bundle size estimado
  console.log('📊 Análisis de dependencias grandes:');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const largeDependencies = [
    'lucide-react',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    'date-fns',
    'zod',
    'react-hook-form'
  ];

  largeDependencies.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`  📦 ${dep}: ${packageJson.dependencies[dep]}`);
    }
  });

  console.log('\n💡 Recomendaciones para optimización:');
  console.log('  1. Usar importaciones específicas en lugar de importaciones completas');
  console.log('  2. Configurar babel-plugin-import para librerías grandes');
  console.log('  3. Usar dynamic imports para componentes pesados');
  console.log('  4. Verificar que Next.js esté configurado para tree shaking');
}

// Función para verificar configuración de Next.js
function checkNextConfig() {
  console.log('\n🔧 Verificando configuración de Next.js...');
  
  const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
  
  if (fs.existsSync(nextConfigPath)) {
    const config = fs.readFileSync(nextConfigPath, 'utf8');
    
    const optimizations = [
      {
        check: config.includes('optimizePackageImports'),
        message: 'optimizePackageImports configurado',
        status: '✅'
      },
      {
        check: config.includes('splitChunks'),
        message: 'splitChunks configurado',
        status: '✅'
      },
      {
        check: config.includes('experimental'),
        message: 'Configuraciones experimentales habilitadas',
        status: '✅'
      }
    ];

    optimizations.forEach(opt => {
      console.log(`  ${opt.check ? opt.status : '❌'} ${opt.message}`);
    });
  } else {
    console.log('  ❌ next.config.mjs no encontrado');
  }
}

// Ejecutar análisis
if (require.main === module) {
  analyzeTreeShaking();
  checkNextConfig();
}

module.exports = { analyzeTreeShaking, checkNextConfig };