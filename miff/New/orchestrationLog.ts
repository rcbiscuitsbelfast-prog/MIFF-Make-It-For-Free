const log: string[] = [];

export function logEvent(message: string): void {
  const timestamp = new Date().toISOString();
  log.push(`[${timestamp}] ${message}`);
}

export function getLog(): string[] {
  return [...log];
}

export function clearLog(): void {
  log.length = 0;
}
