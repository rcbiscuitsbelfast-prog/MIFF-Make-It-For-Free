#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { 
  SkillTreeManager, 
  Skill, 
  SkillTree, 
  SkillProgress, 
  SkillTreeStats, 
  SkillTreeFilter 
} from './SkillTreeManager';

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const mgr = new SkillTreeManager();
  let result: any = { op: command, status: 'ok', result: null };

  try {
    switch (command) {
      case 'load':
        const skillsFile = args[1];
        if (skillsFile) {
          const candidates: string[] = [];
          const absGiven = path.isAbsolute(skillsFile) ? skillsFile : path.resolve(skillsFile);
          const cwdPath = path.isAbsolute(skillsFile) ? skillsFile : path.resolve(process.cwd(), skillsFile);
          const modulePath = path.isAbsolute(skillsFile)
            ? skillsFile
            : path.resolve(path.dirname(new URL(import.meta.url).pathname), skillsFile);
          candidates.push(absGiven);
          if (!candidates.includes(cwdPath)) candidates.push(cwdPath);
          if (!candidates.includes(modulePath)) candidates.push(modulePath);

          let fileToRead: string | undefined;
          for (const p of candidates) {
            try {
              if (fs.existsSync(p)) { fileToRead = p; break; }
            } catch {}
          }

          if (fileToRead) {
            const raw = JSON.parse(fs.readFileSync(fileToRead, 'utf-8')) as any;
            const skills: Skill[] = Array.isArray(raw) ? raw : (Array.isArray(raw?.skills) ? raw.skills : []);
            if (!Array.isArray(skills) || skills.length === 0) {
              result.status = 'error';
              result.result = { error: 'No skills found in file' };
              break;
            }
            mgr.load(skills);
            result.result = { message: `Loaded ${skills.length} skills` };
          } else {
            result.status = 'error';
            result.result = { error: `Skills file not found: ${skillsFile}` };
          }
        } else {
          result.status = 'error';
          result.result = { error: 'Skills file required' };
        }
        break;

      case 'createTree':
        const treeId = args[1] || 'default';
        const treeName = args[2] || 'Default Skill Tree';
        const treeDescription = args[3];
        const tree = mgr.createTree(treeId, treeName, treeDescription);
        result.result = tree;
        break;

      case 'getTree':
        const getTreeId = args[1];
        if (getTreeId) {
          const tree = mgr.getTree(getTreeId);
          result.result = tree || { error: 'Tree not found' };
        } else {
          result.status = 'error';
          result.result = { error: 'Tree ID required' };
        }
        break;

      case 'listTrees':
        result.result = mgr.listTrees();
        break;

      case 'list':
        result.result = mgr.list();
        break;

      case 'getUnlocked':
        result.result = mgr.getUnlocked();
        break;

      case 'get':
        const skillId = args[1];
        if (skillId) {
          const skill = mgr.get(skillId);
          result.result = skill || { error: 'Skill not found' };
        } else {
          result.status = 'error';
          result.result = { error: 'Skill ID required' };
        }
        break;

      case 'canUnlock':
        const canUnlockId = args[1];
        if (canUnlockId) {
          result.result = { canUnlock: mgr.canUnlock(canUnlockId) };
        } else {
          result.status = 'error';
          result.result = { error: 'Skill ID required' };
        }
        break;

      case 'unlock':
        const unlockId = args[1];
        if (unlockId) {
          const success = mgr.unlock(unlockId);
          result.result = { success, message: success ? 'Skill unlocked' : 'Cannot unlock skill' };
        } else {
          result.status = 'error';
          result.result = { error: 'Skill ID required' };
        }
        break;

      case 'lock':
        const lockId = args[1];
        if (lockId) {
          const success = mgr.lock(lockId);
          result.result = { success, message: success ? 'Skill locked' : 'Cannot lock skill' };
        } else {
          result.status = 'error';
          result.result = { error: 'Skill ID required' };
        }
        break;

      case 'levelUp':
        const levelUpId = args[1];
        if (levelUpId) {
          const success = mgr.levelUp(levelUpId);
          result.result = { success, message: success ? 'Skill leveled up' : 'Cannot level up skill' };
        } else {
          result.status = 'error';
          result.result = { error: 'Skill ID required' };
        }
        break;

      case 'addExperience':
        const expId = args[1];
        const expAmount = parseInt(args[2]) || 0;
        if (expId) {
          const success = mgr.addExperience(expId, expAmount);
          result.result = { success, message: success ? 'Experience added' : 'Cannot add experience' };
        } else {
          result.status = 'error';
          result.result = { error: 'Skill ID required' };
        }
        break;

      case 'useSkill':
        const useId = args[1];
        if (useId) {
          const success = mgr.useSkill(useId);
          result.result = { success, message: success ? 'Skill used' : 'Cannot use skill' };
        } else {
          result.status = 'error';
          result.result = { error: 'Skill ID required' };
        }
        break;

      case 'getProgress':
        const progressId = args[1];
        if (progressId) {
          const progress = mgr.getProgress(progressId);
          result.result = progress || { error: 'Progress not found' };
        } else {
          result.status = 'error';
          result.result = { error: 'Skill ID required' };
        }
        break;

      case 'getAllProgress':
        result.result = mgr.getAllProgress();
        break;

      case 'getStats':
        result.result = mgr.getStats();
        break;

      case 'listSkills':
        const filterFile = args[1];
        let filter: SkillTreeFilter | undefined;
        if (filterFile && fs.existsSync(filterFile)) {
          filter = JSON.parse(fs.readFileSync(path.resolve(filterFile), 'utf-8')) as SkillTreeFilter;
        }
        result.result = mgr.listSkills(filter);
        break;

      case 'export':
        const format = (args[1] as 'json' | 'csv' | 'markdown') || 'json';
        result.result = { data: mgr.exportSkills(format), format };
        break;

      case 'reset':
        mgr.reset();
        result.result = { message: 'SkillTreeManager reset successfully' };
        break;

      case 'demo':
        result.result = runDemo(mgr);
        break;

      case 'help':
        result.result = {
          usage: 'SkillTreePure CLI Harness',
          commands: [
            'load [skillsFile] - Load skills from file',
            'createTree [id] [name] [description] - Create a skill tree',
            'getTree [id] - Get skill tree by ID',
            'listTrees - List all skill trees',
            'list - List all skill IDs',
            'getUnlocked - List unlocked skill IDs',
            'get [id] - Get skill by ID',
            'canUnlock [id] - Check if skill can be unlocked',
            'unlock [id] - Unlock a skill',
            'lock [id] - Lock a skill',
            'levelUp [id] - Level up a skill',
            'addExperience [id] [amount] - Add experience to skill',
            'useSkill [id] - Use a skill',
            'getProgress [id] - Get skill progress',
            'getAllProgress - Get all skill progress',
            'getStats - Get skill tree statistics',
            'listSkills [filterFile] - List skills with optional filter',
            'export [format] - Export skills (json|csv|markdown)',
            'reset - Reset skill tree manager',
            'demo - Run demonstration scenarios',
            'help - Show this help'
          ],
          examples: [
            'node cliHarness.ts load sample_skills.json',
            'node cliHarness.ts unlock sword_mastery',
            'node cliHarness.ts export csv',
            'node cliHarness.ts demo'
          ]
        };
        break;

      default:
        result.status = 'error';
        result.result = { error: `Unknown command: ${command}` };
    }
  } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
    result.status = 'error';
    result.result = { error: error instanceof Error ? error.message : 'Unknown error' };
  }

  console.log(JSON.stringify(result, null, 2));
}

