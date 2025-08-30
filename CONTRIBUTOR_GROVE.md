# 🌿 Spirit Tamer: Trial of the Grove - Contributor Guide

**Welcome to the MIFF Framework!** This guide will help you contribute to the "Spirit Tamer: Trial of the Grove" scenario, a mystical RPG adventure in the enchanted Fae Grove.

---

## 🎮 Scenario Overview

### What is Spirit Tamer?
**Spirit Tamer: Trial of the Grove** is a complete RPG scenario where players:
- 🏛️ **Enter the Sacred Grove** - Prove their worth through ancient riddles
- 🗣️ **Learn Spirit Whispering** - Master the art of communicating with spirits
- 💪 **Face the Trial of Courage** - Confront shadows and restore light to the vale
- 🌟 **Become Grove Masters** - Complete all trials and earn mystical rewards

### Scenario Structure
- **3 Main Quests**: Grove Initiation, Spirit Whisperer, Trial of Courage
- **6 NPCs**: Grove Guardian, Spirit Guide, Ancient Spirit, Shadow Guardian, Shadow Creature, Ancient Beacon
- **5 Locations**: Grove Entrance, Grove Center, Whispering Hollow, Shadowed Vale, Deep Shadows
- **Complete Dialogue Trees**: Full conversation systems for all NPCs
- **Asset System**: Visual, audio, and lore assets with fallback stubs

---

## 🔄 Remix Challenge Prompt

### 🎯 Your Mission
Transform the existing "Spirit Tamer" scenario by adding new content while maintaining the mystical, fae theme. Choose from these challenge types:

#### 🌱 **Beginner Challenges**
- **New Quest Step**: Add a step to an existing quest
- **NPC Dialogue**: Expand conversation options for any NPC
- **Location Description**: Enhance location descriptions with more detail

#### 🚀 **Intermediate Challenges**
- **New NPC**: Create a new character with dialogue and quest interactions
- **Location Expansion**: Add a new area to explore in the grove
- **Quest Branch**: Create an alternative path through an existing quest

#### ⚡ **Advanced Challenges**
- **New Quest Line**: Design a completely new quest with multiple steps
- **Game Mechanic**: Implement a new gameplay system (crafting, reputation, etc.)
- **Asset Creation**: Create visual or audio assets for the scenario

#### 🌟 **Expert Challenges**
- **Story Expansion**: Write new lore, legends, or background stories
- **Multi-Agent Integration**: Enhance the scenario for AI agent playtesting
- **Performance Optimization**: Improve scenario loading and execution speed

---

## 📁 Asset Drop Instructions

### 🔒 Remix Safety Rules
**NEVER modify core files directly!** Use these safe methods:

1. **Drop-Only Patches**: Create new JSON files that extend existing content
2. **Asset Stubs**: Use the existing stub system for missing assets
3. **Template Generation**: Use the provided templates for new content
4. **Validation First**: Always validate your changes before submitting

### 📂 File Structure
```
SpiritTamerDemoPure/
├── orchestration.json          # Main scenario configuration
├── fixtures/                   # Game content and assets
│   ├── quest_pack_fae.json    # Quest definitions
│   ├── npc_dialogue_trees_fae.json  # NPC conversations
│   ├── npc_tables_mythic.json # Character stats and abilities
│   └── location_registry.json # Location definitions
├── start_grove.js             # Console simulation script
└── README.md                  # Scenario documentation
```

### 🎨 Asset Categories

#### **Visual Assets**
- **Item Icons**: 32x32px PNG files for quest rewards
- **Location Art**: 800x600px scene backgrounds
- **NPC Models**: 64x128px character sprites
- **UI Elements**: Interface components and overlays

#### **Audio Assets**
- **Ambient Tracks**: Location-based background music
- **Sound Effects**: Quest completion, combat, magic spells
- **Voice Lines**: NPC dialogue audio (optional)

#### **Lore Assets**
- **Story Fragments**: Additional narrative elements
- **Legend Descriptions**: Myths and legends of the grove
- **Character Backstories**: Extended NPC histories

---

## 🔗 Orchestration Registry & Playtest Hooks

### 📋 Available Scripts
Use these commands to validate and test your contributions:

```bash
# Validate your changes
npm run validate:orchestration
npm run validate:ci
npm run validate:release

# Test the scenario
npm run start:grove
npm run test:spirit-tamer

# Generate remix challenges
npm run remix:challenge quest intermediate
npm run remix:challenge npc advanced

# Multi-agent testing
npm run multi-agent:test cooperative 3
npm run multi-agent:test exploratory 4
```

### 🧪 Testing Your Changes

#### **1. Local Validation**
```bash
cd SpiritTamerDemoPure
npm run validate:orchestration
```

