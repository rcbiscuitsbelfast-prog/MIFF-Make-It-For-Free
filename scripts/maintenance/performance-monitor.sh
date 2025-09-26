#!/bin/bash

# MIFF Performance Monitoring Script
# Comprehensive performance tracking and analysis system

set -e

echo "⚡ MIFF Performance Monitoring System"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

function log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

function warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

function error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

function info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

function perf() {
    echo -e "${PURPLE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Create performance monitoring report
echo "⚡ MIFF Performance Monitoring Report" > performance-monitoring-report.md
echo "- **Monitoring Date:** $(date)" >> performance-monitoring-report.md
echo "- **System:** $(uname -a)" >> performance-monitoring-report.md
echo "" >> performance-monitoring-report.md

# Step 1: System Performance Analysis
log "Step 1: Analyzing system performance..."
perf "Starting comprehensive performance analysis..."

echo "### System Performance Analysis" >> performance-monitoring-report.md

# Memory usage
echo "#### Memory Usage" >> performance-monitoring-report.md
if command -v free &> /dev/null; then
    free -h >> performance-monitoring-report.md 2>&1 || echo "Memory info not available" >> performance-monitoring-report.md
else
    echo "Memory monitoring not available on this system" >> performance-monitoring-report.md
fi
echo "" >> performance-monitoring-report.md

# Disk usage
echo "#### Disk Usage" >> performance-monitoring-report.md
if command -v df &> /dev/null; then
    df -h >> performance-monitoring-report.md 2>&1 || echo "Disk info not available" >> performance-monitoring-report.md
else
    echo "Disk monitoring not available on this system" >> performance-monitoring-report.md
fi
echo "" >> performance-monitoring-report.md

# CPU information
echo "#### CPU Information" >> performance-monitoring-report.md
if command -v nproc &> /dev/null; then
    echo "- **CPU Cores:** $(nproc)" >> performance-monitoring-report.md
else
    echo "- **CPU Cores:** $(sysctl -n hw.ncpu 2>/dev/null || echo 'Unknown')" >> performance-monitoring-report.md
fi
echo "" >> performance-monitoring-report.md

# Step 2: Repository Performance Analysis
log "Step 2: Analyzing repository performance..."

echo "### Repository Performance Analysis" >> performance-monitoring-report.md

# Repository size analysis
repo_size=$(du -sh . 2>/dev/null | cut -f1 || echo "Unknown")
echo "- **Repository size:** $repo_size" >> performance-monitoring-report.md

# File count analysis
total_files=$(find . -type f | wc -l)
js_files=$(find . -name "*.js" -o -name "*.mjs" | wc -l)
ts_files=$(find . -name "*.ts" -o -name "*.tsx" | wc -l)
json_files=$(find . -name "*.json" | wc -l)
md_files=$(find . -name "*.md" | wc -l)

echo "- **Total files:** $total_files" >> performance-monitoring-report.md
echo "- **JavaScript files:** $js_files" >> performance-monitoring-report.md
echo "- **TypeScript files:** $ts_files" >> performance-monitoring-report.md
echo "- **JSON files:** $json_files" >> performance-monitoring-report.md
echo "- **Markdown files:** $md_files" >> performance-monitoring-report.md
echo "" >> performance-monitoring-report.md

# Step 3: Build Performance Analysis
log "Step 3: Analyzing build performance..."

echo "### Build Performance Analysis" >> performance-monitoring-report.md

# Test build performance
echo "#### Build Performance Test" >> performance-monitoring-report.md
build_start=$(date +%s)

if [ -f "package.json" ]; then
    # Try different build commands
    if npm run build 2>/dev/null; then
        build_end=$(date +%s)
        build_time=$((build_end - build_start))
        echo "- **Build time:** ${build_time}s" >> performance-monitoring-report.md

        if [ $build_time -lt 60 ]; then
            echo "- **Build performance:** ✅ Excellent (< 60s)" >> performance-monitoring-report.md
        elif [ $build_time -lt 180 ]; then
            echo "- **Build performance:** ⚠️ Good (60-180s)" >> performance-monitoring-report.md
        else
            echo "- **Build performance:** ❌ Poor (> 180s)" >> performance-monitoring-report.md
        fi
    else
        echo "- **Build test:** ❌ Failed - no build script available" >> performance-monitoring-report.md
    fi
else
    echo "- **Build test:** ❌ No package.json found" >> performance-monitoring-report.md
fi
echo "" >> performance-monitoring-report.md

# Step 4: Dependency Analysis
log "Step 4: Analyzing dependencies..."

echo "### Dependency Analysis" >> performance-monitoring-report.md

if [ -f "package.json" ]; then
    # Count dependencies
    deps=$(grep -c '"dependencies"' package.json || echo "0")
    devdeps=$(grep -c '"devDependencies"' package.json || echo "0")

    echo "- **Production dependencies:** $deps" >> performance-monitoring-report.md
    echo "- **Development dependencies:** $devdeps" >> performance-monitoring-report.md
    echo "- **Total dependencies:** $((deps + devdeps))" >> performance-monitoring-report.md
    echo "" >> performance-monitoring-report.md

    # Check for heavy dependencies
    echo "#### Heavy Dependencies Check" >> performance-monitoring-report.md
    heavy_deps=$(find node_modules -name "*.js" -size +1M 2>/dev/null | wc -l || echo "0")
    if [ "$heavy_deps" -gt 0 ]; then
        echo "- **Heavy dependencies (>1MB):** ⚠️ $heavy_deps found" >> performance-monitoring-report.md
    else
        echo "- **Heavy dependencies:** ✅ None found" >> performance-monitoring-report.md
    fi
    echo "" >> performance-monitoring-report.md

else
    echo "- **Dependencies:** ❌ package.json not found" >> performance-monitoring-report.md
    echo "" >> performance-monitoring-report.md
fi

# Step 5: Test Performance Analysis
log "Step 5: Analyzing test performance..."

echo "### Test Performance Analysis" >> performance-monitoring-report.md

# Test execution time
echo "#### Test Execution" >> performance-monitoring-report.md
test_start=$(date +%s)

if npm test 2>/dev/null; then
    test_end=$(date +%s)
    test_time=$((test_end - test_start))
    echo "- **Test execution time:** ${test_time}s" >> performance-monitoring-report.md

    if [ $test_time -lt 60 ]; then
        echo "- **Test performance:** ✅ Excellent (< 60s)" >> performance-monitoring-report.md
    elif [ $test_time -lt 300 ]; then
        echo "- **Test performance:** ⚠️ Good (60-300s)" >> performance-monitoring-report.md
    else
        echo "- **Test performance:** ❌ Poor (> 300s)" >> performance-monitoring-report.md
    fi
else
    echo "- **Test execution:** ❌ Failed or no test script" >> performance-monitoring-report.md
    echo "- **Test performance:** ❌ Cannot determine" >> performance-monitoring-report.md
fi
echo "" >> performance-monitoring-report.md

# Step 6: GitHub Actions Performance
log "Step 6: Analyzing GitHub Actions performance..."

echo "### GitHub Actions Performance" >> performance-monitoring-report.md

# Count workflows
workflow_count=$(find .github/workflows -name "*.yml" | wc -l)
echo "- **Total workflows:** $workflow_count" >> performance-monitoring-report.md

# Analyze workflow complexity
echo "#### Workflow Complexity" >> performance-monitoring-report.md
complex_workflows=$(find .github/workflows -name "*.yml" -exec wc -l {} \; | awk '$1 > 50' | wc -l)
echo "- **Complex workflows (>50 lines):** $complex_workflows" >> performance-monitoring-report.md

if [ "$complex_workflows" -gt 3 ]; then
    echo "- **Complexity assessment:** ⚠️ High - consider simplifying workflows" >> performance-monitoring-report.md
else
    echo "- **Complexity assessment:** ✅ Good - workflows are well-structured" >> performance-monitoring-report.md
fi
echo "" >> performance-monitoring-report.md

# Step 7: Performance Recommendations
log "Step 7: Generating performance recommendations..."

echo "### Performance Recommendations" >> performance-monitoring-report.md

# Build recommendations
if [ -f "package.json" ]; then
    if [ "$build_time" -gt 180 ] 2>/dev/null; then
        echo "- **Build optimization:** Consider using build caching or parallel builds" >> performance-monitoring-report.md
    fi

    if [ "$((deps + devdeps))" -gt 100 ]; then
        echo "- **Dependency optimization:** High dependency count - consider tree shaking or lazy loading" >> performance-monitoring-report.md
    fi

    if [ "$heavy_deps" -gt 5 ] 2>/dev/null; then
        echo "- **Bundle optimization:** Large dependencies detected - consider code splitting" >> performance-monitoring-report.md
    fi
fi

# Workflow recommendations
if [ "$workflow_count" -gt 15 ]; then
    echo "- **Workflow consolidation:** Consider merging similar workflows" >> performance-monitoring-report.md
fi

if [ "$complex_workflows" -gt 5 ]; then
    echo "- **Workflow simplification:** Complex workflows should be broken down" >> performance-monitoring-report.md
fi

# Test recommendations
if [ "$test_time" -gt 300 ] 2>/dev/null; then
    echo "- **Test optimization:** Test suite is slow - consider parallel execution or test splitting" >> performance-monitoring-report.md
fi

echo "" >> performance-monitoring-report.md

# Step 8: Performance Scoring
log "Step 8: Calculating performance scores..."

echo "### Performance Scoring" >> performance-monitoring-report.md

# Calculate overall performance score
performance_score=100

# Build performance score
if [ "$build_time" -lt 60 ] 2>/dev/null; then
    build_score=100
elif [ "$build_time" -lt 180 ]; then
    build_score=80
else
    build_score=60
fi

# Test performance score
if [ "$test_time" -lt 60 ] 2>/dev/null; then
    test_score=100
elif [ "$test_time" -lt 300 ]; then
    test_score=80
else
    test_score=60
fi

# Complexity score
if [ "$complex_workflows" -eq 0 ]; then
    complexity_score=100
elif [ "$complex_workflows" -lt 3 ]; then
    complexity_score=90
else
    complexity_score=70
fi

# Size score
if [ "$total_files" -lt 1000 ]; then
    size_score=100
elif [ "$total_files" -lt 5000 ]; then
    size_score=90
else
    size_score=80
fi

overall_score=$(( (build_score + test_score + complexity_score + size_score) / 4 ))

echo "- **Build performance:** $build_score/100" >> performance-monitoring-report.md
echo "- **Test performance:** $test_score/100" >> performance-monitoring-report.md
echo "- **Complexity score:** $complexity_score/100" >> performance-monitoring-report.md
echo "- **Size score:** $size_score/100" >> performance-monitoring-report.md
echo "- **Overall performance:** $overall_score/100" >> performance-monitoring-report.md
echo "" >> performance-monitoring-report.md

# Step 9: Create monitoring dashboard
log "Step 9: Creating performance monitoring dashboard..."

echo "### Performance Dashboard" >> performance-monitoring-report.md
echo "" >> performance-monitoring-report.md
echo "| Metric | Value | Score | Status |" >> performance-monitoring-report.md
echo "|--------|-------|-------|--------|" >> performance-monitoring-report.md
echo "| Build Time | ${build_time}s | $build_score | $(if [ $build_score -gt 80 ]; then echo '✅'; elif [ $build_score -gt 60 ]; then echo '⚠️'; else echo '❌'; fi) |" >> performance-monitoring-report.md
echo "| Test Time | ${test_time}s | $test_score | $(if [ $test_score -gt 80 ]; then echo '✅'; elif [ $test_score -gt 60 ]; then echo '⚠️'; else echo '❌'; fi) |" >> performance-monitoring-report.md
echo "| Complexity | $complex_workflows workflows | $complexity_score | $(if [ $complexity_score -gt 80 ]; then echo '✅'; elif [ $complexity_score -gt 60 ]; then echo '⚠️'; else echo '❌'; fi) |" >> performance-monitoring-report.md
echo "| Repository Size | $total_files files | $size_score | $(if [ $size_score -gt 80 ]; then echo '✅'; elif [ $size_score -gt 60 ]; then echo '⚠️'; else echo '❌'; fi) |" >> performance-monitoring-report.md
echo "" >> performance-monitoring-report.md

# Step 10: Final summary
log "Step 10: Generating final performance summary..."

echo "### Final Performance Summary" >> performance-monitoring-report.md
echo "- **Overall Score:** $overall_score/100" >> performance-monitoring-report.md
echo "- **Performance Grade:** $(if [ $overall_score -gt 90 ]; then echo '🟢 Excellent'; elif [ $overall_score -gt 70 ]; then echo '🟡 Good'; elif [ $overall_score -gt 50 ]; then echo '🟠 Fair'; else echo '🔴 Poor'; fi)" >> performance-monitoring-report.md
echo "" >> performance-monitoring-report.md

# Display results
log "✅ Performance monitoring completed!"
echo ""
echo "⚡ PERFORMANCE MONITORING SUMMARY"
echo "================================="
echo "📊 Repository size: $repo_size"
echo "📁 Total files: $total_files"
echo "🔨 Build time: ${build_time}s"
echo "🧪 Test time: ${test_time}s"
echo "🔄 Workflow count: $workflow_count"
echo "⚙️ Complex workflows: $complex_workflows"
echo ""
echo "📈 PERFORMANCE SCORES"
echo "======================"
echo "Build Performance: $build_score/100 $(if [ $build_score -gt 80 ]; then echo '✅'; elif [ $build_score -gt 60 ]; then echo '⚠️'; else echo '❌'; fi)"
echo "Test Performance: $test_score/100 $(if [ $test_score -gt 80 ]; then echo '✅'; elif [ $test_score -gt 60 ]; then echo '⚠️'; else echo '❌'; fi)"
echo "Complexity Score: $complexity_score/100 $(if [ $complexity_score -gt 80 ]; then echo '✅'; elif [ $complexity_score -gt 60 ]; then echo '⚠️'; else echo '❌'; fi)"
echo "Size Score: $size_score/100 $(if [ $size_score -gt 80 ]; then echo '✅'; elif [ $size_score -gt 60 ]; then echo '⚠️'; else echo '❌'; fi)"
echo ""
echo "🎯 OVERALL SCORE: $overall_score/100 $(if [ $overall_score -gt 90 ]; then echo '🟢 EXCELLENT'; elif [ $overall_score -gt 70 ]; then echo '🟡 GOOD'; elif [ $overall_score -gt 50 ]; then echo '🟠 FAIR'; else echo '🔴 POOR'; fi)"
echo ""
echo "📋 Report saved: performance-monitoring-report.md"

# Save performance report
log "Performance monitoring report saved successfully!"