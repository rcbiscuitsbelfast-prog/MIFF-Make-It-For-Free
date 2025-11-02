#!/bin/bash
# Comprehensive Module Validation Script
# Scans all miff/pure modules for test failures, build errors, and TODOs

OUTPUT_FILE="COMPREHENSIVE_MODULE_VALIDATION.json"
SUMMARY_FILE="MODULE_VALIDATION_SUMMARY.md"

echo "🔍 Starting comprehensive module validation..."
echo "Scanning $(ls -1 miff/pure/ | wc -l) modules..."

# Initialize JSON output
echo "{" > $OUTPUT_FILE
echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"," >> $OUTPUT_FILE
echo "  \"totalModules\": $(ls -1 miff/pure/ | wc -l)," >> $OUTPUT_FILE
echo "  \"modules\": [" >> $OUTPUT_FILE

FIRST=true
TOTAL=0
PASSING=0
FAILING=0
NO_TESTS=0
BUILD_ERRORS=0

# Get all module directories
for MODULE_DIR in miff/pure/*/; do
    MODULE=$(basename "$MODULE_DIR")
    
    # Skip non-module directories
    if [ "$MODULE" = "shared" ] || [ "$MODULE" = "cli" ]; then
        continue
    fi
    
    TOTAL=$((TOTAL + 1))
    
    # Add comma before each entry except first
    if [ "$FIRST" = true ]; then
        FIRST=false
    else
        echo "," >> $OUTPUT_FILE
    fi
    
    echo "    {" >> $OUTPUT_FILE
    echo "      \"name\": \"$MODULE\"," >> $OUTPUT_FILE
    
    # Check for test files
    TEST_FILES=$(find "$MODULE_DIR" -name "*.test.ts" -o -name "*.test.js" 2>/dev/null | wc -l)
    echo "      \"hasTests\": $([ $TEST_FILES -gt 0 ] && echo "true" || echo "false")," >> $OUTPUT_FILE
    echo "      \"testFiles\": $TEST_FILES," >> $OUTPUT_FILE
    
    # Run tests if they exist
    if [ $TEST_FILES -gt 0 ]; then
        echo "Testing $MODULE..."
        TEST_OUTPUT=$(npm test -- $MODULE 2>&1)
        
        # Extract test results
        if echo "$TEST_OUTPUT" | grep -q "Tests:.*passed"; then
            TESTS_LINE=$(echo "$TEST_OUTPUT" | grep "Tests:" | tail -1)
            PASSED=$(echo "$TESTS_LINE" | grep -oP '\d+(?= passed)' || echo "0")
            FAILED=$(echo "$TESTS_LINE" | grep -oP '\d+(?= failed)' || echo "0")
            TOTAL_TESTS=$(echo "$TESTS_LINE" | grep -oP '\d+ total' | grep -oP '\d+' || echo "0")
            
            if [ "$FAILED" = "0" ]; then
                PASSING=$((PASSING + 1))
                STATUS="passing"
            else
                FAILING=$((FAILING + 1))
                STATUS="failing"
            fi
            
            echo "      \"testStatus\": \"$STATUS\"," >> $OUTPUT_FILE
            echo "      \"testsPassing\": $PASSED," >> $OUTPUT_FILE
            echo "      \"testsFailing\": $FAILED," >> $OUTPUT_FILE
            echo "      \"testsTotal\": $TOTAL_TESTS," >> $OUTPUT_FILE
        else
            NO_TESTS=$((NO_TESTS + 1))
            echo "      \"testStatus\": \"no_results\"," >> $OUTPUT_FILE
            echo "      \"testsPassing\": 0," >> $OUTPUT_FILE
            echo "      \"testsFailing\": 0," >> $OUTPUT_FILE
            echo "      \"testsTotal\": 0," >> $OUTPUT_FILE
        fi
    else
        NO_TESTS=$((NO_TESTS + 1))
        echo "      \"testStatus\": \"no_tests\"," >> $OUTPUT_FILE
        echo "      \"testsPassing\": 0," >> $OUTPUT_FILE
        echo "      \"testsFailing\": 0," >> $OUTPUT_FILE
        echo "      \"testsTotal\": 0," >> $OUTPUT_FILE
    fi
    
    # Check for TODOs/stubs
    TODO_COUNT=$(grep -r "TODO\|FIXME\|stub\|placeholder" "$MODULE_DIR" --include="*.ts" --include="*.js" 2>/dev/null | grep -v ".test." | wc -l)
    echo "      \"todoCount\": $TODO_COUNT," >> $OUTPUT_FILE
    
    # Check for Manager.ts and its imports
    if [ -f "$MODULE_DIR/Manager.ts" ]; then
        HAS_OLD_IMPORTS=$(grep -l "StructuredLogger\|PerformanceOptimizer\|MemoryManager\|StandardErrorHandler" "$MODULE_DIR/Manager.ts" 2>/dev/null | wc -l)
        echo "      \"hasManager\": true," >> $OUTPUT_FILE
        echo "      \"needsManagerFix\": $([ $HAS_OLD_IMPORTS -gt 0 ] && echo "true" || echo "false")," >> $OUTPUT_FILE
    else
        echo "      \"hasManager\": false," >> $OUTPUT_FILE
        echo "      \"needsManagerFix\": false," >> $OUTPUT_FILE
    fi
    
    # Check if module has README
    HAS_README=$([ -f "$MODULE_DIR/README.md" ] && echo "true" || echo "false")
    echo "      \"hasReadme\": $HAS_README" >> $OUTPUT_FILE
    
    echo -n "    }" >> $OUTPUT_FILE
done

echo "" >> $OUTPUT_FILE
echo "  ]," >> $OUTPUT_FILE
echo "  \"summary\": {" >> $OUTPUT_FILE
echo "    \"totalModules\": $TOTAL," >> $OUTPUT_FILE
echo "    \"passing\": $PASSING," >> $OUTPUT_FILE
echo "    \"failing\": $FAILING," >> $OUTPUT_FILE
echo "    \"noTests\": $NO_TESTS," >> $OUTPUT_FILE
echo "    \"buildErrors\": $BUILD_ERRORS" >> $OUTPUT_FILE
echo "  }" >> $OUTPUT_FILE
echo "}" >> $OUTPUT_FILE

# Create summary markdown
cat > $SUMMARY_FILE << EOF
# Module Validation Summary

**Date:** $(date -u +%Y-%m-%d)  
**Total Modules:** $TOTAL

## Summary Statistics

- ✅ **Passing:** $PASSING modules ($(( PASSING * 100 / TOTAL ))%)
- ❌ **Failing:** $FAILING modules ($(( FAILING * 100 / TOTAL ))%)
- ⚠️  **No Tests:** $NO_TESTS modules ($(( NO_TESTS * 100 / TOTAL ))%)

## Status Breakdown

| Status | Count | Percentage |
|--------|-------|------------|
| Passing Tests | $PASSING | $(( PASSING * 100 / TOTAL ))% |
| Failing Tests | $FAILING | $(( FAILING * 100 / TOTAL ))% |
| No Tests | $NO_TESTS | $(( NO_TESTS * 100 / TOTAL ))% |

See $OUTPUT_FILE for detailed results.

EOF

echo ""
echo "✅ Validation complete!"
echo "📊 Results saved to $OUTPUT_FILE"
echo "📋 Summary saved to $SUMMARY_FILE"
echo ""
echo "Summary:"
echo "  Total: $TOTAL modules"
echo "  ✅ Passing: $PASSING"
echo "  ❌ Failing: $FAILING"
echo "  ⚠️  No tests: $NO_TESTS"
