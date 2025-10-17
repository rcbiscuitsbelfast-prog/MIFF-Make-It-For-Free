import { PerfMetricsPure } from '../index';

test('PerfMetricsPure records and snapshots', () => {
  const perf = new PerfMetricsPure(5);
  perf.record(16.6, 0, 2, 2);
  perf.record(16.6, 2, 3, 2);
  const snap = perf.snapshot();
  expect(snap.ticks).toBe(2);
  expect(snap.avgTickMs).toBeGreaterThan(0);
  expect(snap.playersSimulatedLast).toBe(2);
});

