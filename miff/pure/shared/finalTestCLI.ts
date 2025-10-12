#!/usr/bin/env tsx

/**
 * Final Integration Testing CLI Tool
 * 
 * Command-line interface for comprehensive end-to-end testing, integration validation,
 * performance testing, security testing, and user acceptance testing.
 */

import { FinalIntegrationTester, FinalValidationReport, TestSuite, IntegrationTest, PerformanceTest, SecurityTest, UserAcceptanceTest } from './FinalIntegrationTester.js';
import * as fs from 'fs';
import * as path from 'path';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

class FinalTestCLI {
  private logger: StructuredLogger;
  private tester: FinalIntegrationTester;

  constructor() {
    this.logger = new StructuredLogger({ module: 'FinalTestCLI' });
    this.tester = new FinalIntegrationTester();
  }

  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case 'e2e':
          await this.runEndToEndTesting(args.slice(1));
          break;
        case 'integration':
          await this.runIntegrationTesting(args.slice(1));
          break;
        case 'performance':
          await this.runPerformanceTesting(args.slice(1));
          break;
        case 'security':
          await this.runSecurityTesting(args.slice(1));
          break;
        case 'uat':
          await this.runUserAcceptanceTesting(args.slice(1));
          break;
        case 'all':
          await this.runAllTests(args.slice(1));
          break;
        case 'report':
          await this.generateReport(args.slice(1));
          break;
        case 'status':
          await this.showStatus(args.slice(1));
          break;
        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      this.logger.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  private async runEndToEndTesting(args: string[]): Promise<void> {
    const outputFile = args[0] || 'e2e-test-results.json';

    this.logger.info('🧪 Running comprehensive end-to-end testing...');
    
    await this.tester.runEndToEndTesting();
    
    const testSuites = this.tester.getTestSuites();
    const e2eSuite = testSuites.find(ts => ts.type === 'end_to_end');
    
    if (e2eSuite) {
      fs.writeFileSync(outputFile, JSON.stringify(e2eSuite, null, 2));
    }
    
    this.logger.info('✅ End-to-end testing completed');
    this.logger.info(`📄 Results saved to ${outputFile}`);

    // Display summary
    if (e2eSuite) {
      this.logger.info('\n📊 End-to-End Testing Summary:');
      this.logger.info(`Status: ${e2eSuite.status}`);
      this.logger.info(`Duration: ${e2eSuite.duration}ms`);
      this.logger.info(`Test Cases: ${e2eSuite.testCases.length}`);
      this.logger.info(`Passed: ${e2eSuite.testCases.filter(tc => tc.status === 'passed').length}`);
      this.logger.info(`Failed: ${e2eSuite.testCases.filter(tc => tc.status === 'failed').length}`);
    }
  }

  private async runIntegrationTesting(args: string[]): Promise<void> {
    const outputFile = args[0] || 'integration-test-results.json';

    this.logger.info('🔗 Running integration validation tests...');
    
    await this.tester.runIntegrationValidation();
    
    const integrationTests = this.tester.getIntegrationTests();
    fs.writeFileSync(outputFile, JSON.stringify(integrationTests, null, 2));
    
    this.logger.info('✅ Integration testing completed');
    this.logger.info(`📄 Results saved to ${outputFile}`);

    // Display summary
    this.logger.info('\n📊 Integration Testing Summary:');
    this.logger.info(`Total Tests: ${integrationTests.length}`);
    this.logger.info(`Passed: ${integrationTests.filter(it => it.status === 'passed').length}`);
    this.logger.info(`Failed: ${integrationTests.filter(it => it.status === 'failed').length}`);
    
    // Show failed tests
    const failedTests = integrationTests.filter(it => it.status === 'failed');
    if (failedTests.length > 0) {
      this.logger.info('\n❌ Failed Integration Tests:');
      failedTests.forEach(test => {
        this.logger.info(`  - ${test.name}: ${test.errorMessage || 'Unknown error'}`);
      });
    }
  }

