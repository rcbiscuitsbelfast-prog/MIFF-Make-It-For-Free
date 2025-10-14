// QuestModulePure - Parse and validate plain-text quest definitions

export type QuestTrigger = { type: 'talk' | 'collect' | 'defeat' | 'timer'; target?: string; amount?: number; seconds?: number };
export type QuestReward = { type: 'xp' | 'item' | 'currency'; id?: string; amount?: number };
export type QuestStep = { id: string; description: string; triggers: QuestTrigger[]; next?: string | { branch: Array<{ when: string; next: string }> } };
export type NormalizedQuest = { id: string; title: string; steps: Record<string, QuestStep>; start: string; rewards: QuestReward[]; timed?: { seconds: number } };

export interface ParseResult { op: 'parse'; status: 'ok' | 'error'; issues: string[]; quest?: NormalizedQuest }

/**
 * parseQuestText - very small, deterministic parser for a simplified quest DSL
 * Example:
 *   id: quest_hello
 *   title: Hello World
 *   start: step_1
 *   step step_1: Talk to elder | trigger: talk elder | next: step_2
 *   step step_2: Bring 3 herbs | trigger: collect herb 3 | next: step_3
 *   step step_3: Finish | trigger: timer 60 | reward: xp 100, item herb 1
 */
export function parseQuestText(text: string): ParseResult {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const quest: Partial<NormalizedQuest> = { steps: {}, rewards: [] };
  const issues: string[] = [];
  for(const line of lines){
    if(line.startsWith('id:')) quest.id = line.slice(3).trim();
    else if(line.startsWith('title:')) quest.title = line.slice(6).trim();
    else if(line.startsWith('start:')) quest.start = line.slice(6).trim();
    else if(line.startsWith('step ')){
      // step <id>: <desc> | trigger: ... | next: ... | reward: ...
      const m = line.match(/^step\s+(\S+):\s*(.*?)\s*(\|.*)?$/);
      if(!m){ issues.push(`Invalid step line: ${line}`); continue; }
      const stepId = m[1];
      const desc = m[2];
      const tail = m[3] || '';
      const step: QuestStep = { id: stepId, description: desc, triggers: [] };
      const parts = tail.split('|').map(s => s.trim()).filter(Boolean);
      for(const p of parts){
        if(p.startsWith('trigger:')){
          const rest = p.slice(8).trim();
          const trg = parseTrigger(rest);
          if(trg) step.triggers.push(trg); else issues.push(`Invalid trigger: ${rest}`);
        } else if(p.startsWith('next:')){
          const rest = p.slice(5).trim();
          step.next = rest;
        } else if(p.startsWith('branch:')){
          const rest = p.slice(7).trim();
          step.next = { branch: rest.split(',').map(s=>s.trim()).map(rule=>{
            const mm = rule.match(/^(\w+)\s*->\s*(\w+)$/);
            return mm? { when: mm[1], next: mm[2] } : { when: 'unknown', next: 'unknown' };
          })};
        } else if(p.startsWith('reward:')){
          const rest = p.slice(7).trim();
          const rwds = parseRewards(rest);
          if(rwds.length) (quest.rewards as QuestReward[]).push(...rwds);
        }
      }
      (quest.steps as Record<string, QuestStep>)[stepId] = step;
    }
  }
  const validation = validateQuest(quest as NormalizedQuest);
  issues.push(...validation);
  return { op: 'parse', status: issues.length? 'error':'ok', issues, quest: issues.length? undefined : quest as NormalizedQuest };
}

export function validateQuest(q: NormalizedQuest): string[] {
  const issues: string[] = [];
  if(!q.id) issues.push('Missing quest id');
  if(!q.title) issues.push('Missing quest title');
  if(!q.start) issues.push('Missing start step');
  if(!q.steps || !q.steps[q.start]) issues.push('Start step not defined');
  for(const [id, s] of Object.entries(q.steps || {})){
    if(!s.description) issues.push(`Step ${id}: missing description`);
    if(!s.triggers || s.triggers.length===0) issues.push(`Step ${id}: no triggers`);
  }
  return issues;
}

function parseTrigger(s: string): QuestTrigger | null {
  const parts = s.split(/\s+/);
  if(parts[0]==='talk' && parts[1]) return { type:'talk', target:parts[1] };
  if(parts[0]==='collect' && parts[1]) return { type:'collect', target:parts[1], amount: toNum(parts[2],1) };
  if(parts[0]==='defeat' && parts[1]) return { type:'defeat', target:parts[1], amount: toNum(parts[2],1) };
  if(parts[0]==='timer' && parts[1]) return { type:'timer', seconds: toNum(parts[1],60) };
  return null;
}

function parseRewards(s: string): QuestReward[] {
  return s.split(',').map(x=>x.trim()).map(tok=>{
    const mm = tok.match(/^(xp|item|currency)\s+(\w+)?\s*(\d+)?$/);
    if(!mm) return null;
    const type = mm[1] as QuestReward['type'];
    const id = mm[2];
    const amount = mm[3]? parseInt(mm[3],10): undefined;
    return { type, id, amount } as QuestReward;
  }).filter(Boolean) as QuestReward[];
}

function toNum(s: string|undefined, def:number){ const n = s? parseInt(s,10): NaN; return Number.isFinite(n)? n : def; }

