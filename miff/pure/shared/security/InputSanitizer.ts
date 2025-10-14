/**
 * InputSanitizer - Comprehensive input validation and sanitization
 * 
 * Provides comprehensive input sanitization for all user-provided data
 * including strings, numbers, objects, and arrays to prevent injection attacks.
 * 
 * @version 1.0.0
 * @author MIFF Framework Security Team
 */

export interface SanitizationOptions {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  maxLength?: number;
  allowHtml?: boolean;
  allowScripts?: boolean;
  allowSpecialChars?: boolean;
  trimWhitespace?: boolean;
  normalizeUnicode?: boolean;
}

export interface SanitizationResult<T = any> {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  sanitized: T;
  isValid: boolean;
  warnings?: string[];
  errors?: string[];
}

export class InputSanitizer {
  private static readonly DEFAULT_MAX_LENGTH = 1000;
  private static readonly DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
    /onfocus\s*=/gi,
    /onblur\s*=/gi,
    /onchange\s*=/gi,
    /onsubmit\s*=/gi,
    /onreset\s*=/gi,
    /onkeydown\s*=/gi,
    /onkeyup\s*=/gi,
    /onkeypress\s*=/gi,
    /onmousedown\s*=/gi,
    /onmouseup\s*=/gi,
    /onmousemove\s*=/gi,
    /onmouseout\s*=/gi,
    /onmouseenter\s*=/gi,
    /onmouseleave\s*=/gi,
    /oncontextmenu\s*=/gi,
    /ondblclick\s*=/gi,
    /onresize\s*=/gi,
    /onscroll\s*=/gi,
    /onunload\s*=/gi,
    /onbeforeunload\s*=/gi,
    /onabort\s*=/gi,
    /onerror\s*=/gi,
    /onload\s*=/gi,
    /onloadstart\s*=/gi,
    /onloadend\s*=/gi,
    /onprogress\s*=/gi,
    /ontimeout\s*=/gi,
    /onabort\s*=/gi,
    /onerror\s*=/gi,
    /onload\s*=/gi,
    /onloadstart\s*=/gi,
    /onloadend\s*=/gi,
    /onprogress\s*=/gi,
    /ontimeout\s*=/gi,
    /onabort\s*=/gi,
    /onerror\s*=/gi,
    /onload\s*=/gi,
    /onloadstart\s*=/gi,
    /onloadend\s*=/gi,
    /onprogress\s*=/gi,
    /ontimeout\s*=/gi,
    /eval\s*\(/gi,
    /function\s*\(/gi,
    /new\s+\w+/gi,
    /\.\w+\s*\(/gi,
    /\[.*\]/gi,
    /{.*}/gi,
    /['"`]/gi,
    /;|&|\||`|\$/gi
  ];

  /**
   * Sanitize a string input
   */
  static sanitizeString(input: string, options: SanitizationOptions = {}): SanitizationResult<string> {
    const {
      maxLength = this.DEFAULT_MAX_LENGTH,
      allowHtml = false,
      allowScripts = false,
      allowSpecialChars = true,
      trimWhitespace = true,
      normalizeUnicode = true
    } = options;

    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      let sanitized = input;

      // Trim whitespace if requested
      if (trimWhitespace) {
        sanitized = sanitized.trim();
      }

      // Normalize unicode if requested
      if (normalizeUnicode) {
        sanitized = sanitized.normalize('NFC');
      }

      // Check length
      if (sanitized.length > maxLength) {
        errors.push(`String too long: ${sanitized.length} > ${maxLength}`);
        sanitized = sanitized.substring(0, maxLength);
        warnings.push('String truncated due to length limit');
      }

      // Remove dangerous patterns
      for (const pattern of this.DANGEROUS_PATTERNS) {
        if (pattern.test(sanitized)) {
          sanitized = sanitized.replace(pattern, '');
          warnings.push(`Dangerous pattern removed: ${pattern.source}`);
        }
      }

      // Remove HTML if not allowed
      if (!allowHtml) {
        sanitized = sanitized.replace(/<[^>]*>/g, '');
        warnings.push('HTML tags removed');
      }

      // Remove scripts if not allowed
      if (!allowScripts) {
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        warnings.push('Script tags removed');
      }

      // Remove special characters if not allowed
      if (!allowSpecialChars) {
        sanitized = sanitized.replace(/[^a-zA-Z0-9\s]/g, '');
        warnings.push('Special characters removed');
      }

      // Remove control characters
      sanitized = sanitized.replace(/[\x00-\x1f\x7f-\x9f]/g, '');
      warnings.push('Control characters removed');

      return {
        sanitized,
        isValid: errors.length === 0,
        warnings: warnings.length > 0 ? warnings : undefined,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      return {
        sanitized: '',
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Sanitization failed']
      };
    }
  }

  /**
   * Sanitize a number input
   */
  static sanitizeNumber(input: any, options: { min?: number; max?: number; allowFloat?: boolean } = {}): SanitizationResult<number> {
    const { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, allowFloat = true } = options;
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      let sanitized: number;

      if (typeof input === 'number') {
        sanitized = input;
      } else if (typeof input === 'string') {
        sanitized = parseFloat(input);
        if (isNaN(sanitized)) {
          errors.push('Invalid number format');
          return {
            sanitized: 0,
            isValid: false,
            errors
          };
        }
      } else {
        errors.push('Input is not a number');
        return {
          sanitized: 0,
          isValid: false,
          errors
        };
      }

      // Check if it's a valid number
      if (!isFinite(sanitized)) {
        errors.push('Number is not finite');
        return {
          sanitized: 0,
          isValid: false,
          errors
        };
      }

      // Check if it's an integer when float is not allowed
      if (!allowFloat && !Number.isInteger(sanitized)) {
        sanitized = Math.round(sanitized);
        warnings.push('Number rounded to integer');
      }

      // Check bounds
      if (sanitized < min) {
        sanitized = min;
        warnings.push(`Number clamped to minimum: ${min}`);
      }

      if (sanitized > max) {
        sanitized = max;
        warnings.push(`Number clamped to maximum: ${max}`);
      }

      return {
        sanitized,
        isValid: errors.length === 0,
        warnings: warnings.length > 0 ? warnings : undefined,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      return {
        sanitized: 0,
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Number sanitization failed']
      };
    }
  }

  /**
   * Sanitize an object input
   */
  static sanitizeObject<T extends Record<string, any>>(input: T, options: SanitizationOptions = {}): SanitizationResult<T> {
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      if (input === null || typeof input !== 'object' || Array.isArray(input)) {
        errors.push('Input is not a valid object');
        return {
          sanitized: {} as T,
          isValid: false,
          errors
        };
      }

      const sanitized = {} as T;

      for (const [key, value] of Object.entries(input)) {
        // Sanitize key
        const keyResult = this.sanitizeString(key, { maxLength: 100, allowSpecialChars: false });
        if (!keyResult.isValid) {
          errors.push(`Invalid key: ${key}`);
          continue;
        }

        // Sanitize value based on type
        if (typeof value === 'string') {
          const valueResult = this.sanitizeString(value, options);
          if (valueResult.isValid) {
            sanitized[keyResult.sanitized as keyof T] = valueResult.sanitized;
            if (valueResult.warnings) {
              warnings.push(...valueResult.warnings);
            }
          } else {
            errors.push(`Invalid string value for key: ${key}`);
          }
        } else if (typeof value === 'number') {
          const valueResult = this.sanitizeNumber(value);
          if (valueResult.isValid) {
            sanitized[keyResult.sanitized as keyof T] = valueResult.sanitized;
            if (valueResult.warnings) {
              warnings.push(...valueResult.warnings);
            }
          } else {
            errors.push(`Invalid number value for key: ${key}`);
          }
        } else if (typeof value === 'boolean') {
          sanitized[keyResult.sanitized as keyof T] = value;
        } else if (Array.isArray(value)) {
          const arrayResult = this.sanitizeArray(value, options);
          if (arrayResult.isValid) {
            sanitized[keyResult.sanitized as keyof T] = arrayResult.sanitized;
            if (arrayResult.warnings) {
              warnings.push(...arrayResult.warnings);
            }
          } else {
            errors.push(`Invalid array value for key: ${key}`);
          }
        } else if (value !== null && typeof value === 'object') {
          const objectResult = this.sanitizeObject(value, options);
          if (objectResult.isValid) {
            sanitized[keyResult.sanitized as keyof T] = objectResult.sanitized;
            if (objectResult.warnings) {
              warnings.push(...objectResult.warnings);
            }
          } else {
            errors.push(`Invalid object value for key: ${key}`);
          }
        } else {
          // Other types (null, undefined, etc.)
          sanitized[keyResult.sanitized as keyof T] = value;
        }
      }

      return {
        sanitized,
        isValid: errors.length === 0,
        warnings: warnings.length > 0 ? warnings : undefined,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      return {
        sanitized: {} as T,
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Object sanitization failed']
      };
    }
  }

  /**
   * Sanitize an array input
   */
  static sanitizeArray<T = any>(input: T[], options: SanitizationOptions = {}): SanitizationResult<T[]> {
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      if (!Array.isArray(input)) {
        errors.push('Input is not an array');
        return {
          sanitized: [],
          isValid: false,
          errors
        };
      }

      const sanitized: T[] = [];

      for (let i = 0; i < input.length; i++) {
        const item = input[i];

        if (typeof item === 'string') {
          const itemResult = this.sanitizeString(item, options);
          if (itemResult.isValid) {
            sanitized.push(itemResult.sanitized as T);
            if (itemResult.warnings) {
              warnings.push(...itemResult.warnings);
            }
          } else {
            errors.push(`Invalid string item at index ${i}`);
          }
        } else if (typeof item === 'number') {
          const itemResult = this.sanitizeNumber(item);
          if (itemResult.isValid) {
            sanitized.push(itemResult.sanitized as T);
            if (itemResult.warnings) {
              warnings.push(...itemResult.warnings);
            }
          } else {
            errors.push(`Invalid number item at index ${i}`);
          }
        } else if (typeof item === 'boolean') {
          sanitized.push(item);
        } else if (Array.isArray(item)) {
          const itemResult = this.sanitizeArray(item, options);
          if (itemResult.isValid) {
            sanitized.push(itemResult.sanitized as T);
            if (itemResult.warnings) {
              warnings.push(...itemResult.warnings);
            }
          } else {
            errors.push(`Invalid array item at index ${i}`);
          }
        } else if (item !== null && typeof item === 'object') {
          const itemResult = this.sanitizeObject(item, options);
          if (itemResult.isValid) {
            sanitized.push(itemResult.sanitized as T);
            if (itemResult.warnings) {
              warnings.push(...itemResult.warnings);
            }
          } else {
            errors.push(`Invalid object item at index ${i}`);
          }
        } else {
          // Other types (null, undefined, etc.)
          sanitized.push(item);
        }
      }

      return {
        sanitized,
        isValid: errors.length === 0,
        warnings: warnings.length > 0 ? warnings : undefined,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      return {
        sanitized: [],
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Array sanitization failed']
      };
    }
  }

  /**
   * Sanitize any input type
   */
  static sanitize<T = any>(input: T, options: SanitizationOptions = {}): SanitizationResult<T> {
    if (typeof input === 'string') {
      return this.sanitizeString(input, options) as SanitizationResult<T>;
    } else if (typeof input === 'number') {
      return this.sanitizeNumber(input) as SanitizationResult<T>;
    } else if (Array.isArray(input)) {
      return this.sanitizeArray(input, options) as SanitizationResult<T>;
    } else if (input !== null && typeof input === 'object') {
      return this.sanitizeObject(input, options) as SanitizationResult<T>;
    } else {
      // Other types (boolean, null, undefined, etc.)
      return {
        sanitized: input,
        isValid: true
      };
    }
  }
}

// Export default instance
// export const inputSanitizer = new InputSanitizer();
export { InputSanitizer as default };