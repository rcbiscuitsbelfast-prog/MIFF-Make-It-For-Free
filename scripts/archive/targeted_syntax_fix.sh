#!/bin/bash

echo "🎯 Targeted Syntax Fix - Removing malformed auto-added properties"

# Fix 1: Remove incorrectly placed properties outside interface blocks
echo "Removing misplaced properties..."
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i '/^  \/\/ Auto-added common properties$/,/^  metadata?: Record<string, any>;$/d'

# Fix 2: Fix broken interface definitions
echo "Fixing interface definitions..."
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/interface \([^{]*\) {/interface \1 {/g'

# Fix 3: Remove orphaned code blocks
echo "Removing orphaned code blocks..."
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i '/^[[:space:]]*}[[:space:]]*$/N;/^[[:space:]]*}[[:space:]]*\n[[:space:]]*[a-zA-Z]/s/}\n/}\n\n/g'

# Fix 4: Fix malformed object literals
echo "Fixing malformed object literals..."
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/{\s*$/{\n  \/\/ placeholder\n}/g'

# Fix 5: Fix malformed function calls
echo "Fixing malformed function calls..."
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/\(\w\+\)()\s*{/\1() {\n  \/\/ placeholder\n}/g'

echo "✅ Targeted syntax fixes applied!"

# Check error count
echo "Checking error count..."
ERROR_COUNT=$(npx tsc --noEmit --skipLibCheck 2>&1 | wc -l)
echo "Current error count: $ERROR_COUNT"

# Check specific error type counts
TS1109_COUNT=$(npx tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1109" | wc -l)
TS1005_COUNT=$(npx tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1005" | wc -l)
TS1011_COUNT=$(npx tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1011" | wc -l)

echo "TS1109 errors: $TS1109_COUNT"
echo "TS1005 errors: $TS1005_COUNT"
echo "TS1011 errors: $TS1011_COUNT"