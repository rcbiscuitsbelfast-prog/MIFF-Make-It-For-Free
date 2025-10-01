#!/usr/bin/env tsx

/**
 * Phase 2 TODO Analyzer
 * 
 * Identifies and addresses critical TODO comments that block functionality
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

interface TodoAnalysis {
  module: string;
  file: string;
  line: number;
  todo: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'blocking' | 'feature' | 'optimization' | 'documentation' | 'cleanup';
  description: string;
}

class Phase2TodoAnalyzer {
  private todos: TodoAnalysis[] = [];
  private pureDir = '/workspace/miff/pure';

  async analyzeTodos(): Promise<TodoAnalysis[]> {
    console.log('🔍 Analyzing TODO comments...');
    
    await this.scanAllModules();
    this.categorizeTodos();
    
    console.log(`📊 Found ${this.todos.length} TODO comments`);
    return this.todos;
  }

  private async scanAllModules(): Promise<void> {
    try {
      const entries = readdirSync(this.pureDir);
      
      for (const entry of entries) {
        const fullPath = join(this.pureDir, entry);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          await this.analyzeModule(entry, fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not scan pure modules: ${error}`);
    }
  }

  private async analyzeModule(moduleName: string, modulePath: string): Promise<void> {
    try {
      // Check for TypeScript files
      const files = readdirSync(modulePath);
      for (const file of files) {
        if (file.endsWith('.ts') && !file.endsWith('.test.ts') && !file.endsWith('.d.ts')) {
          const filePath = join(modulePath, file);
          const content = readFileSync(filePath, 'utf-8');
          await this.analyzeFile(moduleName, file, content);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not analyze module ${moduleName}: ${error}`);
    }
  }

  private async analyzeFile(moduleName: string, fileName: string, content: string): Promise<void> {
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const todoMatch = line.match(/(?:TODO|FIXME|HACK|XXX|NOTE):\s*(.+)/i);
      
      if (todoMatch) {
        const todo = todoMatch[1].trim();
        const priority = this.determinePriority(todo, line);
        const category = this.determineCategory(todo, line);
        
        this.todos.push({
          module: moduleName,
          file: fileName,
          line: i + 1,
          todo,
          priority,
          category,
          description: this.generateDescription(todo, priority, category)
        });
      }
    }
  }

  private determinePriority(todo: string, line: string): 'critical' | 'high' | 'medium' | 'low' {
    const criticalKeywords = ['blocking', 'critical', 'urgent', 'must', 'required', 'broken', 'error', 'fail'];
    const highKeywords = ['important', 'priority', 'soon', 'needed', 'missing', 'incomplete'];
    const mediumKeywords = ['consider', 'maybe', 'could', 'might', 'suggest'];
    
    const todoLower = todo.toLowerCase();
    const lineLower = line.toLowerCase();
    
    if (criticalKeywords.some(keyword => todoLower.includes(keyword) || lineLower.includes(keyword))) {
      return 'critical';
    }
    
    if (highKeywords.some(keyword => todoLower.includes(keyword) || lineLower.includes(keyword))) {
      return 'high';
    }
    
    if (mediumKeywords.some(keyword => todoLower.includes(keyword) || lineLower.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }

  private determineCategory(todo: string, line: string): 'blocking' | 'feature' | 'optimization' | 'documentation' | 'cleanup' {
    const todoLower = todo.toLowerCase();
    const lineLower = line.toLowerCase();
    
    if (todoLower.includes('implement') || todoLower.includes('add') || todoLower.includes('create')) {
      return 'feature';
    }
    
    if (todoLower.includes('optimize') || todoLower.includes('performance') || todoLower.includes('speed')) {
      return 'optimization';
    }
    
    if (todoLower.includes('document') || todoLower.includes('comment') || todoLower.includes('explain')) {
      return 'documentation';
    }
    
    if (todoLower.includes('clean') || todoLower.includes('remove') || todoLower.includes('refactor')) {
      return 'cleanup';
    }
    
    if (todoLower.includes('fix') || todoLower.includes('broken') || todoLower.includes('error')) {
      return 'blocking';
    }
    
    return 'feature';
  }

  private generateDescription(todo: string, priority: string, category: string): string {
    return `${priority} priority ${category} item: ${todo}`;
  }

  private categorizeTodos(): void {
    // Sort by priority and category
    this.todos.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const categoryOrder = { blocking: 5, feature: 4, optimization: 3, documentation: 2, cleanup: 1 };
      
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      
      return categoryOrder[b.category] - categoryOrder[a.category];
    });
  }

  generateReport(): string {
    const timestamp = new Date().toISOString().split('T')[0];
    
    let report = `Phase 2 TODO Analysis Report
Generated: ${new Date().toISOString()}
========================================

SUMMARY
-------
Total TODOs: ${this.todos.length}
Critical: ${this.todos.filter(t => t.priority === 'critical').length}
High: ${this.todos.filter(t => t.priority === 'high').length}
Medium: ${this.todos.filter(t => t.priority === 'medium').length}
Low: ${this.todos.filter(t => t.priority === 'low').length}

CRITICAL PRIORITY TODOS
-----------------------
`;

    const criticalTodos = this.todos.filter(t => t.priority === 'critical');
    if (criticalTodos.length === 0) {
      report += 'No critical priority TODOs found.\n';
    } else {
      criticalTodos.forEach(todo => {
        report += `${todo.module}/${todo.file}:${todo.line}
  Category: ${todo.category}
  Description: ${todo.description}
  TODO: ${todo.todo}
`;
      });
    }

    report += `\nHIGH PRIORITY TODOS
-------------------
`;

    const highTodos = this.todos.filter(t => t.priority === 'high');
    if (highTodos.length === 0) {
      report += 'No high priority TODOs found.\n';
    } else {
      highTodos.forEach(todo => {
        report += `${todo.module}/${todo.file}:${todo.line}
  Category: ${todo.category}
  Description: ${todo.description}
  TODO: ${todo.todo}
`;
      });
    }

    report += `\nBLOCKING CATEGORY TODOS
------------------------
`;

    const blockingTodos = this.todos.filter(t => t.category === 'blocking');
    if (blockingTodos.length === 0) {
      report += 'No blocking TODOs found.\n';
    } else {
      blockingTodos.forEach(todo => {
        report += `${todo.module}/${todo.file}:${todo.line}
  Priority: ${todo.priority}
  Description: ${todo.description}
  TODO: ${todo.todo}
`;
      });
    }

    report += `\nRECOMMENDATIONS
---------------
`;

    if (criticalTodos.length > 0) {
      report += `- Address ${criticalTodos.length} critical priority TODOs immediately
`;
    }

    if (blockingTodos.length > 0) {
      report += `- Fix ${blockingTodos.length} blocking TODOs
`;
    }

    const featureTodos = this.todos.filter(t => t.category === 'feature').length;
    if (featureTodos > 0) {
      report += `- Implement ${featureTodos} feature TODOs
`;
    }

    const optimizationTodos = this.todos.filter(t => t.category === 'optimization').length;
    if (optimizationTodos > 0) {
      report += `- Optimize ${optimizationTodos} performance TODOs
`;
    }

    report += `- Focus on critical and blocking TODOs first
- Document completed TODOs
- Regular TODO review and cleanup
`;

    return report;
  }
}

// Main execution
async function main() {
  const analyzer = new Phase2TodoAnalyzer();
  const todos = await analyzer.analyzeTodos();
  
  // Generate and save report
  const report = analyzer.generateReport();
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = `/workspace/docs/archive/test-results/${timestamp}-phase2-todo-analysis.txt`;
  
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
  console.log(`   Total TODOs: ${todos.length}`);
  console.log(`   Critical: ${todos.filter(t => t.priority === 'critical').length}`);
  console.log(`   High: ${todos.filter(t => t.priority === 'high').length}`);
  console.log(`   Blocking: ${todos.filter(t => t.category === 'blocking').length}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}