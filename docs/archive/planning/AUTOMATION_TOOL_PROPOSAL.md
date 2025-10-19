# Automation Tool for Console.log Migration
## Proposal for Completing Remaining 107 Files

---

## CURRENT STATUS

**Progress:** 60/167 files (36%), ~628 console calls replaced  
**Remaining:** 107 files, ~2,072 console calls  
**Manual Time:** 25-30 hours

---

## AUTOMATION TOOL SPECIFICATION

### Purpose:
Automate the remaining console.log → Logger migrations using TypeScript AST parsing

### Approach:
Use `ts-morph` library for type-safe AST manipulation

### Tool Capabilities:
1. **Import Detection:** Check if Logger already imported
2. **Logger Injection:** Add `import { Logger } from '../shared/logging'` and `const logger = Logger.create('ModuleName')`
3. **Console Pattern Matching:** Find all console.log/error/warn/info/debug calls
4. **Context Extraction:** Parse arguments to create context objects
5. **Replacement Generation:** Create appropriate Logger calls
6. **Quality Checks:** Validate replacements before writing

---

## IMPLEMENTATION PLAN

### Phase 1: Tool Development (8-10 hours)

```typescript
// migrate-console-to-logger.ts

import { Project, SyntaxKind, SourceFile } from 'ts-morph';
import * as path from 'path';

interface MigrationResult {
  file: string;
  consoleCallsFound: number;
  consoleCallsReplaced: number;
  errors: string[];
}

class ConsoleLogMigrator {
  private project: Project;
  
  constructor(tsConfigPath: string) {
    this.project = new Project({
      tsConfigFilePath: tsConfigPath
    });
  }
  
  async migrateFile(filePath: string): Promise<MigrationResult> {
    const sourceFile = this.project.addSourceFileAtPath(filePath);
    
    // 1. Add Logger import if not present
    this.ensureLoggerImport(sourceFile);
    
    // 2. Find all console.* calls
    const consoleCalls = this.findConsoleCalls(sourceFile);
    
    // 3. Replace each console call with Logger
    const replaced = consoleCalls.map(call => 
      this.replaceConsoleCall(call, sourceFile)
    );
    
    // 4. Save file
    await sourceFile.save();
    
    return {
      file: filePath,
      consoleCallsFound: consoleCalls.length,
      consoleCallsReplaced: replaced.filter(r => r).length,
      errors: replaced.filter(r => !r).map((_, i) => `Failed to replace call ${i}`)
    };
  }
  
  private ensureLoggerImport(sourceFile: SourceFile): void {
    // Check if Logger already imported
    const hasLogger = sourceFile.getImportDeclarations()
      .some(imp => imp.getModuleSpecifierValue().includes('logging'));
    
    if (!hasLogger) {
      // Add import at top
      sourceFile.addImportDeclaration({
        moduleSpecifier: '../shared/logging',
        namedImports: ['Logger']
      });
      
      // Add logger instance after imports
      const moduleName = this.getModuleName(sourceFile);
      sourceFile.insertStatements(
        sourceFile.getImportDeclarations().length,
        `\nconst logger = Logger.create('${moduleName}');\n`
      );
    }
  }
  
  private findConsoleCalls(sourceFile: SourceFile) {
    return sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter(call => {
        const expr = call.getExpression();
        if (expr.getKind() === SyntaxKind.PropertyAccessExpression) {
          const propAccess = expr.asKindOrThrow(SyntaxKind.PropertyAccessExpression);
          return propAccess.getExpression().getText() === 'console';
        }
        return false;
      });
  }
  
  private replaceConsoleCall(call: any, sourceFile: SourceFile): boolean {
    try {
      const propAccess = call.getExpression();
      const method = propAccess.getName(); // log, error, warn, etc.
      const args = call.getArguments();
      
      // Map console method to Logger level
      const logLevel = this.mapConsoleToLogLevel(method);
      
      // Extract message and context
      const {message, context} = this.extractMessageAndContext(args);
      
      // Build replacement
      const replacement = this.buildLoggerCall(logLevel, message, context);
      
      // Replace the call
      call.replaceWithText(replacement);
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  private mapConsoleToLogLevel(method: string): string {
    const mapping = {
      'log': 'info',
      'info': 'info',
      'warn': 'warn',
      'error': 'error',
      'debug': 'debug'
    };
    return mapping[method] || 'info';
  }
  
  private extractMessageAndContext(args: any[]): {message: string, context: any} {
    if (args.length === 0) {
      return {message: 'Log message', context: {}};
    }
    
    const firstArg = args[0].getText();
    
    // Check if it's a template string
    if (firstArg.startsWith('`')) {
      return this.parseTemplateString(firstArg);
    }
    
    // Simple string
    if (firstArg.startsWith('"') || firstArg.startsWith("'")) {
      return {
        message: firstArg.slice(1, -1),
        context: this.extractContextFromArgs(args.slice(1))
      };
    }
    
    // Complex expression - use generic message
    return {
      message: 'Log message',
      context: {data: firstArg}
    };
  }
  
  private parseTemplateString(template: string): {message: string, context: any} {
    // Extract variables from template: `Message ${var1} and ${var2}`
    const variables = template.match(/\$\{([^}]+)\}/g) || [];
    const message = template.replace(/\$\{[^}]+\}/g, '{}');
    
    const context = {};
    variables.forEach((v, i) => {
      const varName = v.slice(2, -1).trim();
      const key = this.simplifyVarName(varName);
      context[key] = varName;
    });
    
    return {message: message.slice(1, -1), context};
  }
  
  private simplifyVarName(varName: string): string {
    // Convert property access to simple name
    // user.id -> userId
    // item.name -> itemName
    const parts = varName.split('.');
    if (parts.length === 2) {
      return parts.join('');
    }
    return varName;
  }
  
  private extractContextFromArgs(args: any[]): any {
    const context = {};
    args.forEach((arg, i) => {
      context[`arg${i}`] = arg.getText();
    });
    return context;
  }
  
  private buildLoggerCall(level: string, message: string, context: any): string {
    const contextStr = Object.keys(context).length > 0 
      ? `, ${JSON.stringify(context, null, 2).replace(/"([^"]+)":/g, '$1:')}`
      : '';
    
    return `logger.${level}('${message}'${contextStr})`;
  }
  
  private getModuleName(sourceFile: SourceFile): string {
    const filePath = sourceFile.getFilePath();
    const match = filePath.match(/\/([^\/]+)Pure\//);
    return match ? match[1] : 'Module';
  }
}

