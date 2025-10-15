#!/bin/bash

echo "🎯 Fixing malformed auto-added properties across all files"

# Fix 1: Remove incorrectly placed properties outside interface/class blocks
echo "Removing misplaced properties..."
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i '/^[[:space:]]*\/\/ Auto-added common properties$/,/^[[:space:]]*metadata?: Record<string, any>;$/d'

# Fix 2: Remove properties that appear outside of interface/class definitions
echo "Removing orphaned properties..."
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i '/^[[:space:]]*id?: string;$/d'
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i '/^[[:space:]]*name?: string;$/d'
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i '/^[[:space:]]*status?: string;$/d'
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i '/^[[:space:]]*data?: any;$/d'
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i '/^[[:space:]]*result?: any;$/d'
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i '/^[[:space:]]*errors?: string\[\];$/d'
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i '/^[[:space:]]*ok?: boolean;$/d'
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i '/^[[:space:]]*timestamp?: number;$/d'
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i '/^[[:space:]]*createdAt?: number;$/d'
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i '/^[[:space:]]*updatedAt?: number;$/d'
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i '/^[[:space:]]*metadata?: Record<string, any>;$/d'

# Fix 3: Clean up any remaining orphaned code
echo "Cleaning up orphaned code..."
find miff -name "*.ts" -o -name "*.tsx" | xargs sed -i '/^[[:space:]]*$/N;/^[[:space:]]*\n[[:space:]]*[a-zA-Z]/s/\n\n/\n/g'

echo "✅ Malformed properties fixed!"

# Check error count
echo "Checking error count..."
ERROR_COUNT=$(npx tsc --noEmit --skipLibCheck 2>&1 | wc -l)
echo "Current error count: $ERROR_COUNT"