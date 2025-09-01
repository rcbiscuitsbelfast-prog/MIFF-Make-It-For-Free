/**
 * Test suite for CLI Harness Utilities
 * 
 * Verifies that all utility functions produce valid, consistent output
 * and maintain the expected data structures for tests.
 */

const {
  buildSamplePayload,
  validatePayload,
  witcherExplorerDemo,
  spiritTamerDemo,
  topplerDemo,
  defaultStub,
  parseCLIArgs,
  formatOutput
} = require('./cliHarnessUtils');

describe('CLI Harness Utilities', () => {
  describe('buildSamplePayload', () => {
    it('should return valid sample payload structure', () => {
      const payload = buildSamplePayload();
      
      expect(payload.op).toBe('buildSample');
      expect(payload.status).toBe('ok');
      expect(payload.payload).toBeDefined();
      expect(payload.payload.renderData).toBeInstanceOf(Array);
      expect(payload.payload.renderData[0]).toHaveProperty('id');
      expect(payload.payload.renderData[0]).toHaveProperty('type');
      expect(payload.payload.renderData[0]).toHaveProperty('timestamp');
    });
  });

  describe('validatePayload', () => {
    it('should return validation error structure', () => {
      const result = validatePayload();
      
      expect(result.op).toBe('validate');
      expect(result.status).toBe('error');
      expect(result.issues).toBeInstanceOf(Array);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('witcherExplorerDemo', () => {
    it('should return witcher demo structure', () => {
      const demo = witcherExplorerDemo();
      
      expect(demo.op).toBe('witcher_explorer_demo');
      expect(demo.status).toBe('ok');
      expect(demo.nav).toBeDefined();
      expect(demo.nav.op).toBe('nav.path');
      expect(demo.dlg).toBeDefined();
      expect(demo.dlg.op).toBe('dialogue.next');
      expect(demo.quest).toBeDefined();
      expect(demo.quest.op).toBe('parse');
    });
  });

  describe('spiritTamerDemo', () => {
    it('should return spirit tamer structure', () => {
      const demo = spiritTamerDemo();
      
      expect(demo.op).toBe('spirit_tamer_demo');
      expect(demo.status).toBe('ok');
      expect(demo.scene).toBe('grove');
      expect(demo.player).toBeDefined();
      expect(demo.spirits).toBeInstanceOf(Array);
      expect(demo.orchestrationReady).toBe(true);
    });
  });

  describe('topplerDemo', () => {
    it('should return toppler scenario structure', () => {
      const demo = topplerDemo();
      
      expect(demo.op).toBe('scenario');
      expect(demo.status).toBe('ok');
      expect(demo.name).toBe('TopplerDemoPure');
      expect(demo.timeline).toBeInstanceOf(Array);
      expect(demo.timeline.length).toBeGreaterThan(0);
      expect(demo.issues).toBeInstanceOf(Array);
    });
  });

  describe('defaultStub', () => {
    it('should return safe default structure', () => {
      const stub = defaultStub();
      
      expect(stub.op).toBe('noop');
      expect(stub.status).toBe('ok');
      expect(stub.message).toBeDefined();
    });
  });

  describe('parseCLIArgs', () => {
    it('should parse command line arguments correctly', () => {
      const mockArgv = ['node', 'script.js', 'build-sample', 'arg1'];
      const result = parseCLIArgs(mockArgv);
      
      expect(result.mode).toBe('build-sample');
      expect(result.args).toEqual(['build-sample', 'arg1']);
    });

    it('should handle empty arguments gracefully', () => {
      const mockArgv = ['node', 'script.js'];
      const result = parseCLIArgs(mockArgv);
      
      expect(result.mode).toBe('default');
      expect(result.args).toEqual([]);
    });
  });

  describe('formatOutput', () => {
    it('should format data as valid JSON', () => {
      const testData = { test: 'data', number: 42 };
      const formatted = formatOutput(testData);
      
      expect(typeof formatted).toBe('string');
      expect(() => JSON.parse(formatted)).not.toThrow();
      
      const parsed = JSON.parse(formatted);
      expect(parsed).toEqual(testData);
    });
  });

  describe('Output Consistency', () => {
    it('should maintain consistent output across multiple calls', () => {
      const first = buildSamplePayload();
      const second = buildSamplePayload();
      
      // Structure should be identical
      expect(first.op).toBe(second.op);
      expect(first.status).toBe(second.status);
      expect(Object.keys(first)).toEqual(Object.keys(second));
      
      // Payload structure should be consistent
      expect(first.payload.renderData.length).toBe(second.payload.renderData.length);
      expect(first.payload.renderData[0].id).toBe(second.payload.renderData[0].id);
      expect(first.payload.renderData[0].type).toBe(second.payload.renderData[0].type);
      
      // Timestamps should be numbers (dynamic content)
      expect(typeof first.payload.metadata.timestamp).toBe('number');
      expect(typeof second.payload.metadata.timestamp).toBe('number');
    });
  });
});