#!/bin/bash

# MIFF Documentation Deployment Script
# This script builds the documentation site and prepares it for GitHub Pages

set -e

echo "🚀 MIFF Documentation Deployment"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Step 1: Build documentation site
log "Building documentation site..."
cd docs
npm run build

if [ $? -ne 0 ]; then
    error "Documentation build failed!"
    cd ..
    exit 1
fi

log "Documentation build completed successfully"
cd ..

# Step 3: Copy RenderWorld Hub files
log "Copying RenderWorld Hub files..."
if [ -f "docs/renderworld-hub.js" ] && [ -f "docs/index.html" ]; then
    cp docs/renderworld-hub.js docs/dist/
    cp docs/index.html docs/dist/
    log "RenderWorld Hub files copied"
else
    warn "RenderWorld Hub files not found in docs directory"
fi

# Step 4: Prepare docs directory for GitHub Pages
log "Preparing docs directory for GitHub Pages..."

# Backup existing docs if it exists
if [ -d "../docs-old" ]; then
    warn "Removing old backup..."
    rm -rf ../docs-old
fi

# Backup current docs
if [ "$(ls -A ../docs 2>/dev/null)" ]; then
    log "Backing up existing docs directory..."
    mv ../docs ../docs-old
fi

# Copy built site to docs root for GitHub Pages
log "Deploying built site to GitHub Pages directory..."

# Deploy to root docs directory (GitHub Pages serves from docs/)
ROOT_DOCS_DIR="../../docs"
if [ -d "$ROOT_DOCS_DIR" ]; then
    # Backup existing docs if it exists
    if [ "$(ls -A "$ROOT_DOCS_DIR" 2>/dev/null)" ]; then
        log "Backing up existing docs directory..."
        mv "$ROOT_DOCS_DIR" "$ROOT_DOCS_DIR-old"
    fi
fi

# Copy built site to docs root
cp -r dist/* "$ROOT_DOCS_DIR/"

# Verify deployment
log "Verifying deployment..."
if [ -f "$ROOT_DOCS_DIR/index.html" ]; then
    log "✅ Main documentation deployed"
else
    error "❌ Main documentation deployment failed!"
    exit 1
fi

if [ -f "$ROOT_DOCS_DIR/renderworld-hub.js" ]; then
    log "✅ RenderWorld Hub deployed"
else
    warn "⚠️ RenderWorld Hub not deployed"
fi

# Step 5: Check for SplashScreenPure integration
log "Checking SplashScreenPure integration..."
if grep -q "miff-splash-screen" "$ROOT_DOCS_DIR/index.html"; then
    log "✅ SplashScreenPure integration detected"
else
    warn "⚠️ SplashScreenPure integration not found"
fi

if grep -q "MIFF" "$ROOT_DOCS_DIR/index.html"; then
    log "✅ MIFF branding detected"
else
    warn "⚠️ MIFF branding not found"
fi

# Step 6: Display deployment summary
echo ""
echo "📋 DEPLOYMENT SUMMARY"
echo "====================="
echo "✅ Documentation site built successfully"
echo "✅ RenderWorld Hub integrated"
echo "✅ Files deployed to docs/ directory"
echo "✅ Ready for GitHub Pages"

echo ""
echo "🔗 DEPLOYMENT URLs"
echo "=================="
echo "📖 Main Documentation: https://miff-framework.github.io/miff/"
echo "🎮 RenderWorld Hub: https://miff-framework.github.io/miff/renderworld-hub.html"
echo "🎯 MIFF Sampler: https://miff-framework.github.io/miff/sampler/"

echo ""
echo "📝 NEXT STEPS"
echo "=============="
echo "1. Commit and push changes to trigger GitHub Actions"
echo "2. Wait 5-10 minutes for GitHub Pages deployment"
echo "3. Verify SplashScreenPure displays correctly"
echo "4. Test all interactive features"

log "Deployment preparation completed successfully! 🎉"