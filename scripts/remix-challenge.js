#!/usr/bin/env node

/**
 * Remix Challenge Generator Script
 * Purpose: Generate remix challenges for MIFF framework contributors
 * Version: 1.0.0
 * Author: MIFF Framework
 * License: MIT
 * RemixSafe: true
 */

const fs = require('fs');
const path = require('path');

// Configuration
const REMIX_CONFIG = {
  frameworkName: 'MIFF: Make It For Free',
  frameworkVersion: 'v14',
  baseScenario: 'spirit-tamer-trial-of-grove',
  challengeTypes: ['quest', 'npc', 'location', 'asset', 'mechanic', 'story'],
  difficultyLevels: ['beginner', 'intermediate', 'advanced', 'expert'],
  logLevel: 'info'
};

// Remix challenge templates
const CHALLENGE_TEMPLATES = {
  quest: {
    name: 'New Quest Creation',
    description: 'Create a new quest line that integrates with the existing scenario',
    template: {
      questId: 'new_quest_id',
      title: 'New Quest Title',
      description: 'Description of the new quest',
      difficulty: 'medium',
      estimatedTime: '30-45 minutes',
      prerequisites: ['grove_initiation'],
      steps: [
        {
          stepId: 'step_1',
          description: 'First step description',
          locationId: 'grove_center',
          npcId: 'ancient_spirit',
          triggers: ['location_entered', 'npc_interaction']
        }
      ],
      rewards: {
        xp: 200,
        items: ['new_item'],
        flags: ['new_flag']
      }
    },
    skills: ['JSON', 'Quest Design', 'Game Balance', 'Storytelling'],
    files: ['orchestration.json', 'quest_pack_fae.json'],
    validation: 'npm run validate:orchestration'
  },
  npc: {
    name: 'New NPC Creation',
    description: 'Design and implement a new character with dialogue and interactions',
    template: {
      npcId: 'new_npc_id',
      name: 'New NPC Name',
      title: 'NPC Title or Role',
      race: 'fae_ancient',
      level: 25,
      stats: { hp: 500, mp: 200 },
      abilities: [{ abilityId: 'new_ability', name: 'New Ability' }],
      locationId: 'grove_center',
      dialogueTree: 'new_npc_dialogue',
      questGiver: ['new_quest_id'],
      visual: {
        modelId: 'new_npc_model',
        texture: 'new_npc_texture',
        animation: 'new_npc_idle'
      }
    },
    skills: ['Character Design', 'Dialogue Writing', 'JSON', 'Game Balance'],
    files: ['npc_tables_mythic.json', 'npc_dialogue_trees_fae.json'],
    validation: 'npm run validate:orchestration'
  },
  location: {
    name: 'New Location Design',
    description: 'Create a new explorable area with environmental effects',
    template: {
      locationId: 'new_location_id',
      name: 'New Location Name',
      type: 'quest_location',
      zone: 'grove_inner',
      description: 'Description of the new location',
      environment: { biome: 'enchanted_forest', weather: 'ethereal_mist' },
      visual: {
        modelId: 'new_location_scene',
        textures: ['new_texture_1', 'new_texture_2'],
        effects: ['ethereal_glow', 'ancient_magic_aura']
      },
      npcs: ['new_npc_id'],
      quests: ['new_quest_id'],
      connections: ['grove_center']
    },
    skills: ['Level Design', 'Environmental Design', 'JSON', 'Game Balance'],
    files: ['location_registry.json', 'orchestration.json'],
    validation: 'npm run validate:orchestration'
  },
  asset: {
    name: 'Asset Creation',
    description: 'Create visual, audio, or lore assets for the scenario',
    template: {
      assetId: 'new_asset_id',
      type: 'visual_asset',
      category: 'item_icon',
      description: 'Description of the new asset',
      specifications: {
        dimensions: { width: 64, height: 64 },
        format: 'png',
        style: 'mystical_fae',
        colors: ['#8B4513', '#DAA520', '#FFD700']
      },
      usage: ['new_quest_id', 'new_npc_id'],
      filePath: 'assets/new_asset.png'
    },
    skills: ['Art/Design', 'Audio Production', 'Asset Integration', 'File Management'],
    files: ['visual_manifest.json', 'asset_todo.json'],
    validation: 'npm run validate:assets'
  },
  mechanic: {
    name: 'New Game Mechanic',
    description: 'Implement a new gameplay system or mechanic',
    template: {
      mechanicId: 'new_mechanic_id',
      name: 'New Mechanic Name',
      description: 'Description of the new mechanic',
      type: 'combat_system',
      implementation: {
        method: 'drop_only_patch',
        file: 'new_mechanic.json',
        integration: ['orchestration.json', 'quest_pack_fae.json']
      },
      effects: ['damage_modifier', 'status_effect'],
      requirements: ['player_level_10', 'quest_completion']
    },
    skills: ['Game Design', 'System Design', 'JSON', 'Game Balance'],
    files: ['orchestration.json', 'new_mechanic.json'],
    validation: 'npm run validate:orchestration'
  },
  story: {
    name: 'Story Expansion',
    description: 'Expand the narrative and lore of the scenario',
    template: {
      storyId: 'new_story_id',
      title: 'New Story Title',
      description: 'Description of the new story element',
      type: 'lore_expansion',
      content: {
        background: 'Historical background of the new story',
        characters: ['new_npc_id', 'existing_npc_id'],
        locations: ['new_location_id', 'existing_location_id'],
        quests: ['new_quest_id'],
        items: ['new_item_id']
      },
      integration: {
        existingLore: ['grove_guardian', 'ancient_spirit'],
        newElements: ['new_artifact', 'new_legend'],
        continuity: 'Maintains existing story coherence'
      }
    },
    skills: ['Creative Writing', 'Storytelling', 'World Building', 'Lore Integration'],
    files: ['lore_expansion.json', 'orchestration.json'],
    validation: 'npm run validate:orchestration'
  }
};

