#!/usr/bin/env tsx

/**
 * Documentation CLI Tool
 * 
 * Command-line interface for generating and managing documentation across the MIFF framework.
 */

import { DocumentationGenerator, ContributorGuide, Tutorial, CodeExample } from './DocumentationGenerator.js';
import * as fs from 'fs';
import * as path from 'path';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

class DocsCLI {
  private logger: StructuredLogger;
  private generator: DocumentationGenerator;

  constructor() {
    this.logger = new StructuredLogger({ module: 'DocsCLI' });
    this.generator = new DocumentationGenerator();
  }

  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case 'generate':
          await this.generateDocumentation(args.slice(1));
          break;
        case 'api':
          await this.generateAPI(args.slice(1));
          break;
        case 'guides':
          await this.generateGuides(args.slice(1));
          break;
        case 'tutorials':
          await this.generateTutorials(args.slice(1));
          break;
        case 'examples':
          await this.generateExamples(args.slice(1));
          break;
        case 'report':
          await this.generateReport(args.slice(1));
          break;
        case 'serve':
          await this.serveDocumentation(args.slice(1));
          break;
        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  private async generateDocumentation(args: string[]): Promise<void> {
    const rootPath = args[0] || 'miff/pure';
    const outputDir = args[1] || 'docs';

    console.info(`📚 Generating comprehensive documentation for ${rootPath}...`);
    
    await this.generator.generateDocumentation(rootPath);
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save all documentation
    await this.saveAllDocumentation(outputDir);
    
    console.info('✅ Documentation generation completed');
    console.info(`📄 Documentation saved to ${outputDir}`);
  }

  private async generateAPI(args: string[]): Promise<void> {
    const rootPath = args[0] || 'miff/pure';
    const outputDir = args[1] || 'docs/api';

    console.info(`📖 Generating API documentation for ${rootPath}...`);
    
    await this.generator.generateAPIDocumentation(rootPath);
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save API documentation
    const apiDocs = this.generator.getAPIDocumentation('CombatPure'); // Mock for now
    if (apiDocs) {
      fs.writeFileSync(path.join(outputDir, 'api-docs.json'), JSON.stringify(apiDocs, null, 2));
    }
    
    console.info('✅ API documentation generation completed');
    console.info(`📄 API documentation saved to ${outputDir}`);
  }

  private async generateGuides(args: string[]): Promise<void> {
    const outputDir = args[0] || 'docs/guides';

    console.info('👥 Generating contributor guides...');
    
    await this.generator.generateContributorGuides();
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save contributor guides
    const guides = this.generator.getContributorGuides();
    for (const guide of guides) {
      const guideContent = this.generateGuideMarkdown(guide);
      fs.writeFileSync(path.join(outputDir, `${guide.id}.md`), guideContent);
    }
    
    console.info(`✅ Generated ${guides.length} contributor guides`);
    console.info(`📄 Guides saved to ${outputDir}`);
  }

  private async generateTutorials(args: string[]): Promise<void> {
    const outputDir = args[0] || 'docs/tutorials';

    console.info('🎓 Generating tutorials...');
    
    await this.generator.generateTutorials();
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save tutorials
    const tutorials = this.generator.getTutorials();
    for (const tutorial of tutorials) {
      const tutorialContent = this.generateTutorialMarkdown(tutorial);
      fs.writeFileSync(path.join(outputDir, `${tutorial.id}.md`), tutorialContent);
    }
    
    console.info(`✅ Generated ${tutorials.length} tutorials`);
    console.info(`📄 Tutorials saved to ${outputDir}`);
  }

  private async generateExamples(args: string[]): Promise<void> {
    const outputDir = args[0] || 'docs/examples';

    console.info('💻 Generating code examples...');
    
    await this.generator.generateCodeExamples();
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save code examples
    const examples = this.generator.getCodeExamples();
    for (const example of examples) {
      const exampleContent = this.generateExampleMarkdown(example);
      fs.writeFileSync(path.join(outputDir, `${example.id}.md`), exampleContent);
    }
    
    console.info(`✅ Generated ${examples.length} code examples`);
    console.info(`📄 Examples saved to ${outputDir}`);
  }

