#!/bin/bash

# TeamsPure Automated Testing Pipeline
# Comprehensive test automation script for continuous integration and development

set -e  # Exit on any error

# Configuration
TEST_TIMEOUT=${TEST_TIMEOUT:-300000}  # 5 minutes
COVERAGE_THRESHOLD=${COVERAGE_THRESHOLD:-85}
NODE_VERSION=${NODE_VERSION:-18}
PARALLEL_JOBS=${PARALLEL_JOBS:-4}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test results tracking
declare -A test_results=(
    ["unit_tests"]=0
    ["integration_tests"]=0
    ["performance_tests"]=0
    ["golden_tests"]=0
    ["cli_tests"]=0
    ["coverage_analysis"]=0
)

# ========================================
# UTILITY FUNCTIONS
# ========================================

print_banner() {
    echo "================================================"
    echo "  TeamsPure Automated Testing Pipeline"
    echo "================================================"
    echo "Started at: $(date)"
    echo "Node.js version: $(node --version)"
    echo "Coverage threshold: ${COVERAGE_THRESHOLD}%"
    echo "Parallel jobs: ${PARALLEL_JOBS}"
    echo "================================================"
}

check_dependencies() {
    log_info "Checking dependencies..."

    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi

    local node_version=$(node --version | sed 's/v//')
    if ! [[ "$node_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        log_error "Unable to parse Node.js version: $node_version"
        exit 1
    fi

    log_success "Dependencies check completed"
}

setup_environment() {
    log_info "Setting up test environment..."

    # Clean previous test artifacts
    rm -rf test-results
    rm -rf coverage
    rm -rf .nyc_output

    # Create directories
    mkdir -p test-results/{unit,integration,golden,performance,cli}
    mkdir -p coverage

    log_success "Environment setup completed"
}

run_unit_tests() {
    log_info "Running unit tests..."

    local start_time=$(date +%s)
    local exit_code=0

    # Run unit tests with Jest
    if npm run test:unit -- --coverage --coverageReporters=json --testTimeout=${TEST_TIMEOUT} --maxWorkers=${PARALLEL_JOBS}; then
        test_results["unit_tests"]=1
        log_success "Unit tests completed successfully"
    else
        test_results["unit_tests"]=0
        exit_code=1
        log_error "Unit tests failed"
    fi

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    log_info "Unit tests took ${duration} seconds"

    return $exit_code
}

run_integration_tests() {
    log_info "Running integration tests..."

    local start_time=$(date +%s)
    local exit_code=0

    # Run integration tests for each module
    local modules=("teams" "evolution" "combat" "items" "ai")
    local failed_modules=()

    for module in "${modules[@]}"; do
        log_info "Testing integration for $module module..."

        if npm run test:integration:${module} -- --verbose --testTimeout=${TEST_TIMEOUT}; then
            log_success "Integration tests for $module completed"
        else
            log_error "Integration tests for $module failed"
            failed_modules+=("$module")
            exit_code=1
        fi
    done

    if [ ${#failed_modules[@]} -eq 0 ]; then
        test_results["integration_tests"]=1
        log_success "All integration tests completed successfully"
    else
        test_results["integration_tests"]=0
        log_error "Integration tests failed for modules: ${failed_modules[*]}"
    fi

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    log_info "Integration tests took ${duration} seconds"

    return $exit_code
}

run_golden_tests() {
    log_info "Running golden tests..."

    local start_time=$(date +%s)
    local exit_code=0

    # Run golden tests
    if npm run test:golden -- --verbose; then
        test_results["golden_tests"]=1
        log_success "Golden tests completed successfully"
    else
        test_results["golden_tests"]=0
        exit_code=1
        log_error "Golden tests failed"
    fi

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    log_info "Golden tests took ${duration} seconds"

    return $exit_code
}

run_performance_tests() {
    log_info "Running performance tests..."

    local start_time=$(date +%s)
    local exit_code=0

    # Run performance benchmarks
    if npm run test:performance -- --reporter=json > test-results/performance/performance-results.json; then
        test_results["performance_tests"]=1
        log_success "Performance tests completed successfully"
    else
        test_results["performance_tests"]=0
        exit_code=1
        log_error "Performance tests failed"
    fi

    # Analyze performance results
    analyze_performance_results

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    log_info "Performance tests took ${duration} seconds"

    return $exit_code
}

run_cli_tests() {
    log_info "Running CLI tests..."

    local start_time=$(date +%s)
    local exit_code=0

    # Run CLI tests for each module
    local modules=("teams" "evolution" "combat" "items" "ai")
    local failed_modules=()

    for module in "${modules[@]}"; do
        log_info "Testing CLI for $module module..."

        if npm run test:cli:${module} -- --verbose; then
            log_success "CLI tests for $module completed"
        else
            log_error "CLI tests for $module failed"
            failed_modules+=("$module")
            exit_code=1
        fi
    done

    if [ ${#failed_modules[@]} -eq 0 ]; then
        test_results["cli_tests"]=1
        log_success "All CLI tests completed successfully"
    else
        test_results["cli_tests"]=0
        log_error "CLI tests failed for modules: ${failed_modules[*]}"
    fi

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    log_info "CLI tests took ${duration} seconds"

    return $exit_code
}

analyze_coverage() {
    log_info "Analyzing test coverage..."

    local exit_code=0

    # Generate coverage report
    if npm run coverage:report -- --reporter=html --reporter=json-summary; then
        log_success "Coverage report generated"
    else
        log_error "Coverage report generation failed"
        exit_code=1
    fi

    # Check coverage thresholds
    check_coverage_thresholds

    # Generate coverage analysis
    generate_coverage_analysis

    if [ $exit_code -eq 0 ]; then
        test_results["coverage_analysis"]=1
    else
        test_results["coverage_analysis"]=0
    fi

    return $exit_code
}

check_coverage_thresholds() {
    log_info "Checking coverage thresholds..."

    if [ -f "coverage/coverage-summary.json" ]; then
        local coverage_data=$(cat coverage/coverage-summary.json)
        local lines_coverage=$(echo "$coverage_data" | grep -o '"lines":{"pct":[0-9.]*' | grep -o '[0-9.]*$')
        local branches_coverage=$(echo "$coverage_data" | grep -o '"branches":{"pct":[0-9.]*' | grep -o '[0-9.]*$')
        local functions_coverage=$(echo "$coverage_data" | grep -o '"functions":{"pct":[0-9.]*' | grep -o '[0-9.]*$')
        local statements_coverage=$(echo "$coverage_data" | grep -o '"statements":{"pct":[0-9.]*' | grep -o '[0-9.]*$')

        log_info "Coverage Results:"
        log_info "  Lines: ${lines_coverage}%"
        log_info "  Branches: ${branches_coverage}%"
        log_info "  Functions: ${functions_coverage}%"
        log_info "  Statements: ${statements_coverage}%"

        # Check against threshold
        if (( $(echo "$lines_coverage < $COVERAGE_THRESHOLD" | bc -l) )) || \
           (( $(echo "$branches_coverage < $COVERAGE_THRESHOLD" | bc -l) )) || \
           (( $(echo "$functions_coverage < $COVERAGE_THRESHOLD" | bc -l) )) || \
           (( $(echo "$statements_coverage < $COVERAGE_THRESHOLD" | bc -l) )); then
            log_warning "Coverage is below threshold of ${COVERAGE_THRESHOLD}%"
        else
            log_success "Coverage meets threshold requirements"
        fi
    else
        log_warning "Coverage summary not found"
    fi
}

analyze_performance_results() {
    log_info "Analyzing performance results..."

    if [ -f "test-results/performance/performance-results.json" ]; then
        local performance_data=$(cat test-results/performance/performance-results.json)

        # Extract key performance metrics
        local avg_response_time=$(echo "$performance_data" | grep -o '"avgResponseTime":[0-9.]*' | grep -o '[0-9.]*$' | head -1)
        local memory_usage=$(echo "$performance_data" | grep -o '"memoryUsage":[0-9.]*' | grep -o '[0-9.]*$' | head -1)
        local throughput=$(echo "$performance_data" | grep -o '"throughput":[0-9.]*' | grep -o '[0-9.]*$' | head -1)

        log_info "Performance Metrics:"
        log_info "  Average Response Time: ${avg_response_time}ms"
        log_info "  Memory Usage: ${memory_usage}MB"
        log_info "  Throughput: ${throughput} ops/sec"

        # Performance analysis
        if (( $(echo "$avg_response_time > 100" | bc -l) )); then
            log_warning "Response time is high: ${avg_response_time}ms"
        else
            log_success "Response time is acceptable: ${avg_response_time}ms"
        fi

        if (( $(echo "$memory_usage > 100" | bc -l) )); then
            log_warning "Memory usage is high: ${memory_usage}MB"
        else
            log_success "Memory usage is acceptable: ${memory_usage}MB"
        fi
    else
        log_warning "Performance results not found"
    fi
}

generate_coverage_analysis() {
    log_info "Generating coverage analysis report..."

    # Create coverage analysis report
    cat > test-results/coverage-analysis.md << EOF
# Coverage Analysis Report

Generated on: $(date)
Coverage Threshold: ${COVERAGE_THRESHOLD}%

## Summary

$(if [ -f "coverage/coverage-summary.json" ]; then
    local coverage_data=$(cat coverage/coverage-summary.json)
    local lines_coverage=$(echo "$coverage_data" | grep -o '"lines":{"pct":[0-9.]*' | grep -o '[0-9.]*$')
    local branches_coverage=$(echo "$coverage_data" | grep -o '"branches":{"pct":[0-9.]*' | grep -o '[0-9.]*$')
    local functions_coverage=$(echo "$coverage_data" | grep -o '"functions":{"pct":[0-9.]*' | grep -o '[0-9.]*$')
    local statements_coverage=$(echo "$coverage_data" | grep -o '"statements":{"pct":[0-9.]*' | grep -o '[0-9.]*$')

    echo "### Overall Coverage"
    echo "- Lines: ${lines_coverage}%"
    echo "- Branches: ${branches_coverage}%"
    echo "- Functions: ${functions_coverage}%"
    echo "- Statements: ${statements_coverage}%"

    if (( $(echo "$lines_coverage >= $COVERAGE_THRESHOLD" | bc -l) )); then
        echo "✅ Coverage meets requirements"
    else
        echo "❌ Coverage below threshold"
    fi
fi)

## Recommendations

- Ensure all new code includes comprehensive tests
- Focus on testing complex business logic
- Maintain coverage above ${COVERAGE_THRESHOLD}% threshold
- Regular coverage analysis to identify untested areas

## Detailed Report

Coverage details available in: \`coverage/lcov-report/index.html\`
EOF

    log_success "Coverage analysis report generated"
}

generate_test_report() {
    log_info "Generating comprehensive test report..."

    # Create test summary report
    cat > test-summary-report.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "testEnvironment": {
    "nodeVersion": "$(node --version)",
    "platform": "$(uname -a)",
    "testTimeout": "${TEST_TIMEOUT}",
    "parallelJobs": "${PARALLEL_JOBS}"
  },
  "results": {
    "unitTests": $(if [ ${test_results["unit_tests"]} -eq 1 ]; then echo "true"; else echo "false"; fi),
    "integrationTests": $(if [ ${test_results["integration_tests"]} -eq 1 ]; then echo "true"; else echo "false"; fi),
    "performanceTests": $(if [ ${test_results["performance_tests"]} -eq 1 ]; then echo "true"; else echo "false"; fi),
    "goldenTests": $(if [ ${test_results["golden_tests"]} -eq 1 ]; then echo "true"; else echo "false"; fi),
    "cliTests": $(if [ ${test_results["cli_tests"]} -eq 1 ]; then echo "true"; else echo "false"; fi),
    "coverageAnalysis": $(if [ ${test_results["coverage_analysis"]} -eq 1 ]; then echo "true"; else echo "false"; fi)
  },
  "summary": {
    "totalTests": $(count_total_tests),
    "passedTests": $(count_passed_tests),
    "failedTests": $(count_failed_tests),
    "successRate": "$(calculate_success_rate)%"
  }
}
EOF

    log_success "Test report generated"
}

count_total_tests() {
    # Count tests from various sources
    local total=0

    # Count from test files
    total+=$(find . -name "*.test.ts" -o -name "*.test.js" -o -name "*.spec.ts" -o -name "*.spec.js" | wc -l)

    # Count from coverage if available
    if [ -f "coverage/coverage-summary.json" ]; then
        local coverage_data=$(cat coverage/coverage-summary.json)
        local functions=$(echo "$coverage_data" | grep -o '"functions":{"total":[0-9]*' | grep -o '[0-9]*$')
        total=$((total + functions))
    fi

    echo $total
}

count_passed_tests() {
    local passed=0

    for result in "${test_results[@]}"; do
        if [ $result -eq 1 ]; then
            passed=$((passed + 1))
        fi
    done

    echo $passed
}

count_failed_tests() {
    local failed=0

    for result in "${test_results[@]}"; do
        if [ $result -eq 0 ]; then
            failed=$((failed + 1))
        fi
    done

    echo $failed
}

calculate_success_rate() {
    local total=$(count_total_tests)
    local passed=$(count_passed_tests)

    if [ $total -eq 0 ]; then
        echo "0"
    else
        echo $(( (passed * 100) / total ))
    fi
}

print_test_summary() {
    echo ""
    echo "================================================"
    echo "  Test Execution Summary"
    echo "================================================"

    printf "%-20s %s\n" "Unit Tests:" "$(if [ ${test_results["unit_tests"]} -eq 1 ]; then echo -e "${GREEN}✓ PASS${NC}"; else echo -e "${RED}✗ FAIL${NC}"; fi)"
    printf "%-20s %s\n" "Integration Tests:" "$(if [ ${test_results["integration_tests"]} -eq 1 ]; then echo -e "${GREEN}✓ PASS${NC}"; else echo -e "${RED}✗ FAIL${NC}"; fi)"
    printf "%-20s %s\n" "Performance Tests:" "$(if [ ${test_results["performance_tests"]} -eq 1 ]; then echo -e "${GREEN}✓ PASS${NC}"; else echo -e "${RED}✗ FAIL${NC}"; fi)"
    printf "%-20s %s\n" "Golden Tests:" "$(if [ ${test_results["golden_tests"]} -eq 1 ]; then echo -e "${GREEN}✓ PASS${NC}"; else echo -e "${RED}✗ FAIL${NC}"; fi)"
    printf "%-20s %s\n" "CLI Tests:" "$(if [ ${test_results["cli_tests"]} -eq 1 ]; then echo -e "${GREEN}✓ PASS${NC}"; else echo -e "${RED}✗ FAIL${NC}"; fi)"
    printf "%-20s %s\n" "Coverage Analysis:" "$(if [ ${test_results["coverage_analysis"]} -eq 1 ]; then echo -e "${GREEN}✓ PASS${NC}"; else echo -e "${RED}✗ FAIL${NC}"; fi)"

    echo ""
    local total_tests=$(count_total_tests)
    local passed_tests=$(count_passed_tests)
    local failed_tests=$(count_failed_tests)
    local success_rate=$(calculate_success_rate)

    echo "Overall Results:"
    echo "  Total Tests: $total_tests"
    echo "  Passed: $passed_tests"
    echo "  Failed: $failed_tests"
    echo "  Success Rate: $success_rate%"
    echo "================================================"
}

cleanup() {
    log_info "Cleaning up test artifacts..."

    # Archive old test results (keep last 5 runs)
    if [ -d "test-results" ]; then
        local archive_dir="test-results/archive/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$archive_dir"
        cp -r test-results/* "$archive_dir" 2>/dev/null || true
    fi

    log_success "Cleanup completed"
}

# ========================================
# MAIN EXECUTION
# ========================================

main() {
    print_banner

    # Trap to ensure cleanup on exit
    trap cleanup EXIT INT TERM

    # Check dependencies
    check_dependencies

    # Setup environment
    setup_environment

    # Run tests
    local overall_success=true

    if ! run_unit_tests; then
        overall_success=false
    fi

    if ! run_integration_tests; then
        overall_success=false
    fi

    if ! run_golden_tests; then
        overall_success=false
    fi

    if ! run_performance_tests; then
        overall_success=false
    fi

    if ! run_cli_tests; then
        overall_success=false
    fi

    if ! analyze_coverage; then
        overall_success=false
    fi

    # Generate final report
    generate_test_report

    # Print summary
    print_test_summary

    # Exit with appropriate code
    if $overall_success; then
        log_success "All tests completed successfully!"
        exit 0
    else
        log_error "Some tests failed. Check the logs above for details."
        exit 1
    fi
}

# Run main function
main "$@"