// Logging functions
function log(message, type = 'info') {
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    challenge: '🎯',
    template: '📋',
    skill: '🛠️'
  }[type] || 'ℹ️';
  
  console.log(`${emoji} ${message}`);
}

function generateChallenge(challengeType, difficulty = 'intermediate') {
  const template = CHALLENGE_TEMPLATES[challengeType];
  
  if (!template) {
    log(`❌ Unknown challenge type: ${challengeType}`, 'error');
    return null;
  }
  
  const challenge = {
    id: `${challengeType}_${Date.now()}`,
    type: challengeType,
    name: template.name,
    description: template.description,
    difficulty: difficulty,
    skills: template.skills,
    template: template.template,
    files: template.files,
    validation: template.validation,
    timestamp: new Date().toISOString(),
    framework: REMIX_CONFIG.frameworkName,
    version: REMIX_CONFIG.frameworkVersion
  };
  
  return challenge;
}

function displayChallenge(challenge) {
  log('', 'info');
  log(`🎯 Remix Challenge: ${challenge.name}`, 'challenge');
  log('='.repeat(challenge.name.length + 20), 'info');
  log(`📝 Description: ${challenge.description}`, 'info');
  log(`⚡ Difficulty: ${challenge.difficulty}`, 'info');
  log(`🛠️  Skills Required: ${challenge.skills.join(', ')}`, 'info');
  log(`📁 Files to Modify: ${challenge.files.join(', ')}`, 'info');
  log(`🧪 Validation Command: ${challenge.validation}`, 'info');
  
  log('', 'info');
  log('📋 Template Structure:', 'template');
  log(JSON.stringify(challenge.template, null, 2), 'info');
}

function generateChallengeFile(challenge) {
  const fileName = `remix_challenge_${challenge.type}_${challenge.difficulty}.json`;
  const filePath = path.resolve(process.cwd(), fileName);
  
  fs.writeFileSync(filePath, JSON.stringify(challenge, null, 2), 'utf8');
  
  log(`💾 Challenge saved to: ${filePath}`, 'success');
  return filePath;
}

function listAvailableChallenges() {
  log('📋 Available Remix Challenge Types:', 'info');
  log('====================================', 'info');
  
  Object.entries(CHALLENGE_TEMPLATES).forEach(([type, template]) => {
    log(`🎯 ${type}: ${template.name}`, 'challenge');
    log(`   ${template.description}`, 'info');
    log(`   Skills: ${template.skills.join(', ')}`, 'skill');
    log('', 'info');
  });
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    log('🌿 MIFF Framework Remix Challenge Generator', 'info');
    log('============================================', 'info');
    log('', 'info');
    log('Usage:', 'info');
    log('  node remix-challenge.js [challenge-type] [difficulty]', 'command');
    log('', 'info');
    log('Examples:', 'info');
    log('  node remix-challenge.js quest beginner', 'command');
    log('  node remix-challenge.js npc advanced', 'command');
    log('  node remix-challenge.js location intermediate', 'command');
    log('', 'info');
    
    listAvailableChallenges();
    return;
  }
  
  const challengeType = args[0];
  const difficulty = args[1] || 'intermediate';
  
  if (!CHALLENGE_TEMPLATES[challengeType]) {
    log(`❌ Invalid challenge type: ${challengeType}`, 'error');
    log('', 'info');
    listAvailableChallenges();
    return;
  }
  
  if (!REMIX_CONFIG.difficultyLevels.includes(difficulty)) {
    log(`❌ Invalid difficulty level: ${difficulty}`, 'error');
    log(`Valid levels: ${REMIX_CONFIG.difficultyLevels.join(', ')}`, 'info');
    return;
  }
  
  log('🎯 Generating Remix Challenge...', 'challenge');
  log(`Type: ${challengeType}`, 'info');
  log(`Difficulty: ${difficulty}`, 'info');
  
  const challenge = generateChallenge(challengeType, difficulty);
  
  if (challenge) {
    displayChallenge(challenge);
    const filePath = generateChallengeFile(challenge);
    
    log('', 'info');
    log('🎉 Challenge Generated Successfully!', 'success');
    log('====================================', 'success');
    log(`📁 File: ${filePath}`, 'info');
    log(`🎯 Type: ${challenge.type}`, 'info');
    log(`⚡ Difficulty: ${challenge.difficulty}`, 'info');
    log(`🛠️  Skills: ${challenge.skills.join(', ')}`, 'info');
    
    log('', 'info');
    log('🚀 Next Steps:', 'info');
    log('1. Review the challenge template', 'info');
    log('2. Modify the template to fit your vision', 'info');
    log('3. Test your changes with validation scripts', 'info');
    log('4. Submit your remix as a pull request', 'info');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for modular use
module.exports = {
  REMIX_CONFIG,
  CHALLENGE_TEMPLATES,
  generateChallenge,
  displayChallenge,
  generateChallengeFile,
  listAvailableChallenges
};