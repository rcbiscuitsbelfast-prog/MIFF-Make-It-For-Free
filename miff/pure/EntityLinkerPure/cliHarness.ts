#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { StructuredLogger } from '../shared/logging/StructuredLogger';
import { 
  EntityLinkerManager, 
  ExternalRefMaps, 
  LinkInput, 
  LinkIssue, 
  ValidationResult,
  LinkerStats 
} from './Manager';

type Cmd =
  | { op: 'resolveRefs'; input?: LinkInput }
  | { op: 'dumpLinks' }
  | { op: 'validate'; input?: LinkInput }
  | { op: 'getStats' }
  | { op: 'reset' }
  | { op: 'export'; format?: 'json' | 'csv' | 'markdown' }
  | { op: 'demo' };

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const mgr = new EntityLinkerManager();

  // Load external references if provided
  const externFile = args[1];
  if (externFile && fs.existsSync(externFile)) {
    try {
      const extern = SafeJSONParser.parse(fs.readFileSync(path.resolve(externFile), 'utf-8')) as ExternalRefMaps;
      mgr.inject(extern);
    } catch (error) {
      console.error('Error loading external references:', error);
      process.exit(1);
    }
  }

  let result: any = { op: command, status: 'ok', result: null };

  try {
    switch (command) {
      case 'resolveRefs':
        const inputFile = args[1];
        let input: LinkInput = {};
        
        if (inputFile && fs.existsSync(inputFile)) {
          try {
            // Use safe path resolution and JSON parsing
            const { SafePathUtils } = require('../shared/security/SafePathUtils');
            const { SafeJSONParser } = require('../shared/security/SafeJSONParser');
            
            const pathResult = SafePathUtils.safeReadFile(inputFile, process.cwd());
            if (!pathResult.success) {
              throw new Error(`Error reading input file: ${pathResult.error}`);
            }
            
            const jsonResult = SafeJSONParser.parse(pathResult.data!);
            if (!jsonResult.success) {
              throw new Error(`Error parsing JSON: ${jsonResult.error}`);
            }
            
            input = jsonResult.data as LinkInput;
          } catch (error) {
            result.status = 'error';
            result.result = { error: 'Invalid input file format' };
            break;
          }
        }
        
        result.result = mgr.resolve(input);
        break;

      case 'dumpLinks':
        result.result = mgr.dumpLinks();
        break;

      case 'validate':
        const validateInputFile = args[1];
        let validateInput: LinkInput = {};
        
        if (validateInputFile && fs.existsSync(validateInputFile)) {
          try {
            validateInput = SafeJSONParser.parse(fs.readFileSync(path.resolve(validateInputFile), 'utf-8')) as LinkInput;
          } catch (error) {
            result.status = 'error';
            result.result = { error: 'Invalid input file format' };
            break;
          }
        }
        
        result.result = mgr.validate(validateInput);
        break;

      case 'getStats':
        result.result = mgr.getStats();
        break;

      case 'reset':
        mgr.reset();
        result.result = { message: 'EntityLinkerManager reset successfully' };
        break;

      case 'export':
        const format = (args[1] as 'json' | 'csv' | 'markdown') || 'json';
        result.result = { data: mgr.exportLinks(format), format };
        break;

      case 'demo':
        result.result = runDemo(mgr);
        break;

      case 'help':
        result.result = {
          usage: 'EntityLinkerPure CLI Harness',
          commands: [
            'resolveRefs [inputFile] - Resolve entity references',
            'dumpLinks - Dump current link status',
            'validate [inputFile] - Validate entity links',
            'getStats - Get linker statistics',
            'reset - Reset linker state',
            'export [format] - Export links (json|csv|markdown)',
            'demo - Run demonstration scenarios',
            'help - Show this help'
          ],
          examples: [
            'node cliHarness.ts resolveRefs sample_links.json',
            'node cliHarness.ts validate sample_links.json',
            'node cliHarness.ts export csv',
            'node cliHarness.ts demo'
          ]
        };
        break;

      default:
        result.status = 'error';
        result.result = { error: `Unknown command: ${command}` };
    }
  } catch (error) {
    result.status = 'error';
    result.result = { error: error instanceof Error ? error.message : 'Unknown error' };
  }

  console.info(JSON.stringify(result, null, 2));
}

function runDemo(mgr: EntityLinkerManager): any {
  // Demo external references
  const externRefs: ExternalRefMaps = {
    quests: { 'main_quest_1': true, 'side_quest_1': true, 'tutorial_quest': true },
    items: { 'sword_001': true, 'potion_001': true, 'key_001': true },
    zones: { 'town_center': true, 'forest_entrance': true, 'dungeon_level_1': true },
    npcs: { 'merchant_001': true, 'guard_001': true, 'quest_giver_001': true },
    skills: { 'sword_mastery': true, 'magic_bolt': true, 'healing': true },
    achievements: { 'first_kill': true, 'explorer': true, 'collector': true },
    events: { 'combat_start': true, 'level_up': true, 'item_found': true }
  };

  mgr.inject(externRefs);

  // Demo input with various reference types
  const demoInput: LinkInput = {
    npcs: [
      { id: 'npc_001', quest: 'main_quest_1', dialog: 'merchant_001', skill: 'sword_mastery' },
      { id: 'npc_002', quest: 'missing_quest', dialog: 'missing_npc' }
    ],
    equipment: [
      { id: 'equip_001', itemId: 'sword_001', enchantment: 'fire_enchant' },
      { id: 'equip_002', itemId: 'missing_item' }
    ],
    placements: [
      { id: 'place_001', zoneId: 'town_center', npcId: 'merchant_001' },
      { id: 'place_002', zoneId: 'missing_zone' }
    ],
    skills: [
      { id: 'skill_001', prerequisite: 'sword_mastery', unlockCondition: 'first_kill' },
      { id: 'skill_002', prerequisite: 'missing_skill' }
    ],
    achievements: [
      { id: 'ach_001', requirement: 'first_kill', reward: 'sword_001' },
      { id: 'ach_002', requirement: 'missing_requirement' }
    ],
    events: [
      { id: 'event_001', trigger: 'combat_start', target: 'npc_001' },
      { id: 'event_002', trigger: 'missing_trigger', target: 'missing_target' }
    ]
  };

  // Run resolution
  const resolveResult = mgr.resolve(demoInput);
  
  // Run validation
  const validationResult = mgr.validate(demoInput);
  
  // Get statistics
  const stats = mgr.getStats();

  return {
    message: 'EntityLinkerPure Demo completed',
    scenarios: [
      'NPC references (quests, dialogs, skills)',
      'Equipment references (items, enchantments)',
      'Placement references (zones, NPCs)',
      'Skill references (prerequisites, unlock conditions)',
      'Achievement references (requirements, rewards)',
      'Event references (triggers, targets)'
    ],
    resolveResult,
    validationResult,
    stats,
    exportFormats: {
      json: mgr.exportLinks('json'),
      csv: mgr.exportLinks('csv'),
      markdown: mgr.exportLinks('markdown')
    }
  };
}

if (import.meta.url === `file://${process.argv[1]}`) main();