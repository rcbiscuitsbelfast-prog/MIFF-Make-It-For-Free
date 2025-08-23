# 📚 MIFF Framework Documentation

This is the documentation site for MIFF Framework, built with [Astro](https://astro.build/). The site provides comprehensive guides, API references, and examples for contributors.

**🌐 Live Site**: [https://miff-framework.github.io/miff](https://miff-framework.github.io/miff)

## 🚀 Quick Start

### **Development**

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

### **Generate CLI Documentation**

```bash
# Generate CLI docs from harness files
npm run generate-cli-docs

# Generate schema documentation
npm run generate-schemas

# Generate architecture diagrams
npm run generate-diagrams
```

### **Validate Links**

```bash
# Check for broken links
npm run validate-links
```

## 🚀 Deployment

### **Automatic Deployment**

The documentation site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The deployment process:

1. **Triggers on push** to `main` branch with changes in `docs/` directory
2. **Installs dependencies** and generates CLI documentation
3. **Builds the site** using Astro
4. **Deploys to GitHub Pages** at `https://miff-framework.github.io/miff`

### **Manual Deployment**

```bash
# Build the site
npm run build

# Deploy (pushes to main branch)
npm run deploy
```

### **GitHub Pages Setup**

The site is configured for GitHub Pages with:
- **Base path**: `/miff`
- **Site URL**: `https://miff-framework.github.io`
- **Custom domain**: Ready for `docs.miff.dev` (if configured)

## 📁 Site Structure

```
docs/
├── src/
│   ├── pages/
│   │   ├── index.md                    # Welcome page
│   │   ├── getting-started/            # Installation and setup guides
│   │   ├── architecture/               # System design and principles
│   │   ├── contributors/               # Contribution guides
│   │   └── api/                        # Auto-generated API docs
│   ├── layouts/
│   │   └── Layout.astro                # Main layout component
│   └── assets/                         # Static assets
├── scripts/                            # Documentation generation scripts
├── public/                             # Public assets (favicon, 404 page)
├── .github/workflows/                  # GitHub Actions deployment
└── astro.config.mjs                    # Astro configuration
```

## 🛠️ Development

### **Adding New Pages**

1. **Create markdown file** in appropriate directory:
   ```bash
   touch src/pages/new-page.md
   ```

2. **Add frontmatter**:
   ```markdown
   ---
   layout: ../../layouts/Layout.astro
   title: "Page Title"
   description: "Page description"
   ---
   ```

3. **Write content** using markdown with Astro components

### **Updating Navigation**

Edit the navigation in `src/layouts/Layout.astro`:

```astro
<nav class="space-y-2">
  <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Section</div>
  <a href={`${basePath}new-page`} class="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">New Page</a>
</nav>
```

### **Adding Components**

Create new Astro components in `src/components/`:

```astro
---
// src/components/MyComponent.astro
export interface Props {
  title: string;
}

const { title } = Astro.props;
---

<div class="my-component">
  <h2>{title}</h2>
  <slot />
</div>
```

## 📝 Content Guidelines

### **Markdown Standards**

- Use **bold** for emphasis
- Use `code` for inline code
- Use ``` for code blocks with language specification
- Use headings for structure (H1 for page title, H2+ for sections)
- Use tables for structured data
- Use lists for step-by-step instructions

### **Code Examples**

```markdown
### Basic Usage

```bash
npx ts-node cli/miff-simulate.ts scenario.json
```

### Advanced Usage

```typescript
import { NPCsManager } from './Manager';

const manager = new NPCsManager();
const npc = manager.createNPC({ name: "Guard" });
```
```

### **Images and Diagrams**

Store images in `src/assets/` and reference them:

```markdown
![Diagram Description](/assets/diagrams/architecture.png)
```

## 🔧 Configuration

### **Astro Configuration**

The site uses Astro with the following integrations:

- **@astrojs/markdown-remark**: Markdown processing
- **@astrojs/mdx**: MDX support
- **@astrojs/sitemap**: Automatic sitemap generation
- **@astrojs/tailwind**: Tailwind CSS styling

### **GitHub Pages Configuration**

- **Base path**: `/miff` (for repository-based deployment)
- **Site URL**: `https://miff-framework.github.io`
- **Custom 404 page**: `public/404.html`
- **Favicon**: `public/favicon.svg`

### **SEO and Meta**

Each page should include appropriate meta tags in the frontmatter:

```markdown
---
layout: ../../layouts/Layout.astro
title: "Page Title"
description: "Page description for SEO"
image: "/assets/images/page-preview.png"
canonical: "https://miff-framework.github.io/miff/page-url"
---
```

## 🚀 Deployment

### **GitHub Actions**

The site is automatically deployed via GitHub Actions:

1. **Trigger**: Push to `main` branch with changes in `docs/`
2. **Build**: Install dependencies, generate docs, build site
3. **Deploy**: Upload to GitHub Pages
4. **URL**: `https://miff-framework.github.io/miff`

### **Manual Deployment**

For manual deployment:

```bash
# Build the site
npm run build

# The site will be available in dist/
# Push to main branch to trigger automatic deployment
```

### **Custom Domain**

To use a custom domain (e.g., `docs.miff.dev`):

1. **Configure DNS**: Point domain to GitHub Pages
2. **Update Astro config**: Change `site` URL in `astro.config.mjs`
3. **Update base path**: Remove `/miff` base path
4. **Update navigation**: Remove base path from all links

## 📊 Analytics

The site includes analytics tracking (if configured):

- **Google Analytics**: Track page views and user behavior
- **GitHub Analytics**: Track repository engagement

## 🔍 Search

The site includes full-text search functionality:

- **Algolia DocSearch**: Index-based search (if configured)
- **Client-side search**: Fallback search implementation

## 🎨 Theming

The site supports light and dark themes:

- **Automatic detection** of system preference
- **Manual toggle** in the header
- **Persistent preference** stored in localStorage

## 📱 Responsive Design

The site is fully responsive:

- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Hamburger menu navigation

## 🔗 External Links

External links are marked with appropriate icons and open in new tabs:

```markdown
[GitHub Repository](https://github.com/miff-framework/miff){:target="_blank"}
```

## 🧪 Testing

### **Link Validation**

```bash
# Check all internal and external links
npm run validate-links
```

### **Build Testing**

```bash
# Test production build
npm run build
npm run preview
```

### **Content Validation**

```bash
# Validate markdown syntax
npm run lint:markdown

# Check for broken references
npm run check-refs
```

## 📚 Resources

- **[Astro Documentation](https://docs.astro.build/)**
- **[Tailwind CSS Documentation](https://tailwindcss.com/docs)**
- **[Markdown Guide](https://www.markdownguide.org/)**
- **[MIFF Framework](https://github.com/miff-framework/miff)**

## 🤝 Contributing

To contribute to the documentation:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test locally**: `npm run dev`
5. **Submit a pull request**

### **Documentation Standards**

- **Clear and concise** writing
- **Code examples** for all features
- **Screenshots** for visual guides
- **Cross-references** to related content
- **Regular updates** with framework changes

### **Deployment Workflow**

1. **Make changes** to documentation
2. **Test locally** with `npm run dev`
3. **Generate docs** with `npm run generate-cli-docs`
4. **Build and test** with `npm run build`
5. **Push to main** to trigger automatic deployment
6. **Verify deployment** at `https://miff-framework.github.io/miff`

---

*Built with ❤️ by the MIFF Framework community*

**🌐 Live Site**: [https://miff-framework.github.io/miff](https://miff-framework.github.io/miff)

## 🔧 Remix Hooks

Each module README documents `Remix Hooks` describing safe extension points (override logic, reward injection, external triggers) to keep forks remix-safe.

## 🧩 Systems Index (Modular, Aesthetic-first)

- ProjectileSystemPure — deterministic projectile updates
- ScoreSystemPure — additive/multiplicative scoring
- HealthSystemPure — clamped damage/heal pipeline
- InputSystemPure — raw → actions mapping
- CameraSystemPure — follow/lerp (bridge)
- RhythmSystemPure — beat generation and judge
- AudioSystemPure — abstract audio commands
- MountSystemPure — mount/dismount
- DialogueSystemPure — branching dialogue
- CutsceneSystemPure — timed tracks
- NavigationSystemPure — grid navigation

### Scenario Packs
- WitcherExplorerDemoPure — navigation + dialogue + quests

### Contributor Notes
- All systems include remix hooks and are engine-agnostic.
- Golden tests validate CLI and module behavior.
- See root README for `quest`, `manifest`, and `builder` tooling.