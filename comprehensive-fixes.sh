#!/bin/bash
echo "🎯 Applying comprehensive fixes..."

# Fix 1: More Date fixes
find /workspace/miff/pure -name "*.ts" -type f ! -path "*/node_modules/*" | while read file; do
  sed -i 's/: Date = new Date()/: number = Date.now()/g' "$file"
  sed -i 's/\(session\|state\|config\|data\)\.\(last\|created\|updated\|start\|end\|time\)At = new Date()/\1.\2At = Date.now()/g' "$file"
done

# Fix 2: Add type annotations for common implicit any
find /workspace/miff/pure -name "*.ts" -type f ! -path "*/node_modules/*" | while read file; do
  sed -i 's/function \([a-zA-Z]*\)(data)/function \1(data: any)/g' "$file"
  sed -i 's/function \([a-zA-Z]*\)(config)/function \1(config: any)/g' "$file"
  sed -i 's/function \([a-zA-Z]*\)(state)/function \1(state: any)/g' "$file"
done

echo "✅ Comprehensive fixes applied!"
