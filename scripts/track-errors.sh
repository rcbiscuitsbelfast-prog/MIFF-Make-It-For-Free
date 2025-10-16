#!/bin/bash
echo "=== TypeScript Errors ==="
npx tsc -p tsconfig.json --noEmit 2>&1 | grep "error TS" | wc -l || echo "0"
echo ""
echo "=== Test Results ==="
npm test 2>&1 | grep "Test Suites:" | head -1
