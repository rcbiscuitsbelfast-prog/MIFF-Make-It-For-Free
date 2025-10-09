# 🕹️ MIFF Game Design Intake Document

**Version:** 1.0  
**Last Updated:** 2025-01-08  
**Status:** Ready for Contributors

---

## 📋 **Instructions for Contributors**

### **How to Use This Document**
1. **Copy this template** to `docs/game-projects/[your-game-name]/GameDesignIntake.md`
2. **Fill out all sections** completely (incomplete submissions will be rejected)
3. **Follow MIFF architectural standards** (see templates in `docs/templates/`)
4. **Submit via Pull Request** with the intake document
5. **Tag an AI agent** to build your game using the instructions below

### **How to Ask an Agent to Build Your Game**
After completing this intake document, use this prompt with an AI agent:

```
// GOAL: Build a complete game using the MIFF framework based on the Game Design Intake Document

// CONTEXT:
// I have completed a Game Design Intake Document for [GAME_NAME] located at docs/game-projects/[GAME_NAME]/GameDesignIntake.md
// Please review the intake document and build the complete game following MIFF architectural standards

// REQUIREMENTS:
// - Follow all MIFF patterns (managers, CLI harnesses, schemas, tests)
// - Implement all quests, mechanics, and modules specified
// - Use existing MIFF modules where possible
// - Create new modules only when necessary
// - Ensure all code follows contributor-safe patterns
// - Include comprehensive test suites
// - Generate all required documentation

// DELIVERABLES:
// - Complete game implementation
// - All required modules and systems
// - Test suites and validation
// - Documentation and README
// - Integration with MIFF framework

Please proceed with building [GAME_NAME] based on the intake document.
```

---

## 🎮 **Game Design Intake Form**

### **Project Information**
- **Game Name:** `[REQUIRED: Enter your game's name]`
- **Contributor:** `[REQUIRED: Your name or GitHub username]`
- **Date:** `[REQUIRED: YYYY-MM-DD]`
- **Version:** `[REQUIRED: 1.0.0]`
- **Status:** `[REQUIRED: Draft/Ready/In Development]`

---

## 1. 🎯 **Game Type & Platform**

### **Genre & Style**
- **Primary Genre:** `[REQUIRED: Action/RPG/Puzzle/Platformer/Strategy/etc.]`
- **Secondary Genres:** `[OPTIONAL: List additional genres]`
- **Art Style:** `[REQUIRED: Pixel Art/3D Realistic/2D Cartoon/Abstract/etc.]`
- **Target Audience:** `[REQUIRED: Casual/Core/Hardcore/All Ages/etc.]`

### **Platform & Engine**
- **Target Platforms:** `[REQUIRED: Web/Desktop/Mobile/Console/All]`
- **Primary Platform:** `[REQUIRED: Web/Desktop/Mobile/Console]`
- **Engine Preference:** `[REQUIRED: Unity/Godot/Web/Unreal/Any]`
- **Performance Target:** `[REQUIRED: 30fps/60fps/120fps/Unlimited]`

### **Scope & Scale**
- **Development Time:** `[REQUIRED: 1-2 weeks/1 month/3 months/6+ months]`
- **Team Size:** `[REQUIRED: Solo/2-3 people/4-6 people/7+ people]`
- **Complexity Level:** `[REQUIRED: Simple/Medium/Complex/Enterprise]`

---

## 2. ⚙️ **Core Mechanics**

### **Player Movement**
- **Movement Type:** `[REQUIRED: 2D Platformer/3D First Person/3D Third Person/Grid-based/Free-form/etc.]`
- **Movement Controls:** `[REQUIRED: WASD/Arrow Keys/Touch/Controller/etc.]`
- **Special Movement:** `[OPTIONAL: Jumping/Dashing/Climbing/Flying/etc.]`
- **Physics:** `[REQUIRED: Realistic/Arcade/None/Custom]`

### **Combat System**
- **Combat Type:** `[REQUIRED: Real-time/Turn-based/None/Hybrid]`
- **Combat Mechanics:** `[OPTIONAL: Melee/Ranged/Magic/Stealth/etc.]`
- **Health System:** `[REQUIRED: HP/Shields/Hearts/None]`
- **Damage Types:** `[OPTIONAL: Physical/Magical/Environmental/etc.]`

### **Interaction Systems**
- **Object Interaction:** `[REQUIRED: Click/Touch/Proximity/None]`
- **NPC Interaction:** `[REQUIRED: Dialogue/Commands/None]`
- **Inventory System:** `[REQUIRED: Grid-based/List-based/None]`
- **Crafting System:** `[OPTIONAL: Recipe-based/Free-form/None]`

