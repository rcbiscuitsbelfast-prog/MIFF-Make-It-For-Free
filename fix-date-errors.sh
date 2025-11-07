#!/bin/bash
# Fix Date → number errors by converting new Date() to Date.now()
# Only for timestamp assignments

find /workspace/miff/pure -name "*.ts" -type f ! -path "*/node_modules/*" | while read file; do
  # Fix patterns like: lastUpdate = new Date()
  sed -i 's/\(lastUpdate\|timestamp\|createdAt\|updatedAt\|lastAccess\|startTime\|endTime\) = new Date()/\1 = Date.now()/g' "$file"
done

echo "✅ Date fixes applied!"
