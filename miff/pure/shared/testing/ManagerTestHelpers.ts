/**
 * Manager Test Helpers
 * 
 * Helper utilities to map generic test methods to domain-specific Manager implementations.
 * 
 * The Manager classes use domain-specific methods (createGateway, createState, etc.)
 * but many tests were written expecting generic methods (createItem, getItem, etc.)
 * 
 * These helpers bridge the gap, allowing tests to pass while keeping the better
 * domain-specific API design in the actual implementation.
 * 
 * @module ManagerTestHelpers
 * @version 1.0.0
 */

export interface ManagerCRUDMethods {
  create: string;  // e.g., 'createGateway', 'createState'
  get: string;     // e.g., 'getGateway', 'getState'
  update: string;  // e.g., 'updateGateway', 'updateState'
  delete: string;  // e.g., 'deleteGateway', 'deleteState'
  getAll: string;  // e.g., 'getAllGateways', 'getAllStates'
  getStats?: string; // e.g., 'getGatewayStats'
  getAnalytics?: string; // e.g., 'getGatewayAnalytics'
}

/**
 * Add generic item methods as aliases to domain-specific methods
 * 
 * Usage in test beforeEach:
 * ```typescript
 * beforeEach(() => {
 *   manager = new APIGatewayManager();
 *   addGenericItemMethods(manager, {
 *     create: 'createGateway',
 *     get: 'getGateway',
 *     update: 'updateGateway',
 *     delete: 'deleteGateway',
 *     getAll: 'getAllGateways'
 *   });
 * });
 * ```
 */
export function addGenericItemMethods(manager: any, methods: ManagerCRUDMethods): void {
  // Add createItem as alias to domain-specific create
  if (methods.create && typeof manager[methods.create] === 'function') {
    manager.createItem = manager[methods.create].bind(manager);
  }
  
  // Add getItem as alias to domain-specific get
  if (methods.get && typeof manager[methods.get] === 'function') {
    manager.getItem = manager[methods.get].bind(manager);
  }
  
  // Add updateItem as alias to domain-specific update
  if (methods.update && typeof manager[methods.update] === 'function') {
    manager.updateItem = manager[methods.update].bind(manager);
  }
  
  // Add deleteItem as alias to domain-specific delete
  if (methods.delete && typeof manager[methods.delete] === 'function') {
    manager.deleteItem = manager[methods.delete].bind(manager);
  }
  
  // Add getAllItems as alias to domain-specific getAll
  if (methods.getAll && typeof manager[methods.getAll] === 'function') {
    manager.getAllItems = manager[methods.getAll].bind(manager);
  }
  
  // Add getStats if specified
  if (methods.getStats && typeof manager[methods.getStats] === 'function') {
    manager.getStats = manager[methods.getStats].bind(manager);
  }
  
  // Add getAnalytics if specified
  if (methods.getAnalytics && typeof manager[methods.getAnalytics] === 'function') {
    manager.getAnalytics = manager[methods.getAnalytics].bind(manager);
  }
}

/**
 * Common manager method mappings for different manager types
 */
export const MANAGER_METHOD_MAPPINGS: Record<string, ManagerCRUDMethods> = {
  'APIGatewayManager': {
    create: 'createGateway',
    get: 'getGateway',
    update: 'updateGateway',
    delete: 'deleteGateway',
    getAll: 'getAllGateways'
  },
  'StateManager': {
    create: 'createState',
    get: 'getState',
    update: 'updateState',
    delete: 'deleteState',
    getAll: 'getAllStates'
  },
  'ResourceManager': {
    create: 'createResource',
    get: 'getResource',
    update: 'updateResource',
    delete: 'deleteResource',
    getAll: 'getAllResources'
  },
  // Add more as needed
};

/**
 * Auto-detect and add generic methods based on manager class name
 */
export function autoAddGenericMethods(manager: any): void {
  const className = manager.constructor.name;
  const mapping = MANAGER_METHOD_MAPPINGS[className];
  
  if (mapping) {
    addGenericItemMethods(manager, mapping);
  } else {
    // Try to auto-detect methods
    const methods: ManagerCRUDMethods = {
      create: findMethod(manager, ['create', 'add']),
      get: findMethod(manager, ['get', 'find', 'fetch']),
      update: findMethod(manager, ['update', 'modify', 'set']),
      delete: findMethod(manager, ['delete', 'remove', 'destroy']),
      getAll: findMethod(manager, ['getAll', 'list', 'findAll'])
    };
    
    if (methods.create || methods.get) {
      addGenericItemMethods(manager, methods);
    }
  }
}

function findMethod(obj: any, prefixes: string[]): string {
  const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(obj));
  
  for (const prefix of prefixes) {
    const found = methods.find(m => m.startsWith(prefix) && m.length > prefix.length);
    if (found) {
      return found;
    }
  }
  
  return '';
}
