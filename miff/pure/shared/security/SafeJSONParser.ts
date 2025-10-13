/**
 * SafeJSONParser - Secure JSON parsing with schema validation
 * 
 * Replaces unsafe JSON.parse() usage with a safe parser that validates
 * input against schemas and prevents prototype pollution attacks.
 * 
 * @version 1.0.0
 * @author MIFF Framework Security Team
 */

export interface JSONSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  properties?: { [key: string]: JSONSchema };
  items?: JSONSchema;
  required?: string[];
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  enum?: any[];
  additionalProperties?: boolean;
}

export interface ParseResult<T = any> {
  data: T;
  success: boolean;
  error?: string;
  warnings?: string[];
}

export class SafeJSONParser {
  private static readonly MAX_DEPTH = 100;
  private static readonly MAX_STRING_LENGTH = 1000000; // 1MB
  private static readonly MAX_OBJECT_KEYS = 10000;
  private static readonly MAX_ARRAY_LENGTH = 100000;

  /**
   * Safely parse JSON with schema validation
   */
  static parse<T = any>(jsonString: string, schema?: JSONSchema): ParseResult<T> {
    try {
      // Validate input string
      if (!this.isValidJSONString(jsonString)) {
        return {
          data: null as T,
          success: false,
          error: 'Invalid JSON string format'
        };
      }

      // Parse JSON safely
      const parsed = this.safeJSONParse(jsonString);
      
      if (!parsed.success) {
        return {
          data: null as T,
          success: false,
          error: parsed.error
        };
      }

      // Validate against schema if provided
      if (schema) {
        const validation = this.validateSchema(parsed.data, schema);
        if (!validation.valid) {
          return {
            data: null as T,
            success: false,
            error: `Schema validation failed: ${validation.error}`,
            warnings: validation.warnings
          };
        }
      }

      return {
        data: parsed.data as T,
        success: true,
        warnings: parsed.warnings
      };
    } catch (error) {
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown parsing error'
      };
    }
  }

  /**
   * Check if JSON string is valid format
   */
  private static isValidJSONString(jsonString: string): boolean {
    if (typeof jsonString !== 'string') {
      return false;
    }

    if (jsonString.length > this.MAX_STRING_LENGTH) {
      return false;
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      /__proto__/i,
      /constructor/i,
      /prototype/i,
      /eval\s*\(/i,
      /function\s*\(/i,
      /=>/,
      /new\s+\w+/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(jsonString)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Safely parse JSON with depth and size limits
   */
  private static safeJSONParse(jsonString: string): ParseResult {
    try {
      // Use JSON.parse with reviver to prevent prototype pollution
      const parsed = JSON.parse(jsonString, (key, value) => {
        // Prevent prototype pollution
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          return undefined;
        }
        return value;
      });

      // Validate depth and size
      const validation = this.validateStructure(parsed);
      if (!validation.valid) {
        return {
          data: null,
          success: false,
          error: validation.error
        };
      }

      return {
        data: parsed,
        success: true,
        warnings: validation.warnings
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'JSON parsing failed'
      };
    }
  }

  /**
   * Validate JSON structure for depth and size limits
   */
  private static validateStructure(obj: any, depth = 0): { valid: boolean; error?: string; warnings?: string[] } {
    const warnings: string[] = [];

    if (depth > this.MAX_DEPTH) {
      return {
        valid: false,
        error: `Maximum depth exceeded: ${depth} > ${this.MAX_DEPTH}`
      };
    }

    if (Array.isArray(obj)) {
      if (obj.length > this.MAX_ARRAY_LENGTH) {
        return {
          valid: false,
          error: `Array too large: ${obj.length} > ${this.MAX_ARRAY_LENGTH}`
        };
      }

      for (const item of obj) {
        const result = this.validateStructure(item, depth + 1);
        if (!result.valid) {
          return result;
        }
        if (result.warnings) {
          warnings.push(...result.warnings);
        }
      }
    } else if (obj !== null && typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length > this.MAX_OBJECT_KEYS) {
        return {
          valid: false,
          error: `Object too large: ${keys.length} keys > ${this.MAX_OBJECT_KEYS}`
        };
      }

      for (const key of keys) {
        // Check for dangerous keys
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          warnings.push(`Dangerous key detected and removed: ${key}`);
          continue;
        }

        const result = this.validateStructure(obj[key], depth + 1);
        if (!result.valid) {
          return result;
        }
        if (result.warnings) {
          warnings.push(...result.warnings);
        }
      }
    }

    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Validate object against JSON schema
   */
  private static validateSchema(obj: any, schema: JSONSchema, path = ''): { valid: boolean; error?: string; warnings?: string[] } {
    const warnings: string[] = [];

    // Check type
    if (schema.type === 'null') {
      if (obj !== null) {
        return {
          valid: false,
          error: `Expected null at ${path}, got ${typeof obj}`
        };
      }
      return { valid: true };
    }

    if (schema.type === 'string') {
      if (typeof obj !== 'string') {
        return {
          valid: false,
          error: `Expected string at ${path}, got ${typeof obj}`
        };
      }

      if (schema.minLength !== undefined && obj.length < schema.minLength) {
        return {
          valid: false,
          error: `String too short at ${path}: ${obj.length} < ${schema.minLength}`
        };
      }

      if (schema.maxLength !== undefined && obj.length > schema.maxLength) {
        return {
          valid: false,
          error: `String too long at ${path}: ${obj.length} > ${schema.maxLength}`
        };
      }

      if (schema.pattern && !new RegExp(schema.pattern).test(obj)) {
        return {
          valid: false,
          error: `String pattern mismatch at ${path}`
        };
      }

      if (schema.enum && !schema.enum.includes(obj)) {
        return {
          valid: false,
          error: `String not in enum at ${path}`
        };
      }
    }

    if (schema.type === 'number') {
      if (typeof obj !== 'number' || isNaN(obj)) {
        return {
          valid: false,
          error: `Expected number at ${path}, got ${typeof obj}`
        };
      }

      if (schema.minimum !== undefined && obj < schema.minimum) {
        return {
          valid: false,
          error: `Number too small at ${path}: ${obj} < ${schema.minimum}`
        };
      }

      if (schema.maximum !== undefined && obj > schema.maximum) {
        return {
          valid: false,
          error: `Number too large at ${path}: ${obj} > ${schema.maximum}`
        };
      }
    }

    if (schema.type === 'boolean') {
      if (typeof obj !== 'boolean') {
        return {
          valid: false,
          error: `Expected boolean at ${path}, got ${typeof obj}`
        };
      }
    }

    if (schema.type === 'array') {
      if (!Array.isArray(obj)) {
        return {
          valid: false,
          error: `Expected array at ${path}, got ${typeof obj}`
        };
      }

      if (schema.items) {
        for (let i = 0; i < obj.length; i++) {
          const result = this.validateSchema(obj[i], schema.items, `${path}[${i}]`);
          if (!result.valid) {
            return result;
          }
          if (result.warnings) {
            warnings.push(...result.warnings);
          }
        }
      }
    }

    if (schema.type === 'object') {
      if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        return {
          valid: false,
          error: `Expected object at ${path}, got ${typeof obj}`
        };
      }

      if (schema.properties) {
        // Check required properties
        if (schema.required) {
          for (const requiredProp of schema.required) {
            if (!(requiredProp in obj)) {
              return {
                valid: false,
                error: `Missing required property '${requiredProp}' at ${path}`
              };
            }
          }
        }

        // Validate properties
        for (const [propName, propSchema] of Object.entries(schema.properties)) {
          if (propName in obj) {
            const result = this.validateSchema(obj[propName], propSchema, `${path}.${propName}`);
            if (!result.valid) {
              return result;
            }
            if (result.warnings) {
              warnings.push(...result.warnings);
            }
          }
        }

        // Check additional properties
        if (schema.additionalProperties === false) {
          for (const key of Object.keys(obj)) {
            if (!(key in schema.properties!)) {
              return {
                valid: false,
                error: `Additional property '${key}' not allowed at ${path}`
              };
            }
          }
        }
      }
    }

    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }
}

// Export default instance
// export const safeJSONParser = new SafeJSONParser();
export { SafeJSONParser as default };