  private async runPerformanceTesting(args: string[]): Promise<void> {
    const outputFile = args[0] || 'performance-test-results.json';

    this.logger.info('⚡ Running performance and load testing...');
    
    await this.tester.runPerformanceTesting();
    
    const performanceTests = this.tester.getPerformanceTests();
    fs.writeFileSync(outputFile, JSON.stringify(performanceTests, null, 2));
    
    this.logger.info('✅ Performance testing completed');
    this.logger.info(`📄 Results saved to ${outputFile}`);

    // Display summary
    this.logger.info('\n📊 Performance Testing Summary:');
    performanceTests.forEach(test => {
      this.logger.info(`\n${test.name} (${test.type}):`);
      this.logger.info(`  Status: ${test.status}`);
      this.logger.info(`  Duration: ${test.duration}ms`);
      if (test.results) {
        this.logger.info(`  Total Requests: ${test.results.totalRequests}`);
        this.logger.info(`  Successful: ${test.results.successfulRequests}`);
        this.logger.info(`  Failed: ${test.results.failedRequests}`);
        this.logger.info(`  Avg Response Time: ${test.results.averageResponseTime.toFixed(2)}ms`);
        this.logger.info(`  Throughput: ${test.results.throughput.toFixed(2)} req/s`);
        this.logger.info(`  Error Rate: ${test.results.errorRate.toFixed(2)}%`);
      }
    });
  }

  private async runSecurityTesting(args: string[]): Promise<void> {
    const outputFile = args[0] || 'security-test-results.json';

    this.logger.info('🔒 Running security testing and validation...');
    
    await this.tester.runSecurityTesting();
    
    const securityTests = this.tester.getSecurityTests();
    fs.writeFileSync(outputFile, JSON.stringify(securityTests, null, 2));
    
    this.logger.info('✅ Security testing completed');
    this.logger.info(`📄 Results saved to ${outputFile}`);

    // Display summary
    this.logger.info('\n📊 Security Testing Summary:');
    securityTests.forEach(test => {
      this.logger.info(`\n${test.name} (${test.type}):`);
      this.logger.info(`  Status: ${test.status}`);
      this.logger.info(`  Duration: ${test.duration}ms`);
      this.logger.info(`  Findings: ${test.findings.length}`);
      
      if (test.findings.length > 0) {
        this.logger.info('  Security Findings:');
        test.findings.forEach(finding => {
          const severityColor = finding.severity === 'critical' ? '🔴' : 
                               finding.severity === 'high' ? '🟠' : 
                               finding.severity === 'medium' ? '🟡' : '🟢';
          this.logger.info(`    ${severityColor} ${finding.title} (${finding.severity})`);
        });
      }
    });
  }

  private async runUserAcceptanceTesting(args: string[]): Promise<void> {
    const outputFile = args[0] || 'uat-test-results.json';

    this.logger.info('👥 Running user acceptance testing...');
    
    await this.tester.runUserAcceptanceTesting();
    
    const uatTests = this.tester.getUserAcceptanceTests();
    fs.writeFileSync(outputFile, JSON.stringify(uatTests, null, 2));
    
    this.logger.info('✅ User acceptance testing completed');
    this.logger.info(`📄 Results saved to ${outputFile}`);

    // Display summary
    this.logger.info('\n📊 User Acceptance Testing Summary:');
    this.logger.info(`Total Tests: ${uatTests.length}`);
    this.logger.info(`Passed: ${uatTests.filter(uat => uat.status === 'passed').length}`);
    this.logger.info(`Failed: ${uatTests.filter(uat => uat.status === 'failed').length}`);
    
    // Show test details
    uatTests.forEach(test => {
      this.logger.info(`\n${test.name}:`);
      this.logger.info(`  Status: ${test.status}`);
      this.logger.info(`  User Story: ${test.userStory}`);
      this.logger.info(`  Expected: ${test.expectedOutcome}`);
      this.logger.info(`  Actual: ${test.actualOutcome}`);
      if (test.userFeedback) {
        this.logger.info(`  Feedback: ${test.userFeedback}`);
      }
    });
  }

