# MIFF Sampler Zone Router

A comprehensive, remix-safe iframe-based zone loader for the MIFF Sampler site.

## Features

### 🎯 Core Functionality
- **Hash-based routing** for zones and tools
- **Automatic fallback handling** for missing zones
- **Remix mode support** with debug overlays
- **Contributor dashboard** integration
- **Animated transitions** and loading states

### 🔧 Developer Tools
- **Debug overlay** showing current route and load status
- **Global hook** (`window.MIFFRouter`) for remix extensions
- **Zone status monitoring** and error reporting
- **Remix-safe architecture** with no external dependencies

### 📱 User Experience
- **Homepage-only splash** (router splash removed elsewhere)
- **Loading indicators** with zone descriptions
- **Error fallbacks** with helpful messaging
- **Responsive design** for all screen sizes

## Architecture

### Zone Configuration
Zones are defined in the `ZONES` object with the following structure:

```javascript
const ZONES = {
    zoneName: {
        title: 'Display Name',
        description: 'Zone description',
        src: 'path/to/zone/index.html',
        type: 'game|tool',
        remixSafe: true
    }
};
```

### Routing System
- **Hash-based**: `#toppler`, `#dashboard`, `#remix_lab`
- **Automatic fallback**: Loads default content for non-homepage paths (no global splash)
- **Deep linking**: Direct access to any zone
- **State persistence**: Remembers current zone

### Iframe Management
- **Lazy loading**: Zones load only when accessed
- **Error handling**: Timeout and fallback mechanisms
- **Cross-origin safety**: Secure iframe communication
- **Performance optimization**: Automatic cleanup

## Usage

### Basic Navigation
```javascript
// Navigate to a zone
window.MIFFRouter.navigateTo('toppler');

// Get current zone info
const currentZone = window.MIFFRouter.getCurrentZone();

// Toggle remix mode
window.MIFFRouter.setRemixMode(true);
```

### Zone Development
1. **Create zone directory** in `site/zones/[zoneName]/`
2. **Add index.html** with proper zone content
3. **Register zone** in the `ZONES` configuration
4. **Test navigation** via hash routing

### Remix Extensions
```javascript
// Listen for zone events
window.addEventListener('message', (event) => {
    if (event.data.type === 'MIFF_ZONE_READY') {
        console.log('Zone ready:', event.data.zone);
    }
});

// Access router API
const router = window.MIFFRouter;
router.setRemixMode(true);
```

## Zone Types

### Game Zones
- **toppler**: Physics puzzle with modular ramps
- **spirit_tamer**: Dialogue + interaction sampler
- **witcher_grove**: Narrative clearing with NPC
- **remix_lab**: Debug zone and CLI triggers

### Tool Zones
- **dashboard**: Zone management and contributor tools
- **onboarding**: Getting started guide

## File Structure

```
site/
├── zone-router.js          # Main router implementation
├── dashboard/              # Contributor dashboard
│   └── index.html
├── zones/                  # Zone implementations
│   ├── toppler/
│   ├── spirit_tamer/
│   ├── witcher_grove/
│   └── remix_lab/
├── styles.css              # Router-specific styles
└── index.html              # Main site with router
```

## Styling

### CSS Classes
- `.splash-screen`: Default landing page
- `.zone-loading`: Loading state indicators
- `.zone-iframe`: Zone iframe containers
- `.error-fallback`: Error state display
- `.debug-overlay`: Developer debug panel

### Responsive Design
- **Mobile-first**: Optimized for small screens
- **Grid layouts**: Adaptive zone grids
- **Touch-friendly**: Mobile navigation support
- **Accessibility**: ARIA labels and live regions

## Browser Support

- **Modern browsers**: Chrome 80+, Firefox 75+, Safari 13+
- **ES6 features**: Classes, arrow functions, template literals
- **CSS Grid**: Modern layout system
- **Iframe APIs**: PostMessage, onload, onerror

## Contributing

### Adding New Zones
1. Create zone directory structure
2. Implement zone functionality
3. Add zone configuration to router
4. Test navigation and remix mode
5. Update documentation

### Extending Router
1. Fork the repository
2. Add new router features
3. Maintain backward compatibility
4. Test with existing zones
5. Submit pull request

## Troubleshooting

### Common Issues
- **Zone not loading**: Check file paths and zone registration
- **Iframe errors**: Verify cross-origin settings
- **Remix mode not working**: Check toggle event binding
- **Navigation issues**: Verify hash routing setup

### Debug Tools
- **Console logging**: Router events and errors
- **Debug overlay**: Real-time status information
- **Network tab**: Iframe loading and errors
- **Hash changes**: URL routing verification

## License

This zone router is part of the MIFF framework and is licensed under AGPLv3 + Commercial.

## Support

- **Documentation**: See main README.md
- **Issues**: GitHub issue tracker
- **Discussions**: GitHub discussions
- **Contributing**: CONTRIBUTING.md guide

---

Built with ❤️ by the MIFF community