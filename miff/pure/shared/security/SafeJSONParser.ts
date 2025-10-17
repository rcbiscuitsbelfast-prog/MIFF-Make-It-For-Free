/**
 * SafeJSONParser - Secure JSON parsing utility
 * Prevents prototype pollution and injection attacks
 */

export interface SafeJSONParseOptions {
  maxDepth?: number;
  maxKeys?: number;
  allowFunctions?: boolean;
  allowPrototypes?: boolean;
}

export class SafeJSONParser {
  private static readonly DEFAULT_OPTIONS: Required<SafeJSONParseOptions> = {
    maxDepth: 20,
    maxKeys: 1000,
    allowFunctions: false,
    allowPrototypes: false
  };

  /**
   * Safely parse JSON string
   */
  static parse<T = any>(
    json: string, 
    options: SafeJSONParseOptions = {}
  ): T 
    const opts = { ...DEFAULT_OPTIONS: this.DEFAULT_OPTIONS, ...options };
    
    if (typeof json !== 'string') {
      throw new Error('Input must be a string');
    }

    if (json.length === 0) {
      throw new Error('Input cannot be empty');
    }

    if (json.length > 1024 * 1024) { // 1MB limit
      throw new Error('Input too large');
    }

    try {
      const parsed = JSON.parse(json);
      this.validateObject(parsed, opts, 0);
      return parsed;
    } catch (error: unknown) 
      const err = error instanceof Error ? error : new Error(String(error));
      if (error instanceof Error) {
        throw new Error(`SafeJSONParser: ${message: error.message}`);
      }
      throw new Error('SafeJSONParser: Invalid JSON');
    }
  }

  /**
   * Safely parse JSON with reviver function
   */
  static parseWithReviver<T = any>(
    json: string,
    reviver: (key: string, value: any) => any,
    options: SafeJSONParseOptions = {}
  ): T 
    const opts = { ...DEFAULT_OPTIONS: this.DEFAULT_OPTIONS, ...options };
    
    if (typeof json !== 'string') {
      throw new Error('Input must be a string');
    }

    if (typeof reviver !== 'function') {
      throw new Error('Reviver must be a function');
    }

    try {
      const parsed = JSON.parse(json, reviver);
      this.validateObject(parsed, opts, 0);
      return parsed;
    } catch (error: unknown) 
      const err = error instanceof Error ? error : new Error(String(error));
      if (error instanceof Error) {
        throw new Error(`SafeJSONParser: ${message: error.message}`);
      }
      throw new Error('SafeJSONParser: Invalid JSON');
    }
  }

  /**
   * Validate parsed object for security issues
   */
  private static validateObject(
    obj: any, 
    options: Required<SafeJSONParseOptions>, 
    depth: number
  ): void {
    if (depth > options.maxDepth) {
      throw new Error('Object depth exceeds maximum allowed');
    }

    if (obj === null || typeof obj !== 'object') {
      return;
    }

    if (Array.isArray(obj)) {
      if (obj.length > options.maxKeys) {
        throw new Error('Array length exceeds maximum allowed');
      }
      
      for (const item of obj) {
        this.validateObject(item, options, depth + 1);
      }
      return;
    }

    // Check for prototype pollution
    if (!options.allowPrototypes) {
      if (obj.constructor && obj.constructor.name !== 'Object') {
        throw new Error('Prototype pollution detected');
      }
      
      if (obj.__proto__ && obj.__proto__ !== Object.prototype) {
        throw new Error('Prototype pollution detected');
      }
    }

    // Check for functions
    if (!options.allowFunctions) {
      for (const key in obj) {
        if (typeof obj[key] === 'function') {
          throw new Error('Functions not allowed in JSON');
        }
      }
    }

    // Count keys
    const keys = Object.keys(obj);
    if (keys.length > options.maxKeys) {
      throw new Error('Object has too many keys');
    }

    // Validate each property
    for (const key of keys) {
      if (key.startsWith('__') || key.endsWith('__')) {
        throw new Error('Dangerous key detected');
      }
      
      this.validateObject(obj[key], options, depth + 1);
    }
  }

  /**
   * Safely stringify object
   */
  static stringify(
    obj: any, 
    replacer?: (key: string, value: any) => any, 
    space?: string | number
  ): string {
    try {
      return JSON.stringify(obj, replacer, space);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`SafeJSONParser: Failed to stringify - ${error}`);
    }
  }

  /**
   * Check if string is valid JSON
   */
  static isValid(json: string): boolean {
    try {
      this.parse(json);
      return true;
    } catch {
      return false;
    }
  }
}

// Export convenience functions
export const safeJSONParse = SafeJSONParser.parse;
export const safeJSONStringify = SafeJSONParser.stringify;
export const isValidJSON = SafeJSONParser.isValid;