  private async runAllTests(args: string[]): Promise<void> {
    const outputFile = args[0] || 'all-test-results.json';

    this.logger.info('🚀 Running all test suites...');
    
    try {
      // Run all test types
      await this.tester.runEndToEndTesting();
      await this.tester.runIntegrationValidation();
      await this.tester.runPerformanceTesting();
      await this.tester.runSecurityTesting();
      await this.tester.runUserAcceptanceTesting();
      
      // Generate final validation report
      const report = this.tester.generateFinalValidationReport();
      
      // Save report
      fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
      
      this.logger.info('✅ All test suites completed');
      this.logger.info(`📄 Results saved to ${outputFile}`);

      // Display summary
      this.logger.info('\n📊 Final Testing Summary:');
      this.logger.info(`Overall Status: ${report.overallStatus}`);
      this.logger.info(`Readiness Score: ${report.readinessScore}/100`);
      this.logger.info(`Release Ready: ${report.releaseReadiness ? 'Yes' : 'No'}`);
      this.logger.info(`Critical Issues: ${report.criticalIssues.length}`);
      this.logger.info(`Recommendations: ${report.recommendations.length}`);
      
      if (report.criticalIssues.length > 0) {
        this.logger.info('\n🚨 Critical Issues:');
        report.criticalIssues.forEach(issue => {
          this.logger.info(`  - ${issue}`);
        });
      }
      
      if (report.recommendations.length > 0) {
        this.logger.info('\n💡 Recommendations:');
        report.recommendations.forEach(rec => {
          this.logger.info(`  - ${rec}`);
        });
      }
      
      if (report.nextSteps.length > 0) {
        this.logger.info('\n🎯 Next Steps:');
        report.nextSteps.forEach(step => {
          this.logger.info(`  - ${step}`);
        });
      }
      
    } catch (error) {
      this.logger.error('❌ Error running all tests:', error);
      throw error;
    }
  }

  private async generateReport(args: string[]): Promise<void> {
    const outputFile = args[0] || 'final-validation-report.html';

    this.logger.info('📊 Generating final validation report...');
    
    const report = this.tester.generateFinalValidationReport();
    const html = this.generateHTMLReport(report);
    
    // Save report to file
    fs.writeFileSync(outputFile, html);
    
    this.logger.info('✅ Final validation report generated');
    this.logger.info(`📄 Report saved to ${outputFile}`);

    // Display summary
    this.logger.info('\n📊 Final Validation Report Summary:');
    this.logger.info(`Overall Status: ${report.overallStatus}`);
    this.logger.info(`Readiness Score: ${report.readinessScore}/100`);
    this.logger.info(`Release Ready: ${report.releaseReadiness ? 'Yes' : 'No'}`);
    this.logger.info(`Test Suites: ${report.testSuites.length}`);
    this.logger.info(`Integration Tests: ${report.integrationTests.length}`);
    this.logger.info(`Performance Tests: ${report.performanceTests.length}`);
    this.logger.info(`Security Tests: ${report.securityTests.length}`);
    this.logger.info(`User Acceptance Tests: ${report.userAcceptanceTests.length}`);
  }

  private async showStatus(args: string[]): Promise<void> {
    this.logger.info('📊 Showing test status...');
    
    const testSuites = this.tester.getTestSuites();
    const integrationTests = this.tester.getIntegrationTests();
    const performanceTests = this.tester.getPerformanceTests();
    const securityTests = this.tester.getSecurityTests();
    const uatTests = this.tester.getUserAcceptanceTests();
    
    this.logger.info('\n📊 Test Status Overview:');
    this.logger.info(`Test Suites: ${testSuites.length}`);
    this.logger.info(`Integration Tests: ${integrationTests.length}`);
    this.logger.info(`Performance Tests: ${performanceTests.length}`);
    this.logger.info(`Security Tests: ${securityTests.length}`);
    this.logger.info(`User Acceptance Tests: ${uatTests.length}`);
    
    // Show test suite status
    this.logger.info('\n📋 Test Suite Status:');
    testSuites.forEach(suite => {
      const statusIcon = suite.status === 'passed' ? '✅' : 
                        suite.status === 'failed' ? '❌' : 
                        suite.status === 'running' ? '🔄' : '⏳';
      this.logger.info(`  ${statusIcon} ${suite.name}: ${suite.status}`);
    });
    
    // Show integration test status
    this.logger.info('\n🔗 Integration Test Status:');
    integrationTests.forEach(test => {
      const statusIcon = test.status === 'passed' ? '✅' : 
                        test.status === 'failed' ? '❌' : 
                        test.status === 'running' ? '🔄' : '⏳';
      this.logger.info(`  ${statusIcon} ${test.name}: ${test.status}`);
    });
    
    // Show performance test status
    this.logger.info('\n⚡ Performance Test Status:');
    performanceTests.forEach(test => {
      const statusIcon = test.status === 'passed' ? '✅' : 
                        test.status === 'failed' ? '❌' : 
                        test.status === 'running' ? '🔄' : '⏳';
      this.logger.info(`  ${statusIcon} ${test.name}: ${test.status}`);
    });
    
    // Show security test status
    this.logger.info('\n🔒 Security Test Status:');
    securityTests.forEach(test => {
      const statusIcon = test.status === 'passed' ? '✅' : 
                        test.status === 'failed' ? '❌' : 
                        test.status === 'running' ? '🔄' : '⏳';
      this.logger.info(`  ${statusIcon} ${test.name}: ${test.status}`);
    });
    
    // Show UAT status
    this.logger.info('\n👥 User Acceptance Test Status:');
    uatTests.forEach(test => {
      const statusIcon = test.status === 'passed' ? '✅' : 
                        test.status === 'failed' ? '❌' : 
                        test.status === 'running' ? '🔄' : '⏳';
      this.logger.info(`  ${statusIcon} ${test.name}: ${test.status}`);
    });
  }

