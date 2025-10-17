/**
 * SafePathUtils - Secure path operations to prevent traversal attacks
 * 
 * Provides safe alternatives to path operations that prevent directory
 * traversal attacks and ensure files are accessed within allowed directories.
 * 
 * @version 1.0.0
 * @author MIFF Framework Security Team
 */

import * as path from 'path';
import * as fs from 'fs';

export interface PathValidationResult {
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
  isValid: boolean;
  normalizedPath: string;
  error?: string;
  warnings?: string[];
}

export class SafePathUtils {
  private static readonly ALLOWED_EXTENSIONS = ['.json', '.ts', '.js', '.md', '.txt', '.html', '.css'];
  private static readonly MAX_PATH_LENGTH = 4096;
  private static readonly MAX_FILENAME_LENGTH = 255;

  /**
   * Safely resolve a path within allowed directories
   */
  static safeResolve(basePath: string, inputPath: string, allowedDirs?: string[]): PathValidationResult {
    try {
      // Validate input parameters
      if (!this.isValidPathString(basePath) || !this.isValidPathString(inputPath)) {
        return {
          isValid: false,
          normalizedPath: '',
          error: 'Invalid path string format'
        };
      }

      // Normalize the base path
      const normalizedBase = path.resolve(basePath);
      
      // Normalize the input path
      let normalizedInput = path.normalize(inputPath);
      
      // Remove any leading path separators to prevent absolute path injection
      normalizedInput = normalizedInput.replace(/^[\/\\]+/, '');
      
      // Resolve the full path
      const fullPath = path.resolve(normalizedBase, normalizedInput);
      
      // Check if the resolved path is within the base directory
      if (!fullPath.startsWith(normalizedBase)) {
        return {
          isValid: false,
          normalizedPath: '',
          error: 'Path traversal detected - path outside allowed directory'
        };
      }

      // Check against allowed directories if provided
      if (allowedDirs && allowedDirs.length > 0) {
        const isInAllowedDir = allowedDirs.some(dir => {
          const normalizedDir = path.resolve(dir);
          return fullPath.startsWith(normalizedDir);
        });
        
        if (!isInAllowedDir) {
          return {
            isValid: false,
            normalizedPath: '',
            error: 'Path not in allowed directories'
          };
        }
      }

      // Validate file extension if it's a file
      if (this.isFilePath(fullPath)) {
        const ext = path.extname(fullPath).toLowerCase();
        if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
          return {
            isValid: false,
            normalizedPath: '',
            error: `File extension not allowed: ${ext}`
          };
        }
      }

      // Check path length limits
      if (fullPath.length > this.MAX_PATH_LENGTH) {
        return {
          isValid: false,
          normalizedPath: '',
          error: `Path too long: ${fullPath.length} > ${this.MAX_PATH_LENGTH}`
        };
      }

      // Check filename length
      const filename = path.basename(fullPath);
      if (filename.length > this.MAX_FILENAME_LENGTH) {
        return {
          isValid: false,
          normalizedPath: '',
          error: `Filename too long: ${filename.length} > ${this.MAX_FILENAME_LENGTH}`
        };
      }

      return {
        isValid: true,
        normalizedPath: fullPath
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        isValid: false,
        normalizedPath: '',
        error: error instanceof Error ? message: 'Path validation failed'
      };
    }
  }

  /**
   * Safely read a file with path validation
   */
  static safeReadFile(filePath: string, basePath: string, allowedDirs?: string[]): { success: boolean; data?: string; error?: string } {
    try {
      const validation = this.safeResolve(basePath, filePath, allowedDirs);
      
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Check if file exists
      if (!fs.existsSync(validation.normalizedPath)) {
        return {
          success: false,
          error: 'File does not exist'
        };
      }

      // Check if it's actually a file (not a directory)
      const stats = fs.statSync(validation.normalizedPath);
      if (!stats.isFile()) {
        return {
          success: false,
          error: 'Path is not a file'
        };
      }

      // Read the file
      const data = fs.readFileSync(validation.normalizedPath, 'utf-8');
      
      return {
        success: true,
        data
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        error: error instanceof Error ? message: 'File read failed'
      };
    }
  }

  /**
   * Safely write a file with path validation
   */
  static safeWriteFile(filePath: string, data: string, basePath: string, allowedDirs?: string[]): { success: boolean; error?: string } {
    try {
      const validation = this.safeResolve(basePath, filePath, allowedDirs);
      
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Ensure directory exists
      const dir = path.dirname(validation.normalizedPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write the file
      fs.writeFileSync(validation.normalizedPath, data, 'utf-8');
      
      return {
        success: true
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        error: error instanceof Error ? message: 'File write failed'
      };
    }
  }

  /**
   * Check if a path string is valid
   */
  private static isValidPathString(pathStr: string): boolean {
    if (typeof pathStr !== 'string') {
      return false;
    }

    if (pathStr.length === 0) {
      return false;
    }

    if (pathStr.length > this.MAX_PATH_LENGTH) {
      return false;
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      /\.\./g,  // Directory traversal
      /\/\.\./g,  // Directory traversal with slash
      /\\\.\./g,  // Directory traversal with backslash
      /null/i,  // Null bytes
      /\x00/g,  // Null bytes
      /[\x01-\x1f]/g,  // Control characters
      /[<>:"|?*]/g  // Invalid filename characters
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(pathStr)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if a path is a file (not a directory)
   */
  private static isFilePath(pathStr: string): boolean {
    return path.extname(pathStr) !== '';
  }

  /**
   * Get safe working directory for a module
   */
  static getSafeWorkingDir(modulePath: string): string {
    const moduleDir = path.dirname(modulePath);
    return path.resolve(moduleDir);
  }

  /**
   * Get allowed directories for a module
   */
  static getAllowedDirs(modulePath: string): string[] {
    const moduleDir = path.dirname(modulePath);
    const projectRoot = this.findProjectRoot(moduleDir);
    
    return [
      moduleDir,
      path.join(moduleDir, 'tests'),
      path.join(moduleDir, 'fixtures'),
      path.join(projectRoot, 'miff'),
      path.join(projectRoot, 'docs'),
      path.join(projectRoot, 'scripts')
    ];
  }

  /**
   * Find project root directory
   */
  private static findProjectRoot(startPath: string): string {
    let currentPath = startPath;
    
    while (currentPath !== path.dirname(currentPath)) {
      if (fs.existsSync(path.join(currentPath, 'package.json'))) {
        return currentPath;
      }
      currentPath = path.dirname(currentPath);
    }
    
    return startPath;
  }
}

// Export default instance
// export const safePathUtils = new SafePathUtils();
export { SafePathUtils as default };