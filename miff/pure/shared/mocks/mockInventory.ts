/**
 * Mock Inventory System
 * 
 * Provides mock implementations for inventory-related functionality
 * in MIFF tests.
 */

export const mockInventory = {
  addItem: jest.fn().mockReturnValue(true),
  removeItem: jest.fn().mockReturnValue(true),
  getItem: jest.fn().mockReturnValue({ id: 'test_item', name: 'Test Item' }),
  query: jest.fn().mockReturnValue({ count: 1, items: [{ id: 'test_item' }] })
};