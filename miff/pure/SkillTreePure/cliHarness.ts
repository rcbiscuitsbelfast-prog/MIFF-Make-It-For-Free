#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { SkillTreeManager, Skill } from './SkillTreeManager';

type Cmd =
  | { op: 'list' }
  | { op: 'unlock'; id: string }
  | { op: 'dump' }
  | { op: 'canUnlock'; id: string };

function main(){
  const sample = process.argv[2] || 'SkillTreePure/sample_skills.json';
  const commands = process.argv[3] || '';
  const mgr = new SkillTreeManager();
  if (fs.existsSync(sample)){
    const j = JSON.parse(fs.readFileSync(path.resolve(sample),'utf-8')) as {skills:Skill[]};
    mgr.load(j.skills);
  }
  const cmds:Cmd[] = commands? JSON.parse(fs.readFileSync(path.resolve(commands),'utf-8')) : [{op:'list'} as Cmd];
  const outputs:any[]=[];
  for(const c of cmds){
    if(c.op==='list') outputs.push({op:'list', skills:mgr.list()});
    else if(c.op==='unlock') outputs.push({op:'unlock', id:c.id, ok:mgr.unlock(c.id)});
    else if(c.op==='canUnlock') outputs.push({op:'canUnlock', id:c.id, ok:mgr.canUnlock(c.id)});
    else if(c.op==='dump') outputs.push({op:'dump', unlocked:mgr.getUnlocked()});
  }
  console.log(JSON.stringify({outputs},null,2));
}
if(require.main===module) main();