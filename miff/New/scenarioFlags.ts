const flags: Record<string, boolean> = {};

export function setScenarioFlag(name: string, value: boolean): void {
  flags[name] = value;
}

export function getScenarioFlag(name: string): boolean {
  return flags[name] ?? false;
}

export function clearScenarioFlags(): void {
  for (const key in flags) {
    delete flags[key];
  }
}
