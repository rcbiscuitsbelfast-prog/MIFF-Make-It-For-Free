import { runCLICommand } from '../../shared/testUtils';

describe('InventoryPure CLI Harness', () => {
  test('createInventory - should create inventory for entity', async () => {
    const result = await runCLICommand('InventoryPure', 'createInventory', 'player_001', '100', '20');
    
    expect(result?.op).toBe('createInventory');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.message).toBeDefined();
    expect(result?.result.inventory).toBeDefined();
  });

  test('getInventory - should get inventory for entity', async () => {
    const result = await runCLICommand('InventoryPure', 'getInventory', 'player_001');
    
    expect(result?.op).toBe('getInventory');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
  });

  test('addItem - should add item to inventory', async () => {
    const result = await runCLICommand('InventoryPure', 'addItem', 'player_001', 'sword_001', '1');
    
    expect(result?.op).toBe('addItem');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.success).toBeDefined();
    expect(result?.result.message).toBeDefined();
  });

  test('removeItem - should remove item from inventory', async () => {
    const result = await runCLICommand('InventoryPure', 'removeItem', 'player_001', 'slot_0', '1');
    
    expect(result?.op).toBe('removeItem');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.success).toBeDefined();
    expect(result?.result.message).toBeDefined();
  });

  test('getStats - should get inventory statistics', async () => {
    const result = await runCLICommand('InventoryPure', 'getStats');
    
    expect(result?.op).toBe('getStats');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.totalItems).toBeDefined();
    expect(result?.result.totalInventories).toBeDefined();
    expect(result?.result.totalTransactions).toBeDefined();
  });

  test('demo - should run demonstration scenarios', async () => {
    const result = await runCLICommand('InventoryPure', 'demo');
    
    expect(result?.op).toBe('demo');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.message).toBe('InventoryPure Demo completed');
    expect(result?.result.scenarios).toBeDefined();
    expect(result?.result.stats).toBeDefined();
    expect(result?.result.inventory).toBeDefined();
  });

  test('help - should show help information', async () => {
    const result = await runCLICommand('InventoryPure', 'help');
    
    expect(result?.op).toBe('help');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.usage).toBeDefined();
    expect(result?.result.commands).toBeDefined();
  });

  test('invalid command - should return error', async () => {
    const result = await runCLICommand('InventoryPure', 'invalidCommand');
    
    expect(result?.op).toBe('invalidCommand');
    expect(result?.status).toBe('error');
    expect(result?.result).toBeDefined();
    expect(result?.result.error).toBeDefined();
  });
});