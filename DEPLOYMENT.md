# MIFF Sampler Deployment Guide

## 🚀 Quick Deploy to Vercel

The MIFF Sampler is configured for easy deployment to Vercel with zero configuration.

### Prerequisites
- Node.js 18+ installed
- Vercel CLI installed (`npm i -g vercel`)
- GitHub repository connected to Vercel

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploy to Vercel
```bash
# Deploy to Vercel (first time)
vercel

# Deploy to production
npm run deploy
```

## 🏗️ Build Configuration

### Vite Configuration
- **Entry Point**: `sampler/index.html`
- **Output**: `dist/` directory
- **Chunking**: Modular chunks for MIFF systems
- **Aliases**: Path mapping for clean imports

### Bundle Structure
```
dist/
├── index.html          # Main entry point
├── assets/
│   ├── main-[hash].js  # Main application bundle
│   ├── miff-core-[hash].js    # Core MIFF systems
│   ├── overlink-[hash].js     # OverlinkPure zone
│   ├── themes-[hash].js       # Theme system
│   ├── audio-[hash].js        # Audio manager
│   └── badges-[hash].js       # Badge system
└── assets/             # Static assets
    └── themes/         # Theme assets
```

## 🌐 Deployment URLs

### Production
- **Main Demo**: `https://miff-demo.vercel.app`
- **Documentation**: `https://miff-framework.github.io/miff`

### Development
- **Local Dev**: `http://localhost:3000`
- **Preview Build**: `http://localhost:4173`

## 🔧 Customization

### Environment Variables
```bash
# .env.local
VITE_APP_TITLE="MIFF Sampler"
VITE_APP_VERSION="1.0.0"
VITE_REMIX_MODE_ENABLED="true"
```

### Build Optimization
- **Code Splitting**: Automatic chunk generation
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Automatic compression
- **Caching**: Long-term asset caching

## 📱 Mobile Support

### Responsive Design
- **Touch Controls**: Mobile-optimized overlay
- **Viewport**: Responsive canvas sizing
- **Performance**: 60fps target on mobile devices

### Progressive Web App
- **Offline Support**: Service worker ready
- **Installable**: Add to home screen
- **Fast Loading**: Optimized asset delivery

## 🧪 Testing

### Pre-deployment Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm test -- OverlinkPure/
npm test -- badges/

# Test coverage
npm run test:coverage
```

### Browser Testing
- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions

## 🚨 Troubleshooting

### Common Issues
1. **Build Failures**: Check TypeScript compilation
2. **Asset Loading**: Verify asset paths in Vite config
3. **Module Resolution**: Check import/export statements
4. **Performance**: Monitor bundle sizes and chunking

### Debug Mode
```bash
# Enable debug logging
DEBUG=miff:* npm run dev

# Verbose build output
npm run build -- --debug
```

## 📊 Performance Metrics

### Target Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: < 2MB total

### Monitoring
- **Vercel Analytics**: Built-in performance tracking
- **Core Web Vitals**: Real user metrics
- **Error Tracking**: Automatic error reporting

## 🔄 Continuous Deployment

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy MIFF Sampler
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📚 Additional Resources

- **Vite Documentation**: https://vitejs.dev/
- **Vercel Documentation**: https://vercel.com/docs
- **MIFF Framework**: https://github.com/miff-framework/miff
- **Contributor Guide**: https://miff-framework.github.io/miff/contributors

---

**Ready to deploy?** Run `npm run deploy` to launch the MIFF Sampler! 🎮