  private generateHTMLReport(report: FinalValidationReport): string {
    const statusColor = report.overallStatus === 'ready' ? '#28a745' : 
                       report.overallStatus === 'needs_attention' ? '#ffc107' : '#dc3545';
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>MIFF Final Integration Testing Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .status { text-align: center; margin: 20px 0; }
        .status-value { font-size: 4em; font-weight: bold; color: ${statusColor}; }
        .status-label { font-size: 1.2em; color: #666; }
        .score { text-align: center; margin: 20px 0; }
        .score-value { font-size: 3em; font-weight: bold; color: #333; }
        .score-label { font-size: 1.2em; color: #666; }
        .tests { margin: 20px 0; }
        .test-section { margin: 20px 0; }
        .test-item { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .test-passed { border-left: 4px solid #28a745; }
        .test-failed { border-left: 4px solid #dc3545; }
        .test-running { border-left: 4px solid #ffc107; }
        .test-pending { border-left: 4px solid #6c757d; }
        .critical-issues { background: #ffebee; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .recommendations { background: #e8f5e8; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .next-steps { background: #e3f2fd; padding: 15px; margin: 20px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 MIFF Final Integration Testing Report</h1>
        <p>Generated: ${report.timestamp.toLocaleString()}</p>
    </div>

    <div class="status">
        <div class="status-value">${report.overallStatus.toUpperCase()}</div>
        <div class="status-label">Overall Status</div>
    </div>

    <div class="score">
        <div class="score-value">${report.readinessScore}</div>
        <div class="score-label">Readiness Score / 100</div>
    </div>

    <div class="tests">
        <h3>Test Suite Results (${report.testSuites.length})</h3>
        ${report.testSuites.map(suite => `
            <div class="test-item test-${suite.status}">
                <div style="font-weight: bold;">${suite.name}</div>
                <div style="color: #666; margin: 5px 0;">${suite.description}</div>
                <div style="margin: 5px 0;">
                    <span style="background: ${suite.status === 'passed' ? '#28a745' : suite.status === 'failed' ? '#dc3545' : suite.status === 'running' ? '#ffc107' : '#6c757d'}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.8em;">
                        ${suite.status.toUpperCase()}
                    </span>
                    <span style="margin-left: 10px;">Duration: ${suite.duration}ms</span>
                    <span style="margin-left: 10px;">Test Cases: ${suite.testCases.length}</span>
                </div>
            </div>
        `).join('')}
    </div>

    <div class="test-section">
        <h3>Integration Tests (${report.integrationTests.length})</h3>
        ${report.integrationTests.map(test => `
            <div class="test-item test-${test.status}">
                <div style="font-weight: bold;">${test.name}</div>
                <div style="color: #666; margin: 5px 0;">${test.description}</div>
                <div style="margin: 5px 0;">Modules: ${test.modules.join(', ')}</div>
                <div style="margin: 5px 0;">
                    <span style="background: ${test.status === 'passed' ? '#28a745' : test.status === 'failed' ? '#dc3545' : test.status === 'running' ? '#ffc107' : '#6c757d'}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.8em;">
                        ${test.status.toUpperCase()}
                    </span>
                </div>
            </div>
        `).join('')}
    </div>

    <div class="test-section">
        <h3>Performance Tests (${report.performanceTests.length})</h3>
        ${report.performanceTests.map(test => `
            <div class="test-item test-${test.status}">
                <div style="font-weight: bold;">${test.name}</div>
                <div style="color: #666; margin: 5px 0;">${test.description}</div>
                <div style="margin: 5px 0;">Type: ${test.type}</div>
                <div style="margin: 5px 0;">
                    <span style="background: ${test.status === 'passed' ? '#28a745' : test.status === 'failed' ? '#dc3545' : test.status === 'running' ? '#ffc107' : '#6c757d'}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.8em;">
                        ${test.status.toUpperCase()}
                    </span>
                </div>
                ${test.results ? `
                    <div style="margin: 5px 0;">
                        <strong>Results:</strong> ${test.results.totalRequests} requests, 
                        ${test.results.averageResponseTime.toFixed(2)}ms avg response time,
                        ${test.results.throughput.toFixed(2)} req/s throughput
                    </div>
                ` : ''}
            </div>
        `).join('')}
    </div>

    <div class="test-section">
        <h3>Security Tests (${report.securityTests.length})</h3>
        ${report.securityTests.map(test => `
            <div class="test-item test-${test.status}">
                <div style="font-weight: bold;">${test.name}</div>
                <div style="color: #666; margin: 5px 0;">${test.description}</div>
                <div style="margin: 5px 0;">Type: ${test.type}</div>
                <div style="margin: 5px 0;">
                    <span style="background: ${test.status === 'passed' ? '#28a745' : test.status === 'failed' ? '#dc3545' : test.status === 'running' ? '#ffc107' : '#6c757d'}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.8em;">
                        ${test.status.toUpperCase()}
                    </span>
                </div>
                <div style="margin: 5px 0;">Findings: ${test.findings.length}</div>
            </div>
        `).join('')}
    </div>

    <div class="test-section">
        <h3>User Acceptance Tests (${report.userAcceptanceTests.length})</h3>
        ${report.userAcceptanceTests.map(test => `
            <div class="test-item test-${test.status}">
                <div style="font-weight: bold;">${test.name}</div>
                <div style="color: #666; margin: 5px 0;">${test.userStory}</div>
                <div style="margin: 5px 0;">
                    <span style="background: ${test.status === 'passed' ? '#28a745' : test.status === 'failed' ? '#dc3545' : test.status === 'running' ? '#ffc107' : '#6c757d'}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.8em;">
                        ${test.status.toUpperCase()}
                    </span>
                </div>
            </div>
        `).join('')}
    </div>

    ${report.criticalIssues.length > 0 ? `
        <div class="critical-issues">
            <h3>🚨 Critical Issues (${report.criticalIssues.length})</h3>
            <ul>
                ${report.criticalIssues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
        </div>
    ` : ''}

    ${report.recommendations.length > 0 ? `
        <div class="recommendations">
            <h3>💡 Recommendations (${report.recommendations.length})</h3>
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    ` : ''}

    <div class="next-steps">
        <h3>🎯 Next Steps</h3>
        <ul>
            ${report.nextSteps.map(step => `<li>${step}</li>`).join('')}
        </ul>
    </div>

    <div style="margin: 20px 0; text-align: center; font-size: 1.2em; font-weight: bold; color: ${report.releaseReadiness ? '#28a745' : '#dc3545'};">
        Release Ready: ${report.releaseReadiness ? 'YES' : 'NO'}
    </div>
</body>
</html>`;
  }

  private showHelp(): void {
    this.logger.info(`
🧪 MIFF Final Integration Testing CLI

Usage: tsx finalTestCLI.ts <command> [options]

Commands:
  e2e [output]                 Run end-to-end testing
  integration [output]         Run integration validation tests
  performance [output]         Run performance and load testing
  security [output]            Run security testing and validation
  uat [output]                 Run user acceptance testing
  all [output]                 Run all test suites
  report [output]              Generate final validation report
  status                       Show test status
  help                        Show this help

Examples:
  tsx finalTestCLI.ts e2e
  tsx finalTestCLI.ts e2e e2e-results.json
  tsx finalTestCLI.ts integration integration-results.json
  tsx finalTestCLI.ts performance perf-results.json
  tsx finalTestCLI.ts security security-results.json
  tsx finalTestCLI.ts uat uat-results.json
  tsx finalTestCLI.ts all all-results.json
  tsx finalTestCLI.ts report final-report.html
  tsx finalTestCLI.ts status

Test Types:
  - end_to_end: Complete application flow testing
  - integration: Cross-module integration testing
  - performance: Load, stress, and performance testing
  - security: Vulnerability and security testing
  - user_acceptance: User acceptance and usability testing

Test Status:
  - pending: Test not yet run
  - running: Test currently executing
  - passed: Test completed successfully
  - failed: Test completed with failures
  - skipped: Test skipped (not applicable)

Report Status:
  - ready: All tests passed, ready for release
  - needs_attention: Some issues need attention
  - not_ready: Significant issues prevent release
`);
  }
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new FinalTestCLI();
  cli.run().catch(console.error);
}

export default FinalTestCLI;