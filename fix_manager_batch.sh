#!/bin/bash
# Efficient Manager.ts fixer

fix_manager() {
    local file="$1"
    local module_name=$(basename $(dirname "$file"))
    
    echo "Fixing $module_name..."
    
    # Step 1: Fix imports (remove old, keep Logger)
    perl -i -pe 's|^import \{ StructuredLogger.*\n||g;
                  s|^import \{ PerformanceOptimizer.*\n||g;
                  s|^import \{ MemoryManager.*\n||g;
                  s|^import \{ StandardErrorHandler.*\n||g' "$file"
    
    # Step 2: Add LogLevel if logger exists and LogLevel doesn't
    if grep -q "const logger = " "$file" && ! grep -q "export enum LogLevel" "$file"; then
        sed -i '/^const logger = /a\\nexport enum LogLevel {\n  DEBUG = '\''debug'\'',\n  INFO = '\''info'\'',\n  WARN = '\''warn'\'',\n  ERROR = '\''error'\''\n}' "$file"
    fi
    
    # Step 3: Remove property declarations
    sed -i '/private performanceOptimizer:/d' "$file"
    sed -i '/private memoryManager:/d' "$file"
    sed -i '/private errorHandler:/d' "$file"
    
    # Step 4: Clean constructor - remove initializations
    sed -i '/this\.performanceOptimizer = new/d' "$file"
    sed -i '/this\.memoryManager = new/d' "$file"
    sed -i '/this\.errorHandler = new/d' "$file"
    
    # Step 5: Replace error handler calls
    sed -i 's/this\.errorHandler\.handle/logger.error/g' "$file"
    
    # Step 6: Remove other references
    sed -i '/this\.performanceOptimizer/d' "$file"
    sed -i '/this\.memoryManager\./d' "$file"
    
    echo "✓ $module_name fixed"
}

# Fix each file
for module in CacheManagerPure CachingSystemPure CharacterControllerPure CharacterCustomizationPure; do
    fix_manager "miff/pure/${module}/Manager.ts"
done

echo "All files processed!"
