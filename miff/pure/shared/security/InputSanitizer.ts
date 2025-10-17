/**
 * InputSanitizer - Security utility for validating and sanitizing user input
 * 
 * Provides comprehensive input validation for CLI harnesses and user inputs
 * to prevent command injection, path traversal, and other security vulnerabilities.
 */

export interface ValidationRule {
  type: 'string' | 'number' | 'boolean' | 'path' | 'email' | 'url' | 'json' | 'custom';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  allowedValues?: string[];
  customValidator?: (value: any) => boolean;
  errorMessage?: string;
}

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue?: any;
  errors: string[];
}

export class InputSanitizer {
  
  /**
   * Validate and sanitize a single input value
   */
  static validate(value: any, rule: ValidationRule): ValidationResult {
    const errors: string[] = [];
    
    // Check required
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(rule.errorMessage || 'Value is required');
      return { isValid: false, errors };
    }
    
    // Allow undefined/null for optional fields
    if (!rule.required && (value === undefined || value === null)) {
      return { isValid: true, sanitizedValue: value, errors: [] };
    }
    
    let sanitizedValue = value;
    
    // Type-specific validation
    switch (rule.type) {
      case 'string':
        sanitizedValue = this.sanitizeString(value, rule, errors);
        break;
      case 'number':
        sanitizedValue = this.sanitizeNumber(value, rule, errors);
        break;
      case 'boolean':
        sanitizedValue = this.sanitizeBoolean(value, errors);
        break;
      case 'path':
        sanitizedValue = this.sanitizePath(value, errors);
        break;
      case 'email':
        sanitizedValue = this.sanitizeEmail(value, errors);
        break;
      case 'url':
        sanitizedValue = this.sanitizeUrl(value, errors);
        break;
      case 'json':
        sanitizedValue = this.sanitizeJson(value, errors);
        break;
      case 'custom':
        if (rule.customValidator && !rule.customValidator(value)) {
          errors.push(rule.errorMessage || 'Custom validation failed');
        }
        sanitizedValue = value;
        break;
    }
    
