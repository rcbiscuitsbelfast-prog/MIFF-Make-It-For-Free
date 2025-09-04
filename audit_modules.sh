#!/bin/bash

# MIFF Module Audit Script
# Generates comprehensive inventory of all Pure modules

echo "# MIFF Module Inventory & Readiness Assessment"
echo ""
echo "Generated: $(date)"
echo ""

total_modules=0
cli_ready=0
test_ready=0
fixture_ready=0
orchestration_ready=0

# Phase 17 orchestration-ready modules
orchestration_modules=("ModdingPure" "DialoguePure" "VisualReplaySystemPure" "BridgeSchemaPure" "AudioPure" "NetworkBridgePure")

echo "## Module Inventory"
echo ""

for module_dir in miff/pure/*Pure; do
    if [ -d "$module_dir" ]; then
        module_name=$(basename "$module_dir")
        total_modules=$((total_modules + 1))
        
        # Check for CLI harness
        has_cli=""
        if [ -f "$module_dir/cliHarness.ts" ]; then
            has_cli="✅"
            cli_ready=$((cli_ready + 1))
        else
            has_cli="❌"
        fi
        
        # Check for test files
        has_tests=""
        test_files=$(find "$module_dir" -name "*.test.ts" -o -name "golden*.test.ts" 2>/dev/null | wc -l)
        if [ "$test_files" -gt 0 ]; then
            has_tests="✅ ($test_files)"
            test_ready=$((test_ready + 1))
        else
            has_tests="❌"
        fi
        
        # Check for sample fixtures
        has_fixtures=""
        fixture_files=$(find "$module_dir" -name "sample_*.json" -o -name "fixtures" -type d 2>/dev/null | wc -l)
        if [ "$fixture_files" -gt 0 ]; then
            has_fixtures="✅"
            fixture_ready=$((fixture_ready + 1))
        else
            has_fixtures="❌"
        fi
        
        # Check if orchestration-ready (Phase 17 modules)
        is_orchestration=""
        for orch_module in "${orchestration_modules[@]}"; do
            if [ "$module_name" = "$orch_module" ]; then
                is_orchestration="✅ Phase 17"
                orchestration_ready=$((orchestration_ready + 1))
                break
            fi
        done
        if [ -z "$is_orchestration" ]; then
            is_orchestration="❌"
        fi
        
        echo "| $module_name | $has_cli | $has_tests | $has_fixtures | $is_orchestration |"
    fi
done

echo ""
echo "## Summary Statistics"
echo ""
echo "- **Total Modules**: $total_modules"
echo "- **CLI Ready**: $cli_ready ($((cli_ready * 100 / total_modules))%)"
echo "- **Test Ready**: $test_ready ($((test_ready * 100 / total_modules))%)"
echo "- **Fixture Ready**: $fixture_ready ($((fixture_ready * 100 / total_modules))%)"
echo "- **Orchestration Ready**: $orchestration_ready ($((orchestration_ready * 100 / total_modules))%)"
echo ""