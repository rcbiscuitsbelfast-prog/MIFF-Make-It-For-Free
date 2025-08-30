#!/usr/bin/env node

/**
 * Contributor Onboarding Script
 * Purpose: Help onboard new contributors to the MIFF framework
 * Version: 1.0.0
 * Author: MIFF Framework
 * License: MIT
 * RemixSafe: true
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ONBOARDING_CONFIG = {
  frameworkName: 'MIFF: Make It For Free',
  frameworkVersion: 'v14',
  remixSafe: true,
  aiNative: true,
  multiAgent: true,
  scenarios: ['spirit-tamer-trial-of-grove'],
  logLevel: 'info'
};

// Onboarding content
const ONBOARDING_CONTENT = {
  welcome: {
    title: '🌿 Welcome to MIFF Framework!',
    description: 'A remix-safe, AI-native game ecosystem for creating modular RPG scenarios',
    keyFeatures: [
      '🔧 Modular Architecture - Drop-only patching system',
      '🔄 Remix-Safe - Community-driven modifications',
      '🤖 AI-Native - Built for multi-agent playtesting',
      '🎮 RPG Scenarios - Complete game experiences',
      '🌱 Contributor-Friendly - Easy to extend and modify'
    ]
  },
  gettingStarted: {
    title: '🚀 Getting Started',
    steps: [
      '1. 📁 Explore the codebase structure',
      '2. 🎯 Choose a scenario to work on',
      '3. 🔧 Make modifications using drop-only patches',
      '4. 🧪 Test your changes with the validation scripts',
      '5. 📤 Submit a pull request with your improvements'
    ]
  },
  projectStructure: {
    title: '📁 Project Structure',
    directories: [
      'scenarios/ - Core scenario modules and registry',
      'SpiritTamerDemoPure/ - Complete RPG scenario example',
      'scripts/ - Validation and utility scripts',
      '.github/workflows/ - CI/CD configuration',
      'fixtures/ - Game content and assets'
    ]
  },
  remixChallenges: {
    title: '🎯 Remix Challenges',
    challenges: [
      {
        name: 'Spirit Tamer: New Quest Line',
        description: 'Add a new quest to the existing scenario',
        difficulty: 'Beginner',
        skills: ['JSON', 'Quest Design', 'Storytelling']
      },
      {
        name: 'New NPC Creation',
        description: 'Create a new character with dialogue and quests',
        difficulty: 'Intermediate',
        skills: ['Character Design', 'Dialogue Writing', 'JSON']
      },
      {
        name: 'Location Expansion',
        description: 'Add new areas to explore in the grove',
        difficulty: 'Intermediate',
        skills: ['Level Design', 'JSON', 'Game Balance']
      },
      {
        name: 'Asset Creation',
        description: 'Create visual or audio assets for the scenario',
        difficulty: 'Advanced',
        skills: ['Art/Design', 'Audio Production', 'Asset Integration']
      }
    ]
  },
  contributionGuidelines: {
    title: '📋 Contribution Guidelines',
    guidelines: [
      '🎨 Maintain the mystical, fae theme of the scenario',
      '🔒 Use drop-only patches - never modify core files directly',
      '🧪 Test your changes with the validation scripts',
      '📝 Document your additions clearly',
      '🔄 Ensure remix safety and modularity',
      '🤝 Follow the existing code style and patterns'
    ]
  },
  usefulCommands: {
    title: '🛠️ Useful Commands',
    commands: [
      'npm run validate:orchestration - Validate scenario files',
      'npm run validate:ci - Check CI configuration',
      'npm run start:grove - Run the Spirit Tamer scenario',
      'npm run test:spirit-tamer - Test the scenario',
      'npm run scenario:load - Load scenario modules',
      'npm run recover:workflow - Fix CI issues'
    ]
  },
  nextSteps: {
    title: '🌱 Next Steps',
    actions: [
      '📚 Read the README.md files in each directory',
      '🎮 Play through the Spirit Tamer scenario',
      '🔍 Examine the orchestration.json structure',
      '💡 Choose a remix challenge to tackle',
      '🤝 Join the community discussions',
      '📤 Make your first contribution!'
    ]
  }
};

// Logging functions
function log(message, type = 'info') {
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    welcome: '🌿',
    step: '📋',
    command: '🛠️'
  }[type] || 'ℹ️';
  
  console.log(`${emoji} ${message}`);
}

function displaySection(section) {
  log('', 'info');
  log(`📋 ${section.title}`, 'step');
  log('='.repeat(section.title.length + 4), 'info');
  
  if (section.description) {
    log(section.description, 'info');
    log('', 'info');
  }
  
  if (section.steps) {
    section.steps.forEach(step => log(step, 'info'));
  }
  
  if (section.directories) {
    section.directories.forEach(dir => log(dir, 'info'));
  }
  
  if (section.challenges) {
    section.challenges.forEach(challenge => {
      log(`🎯 ${challenge.name}`, 'info');
      log(`   ${challenge.description}`, 'info');
      log(`   Difficulty: ${challenge.difficulty} | Skills: ${challenge.skills.join(', ')}`, 'info');
      log('', 'info');
    });
  }
  
  if (section.guidelines) {
    section.guidelines.forEach(guideline => log(guideline, 'info'));
  }
  
  if (section.commands) {
    section.commands.forEach(command => log(command, 'command'));
  }
  
  if (section.actions) {
    section.actions.forEach(action => log(action, 'info'));
  }
}

function generateOnboardingFile() {
  const onboardingContent = {
    timestamp: new Date().toISOString(),
    framework: ONBOARDING_CONFIG,
    content: ONBOARDING_CONTENT
  };
  
  const filePath = path.resolve(process.cwd(), 'contributor_onboarding.json');
  fs.writeFileSync(filePath, JSON.stringify(onboardingContent, null, 2), 'utf8');
  
  log(`💾 Onboarding guide saved to: ${filePath}`, 'success');
  return filePath;
}

function checkProjectHealth() {
  log('🔍 Checking project health...', 'info');
  
  const checks = {
    packageJson: fs.existsSync('package.json'),
    scenarios: fs.existsSync('scenarios'),
    spiritTamer: fs.existsSync('SpiritTamerDemoPure'),
    scripts: fs.existsSync('scripts'),
    workflows: fs.existsSync('.github/workflows'),
    readme: fs.existsSync('README.md')
  };
  
  let healthyChecks = 0;
  const totalChecks = Object.keys(checks).length;
  
  for (const [check, exists] of Object.entries(checks)) {
    if (exists) {
      log(`✅ ${check}: Found`, 'success');
      healthyChecks++;
    } else {
      log(`❌ ${check}: Missing`, 'error');
    }
  }
  
  const healthPercentage = Math.round((healthyChecks / totalChecks) * 100);
  log(`🏥 Project Health: ${healthPercentage}% (${healthyChecks}/${totalChecks})`, healthPercentage > 80 ? 'success' : 'warning');
  
  return { checks, healthPercentage };
}

function main() {
  log('🌿 Welcome to MIFF Framework Contributor Onboarding!', 'welcome');
  log('====================================================', 'welcome');
  
  // Check project health
  const projectHealth = checkProjectHealth();
  
  // Display onboarding content
  Object.values(ONBOARDING_CONTENT).forEach(section => {
    displaySection(section);
  });
  
  // Generate onboarding file
  const onboardingFile = generateOnboardingFile();
  
  // Final summary
  log('', 'info');
  log('🎉 Onboarding Complete!', 'success');
  log('======================', 'success');
  log(`📁 Project Health: ${projectHealth.healthPercentage}%`, projectHealth.healthPercentage > 80 ? 'success' : 'warning');
  log(`💾 Onboarding Guide: ${onboardingFile}`, 'info');
  log(`🌿 Framework: ${ONBOARDING_CONFIG.frameworkName} v${ONBOARDING_CONFIG.frameworkVersion}`, 'info');
  log(`🔒 Remix Safe: ${ONBOARDING_CONFIG.remixSafe ? 'Yes' : 'No'}`, 'info');
  log(`🤖 AI Native: ${ONBOARDING_CONFIG.aiNative ? 'Yes' : 'No'}`, 'info');
  log(`👥 Multi Agent: ${ONBOARDING_CONFIG.multiAgent ? 'Yes' : 'No'}`, 'info');
  
  log('', 'info');
  log('🚀 Ready to contribute to the MIFF ecosystem!', 'success');
  log('💡 Start with a remix challenge or explore the existing scenarios.', 'info');
  log('🤝 The community is here to help you succeed!', 'info');
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for modular use
module.exports = {
  ONBOARDING_CONFIG,
  ONBOARDING_CONTENT,
  displaySection,
  generateOnboardingFile,
  checkProjectHealth
};