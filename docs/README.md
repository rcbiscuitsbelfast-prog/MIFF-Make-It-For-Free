# MIFF Unified GitHub Pages Site

This directory contains the unified MIFF Framework GitHub Pages site, providing a professional landing page and navigation to all MIFF experiences.

## 🌐 Live Site Structure

The site is deployed as a single GitHub Pages site with the following structure:

- **Main Landing Page**: `https://rcbiscuitsbelfast-prog.github.io/MIFF-Make-It-For-Free/`
- **MIFF Sampler**: `https://rcbiscuitsbelfast-prog.github.io/MIFF-Make-It-For-Free/sampler/`
- **MIFF Studio**: `https://rcbiscuitsbelfast-prog.github.io/MIFF-Make-It-For-Free/studio/`
- **RenderWorld Hub**: `https://rcbiscuitsbelfast-prog.github.io/MIFF-Make-It-For-Free/renderworld/`
- **Documentation**: `https://rcbiscuitsbelfast-prog.github.io/MIFF-Make-It-For-Free/docs-site/`

## 📁 Directory Structure

```
docs/
├── index.html              # Main landing page: "Welcome to MIFF"
├── assets/
│   ├── style.css          # Shared styles with dark/light theme support
│   └── script.js          # JavaScript for interactivity and navigation
├── sampler/
│   └── index.html         # MIFF Sampler - Interactive game demos
├── studio/
│   └── index.html         # MIFF Studio - Advanced scene builder
├── renderworld/
│   └── index.html         # RenderWorld Hub - AI-native preview engine
└── docs-site/
    └── index.html         # Documentation - Comprehensive guides & API
```

## 🎯 Features

### Main Landing Page (`index.html`)
- **Professional Design**: Clean, modern layout with MIFF branding
- **Theme Support**: Dark/light theme toggle with user preference persistence
- **Responsive Design**: Optimized for desktop and mobile devices
- **Interactive Cards**: Smooth hover effects and navigation
- **Performance Metrics**: Display of framework statistics
- **Smooth Animations**: Entrance animations and micro-interactions

### Navigation Structure
- **Unified Entry Point**: Single professional landing page
- **Clear Hierarchy**: Four distinct experience areas
- **Consistent Branding**: Shared assets and styling across all pages
- **Easy Navigation**: Back buttons and cross-linking between sections

### Technical Features
- **Single Deployment**: All experiences in one GitHub Pages site
- **Shared Assets**: Common CSS and JavaScript for consistency
- **Theme System**: Dark/light mode support throughout
- **Performance Optimized**: Minimal dependencies, fast loading
- **Accessibility**: WCAG compliant design patterns

## 🚀 Deployment

The site is automatically deployed via GitHub Pages from the `main` branch, serving from the `/docs` folder:

1. **Repository Settings**: GitHub Pages configured to serve from `/docs`
2. **Branch**: Deployed from `main` branch
3. **Source**: GitHub Pages automatically serves from `/docs` folder
4. **Custom Domain**: Optional custom domain support

## 🎨 Styling

### Theme System
- **CSS Variables**: Comprehensive theme system with CSS custom properties
- **Dark Mode**: Professional dark theme with high contrast
- **Light Mode**: Clean light theme for accessibility
- **User Preference**: Respects system theme preferences
- **Persistence**: Theme choice saved in localStorage

### Responsive Design
- **Mobile First**: Optimized for all screen sizes
- **Flexible Grid**: CSS Grid and Flexbox layouts
- **Typography**: Scalable font sizes with clamp() functions
- **Touch Friendly**: Appropriate touch targets for mobile devices

## 📱 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Feature Support**: CSS Grid, CSS Custom Properties, ES6+ JavaScript
- **Fallbacks**: Graceful degradation for older browsers

## 🔧 Customization

### Adding New Sections
1. Create a new subdirectory in `/docs`
2. Add an `index.html` file with the required structure
3. Update the main landing page navigation
4. Add any section-specific assets to `/docs/assets/`

### Modifying Styling
- **Global Styles**: Edit `/docs/assets/style.css`
- **Theme Colors**: Modify CSS custom properties in `:root` and `[data-theme="dark"]`
- **Component Styles**: Add new styles to the shared CSS file
- **Page-Specific**: Override styles in individual page `<head>` sections

### JavaScript Functionality
- **Navigation**: Update `navigateTo()` function in `/docs/assets/script.js`
- **Interactivity**: Add new features to the shared JavaScript
- **Theme Toggle**: Extend theme functionality as needed

## 📊 Analytics & Monitoring

- **GitHub Pages**: Built-in analytics via GitHub repository insights
- **Performance**: Monitor page load times and Core Web Vitals
- **User Engagement**: Track navigation patterns and popular sections
- **Error Monitoring**: GitHub Pages provides error reporting

## 🔍 SEO & Meta Tags

- **Meta Descriptions**: Each page has optimized meta descriptions
- **Structured Data**: Schema.org markup for better search visibility
- **Open Graph**: Social media sharing optimization
- **Canonical URLs**: Proper canonical URL implementation

## 🛡️ Security

- **Content Security Policy**: Implemented via GitHub Pages settings
- **HTTPS**: All pages served over secure HTTPS
- **No External Dependencies**: Minimal attack surface with shared assets
- **Input Sanitization**: All user inputs properly sanitized

## 📝 Content Management

- **Static Content**: All content is static HTML/CSS/JS
- **Version Control**: Full Git history and version management
- **Branch Protection**: Main branch protected with required reviews
- **Automated Deployment**: Changes automatically deploy to GitHub Pages

## 🚀 Performance

- **Fast Loading**: Optimized CSS and minimal JavaScript
- **CDN Assets**: Google Fonts and optimized resource loading
- **Image Optimization**: SVG icons and optimized graphics
- **Lazy Loading**: Intersection Observer for performance
- **Caching**: Browser caching with appropriate cache headers

---

**Built with MIFF Framework** • **Modular Architecture** • **AI Integration** • **Cross-Platform**