import fs from 'fs';
import path from 'path';
import { RemixTaggingManager, RemixLevel } from './Manager';

type Cmd = 
  | { op: 'tagModule'; moduleId: string; moduleName: string; level?: RemixLevel; reason?: string }
  | { op: 'getTag'; moduleId: string }
  | { op: 'listTags'; level?: RemixLevel }
  | { op: 'getStats' }
  | { op: 'removeTag'; moduleId: string };

function main() {
  const configPath = process.argv[2] || '';
  const cmdsPath = process.argv[3] || '';
  
  const mgr = new RemixTaggingManager();
  
  // Load config if provided
  if (configPath && fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(path.resolve(configPath), 'utf-8'));
    mgr.setConfig(config);
  }
  
  // Load commands
  const commands: Cmd[] = cmdsPath && fs.existsSync(cmdsPath) 
    ? JSON.parse(fs.readFileSync(path.resolve(cmdsPath), 'utf-8'))
    : [{ op: 'getStats' }];
  
  const outputs: any[] = [];
  
  for (const cmd of commands) {
    switch (cmd.op) {
      case 'tagModule':
        outputs.push(mgr.tagModule(cmd.moduleId, cmd.moduleName, cmd.level, cmd.reason));
        break;
        
      case 'getTag':
        const tag = mgr.getModuleTag(cmd.moduleId);
        outputs.push({
          op: 'getTag',
          status: tag ? 'ok' : 'not_found',
          moduleId: cmd.moduleId,
          tag: tag
        });
        break;
        
      case 'listTags':
        const tags = cmd.level ? mgr.getTagsByLevel(cmd.level) : mgr.getAllTags();
        outputs.push({
          op: 'listTags',
          status: 'ok',
          level: cmd.level || 'all',
          count: tags.length,
          tags: tags
        });
        break;
        
      case 'getStats':
        outputs.push({
          op: 'getStats',
          status: 'ok',
          stats: mgr.getTaggingStats()
        });
        break;
        
      case 'removeTag':
        const removed = mgr.removeTag(cmd.moduleId);
        outputs.push({
          op: 'removeTag',
          status: removed ? 'ok' : 'not_found',
          moduleId: cmd.moduleId,
          removed: removed
        });
        break;
        
      default:
        outputs.push({
          op: 'unknown',
          status: 'error',
          message: `Unknown operation: ${(cmd as any).op}`
        });
    }
  }
  
  console.log(JSON.stringify({ outputs }, null, 2));
}

if (require.main === module) main();