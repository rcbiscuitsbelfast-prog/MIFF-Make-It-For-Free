export type StatusEffect = { id: string; type: 'poison'|'regen'; magnitude: number; duration: number };
export type StatusEntity = { id: string; hp: number; effects: StatusEffect[] };

export type TickResult = { id: string; hpDelta: number; remainingEffects: number };

export class StatusEffectsManager {
  private entities = new Map<string, StatusEntity>();

  list(): string[] { return Array.from(this.entities.keys()); }

  create(id: string, hp: number, effects: StatusEffect[] = []): StatusEntity {
    const e: StatusEntity = { id, hp, effects: [...effects] };
    this.entities.set(id, e);
    return e;
  }

  get(id: string): StatusEntity | undefined { return this.entities.get(id); }

  simulate(id: string): TickResult {
    const e = this.ensure(id);
    let hpDelta = 0;
    for (const fx of e.effects) {
      if (fx.type === 'poison') hpDelta -= Math.abs(fx.magnitude);
      if (fx.type === 'regen') hpDelta += Math.abs(fx.magnitude);
      fx.duration -= 1;
    }
    e.hp = Math.max(0, e.hp + hpDelta);
    e.effects = e.effects.filter(f => f.duration > 0);
    return { id, hpDelta, remainingEffects: e.effects.length };
  }

  private ensure(id: string): StatusEntity {
    let e = this.entities.get(id);
    if (!e) { e = { id, hp: 1, effects: [] }; this.entities.set(id, e); }
    return e;
  }
}