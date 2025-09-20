#!/bin/bash

# Script para generar y analizar reporte de cobertura del módulo checkout
# Uso: ./coverage-report.sh [opciones]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIONES]"
    echo ""
    echo "Opciones:"
    echo "  -h, --help              Mostrar esta ayuda"
    echo "  -o, --open              Abrir reporte HTML automáticamente"
    echo "  -j, --json              Generar reporte en formato JSON"
    echo "  -l, --lcov              Generar reporte LCOV"
    echo "  -t, --text              Mostrar reporte en texto (por defecto)"
    echo "  -s, --summary           Mostrar solo resumen"
    echo "  --threshold <num>       Umbral mínimo de cobertura (default: 80)"
    echo ""
    echo "Ejemplos:"
    echo "  $0                      Generar reporte básico"
    echo "  $0 -o                   Generar y abrir reporte HTML"
    echo "  $0 -s --threshold 85    Mostrar resumen con umbral del 85%"
}

# Variables por defecto
OPEN_HTML=false
GENERATE_JSON=false
GENERATE_LCOV=false
SHOW_TEXT=true
SUMMARY_ONLY=false
THRESHOLD=80

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -o|--open)
            OPEN_HTML=true
            shift
            ;;
        -j|--json)
            GENERATE_JSON=true
            shift
            ;;
        -l|--lcov)
            GENERATE_LCOV=true
            shift
            ;;
        -t|--text)
            SHOW_TEXT=true
            shift
            ;;
        -s|--summary)
            SUMMARY_ONLY=true
            shift
            ;;
        --threshold)
            THRESHOLD="$2"
            shift 2
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
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

log "📊 Generando reporte de cobertura para el módulo Checkout"

# Crear directorio de cobertura si no existe
mkdir -p coverage/checkout

# Configurar variables de entorno
export NODE_ENV=test
export TZ=UTC

# Construir comando de Jest para cobertura
JEST_CMD="jest"
JEST_ARGS="--coverage --testPathPattern=src/modules/checkout/__tests__/ --coverageDirectory=coverage/checkout"

# Configurar formatos de reporte
COVERAGE_REPORTERS="text"

if [ "$GENERATE_JSON" = true ]; then
    COVERAGE_REPORTERS="$COVERAGE_REPORTERS,json"
fi

if [ "$GENERATE_LCOV" = true ]; then
    COVERAGE_REPORTERS="$COVERAGE_REPORTERS,lcov"
fi

if [ "$OPEN_HTML" = true ] || [ "$SUMMARY_ONLY" = false ]; then
    COVERAGE_REPORTERS="$COVERAGE_REPORTERS,html"
fi

JEST_ARGS="$JEST_ARGS --coverageReporters=$COVERAGE_REPORTERS"

# Configurar umbrales de cobertura
JEST_ARGS="$JEST_ARGS --coverageThreshold='{\"global\":{\"branches\":$THRESHOLD,\"functions\":$THRESHOLD,\"lines\":$THRESHOLD,\"statements\":$THRESHOLD}}'"

# Ejecutar tests con cobertura
log "🚀 Ejecutando tests con cobertura..."
echo ""

if $JEST_CMD $JEST_ARGS --silent; then
    echo ""
    log_success "✅ Tests ejecutados exitosamente"
else
    echo ""
    log_error "❌ Algunos tests fallaron, pero continuando con el reporte de cobertura"
fi

# Analizar resultados de cobertura
COVERAGE_DIR="coverage/checkout"