    return {
      isValid: errors.length === 0,
      sanitizedValue,
      errors
    };
  }
  
  /**
   * Validate CLI arguments
   */
  static validateArgs(args: string[], rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];
    const sanitizedValues: any[] = [];
    
    for (let i = 0; i < rules.length; i++) {
      const result = this.validate(args[i], rules[i]);
      if (!result.isValid) {
        errors.push(`Argument ${i}: ${result.errors.join(', ')}`);
      }
      sanitizedValues.push(result.sanitizedValue);
    }
    
    return {
      isValid: errors.length === 0,
      sanitizedValue: sanitizedValues,
      errors
    };
  }
  
  /**
   * Safe process.argv access with validation
   */
  static getSafeArg(index: number, rule: ValidationRule, defaultValue?: any): any {
    const value = process.argv[index];
    
    if (value === undefined) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      if (rule.required) {
        throw new Error(`Required argument at index ${index} is missing`);
      }
      return undefined;
    }
    
    const result = this.validate(value, rule);
    if (!result.isValid) {
      throw new Error(`Invalid argument at index ${index}: ${result.errors.join(', ')}`);
    }
    
    return result.sanitizedValue;
  }
  
  // Private sanitization methods
  
  private static sanitizeString(value: any, rule: ValidationRule, errors: string[]): string {
    const str = String(value);
    
    // Check length
    if (rule.minLength !== undefined && str.length < rule.minLength) {
      errors.push(`String must be at least ${rule.minLength} characters`);
    }
    if (rule.maxLength !== undefined && str.length > rule.maxLength) {
      errors.push(`String must be at most ${rule.maxLength} characters`);
    }
    
    // Check pattern
    if (rule.pattern && !rule.pattern.test(str)) {
      errors.push(rule.errorMessage || 'String does not match required pattern');
    }
    
    // Check allowed values
    if (rule.allowedValues && !rule.allowedValues.includes(str)) {
      errors.push(`Value must be one of: ${rule.allowedValues.join(', ')}`);
    }
    
    // Remove dangerous characters for command injection prevention
    const sanitized = str
      .replace(/[;&|`$()]/g, '') // Remove shell metacharacters
      .replace(/\r?\n/g, '') // Remove newlines
      .trim();
    
    return sanitized;
  }
  
  private static sanitizeNumber(value: any, rule: ValidationRule, errors: string[]): number {
    const num = Number(value);
    
    if (isNaN(num)) {
      errors.push('Value must be a valid number');
      return 0;
    }
    
    if (rule.min !== undefined && num < rule.min) {
      errors.push(`Number must be at least ${rule.min}`);
    }
    if (rule.max !== undefined && num > rule.max) {
      errors.push(`Number must be at most ${rule.max}`);
    }
    
    return num;
  }
  
  private static sanitizeBoolean(value: any, errors: string[]): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    
    const str = String(value).toLowerCase();
    if (str === 'true' || str === '1' || str === 'yes') {
      return true;
    }
    if (str === 'false' || str === '0' || str === 'no') {
      return false;
    }
    
    errors.push('Value must be a valid boolean (true/false)');
    return false;
  }
  
  private static sanitizePath(value: any, errors: string[]): string {
    const str = String(value);
    
    // Prevent path traversal
    if (str.includes('..')) {
      errors.push('Path traversal detected (..)');
      return '';
    }
    
    // Prevent absolute paths to sensitive areas
    if (str.startsWith('/etc') || str.startsWith('/root') || str.startsWith('/sys')) {
      errors.push('Access to system directories is not allowed');
      return '';
    }
    
    // Remove null bytes
    const sanitized = str.replace(/\0/g, '');
    
    // Basic path validation
    if (!/^[a-zA-Z0-9_\-\/\.]+$/.test(sanitized)) {
      errors.push('Path contains invalid characters');
      return '';
    }
    
    return sanitized;
  }
  
  private static sanitizeEmail(value: any, errors: string[]): string {
    const str = String(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(str)) {
      errors.push('Invalid email format');
      return '';
    }
    
    return str.toLowerCase().trim();
  }
  
  private static sanitizeUrl(value: any, errors: string[]): string {
    const str = String(value);
    
    try {
      const url = new URL(str);
      
      // Only allow http/https
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        errors.push('Only HTTP/HTTPS URLs are allowed');
        return '';
      }
      
      return url.toString();
    } catch (e) {
      errors.push('Invalid URL format');
      return '';
    }
  }
  
  private static sanitizeJson(value: any, errors: string[]): any {
    if (typeof value === 'object') {
      return value;
    }
    
    const str = String(value);
    try {
      return JSON.parse(str);
    } catch (e) {
      errors.push('Invalid JSON format');
      return null;
    }
  }
  
  /**
   * Sanitize file path to prevent directory traversal
   */
  static sanitizeFilePath(filePath: string): string {
    return filePath
      .replace(/\.\./g, '') // Remove ..
      .replace(/[;&|`$()]/g, '') // Remove shell metacharacters
      .replace(/\0/g, '') // Remove null bytes
      .trim();
  }
  
  /**
   * Sanitize command to prevent injection
   */
  static sanitizeCommand(command: string): string {
    return command
      .replace(/[;&|`$()]/g, '') // Remove shell metacharacters
      .replace(/\r?\n/g, ' ') // Replace newlines with spaces
      .trim();
  }
  
  /**
   * Validate and sanitize JSON file path
   */
  static validateJsonPath(path: string): ValidationResult {
    return this.validate(path, {
      type: 'path',
      required: true,
      pattern: /\.json$/i,
      errorMessage: 'Path must be a JSON file'
    });
  }
  
  /**
   * Validate numeric ID
   */
  static validateId(id: string | number): ValidationResult {
    if (typeof id === 'number') {
      return this.validate(id, {
        type: 'number',
        required: true,
        min: 0
      });
    }
    
    return this.validate(id, {
      type: 'string',
      required: true,
      pattern: /^[a-zA-Z0-9_-]+$/,
      minLength: 1,
      maxLength: 100,
      errorMessage: 'ID must contain only alphanumeric characters, hyphens, and underscores'
    });
  }
  
  /**
   * Validate difficulty level
   */
  static validateDifficulty(difficulty: string): ValidationResult {
    return this.validate(difficulty, {
      type: 'string',
      required: true,
      allowedValues: ['easy', 'medium', 'hard', 'expert'],
      errorMessage: 'Difficulty must be: easy, medium, hard, or expert'
    });
  }
  
  /**
   * Sanitize object by removing dangerous properties
   */
  static sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    const sanitized: any = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      // Skip prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      
      const value = obj[key];
      
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}

// Export default for convenience
export default InputSanitizer;
