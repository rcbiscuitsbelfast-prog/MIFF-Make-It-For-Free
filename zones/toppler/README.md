# 🧱 MIFF Toppler Demo

A physics-lite vertical challenge game where players climb platforms to reach the top. Built with remix-safe architecture and modular components.

## 🎯 Game Overview

**Genre**: Physics-lite vertical challenge  
**Goal**: Reach the top platform without falling  
**Style**: Aesthetic-agnostic (forest, ruins, neon, classic)  
**Engine**: Web-first, mobile-friendly  
**Modules**: Decoupled, remixable, contributor-ready  

## 🏗️ Architecture

### Core Components

1. **`TopplerScene.ts`** - Main scene controller
   - Loads player, platforms, win trigger, fail zone
   - Accepts layout config and remix mode toggle
   - Manages game loop and component lifecycle

2. **`PlayerController.ts`** - Player physics and input
   - Handles jump physics, collision, cling logic
   - Modular input mapping (touch, keyboard, gamepad)
   - Configurable physics parameters

3. **`PlatformSpawner.ts`** - Platform generation
   - Generates static or procedural platforms
   - Supports remixable layout injection
   - Theme-aware platform styling

4. **`WinTrigger.ts`** - Win condition detection
   - Detects top platform contact
   - Fires win event and optional narrative hook
   - Multiple win condition types

5. **`FailZone.ts`** - Fail condition handling
   - Detects fall below threshold
   - Resets scene with optional feedback
   - Configurable fail conditions

6. **`TopplerUI.tsx`** - User interface
   - Retry button, progress meter
   - Remixable styling and layout
   - Theme switching and settings

7. **`TopplerTest.ts`** - Test suite
   - Scenario-driven tests for win/fail/reset
   - Golden fixtures for layout and physics
   - Performance benchmarks

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- TypeScript knowledge
- Basic understanding of game development concepts

### Installation

```bash
# Clone the repository
git clone https://github.com/miff-framework/miff.git
cd miff/zones/toppler

# Install dependencies (if any)
npm install

# Run tests
npm test
```

### Basic Usage

```typescript
import { TopplerScene } from './TopplerScene';

// Create game scene
const scene = new TopplerScene({
    theme: 'forest',
    platformCount: 8,
    remixMode: true
});

// Start the game
scene.setRemixMode(true);
```

## 🎨 Themes & Aesthetics

### Available Themes

- **Classic** - Clean, minimalist design
- **Forest** - Nature-inspired with earthy tones
- **Ruins** - Ancient architecture with stone textures
- **Neon** - Cyberpunk with glowing effects

### Custom Themes

Create your own theme by extending the theme system:

```typescript
const customTheme = {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent: '#45B7D1',
    background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
    text: '#ffffff',
    border: '#FF6B6B'
};
```

## 🔧 Remix Mode

### Features

- **Debug Overlays** - Visual debugging information
- **Physics Visualization** - See forces and collisions
- **Performance Metrics** - Frame rate and timing data
- **Developer Tools** - Enhanced console logging

### Enabling Remix Mode

```typescript
// Enable remix mode
scene.setRemixMode(true);

// Or toggle via UI
ui.onRemixModeToggle();
```

## 📱 Mobile Support

### Touch Controls

- **Tap to Jump** - Simple tap anywhere to jump
- **Swipe Up** - Swipe up gesture for jumping
- **Responsive Design** - Adapts to all screen sizes

### Mobile Optimization

- Touch-friendly button sizes
- Responsive UI layouts
- Optimized performance for mobile devices

## 🧪 Testing

### Running Tests

```typescript
import { TopplerTest } from './TopplerTest';

const testSuite = new TopplerTest();
const results = await testSuite.runAllTests();
console.log(`Pass rate: ${testSuite.getPassRate()}%`);
```

### Adding Custom Tests

```typescript
import { createTestScenario } from './TopplerTest';

const customTest = createTestScenario(
    'Custom Win Test',
    'Test custom win condition',
    () => ({ /* setup */ }),
    (gameState) => { /* execute */ },
    { /* expected result */ }
);

testSuite.addScenario(customTest);
```

## 🎮 Gameplay Mechanics

### Physics

- **Gravity** - Configurable downward force
- **Jump Force** - Upward velocity on jump
- **Collision Detection** - Precise platform collision
- **Cling Logic** - Edge detection for platforms

