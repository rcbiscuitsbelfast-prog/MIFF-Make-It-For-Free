#!/usr/bin/env node

/**
 * dialogue.ts - CLI commands for DialoguePure module
 * 
 * Provides commands for validating, testing, and running dialogue trees.
 */

import { Command } from 'commander';
import { createDialogueEngine, DialogueTree, DialogueNode } from '../../src/modules/DialoguePure/DialoguePure';

const program = new Command();

program
  .name('dialogue')
  .description('Dialogue and narrative system commands for MIFF games')
  .version('1.0.0');

program
  .command('validate')
  .description('Validate dialogue tree structure and connections')
  .option('-f, --file <path>', 'Path to dialogue tree JSON file')
  .option('-t, --tree <json>', 'Dialogue tree JSON string')
  .action(async (options) => {
    console.log('📖 Validating DialoguePure tree...');

    let treeData: string;
    
    if (options.file) {
      const fs = require('fs');
      treeData = fs.readFileSync(options.file, 'utf8');
    } else if (options.tree) {
      treeData = options.tree;
    } else {
      // Use sample tree for validation
      treeData = JSON.stringify(createSampleTree());
    }

    try {
      const engine = createDialogueEngine(treeData);
      console.log('✅ Dialogue tree loaded successfully');

      // Validate tree structure
      const tree = engine['tree'];
      console.log(`Tree ID: ${tree.id}`);
      console.log(`Tree Name: ${tree.name}`);
      console.log(`Version: ${tree.version}`);
      console.log(`Nodes: ${tree.nodes.size}`);
      console.log(`Variables: ${tree.variables.size}`);
      console.log(`Flags: ${tree.flags.size}`);

      // Check for required nodes
      const requiredNodes = ['start', 'end'];
      for (const nodeId of requiredNodes) {
        if (tree.nodes.has(nodeId)) {
          console.log(`✅ Required node found: ${nodeId}`);
        } else {
          console.log(`❌ Missing required node: ${nodeId}`);
        }
      }

      // Validate node connections
      let validConnections = 0;
      let invalidConnections = 0;

      for (const [nodeId, node] of tree.nodes) {
        if (node.next) {
          if (Array.isArray(node.next)) {
            // Branch node
            for (const nextId of node.next) {
              if (tree.nodes.has(nextId)) {
                validConnections++;
              } else {
                console.log(`❌ Invalid connection from ${nodeId} to ${nextId}`);
                invalidConnections++;
              }
            }
          } else {
            // Single next node
            if (tree.nodes.has(node.next)) {
              validConnections++;
            } else {
              console.log(`❌ Invalid connection from ${nodeId} to ${node.next}`);
              invalidConnections++;
            }
          }
        }
      }

      console.log(`\nConnection Validation:`);
      console.log(`✅ Valid connections: ${validConnections}`);
      console.log(`❌ Invalid connections: ${invalidConnections}`);

      if (invalidConnections === 0) {
        console.log('🎉 All connections are valid!');
      }

    } catch (error) {
      console.error('❌ Validation failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('test')
  .description('Test dialogue tree execution and flow')
  .option('-f, --file <path>', 'Path to dialogue tree JSON file')
  .option('-t, --tree <json>', 'Dialogue tree JSON string')
  .option('-p, --path <choices>', 'Comma-separated choice IDs to test specific path')
  .action(async (options) => {
    console.log('🧪 Testing DialoguePure execution...');

    let treeData: string;
    
    if (options.file) {
      const fs = require('fs');
      treeData = fs.readFileSync(options.file, 'utf8');
    } else if (options.tree) {
      treeData = options.tree;
    } else {
      treeData = JSON.stringify(createSampleTree());
    }

    const engine = createDialogueEngine(treeData);
    
    // Start dialogue
    let result = engine.start();
    if (!result) {
      console.error('❌ Failed to start dialogue');
      return;
    }

    console.log(`\n🎭 Starting dialogue: ${result.node.content}`);
    
    let step = 1;
    const maxSteps = 20; // Prevent infinite loops

    while (result && !result.isEnd && step <= maxSteps) {
      if (result.node.type === 'choice' && result.choices) {
        console.log(`\n📋 Step ${step}: Choices available:`);
        result.choices.forEach((choice, index) => {
          console.log(`  ${index + 1}. ${choice.text}`);
        });

        let choiceId: string;
        if (options.path) {
          const pathChoices = options.path.split(',');
          const choiceIndex = step - 1;
          if (choiceIndex < pathChoices.length) {
            choiceId = pathChoices[choiceIndex];
            console.log(`\n🤖 Auto-selecting: ${choiceId}`);
          } else {
            choiceId = result.choices[0].id; // Default to first choice
            console.log(`\n🤖 Auto-selecting: ${choiceId} (default)`);
          }
        } else {
          choiceId = result.choices[0].id; // Default to first choice
          console.log(`\n🤖 Auto-selecting: ${choiceId}`);
        }

        result = engine.selectChoice(choiceId);
      } else {
        console.log(`\n📝 Step ${step}: ${result.node.content}`);
        result = engine.continue();
      }

      step++;
    }

    if (result && result.isEnd) {
      console.log(`\n🏁 Dialogue ended: ${result.node.content}`);
    } else if (step > maxSteps) {
      console.log('\n⚠️  Dialogue test stopped (max steps reached)');
    }

    // Show final context
    const context = engine.getContext();
    console.log('\n📊 Final Context:');
    console.log(`Variables: ${context.variables.size}`);
    console.log(`Flags: ${context.flags.size}`);
    console.log(`Inventory: ${context.inventory.size}`);
    console.log(`Quests: ${context.quests.size}`);
    console.log(`History: ${context.history.length} entries`);

    if (context.flags.size > 0) {
      console.log('Active flags:', Array.from(context.flags));
    }
    if (context.inventory.size > 0) {
      console.log('Inventory items:', Array.from(context.inventory));
    }
    if (context.quests.size > 0) {
      console.log('Active quests:', Array.from(context.quests.keys()));
    }

    console.log('\n✅ Dialogue test completed');
  });

program
  .command('run')
  .description('Run interactive dialogue session')
  .option('-f, --file <path>', 'Path to dialogue tree JSON file')
  .option('-t, --tree <json>', 'Dialogue tree JSON string')
  .action(async (options) => {
    console.log('🎮 Starting interactive dialogue session...');

    let treeData: string;
    
    if (options.file) {
      const fs = require('fs');
      treeData = fs.readFileSync(options.file, 'utf8');
    } else if (options.tree) {
      treeData = options.tree;
    } else {
      treeData = JSON.stringify(createSampleTree());
    }

    const engine = createDialogueEngine(treeData);
    const readline = require('readline');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query: string): Promise<string> => {
      return new Promise(resolve => rl.question(query, resolve));
    };

    try {
      let result = engine.start();
      if (!result) {
        console.error('❌ Failed to start dialogue');
        return;
      }

      console.log(`\n🎭 ${result.node.content}`);
      
      while (result && !result.isEnd) {
        if (result.node.type === 'choice' && result.choices) {
          console.log('\n📋 Your choices:');
          result.choices.forEach((choice, index) => {
            console.log(`  ${index + 1}. ${choice.text}`);
          });

          const answer = await question('\nEnter your choice (number): ');
          const choiceIndex = parseInt(answer) - 1;
          
          if (choiceIndex >= 0 && choiceIndex < result.choices.length) {
            const choice = result.choices[choiceIndex];
            result = engine.selectChoice(choice.id);
            console.log(`\n🎭 ${result?.node.content || 'Dialogue ended'}`);
          } else {
            console.log('❌ Invalid choice, please try again');
          }
        } else {
          const answer = await question('\nPress Enter to continue...');
          result = engine.continue();
          if (result) {
            console.log(`\n🎭 ${result.node.content}`);
          }
        }
      }

      if (result && result.isEnd) {
        console.log(`\n🏁 ${result.node.content}`);
      }

      // Show final state
      const context = engine.getContext();
      console.log('\n📊 Session Summary:');
      console.log(`Flags set: ${Array.from(context.flags).join(', ') || 'None'}`);
      console.log(`Items collected: ${Array.from(context.inventory).join(', ') || 'None'}`);
      console.log(`Quests active: ${Array.from(context.quests.keys()).join(', ') || 'None'}`);

    } finally {
      rl.close();
    }
  });

function createSampleTree(): DialogueTree {
  const nodes = new Map<string, DialogueNode>();
  
  nodes.set('start', {
    id: 'start',
    type: 'text',
    content: 'Welcome to the village! How can I help you today?',
    next: 'main_choice'
  });

  nodes.set('main_choice', {
    id: 'main_choice',
    type: 'choice',
    content: 'What would you like to do?',
    choices: [
      {
        id: 'shop',
        text: 'I want to buy something.',
        next: 'shop_dialogue'
      },
      {
        id: 'quest',
        text: 'I\'m looking for work.',
        next: 'quest_offer'
      },
      {
        id: 'gossip',
        text: 'Tell me about the village.',
        next: 'gossip_dialogue'
      }
    ]
  });

  nodes.set('shop_dialogue', {
    id: 'shop_dialogue',
    type: 'text',
    content: 'I have some basic supplies. What do you need?',
    actions: [
      {
        type: 'set_flag',
        target: 'shop_visited',
        value: true
      }
    ],
    next: 'end'
  });

  nodes.set('quest_offer', {
    id: 'quest_offer',
    type: 'text',
    content: 'We have a problem with wolves in the forest. Can you help?',
    actions: [
      {
        type: 'start_quest',
        target: 'wolf_hunt'
      }
    ],
    next: 'quest_choice'
  });

  nodes.set('quest_choice', {
    id: 'quest_choice',
    type: 'choice',
    content: 'Will you accept this quest?',
    choices: [
      {
        id: 'accept',
        text: 'I\'ll help you with the wolves.',
        next: 'quest_accepted'
      },
      {
        id: 'decline',
        text: 'Sorry, I\'m not interested.',
        next: 'quest_declined'
      }
    ]
  });

  nodes.set('quest_accepted', {
    id: 'quest_accepted',
    type: 'text',
    content: 'Thank you! Here\'s a map to the forest.',
    actions: [
      {
        type: 'add_item',
        target: 'forest_map'
      }
    ],
    next: 'end'
  });

  nodes.set('quest_declined', {
    id: 'quest_declined',
    type: 'text',
    content: 'I understand. Maybe another time.',
    next: 'end'
  });

  nodes.set('gossip_dialogue', {
    id: 'gossip_dialogue',
    type: 'text',
    content: 'This village has been here for generations. We\'re a peaceful people.',
    next: 'end'
  });

  nodes.set('end', {
    id: 'end',
    type: 'end',
    content: 'Thank you for visiting! Come back anytime.'
  });

  return {
    id: 'village_sample',
    name: 'Village Sample Dialogue',
    version: '1.0.0',
    nodes,
    variables: new Map([['player_name', 'Traveler']]),
    flags: new Set(['quests_available'])
  };
}

export default program;