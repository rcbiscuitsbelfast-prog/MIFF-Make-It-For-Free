#!/usr/bin/env tsx

/**
 * MIFF Code Analysis Tools
 * 
 * Automated detection of mocks, TODOs, code quality issues
 * Comprehensive analysis of code patterns and anti-patterns
 */

import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, extname, basename, dirname } from 'path';

interface CodeIssue {
  type: 'mock' | 'todo' | 'hack' | 'error' | 'warning' | 'performance' | 'security' | 'maintainability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  line: number;
  column: number;
  message: string;
  code: string;
  suggestion: string;
  file: string;
}

interface CodeMetrics {
  linesOfCode: number;
  cyclomaticComplexity: number;
  maintainabilityIndex: number;
  technicalDebt: number;
  codeSmells: number;
  duplications: number;
  testCoverage: number;
}

interface FileAnalysis {
  path: string;
  name: string;
  size: number;
  lines: number;
  issues: CodeIssue[];
  metrics: CodeMetrics;
  patterns: {
    hasMocks: boolean;
    hasTODOs: boolean;
    hasHACKs: boolean;
    hasErrors: boolean;
    hasWarnings: boolean;
    hasConsoleLogs: boolean;
    hasDeprecatedCode: boolean;
    hasUnusedImports: boolean;
    hasUnusedVariables: boolean;
    hasLongFunctions: boolean;
    hasDeepNesting: boolean;
    hasMagicNumbers: boolean;
    hasHardcodedStrings: boolean;
  };
  qualityScore: number;
  recommendations: string[];
}

interface AnalysisResults {
  totalFiles: number;
  totalIssues: number;
  files: FileAnalysis[];
  summary: {
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    mockImplementations: number;
    todoComments: number;
    hackComments: number;
    errorHandling: number;
    performanceIssues: number;
    securityIssues: number;
    maintainabilityIssues: number;
  };
  topIssues: CodeIssue[];
  qualityDistribution: { [score: string]: number };
  recommendations: string[];
}

class CodeAnalysisTools {
  private results: AnalysisResults;
  private fileExtensions = ['.ts', '.js', '.tsx', '.jsx'];
  private excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
  private excludeFiles = ['package-lock.json', 'yarn.lock', '.DS_Store'];

  constructor() {
    this.results = {
      totalFiles: 0,
      totalIssues: 0,
      files: [],
      summary: {
        criticalIssues: 0,
        highIssues: 0,
        mediumIssues: 0,
        lowIssues: 0,
        mockImplementations: 0,
        todoComments: 0,
        hackComments: 0,
        errorHandling: 0,
        performanceIssues: 0,
        securityIssues: 0,
        maintainabilityIssues: 0
      },
      topIssues: [],
      qualityDistribution: {},
      recommendations: []
    };
  }

  async analyzeProject(rootPath: string = '/workspace'): Promise<AnalysisResults> {
    console.log('🔍 Starting comprehensive code analysis...');
    console.log(`📁 Analyzing: ${rootPath}`);
    
    await this.analyzeDirectory(rootPath);
    this.analyzeResults();
    this.generateRecommendations();
    
    console.log(`✅ Analysis complete! Found ${this.results.totalIssues} issues in ${this.results.totalFiles} files`);
    return this.results;
  }