### **Progression Systems**
- **Character Progression:** `[REQUIRED: Level-based/Skill-based/None]`
- **Unlock System:** `[OPTIONAL: Achievements/Story/Exploration/etc.]`
- **Save System:** `[REQUIRED: Auto-save/Manual save/Checkpoint/None]`

---

## 3. 📖 **Narrative Overview**

### **Setting & World**
- **World Type:** `[REQUIRED: Fantasy/Sci-fi/Modern/Historical/Abstract/etc.]`
- **Time Period:** `[REQUIRED: Present/Future/Past/Alternate/etc.]`
- **Location:** `[REQUIRED: Earth/Space/Fantasy World/Other/etc.]`
- **Atmosphere:** `[REQUIRED: Dark/Bright/Neutral/Mysterious/etc.]`

### **Story & Theme**
- **Main Theme:** `[REQUIRED: Adventure/Exploration/Conflict/Discovery/etc.]`
- **Player Role:** `[REQUIRED: Hero/Explorer/Builder/Survivor/etc.]`
- **Story Structure:** `[REQUIRED: Linear/Branching/Open/None]`
- **Narrative Style:** `[REQUIRED: Text-based/Voice-acted/Environmental/None]`

### **Characters**
- **Main Character:** `[REQUIRED: Description of player character]`
- **Key NPCs:** `[OPTIONAL: List important non-player characters]`
- **Antagonist:** `[OPTIONAL: Main villain or conflict source]`

---

## 4. 🎓 **Tutorial Area Design**

### **Tutorial Environment**
- **Location Name:** `[REQUIRED: Name of tutorial area]`
- **Environment Type:** `[REQUIRED: Forest/City/Dungeon/Space/etc.]`
- **Size:** `[REQUIRED: Small/Medium/Large]`
- **Key Landmarks:** `[REQUIRED: List important locations]`

### **Tutorial Goals**
- **Primary Goal:** `[REQUIRED: What should players learn first?]`
- **Secondary Goals:** `[OPTIONAL: Additional learning objectives]`
- **Success Criteria:** `[REQUIRED: How do players know they've completed the tutorial?]`

### **Tutorial NPCs**
- **Guide NPC:** `[REQUIRED: Name and role of tutorial guide]`
- **Helper NPCs:** `[OPTIONAL: Additional tutorial helpers]`
- **Dialogue Style:** `[REQUIRED: Formal/Casual/Comedic/None]`

---

## 5. 🎯 **Quest List (Minimum 5 Quests)**

### **Quest 1: [Quest Name]**
- **Type:** `[REQUIRED: Main/Side/Tutorial/Collection/etc.]`
- **Objective:** `[REQUIRED: What must the player do?]`
- **Location:** `[REQUIRED: Where does this quest take place?]`
- **Rewards:** `[REQUIRED: What does the player receive?]`
- **Prerequisites:** `[OPTIONAL: What must be completed first?]`

### **Quest 2: [Quest Name]**
- **Type:** `[REQUIRED: Main/Side/Tutorial/Collection/etc.]`
- **Objective:** `[REQUIRED: What must the player do?]`
- **Location:** `[REQUIRED: Where does this quest take place?]`
- **Rewards:** `[REQUIRED: What does the player receive?]`
- **Prerequisites:** `[OPTIONAL: What must be completed first?]`

### **Quest 3: [Quest Name]**
- **Type:** `[REQUIRED: Main/Side/Tutorial/Collection/etc.]`
- **Objective:** `[REQUIRED: What must the player do?]`
- **Location:** `[REQUIRED: Where does this quest take place?]`
- **Rewards:** `[REQUIRED: What does the player receive?]`
- **Prerequisites:** `[OPTIONAL: What must be completed first?]`

### **Quest 4: [Quest Name]**
- **Type:** `[REQUIRED: Main/Side/Tutorial/Collection/etc.]`
- **Objective:** `[REQUIRED: What must the player do?]`
- **Location:** `[REQUIRED: Where does this quest take place?]`
- **Rewards:** `[REQUIRED: What does the player receive?]`
- **Prerequisites:** `[OPTIONAL: What must be completed first?]`

### **Quest 5: [Quest Name]**
- **Type:** `[REQUIRED: Main/Side/Tutorial/Collection/etc.]`
- **Objective:** `[REQUIRED: What must the player do?]`
- **Location:** `[REQUIRED: Where does this quest take place?]`
- **Rewards:** `[REQUIRED: What does the player receive?]`
- **Prerequisites:** `[OPTIONAL: What must be completed first?]`

---

## 6. 🎨 **Asset Needs**

### **Prefabs & Objects**
- **Character Prefabs:** `[REQUIRED: List all character prefabs needed]`
- **Environment Objects:** `[REQUIRED: List environmental objects]`
- **Interactive Objects:** `[REQUIRED: List objects players can interact with]`
- **UI Elements:** `[REQUIRED: List UI components needed]`

