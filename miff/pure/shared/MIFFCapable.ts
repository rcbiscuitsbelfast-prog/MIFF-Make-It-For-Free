/**
 * MIFF Capability Introspection System
 * 
 * Defines a shared interface for modules to self-report supported operations,
 * schemas, CLI flags, and lifecycle hooks for dynamic discovery and validation.
 */

export interface MIFFCapable {
  /**
   * Module identification and metadata
   */
  readonly moduleId: string;
  readonly moduleName: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly lastUpdated: Date;

  /**
   * Supported operations and capabilities
   */
  readonly capabilities: ModuleCapabilities;

  /**
   * Schema information
   */
  readonly schemas: SchemaInfo[];

  /**
   * CLI interface definition
   */
  readonly cliInterface: CLIInterface;

  /**
   * Lifecycle hooks and events
   */
  readonly lifecycleHooks: LifecycleHooks;

  /**
   * Dependencies and requirements
   */
  readonly dependencies: ModuleDependency[];

  /**
   * Performance characteristics
   */
  readonly performanceProfile: PerformanceProfile;

  /**
   * Validation and testing capabilities
   */
  readonly testingCapabilities: TestingCapabilities;
}

export interface ModuleCapabilities {
  /**
   * Core operations supported by this module
   */
  operations: OperationCapability[];

  /**
   * Data processing capabilities
   */
  dataProcessing: DataProcessingCapability[];

  /**
   * Integration capabilities
   */
  integrations: IntegrationCapability[];

  /**
   * Export/Import formats supported
   */
  formats: FormatCapability[];

  /**
   * Real-time capabilities
   */
  realtime: RealtimeCapability[];
}

export interface OperationCapability {
  id?: string;
  name: string;
  description: string;
  category?: 'create' | 'read' | 'update' | 'delete' | 'simulate' | 'render' | 'export' | 'validate';
  complexity?: 'low' | 'medium' | 'high' | 'critical';
  requiresAuth?: boolean;
  inputSchema: SchemaReference;
  outputSchema?: SchemaReference;
  estimatedDuration?: number; // milliseconds
  resourceRequirements?: ResourceRequirements;
  returnType?: string; // Added for TypeScript compatibility
  async?: boolean; // Added for TypeScript compatibility
}

export interface DataProcessingCapability {
  id?: string;
  name: string;
  description: string;
  inputTypes: string[];
  outputTypes: string[];
  async?: boolean; // Added for TypeScript compatibility
  processingType: 'transform' | 'filter' | 'aggregate' | 'validate' | 'convert';
  batchSupported: boolean;
  streamingSupported: boolean;
  maxThroughput: number; // items per second
}

export interface IntegrationCapability {
  id?: string;
  name: string;
  description: string;
  targetSystem?: string;
  integrationType: 'bridge' | 'adapter' | 'converter' | 'proxy' | 'gateway' | 'event'; // Added 'event' type
  protocols?: string[];
  authenticationRequired?: boolean;
  rateLimits?: RateLimit;
}

export interface FormatCapability {
  id?: string;
  name: string;
  description: string;
  mimeType?: string;
  fileExtensions?: string[];
  schemaVersion?: string;
  compressionSupported?: boolean;
  encryptionSupported?: boolean;
  supported?: boolean; // Added for TypeScript compatibility
}

export interface RealtimeCapability {
  id?: string;
  name: string;
  description: string;
  eventTypes?: string[];
  subscriptionModel?: 'push' | 'pull' | 'hybrid';
  maxConnections?: number;
  latencyTarget?: number; // milliseconds
  supported?: boolean; // Added for TypeScript compatibility
}

export interface SchemaInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  type: 'input' | 'output' | 'config' | 'state';
  schema: any; // JSON Schema object
  validationRules: ValidationRule[];
  examples: SchemaExample[];
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  rule: string; // JSON Schema validation rule
  severity: 'error' | 'warning' | 'info';
}

export interface SchemaExample {
  name: string;
  description: string;
  data: any;
  valid: boolean;
}

export interface CLIInterface {
  /**
   * CLI command structure
   */
  commands: CLICommand[];