  private async analyzeDirectory(dirPath: string, relativePath: string = ''): Promise<void> {
    try {
      const entries = readdirSync(dirPath);
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry);
        const relativeEntryPath = join(relativePath, entry);
        
        // Skip excluded directories
        if (this.excludeDirs.includes(entry)) {
          continue;
        }
        
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          await this.analyzeDirectory(fullPath, relativeEntryPath);
        } else if (stat.isFile()) {
          const ext = extname(entry);
          if (this.fileExtensions.includes(ext) && !this.excludeFiles.includes(entry)) {
            await this.analyzeFile(fullPath, relativeEntryPath);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not analyze directory ${dirPath}: ${error}`);
    }
  }

  private async analyzeFile(filePath: string, relativePath: string): Promise<void> {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const stat = statSync(filePath);
      const lines = content.split('\n');
      
      const analysis: FileAnalysis = {
        path: relativePath,
        name: basename(filePath, extname(filePath)),
        size: stat.size,
        lines: lines.length,
        issues: [],
        metrics: this.calculateMetrics(content, lines),
        patterns: {
          hasMocks: false,
          hasTODOs: false,
          hasHACKs: false,
          hasErrors: false,
          hasWarnings: false,
          hasConsoleLogs: false,
          hasDeprecatedCode: false,
          hasUnusedImports: false,
          hasUnusedVariables: false,
          hasLongFunctions: false,
          hasDeepNesting: false,
          hasMagicNumbers: false,
          hasHardcodedStrings: false
        },
        qualityScore: 0,
        recommendations: []
      };

      // Analyze each line
      lines.forEach((line, index) => {
        this.analyzeLine(line, index + 1, analysis, filePath);
      });

      // Calculate quality score
      analysis.qualityScore = this.calculateQualityScore(analysis);
      
      // Generate file-specific recommendations
      this.generateFileRecommendations(analysis);
      
      this.results.files.push(analysis);
      this.results.totalFiles++;
      this.results.totalIssues += analysis.issues.length;
      
    } catch (error) {
      console.warn(`⚠️  Could not analyze file ${filePath}: ${error}`);
    }
  }

  private analyzeLine(line: string, lineNumber: number, analysis: FileAnalysis, filePath: string): void {
    const trimmedLine = line.trim();
    
    // Check for mocks
    if (this.isMockCode(trimmedLine)) {
      analysis.patterns.hasMocks = true;
      analysis.issues.push({
        type: 'mock',
        severity: 'medium',
        line: lineNumber,
        column: line.indexOf(trimmedLine) + 1,
        message: 'Mock implementation detected',
        code: trimmedLine,
        suggestion: 'Replace with real implementation',
        file: analysis.path
      });
    }
    
    // Check for TODOs
    if (this.isTodoComment(trimmedLine)) {
      analysis.patterns.hasTODOs = true;
      analysis.issues.push({
        type: 'todo',
        severity: 'low',
        line: lineNumber,
        column: line.indexOf(trimmedLine) + 1,
        message: 'TODO comment found',
        code: trimmedLine,
        suggestion: 'Address TODO or remove if obsolete',
        file: analysis.path
      });
    }
    
    // Check for HACKs
    if (this.isHackComment(trimmedLine)) {
      analysis.patterns.hasHACKs = true;
      analysis.issues.push({
        type: 'hack',
        severity: 'high',
        line: lineNumber,
        column: line.indexOf(trimmedLine) + 1,
        message: 'HACK comment found',
        code: trimmedLine,
        suggestion: 'Refactor hack into proper solution',
        file: analysis.path
      });
    }
    
    // Check for errors
    if (this.isErrorCode(trimmedLine)) {
      analysis.patterns.hasErrors = true;
      analysis.issues.push({
        type: 'error',
        severity: 'high',
        line: lineNumber,
        column: line.indexOf(trimmedLine) + 1,
        message: 'Error handling detected',
        code: trimmedLine,
        suggestion: 'Ensure proper error handling',
        file: analysis.path
      });
    }
    
    // Check for console logs
    if (this.isConsoleLog(trimmedLine)) {
      analysis.patterns.hasConsoleLogs = true;
      analysis.issues.push({
        type: 'warning',
        severity: 'low',
        line: lineNumber,
        column: line.indexOf(trimmedLine) + 1,
        message: 'Console log found',
        code: trimmedLine,
        suggestion: 'Remove or replace with proper logging',
        file: analysis.path
      });
    }
    
    // Check for deprecated code
    if (this.isDeprecatedCode(trimmedLine)) {
      analysis.patterns.hasDeprecatedCode = true;
      analysis.issues.push({
        type: 'warning',
        severity: 'medium',
        line: lineNumber,
        column: line.indexOf(trimmedLine) + 1,
        message: 'Deprecated code detected',
        code: trimmedLine,
        suggestion: 'Update to modern alternatives',
        file: analysis.path
      });
    }
    
    // Check for magic numbers
    if (this.isMagicNumber(trimmedLine)) {
      analysis.patterns.hasMagicNumbers = true;
      analysis.issues.push({
        type: 'maintainability',
        severity: 'low',
        line: lineNumber,
        column: line.indexOf(trimmedLine) + 1,
        message: 'Magic number detected',
        code: trimmedLine,
        suggestion: 'Extract to named constant',
        file: analysis.path
      });
    }
    
    // Check for hardcoded strings
    if (this.isHardcodedString(trimmedLine)) {
      analysis.patterns.hasHardcodedStrings = true;
      analysis.issues.push({
        type: 'maintainability',
        severity: 'low',
        line: lineNumber,
        column: line.indexOf(trimmedLine) + 1,
        message: 'Hardcoded string detected',
        code: trimmedLine,
        suggestion: 'Extract to configuration or constants',
        file: analysis.path
      });
    }
    
    // Check for long functions
    if (this.isLongFunction(trimmedLine, analysis)) {
      analysis.patterns.hasLongFunctions = true;
    }
    
    // Check for deep nesting
    if (this.isDeepNesting(trimmedLine, analysis)) {
      analysis.patterns.hasDeepNesting = true;
    }
  }

  private isMockCode(line: string): boolean {
    const mockPatterns = [
      /mock/i,
      /fake/i,
      /stub/i,
      /simulate/i,
      /setTimeout.*resolve/i,
      /Math\.random/i,
      /console\.log.*mock/i,
      /return\s*\{\s*[^}]*mock/i,
      /placeholder/i,
      /dummy/i
    ];
    
    return mockPatterns.some(pattern => pattern.test(line));
  }

  private isTodoComment(line: string): boolean {
    return /\/\/\s*TODO|\/\*\s*TODO|#\s*TODO/i.test(line);
  }

  private isHackComment(line: string): boolean {
    return /\/\/\s*HACK|\/\*\s*HACK|#\s*HACK/i.test(line);
  }

  private isErrorCode(line: string): boolean {
    return /throw\s+new\s+Error|Error:|TypeError|ReferenceError|SyntaxError/i.test(line);
  }

  private isConsoleLog(line: string): boolean {
    return /console\.(log|warn|error|info|debug)/.test(line);
  }

  private isDeprecatedCode(line: string): boolean {
    const deprecatedPatterns = [
      /deprecated/i,
      /@deprecated/i,
      /legacy/i,
      /old/i,
      /outdated/i
    ];
    
    return deprecatedPatterns.some(pattern => pattern.test(line));
  }

  private isMagicNumber(line: string): boolean {
    return /\b\d{3,}\b/.test(line) && !line.includes('//') && !line.includes('/*');
  }

  private isHardcodedString(line: string): boolean {
    return /"[^"]{20,}"|'[^']{20,}'/.test(line) && !line.includes('//') && !line.includes('/*');
  }

  private isLongFunction(line: string, analysis: FileAnalysis): boolean {
    // Simple heuristic: function with many lines
    return line.includes('function') && analysis.lines > 50;
  }

  private isDeepNesting(line: string, analysis: FileAnalysis): boolean {
    // Simple heuristic: many indentation levels
    const indentLevel = line.length - line.trimStart().length;
    return indentLevel > 8;
  }

  private calculateMetrics(content: string, lines: string[]): CodeMetrics {
    return {
      linesOfCode: lines.length,
      cyclomaticComplexity: this.calculateCyclomaticComplexity(content),
      maintainabilityIndex: this.calculateMaintainabilityIndex(content, lines),
      technicalDebt: this.calculateTechnicalDebt(content),
      codeSmells: this.countCodeSmells(content),
      duplications: this.countDuplications(content),
      testCoverage: this.calculateTestCoverage(content)
    };
  }

  private calculateCyclomaticComplexity(content: string): number {
    const complexityKeywords = [
      'if', 'else', 'while', 'for', 'switch', 'case', 'catch', '&&', '||', '?'
    ];
    
    let complexity = 1; // Base complexity
    
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }

  private calculateMaintainabilityIndex(content: string, lines: string[]): number {
    const halsteadVolume = this.calculateHalsteadVolume(content);
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(content);
    const linesOfCode = lines.length;
    
    // Simplified maintainability index calculation
    const maintainabilityIndex = 171 - 5.2 * Math.log(halsteadVolume) - 0.23 * cyclomaticComplexity - 16.2 * Math.log(linesOfCode);
    
    return Math.max(0, Math.min(100, maintainabilityIndex));
  }

  private calculateHalsteadVolume(content: string): number {
    // Simplified Halstead volume calculation
    const operators = content.match(/[+\-*/=<>!&|^~%]+/g) || [];
    const operands = content.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
    
    const uniqueOperators = new Set(operators).size;
    const uniqueOperands = new Set(operands).size;
    const totalOperators = operators.length;
    const totalOperands = operands.length;
    
    return (totalOperators + totalOperands) * Math.log2(uniqueOperators + uniqueOperands);
  }

  private calculateTechnicalDebt(content: string): number {
    let debt = 0;
    
    // TODOs add 1 point each
    const todos = content.match(/TODO/gi) || [];
    debt += todos.length;
    
    // HACKs add 5 points each
    const hacks = content.match(/HACK/gi) || [];
    debt += hacks.length * 5;
    
    // Console logs add 0.5 points each
    const consoleLogs = content.match(/console\.(log|warn|error|info|debug)/g) || [];
    debt += consoleLogs.length * 0.5;
    
    // Magic numbers add 0.2 points each
    const magicNumbers = content.match(/\b\d{3,}\b/g) || [];
    debt += magicNumbers.length * 0.2;
    
    return debt;
  }

  private countCodeSmells(content: string): number {
    let smells = 0;
    
    // Long functions (simplified)
    const functions = content.match(/function\s+\w+/g) || [];
    smells += functions.length;
    
    // Deep nesting (simplified)
    const deepNesting = content.match(/^\s{8,}/gm) || [];
    smells += deepNesting.length;
    
    // Duplicate code (simplified)
    const duplicateLines = this.findDuplicateLines(content);
    smells += duplicateLines.length;
    
    return smells;
  }

  private countDuplications(content: string): number {
    const lines = content.split('\n');
    const lineCounts = new Map<string, number>();
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.length > 10) { // Only count substantial lines
        lineCounts.set(trimmed, (lineCounts.get(trimmed) || 0) + 1);
      }
    });
    
    return Array.from(lineCounts.values()).filter(count => count > 1).length;
  }

  private findDuplicateLines(content: string): string[] {
    const lines = content.split('\n');
    const lineCounts = new Map<string, number>();
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.length > 10) {
        lineCounts.set(trimmed, (lineCounts.get(trimmed) || 0) + 1);
      }
    });
    
    return Array.from(lineCounts.entries())
      .filter(([line, count]) => count > 1)
      .map(([line]) => line);
  }

  private calculateTestCoverage(content: string): number {
    const testKeywords = ['test', 'describe', 'it', 'expect', 'assert'];
    const testLines = testKeywords.reduce((count, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = content.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    const totalLines = content.split('\n').length;
    return totalLines > 0 ? (testLines / totalLines) * 100 : 0;
  }

  private calculateQualityScore(analysis: FileAnalysis): number {
    let score = 100;
    
    // Deduct points for issues
    analysis.issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 20;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 1;
          break;
      }
    });
    
    // Deduct points for patterns
    if (analysis.patterns.hasMocks) score -= 15;
    if (analysis.patterns.hasHACKs) score -= 20;
    if (analysis.patterns.hasTODOs) score -= 5;
    if (analysis.patterns.hasConsoleLogs) score -= 3;
    if (analysis.patterns.hasDeprecatedCode) score -= 10;
    if (analysis.patterns.hasLongFunctions) score -= 5;
    if (analysis.patterns.hasDeepNesting) score -= 8;
    if (analysis.patterns.hasMagicNumbers) score -= 2;
    if (analysis.patterns.hasHardcodedStrings) score -= 3;
    
    // Bonus for good practices
    if (analysis.metrics.testCoverage > 50) score += 10;
    if (analysis.metrics.maintainabilityIndex > 70) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private generateFileRecommendations(analysis: FileAnalysis): void {
    const recommendations: string[] = [];
    
    if (analysis.patterns.hasMocks) {
      recommendations.push('Replace mock implementations with real functionality');
    }
    
    if (analysis.patterns.hasTODOs) {
      recommendations.push('Address TODO comments or remove if obsolete');
    }
    
    if (analysis.patterns.hasHACKs) {
      recommendations.push('Refactor HACK comments into proper solutions');
    }
    
    if (analysis.patterns.hasConsoleLogs) {
      recommendations.push('Replace console logs with proper logging system');
    }
    
    if (analysis.patterns.hasDeprecatedCode) {
      recommendations.push('Update deprecated code to modern alternatives');
    }
    
    if (analysis.patterns.hasLongFunctions) {
      recommendations.push('Break down long functions into smaller, focused functions');
    }
    
    if (analysis.patterns.hasDeepNesting) {
      recommendations.push('Reduce nesting depth for better readability');
    }
    
    if (analysis.patterns.hasMagicNumbers) {
      recommendations.push('Extract magic numbers to named constants');
    }
    
    if (analysis.patterns.hasHardcodedStrings) {
      recommendations.push('Extract hardcoded strings to configuration files');
    }
    
    if (analysis.metrics.testCoverage < 50) {
      recommendations.push('Increase test coverage');
    }
    
    if (analysis.metrics.maintainabilityIndex < 50) {
      recommendations.push('Improve code maintainability');
    }
    
    analysis.recommendations = recommendations;
  }

  private analyzeResults(): void {
    // Count issues by severity
    this.results.files.forEach(file => {
      file.issues.forEach(issue => {
        switch (issue.severity) {
          case 'critical':
            this.results.summary.criticalIssues++;
            break;
          case 'high':
            this.results.summary.highIssues++;
            break;
          case 'medium':
            this.results.summary.mediumIssues++;
            break;
          case 'low':
            this.results.summary.lowIssues++;
            break;
        }
        
        switch (issue.type) {
          case 'mock':
            this.results.summary.mockImplementations++;
            break;
          case 'todo':
            this.results.summary.todoComments++;
            break;
          case 'hack':
            this.results.summary.hackComments++;
            break;
          case 'error':
            this.results.summary.errorHandling++;
            break;
          case 'performance':
            this.results.summary.performanceIssues++;
            break;
          case 'security':
            this.results.summary.securityIssues++;
            break;
          case 'maintainability':
            this.results.summary.maintainabilityIssues++;
            break;
        }
      });
    });
    
    // Get top issues
    this.results.topIssues = this.results.files
      .flatMap(file => file.issues)
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
      .slice(0, 50);
    
    // Calculate quality distribution
    this.results.files.forEach(file => {
      const scoreRange = Math.floor(file.qualityScore / 20) * 20;
      const rangeKey = `${scoreRange}-${scoreRange + 19}`;
      this.results.qualityDistribution[rangeKey] = (this.results.qualityDistribution[rangeKey] || 0) + 1;
    });
  }

  private generateRecommendations(): void {
    const recommendations: string[] = [];
    
    if (this.results.summary.mockImplementations > 0) {
      recommendations.push(`Replace ${this.results.summary.mockImplementations} mock implementations with real functionality`);
    }
    
    if (this.results.summary.todoComments > 0) {
      recommendations.push(`Address ${this.results.summary.todoComments} TODO comments`);
    }
    
    if (this.results.summary.hackComments > 0) {
      recommendations.push(`Refactor ${this.results.summary.hackComments} HACK comments`);
    }
    
    if (this.results.summary.consoleLogs > 0) {
      recommendations.push(`Replace ${this.results.summary.consoleLogs} console logs with proper logging`);
    }
    
    if (this.results.summary.performanceIssues > 0) {
      recommendations.push(`Fix ${this.results.summary.performanceIssues} performance issues`);
    }
    
    if (this.results.summary.securityIssues > 0) {
      recommendations.push(`Address ${this.results.summary.securityIssues} security issues`);
    }
    
    if (this.results.summary.maintainabilityIssues > 0) {
      recommendations.push(`Improve ${this.results.summary.maintainabilityIssues} maintainability issues`);
    }
    
    this.results.recommendations = recommendations;
  }

  generateReport(): string {
    const timestamp = new Date().toISOString().split('T')[0];
    
    let report = `MIFF Code Analysis Tools Report
Generated: ${new Date().toISOString()}
========================================

SUMMARY
-------
Total Files Analyzed: ${this.results.totalFiles}
Total Issues Found: ${this.results.totalIssues}

Issue Severity:
- Critical: ${this.results.summary.criticalIssues}
- High: ${this.results.summary.highIssues}
- Medium: ${this.results.summary.mediumIssues}
- Low: ${this.results.summary.lowIssues}

Issue Types:
- Mock Implementations: ${this.results.summary.mockImplementations}
- TODO Comments: ${this.results.summary.todoComments}
- HACK Comments: ${this.results.summary.hackComments}
- Error Handling: ${this.results.summary.errorHandling}
- Performance Issues: ${this.results.summary.performanceIssues}
- Security Issues: ${this.results.summary.securityIssues}
- Maintainability Issues: ${this.results.summary.maintainabilityIssues}

Quality Distribution:
${Object.entries(this.results.qualityDistribution).map(([range, count]) => 
  `  ${range}: ${count} files`
).join('\n')}

TOP ISSUES
----------
${this.results.topIssues.slice(0, 20).map(issue => 
  `${issue.severity.toUpperCase()}: ${issue.message} (${issue.file}:${issue.line})`
).join('\n')}

RECOMMENDATIONS
---------------
${this.results.recommendations.map(rec => `- ${rec}`).join('\n')}

DETAILED FILE ANALYSIS
----------------------
`;

    this.results.files.forEach(file => {
      report += `\n${file.path}:
  Quality Score: ${file.qualityScore}/100
  Issues: ${file.issues.length}
  Lines: ${file.lines}
  Size: ${file.size} bytes
  
  Patterns:
    Mocks: ${file.patterns.hasMocks}
    TODOs: ${file.patterns.hasTODOs}
    HACKs: ${file.patterns.hasHACKs}
    Errors: ${file.patterns.hasErrors}
    Console Logs: ${file.patterns.hasConsoleLogs}
    Deprecated: ${file.patterns.hasDeprecatedCode}
    Long Functions: ${file.patterns.hasLongFunctions}
    Deep Nesting: ${file.patterns.hasDeepNesting}
    Magic Numbers: ${file.patterns.hasMagicNumbers}
    Hardcoded Strings: ${file.patterns.hasHardcodedStrings}
  
  Metrics:
    Lines of Code: ${file.metrics.linesOfCode}
    Cyclomatic Complexity: ${file.metrics.cyclomaticComplexity}
    Maintainability Index: ${file.metrics.maintainabilityIndex}
    Technical Debt: ${file.metrics.technicalDebt}
    Code Smells: ${file.metrics.codeSmells}
    Duplications: ${file.metrics.duplications}
    Test Coverage: ${file.metrics.testCoverage.toFixed(1)}%
  
  Issues:
${file.issues.map(issue => `    ${issue.severity.toUpperCase()}: ${issue.message} (line ${issue.line})`).join('\n')}
  
  Recommendations:
${file.recommendations.map(rec => `    - ${rec}`).join('\n')}
`;
    });

    return report;
  }
}

// Main execution
async function main() {
  const analyzer = new CodeAnalysisTools();
  const results = await analyzer.analyzeProject();
  
  // Generate and save report
  const report = analyzer.generateReport();
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = `/workspace/docs/archive/test-results/${timestamp}-code-analysis-report.txt`;
  
  // Ensure directory exists
  const fs = await import('fs');
  const path = await import('path');
  const dir = path.dirname(reportPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, report);
  
  console.log(`\n📊 Report saved to: ${reportPath}`);
  console.log(`\n📈 Summary:`);
  console.log(`   Total Files: ${results.totalFiles}`);
  console.log(`   Total Issues: ${results.totalIssues}`);
  console.log(`   Critical Issues: ${results.summary.criticalIssues}`);
  console.log(`   Mock Implementations: ${results.summary.mockImplementations}`);
  console.log(`   TODO Comments: ${results.summary.todoComments}`);
  console.log(`   HACK Comments: ${results.summary.hackComments}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}