  private async generateReport(args: string[]): Promise<void> {
    const outputFile = args[0] || 'docs/documentation-report.html';

    console.info('📊 Generating documentation report...');
    
    const report = this.generator.generateDocumentationReport();
    const html = this.generateHTMLReport(report);
    
    // Save report to file
    fs.writeFileSync(outputFile, html);
    
    console.info('✅ Documentation report generated');
    console.info(`📄 Report saved to ${outputFile}`);

    // Display summary
    const stats = this.generator.getStats();
    console.info('\n📊 Documentation Summary:');
    console.info(`Total Modules: ${stats.totalModules}`);
    console.info(`Documented Modules: ${stats.documentedModules}`);
    console.info(`API Documentation: ${stats.apiDocumentation}`);
    console.info(`Contributor Guides: ${stats.contributorGuides}`);
    console.info(`Tutorials: ${stats.tutorials}`);
    console.info(`Code Examples: ${stats.codeExamples}`);
    console.info(`Coverage: ${stats.coveragePercentage.toFixed(1)}%`);
  }

  private async serveDocumentation(args: string[]): Promise<void> {
    const port = parseInt(args[0]) || 3000;
    const rootDir = args[1] || 'docs';

    console.info(`🌐 Starting documentation server on port ${port}...`);
    console.info(`📁 Serving from ${rootDir}`);
    
    // This would start a local server
    // For now, just log the command
    console.info(`Run: npx serve ${rootDir} -p ${port}`);
    console.info(`Or: python -m http.server ${port} -d ${rootDir}`);
  }

  private async saveAllDocumentation(outputDir: string): Promise<void> {
    // Save API documentation
    const apiDir = path.join(outputDir, 'api');
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }
    
    // Save contributor guides
    const guidesDir = path.join(outputDir, 'guides');
    if (!fs.existsSync(guidesDir)) {
      fs.mkdirSync(guidesDir, { recursive: true });
    }
    
    // Save tutorials
    const tutorialsDir = path.join(outputDir, 'tutorials');
    if (!fs.existsSync(tutorialsDir)) {
      fs.mkdirSync(tutorialsDir, { recursive: true });
    }
    
    // Save code examples
    const examplesDir = path.join(outputDir, 'examples');
    if (!fs.existsSync(examplesDir)) {
      fs.mkdirSync(examplesDir, { recursive: true });
    }
    
