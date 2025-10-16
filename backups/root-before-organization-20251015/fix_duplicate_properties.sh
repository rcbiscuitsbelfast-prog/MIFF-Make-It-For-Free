#!/bin/bash

# Script to fix duplicate property declarations in TypeScript interfaces
# Removes the malformed "Auto-added common properties" sections

echo "Fixing duplicate property declarations..."

# Find all .ts files with duplicate identifier errors
files_with_duplicates=$(npx tsc --noEmit --skipLibCheck 2>&1 | grep "TS2300.*Duplicate identifier" | cut -d: -f1 | sed 's/(.*//' | sort | uniq)

for file in $files_with_duplicates; do
    if [ -f "$file" ]; then
        echo "Processing: $file"
        
        # Remove the malformed "Auto-added common properties" sections
        # This pattern matches the block of properties that cause duplicates
        sed -i '/\/\/ Auto-added common properties/,/metadata?: Record<string, any>;/{
            /\/\/ Auto-added common properties/d
            /id\?: string;/d
            /name\?: string;/d
            /status\?: string;/d
            /data\?: any;/d
            /result\?: any;/d
            /errors\?: string\[\];/d
            /ok\?: boolean;/d
            /timestamp\?: number;/d
            /createdAt\?: number;/d
            /updatedAt\?: number;/d
            /metadata\?: Record<string, any>;/d
        }' "$file"
    fi
done

echo "Duplicate property fixes completed."