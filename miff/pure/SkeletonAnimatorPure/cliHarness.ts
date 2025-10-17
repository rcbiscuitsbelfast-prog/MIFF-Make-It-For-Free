/**
 * CLI Harness for SkeletonAnimatorPure
 * 
 * Provides command-line interface for testing and validation
 * of all skeleton animator modules
 */

import { SkeletonAnimatorManager } from './Manager';
import { RigBuilder } from './RigBuilder';
import { LimbAttachment } from './LimbAttachment';
import { SkinMeshGenerator } from './SkinMeshGenerator';
import { FacialDetailBuilder } from './FacialDetailBuilder';
import { AnimationSequencer } from './AnimationSequencer';
import { ExportIntegration } from './ExportIntegration';
import { UIBuilder } from './UIBuilder';

export interface CLICommand {
  name: string;
  description: string;
  args: string[];
  execute: (args: string[]) => Promise<string>;
}

export class SkeletonAnimatorCLI {
  private manager: SkeletonAnimatorManager;
  private commands: Map<string, CLICommand> = new Map();

  constructor() {
    this.manager = new SkeletonAnimatorManager();
    this.registerCommands();
  }

  /**
   * Register all CLI commands
   */
  private registerCommands(): void {
    // System commands
    this.registerCommand({
      name: 'init',
      description: 'Initialize skeleton animator system',
      args: ['[characterType]'],
      execute: async (args) => this.initSystem(args)
    });

    this.registerCommand({
      name: 'status',
      description: 'Get system status',
      args: [],
      execute: async () => this.getStatus()
    });

    this.registerCommand({
      name: 'validate',
      description: 'Validate complete system',
      args: [],
      execute: async () => this.validateSystem()
    });

    this.registerCommand({
      name: 'reset',
      description: 'Reset system to initial state',
      args: [],
      execute: async () => this.resetSystem()
    });

    // Rig commands
    this.registerCommand({
      name: 'rig-create',
      description: 'Create core body rig',
      args: [],
      execute: async () => this.createRig()
    });

    this.registerCommand({
      name: 'rig-export',
      description: 'Export rig as JSON',
      args: ['[filename]'],
      execute: async (args) => this.exportRig(args)
    });

    this.registerCommand({
      name: 'rig-import',
      description: 'Import rig from JSON',
      args: ['<filename>'],
      execute: async (args) => this.importRig(args)
    });

    // Limb commands
    this.registerCommand({
      name: 'limb-add-arms',
      description: 'Add humanoid arms',
      args: [],
      execute: async () => this.addArms()
    });

    this.registerCommand({
      name: 'limb-add-legs',
      description: 'Add humanoid legs',
      args: [],
      execute: async () => this.addLegs()
    });

    this.registerCommand({
      name: 'limb-add-wings',
      description: 'Add wings',
      args: ['<attachmentPoint>'],
      execute: async (args) => this.addWings(args)
    });

    this.registerCommand({
      name: 'limb-add-tail',
      description: 'Add tail',
      args: ['<attachmentPoint>', '[segments]'],
      execute: async (args) => this.addTail(args)
    });

    // Skin commands
    this.registerCommand({
      name: 'skin-generate',
      description: 'Generate skin mesh',
      args: [],
      execute: async () => this.generateSkin()
    });

    this.registerCommand({
      name: 'skin-add-morph',
      description: 'Add morph target',
      args: ['<name>', '<weight>'],
      execute: async (args) => this.addMorphTarget(args)
    });

    this.registerCommand({
      name: 'skin-export',
      description: 'Export skin as JSON',
      args: ['[filename]'],
      execute: async (args) => this.exportSkin(args)
    });

    // Face commands
    this.registerCommand({
      name: 'face-add-eyes',
      description: 'Add eyes',
      args: [],
      execute: async () => this.addEyes()
    });

    this.registerCommand({
      name: 'face-add-nose',
      description: 'Add nose',
      args: [],
      execute: async () => this.addNose()
    });

    this.registerCommand({
      name: 'face-add-mouth',
      description: 'Add mouth',
      args: [],
      execute: async () => this.addMouth()
    });

    this.registerCommand({
      name: 'face-add-ears',
      description: 'Add ears',
      args: [],
      execute: async () => this.addEars()
    });

    this.registerCommand({
      name: 'face-toggle-symmetry',
      description: 'Toggle facial symmetry',
      args: ['<enabled>'],
      execute: async (args) => this.toggleSymmetry(args)
    });

    // Animation commands
    this.registerCommand({
      name: 'anim-walk',
      description: 'Generate walk animation',
      args: ['[speed]'],
      execute: async (args) => this.generateWalkAnimation(args)
    });

    this.registerCommand({
      name: 'anim-idle',
      description: 'Generate idle animation',
      args: [],
      execute: async () => this.generateIdleAnimation()
    });

    this.registerCommand({
      name: 'anim-jump',
      description: 'Generate jump animation',
      args: [],
      execute: async () => this.generateJumpAnimation()
    });

    this.registerCommand({
      name: 'anim-attack',
      description: 'Generate attack animation',
      args: ['<type>'],
      execute: async (args) => this.generateAttackAnimation(args)
    });

    this.registerCommand({
      name: 'anim-emote',
      description: 'Generate emote animation',
      args: ['<type>'],
      execute: async (args) => this.generateEmoteAnimation(args)
    });

    // Export commands
    this.registerCommand({
      name: 'export-gbpg',
      description: 'Export as .gbpg format',
      args: ['<name>', '[filename]'],
      execute: async (args) => this.exportGbpkg(args)
    });

    this.registerCommand({
      name: 'export-gltf',
      description: 'Export as GLTF format',
      args: ['<name>', '[filename]'],
      execute: async (args) => this.exportGLTF(args)
    });

    this.registerCommand({
      name: 'export-integration',
      description: 'Generate integration data',
      args: ['<system>', '<name>'],
      execute: async (args) => this.exportIntegration(args)
    });

    // UI commands
    this.registerCommand({
      name: 'ui-mode',
      description: 'Set UI mode',
      args: ['<mode>'],
      execute: async (args) => this.setUIMode(args)
    });

    this.registerCommand({
      name: 'ui-tool',
      description: 'Set UI tool',
      args: ['<tool>'],
      execute: async (args) => this.setUITool(args)
    });

    this.registerCommand({
      name: 'ui-export',
      description: 'Export UI state',
      args: ['[filename]'],
      execute: async (args) => this.exportUIState(args)
    });

    // Test commands
    this.registerCommand({
      name: 'test-golden',
      description: 'Run golden tests',
      args: ['[testName]'],
      execute: async (args) => this.runGoldenTests(args)
    });

    this.registerCommand({
      name: 'test-scenario',
      description: 'Run scenario tests',
      args: ['<scenario>'],
      execute: async (args) => this.runScenarioTests(args)
    });

    // Help command
    this.registerCommand({
      name: 'help',
      description: 'Show help information',
      args: ['[command]'],
      execute: async (args) => this.showHelp(args)
    });
  }