function runDemo(mgr: SkillTreeManager): any {
  // Demo skills
  const demoSkills: Skill[] = [
    {
      id: 'sword_mastery',
      name: 'Sword Mastery',
      description: 'Increases sword damage and accuracy',
      category: 'combat',
      cost: 100,
      level: 1,
      maxLevel: 5,
      effects: [
        { type: 'stat', target: 'damage', value: 10, description: '+10 damage' },
        { type: 'stat', target: 'accuracy', value: 5, description: '+5 accuracy' }
      ]
    },
    {
      id: 'magic_bolt',
      name: 'Magic Bolt',
      description: 'Basic magic attack spell',
      category: 'magic',
      cost: 150,
      level: 1,
      maxLevel: 3,
      prerequisites: ['sword_mastery'],
      effects: [
        { type: 'ability', target: 'magic_damage', value: 25, description: 'Deal 25 magic damage' }
      ]
    },
    {
      id: 'healing',
      name: 'Healing',
      description: 'Restore health over time',
      category: 'magic',
      cost: 200,
      level: 1,
      maxLevel: 4,
      unlockConditions: [
        { type: 'level', value: 5, description: 'Requires level 5' }
      ],
      effects: [
        { type: 'passive', target: 'health_regen', value: 5, description: '+5 health per second' }
      ]
    },
    {
      id: 'stealth',
      name: 'Stealth',
      description: 'Become invisible to enemies',
      category: 'stealth',
      cost: 300,
      level: 1,
      maxLevel: 2,
      unlockConditions: [
        { type: 'skill', value: 'magic_bolt', description: 'Requires Magic Bolt' }
      ],
      effects: [
        { type: 'active', target: 'invisibility', value: 1, duration: 10, description: 'Invisible for 10 seconds' }
      ]
    }
  ];

  // Load skills
  mgr.load(demoSkills);

  // Create skill tree
  const tree = mgr.createTree('demo_tree', 'Demo Skill Tree', 'A demonstration skill tree');

  // Unlock some skills
  mgr.unlock('sword_mastery');
  mgr.unlock('magic_bolt');
  mgr.addExperience('sword_mastery', 150);
  mgr.addExperience('magic_bolt', 100);
  mgr.useSkill('sword_mastery');
  mgr.useSkill('magic_bolt');

  // Get results
  const stats = mgr.getStats();
  const progress = mgr.getAllProgress();
  const unlocked = mgr.getUnlocked();

  return {
    message: 'SkillTreePure Demo completed',
    scenarios: [
      'Skill loading and management',
      'Skill tree creation',
      'Skill unlocking and progression',
      'Experience and leveling system',
      'Skill usage tracking'
    ],
    tree,
    stats,
    progress,
    unlocked,
    exportFormats: {
      json: mgr.exportSkills('json'),
      csv: mgr.exportSkills('csv'),
      markdown: mgr.exportSkills('markdown')
    }
  };
}

if (import.meta.url === `file://${process.argv[1]}`) main();