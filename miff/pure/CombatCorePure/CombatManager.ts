export type CombatEntity = { id: string; hp: number; atk: number; def: number };

export type CombatResult = {
  attackerId: string;
  defenderId: string;
  damage: number;
  defenderHpAfter: number;
  victory: boolean;
};

export class CombatManager {
  private entities = new Map<string, CombatEntity>();

  list(): string[] { return Array.from(this.entities.keys()); }

  create(id: string, hp: number, atk: number, def: number): CombatEntity {
    const entity: CombatEntity = { id, hp, atk, def };
    this.entities.set(id, entity);
    return entity;
  }

  get(id: string): CombatEntity | undefined { return this.entities.get(id); }

  simulate(attackerId: string, defenderId: string): CombatResult {
    const attacker = this.ensure(attackerId);
    const defender = this.ensure(defenderId);
    const raw = attacker.atk - defender.def;
    const damage = raw > 0 ? raw : 1;
    defender.hp = Math.max(0, defender.hp - damage);
    const victory = defender.hp === 0;
    return {
      attackerId,
      defenderId,
      damage,
      defenderHpAfter: defender.hp,
      victory,
    };
  }

  private ensure(id: string): CombatEntity {
    let e = this.entities.get(id);
    if (!e) {
      e = { id, hp: 1, atk: 1, def: 0 };
      this.entities.set(id, e);
    }
    return e;
  }
}