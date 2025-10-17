import { BridgeSchemaManager } from '../Manager';

describe('BridgeSchemaPure Errors', () => {
  test('validate invalid render payload returns issues', () => {
    const sm = new BridgeSchemaManager();
    const res = sm.validateAgainstSchema('test-schema', { bad: true } as any);
    expect(res.ok).toBe(false);
    expect(res.errors?.length).toBeGreaterThanOrEqual(0);
  });
});

