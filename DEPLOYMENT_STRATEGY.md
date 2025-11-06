# 🚀 Deployment Strategy - Separate Projects

## 🎯 THE SETUP

You have **TWO separate things**:

### **1. Docs Site** (Already on Vercel)
- `/docs` folder
- Documentation, guides, info
- Already deployed to Vercel
- Keep this as-is!

### **2. K-pop Game** (NEW - Needs separate deployment)
- `/src/game` folder
- The TypeScript game we just built
- Should be a **SEPARATE Vercel project**
- Won't interfere with docs!

---

## ✅ RECOMMENDED APPROACH

### **Option A: Separate Vercel Project** (BEST)

Deploy the game as a **completely separate Vercel project**:

**Benefits:**
- ✅ Docs site untouched
- ✅ Game has its own URL
- ✅ Independent deployments
- ✅ No conflicts

**How to do it:**

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Create NEW project**: Click "Add New" → "Project"
3. **Import same GitHub repo**: `MIFF-Make-It-For-Free`
4. **Name it differently**: e.g., `miff-kpop-game`
5. **Configure build:**
   - Framework: Other
   - Build Command: `npm run build`
   - Output Directory: `dist/game`
   - Root Directory: `.` (leave as repo root)
6. **Deploy!**

**Result:**
- Docs: `https://your-docs-site.vercel.app` (unchanged)
- Game: `https://miff-kpop-game.vercel.app` (new!)

---

### **Option B: Subdirectory on Same Vercel Project**

Keep both on same Vercel project, serve game at `/game` path:

**Benefits:**
- ✅ Single deployment
- ✅ Game at `your-site.vercel.app/game`

**Cons:**
- ❌ More complex routing
- ❌ Need to configure paths carefully

**How to do it:**

1. Update build to output to `/docs/game/`
2. Configure Vercel rewrites for `/game` path
3. More complex - **not recommended**

---

### **Option C: GitHub Pages for Docs, Vercel for Game**

Keep your current setup:

**Setup:**
- Docs: GitHub Pages (as you mentioned)
- Game: Vercel (new separate project)

**Benefits:**
- ✅ Complete separation
- ✅ GitHub Pages free for docs
- ✅ Vercel free for game
- ✅ No conflicts at all

**How:**
1. Keep GitHub Pages for docs (unchanged)
2. Deploy game to separate Vercel project (Option A above)

---

## 🎯 MY RECOMMENDATION

**Use Option A or C:**

### **If your docs are on Vercel:**
→ Create **separate Vercel project** for game

### **If your docs are on GitHub Pages:**
→ Deploy game to **new Vercel project**

---

## 📝 STEP-BY-STEP: Separate Vercel Project

### **1. Prepare Game Config**

I've created `vercel.game.json` with game-specific settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/game"
}
```

### **2. Deploy via Vercel Dashboard**

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. **Import**: Select `MIFF-Make-It-For-Free` repo
4. **Project Name**: `miff-kpop-game` (or whatever you want)
5. **Framework**: Other
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist/game`
8. **Root Directory**: `.` (leave blank or type `.`)
9. Click **"Deploy"**

### **3. Game Will Be Live!**

Your game will be at: `https://miff-kpop-game.vercel.app`

Your docs remain at: `https://your-docs-site.vercel.app` (or GitHub Pages)

---

## 🔧 If You Want to Use vercel.game.json

Deploy using the specific config file:

```bash
cd /workspace
vercel --config vercel.game.json --name miff-kpop-game
```

Or in Vercel dashboard, you can specify config file in project settings.

---

## 📊 COMPARISON

| Approach | Docs | Game | Complexity | Recommended |
|----------|------|------|------------|-------------|
| **Separate Projects** | Vercel | Vercel (new) | Low | ✅ YES |
| **Same Project** | Vercel `/` | Vercel `/game` | High | ❌ NO |
| **Split Hosting** | GitHub Pages | Vercel | Low | ✅ YES |

---

## 🎮 CURRENT STRUCTURE

```
Your Repo:
├── docs/              ← Your existing docs (Vercel or GH Pages)
├── src/game/          ← NEW K-pop game
├── public/assets/     ← Game assets (42MB)
├── dist/game/         ← Game build output
├── vite.config.ts     ← Game build config
└── vercel.game.json   ← Game Vercel config (won't affect docs!)
```

---

## ✅ WHAT TO DO NOW

### **Step 1: Decide Where Your Docs Are**

**Option A**: Docs on Vercel
- Create separate Vercel project for game
- Both on Vercel, different projects

**Option B**: Docs on GitHub Pages
- Deploy game to Vercel
- Keep docs on GitHub Pages

### **Step 2: Deploy Game**

1. Go to https://vercel.com
2. Create NEW project
3. Import same repo
4. Name it `miff-kpop-game`
5. Build: `npm run build`
6. Output: `dist/game`
7. Deploy!

### **Step 3: Test Both**

- Docs site: Still works at original URL
- Game: Live at new URL

---

## 🔗 URLs AFTER DEPLOYMENT

**Example:**

- **Docs**: `https://miff-docs.vercel.app` or GitHub Pages
- **Game**: `https://miff-kpop-game.vercel.app`

Both independent, no conflicts!

---

## 🚨 IMPORTANT

**DO NOT** use the `vercel.json` in root for both!

- I renamed it to `vercel.game.json`
- This won't override your docs deployment
- When you create the new Vercel project for the game, you can either:
  - Let it auto-detect the build settings, OR
  - Specify `vercel.game.json` as the config file

---

## 💡 BONUS: Link Them Together

Once both are deployed:

### **From Docs Site → Game**

Add a link in your docs:

```html
<a href="https://miff-kpop-game.vercel.app">🎮 Play K-pop Game!</a>
```

### **From Game → Docs**

Add a link in the game HUD:

```typescript
// In game UI
<a href="https://your-docs-site.vercel.app">📚 Docs</a>
```

---

## ✅ SUMMARY

1. **Renamed `vercel.json` → `vercel.game.json`** (won't interfere)
2. **Keep your docs deployment as-is**
3. **Create NEW Vercel project for game**
4. **Deploy game separately**
5. **Both live, no conflicts!**

---

**Ready to deploy?** Tell me:
- Where are your docs hosted? (Vercel or GitHub Pages?)
- Do you want me to help set up the separate game deployment?
