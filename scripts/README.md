# MIFF Framework Scripts

This directory contains modular, remix-safe scripts for the MIFF (Make It For Free) framework. These scripts provide validation, testing, and contributor support for the Spirit Tamer: Trial of the Grove scenario.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Validate orchestration files
npm run validate:orchestration

# Check CI configuration
npm run validate:ci

# Start contributor onboarding
npm run onboard:contributor

# Generate a remix challenge
npm run remix:challenge quest beginner

# Run multi-agent testing
npm run multi-agent:test cooperative 3
```

## 📋 Available Scripts

### 🔍 Validation Scripts

#### `validate-orchestration.js`
Validates scenario orchestration files for completeness and correctness.

**Features:**
- Checks required fields (scenarioId, name, version, quests, npcs, locations, triggers)
- Validates schema version compatibility
- Ensures remix safety compliance
- Generates detailed validation reports

**Usage:**
```bash
npm run validate:orchestration
# or
node scripts/validate-orchestration.js
```

**Output:**
- Console validation results
- `orchestration_validation_report.json` with detailed findings

#### `validate-ci.js`
Validates CI workflows and package.json configuration.

**Features:**
- Checks GitHub Actions workflows
- Validates package.json scripts
- Ensures CI pipeline health
- Identifies missing dependencies

**Usage:**
```bash
npm run validate:ci
# or
node scripts/validate-ci.js
```

**Output:**
- Console CI health status
- `ci_validation_report.json` with workflow analysis

### 🌱 Contributor Support Scripts

#### `onboard-contributor.js`
Comprehensive onboarding guide for new contributors.

**Features:**
- Welcome message and framework overview
- Project structure explanation
- Remix challenge descriptions
- Contribution guidelines
- Useful commands reference
- Project health assessment

**Usage:**
```bash
npm run onboard:contributor
# or
node scripts/onboard-contributor.js
```

**Output:**
- Interactive console onboarding experience
- `contributor_onboarding.json` with complete guide

#### `remix-challenge.js`
Generates remix challenges for contributors.

**Features:**
- 6 challenge types: quest, npc, location, asset, mechanic, story
- 4 difficulty levels: beginner, intermediate, advanced, expert
- Template structures for each challenge type
- Skills requirements and file modifications
- Validation commands

**Usage:**
```bash
# List available challenges
npm run remix:challenge

# Generate specific challenge
npm run remix:challenge quest beginner
npm run remix:challenge npc advanced
npm run remix:challenge location intermediate
```

**Output:**
- Challenge template with complete structure
- JSON file saved as `remix_challenge_[type]_[difficulty].json`

### 🤖 Multi-Agent Testing Scripts

#### `multi-agent-test.js`
Simulates multi-agent playtesting scenarios.

**Features:**
- 4 test modes: cooperative, competitive, exploratory, stress
- 5 agent profiles: human, curious AI, efficient AI, creative AI, hybrid
- Dynamic agent behavior simulation
- Performance metrics and recommendations
- Scalable testing (2-8 agents)

**Usage:**
```bash
# List available test modes
npm run multi-agent:test