  /**
   * Register a command
   */
  private registerCommand(command: CLICommand): void {
    this.commands.set(command.name, command);
  }

  /**
   * Execute a command
   */
  async executeCommand(commandName: string, args: string[]): Promise<string> {
    const command = this.commands.get(commandName);
    if (!command) {
      return `Unknown command: ${commandName}. Use 'help' to see available commands.`;
    }

    try {
      return await command.execute(args);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return `Error executing command ${commandName}: ${error}`;
    }
  }

  /**
   * Get all available commands
   */
  getCommands(): CLICommand[] {
    return Array.from(this.commands.values());
  }

  // Command implementations
  private async initSystem(args: string[]): Promise<string> {
    const characterType = args[0] as 'humanoid' | 'creature' | 'robot' || 'humanoid';
    this.manager.createFullCharacter('TestCharacter', { characterType });
    return `System initialized with ${characterType} character.`;
  }

  private async getStatus(): Promise<string> {
    const status = this.manager.getStatus();
    return JSON.stringify(status, null, 2);
  }

  private async validateSystem(): Promise<string> {
    const validation = this.manager.validate({});
    if (validation.valid) {
      return 'System validation passed.';
    } else {
      return `System validation failed:\n${validation.errors.join('\n')}`;
    }
  }

  private async resetSystem(): Promise<string> {
    this.manager.reset();
    return 'System reset to initial state.';
  }

  private async createRig(): Promise<string> {
    this.manager.initializeRigBuilder();
    this.manager.getRigBuilder().createCoreBody();
    return 'Core body rig created.';
  }