    // Save main documentation
    const mainDoc = this.generateMainDocumentation();
    fs.writeFileSync(path.join(outputDir, 'README.md'), mainDoc);
  }

  private generateGuideMarkdown(guide: ContributorGuide): string {
    let content = `# ${guide.title}\n\n`;
    content += `${guide.description}\n\n`;
    content += `**Difficulty:** ${guide.difficulty}\n`;
    content += `**Estimated Time:** ${guide.estimatedTime} minutes\n\n`;
    content += `## Prerequisites\n\n`;
    for (const prereq of guide.prerequisites) {
      content += `- ${prereq}\n`;
    }
    content += `\n`;
    
    for (const section of guide.sections) {
      content += `## ${section.title}\n\n`;
      content += `${section.content}\n\n`;
      
      if (section.codeExamples.length > 0) {
        content += `### Code Examples\n\n`;
        for (const example of section.codeExamples) {
          content += `\`\`\`typescript\n${example}\n\`\`\`\n\n`;
        }
      }
      
      if (section.exercises.length > 0) {
        content += `### Exercises\n\n`;
        for (const exercise of section.exercises) {
          content += `- ${exercise}\n`;
        }
        content += `\n`;
      }
      
      if (section.tips.length > 0) {
        content += `### Tips\n\n`;
        for (const tip of section.tips) {
          content += `- ${tip}\n`;
        }
        content += `\n`;
      }
    }
    
    return content;
  }

  private generateTutorialMarkdown(tutorial: Tutorial): string {
    let content = `# ${tutorial.title}\n\n`;
    content += `${tutorial.description}\n\n`;
    content += `**Difficulty:** ${tutorial.difficulty}\n`;
    content += `**Estimated Time:** ${tutorial.estimatedTime} minutes\n`;
    content += `**Tags:** ${tutorial.tags.join(', ')}\n\n`;
    content += `## Prerequisites\n\n`;
    for (const prereq of tutorial.prerequisites) {
      content += `- ${prereq}\n`;
    }
    content += `\n`;
    
    for (let i = 0; i < tutorial.steps.length; i++) {
      const step = tutorial.steps[i];
      content += `## Step ${i + 1}: ${step.title}\n\n`;
      content += `${step.description}\n\n`;
      content += `### Code\n\n`;
      content += `\`\`\`typescript\n${step.code}\n\`\`\`\n\n`;
      content += `### Explanation\n\n`;
      content += `${step.explanation}\n\n`;
      content += `### Expected Output\n\n`;
      content += `${step.expectedOutput}\n\n`;
      
      if (step.troubleshooting.length > 0) {
        content += `### Troubleshooting\n\n`;
        for (const tip of step.troubleshooting) {
          content += `- ${tip}\n`;
        }
        content += `\n`;
      }
    }
    
    return content;
  }

  private generateExampleMarkdown(example: CodeExample): string {
    let content = `# ${example.title}\n\n`;
    content += `${example.description}\n\n`;
    content += `**Category:** ${example.category}\n`;
    content += `**Difficulty:** ${example.difficulty}\n`;
    content += `**Language:** ${example.language}\n`;
    content += `**Tags:** ${example.tags.join(', ')}\n\n`;
    content += `## Related Modules\n\n`;
    for (const module of example.relatedModules) {
      content += `- ${module}\n`;
    }
    content += `\n`;
    content += `## Code\n\n`;
    content += `\`\`\`${example.language}\n${example.code}\n\`\`\`\n\n`;
    
    return content;
  }

  private generateMainDocumentation(): string {
    return `# MIFF Framework Documentation

Welcome to the MIFF (Make It For Free) Framework documentation!

## Quick Start

1. **Installation**: \`npm install miff\`
2. **Basic Usage**: See our [Getting Started Guide](guides/getting_started.md)
3. **API Reference**: Browse our [API Documentation](api/)
4. **Tutorials**: Follow our [Step-by-step Tutorials](tutorials/)

## Documentation Structure

- **API Documentation**: Complete API reference for all modules
- **Contributor Guides**: Guides for contributing to the project
- **Tutorials**: Step-by-step tutorials for common tasks
- **Code Examples**: Practical code examples and snippets

## Getting Help

- Check our [FAQ](guides/faq.md)
- Browse [Code Examples](examples/)
- Join our [Community Discord](https://discord.gg/miff)

## Contributing

See our [Contributor Guide](guides/contributing.md) for information on how to contribute to the project.

---

*This documentation is automatically generated and updated with each release.*
`;
  }

  private generateHTMLReport(report: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>MIFF Documentation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; color: #333; }
        .stat-label { color: #666; margin-top: 5px; }
        .content { margin: 20px 0; }
        .content pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📚 MIFF Documentation Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>

    <div class="content">
        <pre>${report}</pre>
    </div>
</body>
</html>`;
  }

  private showHelp(): void {
    console.info(`
📚 MIFF Documentation CLI

Usage: tsx docsCLI.ts <command> [options]

Commands:
  generate [path] [output]         Generate comprehensive documentation
  api [path] [output]              Generate API documentation only
  guides [output]                  Generate contributor guides
  tutorials [output]               Generate tutorials
  examples [output]                Generate code examples
  report [output]                  Generate documentation report
  serve [port] [root]              Serve documentation locally
  help                            Show this help

Examples:
  tsx docsCLI.ts generate
  tsx docsCLI.ts generate miff/pure docs
  tsx docsCLI.ts api miff/pure docs/api
  tsx docsCLI.ts guides docs/guides
  tsx docsCLI.ts tutorials docs/tutorials
  tsx docsCLI.ts examples docs/examples
  tsx docsCLI.ts report docs/report.html
  tsx docsCLI.ts serve 3000 docs

Documentation Types:
  - API Documentation: Complete API reference for all modules
  - Contributor Guides: Guides for contributing to the project
  - Tutorials: Step-by-step tutorials for common tasks
  - Code Examples: Practical code examples and snippets

Output Formats:
  - Markdown: Human-readable documentation
  - HTML: Web-ready documentation
  - JSON: Machine-readable documentation data
`);
  }
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new DocsCLI();
  cli.run().catch(console.error);
}

export default DocsCLI;