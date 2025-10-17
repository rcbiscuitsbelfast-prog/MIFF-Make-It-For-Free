import { EquipmentManager } from '../EquipmentManager';

describe('EquipmentPure Errors', () => {
  test('get unknown equipment returns error/false', () => {
    const em = new EquipmentManager();
    const res = em?.getEquipped('missing_equipment' as any);
    // Accept either falsy or explicit error envelope depending on implementation
    expect(res === null || (res as any).status === 'error' || (res as any).ok === false).toBe(true);
  });
});