if [ -f "$COVERAGE_DIR/coverage-summary.json" ]; then
    log "📈 Analizando resultados de cobertura..."
    
    # Extraer métricas usando node (si está disponible) o python
    if command -v node &> /dev/null; then
        COVERAGE_STATS=$(node -e "
            const fs = require('fs');
            const coverage = JSON.parse(fs.readFileSync('$COVERAGE_DIR/coverage-summary.json', 'utf8'));
            const total = coverage.total;
            console.log(JSON.stringify({
                lines: total.lines.pct,
                functions: total.functions.pct,
                branches: total.branches.pct,
                statements: total.statements.pct
            }));
        ")
        
        LINES_PCT=$(echo $COVERAGE_STATS | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf8')).lines)")
        FUNCTIONS_PCT=$(echo $COVERAGE_STATS | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf8')).functions)")
        BRANCHES_PCT=$(echo $COVERAGE_STATS | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf8')).branches)")
        STATEMENTS_PCT=$(echo $COVERAGE_STATS | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf8')).statements)")
    else
        # Fallback usando grep y awk si node no está disponible
        LINES_PCT="N/A"
        FUNCTIONS_PCT="N/A"
        BRANCHES_PCT="N/A"
        STATEMENTS_PCT="N/A"
    fi
    
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    REPORTE DE COBERTURA                      ║${NC}"
    echo -e "${CYAN}║                     Módulo Checkout                          ║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════════╣${NC}"
    
    # Función para mostrar métrica con color
    show_metric() {
        local name="$1"
        local value="$2"
        local threshold="$3"
        
        if [[ "$value" != "N/A" ]]; then
            local color=$GREEN
            local status="✅"
            
            if (( $(echo "$value < $threshold" | bc -l) )); then
                color=$RED
                status="❌"
            elif (( $(echo "$value < $threshold + 5" | bc -l) )); then
                color=$YELLOW
                status="⚠️ "
            fi
            
            printf "${CYAN}║${NC} %-12s ${color}%6.1f%%${NC} %s ${CYAN}║${NC}\n" "$name:" "$value" "$status"
        else
            printf "${CYAN}║${NC} %-12s %6s   ${CYAN}║${NC}\n" "$name:" "$value"
        fi
    }
    
    show_metric "Líneas" "$LINES_PCT" "$THRESHOLD"
    show_metric "Funciones" "$FUNCTIONS_PCT" "$THRESHOLD"
    show_metric "Branches" "$BRANCHES_PCT" "$THRESHOLD"
    show_metric "Statements" "$STATEMENTS_PCT" "$THRESHOLD"
    
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║ Umbral mínimo: ${THRESHOLD}%                                      ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Verificar si se cumple el umbral
    if [[ "$LINES_PCT" != "N/A" ]]; then
        if (( $(echo "$LINES_PCT >= $THRESHOLD && $FUNCTIONS_PCT >= $THRESHOLD && $BRANCHES_PCT >= $THRESHOLD && $STATEMENTS_PCT >= $THRESHOLD" | bc -l) )); then
            log_success "🎯 Cobertura cumple con el umbral mínimo del $THRESHOLD%"
        else
            log_warning "⚠️  Cobertura por debajo del umbral mínimo del $THRESHOLD%"
        fi
    fi
    
else
    log_warning "No se encontró archivo de resumen de cobertura"
fi

# Mostrar archivos generados
echo ""
log "📁 Archivos de reporte generados:"

if [ -f "$COVERAGE_DIR/lcov-report/index.html" ]; then
    echo "  🌐 HTML: $COVERAGE_DIR/lcov-report/index.html"
fi

if [ -f "$COVERAGE_DIR/coverage-final.json" ]; then
    echo "  📄 JSON: $COVERAGE_DIR/coverage-final.json"
fi

if [ -f "$COVERAGE_DIR/lcov.info" ]; then
    echo "  📊 LCOV: $COVERAGE_DIR/lcov.info"
fi

# Abrir reporte HTML si se solicitó
if [ "$OPEN_HTML" = true ] && [ -f "$COVERAGE_DIR/lcov-report/index.html" ]; then
    log "🌐 Abriendo reporte HTML..."
    
    # Detectar sistema operativo y abrir navegador
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open "$COVERAGE_DIR/lcov-report/index.html"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        xdg-open "$COVERAGE_DIR/lcov-report/index.html" 2>/dev/null || true
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows
        start "$COVERAGE_DIR/lcov-report/index.html"
    else
        log_warning "No se pudo detectar el sistema operativo para abrir el navegador"
        echo "Abre manualmente: $COVERAGE_DIR/lcov-report/index.html"
    fi
fi

# Mostrar recomendaciones
echo ""
log "💡 Recomendaciones:"

if [[ "$LINES_PCT" != "N/A" ]] && (( $(echo "$LINES_PCT < 90" | bc -l) )); then
    echo "  • Agregar más tests unitarios para mejorar cobertura de líneas"
fi

if [[ "$BRANCHES_PCT" != "N/A" ]] && (( $(echo "$BRANCHES_PCT < 85" | bc -l) )); then
    echo "  • Agregar tests para casos edge y manejo de errores"
fi

if [[ "$FUNCTIONS_PCT" != "N/A" ]] && (( $(echo "$FUNCTIONS_PCT < 90" | bc -l) )); then
    echo "  • Asegurar que todas las funciones públicas tengan tests"
fi

echo "  • Revisar el reporte HTML para identificar líneas no cubiertas"
echo "  • Considerar agregar tests de integración para flujos complejos"

echo ""
log_success "🎉 Reporte de cobertura completado"