### **Scripts & Components**
- **Manager Scripts:** `[REQUIRED: List manager classes needed]`
- **Controller Scripts:** `[REQUIRED: List controller classes needed]`
- **Utility Scripts:** `[OPTIONAL: List utility classes needed]`
- **Custom Components:** `[OPTIONAL: List custom components needed]`

### **Scenes & Levels**
- **Main Scenes:** `[REQUIRED: List all main game scenes]`
- **Tutorial Scene:** `[REQUIRED: Tutorial area scene]`
- **Menu Scenes:** `[REQUIRED: Main menu, settings, etc.]`
- **Loading Scenes:** `[OPTIONAL: Loading screens needed]`

---

## 7. 🔧 **Runtime Requirements**

### **MIFF Hooks**
- **Lifecycle Hooks:** `[REQUIRED: onInit/onUpdate/onDestroy/etc.]`
- **Event Hooks:** `[REQUIRED: onPlayerAction/onQuestComplete/etc.]`
- **Custom Hooks:** `[OPTIONAL: Game-specific hooks needed]`

### **Transport Layer**
- **Data Transport:** `[REQUIRED: Local/Network/File/etc.]`
- **Save System:** `[REQUIRED: JSON/Binary/Database/etc.]`
- **Network Requirements:** `[OPTIONAL: Multiplayer/Cloud save/etc.]`

### **Bridge Modules**
- **Engine Bridge:** `[REQUIRED: Unity/Godot/Web/Unreal]`
- **Platform Bridge:** `[REQUIRED: Web/Desktop/Mobile/Console]`
- **Custom Bridges:** `[OPTIONAL: Additional bridge modules needed]`

---

## 8. 🖥️ **CLI Harness Expectations**

### **Required Operations**
- **Core Operations:** `[REQUIRED: start/stop/pause/resume/etc.]`
- **Quest Operations:** `[REQUIRED: list/start/complete/abandon/etc.]`
- **Save Operations:** `[REQUIRED: save/load/delete/etc.]`
- **Debug Operations:** `[OPTIONAL: debug/test/validate/etc.]`

### **Command Line Flags**
- **Required Flags:** `[REQUIRED: List all required command line flags]`
- **Optional Flags:** `[OPTIONAL: List optional command line flags]`
- **Output Formats:** `[REQUIRED: JSON/Text/HTML/etc.]`

### **Integration Points**
- **MIFF Integration:** `[REQUIRED: How to integrate with MIFF CLI]`
- **Agent Integration:** `[REQUIRED: How agents should interact with CLI]`
- **Testing Integration:** `[REQUIRED: How to test CLI functionality]`

---

## 9. 📊 **Schema Needs**

### **Custom Payloads**
- **Quest Payloads:** `[REQUIRED: Describe quest data structures]`
- **Player Payloads:** `[REQUIRED: Describe player data structures]`
- **Game State Payloads:** `[REQUIRED: Describe game state structures]`
- **Save Payloads:** `[REQUIRED: Describe save data structures]`

### **Validators**
- **Input Validators:** `[REQUIRED: What input validation is needed?]`
- **Data Validators:** `[REQUIRED: What data validation is needed?]`
- **Schema Validators:** `[REQUIRED: What schema validation is needed?]`

### **Migration Needs**
- **Data Migration:** `[OPTIONAL: Will save data need migration?]`
- **Schema Migration:** `[OPTIONAL: Will schemas need versioning?]`
- **Backward Compatibility:** `[OPTIONAL: Backward compatibility requirements?]`

---

## 10. 🚀 **Expansion Plans**

### **Additional Modules**
- **Planned Modules:** `[OPTIONAL: List modules to add later]`
- **Priority Order:** `[OPTIONAL: Order of module implementation]`
- **Dependencies:** `[OPTIONAL: Module dependencies]`

### **Mechanics Expansion**
- **New Mechanics:** `[OPTIONAL: Additional mechanics to add]`
- **Complexity Scaling:** `[OPTIONAL: How will complexity increase?]`
- **Feature Gates:** `[OPTIONAL: What unlocks new features?]`

### **Quest Packs**
- **Additional Areas:** `[OPTIONAL: New areas to add]`
- **Quest Types:** `[OPTIONAL: New quest types to implement]`
- **Story Arcs:** `[OPTIONAL: Additional story content]`

---

## 11. ♻️ **Module Reuse Declaration**

### **Existing MIFF Modules to Reuse**
- **Core Modules:** `[REQUIRED: List MIFF modules to reuse]`
- **Bridge Modules:** `[REQUIRED: List bridge modules to reuse]`
- **Utility Modules:** `[OPTIONAL: List utility modules to reuse]`

