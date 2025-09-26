#!/bin/bash
# Security validation script

echo "🔒 Validating repository security..."

# Check for security issues
issues=0

# Check for outdated actions
outdated=$(grep -r "actions/checkout@v3\|actions/setup-node@v3\|actions/upload-artifact@v3" .github/workflows/ --include="*.yml" | wc -l)
if [ "$outdated" -gt 0 ]; then
    echo "⚠️ Found $outdated outdated GitHub Actions"
    issues=$((issues + 1))
fi

# Check for dangerous permissions
dangerous=$(grep -r "contents: write" .github/workflows/*.yml | grep -v "release.yml\|build-deploy.yml" | wc -l)
if [ "$dangerous" -gt 0 ]; then
    echo "⚠️ Found $dangerous workflows with dangerous permissions"
    issues=$((issues + 1))
fi

# Check for missing security workflow
if [ ! -f ".github/workflows/security.yml" ]; then
    echo "❌ Security workflow missing"
    issues=$((issues + 1))
fi

if [ "$issues" -eq 0 ]; then
    echo "✅ Security validation passed"
    exit 0
else
    echo "❌ Found $issues security issues"
    exit 1
fi