### Controls

- **Keyboard** - WASD + Space/Arrow keys
- **Touch** - Tap and swipe gestures
- **Gamepad** - Controller support (if available)

### Win Conditions

- **Height-based** - Reach target height
- **Platform-based** - Land on specific platform
- **Time-based** - Complete within time limit
- **Custom** - Extensible win logic

## 🔌 Extending the Game

### Adding New Components

```typescript
// Create custom component
class CustomComponent {
    update(deltaTime: number) {
        // Update logic
    }
    
    render(ctx: CanvasRenderingContext2D) {
        // Render logic
    }
}

// Register with scene
scene.registerComponent('custom', new CustomComponent());
```

### Custom Win Conditions

```typescript
import { WinCondition } from './WinTrigger';

const customWin: WinCondition = {
    id: 'custom_win',
    type: 'custom',
    value: 'special_achievement',
    description: 'Complete special challenge',
    narrative: 'You achieved something special!'
};

winTrigger.addWinCondition(customWin);
```

### Custom Platform Types

```typescript
import { Platform, PlatformData } from './PlatformSpawner';

const movingPlatform: PlatformData = {
    x: 100,
    y: 200,
    width: 100,
    height: 20,
    type: 'moving'
};

platformSpawner.addCustomLayout('moving', {
    name: 'Moving Platforms',
    description: 'Platforms that move horizontally',
    platforms: [movingPlatform],
    difficulty: 'hard'
});
```

## 📊 Performance

### Optimization Tips

- Use `requestAnimationFrame` for smooth animation
- Minimize DOM manipulation during game loop
- Batch render calls when possible
- Use object pooling for frequently created objects

### Benchmarking

```typescript
// Performance monitoring
const startTime = performance.now();
// ... game logic ...
const endTime = performance.now();
console.log(`Frame time: ${endTime - startTime}ms`);
```

## 🎨 Asset Guidelines

### Free Assets

- **Placeholder Graphics** - Use simple geometric shapes
- **Open Source Fonts** - Google Fonts, Open Sans, etc.
- **Creative Commons Audio** - Freesound.org, CCMixter

### Asset Requirements

- **Format** - PNG, SVG, WebP for images
- **Size** - Optimize for web delivery
- **Licensing** - Must be remix-safe (CC0, GPL, etc.)
- **Accessibility** - Provide alt text and descriptions

### Asset Integration

```typescript
// Load custom assets
const customAssets = {
    player: '/assets/player.png',
    platforms: '/assets/platforms.png',
    background: '/assets/background.png'
};

scene.loadAssets(customAssets);
```

## 🚀 Deployment

### Build Process

```bash
# Build for production
npm run build

# Build for development
npm run build:dev

# Build for testing
npm run build:test
```

### Deployment Options

- **Static Hosting** - GitHub Pages, Netlify, Vercel
- **CDN** - Cloudflare, AWS CloudFront
- **Game Platforms** - itch.io, GameJolt

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch
3. **Implement** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Code Standards

- **TypeScript** - Use strict typing
- **ESLint** - Follow linting rules
- **Prettier** - Consistent code formatting
- **Jest** - Unit test coverage

### Documentation

- **Inline Comments** - Explain complex logic
- **API Documentation** - JSDoc comments
- **Examples** - Provide usage examples
- **Changelog** - Document changes

## 📚 Resources

### Learning Materials

- [MIFF Framework Documentation](https://github.com/miff-framework/miff)
- [Game Development Patterns](https://gameprogrammingpatterns.com/)
- [Canvas API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Community

- [MIFF Discord](https://discord.gg/miff)
- [GitHub Discussions](https://github.com/miff-framework/miff/discussions)
- [Contributor Guide](https://github.com/miff-framework/miff/blob/main/CONTRIBUTING.md)

## 📄 License

This project is licensed under **AGPLv3 + Commercial** - see the [LICENSE](https://github.com/miff-framework/miff/blob/main/LICENSE.md) file for details.

## 🙏 Acknowledgments

- **MIFF Community** - Framework development and support
- **Open Source Contributors** - Libraries and tools
- **Game Development Community** - Inspiration and feedback

---

**Built with ❤️ by the MIFF community**

*Ready to remix? Fork this project and create your own vertical challenge game!*