### **Modification Requirements**
- **Customizations:** `[OPTIONAL: How will you modify existing modules?]`
- **Extensions:** `[OPTIONAL: How will you extend existing modules?]`
- **Overrides:** `[OPTIONAL: What will you override in existing modules?]`

---

## 12. 🔍 **Capability Declaration**

### **Exposed Capabilities**
- **Player Capabilities:** `[REQUIRED: What can players do?]`
- **System Capabilities:** `[REQUIRED: What can the system do?]`
- **Integration Capabilities:** `[OPTIONAL: What external integrations are needed?]`

### **Performance Requirements**
- **Memory Usage:** `[REQUIRED: Expected memory usage]`
- **CPU Usage:** `[REQUIRED: Expected CPU usage]`
- **Storage Requirements:** `[REQUIRED: Expected storage needs]`

---

## 13. ⚠️ **CAPA Impact Statement**

### **Architectural Risk Assessment**
- **New Dependencies:** `[REQUIRED: Does this introduce new dependencies?]`
- **Schema Changes:** `[REQUIRED: Does this require schema changes?]`
- **Performance Impact:** `[REQUIRED: Will this impact performance?]`
- **Security Considerations:** `[REQUIRED: Are there security implications?]`

### **Risk Mitigation**
- **Mitigation Strategies:** `[REQUIRED: How will you mitigate risks?]`
- **Testing Requirements:** `[REQUIRED: What testing is needed?]`
- **Monitoring Needs:** `[REQUIRED: What monitoring is needed?]`

---

## 14. 🤖 **Agent Instruction Block**

### **Build Priorities**
- **Phase 1 (Core):** `[REQUIRED: What to build first]`
- **Phase 2 (Features):** `[REQUIRED: What to build second]`
- **Phase 3 (Polish):** `[REQUIRED: What to build third]`

### **Implementation Constraints**
- **Time Constraints:** `[OPTIONAL: Any time limitations?]`
- **Resource Constraints:** `[OPTIONAL: Any resource limitations?]`
- **Technical Constraints:** `[OPTIONAL: Any technical limitations?]`

### **Success Criteria**
- **Minimum Viable Product:** `[REQUIRED: What constitutes MVP?]`
- **Quality Standards:** `[REQUIRED: What quality level is required?]`
- **Testing Requirements:** `[REQUIRED: What testing is mandatory?]`

---

## 15. ✅ **Validation Checklist**

### **Required Fields Check**
- [ ] **Project Information** - All required fields filled
- [ ] **Game Type & Platform** - All required fields filled
- [ ] **Core Mechanics** - All required fields filled
- [ ] **Narrative Overview** - All required fields filled
- [ ] **Tutorial Area Design** - All required fields filled
- [ ] **Quest List** - Minimum 5 quests defined
- [ ] **Asset Needs** - All required fields filled
- [ ] **Runtime Requirements** - All required fields filled
- [ ] **CLI Harness Expectations** - All required fields filled
- [ ] **Schema Needs** - All required fields filled
- [ ] **Expansion Plans** - All required fields filled
- [ ] **Module Reuse Declaration** - All required fields filled
- [ ] **Capability Declaration** - All required fields filled
- [ ] **CAPA Impact Statement** - All required fields filled
- [ ] **Agent Instruction Block** - All required fields filled

### **Quality Assurance Check**
- [ ] **Consistency** - All sections are consistent with each other
- [ ] **Completeness** - No sections are left incomplete
- [ ] **Clarity** - All descriptions are clear and unambiguous
- [ ] **Feasibility** - All requirements are technically feasible
- [ ] **MIFF Compliance** - All requirements follow MIFF standards

### **Final Submission Check**
- [ ] **Document Location** - Placed in `docs/game-projects/[game-name]/`
- [ ] **File Naming** - Named `GameDesignIntake.md`
- [ ] **Markdown Formatting** - Properly formatted markdown
- [ ] **Version Control** - Ready for git commit
- [ ] **Agent Ready** - Ready for agent processing

---

## 📞 **Support & Resources**

### **Getting Help**
- **MIFF Documentation:** `docs/` directory
- **Templates:** `docs/templates/` directory
- **Examples:** `docs/game-projects/` directory
- **Issues:** GitHub Issues for MIFF repository

### **Contributor Guidelines**
- **Code Standards:** Follow MIFF architectural patterns
- **Testing:** Include comprehensive test suites
- **Documentation:** Document all public APIs
- **Performance:** Optimize for target performance metrics

### **Agent Integration**
- **Agent Prompts:** Use provided agent instruction templates
- **Validation:** Ensure intake document passes validation checklist
- **Iteration:** Be prepared to refine requirements based on agent feedback

---

**🎮 Ready to build your game with MIFF! Follow the instructions above to get started.**