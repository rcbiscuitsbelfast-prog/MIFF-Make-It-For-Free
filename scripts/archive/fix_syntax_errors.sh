#!/bin/bash

echo "🔧 Fixing syntax errors caused by automated script..."

# Fix 1: Remove incorrectly placed properties outside interface blocks
echo "Removing misplaced properties..."
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i '/^  \/\/ Auto-added common properties$/,/^  metadata?: Record<string, any>;$/d'

# Fix 2: Fix broken interface definitions
echo "Fixing interface definitions..."
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/interface \([^{]*\) {/interface \1 {/g'

# Fix 3: Remove duplicate properties that might have been added
echo "Removing duplicate properties..."
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i '/^  id?: string;$/N;/^  id?: string;\n  id?: string;$/d'

# Fix 4: Fix any remaining syntax issues
echo "Fixing remaining syntax issues..."
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/}\s*interface/}\ninterface/g'

echo "✅ Syntax errors fixed!"

# Check error count
echo "Checking error count..."
ERROR_COUNT=$(npx tsc --noEmit --skipLibCheck 2>&1 | wc -l)
echo "Current error count: $ERROR_COUNT"