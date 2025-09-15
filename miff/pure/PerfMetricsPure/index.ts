export interface PerfSample {
  dtMs: number;
  tickStartMs: number;
  tickEndMs: number;
  playersSimulated: number;
}

export interface PerfSnapshot {
  avgDtMs: number;
  avgTickMs: number;
  maxTickMs: number;
  minTickMs: number;
  ticks: number;
  playersSimulatedLast: number;
}

export class PerfMetricsPure {
  private samples: PerfSample[] = [];
  private maxSamples: number;
  private ticks: number = 0;

  constructor(maxSamples: number = 120){
    this.maxSamples = maxSamples;
  }

  public record(dtMs: number, tickStartMs: number, tickEndMs: number, playersSimulated: number): void {
    const sample: PerfSample = { dtMs, tickStartMs, tickEndMs, playersSimulated };
    this.samples.push(sample);
    if (this.samples.length > this.maxSamples) this.samples.shift();
    this.ticks += 1;
  }

  public snapshot(): PerfSnapshot {
    if (this.samples.length === 0) {
      return { avgDtMs: 0, avgTickMs: 0, maxTickMs: 0, minTickMs: 0, ticks: this.ticks, playersSimulatedLast: 0 };
    }
    let sumDt = 0, sumTick = 0, maxTick = -Infinity, minTick = Infinity;
    let lastPlayers = this.samples[this.samples.length - 1].playersSimulated;
    for (const s of this.samples){
      const tickMs = s.tickEndMs - s.tickStartMs;
      sumDt += s.dtMs;
      sumTick += tickMs;
      if (tickMs > maxTick) maxTick = tickMs;
      if (tickMs < minTick) minTick = tickMs;
    }
    return {
      avgDtMs: sumDt / this.samples.length,
      avgTickMs: sumTick / this.samples.length,
      maxTickMs: maxTick === -Infinity ? 0 : maxTick,
      minTickMs: minTick === Infinity ? 0 : minTick,
      ticks: this.ticks,
      playersSimulatedLast: lastPlayers,
    };
  }
}

