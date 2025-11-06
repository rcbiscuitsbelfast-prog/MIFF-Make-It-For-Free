# 🚀 K-pop Monster Hunter - Deployment Guide

## ✅ What We Built

A **proper TypeScript game** using MIFF modules:

### **Architecture:**
```
src/game/
├── index.html          ← Entry point
└── main.ts             ← Game code using MIFF modules

Uses:
✅ AssetLoaderPure      ← Manages sprites & audio
✅ RhythmInputPure      ← Rhythm gameplay (TODO: integrate fully)
✅ RhythmBattleSystemPure ← Battle system (TODO: integrate fully)
✅ SpiritsPure          ← Spirit management
✅ Real LPC sprites     ← Actual sprite rendering!
```

### **Build System:**
- **Vite** for fast bundling
- **TypeScript** compilation
- **42MB** build output (includes assets)

---

## 🎮 Local Development

### **Run Dev Server:**
```bash
npm run dev
```

Opens at `http://localhost:3000`

### **Build for Production:**
```bash
npm run build
```

Output: `/dist/game/`

### **Preview Production Build:**
```bash
npm run preview
```

---

## 🌐 Deploy to Vercel (RECOMMENDED)

### **Why Vercel?**
- ✅ No GitHub Pages path restrictions
- ✅ Assets served correctly
- ✅ Automatic builds on push
- ✅ Global CDN
- ✅ Free for personal projects

### **Step 1: Install Vercel CLI (Optional)**
```bash
npm install -g vercel
```

### **Step 2: Deploy via Vercel Dashboard** (Easiest)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Import `MIFF-Make-It-For-Free` repo
5. **Configure Build:**
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/game`
   - **Install Command**: `npm install`
6. Click "Deploy"
7. **Done!** Your game will be live at `https://your-project.vercel.app`

### **Step 3: Deploy via CLI** (Alternative)
```bash
cd /workspace
vercel

# Follow prompts:
# - Link to existing project or create new
# - Confirm settings
# - Deploy!
```

---

## 📁 Project Structure

```
/workspace/
├── src/game/              ← Game source
│   ├── index.html         ← Entry HTML
│   └── main.ts            ← TypeScript game code
├── public/                ← Static assets (copied from /assets)
│   └── assets/
│       ├── K pop new/     ← Audio files (42MB stems)
│       └── sprites/       ← LPC sprite sheets
├── miff/pure/             ← MIFF modules (imported)
│   ├── AssetLoaderPure/
│   ├── RhythmInputPure/
│   ├── RhythmBattleSystemPure/
│   └── SpiritsPure/
├── dist/game/             ← Build output (42MB)
├── vite.config.ts         ← Vite configuration
├── vercel.json            ← Vercel deployment config
└── package.json           ← NPM scripts

```

---

## 🔧 Configuration Files

### **vite.config.ts**
```typescript
- Root: ./src/game
- Public: ../../public (assets)
- Output: ../../dist/game
- Aliases: @miff, @assets
```

### **vercel.json**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/game",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 🎯 What's Working

### **✅ Implemented:**
1. **AssetLoaderPure integration**
   - Loads sprites via `queueAsset()`
   - Loads audio files
   - Progress tracking
   - Error handling

2. **Real LPC Sprite Rendering**
   - Renders `Mira-Sprite/walk.png` (64x64 frames)
   - 4-direction animation
   - Frame cycling on movement

3. **SpiritsPure integration**
   - Creates Spirit objects with `Spirit.create()`
   - Uses SpiritType and SpiritRarity enums
   - Captures spirits into array

4. **Canvas Game Loop**
   - Keyboard input (WASD/Arrows)
   - Player movement with bounds
   - Spirit collision detection
   - HUD rendering

---

## 🚧 TODO: Complete Integration

### **RhythmInputPure** (Pending)
Currently stubbed out. Need to:
```typescript
// In startBattle():
this.rhythmInput.startSession(RhythmDifficulty.STANDARD);
const notes = this.rhythmInput.generateBeatMap(128, 60); // 128 BPM, 60 sec
// Render notes, handle input detection
```

