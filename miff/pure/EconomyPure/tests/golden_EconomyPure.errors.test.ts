import { EconomyManager } from '../Manager';

describe('EconomyPure Errors', () => {
  test('calculatePrice with unknown vendor/item', () => {
    const econ = new EconomyManager();
    const noVendor = econ.calculatePrice('missing_vendor' as any, 'health_potion', 1);
    expect(noVendor.status).toBe('error');
    const noItem = econ.calculatePrice('general_store', 'missing_item' as any, 1);
    expect(noItem.status).toBe('error');
  });
  test('export invalid format', () => {
    const econ = new EconomyManager();
    const bad = econ.exportEconomy('bad_format' as any);
    expect(bad.status).toBe('error');
  });
});