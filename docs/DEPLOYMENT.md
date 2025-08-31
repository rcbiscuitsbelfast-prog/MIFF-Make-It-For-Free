# 🚀 MIFF Documentation Deployment Guide

This guide explains how to deploy the MIFF documentation site to GitHub Pages automatically.

## 📋 Prerequisites

- **GitHub repository**: `miff-framework/miff`
- **GitHub Pages enabled**: Set to "GitHub Actions" source
- **Node.js 18+**: For building the site
- **Git access**: Push permissions to main branch

## 🔧 Setup Instructions

### **1. Enable GitHub Pages**

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Pages**
3. Set **Source** to "GitHub Actions"
4. Click **Save**

### **2. Verify Configuration**

Run the setup script to verify everything is configured correctly:

```bash
cd docs
npm run setup
```

This script will:
- ✅ Check all required files are present
- ✅ Verify package.json configuration
- ✅ Validate Astro configuration
- ✅ Test the build process
- ✅ Provide deployment instructions

### **3. Test Locally**

Before deploying, test the site locally:

```bash
cd docs
npm install
npm run dev
```

Open `http://localhost:4321/miff` in your browser.

## 🚀 Deployment Process

### **Automatic Deployment**

The site is automatically deployed when you push changes to the `main` branch:

1. **Push changes** to `main` branch
2. **GitHub Actions** triggers automatically
3. **Build process** runs:
   - Install dependencies
   - Generate CLI documentation
   - Build the site
4. **Deploy** to GitHub Pages
5. **Site available** at `https://miff-framework.github.io/miff`

### **Manual Deployment**

For manual deployment:

```bash
cd docs
npm run build
git add .
git commit -m "docs: update documentation"
git push origin main
```

## 📁 File Structure

```
docs/
├── .github/workflows/deploy.yml    # GitHub Actions workflow
├── astro.config.mjs               # Astro configuration
├── package.json                   # Dependencies and scripts
├── src/                           # Source files
│   ├── layouts/Layout.astro       # Main layout
│   └── pages/                     # Documentation pages
├── public/                        # Static assets
│   ├── favicon.svg               # Site favicon
│   └── 404.html                  # Custom 404 page
└── miff/scripts/                       # Build scripts
    ├── generate-cli-docs.js      # CLI documentation generator
    └── setup-deployment.js       # Setup verification script
```

## ⚙️ Configuration

### **Astro Configuration**

The `astro.config.mjs` file is configured for GitHub Pages:

```javascript
export default defineConfig({
  site: 'https://miff-framework.github.io',
  base: '/miff',  // Repository name
  // ... other configuration
});
```

### **Package.json**

Key configuration in `package.json`:

```json
{
  "homepage": "https://miff-framework.github.io/miff",
  "repository": {
    "url": "https://github.com/miff-framework/miff"
  },
  "scripts": {
    "deploy": "npm run build && echo 'Build complete. Push to main branch to deploy.'",
    "setup": "node miff/scripts/setup-deployment.js"
  }
}
```

### **GitHub Actions Workflow**

The `.github/workflows/deploy.yml` file handles:

- **Trigger**: Push to main branch with docs changes
- **Build**: Install dependencies and build site
- **Deploy**: Upload to GitHub Pages
- **Permissions**: Required for GitHub Pages deployment

## 🔍 Troubleshooting

### **Build Failures**

If the build fails:

1. **Check logs**: View GitHub Actions logs
2. **Test locally**: Run `npm run build` locally
3. **Check dependencies**: Ensure all dependencies are installed
4. **Verify configuration**: Run `npm run setup`

### **Deployment Issues**

If deployment fails:

1. **Check GitHub Pages settings**: Ensure "GitHub Actions" is selected
2. **Verify permissions**: Check workflow has required permissions
3. **Check branch**: Ensure changes are on `main` branch
4. **Review logs**: Check GitHub Actions for specific errors

### **Site Not Updating**

If the site doesn't update:

1. **Check deployment status**: View GitHub Actions
2. **Clear cache**: Hard refresh browser (Ctrl+F5)
3. **Check URL**: Ensure you're visiting the correct URL
4. **Wait for deployment**: GitHub Pages can take a few minutes

## 🌐 Custom Domain

To use a custom domain (e.g., `docs.miff.dev`):

### **1. Configure DNS**

Point your domain to GitHub Pages:
- **A record**: `185.199.108.153`
- **A record**: `185.199.109.153`
- **A record**: `185.199.110.153`
- **A record**: `185.199.111.153`
- **CNAME record**: `miff-framework.github.io`

### **2. Update Configuration**

Update `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://docs.miff.dev',
  base: '/',  // Remove /miff base path
  // ... other configuration
});
```

### **3. Update Navigation**

Remove base path from all navigation links in `Layout.astro`.

### **4. Add Custom Domain**

1. Go to repository **Settings** > **Pages**
2. Add custom domain: `docs.miff.dev`
3. Check "Enforce HTTPS"
4. Save settings

## 📊 Monitoring

### **Deployment Status**

Monitor deployment status:

1. **GitHub Actions**: View workflow runs
2. **GitHub Pages**: Check deployment status
3. **Site health**: Monitor site availability

### **Analytics**

Add analytics to track usage:

1. **Google Analytics**: Add tracking code to layout
2. **GitHub Analytics**: Built-in repository analytics
3. **Custom tracking**: Add custom analytics scripts

## 🔄 Maintenance

### **Regular Updates**

Keep the documentation site updated:

1. **Update dependencies**: Run `npm update` regularly
2. **Regenerate docs**: Run `npm run generate-cli-docs`
3. **Test builds**: Verify site builds correctly
4. **Monitor performance**: Check site speed and reliability

### **Backup**

The site is automatically backed up:

1. **Source code**: Stored in Git repository
2. **Build artifacts**: Generated from source
3. **Configuration**: Version controlled
4. **Content**: Markdown files in repository

## 📚 Resources

- **[GitHub Pages Documentation](https://docs.github.com/en/pages)**
- **[Astro Documentation](https://docs.astro.build/)**
- **[GitHub Actions Documentation](https://docs.github.com/en/actions)**
- **[MIFF Framework Repository](https://github.com/miff-framework/miff)**

## 🆘 Support

If you encounter issues:

1. **Check this guide**: Review troubleshooting section
2. **Run setup script**: `npm run setup`
3. **Check GitHub Actions**: View workflow logs
4. **Create issue**: Report problems in the repository
5. **Ask community**: Reach out to MIFF contributors

---

**🌐 Live Site**: [https://miff-framework.github.io/miff](https://miff-framework.github.io/miff)

*Last updated: January 2024*