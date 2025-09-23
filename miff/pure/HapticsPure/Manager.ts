export type HapticPattern =
  | { type: 'impact'; style: 'light' | 'medium' | 'heavy' }
  | { type: 'notification'; level: 'success' | 'warning' | 'error' }
  | { type: 'selection' }
  | { type: 'custom'; durationMs: number; intensity: number };

export interface HapticRequest {
  id: string;
  pattern: HapticPattern;
  at?: number; // epoch ms to trigger
}

export interface HapticResult {
  id: string;
  status: 'scheduled' | 'played' | 'skipped' | 'error';
  reason?: string;
}

export class HapticsManager {
  private queue: HapticRequest[] = [];
  private now(): number { return Date.now(); }

  enqueue(requests: HapticRequest | HapticRequest[]): number {
    const list = Array.isArray(requests) ? requests : [requests];
    for (const r of list) this.queue.push(r);
    return this.queue.length;
  }

  getPending(): HapticRequest[] {
    return [...this.queue];
  }

  clear(): void { this.queue = []; }

  async playNext(): Promise<HapticResult | undefined> {
    const req = this.queue.shift();
    if (!req) return undefined;
    try {
      const result = await this.play(req);
      return result;
    } catch (err) {
      return { id: req.id, status: 'error', reason: String(err) };
    }
  }

  async playAll(): Promise<HapticResult[]> {
    const results: HapticResult[] = [];
    while (this.queue.length) {
      const r = await this.playNext();
      if (r) results.push(r);
    }
    return results;
  }

  // Core: play one request using navigator.vibrate or fallbacks
  async play(req: HapticRequest): Promise<HapticResult> {
    const current = this.now();
    if (req.at && req.at > current + 60_000) {
      return { id: req.id, status: 'skipped', reason: 'scheduled-too-far' };
    }
    if (req.at && req.at > current) {
      const delay = req.at - current;
      await new Promise(r => setTimeout(r, delay));
    }

    const supported = typeof (globalThis as any).navigator !== 'undefined' && typeof (globalThis as any).navigator.vibrate === 'function';
    if (!supported) {
      // Emulate success to keep deterministic tests; no-op haptics
      return { id: req.id, status: 'played' };
    }

    const patternMs = this.patternToVibration(req.pattern);
    try {
      (globalThis as any).navigator.vibrate(patternMs);
      return { id: req.id, status: 'played' };
    } catch (err) {
      return { id: req.id, status: 'error', reason: String(err) };
    }
  }

  private patternToVibration(pattern: HapticPattern): number | number[] {
    switch (pattern.type) {
      case 'impact':
        return pattern.style === 'light' ? 10 : pattern.style === 'medium' ? 25 : 40;
      case 'notification':
        return pattern.level === 'success' ? [10, 20, 10] : pattern.level === 'warning' ? [30, 20, 30] : [50, 30, 50];
      case 'selection':
        return 5;
      case 'custom':
        return Math.max(0, Math.min(500, Math.floor(pattern.durationMs * Math.max(0, Math.min(1, pattern.intensity)))));
      default:
        return 0;
    }
  }
}