  /**
   * Global options available to all commands
   */
  globalOptions: CLIOption[];

  /**
   * Help and documentation
   */
  help: CLIHelp;

  /**
   * Auto-completion support
   */
  autocomplete: AutoCompleteSupport;
}

export interface CLICommand {
  name: string;
  description: string;
  usage: string;
  aliases: string[];
  options: CLIOption[];
  arguments: CLIArgument[];
  examples: CLIExample[];
  subcommands?: CLICommand[];
}

export interface CLIOption {
  name: string;
  short?: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  default?: any;
  choices?: string[];
  validation?: string; // JSON Schema validation
}

export interface CLIArgument {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'file' | 'directory';
  required: boolean;
  multiple: boolean;
  validation?: string;
}

export interface CLIExample {
  command: string;
  description: string;
  output?: string;
}

export interface CLIHelp {
  overview: string;
  gettingStarted: string;
  tutorials: Tutorial[];
  faq: FAQ[];
  troubleshooting: TroubleshootingGuide[];
}

export interface Tutorial {
  title: string;
  description: string;
  steps: TutorialStep[];
  estimatedTime: number; // minutes
}

export interface TutorialStep {
  title: string;
  description: string;
  command?: string;
  expectedOutput?: string;
}

export interface FAQ {
  question: string;
  answer: string;
  tags: string[];
}

export interface TroubleshootingGuide {
  problem: string;
  symptoms: string[];
  solutions: TroubleshootingSolution[];
}

export interface TroubleshootingSolution {
  description: string;
  steps: string[];
  verification: string;
}

export interface AutoCompleteSupport {
  enabled: boolean;
  commandCompletions: boolean;
  optionCompletions: boolean;
  argumentCompletions: boolean;
  customCompletions?: CustomCompletion[];
}

export interface CustomCompletion {
  context: string;
  values: string[];
  dynamic: boolean;
  source?: string; // URL or function reference
}

export interface LifecycleHooks {
  /**
   * Initialization hooks
   */
  initialization: LifecycleHook[];

  /**
   * Runtime hooks
   */
  runtime: LifecycleHook[];

  /**
   * Cleanup hooks
   */
  cleanup: LifecycleHook[];

  /**
   * Error handling hooks
   */
  errorHandling: LifecycleHook[];
}

export interface LifecycleHook {
  id: string;
  name: string;
  description: string;
  event: string;
  priority: number;
  async: boolean;
  parameters: HookParameter[];
  returnType?: string;
}

export interface HookParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ModuleDependency {
  moduleId: string;
  version: string;
  type: 'required' | 'optional' | 'peer';
  description: string;
  compatibility: CompatibilityInfo;
}

export interface CompatibilityInfo {
  minVersion: string;
  maxVersion?: string;
  testedVersions: string[];
  knownIssues: string[];
}

export interface PerformanceProfile {
  /**
   * Memory usage characteristics
   */
  memory: MemoryProfile;

  /**
   * CPU usage characteristics
   */
  cpu: CPUProfile;

  /**
   * I/O characteristics
   */
  io: IOProfile;

  /**
   * Scalability characteristics
   */
  scalability: ScalabilityProfile;
}

export interface MemoryProfile {
  readThroughput: number; // MB
  peakUsage: number; // MB
  readThroughput: number; // MB per operation
  garbageCollection: GCProfile;
}

export interface GCProfile {
  frequency: number; // per minute
  averageDuration: number; // milliseconds
  impact: 'low' | 'medium' | 'high';
}

export interface CPUProfile {
  readThroughput: number; // percentage
  peakUsage: number; // percentage
  readThroughput: number; // percentage
  intensiveOperations: string[];
}

export interface IOProfile {
  readThroughput: number; // MB/s
  writeThroughput: number; // MB/s
  concurrentOperations: number;
  blockingOperations: string[];
}

export interface ScalabilityProfile {
  maxConcurrentUsers: number;
  maxDataSize: number; // MB
  performanceDegradation: PerformanceDegradation[];
}

export interface PerformanceDegradation {
  threshold: number;
  degradation: number; // percentage
  description: string;
}