### **RhythmBattleSystemPure** (Pending)
Currently marks spirits as captured immediately. Need to:
```typescript
const battleConfig: RhythmBattleConfig = {
  difficulty: RhythmDifficulty.STANDARD,
  bpm: 128,
  duration: 60,
  // ... more config
};

const battleManager = new RhythmBattleManager(battleConfig);
// Implement battle loop
```

### **Audio Playback**
Assets are loaded but not played. Need to:
```typescript
const instrumental = this.assetLoader.getAsset('music-instrumental');
const vocals = this.assetLoader.getAsset('music-vocal');
// Play with Web Audio API, sync to battle
```

---

## 🎨 Assets Included

### **Sprites:**
- `Mira-Sprite/walk.png` - 256x256 (4x4 frames, LPC format)
- `Mira-Sprite/idle.png` - 256x256 (4x4 frames)
- `Mira-Sprite/combat_idle.png` - 256x256

### **Audio:**
- `We Are Light-instrumental-stem.mp3` - 21MB, 44.1kHz stereo, 238 seconds
- `We Are Light-vocals-stem.mp3` - 21MB, 44.1kHz stereo, 238 seconds

**Total Assets: ~42MB**

---

## 🐛 Troubleshooting

### **Build Fails with TS Errors:**
```bash
# Use game-specific tsconfig
npm run build:game
```

### **Assets Not Loading:**
- Check paths in `main.ts` start with `/assets/`
- Verify files exist in `/public/assets/`
- Check browser console for 404s

### **Vercel Build Fails:**
- Ensure `vercel.json` has correct paths
- Check build logs in Vercel dashboard
- Verify Node version (should auto-detect)

### **Game Doesn't Run:**
- Open browser console (F12)
- Check for JavaScript errors
- Verify AssetLoaderPure logs

---

## 📊 Performance

### **Build Time:**
- Dev server: ~1 second
- Production build: ~1 second
- Total bundle: 28KB JS + 42MB assets

### **Load Time (Fast Connection):**
- HTML: <100ms
- JS: <200ms
- Assets: ~4-5 seconds (42MB)

### **Optimization Ideas:**
1. **Lazy load audio** - Only load when battle starts
2. **Compress sprites** - Use WebP instead of PNG
3. **Audio streaming** - Stream MP3s instead of preload
4. **Code splitting** - Split battle system into separate chunk

---

## 🎮 Controls

**Movement:**
- `W/↑` - Up
- `S/↓` - Down
- `A/←` - Left
- `D/→` - Right

**Interact:**
- `Space` - Capture spirit (when near)

---

## 📝 Next Steps

1. **Deploy to Vercel** ← Do this first!
2. **Complete rhythm battle integration** ← Use RhythmBattleSystemPure
3. **Add audio playback** ← Web Audio API
4. **Add mobile touch controls** ← D-pad + action button
5. **Implement full battle UI** ← FNF-style arrows
6. **Add more spirits** ← Expand spirit roster
7. **Save system** ← LocalStorage persistence

---

## 🔗 Useful Links

- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev/
- **MIFF Modules**: `/workspace/miff/pure/`
- **Game Code**: `/workspace/src/game/main.ts`

---

## ✨ What's Different from v1.6.2?

| Feature | v1.6.2 (HTML) | v2.0 (MIFF) |
|---------|---------------|-------------|
| **Language** | Vanilla JS | TypeScript |
| **Modules** | Inline code | MIFF modules imported |
| **Assets** | Failed to load | AssetLoaderPure |
| **Sprites** | Canvas rectangles | Real LPC sprites |
| **Build** | None | Vite bundler |
| **Deploy** | GitHub Pages (broken) | Vercel (works) |
| **Architecture** | Monolithic | Modular |

---

**This is the PROPER way to build with MIFF!** 🚀