# Run specific test
npm run multi-agent:test cooperative 3
npm run multi-agent:test stress 8
npm run multi-agent:test competitive 4
```

**Output:**
- Real-time simulation progress
- Performance metrics and analysis
- JSON results file: `multi_agent_test_[mode]_[count]_agents.json`

## 🎯 Remix Challenge Types

### 1. Quest Creation
- **Difficulty:** Beginner to Advanced
- **Skills:** JSON, Quest Design, Game Balance, Storytelling
- **Files:** `orchestration.json`, `quest_pack_fae.json`
- **Description:** Create new quest lines that integrate with existing scenarios

### 2. NPC Creation
- **Difficulty:** Intermediate
- **Skills:** Character Design, Dialogue Writing, JSON, Game Balance
- **Files:** `npc_tables_mythic.json`, `npc_dialogue_trees_fae.json`
- **Description:** Design and implement new characters with dialogue and interactions

### 3. Location Design
- **Difficulty:** Intermediate
- **Skills:** Level Design, Environmental Design, JSON, Game Balance
- **Files:** `location_registry.json`, `orchestration.json`
- **Description:** Create new explorable areas with environmental effects

### 4. Asset Creation
- **Difficulty:** Advanced
- **Skills:** Art/Design, Audio Production, Asset Integration, File Management
- **Files:** `visual_manifest.json`, `asset_todo.json`
- **Description:** Create visual, audio, or lore assets for scenarios

### 5. Game Mechanic
- **Difficulty:** Advanced to Expert
- **Skills:** Game Design, System Design, JSON, Game Balance
- **Files:** `orchestration.json`, custom mechanic files
- **Description:** Implement new gameplay systems or mechanics

### 6. Story Expansion
- **Difficulty:** Intermediate to Advanced
- **Skills:** Creative Writing, Storytelling, World Building, Lore Integration
- **Files:** `lore_expansion.json`, `orchestration.json`
- **Description:** Expand narrative and lore of existing scenarios

## 🧪 Multi-Agent Test Modes

### 1. Cooperative
- **Agents:** 2-4
- **Focus:** Team collaboration, quest completion
- **Objectives:** Complete all quests, maximize team XP, minimize conflicts

### 2. Competitive
- **Agents:** 2-6
- **Focus:** Achievement racing, resource competition
- **Objectives:** Earn most XP, collect rare items, complete quests first

### 3. Exploratory
- **Agents:** 3-6
- **Focus:** Content discovery, world mapping
- **Objectives:** Discover all locations, find hidden content, map entire world

### 4. Stress Testing
- **Agents:** 6-8
- **Focus:** System performance, scalability validation
- **Objectives:** Test performance limits, identify bottlenecks, validate scalability

## 🔧 Script Architecture

All scripts follow these principles:

- **Modular Design:** Each script is self-contained and exportable
- **Remix Safety:** No direct file modifications, only validation and generation
- **Error Handling:** Graceful failure with detailed error reporting
- **Logging:** Emoji-coded console output for clarity
- **Configuration:** Externalized settings for easy customization
- **Documentation:** Comprehensive inline documentation and examples

## 📊 Output Files

Scripts generate various output files:

- **Validation Reports:** JSON files with detailed validation results
- **Challenge Templates:** Structured JSON templates for remix challenges
- **Test Results:** Multi-agent simulation results and performance metrics
- **Onboarding Guides:** Complete contributor onboarding content

## 🚀 Integration

These scripts integrate with the main MIFF framework through:

- **npm Scripts:** All scripts are accessible via package.json commands
- **CI/CD:** Validation scripts can be integrated into GitHub Actions
- **Development Workflow:** Scripts support the development and testing process
- **Contributor Experience:** Streamlined onboarding and contribution process

## 🔒 Remix Safety

All scripts maintain remix safety by:

- **Read-Only Operations:** Scripts only read and validate, never modify core files
- **Template Generation:** New content is generated as templates, not direct modifications
- **Validation Focus:** Primary purpose is validation and guidance, not file manipulation
- **Modular Output:** Generated content is modular and can be integrated safely

## 🤝 Contributing

To contribute to these scripts:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test with existing scenarios**
5. **Submit a pull request**

## 📚 Additional Resources

- [MIFF Framework Documentation](../README.md)
- [Spirit Tamer Scenario](../SpiritTamerDemoPure/README.md)
- [Orchestration Guide](../SpiritTamerDemoPure/orchestration.json)
- [Contributor Guidelines](../CONTRIBUTING.md)

## 🆘 Support

For questions or issues:

- **GitHub Issues:** Report bugs or request features
- **Discussions:** Join community discussions
- **Documentation:** Check the comprehensive documentation
- **Examples:** Review existing scenario implementations

---

**🌿 Built with ❤️ for the MIFF community**