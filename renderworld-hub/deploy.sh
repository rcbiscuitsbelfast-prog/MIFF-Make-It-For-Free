#!/bin/bash

# RenderWorld Hub Deployment Script
# This script deploys the RenderWorld Hub to GitHub Pages

set -e

echo "🚀 Starting RenderWorld Hub deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo -e "${RED}❌ Error: index.html not found. Please run this script from the renderworld-hub directory.${NC}"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the renderworld-hub directory.${NC}"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Git repository not initialized. Initializing...${NC}"
    git init
    git remote add origin https://github.com/rcbiscuitsbelfast-prog/renderworld-hub.git
fi

# Check if we're on the correct branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
if [ "$CURRENT_BRANCH" != "gh-pages" ]; then
    echo -e "${YELLOW}⚠️  Not on gh-pages branch. Checking out or creating gh-pages...${NC}"

    # Check if gh-pages branch exists
    if git show-ref --verify --quiet refs/remotes/origin/gh-pages; then
        git checkout gh-pages
    else
        git checkout -b gh-pages
    fi
fi

# Add all files
echo -e "${YELLOW}📁 Adding all files to git...${NC}"
git add .

# Commit changes
if git diff --staged --quiet; then
    echo -e "${GREEN}✅ No changes to commit.${NC}"
else
    echo -e "${YELLOW}💾 Committing changes...${NC}"
    git commit -m "🚀 Deploy RenderWorld Hub to GitHub Pages

- Add complete RenderWorld Hub scene with Superhot-inspired aesthetics
- Implement Spirit Lens interactive mechanics
- Add three portal doors to MIFF demo games
- Include AI-powered NPC behaviors and dialogue
- Add WebGL rendering with 60fps performance
- Add comprehensive documentation and deployment setup"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Changes committed successfully.${NC}"
    else
        echo -e "${RED}❌ Failed to commit changes.${NC}"
        exit 1
    fi
fi

# Push to GitHub
echo -e "${YELLOW}⬆️  Pushing to GitHub Pages...${NC}"
if git push origin gh-pages; then
    echo -e "${GREEN}✅ Successfully deployed to GitHub Pages!${NC}"
    echo ""
    echo -e "${GREEN}🌐 RenderWorld Hub is now live at:${NC}"
    echo -e "${GREEN}https://rcbiscuitsbelfast-prog.github.io/renderworld-hub/${NC}"
    echo ""
    echo -e "${YELLOW}💡 Next steps:${NC}"
    echo "1. Visit the URL above to test the deployment"
    echo "2. Check the GitHub repository settings to ensure Pages is enabled"
    echo "3. Update the main MIFF README with the new RenderWorld Hub link"
else
    echo -e "${RED}❌ Failed to push to GitHub Pages.${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Troubleshooting:${NC}"
    echo "1. Make sure you have push access to the repository"
    echo "2. Check if GitHub Pages is enabled in repository settings"
    echo "3. Verify your authentication credentials"
    exit 1
fi