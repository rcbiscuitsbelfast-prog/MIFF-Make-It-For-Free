const combatState = {
  inCombat: false,
  turn: 0,
};

export function startCombat(): void {
  combatState.inCombat = true;
  combatState.turn = 1;
}

export function endCombat(): void {
  combatState.inCombat = false;
  combatState.turn = 0;
}

export function nextTurn(): void {
  if (combatState.inCombat) {
    combatState.turn += 1;
  }
}

export function getCombatState(): typeof combatState {
  return { ...combatState };
}

export function setCombatFlag(flag: string, value: boolean): void {
  (combatState as any)[flag] = value;
}

export function getCombatFlag(flag: string): boolean {
  return (combatState as any)[flag] || false;
}

export function clearCombatFlags(): void {
  Object.keys(combatState).forEach(key => {
    if (typeof (combatState as any)[key] === 'boolean') {
      (combatState as any)[key] = false;
    }
  });
}
