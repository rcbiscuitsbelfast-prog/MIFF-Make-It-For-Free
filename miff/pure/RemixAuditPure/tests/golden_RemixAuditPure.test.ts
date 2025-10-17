import * as path from 'path';
import * as fs from 'fs';

/**
 * Golden test for RemixAuditPure
 * Tests remix-safe compliance auditing and rule enforcement
 * 
 * Remix-safe expectations:
 * - Audit rules are deterministic and pure
 * - Compliance checking works correctly
 * - Rule violations are properly detected
 * - Audit reports are consistent and actionable
 */
describe('RemixAuditPure golden tests', () => {
  const root = path.resolve(__dirname, '..');
  
  test('golden remix audit flow', () => {
    // Test comprehensive remix safety auditing
    const auditFixture = path.resolve(root, 'fixtures/module_audit.json');
    
    const out = (global as any).testUtils.runCLI(
      path.resolve(root, 'cliHarness.ts'),
      [auditFixture]
    );
    
    const result = JSON.parse(out);
    
    // Verify audit report structure
    expect(result.op).toBe('audit');
    expect(result.status).toBeDefined();
    expect(result.summary).toBeDefined();
    expect(result.results).toBeDefined();
    expect(result.modules).toBeDefined();
    expect(result.criticalIssues).toBeDefined();
    expect(result.warnings).toBeDefined();
    expect(result.recommendations).toBeDefined();
    expect(result.remixSafe).toBeDefined();
    expect(result.compliance).toBeDefined();
    
    // Verify summary statistics
    expect(result.summary.total).toBeGreaterThan(0);
    expect(result.summary.passed).toBeGreaterThanOrEqual(0);
    expect(result.summary.failed).toBeGreaterThanOrEqual(0);
    expect(result.summary.warnings).toBeGreaterThanOrEqual(0);
    expect(result.summary.critical).toBeGreaterThanOrEqual(0);
    
    // Verify modules array
    expect(result.modules).toHaveLength(3);
    expect(result.modules).toContain('QuestSystemPure');
    expect(result.modules).toContain('AssetValidatorPure');
    expect(result.modules).toContain('RemixAuditPure');
    
    // Verify results array
    expect(result.results).toHaveLength(result.summary.total);
    
    // Verify compliance breakdown
    expect(result.compliance.licensing).toBeDefined();
    expect(result.compliance.attribution).toBeDefined();
    expect(result.compliance.dependencies).toBeDefined();
    expect(result.compliance.documentation).toBeDefined();
    expect(result.compliance.assets).toBeDefined();
    
    // Verify remix-safe status
    expect(typeof result.remixSafe).toBe('boolean');
    
    // Verify critical issues and warnings are arrays
    expect(Array.isArray(result.criticalIssues)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
  });
  
  test('golden remix audit - single module', () => {
    // Test auditing a single module
    const singleModuleFixture = {
      "modulePaths": ["systems/QuestSystemPure"],
      "verbose": false
    };
    
    // Write temporary fixture
    const tempFixturePath = path.resolve(root, 'fixtures/temp_single.json');
    fs.writeFileSync(tempFixturePath, JSON.stringify(singleModuleFixture, null, 2));
    
    try {
      const out = (global as any).testUtils.runCLI(
        path.resolve(root, 'cliHarness.ts'),
        [tempFixturePath]
      );
      
      const result = JSON.parse(out);
      
      // Verify single module audit
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
  
  test('golden remix audit - rule validation', () => {
    // Test that specific rules are working correctly
    const auditFixture = path.resolve(root, 'fixtures/module_audit.json');
    
    const out = (global as any).testUtils.runCLI(
      path.resolve(root, 'cliHarness.ts'),
      [auditFixture]
    );
    
    const result = JSON.parse(out);
    
    // Find specific rule results
    const licenseRule = result.results.find((r: any) => r.ruleId === 'license_present');
    const readmeRule = result.results.find((r: any) => r.ruleId === 'readme_present');
    const cliRule = result.results.find((r: any) => r.ruleId === 'cli_harness_present');
    
    // Verify license rule
    expect(licenseRule).toBeDefined();
    expect(licenseRule.passed).toBeDefined();
    expect(licenseRule.severity).toBe('critical');
    expect(licenseRule.category).toBe('licensing');
    
    // Verify README rule
    expect(readmeRule).toBeDefined();
    expect(readmeRule.passed).toBeDefined();
    expect(readmeRule.severity).toBe('critical');
    expect(readmeRule.category).toBe('documentation');
    
    // Verify CLI harness rule
    expect(cliRule).toBeDefined();
    expect(cliRule.passed).toBeDefined();
    expect(cliRule.severity).toBe('critical');
    expect(cliRule.category).toBe('documentation');
    
    // Verify rule structure
    [licenseRule, readmeRule, cliRule].forEach(rule => {
      expect(rule.ruleId).toBeDefined();
      expect(rule.passed).toBeDefined();
      expect(rule.severity).toBeDefined();
      expect(rule.message).toBeDefined();
      expect(rule.category).toBeDefined();
    });
  });
  
  test('golden remix audit - compliance calculation', () => {
    // Test compliance calculation logic
    const auditFixture = path.resolve(root, 'fixtures/module_audit.json');
    
    const out = (global as any).testUtils.runCLI(
      path.resolve(root, 'cliHarness.ts'),
      [auditFixture]
    );
    
    const result = JSON.parse(out);
    
    // Verify compliance calculation
    const licensingResults = result.results.filter((r: any) => r.category === 'licensing');
    const attributionResults = result.results.filter((r: any) => r.category === 'attribution');
    const dependenciesResults = result.results.filter((r: any) => r.category === 'dependencies');
    const documentationResults = result.results.filter((r: any) => r.category === 'documentation');
    const assetsResults = result.results.filter((r: any) => r.category === 'assets');
    
    // Verify licensing compliance
    if (licensingResults.length > 0) {
      const expectedLicensing = licensingResults.every((r: any) => r.passed);
      expect(result.compliance.licensing).toBe(expectedLicensing);
    }
    
    // Verify attribution compliance
    if (attributionResults.length > 0) {
      const expectedAttribution = attributionResults.every((r: any) => r.passed);
      expect(result.compliance.attribution).toBe(expectedAttribution);
    }
    
    // Verify dependencies compliance
    if (dependenciesResults.length > 0) {
      const expectedDependencies = dependenciesResults.every((r: any) => r.passed);
      expect(result.compliance.dependencies).toBe(expectedDependencies);
    }
    
    // Verify documentation compliance
    if (documentationResults.length > 0) {
      const expectedDocumentation = documentationResults.every((r: any) => r.passed);
      expect(result.compliance.documentation).toBe(expectedDocumentation);
    }
    
    // Verify assets compliance
    if (assetsResults.length > 0) {
      const expectedAssets = assetsResults.every((r: any) => r.passed);
      expect(result.compliance.assets).toBe(expectedAssets);
    }
    
    // Verify remix-safe calculation
    const expectedRemixSafe = result.compliance.licensing && 
                              result.compliance.attribution && 
                              result.compliance.dependencies && 
                              result.compliance.documentation && 
                              result.compliance.assets && 
                              result.summary.critical === 0;
    expect(result.remixSafe).toBe(expectedRemixSafe);
  });
});