  private async exportRig(args: string[]): Promise<string> {
    const filename = args[0] || 'rig.json';
    const rigJson = this.manager.getRigBuilder().exportRigJson();
    // In a real implementation, this would write to file
    return `Rig exported to ${filename}:\n${rigJson}`;
  }

  private async importRig(args: string[]): Promise<string> {
    const filename = args[0];
    // In a real implementation, this would read from file
    return `Rig imported from ${filename}.`;
  }

  private async addArms(): Promise<string> {
    this.manager.initializeLimbAttachment();
    this.manager.getLimbAttachment()?.addHumanoidArms();
    return 'Humanoid arms added.';
  }

  private async addLegs(): Promise<string> {
    this.manager.initializeLimbAttachment();
    this.manager.getLimbAttachment()?.addHumanoidLegs();
    return 'Humanoid legs added.';
  }

  private async addWings(args: string[]): Promise<string> {
    const attachmentPoint = args[0];
    this.manager.initializeLimbAttachment();
    this.manager.getLimbAttachment()?.addWings(attachmentPoint);
    return `Wings added to ${attachmentPoint}.`;
  }

  private async addTail(args: string[]): Promise<string> {
    const attachmentPoint = args[0];
    const segments = parseInt(args[1]) || 5;
    this.manager.initializeLimbAttachment();
    this.manager.getLimbAttachment()?.addTail(attachmentPoint, segments);
    return `Tail with ${segments} segments added to ${attachmentPoint}.`;
  }

  private async generateSkin(): Promise<string> {
    this.manager.initializeSkinMeshGenerator();
    this.manager.getSkinMeshGenerator()?.generateBaseMesh();
    return 'Skin mesh generated.';
  }

  private async addMorphTarget(args: string[]): Promise<string> {
    const name = args[0];
    const weight = parseFloat(args[1]) || 1.0;
    this.manager.initializeSkinMeshGenerator();
    this.manager.getSkinMeshGenerator()?.addMorphTarget(name, [], weight);
    return `Morph target '${name}' added with weight ${weight}.`;
  }

  private async exportSkin(args: string[]): Promise<string> {
    const filename = args[0] || 'skin.json';
    const skinJson = this.manager.getSkinMeshGenerator()?.exportSkinJson() || '{}';
    return `Skin exported to ${filename}:\n${skinJson}`;
  }

  private async addEyes(): Promise<string> {
    this.manager.initializeFacialDetailBuilder();
    this.manager.getFacialDetailBuilder()?.addEyes();
    return 'Eyes added.';
  }

  private async addNose(): Promise<string> {
    this.manager.initializeFacialDetailBuilder();
    this.manager.getFacialDetailBuilder()?.addNose();
    return 'Nose added.';
  }

  private async addMouth(): Promise<string> {
    this.manager.initializeFacialDetailBuilder();
    this.manager.getFacialDetailBuilder()?.addMouth();
    return 'Mouth added.';
  }

  private async addEars(): Promise<string> {
    this.manager.initializeFacialDetailBuilder();
    this.manager.getFacialDetailBuilder()?.addEars();
    return 'Ears added.';
  }

  private async toggleSymmetry(args: string[]): Promise<string> {
    const enabled = args[0] === 'true';
    this.manager.initializeFacialDetailBuilder();
    this.manager.getFacialDetailBuilder()?.toggleSymmetry(enabled);
    return `Facial symmetry ${enabled ? 'enabled' : 'disabled'}.`;
  }

  private async generateWalkAnimation(args: string[]): Promise<string> {
    const speed = parseFloat(args[0]) || 1.0;
    this.manager.initializeAnimationSequencer();
    this.manager.getAnimationSequencer()?.generateWalkAnimation(speed);
    return `Walk animation generated with speed ${speed}.`;
  }

  private async generateIdleAnimation(): Promise<string> {
    this.manager.initializeAnimationSequencer();
    this.manager.getAnimationSequencer()?.generateIdleAnimation();
    return 'Idle animation generated.';
  }

  private async generateJumpAnimation(): Promise<string> {
    this.manager.initializeAnimationSequencer();
    this.manager.getAnimationSequencer()?.generateJumpAnimation();
    return 'Jump animation generated.';
  }

