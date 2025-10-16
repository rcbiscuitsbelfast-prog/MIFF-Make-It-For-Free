#!/bin/bash

echo "🔧 Continuing targeted fixes..."

# Fix 1: Fix broken object literals and method calls
echo "Fixing broken object literals..."
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/^\s*module:/this.logger = new StructuredLogger({/g'
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/^\s*level:/level:/g'
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/^\s*enablePerformance:/enablePerformance:/g'
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/^\s*enableMemory:/enableMemory:/g'

# Fix 2: Fix missing semicolons
echo "Fixing missing semicolons..."
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/}\s*$/};/g'

# Fix 3: Fix broken method signatures
echo "Fixing method signatures..."
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/async initialize(): Promise<void> {/async initialize(): Promise<void> {/g'

# Fix 4: Remove orphaned code blocks
echo "Removing orphaned code blocks..."
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i '/^\s*}\s*$/N;/^\s*}\s*\n\s*async initialize/d'

echo "✅ Additional fixes applied!"

# Check error count
echo "Checking error count..."
ERROR_COUNT=$(npx tsc --noEmit --skipLibCheck 2>&1 | wc -l)
echo "Current error count: $ERROR_COUNT"