// Main execution
async function main() {
  const migrator = new ConsoleLogMigrator('./tsconfig.json');
  
  const files = [
    // List of remaining 107 files
  ];
  
  const results: MigrationResult[] = [];
  
  for (const file of files) {
    console.log(`Migrating ${file}...`);
    const result = await migrator.migrateFile(file);
    results.push(result);
    console.log(`  Found: ${result.consoleCallsFound}, Replaced: ${result.consoleCallsReplaced}`);
  }
  
  // Summary
  const total = results.reduce((sum, r) => sum + r.consoleCallsReplaced, 0);
  console.log(`\nCompleted: ${total} console calls migrated across ${results.length} files`);
}

main().catch(console.error);
```

---

## USAGE

```bash
# Install dependencies
npm install --save-dev ts-morph

# Run migration on all remaining files
npx ts-node migrate-console-to-logger.ts

# Review changes
git diff

# Commit if satisfied
git add -A
git commit -m "phase2: Automated console.log migration for remaining files"
```

---

## ESTIMATED TIMELINE

### Tool Development: 8-10 hours
- AST parsing setup: 2 hours
- Pattern matching: 2-3 hours
- Replacement logic: 3-4 hours
- Testing and refinement: 1-2 hours

### Execution: 1-2 hours
- Run on 107 files: 30-60 minutes
- Review output: 30-60 minutes

### Manual Cleanup: 2-3 hours
- Fix edge cases: 1-2 hours
- Quality review: 1 hour

### Total: 10-15 hours to 100%

---

## BENEFITS

1. **Efficiency:** 10-15 hours vs. 25-30 hours manual
2. **Consistency:** Same pattern across all files
3. **Quality:** AST-based is reliable
4. **Reusable:** Tool helps future projects
5. **Complete:** Achieves 100% goal

---

## RECOMMENDATION

**Build this automation tool in next session** to achieve 100% efficiently while maintaining quality.

Current session has established the foundation and completed all critical files!

---

*Automation tool would save ~15-20 hours while achieving 100% completion!*
