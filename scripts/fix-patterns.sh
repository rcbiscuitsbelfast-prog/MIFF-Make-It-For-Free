#!/bin/bash

# Fix pattern errors across all TypeScript files

echo "Applying pattern fixes..."

# Fix TS2554: StructuredLogger constructor
echo "1. Fixing StructuredLogger() calls..."
find miff/pure -name "*.ts" -type f -print0 | xargs -0 sed -i 's/new StructuredLogger()/new StructuredLogger("default", {})/g'

# Fix TS2554: InputSanitizer constructor
echo "2. Fixing InputSanitizer() calls..."
find miff/pure -name "*.ts" -type f -print0 | xargs -0 sed -i 's/new InputSanitizer()/new InputSanitizer({})/g'

# Fix TS2322: Date vs number for startTime
echo "3. Fixing startTime: Date.now()..."
find miff/pure -name "*.ts" -type f -print0 | xargs -0 sed -i 's/startTime: new Date()/startTime: Date.now()/g'

# Fix TS2322: Date vs number for endTime
echo "4. Fixing endTime: Date.now()..."
find miff/pure -name "*.ts" -type f -print0 | xargs -0 sed -i 's/endTime: new Date()/endTime: Date.now()/g'

# Fix TS2322: Date vs number for timestamp
echo "5. Fixing timestamp: Date.now()..."
find miff/pure -name "*.ts" -type f -print0 | xargs -0 sed -i 's/timestamp: new Date()/timestamp: Date.now()/g'

# Fix TS2322: Date vs number for lastAccess
echo "6. Fixing lastAccess: Date.now()..."
find miff/pure -name "*.ts" -type f -print0 | xargs -0 sed -i 's/lastAccess: new Date()/lastAccess: Date.now()/g'

# Fix TS2322: Date vs number for createdAt
echo "7. Fixing createdAt: Date.now()..."
find miff/pure -name "*.ts" -type f -print0 | xargs -0 sed -i 's/createdAt: new Date()/createdAt: Date.now()/g'

# Fix TS2322: Date vs number for updatedAt
echo "8. Fixing updatedAt: Date.now()..."
find miff/pure -name "*.ts" -type f -print0 | xargs -0 sed -i 's/updatedAt: new Date()/updatedAt: Date.now()/g'

echo "Pattern fixes complete!"
