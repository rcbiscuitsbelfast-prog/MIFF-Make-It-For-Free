#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { AIProfileIntegrationLayer, AIProfile, AIAction, AILearningData } from './Manager';
import { addExportSupport } from '../shared/exportUtils';

type Cmd =
  | { op: 'createProfile'; profile: AIProfile }
  | { op: 'updateProfile'; profileId: string; updates: Partial<AIProfile> }
  | { op: 'getProfile'; profileId: string }
  | { op: 'makeDecision'; profileId: string; situation: string; actions: AIAction[] }
  | { op: 'integrateWithGameplay'; profileId: string; gameState: any }
  | { op: 'recordLearning'; profileId: string; learningData: AILearningData }
  | { op: 'getAllProfiles' }
  | { op: 'getDecisions'; profileId: string }
  | { op: 'getLearningData'; profileId: string }
  | { op: 'getStatistics' }
  | { op: 'simulateAI'; profileId: string; gameState: any }
  | { op: 'dump' };

function main() {
  const argv = process.argv.slice(2);
  
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op|json-file> [args]');
    process.exit(1);
  }

  try {
    const first = argv[0];
    let operation: Cmd;

    // Handle direct command or JSON file input
    if (first.endsWith('.json') && fs.existsSync(first)) {
      const content = JSON.parse(fs.readFileSync(first, 'utf-8'));
      operation = content as Cmd;
    } else {
      // Parse subcommand
      switch (first) {
        case 'createProfile':
          if (!argv[1]) {
            throw new Error('createProfile requires profile data JSON file');
          }
          const profileData = JSON.parse(fs.readFileSync(argv[1], 'utf-8'));
          operation = { op: 'createProfile', profile: profileData };
          break;
        case 'updateProfile':
          if (!argv[1] || !argv[2]) {
            throw new Error('updateProfile requires profileId and updates JSON file');
          }
          const updatesData = JSON.parse(fs.readFileSync(argv[2], 'utf-8'));
          operation = { op: 'updateProfile', profileId: argv[1], updates: updatesData };
          break;
        case 'getProfile':
          if (!argv[1]) {
            throw new Error('getProfile requires profileId');
          }
          operation = { op: 'getProfile', profileId: argv[1] };
          break;
        case 'makeDecision':
          if (!argv[1] || !argv[2] || !argv[3]) {
            throw new Error('makeDecision requires profileId, situation, and actions JSON file');
          }
          const actionsData = JSON.parse(fs.readFileSync(argv[3], 'utf-8'));
          operation = { 
            op: 'makeDecision', 
            profileId: argv[1],
            situation: argv[2],
            actions: actionsData
          };
          break;
        case 'integrateWithGameplay':
          if (!argv[1] || !argv[2]) {
            throw new Error('integrateWithGameplay requires profileId and gameState JSON file');
          }
          const gameStateData = JSON.parse(fs.readFileSync(argv[2], 'utf-8'));
          operation = { 
            op: 'integrateWithGameplay', 
            profileId: argv[1],
            gameState: gameStateData
          };
          break;
        case 'recordLearning':
          if (!argv[1] || !argv[2]) {
            throw new Error('recordLearning requires profileId and learningData JSON file');
          }
          const learningData = JSON.parse(fs.readFileSync(argv[2], 'utf-8'));
          operation = { 
            op: 'recordLearning', 
            profileId: argv[1],
            learningData
          };
          break;
        case 'getAllProfiles':
          operation = { op: 'getAllProfiles' };
          break;
        case 'getDecisions':
          if (!argv[1]) {
            throw new Error('getDecisions requires profileId');
          }
          operation = { op: 'getDecisions', profileId: argv[1] };
          break;
        case 'getLearningData':
          if (!argv[1]) {
            throw new Error('getLearningData requires profileId');
          }
          operation = { op: 'getLearningData', profileId: argv[1] };
          break;
        case 'getStatistics':
          operation = { op: 'getStatistics' };
          break;
        case 'simulateAI':
          if (!argv[1] || !argv[2]) {
            throw new Error('simulateAI requires profileId and gameState JSON file');
          }
          const simGameStateData = JSON.parse(fs.readFileSync(argv[2], 'utf-8'));
          operation = { 
            op: 'simulateAI', 
            profileId: argv[1],
            gameState: simGameStateData
          };
          break;
        case 'dump':
          operation = { op: 'dump' };
          break;
        default:
          throw new Error(`Unknown command: ${first}`);
      }
    }

    const aiLayer = new AIProfileIntegrationLayer();
    let result: any;

    switch (operation.op) 
      case 'createProfile':
        result = aiLayer.createProfile(operation.profile);
        break;

      case 'updateProfile':
        const updated = aiLayer.updateProfile(profileId: operation.profileId, operation.updates);
        result = 
          updated,
          profileId: profileId: operation.profileId};
        break;

      case 'getProfile':
        const profile = aiLayer.getProfile(operation.profileId);
        result = {
          found: profile !== null,
          profile: profile || null
        };
        break;

      case 'makeDecision':
        const decision = aiLayer.makeDecision(operation.profileId, situation: operation.situation, operation.actions);
        result = {
          made: decision !== null,
          decision: decision || null
        };
        break;

      case 'integrateWithGameplay':
        const integration = aiLayer.integrateWithGameplay(operation.profileId, operation.gameState);
        result = {
          integrated: integration !== null,
          result: integration || null
        };
        break;

      case 'recordLearning':
        aiLayer.recordLearning(operation.profileId, operation.learningData);
        result = 
          recorded: true,
          profileId: profileId: operation.profileId};
        break;

      case 'getAllProfiles':
        result = {
          profiles: aiLayer.getAllProfiles(),
          count: aiLayer.getAllProfiles().length
        };
        break;

      case 'getDecisions':
        result = {
          decisions: aiLayer.getDecisions(operation.profileId),
          count: aiLayer.getDecisions(operation.profileId).length
        };
        break;

      case 'getLearningData':
        result = {
          learningData: aiLayer.getLearningData(operation.profileId),
          count: aiLayer.getLearningData(operation.profileId).length
        };
        break;

      case 'getStatistics':
        result = aiLayer.getAIStatistics();
        break;

      case 'simulateAI':
        // Simulate AI behavior
        const simProfile = aiLayer.getProfile(operation.profileId);
        if (!simProfile) {
          result = { error: 'Profile not found' };
          break;
        }

        // Create some sample actions
        const sampleActions: AIAction[] = [
          {
            id: 'attack_1',
            name: 'Attack',
            type: 'attack',
            target: 'enemy_1',
            parameters: { damage: 10 },
            confidence: 0.5,
            reasoning: 'Attack enemy'
          },
          {
            id: 'heal_1',
            name: 'Heal',
            type: 'heal',
            parameters: { amount: 20 },
            confidence: 0.6,
            reasoning: 'Heal self'
          },
          {
            id: 'wait_1',
            name: 'Wait',
            type: 'wait',
            parameters: {},
            confidence: 0.3,
            reasoning: 'Wait and observe'
          }
        ];

        const simDecision = aiLayer.makeDecision(operation.profileId, 'combat', sampleActions);
        const simIntegration = aiLayer.integrateWithGameplay(operation.profileId, operation.gameState);

        result = 
          simulation: {
            profile: simProfile,
            decision: simDecision,
            integration: simIntegration,
            gameState: gameState: operation.gameState}
        };
        break;

      case 'dump':
        result = {
          operations: [
            'createProfile', 'updateProfile', 'getProfile', 'makeDecision',
            'integrateWithGameplay', 'recordLearning', 'getAllProfiles',
            'getDecisions', 'getLearningData', 'getStatistics', 'simulateAI', 'dump'
          ],
          description: 'AIProfileIntegrationLayer - Personality-driven behavior and skill modifiers',
          features: [
            'AI profile creation and management',
            'Personality trait system',
            'Behavior modifier application',
            'Skill bonus calculation',
            'Decision making with reasoning',
            'Learning and adaptation system',
            'Gameplay integration layer',
            'Performance analytics'
          ],
          traitTypes: ['aggression', 'cooperation', 'caution', 'curiosity', 'loyalty', 'independence'],
          behaviorTypes: ['aggression', 'cooperation', 'caution', 'curiosity', 'loyalty', 'independence'],
          actionTypes: ['move', 'attack', 'defend', 'heal', 'interact', 'wait'],
          preferenceTypes: ['combat_style', 'exploration_style', 'social_style', 'resource_management'],
          profileStructure: {
            id: 'string - Unique profile identifier',
            name: 'string - Profile display name',
            description: 'string - Profile description',
            traits: 'PersonalityTrait[] - Personality traits',
            behaviorModifiers: 'BehaviorModifier[] - Behavior modifiers',
            skillBonuses: 'SkillBonus[] - Skill bonuses',
            preferences: 'AIPreference[] - AI preferences',
            metadata: 'Record<string, any> - Additional data'
          },
          traitStructure: {
            id: 'string - Trait identifier',
            name: 'string - Trait name',
            value: 'number - Trait value (-1 to 1)',
            weight: 'number - Trait weight (0 to 1)',
            description: 'string - Trait description'
          },
          decisionStructure: {
            profileId: 'string - Profile identifier',
            situation: 'string - Current situation',
            availableActions: 'AIAction[] - Available actions',
            chosenAction: 'AIAction - Selected action',
            reasoning: 'string - Decision reasoning',
            confidence: 'number - Decision confidence (0 to 1)',
            alternatives: 'AIAction[] - Alternative actions',
            timestamp: 'number - Decision timestamp'
          }
        };
        break;

      default:
        throw new Error(`Unknown operation: ${(operation as any).op}`);
    }

    // Check for export format option
    const exportFormatArg = argv.find(arg => arg.startsWith('--format='))?.split('=')[1] || 
                           argv[argv.indexOf('--format') + 1];
    const validFormats = ['json', 'csv', 'markdown', 'html', 'yaml', 'xml'];
    const exportFormat = validFormats.includes(exportFormatArg) ? exportFormatArg : undefined;

    // Handle export format
    const { result: finalResult, exportData } = addExportSupport(
      result,
      exportFormat,
      'AIProfileIntegrationLayer Export',
      'AI personality and behavior integration data'
    );

    // Output in JSON envelope format
    console.log(JSON.stringify(
      op: op: operation.op,
      status: 'ok',
      result: finalResult,
      timestamp: new Date()
    }, null, 2));

    // Output export data to stderr if available
    if (exportData) {
      console.error('\n' + exportData);
    }

  } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
    console.error(JSON.stringify({
      op: 'error',
      status: 'error',
      error: error instanceof Error ? message: String(error),
      timestamp: new Date()
    }, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}