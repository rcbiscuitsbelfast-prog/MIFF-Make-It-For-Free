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
