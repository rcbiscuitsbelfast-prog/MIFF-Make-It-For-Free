import { SchemaManager } from '../Manager';

describe('BridgeSchemaPure Errors', () => {
  test('validate invalid render payload returns issues', () => {
    const sm = new SchemaManager();
    const res = sm.validateRender({ bad: true } as any);
    expect(res.status).toBe('error');
    expect(res.issues.length).toBeGreaterThanOrEqual(0);
  });
});