export interface TestingCapabilities {
  /**
   * Test types supported
   */
  testTypes: TestType[];

  /**
   * Test data generation
   */
  testDataGeneration: TestDataCapability[];

  /**
   * Mock and stub capabilities
   */
  mocking: MockingCapability[];

  /**
   * Performance testing
   */
  performanceTesting: PerformanceTestCapability[];
}

export interface TestType {
  id: string;
  name: string;
  description: string;
  framework: string;
  coverage: number; // percentage
  automated: boolean;
}

export interface TestDataCapability {
  id: string;
  name: string;
  description: string;
  dataTypes: string[];
  generationMethod: 'random' | 'template' | 'fuzzing' | 'realistic';
  customization: boolean;
}

export interface MockingCapability {
  id: string;
  name: string;
  description: string;
  mockTypes: string[];
  isolationLevel: 'unit' | 'integration' | 'system';
  verification: boolean;
}

export interface PerformanceTestCapability {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  loadPatterns: string[];
  reporting: boolean;
}

export interface ResourceRequirements {
  memory: number; // MB
  cpu: number; // percentage
  disk: number; // MB
  network: number; // Mbps
  dependencies: string[];
}

export interface RateLimit {
  requests: number;
  window: number; // seconds
  burst: number;
}

export interface SchemaReference {
  schemaId: string;
  version: string;
  required: boolean;
}

/**
 * Capability Registry for managing all module capabilities
 */
export interface CapabilityRegistry {
  modules: Map<string, MIFFCapable>;
  capabilities: Map<string, ModuleCapabilities>;
  schemas: Map<string, SchemaInfo[]>;
  cliInterfaces: Map<string, CLIInterface>;
  lifecycleHooks: Map<string, LifecycleHooks>;
}

export class CapabilityManager {
  protected registry: CapabilityRegistry;
  private eventBus: any;

  constructor(eventBus: any) {
    this.registry = {
      modules: new Map(),
      capabilities: new Map(),
      schemas: new Map(),
      cliInterfaces: new Map(),
      lifecycleHooks: new Map()
    };
    this.eventBus = eventBus;
  }

  /**
   * Register a module's capabilities
   */
  registerModule(module: MIFFCapable): void {
    this.registry.modules.set(module.moduleId, module);
    this.registry.capabilities.set(module.moduleId, module.capabilities);
    this.registry.schemas.set(module.moduleId, module.schemas);
    this.registry.cliInterfaces.set(module.moduleId, module.cliInterface);
    this.registry.lifecycleHooks.set(module.moduleId, module.lifecycleHooks);

    this.eventBus.emit('capability:registered', {
      moduleId: module.moduleId,
      capabilities: module.capabilities
    });
  }

  /**
   * Get module capabilities
   */
  getModuleCapabilities(moduleId: string): MIFFCapable | undefined {
    return this.registry.modules.get(moduleId);
  }

  /**
   * Find modules by capability
   */
  findModulesByCapability(capability: {
    operation?: string;
    dataType?: string;
    format?: string;
    integration?: string;
  }): MIFFCapable[] {
    const results: MIFFCapable[] = [];

    for (const module of this.registry.modules.values()) {
      let matches = true;

      if (capability.operation) {
        const hasOperation = module.capabilities.operations.some(
          op => op.id === capability.operation || op.name === capability.operation
        );
        if (!hasOperation) matches = false;
      }

      if (capability.dataType) {
        const hasDataType = module.capabilities.dataProcessing.some(
          dp => dp.inputTypes.includes(capability.dataType!) || dp.outputTypes.includes(capability.dataType!)
        );
        if (!hasDataType) matches = false;
      }

      if (capability.format) {
        const hasFormat = module.capabilities.formats.some(
          f => f.id === capability.format || f.name === capability.format
        );
        if (!hasFormat) matches = false;
      }

      if (capability.integration) {
        const hasIntegration = module.capabilities.integrations.some(
          i => i.id === capability.integration || i.name === capability.integration
        );
        if (!hasIntegration) matches = false;
      }

      if (matches) {
        results.push(module);
      }
    }

    return results;
  }

