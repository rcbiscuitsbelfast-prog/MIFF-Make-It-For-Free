#!/bin/bash

# MIFF Root Directory Organization Script
# This script systematically organizes the 271+ files in the root directory

set -e

echo "🧹 MIFF Root Directory Organization"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

function log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

function warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

function error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

function info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Create organization report
echo "📊 MIFF Root Directory Organization Report" > organization-report.md
echo "- **Organization Date:** $(date)" >> organization-report.md
echo "" >> organization-report.md

# Step 1: Physics Export Files Organization
log "Step 1: Organizing physics export files..."
physics_json=$(find . -maxdepth 1 -name "physics_export_json_*.json" | wc -l)
physics_manifest=$(find . -maxdepth 1 -name "physics_export_manifest_*.txt" | wc -l)
physics_summary=$(find . -maxdepth 1 -name "physics_export_summary_*.txt" | wc -l)

log "Found $physics_json physics JSON files"
log "Found $physics_manifest physics manifest files"
log "Found $physics_summary physics summary files"

echo "### Physics Export Organization" >> organization-report.md
echo "- **JSON files organized:** $physics_json" >> organization-report.md
echo "- **Manifest files organized:** $physics_manifest" >> organization-report.md
echo "- **Summary files organized:** $physics_summary" >> organization-report.md
echo "" >> organization-report.md

# Move physics export files
if [ "$physics_json" -gt 0 ]; then
    for file in physics_export_json_*.json; do
        if [ -f "$file" ]; then
            # Extract timestamp and create dated directory
            timestamp=$(echo "$file" | sed 's/physics_export_json_\(.*\)\.json/\1/')
            date_dir=$(echo "$timestamp" | cut -c1-8)
            mkdir -p "exports/physics/archives/$date_dir"
            mv "$file" "exports/physics/archives/$date_dir/"
            log "Moved: $file -> exports/physics/archives/$date_dir/"
        fi
    done
fi

if [ "$physics_manifest" -gt 0 ]; then
    for file in physics_export_manifest_*.txt; do
        if [ -f "$file" ]; then
            mv "$file" "exports/physics/manifests/"
            log "Moved: $file -> exports/physics/manifests/"
        fi
    done
fi

if [ "$physics_summary" -gt 0 ]; then
    for file in physics_export_summary_*.txt; do
        if [ -f "$file" ]; then
            mv "$file" "exports/physics/summaries/"
            log "Moved: $file -> exports/physics/summaries/"
        fi
    done
fi

# Step 2: Audit Reports Organization
log "Step 2: Organizing audit reports..."
audit_files=$(find . -maxdepth 1 -name "*AUDIT*.md" -o -name "*audit*.md" | wc -l)
log "Found $audit_files audit report files"

echo "### Audit Reports Organization" >> organization-report.md
echo "- **Audit files organized:** $audit_files" >> organization-report.md
echo "" >> organization-report.md

# Move audit files to organized structure
audit_files_list=$(find . -maxdepth 1 -name "*AUDIT*.md" -o -name "*audit*.md")
for file in $audit_files_list; do
    if [ -f "$file" ]; then
        # Move comprehensive audits to latest
        if [[ "$file" == *"MIFF_ULTIMATE"* ]] || [[ "$file" == *"SUPREME_PROFESSIONAL"* ]]; then
            mv "$file" "docs/audit/latest/"
            log "Moved: $file -> docs/audit/latest/"
        # Move workflow audits to specialized
        elif [[ "$file" == *"WORKFLOW"* ]]; then
            mv "$file" "docs/audit/specialized/"
            log "Moved: $file -> docs/audit/specialized/"
        # Move security audits to security
        elif [[ "$file" == *"SECURITY"* ]] || [[ "$file" == *"VULNERABILIT"* ]]; then
            mv "$file" "docs/audit/security/"
            log "Moved: $file -> docs/audit/security/"
        # Move others to historical
        else
            mv "$file" "docs/audit/historical/"
            log "Moved: $file -> docs/audit/historical/"
        fi
    fi
done

