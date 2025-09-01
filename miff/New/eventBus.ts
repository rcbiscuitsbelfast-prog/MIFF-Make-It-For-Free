type EventHandler = (...args: any[]) => void;

const bus = new Map<string, EventHandler[]>();

export function on(event: string, handler: EventHandler): void {
  if (!bus.has(event)) {
    bus.set(event, []);
  }
  bus.get(event)!.push(handler);
}

export function emit(event: string, ...args: any[]): void {
  const handlers = bus.get(event);
  if (handlers) {
    for (const fn of handlers) {
      fn(...args);
    }
  }
}

export function clearEvent(event: string): void {
  bus.delete(event);
}
