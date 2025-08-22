# 📚 MIFF Framework Documentation

This is the documentation site for MIFF Framework, built with [Astro](https://astro.build/). The site provides comprehensive guides, API references, and examples for contributors.

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
├── public/                             # Public assets
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
  <a href="/new-page" class="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">New Page</a>
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

### **Tailwind CSS**

Custom styles can be added in `src/styles/` and imported in the layout.

### **SEO and Meta**

Each page should include appropriate meta tags in the frontmatter:

```markdown
---
layout: ../../layouts/Layout.astro
title: "Page Title"
description: "Page description for SEO"
image: "/assets/images/page-preview.png"
canonical: "https://docs.miff.dev/page-url"
---
```

## 🚀 Deployment

### **GitHub Pages**

The site is configured for GitHub Pages deployment:

1. **Build the site**:
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   ```

### **Vercel**

For Vercel deployment:

1. **Connect repository** to Vercel
2. **Set build command**: `npm run build`
3. **Set output directory**: `dist`
4. **Deploy automatically** on push to main branch

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

---

*Built with ❤️ by the MIFF Framework community*