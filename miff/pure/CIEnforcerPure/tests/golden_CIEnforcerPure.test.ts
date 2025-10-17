import * as path from 'path';
import * as fs from 'fs';

/**
 * Golden test for CIEnforcerPure
 * Tests CI standards enforcement and contributor onboarding validation
 * 
 * Remix-safe expectations:
 * - CI validation rules are deterministic and pure
 * - Standards enforcement works correctly
 * - Compliance checking is accurate
 * - Enforcement reports are consistent and actionable
 */
describe('CIEnforcerPure golden tests', () => {
  const root = path.resolve(__dirname, '..');
  
  test('golden CI enforcement flow', () => {
    // Test comprehensive CI standards enforcement
    const enforcementFixture = path.resolve(root, 'fixtures/ci_enforcement.json');
    
    const out = (global as any).testUtils.runCLI(
      path.resolve(root, 'cliHarness.ts'),
      [enforcementFixture]
    );
    
    const result = JSON.parse(out);
    
    // Verify enforcement report structure
    expect(result.op).toBe('enforce');
    expect(result.status).toBeDefined();
    expect(result.summary).toBeDefined();
    expect(result.results).toBeDefined();
    expect(result.modules).toBeDefined();
    expect(result.criticalIssues).toBeDefined();
    expect(result.warnings).toBeDefined();
    expect(result.recommendations).toBeDefined();
    expect(result.ciCompliant).toBeDefined();
    expect(result.onboardingReady).toBeDefined();
    expect(result.compliance).toBeDefined();
    
    // Verify summary statistics
    expect(result.summary.total).toBeGreaterThan(0);
    expect(result.summary.passed).toBeGreaterThanOrEqual(0);
    expect(result.summary.failed).toBeGreaterThanOrEqual(0);
    expect(result.summary.warnings).toBeGreaterThanOrEqual(0);
    expect(result.summary.critical).toBeGreaterThanOrEqual(0);
    
    // Verify modules array
    expect(result.modules).toHaveLength(4);
    expect(result.modules).toContain('QuestSystemPure');
    expect(result.modules).toContain('AssetValidatorPure');
    expect(result.modules).toContain('RemixAuditPure');
    expect(result.modules).toContain('CIEnforcerPure');
    
    // Verify results array
    expect(result.results).toHaveLength(result.summary.total);
    
    // Verify compliance breakdown
    expect(result.compliance.testing).toBeDefined();
    expect(result.compliance.documentation).toBeDefined();
    expect(result.compliance.executability).toBeDefined();
    expect(result.compliance.coverage).toBeDefined();
    expect(result.compliance.standards).toBeDefined();
    
    // Verify CI compliance status
    expect(typeof result.ciCompliant).toBe('boolean');
    expect(typeof result.onboardingReady).toBe('boolean');
    
    // Verify critical issues and warnings are arrays
    expect(Array.isArray(result.criticalIssues)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
  });
  
  test('golden CI enforcement - single module', () => {
    // Test enforcing CI standards for a single module
    const singleModuleFixture = {
      "modulePaths": ["systems/QuestSystemPure"],
      "verbose": false
    };
    
    // Write temporary fixture
    const tempFixturePath = path.resolve(root, 'fixtures/temp_single_ci.json');
    fs.writeFileSync(tempFixturePath, JSON.stringify(singleModuleFixture, null, 2));
    
    try {
      const out = (global as any).testUtils.runCLI(
        path.resolve(root, 'cliHarness.ts'),
        [tempFixturePath]
      );
      
      const result = JSON.parse(out);
      
      // Verify single module enforcement
      expect(result.modules).toHaveLength(1);
      expect(result.modules[0]).toBe('QuestSystemPure');
      
      // Verify all rules were checked
      expect(result.summary.total).toBeGreaterThan(0);
      
      // Verify results for single module
      expect(result.results.length).toBe(result.summary.total);
      
    } finally {
      // Cleanup
      fs.unlinkSync(tempFixturePath);
    }
  });
  
  test('golden CI enforcement - rule validation', () => {
    // Test that specific CI validation rules are working correctly
    const enforcementFixture = path.resolve(root, 'fixtures/ci_enforcement.json');
    
    const out = (global as any).testUtils.runCLI(
      path.resolve(root, 'cliHarness.ts'),
      [enforcementFixture]
    );
    
    const result = JSON.parse(out);
    
    // Find specific rule results
    const goldenTestsRule = result.results.find((r: any) => r.ruleId === 'golden_tests_present');
    const readmeRule = result.results.find((r: any) => r.ruleId === 'readme_complete');
    const cliRule = result.results.find((r: any) => r.ruleId === 'cli_harness_executable');
    const coverageRule = result.results.find((r: any) => r.ruleId === 'test_coverage_adequate');
    const structureRule = result.results.find((r: any) => r.ruleId === 'module_structure_standard');
    
    // Verify golden tests rule
    expect(goldenTestsRule).toBeDefined();
    expect(goldenTestsRule.passed).toBeDefined();
    expect(goldenTestsRule.severity).toBe('critical');
    expect(goldenTestsRule.category).toBe('testing');
    
    // Verify README rule
    expect(readmeRule).toBeDefined();
    expect(readmeRule.passed).toBeDefined();
    expect(readmeRule.severity).toBe('critical');
    expect(readmeRule.category).toBe('documentation');
    
    // Verify CLI harness rule
    expect(cliRule).toBeDefined();
    expect(cliRule.passed).toBeDefined();
    expect(cliRule.severity).toBe('critical');
    expect(cliRule.category).toBe('executability');
    
    // Verify coverage rule
    expect(coverageRule).toBeDefined();
    expect(coverageRule.passed).toBeDefined();
    expect(coverageRule.severity).toBe('warning');
    expect(coverageRule.category).toBe('coverage');
    
    // Verify structure rule
    expect(structureRule).toBeDefined();
    expect(structureRule.passed).toBeDefined();
    expect(structureRule.severity).toBe('warning');
    expect(structureRule.category).toBe('standards');
    
    // Verify rule structure
    [goldenTestsRule, readmeRule, cliRule, coverageRule, structureRule].forEach(rule => {
      expect(rule.ruleId).toBeDefined();
      expect(rule.passed).toBeDefined();
      expect(rule.severity).toBeDefined();
      expect(rule.message).toBeDefined();
      expect(rule.category).toBeDefined();
    });
  });
  
  test('golden CI enforcement - compliance calculation', () => {
    // Test compliance calculation logic
    const enforcementFixture = path.resolve(root, 'fixtures/ci_enforcement.json');
    
    const out = (global as any).testUtils.runCLI(
      path.resolve(root, 'cliHarness.ts'),
      [enforcementFixture]
    );
    
    const result = JSON.parse(out);
    
    // Verify compliance calculation
    const testingResults = result.results.filter((r: any) => r.category === 'testing');
    const documentationResults = result.results.filter((r: any) => r.category === 'documentation');
    const executabilityResults = result.results.filter((r: any) => r.category === 'executability');
    const coverageResults = result.results.filter((r: any) => r.category === 'coverage');
    const standardsResults = result.results.filter((r: any) => r.category === 'standards');
    
    // Verify testing compliance
    if (testingResults.length > 0) {
      const expectedTesting = testingResults.every((r: any) => r.passed);
      expect(result.compliance.testing).toBe(expectedTesting);
    }
    
    // Verify documentation compliance
    if (documentationResults.length > 0) {
      const expectedDocumentation = documentationResults.every((r: any) => r.passed);
      expect(result.compliance.documentation).toBe(expectedDocumentation);
    }
    
    // Verify executability compliance
    if (executabilityResults.length > 0) {
      const expectedExecutability = executabilityResults.every((r: any) => r.passed);
      expect(result.compliance.executability).toBe(expectedExecutability);
    }
    
    // Verify coverage compliance
    if (coverageResults.length > 0) {
      const expectedCoverage = coverageResults.every((r: any) => r.passed);
      expect(result.compliance.coverage).toBe(expectedCoverage);
    }
    
    // Verify standards compliance
    if (standardsResults.length > 0) {
      const expectedStandards = standardsResults.every((r: any) => r.passed);
      expect(result.compliance.standards).toBe(expectedStandards);
    }
    
    // Verify CI compliance calculation
    const expectedCICompliant = result.compliance.testing && 
                                result.compliance.documentation && 
                                result.compliance.executability && 
                                result.compliance.coverage && 
                                result.compliance.standards && 
                                result.summary.critical === 0;
    expect(result.ciCompliant).toBe(expectedCICompliant);
    
    // Verify onboarding ready calculation
    const expectedOnboardingReady = expectedCICompliant && result.summary.warnings === 0;
    expect(result.onboardingReady).toBe(expectedOnboardingReady);
  });
  
  test('golden CI enforcement - metrics validation', () => {
    // Test that metrics are properly calculated and included
    const enforcementFixture = path.resolve(root, 'fixtures/ci_enforcement.json');
    
    const out = (global as any).testUtils.runCLI(
      path.resolve(root, 'cliHarness.ts'),
      [enforcementFixture]
    );
    
    const result = JSON.parse(out);
    
    // Find rules with metrics
    const rulesWithMetrics = result.results.filter((r: any) => r.metrics);
    
    // Verify metrics structure for rules that have them
    rulesWithMetrics.forEach((rule: any) => {
      expect(rule.metrics).toBeDefined();
      expect(typeof rule.metrics).toBe('object');
      
      // Check specific metric types
      if (rule.metrics.testCount !== undefined) {
        expect(typeof rule.metrics.testCount).toBe('number');
        expect(rule.metrics.testCount).toBeGreaterThanOrEqual(0);
      }
      
      if (rule.metrics.fixtureCount !== undefined) {
        expect(typeof rule.metrics.fixtureCount).toBe('number');
        expect(rule.metrics.fixtureCount).toBeGreaterThanOrEqual(0);
      }
      
      if (rule.metrics.readmeLength !== undefined) {
        expect(typeof rule.metrics.readmeLength).toBe('number');
        expect(rule.metrics.readmeLength).toBeGreaterThan(0);
      }
      
      if (rule.metrics.coveragePercentage !== undefined) {
        expect(typeof rule.metrics.coveragePercentage).toBe('number');
        expect(rule.metrics.coveragePercentage).toBeGreaterThanOrEqual(0);
        expect(rule.metrics.coveragePercentage).toBeLessThanOrEqual(100);
      }
    });
  });
});