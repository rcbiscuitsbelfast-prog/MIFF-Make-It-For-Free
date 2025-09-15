# 🎯 **MIFF Onboarding Challenge - Your First Contribution**

**Welcome to MIFF!** This challenge will test your understanding of the framework and get you comfortable with contributing.

## 🎮 **Challenge: Create a Simple Game Zone**

### **Objective**
Create a **"Color Clicker"** game zone that demonstrates basic MIFF concepts:
- **Pure module integration**
- **CLI tool usage**
- **Testing and validation**
- **Zone structure understanding**

### **Requirements**

#### **🎯 Core Functionality**
- **Click squares** to change their colors
- **Score tracking** based on color patterns
- **3x3 grid** of clickable squares
- **Color cycling** through 4 colors (red, blue, green, yellow)

#### **🏗️ Technical Requirements**
- **Use existing Pure modules** (no custom code)
- **CLI harness** for testing
- **Golden tests** for validation
- **Proper zone structure** following MIFF conventions

#### **📁 File Structure**
```
ColorClickerPure/
├── scenario.json          # Game configuration
├── cliHarness.ts         # CLI interface
├── index.html            # Game interface
├── index.ts              # Zone logic
├── tests/
│   └── golden.test.ts    # Test suite
└── README.md             # Zone documentation
```

## 🚀 **Step-by-Step Guide**

### **Step 1: Generate Zone Scaffold**
```bash
# Create the zone structure
npx ts-node cli/miff-init.ts ColorClickerPure puzzle

# Verify structure was created
ls ColorClickerPure/
```

### **Step 2: Study Existing Zones**
```bash
# Examine Toppler structure
ls zones/toppler/
cat zones/toppler/scenario.json

# Look at Pure modules
ls miff/pure/ScoreSystemPure/
ls miff/pure/InputSystemPure/
```

### **Step 3: Implement Game Logic**
```bash
# Edit the zone files
cd ColorClickerPure
# Modify index.ts, index.html, scenario.json
```

### **Step 4: Create CLI Harness**
```bash
# Test your zone
npx ts-node cliHarness.ts
# Should output game state and score
```

### **Step 5: Write Tests**
```bash
# Create golden tests
# Test color changes, score updates, grid state
npm test
```

### **Step 6: Validate Integration**
```bash
# Test with MIFF tools
cd ..
npx ts-node cli/miff-simulate.ts ColorClickerPure/scenario.json
```

## 🧩 **Pure Modules to Use**

### **Required Modules**
- **`ScoreSystemPure`**: Track player score
- **`InputSystemPure`**: Handle click events
- **`StateManagerPure`**: Manage game state

### **Optional Modules**
- **`AudioBridgePure`**: Add sound effects
- **`AnimationPure`**: Smooth color transitions
- **`SaveSystemPure****: Persist high scores

## 📝 **Implementation Hints**

### **Game State Structure**
```typescript
interface ColorClickerState {
  grid: Color[][];        // 3x3 color grid
  score: number;          // Current score
  moves: number;          // Total moves made
  targetPattern?: Color[]; // Optional target pattern
}

type Color = 'red' | 'blue' | 'green' | 'yellow';
```

### **Score Calculation**
- **Color match**: +10 points
- **Pattern completion**: +50 points
- **Efficiency bonus**: +5 points per unused move

### **CLI Output Format**
```json
{
  "op": "colorClicker",
  "status": "ok",
  "state": {
    "grid": [["red", "blue", "green"], ...],
    "score": 45,
    "moves": 3
  }
}
```

## ✅ **Success Criteria**

### **Functional Requirements**
- [ ] **Game loads** without errors
- [ ] **Clicking works** and changes colors
- [ ] **Score updates** correctly
- [ ] **Grid state** is maintained
- [ ] **CLI harness** outputs valid JSON

### **Technical Requirements**
- [ ] **No TypeScript errors** on compilation
- [ ] **Tests pass** with golden validation
- [ ] **Zone integrates** with MIFF tools
- [ ] **Documentation** is clear and complete
- [ ] **Code follows** MIFF conventions

### **Quality Requirements**
- [ ] **Error handling** for edge cases
- [ ] **Responsive design** for mobile
- [ ] **Accessibility** considerations
- [ ] **Performance** optimization
- [ ] **Code comments** and documentation

## 🏆 **Bonus Challenges**

### **🌟 Bronze Level**
- **Add sound effects** using AudioBridgePure
- **Implement undo/redo** functionality
- **Add keyboard controls** for accessibility

### **🥈 Silver Level**
- **Create multiple difficulty levels**
- **Add time-based scoring** bonuses
- **Implement save/load** with SaveSystemPure

### **🥇 Gold Level**
- **Multiplayer support** with NetworkBridgePure
- **AI opponent** using AIProfilesPure
- **Custom themes** with ThemeSystemPure

## 🔍 **Testing Your Implementation**

### **Manual Testing**
```bash
# Start the zone
cd ColorClickerPure
python3 -m http.server 8000
# Open http://localhost:8000 in browser
```

### **Automated Testing**
```bash
# Run zone tests
npm test

# Test CLI integration
npx ts-node cliHarness.ts

# Validate with MIFF tools
npx ts-node cli/miff-simulate.ts scenario.json
```

### **Integration Testing**
```bash
# Test zone discovery
cd ..
node miff/scripts/gen-manifests.js
# Check if ColorClickerPure appears in orchestration.json
```

## 📚 **Resources**

### **Documentation**
- **`docs/QUICK_START.md`**: Getting started guide
- **`docs/CONTRIBUTOR_GUIDE.md`**: Detailed contributor information
- **`ROADMAP.md`**: Project direction and phases

### **Examples**
- **`zones/toppler/`**: Physics puzzle implementation
- **`zones/witcher_grove/`**: Narrative adventure structure
- **`miff/pure/*/tests/`**: Golden test examples

### **Tools**
- **`cli/miff-init.ts`**: Zone scaffolding
- **`cli/miff-simulate.ts`**: Scenario testing
- **`AutoBuilderCLI/`**: Demo generation

## 🎉 **Submission**

### **What to Submit**
1. **GitHub pull request** with your zone
2. **Screenshot/video** of the game in action
3. **Test results** showing all tests pass
4. **Brief description** of your implementation approach

### **Review Criteria**
- **Functionality**: Does the game work as intended?
- **Code Quality**: Is the code clean and well-structured?
- **Integration**: Does it work with MIFF tools?
- **Documentation**: Is the zone easy to understand and use?

## 🚀 **Next Steps After Completion**

### **Immediate**
- **Share your zone** in GitHub Discussions
- **Help other contributors** with their challenges
- **Report any bugs** you found in the framework

### **Short-term**
- **Improve your zone** based on feedback
- **Add more features** and polish
- **Create tutorials** for other contributors

### **Long-term**
- **Contribute to core modules** based on your experience
- **Mentor new contributors** through the challenge
- **Help shape** future MIFF features and direction

## 🙏 **Need Help?**

### **Community Support**
- **GitHub Discussions**: Ask questions and share progress
- **GitHub Issues**: Report bugs or request features
- **Contributor Guide**: Comprehensive framework documentation

### **Getting Unstuck**
1. **Check existing zones** for similar patterns
2. **Study Pure modules** to understand available functionality
3. **Read test files** to see how modules are used
4. **Ask in Discussions** - the community is here to help!

---

## 🎯 **Ready to Start?**

**This challenge is designed to be completed in 2-4 hours** for experienced developers, or 1-2 days for newcomers to game development.

**Take your time, ask questions, and have fun building!** 🎮✨

**Good luck, and welcome to the MIFF community!** 🚀
