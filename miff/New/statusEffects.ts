export interface StatusEffect {
  id: string;
  name: string;
  duration: number;
  impact: string;
}

const activeEffects: StatusEffect[] = [];

export function applyStatusEffect(effect: StatusEffect): void {
  activeEffects.push(effect);
}

export function tickStatusEffects(): void {
  for (const effect of activeEffects) {
    effect.duration -= 1;
  }
  for (let i = activeEffects.length - 1; i >= 0; i--) {
    if (activeEffects[i].duration <= 0) {
      activeEffects.splice(i, 1);
    }
  }
}

export function listStatusEffects(): StatusEffect[] {
  return [...activeEffects];
}

export function removeStatusEffect(effectId: string): void {
  const index = activeEffects.findIndex(effect => effect.id === effectId);
  if (index !== -1) {
    activeEffects.splice(index, 1);
  }
}

export function getStatusEffects(): StatusEffect[] {
  return [...activeEffects];
}