#### **2. Console Testing**
```bash
npm run start:grove
```

#### **3. Multi-Agent Testing**
```bash
npm run multi-agent:test cooperative 3
```

#### **4. Release Validation**
```bash
npm run validate:release
```

### 🔍 Validation Checklist
Before submitting your contribution, ensure:
- ✅ All JSON files are valid and parse correctly
- ✅ Required fields are present in your additions
- ✅ Remix safety is maintained (no core file modifications)
- ✅ Your changes integrate with existing content
- ✅ All tests pass successfully

---

## 🛠️ Contribution Workflow

### **Step 1: Choose Your Challenge**
1. Review the remix challenge types above
2. Select a challenge that matches your skills and interests
3. Use `npm run remix:challenge [type] [difficulty]` to generate a template

### **Step 2: Plan Your Contribution**
1. **Research**: Examine existing content to understand the theme and style
2. **Design**: Plan your addition to fit seamlessly with existing content
3. **Scope**: Keep your contribution focused and manageable

### **Step 3: Implement Your Changes**
1. **Create New Files**: Use the provided templates and examples
2. **Follow Patterns**: Match the existing JSON structure and naming conventions
3. **Test Locally**: Validate your changes before submitting

### **Step 4: Validate & Submit**
1. **Run Validation**: Use all available validation scripts
2. **Test Integration**: Ensure your changes work with existing content
3. **Submit PR**: Create a pull request with clear description of your changes

---

## 📚 Learning Resources

### **Existing Examples**
- **Quest Design**: Study `quest_pack_fae.json` for quest structure
- **NPC Creation**: Examine `npc_dialogue_trees_fae.json` for character development
- **Location Design**: Review `location_registry.json` for environmental storytelling

### **Templates & Tools**
- **Remix Challenge Generator**: `npm run remix:challenge`
- **Validation Scripts**: Comprehensive testing and validation
- **Multi-Agent Testing**: Test your changes with AI agents

### **Documentation**
- **README.md**: Detailed scenario documentation
- **Orchestration Guide**: Complete system architecture
- **Asset Guidelines**: Standards for visual and audio content

---

## 🌟 Contribution Ideas

### **Immediate Opportunities**
1. **🌿 Grove Expansion**: Add new areas like "Mystical Garden" or "Ancient Library"
2. **👥 New NPCs**: Create characters like "Wandering Sage" or "Grove Merchant"
3. **🎯 Side Quests**: Add optional quests like "Herb Collection" or "Spirit Meditation"
4. **✨ New Abilities**: Implement skills like "Nature Bonding" or "Shadow Walking"

### **Advanced Projects**
1. **🏰 Multi-Zone Adventure**: Expand beyond the grove to nearby realms
2. **🤖 AI Agent Enhancements**: Improve multi-agent testing capabilities
3. **🎨 Asset Library**: Create comprehensive visual and audio asset sets
4. **📖 Lore Expansion**: Develop the complete mythology of the Fae Grove

---

## 🚀 Getting Started

### **Quick Start Commands**
```bash
# Clone and setup
git clone [repository-url]
cd MIFF-Make-It-For-Free
npm install

# Validate current state
npm run validate:orchestration
npm run validate:ci

# Start contributing
npm run onboard:contributor
npm run remix:challenge quest beginner
```

### **First Contribution**
1. **Start Small**: Choose a beginner-level challenge
2. **Follow Examples**: Use existing content as templates
3. **Ask Questions**: Join community discussions for guidance
4. **Iterate**: Refine your contribution based on feedback

---

## 🤝 Community & Support

### **Where to Get Help**
- **GitHub Issues**: Report bugs or request features
- **Discussions**: Join community conversations
- **Documentation**: Review comprehensive guides and examples
- **Examples**: Study existing scenario implementations

### **Contribution Guidelines**
- **Be Respectful**: Maintain a welcoming community environment
- **Follow Standards**: Adhere to established patterns and conventions
- **Test Thoroughly**: Ensure your changes work correctly
- **Document Clearly**: Explain your contributions for other contributors

---

## 🎉 Ready to Contribute?

The "Spirit Tamer: Trial of the Grove" scenario is ready for your creative input! Whether you're a beginner looking to learn or an expert ready to push boundaries, there's a challenge waiting for you.

**Start your journey today:**
1. 🎯 Choose a remix challenge
2. 🛠️ Use the provided tools and templates
3. 🧪 Test your changes thoroughly
4. 🚀 Submit your contribution
5. 🌟 Join the MIFF community!

---

**🌿 Built with ❤️ for the MIFF community**  
**📅 Last Updated: December 19, 2024**  
**🏆 Status: Ready for Contributions**