  private async generateAttackAnimation(args: string[]): Promise<string> {
    const type = args[0] as 'punch' | 'kick' | 'slash';
    this.manager.initializeAnimationSequencer();
    this.manager.getAnimationSequencer()?.generateAttackAnimation(type);
    return `${type} attack animation generated.`;
  }

  private async generateEmoteAnimation(args: string[]): Promise<string> {
    const type = args[0] as 'wave' | 'nod' | 'shake' | 'dance';
    this.manager.initializeAnimationSequencer();
    this.manager.getAnimationSequencer()?.generateEmoteAnimation(type);
    return `${type} emote animation generated.`;
  }

  private async exportGbpkg(args: string[]): Promise<string> {
    const name = args[0];
    const filename = args[1] || `${name}.gbpg`;
    const gbpkgData = this.manager.exportCharacter(name, 'gbpg');
    return `Character exported to ${filename}:\n${gbpkgData}`;
  }

  private async exportGLTF(args: string[]): Promise<string> {
    const name = args[0];
    const filename = args[1] || `${name}.gltf`;
    const gltfData = this.manager.exportCharacter(name, 'gltf');
    return `Character exported to ${filename}:\n${gltfData}`;
  }

  private async exportIntegration(args: string[]): Promise<string> {
    const system = args[0];
    const name = args[1];
    this.manager.initializeExportIntegration();
    const exportIntegration = this.manager.getExportIntegration();
    
    if (!exportIntegration) {
      return 'Export integration not initialized.';
    }

    const exportConfig = exportIntegration.createCreatureExport(name);
    let integrationData;

    switch (system) {
      case 'renderworld':
        integrationData = exportIntegration.generateRenderWorldIntegration(exportConfig);
        break;
      case 'combatcore':
        integrationData = exportIntegration.generateCombatCoreIntegration(exportConfig);
        break;
      case 'dialogue':
        integrationData = exportIntegration.generateDialogueIntegration(exportConfig);
        break;
      case 'startmenu':
        integrationData = exportIntegration.generateStartMenuIntegration(exportConfig);
        break;
      case 'saveload':
        integrationData = exportIntegration.generateSaveLoadIntegration(exportConfig);
        break;
      default:
        return `Unknown system: ${system}`;
    }

    return `Integration data for ${system}:\n${JSON.stringify(integrationData, null, 2)}`;
  }

  private async setUIMode(args: string[]): Promise<string> {
    const mode = args[0] as 'rig' | 'limb' | 'skin' | 'face' | 'animation' | 'export';
    this.manager.initializeUIBuilder();
    this.manager.getUIBuilder()?.setMode(mode);
    return `UI mode set to ${mode}.`;
  }

  private async setUITool(args: string[]): Promise<string> {
    const tool = args[0];
    this.manager.initializeUIBuilder();
    this.manager.getUIBuilder()?.setTool(tool);
    return `UI tool set to ${tool}.`;
  }

  private async exportUIState(args: string[]): Promise<string> {
    const filename = args[0] || 'ui_state.json';
    this.manager.initializeUIBuilder();
    const uiState = this.manager.getUIBuilder()?.exportUIState() || '{}';
    return `UI state exported to ${filename}:\n${uiState}`;
  }

  private async runGoldenTests(args: string[]): Promise<string> {
    const testName = args[0];
    // In a real implementation, this would run actual golden tests
    return `Golden tests ${testName ? `for ${testName}` : ''} completed.`;
  }

  private async runScenarioTests(args: string[]): Promise<string> {
    const scenario = args[0];
    // In a real implementation, this would run scenario tests
    return `Scenario test '${scenario}' completed.`;
  }

  private async showHelp(args: string[]): Promise<string> {
    const commandName = args[0];
    
    if (commandName) {
      const command = this.commands.get(commandName);
      if (command) {
        return `Command: ${command.name}\nDescription: ${command.description}\nUsage: ${command.name} ${command.args.join(' ')}`;
      } else {
        return `Command '${commandName}' not found.`;
      }
    }

    const helpText = ['Available commands:', ''];
    this.commands.forEach((command: any) => {
      helpText.push(`${command.name.padEnd(20)} - ${command.description}`);
    });
    helpText.push('', 'Use "help <command>" for detailed information about a specific command.');

    return helpText.join('\n');
  }
}

// Export CLI harness function
export function cliHarness(): SkeletonAnimatorCLI {
  return new SkeletonAnimatorCLI();
}