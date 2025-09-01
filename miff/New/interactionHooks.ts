type InteractionFn = (x: number, y: number) => void;

const interactionMap = new Map<string, InteractionFn>();

export function registerInteraction(id: string, fn: InteractionFn): void {
  interactionMap.set(id, fn);
}

export function runInteraction(id: string, x: number, y: number): void {
  const fn = interactionMap.get(id);
  if (fn) fn(x, y);
}

// Example
registerInteraction('talkToSpirit', (x, y) => {
  console.log(`Interacted with spirit at (${x}, ${y})`);
});
