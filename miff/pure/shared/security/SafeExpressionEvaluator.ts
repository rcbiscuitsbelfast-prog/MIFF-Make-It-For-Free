/**
 * SafeExpressionEvaluator - Secure mathematical expression evaluator
 * 
 * Replaces unsafe eval() usage with a safe, sandboxed expression evaluator
 * that only supports basic mathematical operations and prevents code injection.
 * 
 * @version 1.0.0
 * @author MIFF Framework Security Team
 */

export interface ExpressionContext {
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
  [key: string]: number | string | boolean;
}

export interface EvaluationResult {
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
  success: boolean;
  error?: string;
}

export class SafeExpressionEvaluator {
  private static readonly ALLOWED_OPERATORS = ['+', '-', '*', '/', '%', '(', ')', '^'];
  private static readonly ALLOWED_FUNCTIONS = ['abs', 'ceil', 'floor', 'round', 'min', 'max', 'sqrt', 'pow'];
  private static readonly ALLOWED_CONSTANTS = ['pi', 'e'];

  /**
   * Safely evaluate a mathematical expression
   */
  static evaluate(expression: string, context: ExpressionContext = {}): EvaluationResult {
    try {
      // Validate expression safety
      if (!this.isExpressionSafe(expression)) {
        return {
          result: 0,
          success: false,
          error: 'Expression contains unsafe characters or operations'
        };
      }

      // Replace context variables
      let processedExpression = this.replaceContextVariables(expression, context);
      
      // Replace constants
      processedExpression = this.replaceConstants(processedExpression);
      
      // Replace functions
      processedExpression = this.replaceFunctions(processedExpression);
      
      // Evaluate the expression
      const result = this.evaluateExpression(processedExpression);
      
      return {
        result,
        success: true
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        result: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if expression is safe to evaluate
   */
  private static isExpressionSafe(expression: string): boolean {
    // Remove whitespace for validation
    const cleanExpression = expression.replace(/\s/g, '');
    
    // Check for dangerous patterns
    const dangerousPatterns = [
      /eval\s*\(/i,
      /function\s*\(/i,
      /=>/,
      /new\s+\w+/i,
      /\.\w+\s*\(/i,
      /\[.*\]/,
      /{.*}/,
      /['"`]/,
      /;|&|\||`|\$/
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(cleanExpression)) {
        return false;
      }
    }

    // Check for only allowed characters
    const allowedPattern = /^[0-9+\-*/.()^a-zA-Z\s]+$/;
    if (!allowedPattern.test(cleanExpression)) {
      return false;
    }

    return true;
  }

  /**
   * Replace context variables in expression
   */
  private static replaceContextVariables(expression: string, context: ExpressionContext): string {
    let result = expression;
    
    for (const [key, value] of Object.entries(context)) {
      if (typeof value === 'number') {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        result = result.replace(regex, value.toString());
      }
    }
    
    return result;
  }

  /**
   * Replace mathematical constants
   */
  private static replaceConstants(expression: string): string {
    let result = expression;
    
    result = result.replace(/\bpi\b/gi, Math.PI.toString());
    result = result.replace(/\be\b/gi, Math.E.toString());
    
    return result;
  }

  /**
   * Replace mathematical functions
   */
  private static replaceFunctions(expression: string): string {
    let result = expression;
    
    // Replace function calls with their results
    result = result.replace(/\babs\s*\(([^)]+)\)/gi, (match, arg) => {
      const value = this.evaluateExpression(arg);
      return Math.abs(value).toString();
    });
    
    result = result.replace(/\bceil\s*\(([^)]+)\)/gi, (match, arg) => {
      const value = this.evaluateExpression(arg);
      return Math.ceil(value).toString();
    });
    
    result = result.replace(/\bfloor\s*\(([^)]+)\)/gi, (match, arg) => {
      const value = this.evaluateExpression(arg);
      return Math.floor(value).toString();
    });
    
    result = result.replace(/\bround\s*\(([^)]+)\)/gi, (match, arg) => {
      const value = this.evaluateExpression(arg);
      return Math.round(value).toString();
    });
    
    result = result.replace(/\bmin\s*\(([^)]+)\)/gi, (match, arg) => {
      const values = arg.split(',').map((v: any) => this.evaluateExpression(v.trim()));
      return Math.min(...values).toString();
    });
    
    result = result.replace(/\bmax\s*\(([^)]+)\)/gi, (match, arg) => {
      const values = arg.split(',').map((v: any) => this.evaluateExpression(v.trim()));
      return Math.max(...values).toString();
    });
    
    result = result.replace(/\bsqrt\s*\(([^)]+)\)/gi, (match, arg) => {
      const value = this.evaluateExpression(arg);
      return Math.sqrt(value).toString();
    });
    
    result = result.replace(/\bpow\s*\(([^,)]+),\s*([^)]+)\)/gi, (match, base, exp) => {
      const baseValue = this.evaluateExpression(base);
      const expValue = this.evaluateExpression(exp);
      return Math.pow(baseValue, expValue).toString();
    });
    
    return result;
  }

  /**
   * Evaluate a basic mathematical expression
   */
  private static evaluateExpression(expression: string): number {
    // Remove whitespace
    const cleanExpression = expression.replace(/\s/g, '');
    
    // Handle parentheses first
    if (cleanExpression.includes('(')) {
      return this.evaluateWithParentheses(cleanExpression);
    }
    
    // Handle exponentiation
    if (cleanExpression.includes('^')) {
      return this.evaluateWithExponentiation(cleanExpression);
    }
    
    // Handle multiplication and division
    if (cleanExpression.includes('*') || cleanExpression.includes('/')) {
      return this.evaluateWithMultiplication(cleanExpression);
    }
    
    // Handle addition and subtraction
    if (cleanExpression.includes('+') || cleanExpression.includes('-')) {
      return this.evaluateWithAddition(cleanExpression);
    }
    
    // Single number
    const num = parseFloat(cleanExpression);
    if (isNaN(num)) {
      throw new Error(`Invalid number: ${cleanExpression}`);
    }
    
    return num;
  }

  /**
   * Evaluate expression with parentheses
   */
  private static evaluateWithParentheses(expression: string): number {
    let result = expression;
    
    while (result.includes('(')) {
      const lastOpen = result.lastIndexOf('(');
      const nextClose = result.indexOf(')', lastOpen);
      
      if (nextClose === -1) {
        throw new Error('Mismatched parentheses');
      }
      
      const innerExpression = result.substring(lastOpen + 1, nextClose);
      const innerResult = this.evaluateExpression(innerExpression);
      
      result = result.substring(0, lastOpen) + innerResult.toString() + result.substring(nextClose + 1);
    }
    
    return this.evaluateExpression(result);
  }

  /**
   * Evaluate expression with exponentiation
   */
  private static evaluateWithExponentiation(expression: string): number {
    const parts = expression.split('^');
    if (parts.length !== 2) {
      throw new Error('Invalid exponentiation expression');
    }
    
    const base = this.evaluateExpression(parts[0!]);
    const exponent = this.evaluateExpression(parts[1!]);
    
    return Math.pow(base, exponent);
  }

  /**
   * Evaluate expression with multiplication and division
   */
  private static evaluateWithMultiplication(expression: string): number {
    const parts = expression.split(/([*/])/);
    if (parts.length < 3) {
      throw new Error('Invalid multiplication/division expression');
    }
    
    let result = this.evaluateExpression(parts[0!]);
    
    for (let i = 1; i < parts.length; i += 2) {
      const operator = parts[i];
      const operand = this.evaluateExpression(parts[i + 1]);
      
      if (operator === '*') {
        result *= operand;
      } else if (operator === '/') {
        if (operand === 0) {
          throw new Error('Division by zero');
        }
        result /= operand;
      }
    }
    
    return result;
  }

  /**
   * Evaluate expression with addition and subtraction
   */
  private static evaluateWithAddition(expression: string): number {
    const parts = expression.split(/([+-])/);
    if (parts.length < 3) {
      throw new Error('Invalid addition/subtraction expression');
    }
    
    let result = this.evaluateExpression(parts[0!]);
    
    for (let i = 1; i < parts.length; i += 2) {
      const operator = parts[i];
      const operand = this.evaluateExpression(parts[i + 1]);
      
      if (operator === '+') {
        result += operand;
      } else if (operator === '-') {
        result -= operand;
      }
    }
    
    return result;
  }
}

// Export default instance
// export const safeExpressionEvaluator = new SafeExpressionEvaluator();
export { SafeExpressionEvaluator as default };