  /**
   * Generate dynamic CLI help
   */
  generateCLIHelp(moduleId: string): string {
    const module = this.registry.modules.get(moduleId);
    if (!module) return 'Module not found';

    const cli = module.cliInterface;
    let help = `# ${module.moduleName} CLI Help\n\n`;
    help += `${module.description}\n\n`;

    help += `## Commands\n\n`;
    for (const command of cli.commands) {
      help += `### ${command.name}\n`;
      help += `${command.description}\n\n`;
      help += `**Usage:** \`${command.usage}\`\n\n`;
      
      if (command.options.length > 0) {
        help += `**Options:**\n`;
        for (const option of command.options) {
          help += `- \`--${option.name}\` (${option.type}): ${option.description}\n`;
        }
        help += `\n`;
      }

      if (command.examples.length > 0) {
        help += `**Examples:**\n`;
        for (const example of command.examples) {
          help += `\`${example.command}\` - ${example.description}\n`;
        }
        help += `\n`;
      }
    }

    return help;
  }

  /**
   * Validate module capabilities against requirements
   */
  validateCapabilities(moduleId: string, requirements: {
    operations?: string[];
    schemas?: string[];
    performance?: Partial<PerformanceProfile>;
  }): { valid: boolean; issues: string[] } {
    const module = this.registry.modules.get(moduleId);
    if (!module) {
      return { valid: false, issues: ['Module not found'] };
    }

    const issues: string[] = [];

    if (requirements.operations) {
      for (const requiredOp of requirements.operations) {
        const hasOperation = module.capabilities.operations.some(
          op => op.id === requiredOp || op.name === requiredOp
        );
        if (!hasOperation) {
          issues.push(`Missing required operation: ${requiredOp}`);
        }
      }
    }

    if (requirements.schemas) {
      for (const requiredSchema of requirements.schemas) {
        const hasSchema = module.schemas.some(
          schema => schema.id === requiredSchema || schema.name === requiredSchema
        );
        if (!hasSchema) {
          issues.push(`Missing required schema: ${requiredSchema}`);
        }
      }
    }

    if (requirements.performance) {
      const perf = module.performanceProfile;
      const req = requirements.performance;

      if (req.memory && perf.memory.peakUsage > req.memory.peakUsage!) {
        issues.push(`Memory usage exceeds requirement: ${perf.memory.peakUsage}MB > ${req.memory.peakUsage}MB`);
      }

      if (req.cpu && perf.cpu.peakUsage > req.cpu.peakUsage!) {
        issues.push(`CPU usage exceeds requirement: ${perf.cpu.peakUsage}% > ${req.cpu.peakUsage}%`);
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Generate capability report
   */
  generateCapabilityReport(): string {
    let report = '# MIFF Capability Report\n\n';
    report += `**Generated:** ${new Date().toISOString()}\n`;
    report += `**Total Modules:** ${this.registry.modules.size}\n\n`;

    for (const module of this.registry.modules.values()) {
      report += `## ${module.moduleName} (${module.moduleId})\n`;
      report += `**Version:** ${module.version}\n`;
      report += `**Description:** ${module.description}\n\n`;

      report += `### Operations (${module.capabilities.operations.length})\n`;
      for (const op of module.capabilities.operations) {
        report += `- ${op.name} (${op.category}): ${op.description}\n`;
      }

      report += `\n### Data Processing (${module.capabilities.dataProcessing.length})\n`;
      for (const dp of module.capabilities.dataProcessing) {
        report += `- ${dp.name}: ${dp.description}\n`;
      }

      report += `\n### Integrations (${module.capabilities.integrations.length})\n`;
      for (const integration of module.capabilities.integrations) {
        report += `- ${integration.name} (${integration.targetSystem}): ${integration.description}\n`;
      }

      report += `\n### Formats (${module.capabilities.formats.length})\n`;
      for (const format of module.capabilities.formats) {
        report += `- ${format.name} (${format.mimeType}): ${format.description}\n`;
      }

      report += `\n---\n\n`;
    }

    return report;
  }
}

export default CapabilityManager;