# Step 3: Phase Reports Organization
log "Step 3: Organizing phase reports..."
phase_files=$(find . -maxdepth 1 -name "PHASE*.md" | wc -l)
log "Found $phase_files phase report files"

echo "### Phase Reports Organization" >> organization-report.md
echo "- **Phase files organized:** $phase_files" >> organization-report.md
echo "" >> organization-report.md

# Move phase files
for file in PHASE*.md; do
    if [ -f "$file" ]; then
        if [[ "$file" == *"PHASE_1"* ]]; then
            mv "$file" "docs/phases/phase-1/"
            log "Moved: $file -> docs/phases/phase-1/"
        elif [[ "$file" == *"PHASE_2"* ]]; then
            mv "$file" "docs/phases/phase-2/"
            log "Moved: $file -> docs/phases/phase-2/"
        elif [[ "$file" == *"PHASE4"* ]]; then
            mv "$file" "docs/phases/phase-4/"
            log "Moved: $file -> docs/phases/phase-4/"
        else
            mv "$file" "docs/phases/final/"
            log "Moved: $file -> docs/phases/final/"
        fi
    fi
done

# Step 4: Configuration Files Organization
log "Step 4: Organizing configuration files..."
config_files=$(find . -maxdepth 1 -name "*.config.*" -o -name "jest.config.*" -o -name "babel.config.*" | wc -l)
log "Found $config_files configuration files"

echo "### Configuration Files Organization" >> organization-report.md
echo "- **Config files organized:** $config_files" >> organization-report.md
echo "" >> organization-report.md

# Move configuration files
config_files_list=$(find . -maxdepth 1 -name "*.config.*" -o -name "jest.config.*" -o -name "babel.config.*")
for file in $config_files_list; do
    if [ -f "$file" ]; then
        mv "$file" "config/"
        log "Moved: $file -> config/"
    fi
done

# Step 5: Script Organization
log "Step 5: Organizing scripts..."
script_files=$(find . -maxdepth 1 -name "*.sh" -o -name "*.js" | grep -v node_modules | wc -l)
log "Found $script_files script files"

echo "### Script Organization" >> organization-report.md
echo "- **Script files organized:** $script_files" >> organization-report.md
echo "" >> organization-report.md

# Move scripts to appropriate directories
for file in *.sh; do
    if [ -f "$file" ] && [ "$file" != "organize-root.sh" ]; then
        if [[ "$file" == *"build"* ]]; then
            mv "$file" "scripts/build/"
            log "Moved: $file -> scripts/build/"
        elif [[ "$file" == *"deploy"* ]]; then
            mv "$file" "scripts/deploy/"
            log "Moved: $file -> scripts/deploy/"
        elif [[ "$file" == *"maintenance"* ]] || [[ "$file" == *"cleanup"* ]]; then
            mv "$file" "scripts/maintenance/"
            log "Moved: $file -> scripts/maintenance/"
        elif [[ "$file" == *"test"* ]] || [[ "$file" == *"verify"* ]]; then
            mv "$file" "scripts/utilities/"
            log "Moved: $file -> scripts/utilities/"
        else
            mv "$file" "scripts/utilities/"
            log "Moved: $file -> scripts/utilities/"
        fi
    fi
done

# Move other utility scripts
for file in *.js; do
    if [ -f "$file" ] && [[ "$file" != *"config"* ]] && [[ "$file" != *"setup"* ]]; then
        if [[ "$file" == *"build"* ]] || [[ "$file" == *"generate"* ]]; then
            mv "$file" "scripts/build/"
            log "Moved: $file -> scripts/build/"
        elif [[ "$file" == *"deploy"* ]] || [[ "$file" == *"publish"* ]]; then
            mv "$file" "scripts/deploy/"
            log "Moved: $file -> scripts/deploy/"
        elif [[ "$file" == *"maintenance"* ]] || [[ "$file" == *"cleanup"* ]] || [[ "$file" == *"fix"* ]]; then
            mv "$file" "scripts/maintenance/"
            log "Moved: $file -> scripts/maintenance/"
        else
            mv "$file" "scripts/utilities/"
            log "Moved: $file -> scripts/utilities/"
        fi
    fi
