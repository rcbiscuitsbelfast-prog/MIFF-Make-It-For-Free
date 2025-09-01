import { TileType } from './tileTypes';

type TransitionRule = {
  from: TileType;
  to: TileType;
  cost: number;
  allowed: boolean;
};

const transitionRules: TransitionRule[] = [];

export function addTransitionRule(rule: TransitionRule): void {
  transitionRules.push(rule);
}

export function getTransitionCost(from: TileType, to: TileType): number {
  const rule = transitionRules.find(r => r.from === from && r.to === to);
  return rule ? rule.cost : Infinity;
}

export function isTransitionAllowed(from: TileType, to: TileType): boolean {
  const rule = transitionRules.find(r => r.from === from && r.to === to);
  return rule ? rule.allowed : false;
}

// Example rules
addTransitionRule({ from: TileType.Grass, to: TileType.Water, cost: 5, allowed: false });
addTransitionRule({ from: TileType.Sand, to: TileType.Water, cost: 2, allowed: true });
