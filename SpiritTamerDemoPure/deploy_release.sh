#!/bin/bash

# Spirit Tamer: Trial of the Grove - Release Deployment Script
# Purpose: Deploy v1.0.0 release to production
# Version: 1.0.0
# Date: December 19, 2024

set -e  # Exit on any error

# Configuration
SCENARIO_NAME="Spirit Tamer: Trial of the Grove"
SCENARIO_VERSION="1.0.0"
RELEASE_TAG="v1.0.0"
DEPLOYMENT_DIR="./deployed_release"
BACKUP_DIR="./backup_$(date +%Y%m%d_%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_header "Checking Prerequisites"
    
    # Check if we're in the right directory
    if [[ ! -f "orchestration.json" ]]; then
        log_error "orchestration.json not found. Please run this script from the SpiritTamerDemoPure directory."
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+ to continue."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $NODE_VERSION -lt 18 ]]; then
        log_warning "Node.js version $NODE_VERSION detected. Node.js 18+ is recommended."
    fi
    
    log_success "Prerequisites check completed"
}

# Create backup
create_backup() {
    log_header "Creating Backup"
    
    if [[ -d "$DEPLOYMENT_DIR" ]]; then
        log_info "Creating backup of existing deployment..."
        mkdir -p "$BACKUP_DIR"
        cp -r "$DEPLOYMENT_DIR"/* "$BACKUP_DIR/" 2>/dev/null || true
        log_success "Backup created at: $BACKUP_DIR"
    else
        log_info "No existing deployment found, skipping backup"
    fi
}

# Validate release
validate_release() {
    log_header "Validating Release"
    
    # Check if validation script exists
    if [[ ! -f "validate_release.js" ]]; then
        log_error "validate_release.js not found. Cannot proceed with validation."
        exit 1
    fi
    
    # Run validation
    log_info "Running release validation..."
    if node validate_release.js; then
        log_success "Release validation passed"
    else
        log_error "Release validation failed. Please fix issues before deploying."
        exit 1
    fi
}

# Create deployment directory
create_deployment_dir() {
    log_header "Creating Deployment Directory"
    
    # Remove existing deployment directory
    if [[ -d "$DEPLOYMENT_DIR" ]]; then
        log_info "Removing existing deployment directory..."
        rm -rf "$DEPLOYMENT_DIR"
    fi
    
    # Create new deployment directory
    log_info "Creating deployment directory: $DEPLOYMENT_DIR"
    mkdir -p "$DEPLOYMENT_DIR"
    mkdir -p "$DEPLOYMENT_DIR/fixtures"
    mkdir -p "$DEPLOYMENT_DIR/.github/workflows"
    mkdir -p "$DEPLOYMENT_DIR/scripts"
    
    log_success "Deployment directory structure created"
}

# Deploy core scenario files
deploy_core_scenario() {
    log_header "Deploying Core Scenario Files"
    
    # Core orchestration
    log_info "Deploying orchestration.json..."
    cp orchestration.json "$DEPLOYMENT_DIR/"
    
    # Fixtures
    log_info "Deploying fixture files..."
    cp fixtures/quest_pack_fae.json "$DEPLOYMENT_DIR/fixtures/"
    cp fixtures/npc_dialogue_trees_fae.json "$DEPLOYMENT_DIR/fixtures/"
    cp fixtures/npc_tables_mythic.json "$DEPLOYMENT_DIR/fixtures/"
    cp fixtures/location_registry.json "$DEPLOYMENT_DIR/fixtures/"
    
    log_success "Core scenario files deployed"
}

# Deploy recovery components
deploy_recovery_components() {
    log_header "Deploying Recovery Components"
    
    # CI recovery reports
    log_info "Deploying CI recovery components..."
    cp ci_recovery_report.json "$DEPLOYMENT_DIR/"
    cp ci_recovery_patched_report.json "$DEPLOYMENT_DIR/"
    cp link_integrity_report.json "$DEPLOYMENT_DIR/"
    cp golden_replay_flags.json "$DEPLOYMENT_DIR/"
    
    log_success "Recovery components deployed"
}

# Deploy asset stubs
deploy_asset_stubs() {
    log_header "Deploying Asset Stubs"
    
    # Asset stub files
    log_info "Deploying asset stub files..."
    cp audio_stub.json "$DEPLOYMENT_DIR/"
    cp visual_manifest.json "$DEPLOYMENT_DIR/"
    cp asset_todo.json "$DEPLOYMENT_DIR/"
    
    log_success "Asset stubs deployed"
}

# Deploy CI workflows
deploy_ci_workflows() {
    log_header "Deploying CI Workflows"
    
    # CI workflow files
    log_info "Deploying CI workflow files..."
    cp .github/workflows/ci.yml "$DEPLOYMENT_DIR/.github/workflows/"
    cp .github/workflows/ci-recovery-patched.yml "$DEPLOYMENT_DIR/.github/workflows/"
    cp .github/workflows/ci-recovery.yml "$DEPLOYMENT_DIR/.github/workflows/"
    
    log_success "CI workflows deployed"
}

# Deploy modular hooks
deploy_modular_hooks() {
    log_header "Deploying Modular Hooks"
    
    # Modular hook system
    log_info "Deploying modular hooks..."
    cp modular_hooks.json "$DEPLOYMENT_DIR/"
    
    log_success "Modular hooks deployed"
}

# Deploy Toppler integration
deploy_toppler_integration() {
    log_header "Deploying Toppler Integration"
    
    # Toppler stub and script
    log_info "Deploying Toppler integration..."
    cp toppler_stub.json "$DEPLOYMENT_DIR/"
    cp scripts/gen-toppler-stub.js "$DEPLOYMENT_DIR/scripts/"
    
    log_success "Toppler integration deployed"
}

# Deploy documentation
deploy_documentation() {
    log_header "Deploying Documentation"
    
    # Documentation files
    log_info "Deploying documentation..."
    cp README_assets.md "$DEPLOYMENT_DIR/"
    cp asset_audit_summary.json "$DEPLOYMENT_DIR/"
    cp ci_workflow_audit_summary.json "$DEPLOYMENT_DIR/"
    
    log_success "Documentation deployed"
}

# Deploy release manifests
deploy_release_manifests() {
    log_header "Deploying Release Manifests"
    
    # Release manifest files
    log_info "Deploying release manifests..."
    cp release_manifest.json "$DEPLOYMENT_DIR/"
    cp runtime_config.json "$DEPLOYMENT_DIR/"
    cp bundle_manifest.json "$DEPLOYMENT_DIR/"
    
    log_success "Release manifests deployed"
}

# Create deployment package
create_deployment_package() {
    log_header "Creating Deployment Package"
    
    PACKAGE_NAME="spirit_tamer_grove_${SCENARIO_VERSION//./_}.zip"
    
    log_info "Creating deployment package: $PACKAGE_NAME"
    
    # Create zip package
    if command -v zip &> /dev/null; then
        cd "$DEPLOYMENT_DIR"
        zip -r "../$PACKAGE_NAME" .
        cd ..
        log_success "Deployment package created: $PACKAGE_NAME"
    else
        log_warning "zip command not found. Please install zip to create deployment package."
        log_info "Deployment files are available in: $DEPLOYMENT_DIR"
    fi
}

# Verify deployment
verify_deployment() {
    log_header "Verifying Deployment"
    
    # Check if all required files are present
    log_info "Verifying deployed files..."
    
    REQUIRED_FILES=(
        "orchestration.json"
        "fixtures/quest_pack_fae.json"
        "fixtures/npc_dialogue_trees_fae.json"
        "fixtures/npc_tables_mythic.json"
        "fixtures/location_registry.json"
        "ci_recovery_report.json"
        "ci_recovery_patched_report.json"
        "link_integrity_report.json"
        "golden_replay_flags.json"
        "audio_stub.json"
        "visual_manifest.json"
        "asset_todo.json"
        ".github/workflows/ci.yml"
        ".github/workflows/ci-recovery-patched.yml"
        ".github/workflows/ci-recovery.yml"
        "modular_hooks.json"
        "toppler_stub.json"
        "scripts/gen-toppler-stub.js"
        "README_assets.md"
        "asset_audit_summary.json"
        "ci_workflow_audit_summary.json"
        "release_manifest.json"
        "runtime_config.json"
        "bundle_manifest.json"
    )
    
    MISSING_FILES=()
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [[ ! -f "$DEPLOYMENT_DIR/$file" ]]; then
            MISSING_FILES+=("$file")
        fi
    done
    
    if [[ ${#MISSING_FILES[@]} -eq 0 ]]; then
        log_success "All required files are present in deployment"
    else
        log_error "Missing files in deployment:"
        for file in "${MISSING_FILES[@]}"; do
            echo "  - $file"
        done
        exit 1
    fi
    
    # Count total files
    TOTAL_FILES=$(find "$DEPLOYMENT_DIR" -type f | wc -l)
    log_info "Total files deployed: $TOTAL_FILES"
}

# Create deployment summary
create_deployment_summary() {
    log_header "Creating Deployment Summary"
    
    SUMMARY_FILE="$DEPLOYMENT_DIR/DEPLOYMENT_SUMMARY.md"
    
    cat > "$SUMMARY_FILE" << EOF
# 🚀 Deployment Summary - Spirit Tamer: Trial of the Grove v1.0.0

**Deployment Date:** $(date)
**Deployment Time:** $(date +%H:%M:%S)
**Scenario Version:** $SCENARIO_VERSION
**Release Tag:** $RELEASE_TAG

## 📦 Deployment Contents

### Core Scenario Files
- ✅ orchestration.json
- ✅ fixtures/quest_pack_fae.json
- ✅ fixtures/npc_dialogue_trees_fae.json
- ✅ fixtures/npc_tables_mythic.json
- ✅ fixtures/location_registry.json

### Recovery Components
- ✅ ci_recovery_report.json
- ✅ ci_recovery_patched_report.json
- ✅ link_integrity_report.json
- ✅ golden_replay_flags.json

### Asset Stubs
- ✅ audio_stub.json
- ✅ visual_manifest.json
- ✅ asset_todo.json

### CI Workflows
- ✅ .github/workflows/ci.yml
- ✅ .github/workflows/ci-recovery-patched.yml
- ✅ .github/workflows/ci-recovery.yml

### Modular System
- ✅ modular_hooks.json

### Toppler Integration
- ✅ toppler_stub.json
- ✅ scripts/gen-toppler-stub.js

### Documentation
- ✅ README_assets.md
- ✅ asset_audit_summary.json
- ✅ ci_workflow_audit_summary.json

### Release Manifests
- ✅ release_manifest.json
- ✅ runtime_config.json
- ✅ bundle_manifest.json

## 🎯 Next Steps

1. **Run Validation**: Execute \`node validate_release.js\`
2. **Test CI Recovery**: Validate CI workflow recovery
3. **Launch Playtesting**: Begin multi-agent testing
4. **Start Remix Challenges**: Enable community modifications

## 🔧 Environment Variables

\`\`\`bash
SCENARIO_VERSION=$SCENARIO_VERSION
REMIX_MODE=enabled
ASSET_STUBS=enabled
CI_RECOVERY=enabled
MULTI_AGENT=enabled
\`\`\`

## 📊 Deployment Statistics

- **Total Files:** $(find "$DEPLOYMENT_DIR" -type f | wc -l)
- **Total Size:** $(du -sh "$DEPLOYMENT_DIR" | cut -f1)
- **Deployment Time:** $(date +%H:%M:%S)

## 🎉 Deployment Complete!

**Spirit Tamer: Trial of the Grove v1.0.0** has been successfully deployed and is ready for production use.

---

*Deployed by MIFF Framework Team*  
*$(date)*  
*Version $SCENARIO_VERSION*
EOF
    
    log_success "Deployment summary created: $SUMMARY_FILE"
}

# Main deployment function
main() {
    log_header "Starting Deployment - $SCENARIO_NAME $SCENARIO_VERSION"
    
    log_info "Scenario: $SCENARIO_NAME"
    log_info "Version: $SCENARIO_VERSION"
    log_info "Release Tag: $RELEASE_TAG"
    log_info "Deployment Directory: $DEPLOYMENT_DIR"
    
    # Execute deployment steps
    check_prerequisites
    create_backup
    validate_release
    create_deployment_dir
    deploy_core_scenario
    deploy_recovery_components
    deploy_asset_stubs
    deploy_ci_workflows
    deploy_modular_hooks
    deploy_toppler_integration
    deploy_documentation
    deploy_release_manifests
    verify_deployment
    create_deployment_summary
    create_deployment_package
    
    log_header "Deployment Complete!"
    log_success "$SCENARIO_NAME $SCENARIO_VERSION has been successfully deployed!"
    log_info "Deployment location: $DEPLOYMENT_DIR"
    log_info "Next step: Run 'node validate_release.js' to verify deployment"
    
    if [[ -n "$BACKUP_DIR" && -d "$BACKUP_DIR" ]]; then
        log_info "Backup location: $BACKUP_DIR"
    fi
}

# Run main function
main "$@"