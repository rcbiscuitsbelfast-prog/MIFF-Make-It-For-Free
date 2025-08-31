export type Skill = { id: string; name: string; requires?: string[] };

export class SkillTreeManager {
  private skills = new Map<string, Skill>();
  private unlocked = new Set<string>();

  load(skills: Skill[]) { this.skills.clear(); this.unlocked.clear(); for(const s of skills) this.skills.set(s.id, s); }
  list(): string[] { return Array.from(this.skills.keys()); }
  getUnlocked(): string[] { return Array.from(this.unlocked.values()); }
  get(id:string): Skill|undefined { return this.skills.get(id); }
  canUnlock(id:string): boolean { const s=this.skills.get(id); if(!s) return false; const req=s.requires||[]; return req.every(r=>this.unlocked.has(r)); }
  unlock(id:string): boolean { if(!this.canUnlock(id)) return false; this.unlocked.add(id); return true; }
}