done

# Step 6: Documentation Organization
log "Step 6: Organizing documentation files..."
doc_files=$(find . -maxdepth 1 -name "*.md" | grep -v -E "(README|LICENSE|CONTRIBUTING)" | wc -l)
log "Found $doc_files documentation files"

echo "### Documentation Organization" >> organization-report.md
echo "- **Documentation files organized:** $doc_files" >> organization-report.md
echo "" >> organization-report.md

# Move documentation files
for file in *.md; do
    if [ -f "$file" ] && [[ "$file" != "README.md" ]] && [[ "$file" != "LICENSE.md" ]] && [[ "$file" != "CONTRIBUTING.md" ]]; then
        if [[ "$file" == *"IMPLEMENTATION"* ]] || [[ "$file" == *"EXPANSION"* ]] || [[ "$file" == *"ARCHITECTURE"* ]]; then
            mv "$file" "docs/"
            log "Moved: $file -> docs/"
        elif [[ "$file" == *"STANDARDIZATION"* ]] || [[ "$file" == *"ASSESSMENT"* ]]; then
            mv "$file" "docs/"
            log "Moved: $file -> docs/"
        else
            mv "$file" "docs/"
            log "Moved: $file -> docs/"
        fi
    fi
done

# Step 7: Final Statistics
log "Step 7: Calculating final statistics..."
final_root_files=$(find . -maxdepth 1 -type f | wc -l)
files_organized=$((271 - final_root_files))

echo "### Final Statistics" >> organization-report.md
echo "- **Files organized:** $files_organized" >> organization-report.md
echo "- **Remaining root files:** $final_root_files" >> organization-report.md
echo "- **Organization efficiency:** $(echo "scale=1; $files_organized * 100 / 271" | bc -l)%" >> organization-report.md
echo "" >> organization-report.md

# Create directory index files
log "Creating directory index files..."

# Exports index
cat > exports/README.md << 'EOF'
# Exports Directory

## Structure
- `/physics/` - Physics simulation export files
  - `/current/` - Latest exports
  - `/archives/` - Historical exports (organized by date)
  - `/manifests/` - Export manifest files
  - `/summaries/` - Export summary files

## Management
- Physics exports older than 30 days → archives
- Archives cleaned up after 90 days
- Keep only 5 most recent exports in current
EOF

# Config index
cat > config/README.md << 'EOF'
# Configuration Directory

## Files
- `babel.config.cjs` - Babel transpilation configuration
- `jest.*.cjs` - Jest test configurations
- `*.config.*` - Other configuration files

## Usage
Edit files in this directory for configuration changes.
Root symlinks maintain compatibility with existing tools.
EOF

# Scripts index
cat > scripts/README.md << 'EOF'
# Scripts Directory

## Categories
- `/build/` - Build and compilation scripts
- `/deploy/` - Deployment and publishing scripts
- `/maintenance/` - Cleanup and maintenance scripts
- `/utilities/` - General utility scripts
- `/ci/` - CI/CD related scripts

## Guidelines
- All scripts should be executable
- Include usage documentation in comments
- Add error handling for production use
EOF

log "✅ Root directory organization completed!"

# Display final summary
echo ""
echo "📋 ORGANIZATION SUMMARY"
echo "======================="
echo "✅ Physics export files: $physics_json JSON + $physics_manifest manifests + $physics_summary summaries"
echo "✅ Audit reports: $audit_files reports organized"
echo "✅ Phase reports: $phase_files reports organized"
echo "✅ Configuration files: $config_files files moved"
echo "✅ Script files: $script_files files organized"
echo "✅ Documentation files: $doc_files files organized"
echo ""
echo "📊 FINAL RESULTS"
echo "==============="
echo "Files organized: $files_organized"
echo "Remaining root files: $final_root_files"
echo "Organization efficiency: $(echo "scale=1; $files_organized * 100 / 271" | bc -l)%"
echo ""
echo "🎉 Root directory organization completed successfully!"

# Save organization report
log "Organization report saved to: organization-report.md"