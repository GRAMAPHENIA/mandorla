#!/bin/bash

# Script para ejecutar tests del módulo checkout
# Uso: ./run-tests.sh [opciones]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIONES]"
    echo ""
    echo "Opciones:"
    echo "  -h, --help              Mostrar esta ayuda"
    echo "  -w, --watch             Ejecutar tests en modo watch"
    echo "  -c, --coverage          Ejecutar tests con reporte de cobertura"
    echo "  -u, --unit              Ejecutar solo tests unitarios"
    echo "  -i, --integration       Ejecutar solo tests de integración"
    echo "  -v, --verbose           Modo verbose"
    echo "  --update-snapshots      Actualizar snapshots"
    echo "  --silent               Modo silencioso"
    echo ""
    echo "Ejemplos:"
    echo "  $0                      Ejecutar todos los tests"
    echo "  $0 -c                   Ejecutar tests con cobertura"
    echo "  $0 -w -u                Ejecutar tests unitarios en modo watch"
    echo "  $0 -i                   Ejecutar solo tests de integración"
}

# Variables por defecto
WATCH_MODE=false
COVERAGE=false
UNIT_ONLY=false
INTEGRATION_ONLY=false
VERBOSE=false
UPDATE_SNAPSHOTS=false
SILENT=false

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -w|--watch)
            WATCH_MODE=true
            shift
            ;;
        -c|--coverage)
            COVERAGE=true
            shift
            ;;
        -u|--unit)
            UNIT_ONLY=true
            shift
            ;;
        -i|--integration)
            INTEGRATION_ONLY=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --update-snapshots)
            UPDATE_SNAPSHOTS=true
            shift
            ;;
        --silent)
            SILENT=true
            shift
            ;;
        *)
            echo "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Función para logging
log() {
    if [ "$SILENT" = false ]; then
        echo -e "${BLUE}[INFO]${NC} $1"
    fi
}

log_success() {
    if [ "$SILENT" = false ]; then
        echo -e "${GREEN}[SUCCESS]${NC} $1"
    fi
}

log_warning() {
    if [ "$SILENT" = false ]; then
        echo -e "${YELLOW}[WARNING]${NC} $1"
    fi
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# Verificar que Jest está instalado
if ! command -v jest &> /dev/null; then
    log_error "Jest no está instalado. Ejecuta: npm install --save-dev jest"
    exit 1
fi

log "🧪 Iniciando tests del módulo Checkout"

# Construir comando de Jest
JEST_CMD="jest"
JEST_ARGS=""

# Configurar patrón de archivos según el tipo de test
if [ "$UNIT_ONLY" = true ]; then
    JEST_ARGS="$JEST_ARGS --testPathPattern=src/modules/checkout/__tests__/(domain|application|presentation)/"
    log "📋 Ejecutando solo tests unitarios"
elif [ "$INTEGRATION_ONLY" = true ]; then
    JEST_ARGS="$JEST_ARGS --testPathPattern=src/modules/checkout/__tests__/integration/"
    log "🔗 Ejecutando solo tests de integración"
else
    JEST_ARGS="$JEST_ARGS --testPathPattern=src/modules/checkout/__tests__/"
    log "🎯 Ejecutando todos los tests del módulo checkout"
fi

# Configurar opciones adicionales
if [ "$WATCH_MODE" = true ]; then
    JEST_ARGS="$JEST_ARGS --watch"
    log "👀 Modo watch activado"
fi

if [ "$COVERAGE" = true ]; then
    JEST_ARGS="$JEST_ARGS --coverage --coverageDirectory=coverage/checkout"
    log "📊 Reporte de cobertura activado"
fi

if [ "$VERBOSE" = true ]; then
    JEST_ARGS="$JEST_ARGS --verbose"
    log "🔍 Modo verbose activado"
fi

if [ "$UPDATE_SNAPSHOTS" = true ]; then
    JEST_ARGS="$JEST_ARGS --updateSnapshot"
    log "📸 Actualizando snapshots"
fi

if [ "$SILENT" = true ]; then
    JEST_ARGS="$JEST_ARGS --silent"
fi

# Configurar variables de entorno para tests
export NODE_ENV=test
export TZ=UTC

# Ejecutar tests
log "🚀 Ejecutando: $JEST_CMD $JEST_ARGS"
echo ""

if $JEST_CMD $JEST_ARGS; then
    echo ""
    log_success "✅ Todos los tests pasaron exitosamente"
    
    if [ "$COVERAGE" = true ]; then
        echo ""
        log "📊 Reporte de cobertura generado en: coverage/checkout/"
        
        # Mostrar resumen de cobertura si está disponible
        if [ -f "coverage/checkout/lcov-report/index.html" ]; then
            log "🌐 Reporte HTML disponible en: coverage/checkout/lcov-report/index.html"
        fi
    fi
    
    exit 0
else
    echo ""
    log_error "❌ Algunos tests fallaron"
    
    if [ "$WATCH_MODE" = false ]; then
        echo ""
        log "💡 Consejos para debugging:"
        log "  - Ejecuta con -v para más detalles"
        log "  - Usa -w para modo watch y desarrollo iterativo"
        log "  - Revisa los logs de error arriba"
    fi
    
    exit 1
fi