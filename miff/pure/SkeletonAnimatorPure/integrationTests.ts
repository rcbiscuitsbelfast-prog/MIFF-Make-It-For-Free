/**
 * Integration Tests for SkeletonAnimatorPure
 * 
 * Comprehensive tests ensuring compatibility with existing MIFF modules
 * and full system integration
 */

import { SkeletonAnimatorManager } from './Manager';
import { RigBuilder } from './RigBuilder';
import { LimbAttachment } from './LimbAttachment';
import { SkinMeshGenerator } from './SkinMeshGenerator';
import { FacialDetailBuilder } from './FacialDetailBuilder';
import { AnimationSequencer } from './AnimationSequencer';
import { ExportIntegration } from './ExportIntegration';
import { UIBuilder } from './UIBuilder';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
  details?: any;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  totalDuration: number;
  passed: number;
  failed: number;
}

export class SkeletonAnimatorIntegrationTests {
  private manager: SkeletonAnimatorManager;

  constructor() {
    this.manager = new SkeletonAnimatorManager();
  }

  /**
   * Run all integration tests
   */
  async runAllTests(): Promise<TestSuite[]> {
    const suites: TestSuite[] = [];

    // Core module tests
    suites.push(await this.testRigBuilder());
    suites.push(await this.testLimbAttachment());
    suites.push(await this.testSkinMeshGenerator());
    suites.push(await this.testFacialDetailBuilder());
    suites.push(await this.testAnimationSequencer());
    suites.push(await this.testExportIntegration());
    suites.push(await this.testUIBuilder());

    // Integration tests
    suites.push(await this.testFullWorkflow());
    suites.push(await this.testMIFFIntegration());
    suites.push(await this.testExportFormats());
    suites.push(await this.testPerformance());
    suites.push(await this.testErrorHandling());

    return suites;
  }

  /**
   * Test RigBuilder module
   */
  private async testRigBuilder(): Promise<TestSuite> {
    const startTime = Date.now();
    const tests: TestResult[] = [];

    try {
      // Test 1: Create core body
      const rigBuilder = new RigBuilder();
      rigBuilder.createCoreBody();
      const rig = rigBuilder.getConfig();
      
      tests.push({
        name: 'Create core body',
        passed: rig.nodes['torso'] !== undefined && rig.nodes['neck'] !== undefined && rig.nodes['head'] !== undefined,
        duration: new Date() - startTime,
        details: { nodeCount: Object.keys(rig.nodes).length }
      });

      // Test 2: Add snap points
      const snapPointCount = rig.nodes['torso']?.snapPoints.length || 0;
      tests.push({
        name: 'Add snap points',
        passed: snapPointCount > 0,
        duration: new Date() - startTime,
        details: { snapPointCount }
      });

      // Test 3: Validate rig
      const validation = rigBuilder.validate({});
      tests.push({
        name: 'Validate rig',
        passed: validation.valid,
        duration: new Date() - startTime,
        details: { errors: validation.errors }
      });

      // Test 4: Export rig
      const rigJson = rigBuilder.exportRigJson();
      tests.push({
        name: 'Export rig JSON',
        passed: rigJson.length > 0 && rigJson.includes('"exportFormat"'),
        duration: new Date() - startTime,
        details: { jsonLength: rigJson.length }
      });

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      tests.push({
        name: 'RigBuilder error',
        passed: false,
        error: String(error),
        duration: new Date() - startTime
      });
    }

    return {
      name: 'RigBuilder Tests',
      tests,
      totalDuration: new Date() - startTime,
      passed: tests.filter((t: any) => t.passed).length,
      failed: tests.filter((t: any) => !t.passed).length
    };
  }

  /**
   * Test LimbAttachment module
   */
  private async testLimbAttachment(): Promise<TestSuite> {
    const startTime = Date.now();
    const tests: TestResult[] = [];

    try {
      // Setup rig
      const rigBuilder = new RigBuilder();
      rigBuilder.createCoreBody();
      const rig = rigBuilder.getConfig();

      // Test 1: Initialize limb attachment
      const limbAttachment = new LimbAttachment(rig);
      tests.push({
        name: 'Initialize limb attachment',
        passed: limbAttachment !== null,
        duration: new Date() - startTime
      });

      // Test 2: Add humanoid arms
      limbAttachment.addHumanoidArms();
      const arms = limbAttachment.getLimbsByType('arm');
      tests.push({
        name: 'Add humanoid arms',
        passed: arms.length === 2,
        duration: new Date() - startTime,
        details: { armCount: arms.length }
      });

      // Test 3: Add humanoid legs
      limbAttachment.addHumanoidLegs();
      const legs = limbAttachment.getLimbsByType('leg');
      tests.push({
        name: 'Add humanoid legs',
        passed: legs.length === 2,
        duration: new Date() - startTime,
        details: { legCount: legs.length }
      });

      // Test 4: Add wings
      limbAttachment.addWings('torso_neck');
      const wings = limbAttachment.getLimbsByType('wing');
      tests.push({
        name: 'Add wings',
        passed: wings.length === 2,
        duration: new Date() - startTime,
        details: { wingCount: wings.length }
      });

      // Test 5: Add tail
      limbAttachment.addTail('torso_neck', 5);
      const tails = limbAttachment.getLimbsByType('tail');
      tests.push({
        name: 'Add tail',
        passed: tails.length === 1 && tails[0].segments.length === 5,
        duration: new Date() - startTime,
        details: { tailCount: tails.length, segmentCount: tails[0]?.segments.length }
      });

      // Test 6: Export limbs
      const limbsJson = limbAttachment.exportLimbsJson();
      tests.push({
        name: 'Export limbs JSON',
        passed: limbsJson.length > 0 && limbsJson.includes('"exportFormat"'),
        duration: new Date() - startTime,
        details: { jsonLength: limbsJson.length }
      });

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      tests.push({
        name: 'LimbAttachment error',
        passed: false,
        error: String(error),
        duration: new Date() - startTime
      });
    }

    return {
      name: 'LimbAttachment Tests',
      tests,
      totalDuration: new Date() - startTime,
      passed: tests.filter((t: any) => t.passed).length,
      failed: tests.filter((t: any) => !t.passed).length
    };
  }

  /**
   * Test SkinMeshGenerator module
   */
  private async testSkinMeshGenerator(): Promise<TestSuite> {
    const startTime = Date.now();
    const tests: TestResult[] = [];

    try {
      // Setup rig
      const rigBuilder = new RigBuilder();
      rigBuilder.createCoreBody();
      const rig = rigBuilder.getConfig();

      // Test 1: Initialize skin mesh generator
      const skinGenerator = new SkinMeshGenerator(rig);
      tests.push({
        name: 'Initialize skin mesh generator',
        passed: skinGenerator !== null,
        duration: new Date() - startTime
      });

      // Test 2: Generate base mesh
      skinGenerator.generateBaseMesh();
      const skinConfig = skinGenerator.getSkinConfig();
      tests.push({
        name: 'Generate base mesh',
        passed: skinConfig.meshData.vertices.length > 0,
        duration: new Date() - startTime,
        details: { 
          vertexCount: skinConfig.meshData.vertices.length / 3,
          materialCount: skinConfig.materials.length
        }
      });

      // Test 3: Add morph target
      skinGenerator.addMorphTarget('test_morph', Array(100).fill(0.1), 0.5);
      const morphTargets = skinConfig.morphTargets;
      tests.push({
        name: 'Add morph target',
        passed: morphTargets.length === 1 && morphTargets[0].weight === 0.5,
        duration: new Date() - startTime,
        details: { morphTargetCount: morphTargets.length }
      });

      // Test 4: Add texture
      skinGenerator.addTexture('skin_material', {
        type: 'diffuse',
        path: 'textures/skin_diffuse.jpg',
        scale: { x: 1, y: 1, z: 1 },
        offset: { x: 0, y: 0, z: 0 }
      });
      const textures = skinConfig.materials[0].textures;
      tests.push({
        name: 'Add texture',
        passed: textures.length === 1,
        duration: new Date() - startTime,
        details: { textureCount: textures.length }
      });

      // Test 5: Validate skin
      const validation = skinGenerator.validate({});
      tests.push({
        name: 'Validate skin',
        passed: validation.valid,
        duration: new Date() - startTime,
        details: { errors: validation.errors }
      });

      // Test 6: Export skin
      const skinJson = skinGenerator.exportSkinJson();
      tests.push({
        name: 'Export skin JSON',
        passed: skinJson.length > 0 && skinJson.includes('"exportFormat"'),
        duration: new Date() - startTime,
        details: { jsonLength: skinJson.length }
      });

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      tests.push({
        name: 'SkinMeshGenerator error',
        passed: false,
        error: String(error),
        duration: new Date() - startTime
      });
    }

    return {
      name: 'SkinMeshGenerator Tests',
      tests,
      totalDuration: new Date() - startTime,
      passed: tests.filter((t: any) => t.passed).length,
      failed: tests.filter((t: any) => !t.passed).length
    };
  }

  /**
   * Test FacialDetailBuilder module
   */
  private async testFacialDetailBuilder(): Promise<TestSuite> {
    const startTime = Date.now();
    const tests: TestResult[] = [];

    try {
      // Setup rig
      const rigBuilder = new RigBuilder();
      rigBuilder.createCoreBody();
      const rig = rigBuilder.getConfig();

      // Test 1: Initialize facial detail builder
      const faceBuilder = new FacialDetailBuilder(rig);
      tests.push({
        name: 'Initialize facial detail builder',
        passed: faceBuilder !== null,
        duration: new Date() - startTime
      });

      // Test 2: Add eyes
      faceBuilder.addEyes();
      const eyes = faceBuilder.getFeaturesByType('eye');
      tests.push({
        name: 'Add eyes',
        passed: eyes.length === 2,
        duration: new Date() - startTime,
        details: { eyeCount: eyes.length }
      });

      // Test 3: Add nose
      faceBuilder.addNose();
      const noses = faceBuilder.getFeaturesByType('nose');
      tests.push({
        name: 'Add nose',
        passed: noses.length === 1,
        duration: new Date() - startTime,
        details: { noseCount: noses.length }
      });

      // Test 4: Add mouth
      faceBuilder.addMouth();
      const mouths = faceBuilder.getFeaturesByType('mouth');
      tests.push({
        name: 'Add mouth',
        passed: mouths.length === 1,
        duration: new Date() - startTime,
        details: { mouthCount: mouths.length }
      });

      // Test 5: Add ears
      faceBuilder.addEars();
      const ears = faceBuilder.getFeaturesByType('ear');
      tests.push({
        name: 'Add ears',
        passed: ears.length === 2,
        duration: new Date() - startTime,
        details: { earCount: ears.length }
      });

      // Test 6: Toggle symmetry
      faceBuilder.toggleSymmetry(false);
      const faceConfig = faceBuilder.getFaceConfig();
      tests.push({
        name: 'Toggle symmetry',
        passed: faceConfig.symmetry === false,
        duration: new Date() - startTime,
        details: { symmetry: faceConfig.symmetry }
      });

      // Test 7: Validate face
      const validation = faceBuilder.validate({});
      tests.push({
        name: 'Validate face',
        passed: validation.valid,
        duration: new Date() - startTime,
        details: { errors: validation.errors }
      });

      // Test 8: Export face
      const faceJson = faceBuilder.exportFaceJson();
      tests.push({
        name: 'Export face JSON',
        passed: faceJson.length > 0 && faceJson.includes('"exportFormat"'),
        duration: new Date() - startTime,
        details: { jsonLength: faceJson.length }
      });

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      tests.push({
        name: 'FacialDetailBuilder error',
        passed: false,
        error: String(error),
        duration: new Date() - startTime
      });
    }

    return {
      name: 'FacialDetailBuilder Tests',
      tests,
      totalDuration: new Date() - startTime,
      passed: tests.filter((t: any) => t.passed).length,
      failed: tests.filter((t: any) => !t.passed).length
    };
  }

  /**
   * Test AnimationSequencer module
   */
  private async testAnimationSequencer(): Promise<TestSuite> {
    const startTime = Date.now();
    const tests: TestResult[] = [];

    try {
      // Setup rig
      const rigBuilder = new RigBuilder();
      rigBuilder.createCoreBody();
      const rig = rigBuilder.getConfig();

      // Test 1: Initialize animation sequencer
      const animSequencer = new AnimationSequencer(rig);
      tests.push({
        name: 'Initialize animation sequencer',
        passed: animSequencer !== null,
        duration: new Date() - startTime
      });

      // Test 2: Generate walk animation
      animSequencer.generateWalkAnimation(1.0);
      const walkAnims = animSequencer.getAnimationsByType('walk');
      tests.push({
        name: 'Generate walk animation',
        passed: walkAnims.length === 1,
        duration: new Date() - startTime,
        details: { walkAnimCount: walkAnims.length }
      });

      // Test 3: Generate idle animation
      animSequencer.generateIdleAnimation();
      const idleAnims = animSequencer.getAnimationsByType('idle');
      tests.push({
        name: 'Generate idle animation',
        passed: idleAnims.length === 1,
        duration: new Date() - startTime,
        details: { idleAnimCount: idleAnims.length }
      });

      // Test 4: Generate jump animation
      animSequencer.generateJumpAnimation();
      const jumpAnims = animSequencer.getAnimationsByType('jump');
      tests.push({
        name: 'Generate jump animation',
        passed: jumpAnims.length === 1,
        duration: new Date() - startTime,
        details: { jumpAnimCount: jumpAnims.length }
      });

      // Test 5: Generate attack animation
      animSequencer.generateAttackAnimation('punch');
      const attackAnims = animSequencer.getAnimationsByType('attack');
      tests.push({
        name: 'Generate attack animation',
        passed: attackAnims.length === 1,
        duration: new Date() - startTime,
        details: { attackAnimCount: attackAnims.length }
      });

      // Test 6: Generate emote animation
      animSequencer.generateEmoteAnimation('wave');
      const emoteAnims = animSequencer.getAnimationsByType('emote');
      tests.push({
        name: 'Generate emote animation',
        passed: emoteAnims.length === 1,
        duration: new Date() - startTime,
        details: { emoteAnimCount: emoteAnims.length }
      });

      // Test 7: Validate animations
      const validation = animSequencer.validate({});
      tests.push({
        name: 'Validate animations',
        passed: validation.valid,
        duration: new Date() - startTime,
        details: { errors: validation.errors }
      });

      // Test 8: Export animations
      const animsJson = animSequencer.exportAnimationsJson();
      tests.push({
        name: 'Export animations JSON',
        passed: animsJson.length > 0 && animsJson.includes('"exportFormat"'),
        duration: new Date() - startTime,
        details: { jsonLength: animsJson.length }
      });

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      tests.push({
        name: 'AnimationSequencer error',
        passed: false,
        error: String(error),
        duration: new Date() - startTime
      });
    }

    return {
      name: 'AnimationSequencer Tests',
      tests,
      totalDuration: new Date() - startTime,
      passed: tests.filter((t: any) => t.passed).length,
      failed: tests.filter((t: any) => !t.passed).length
    };
  }

  /**
   * Test ExportIntegration module
   */
  private async testExportIntegration(): Promise<TestSuite> {
    const startTime = Date.now();
    const tests: TestResult[] = [];

    try {
      // Setup complete skeleton state
      this.manager.createFullCharacter('TestCharacter', {
        includeLimbs: true,
        includeSkin: true,
        includeFace: true,
        includeAnimations: true,
        characterType: 'humanoid'
      });

      const skeletonState = this.manager.getSkeletonState();
      const exportIntegration = new ExportIntegration(skeletonState);

      // Test 1: Initialize export integration
      tests.push({
        name: 'Initialize export integration',
        passed: exportIntegration !== null,
        duration: new Date() - startTime
      });

      // Test 2: Create creature export
      const exportConfig = exportIntegration.createCreatureExport('TestCharacter', 'gbpg');
      tests.push({
        name: 'Create creature export',
        passed: exportConfig.id !== undefined && exportConfig.name === 'TestCharacter',
        duration: new Date() - startTime,
        details: { exportId: exportConfig.id, format: exportConfig.format }
      });

      // Test 3: Export as .gbpg
      const gbpkgData = exportIntegration.exportAsGbpkg(exportConfig);
      tests.push({
        name: 'Export as .gbpg',
        passed: gbpkgData.length > 0 && gbpkgData.includes('"format"'),
        duration: new Date() - startTime,
        details: { dataLength: gbpkgData.length }
      });

      // Test 4: Export as GLTF
      const gltfData = exportIntegration.exportAsGLTF(exportConfig);
      tests.push({
        name: 'Export as GLTF',
        passed: gltfData.length > 0 && gltfData.includes('"asset"'),
        duration: new Date() - startTime,
        details: { dataLength: gltfData.length }
      });

      // Test 5: Generate RenderWorld integration
      const renderWorldData = exportIntegration.generateRenderWorldIntegration(exportConfig);
      tests.push({
        name: 'Generate RenderWorld integration',
        passed: renderWorldData.type === 'creature',
        duration: new Date() - startTime,
        details: { integrationType: renderWorldData.type }
      });

      // Test 6: Generate CombatCore integration
      const combatCoreData = exportIntegration.generateCombatCoreIntegration(exportConfig);
      tests.push({
        name: 'Generate CombatCore integration',
        passed: combatCoreData.type === 'combat_creature',
        duration: new Date() - startTime,
        details: { integrationType: combatCoreData.type }
      });

      // Test 7: Generate DialogueSystem integration
      const dialogueData = exportIntegration.generateDialogueIntegration(exportConfig);
      tests.push({
        name: 'Generate DialogueSystem integration',
        passed: dialogueData.type === 'dialogue_creature',
        duration: new Date() - startTime,
        details: { integrationType: dialogueData.type }
      });

      // Test 8: Generate StartMenu integration
      const startMenuData = exportIntegration.generateStartMenuIntegration(exportConfig);
      tests.push({
        name: 'Generate StartMenu integration',
        passed: startMenuData.type === 'character_preset',
        duration: new Date() - startTime,
        details: { integrationType: startMenuData.type }
      });

      // Test 9: Generate SaveLoad integration
      const saveLoadData = exportIntegration.generateSaveLoadIntegration(exportConfig);
      tests.push({
        name: 'Generate SaveLoad integration',
        passed: saveLoadData.type === 'creature_save',
        duration: new Date() - startTime,
        details: { integrationType: saveLoadData.type }
      });

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      tests.push({
        name: 'ExportIntegration error',
        passed: false,
        error: String(error),
        duration: new Date() - startTime
      });
    }

    return {
      name: 'ExportIntegration Tests',
      tests,
      totalDuration: new Date() - startTime,
      passed: tests.filter((t: any) => t.passed).length,
      failed: tests.filter((t: any) => !t.passed).length
    };
  }

  /**
   * Test UIBuilder module
   */
  private async testUIBuilder(): Promise<TestSuite> {
    const startTime = Date.now();
    const tests: TestResult[] = [];

    try {
      // Setup skeleton state
      this.manager.createFullCharacter('TestCharacter');
      const skeletonState = this.manager.getSkeletonState();
      const uiBuilder = new UIBuilder(skeletonState);

      // Test 1: Initialize UI builder
      tests.push({
        name: 'Initialize UI builder',
        passed: uiBuilder !== null,
        duration: new Date() - startTime
      });

      // Test 2: Set UI mode
      uiBuilder.setMode('rig');
      const uiState = uiBuilder.getUIState();
      tests.push({
        name: 'Set UI mode',
        passed: uiState.mode === 'rig',
        duration: new Date() - startTime,
        details: { mode: uiState.mode }
      });

      // Test 3: Set UI tool
      uiBuilder.setTool('select');
      const updatedUIState = uiBuilder.getUIState();
      tests.push({
        name: 'Set UI tool',
        passed: updatedUIState.selectedTool === 'select',
        duration: new Date() - startTime,
        details: { tool: updatedUIState.selectedTool }
      });

      // Test 4: Update camera
      uiBuilder.updateCamera(
        { x: 0, y: 5, z: 10 },
        { x: 0, y: 0, z: 0 },
        75
      );
      const cameraState = uiBuilder.getUIState().viewport.camera;
      tests.push({
        name: 'Update camera',
        passed: cameraState.position.y === 5 && cameraState.fov === 75,
        duration: new Date() - startTime,
        details: { position: cameraState.position, fov: cameraState.fov }
      });

      // Test 5: Toggle grid
      uiBuilder.toggleGrid();
      const gridVisible = uiBuilder.getUIState().viewport.grid.visible;
      tests.push({
        name: 'Toggle grid',
        passed: gridVisible === false,
        duration: new Date() - startTime,
        details: { gridVisible }
      });

      // Test 6: Add panel
      uiBuilder.addPanel({
        type: 'properties',
        visible: true,
        position: { x: 100, y: 100 },
        size: { width: 200, height: 300 }
      });
      const panels = uiBuilder.getUIState().panels;
      tests.push({
        name: 'Add panel',
        passed: panels.length === 1,
        duration: new Date() - startTime,
        details: { panelCount: panels.length }
      });

      // Test 7: Handle UI action
      uiBuilder.handleAction({
        type: 'select',
        target: 'torso',
        data: {}
      });
      const selectedNode = uiBuilder.getSkeletonState().selectedNode;
      tests.push({
        name: 'Handle UI action',
        passed: selectedNode === 'torso',
        duration: new Date() - startTime,
        details: { selectedNode }
      });

      // Test 8: Export UI state
      const uiStateJson = uiBuilder.exportUIState();
      tests.push({
        name: 'Export UI state',
        passed: uiStateJson.length > 0 && uiStateJson.includes('"exportFormat"'),
        duration: new Date() - startTime,
        details: { jsonLength: uiStateJson.length }
      });

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      tests.push({
        name: 'UIBuilder error',
        passed: false,
        error: String(error),
        duration: new Date() - startTime
      });
    }

    return {
      name: 'UIBuilder Tests',
      tests,
      totalDuration: new Date() - startTime,
      passed: tests.filter((t: any) => t.passed).length,
      failed: tests.filter((t: any) => !t.passed).length
    };
  }

  /**
   * Test full workflow
   */
  private async testFullWorkflow(): Promise<TestSuite> {
    const startTime = Date.now();
    const tests: TestResult[] = [];

    try {
      // Test 1: Create full character
      this.manager.createFullCharacter('FullTestCharacter', {
        includeLimbs: true,
        includeSkin: true,
        includeFace: true,
        includeAnimations: true,
        characterType: 'humanoid'
      });

      const skeletonState = this.manager.getSkeletonState();
      tests.push({
        name: 'Create full character',
        passed: skeletonState.rig.nodes['torso'] !== undefined,
        duration: new Date() - startTime,
        details: { 
          rigNodes: Object.keys(skeletonState.rig.nodes).length,
          hasSkin: !!skeletonState.skin,
          hasFace: !!skeletonState.face,
          animationCount: Object.keys(skeletonState.animations).length
        }
      });

      // Test 2: Validate complete system
      const validation = this.manager.validate({});
      tests.push({
        name: 'Validate complete system',
        passed: validation.valid,
        duration: new Date() - startTime,
        details: { errors: validation.errors }
      });

      // Test 3: Export character
      const characterData = this.manager.exportCharacter('FullTestCharacter', 'gbpg');
      tests.push({
        name: 'Export character',
        passed: characterData.length > 0 && characterData.includes('"format"'),
        duration: new Date() - startTime,
        details: { dataLength: characterData.length }
      });

      // Test 4: Get system status
      const status = this.manager.getStatus();
      tests.push({
        name: 'Get system status',
        passed: Object.values(status).every(Boolean),
        duration: new Date() - startTime,
        details: status
      });

      // Test 5: Export system state
      const stateData = this.manager.exportState();
      tests.push({
        name: 'Export system state',
        passed: stateData.length > 0 && stateData.includes('"exportFormat"'),
        duration: new Date() - startTime,
        details: { dataLength: stateData.length }
      });

      // Test 6: Import system state
      this.manager.importState(stateData);
      const importedState = this.manager.getSkeletonState();
      tests.push({
        name: 'Import system state',
        passed: importedState.rig.id === skeletonState.rig.id,
        duration: new Date() - startTime,
        details: { importedRigId: importedState.rig.id }
      });

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      tests.push({
        name: 'Full workflow error',
        passed: false,
        error: String(error),
        duration: new Date() - startTime
      });
    }

    return {
      name: 'Full Workflow Tests',
      tests,
      totalDuration: new Date() - startTime,
      passed: tests.filter((t: any) => t.passed).length,
      failed: tests.filter((t: any) => !t.passed).length
    };
  }

  /**
   * Test MIFF integration
   */
  private async testMIFFIntegration(): Promise<TestSuite> {
    const startTime = Date.now();
    const tests: TestResult[] = [];

    try {
      // Create character for integration testing
      this.manager.createFullCharacter('MIFFTestCharacter');
      const skeletonState = this.manager.getSkeletonState();
      const exportIntegration = new ExportIntegration(skeletonState);
      const exportConfig = exportIntegration.createCreatureExport('MIFFTestCharacter');

      // Test 1: RenderWorldPure integration
      const renderWorldData = exportIntegration.generateRenderWorldIntegration(exportConfig);
      tests.push({
        name: 'RenderWorldPure integration',
        passed: renderWorldData.components?.skeleton !== undefined,
        duration: new Date() - startTime,
        details: { hasSkeleton: !!renderWorldData.components?.skeleton }
      });

      // Test 2: CombatCorePure integration
      const combatCoreData = exportIntegration.generateCombatCoreIntegration(exportConfig);
      tests.push({
        name: 'CombatCorePure integration',
        passed: combatCoreData.combat?.stats !== undefined,
        duration: new Date() - startTime,
        details: { hasStats: !!combatCoreData.combat?.stats }
      });

      // Test 3: DialogueSystemPure integration
      const dialogueData = exportIntegration.generateDialogueIntegration(exportConfig);
      tests.push({
        name: 'DialogueSystemPure integration',
        passed: dialogueData.dialogue?.expressions !== undefined,
        duration: new Date() - startTime,
        details: { hasExpressions: !!dialogueData.dialogue?.expressions }
      });

      // Test 4: StartMenuPure integration
      const startMenuData = exportIntegration.generateStartMenuIntegration(exportConfig);
      tests.push({
        name: 'StartMenuPure integration',
        passed: startMenuData.preview !== undefined,
        duration: new Date() - startTime,
        details: { hasPreview: !!startMenuData.preview }
      });

      // Test 5: SaveLoadModule integration
      const saveLoadData = exportIntegration.generateSaveLoadIntegration(exportConfig);
      tests.push({
        name: 'SaveLoadModule integration',
        passed: saveLoadData.saveData !== undefined,
        duration: new Date() - startTime,
        details: { hasSaveData: !!saveLoadData.saveData }
      });

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      tests.push({
        name: 'MIFF integration error',
        passed: false,
        error: String(error),
        duration: new Date() - startTime
      });
    }

    return {
      name: 'MIFF Integration Tests',
      tests,
      totalDuration: new Date() - startTime,
      passed: tests.filter((t: any) => t.passed).length,
      failed: tests.filter((t: any) => !t.passed).length
    };
  }

  /**
   * Test export formats
   */
  private async testExportFormats(): Promise<TestSuite> {
    const startTime = Date.now();
    const tests: TestResult[] = [];

    try {
      this.manager.createFullCharacter('ExportTestCharacter');
      const exportIntegration = this.manager.getExportIntegration();
      const exportConfig = exportIntegration!.createCreatureExport('ExportTestCharacter');

      // Test 1: .gbpg format
      const gbpkgData = exportIntegration!.exportAsGbpkg(exportConfig);
      tests.push({
        name: '.gbpg format export',
        passed: gbpkgData.includes('"format": "gbpkg-v1"'),
        duration: new Date() - startTime,
        details: { format: 'gbpkg-v1' }
      });

      // Test 2: GLTF format
      const gltfData = exportIntegration!.exportAsGLTF(exportConfig);
      tests.push({
        name: 'GLTF format export',
        passed: gltfData.includes('"asset"') && gltfData.includes('"version": "2.0"'),
        duration: new Date() - startTime,
        details: { format: 'GLTF 2.0' }
      });

      // Test 3: Rig JSON export
      const rigJson = this.manager.getRigBuilder().exportRigJson();
      tests.push({
        name: 'Rig JSON export',
        passed: rigJson.includes('"exportFormat": "miff-rig-v1"'),
        duration: new Date() - startTime,
        details: { format: 'miff-rig-v1' }
      });

      // Test 4: Skin JSON export
      const skinJson = this.manager.getSkinMeshGenerator()?.exportSkinJson();
      tests.push({
        name: 'Skin JSON export',
        passed: skinJson?.includes('"exportFormat": "miff-skin-v1"') || false,
        duration: new Date() - startTime,
        details: { format: 'miff-skin-v1' }
      });

      // Test 5: Face JSON export
      const faceJson = this.manager.getFacialDetailBuilder()?.exportFaceJson();
      tests.push({
        name: 'Face JSON export',
        passed: faceJson?.includes('"exportFormat": "miff-face-v1"') || false,
        duration: new Date() - startTime,
        details: { format: 'miff-face-v1' }
      });

      // Test 6: Animation JSON export
      const animJson = this.manager.getAnimationSequencer()?.exportAnimationsJson();
      tests.push({
        name: 'Animation JSON export',
        passed: animJson?.includes('"exportFormat": "miff-anim-v1"') || false,
        duration: new Date() - startTime,
        details: { format: 'miff-anim-v1' }
      });

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      tests.push({
        name: 'Export formats error',
        passed: false,
        error: String(error),
        duration: new Date() - startTime
      });
    }

    return {
      name: 'Export Formats Tests',
      tests,
      totalDuration: new Date() - startTime,
      passed: tests.filter((t: any) => t.passed).length,
      failed: tests.filter((t: any) => !t.passed).length
    };
  }

  /**
   * Test performance
   */
  private async testPerformance(): Promise<TestSuite> {
    const startTime = Date.now();
    const tests: TestResult[] = [];

    try {
      // Test 1: Character creation performance
      const createStart = Date.now();
      this.manager.createFullCharacter('PerfTestCharacter');
      const createTime = Date.now() - createStart;
      tests.push({
        name: 'Character creation performance',
        passed: createTime < 1000, // Should complete in under 1 second
        duration: createTime,
        details: { createTimeMs: createTime }
      });

      // Test 2: Export performance
      const exportStart = Date.now();
      const characterData = this.manager.exportCharacter('PerfTestCharacter', 'gbpg');
      const exportTime = Date.now() - exportStart;
      tests.push({
        name: 'Export performance',
        passed: exportTime < 500, // Should complete in under 500ms
        duration: exportTime,
        details: { exportTimeMs: exportTime, dataSize: characterData.length }
      });

      // Test 3: Validation performance
      const validationStart = Date.now();
      const validation = this.manager.validate({});
      const validationTime = Date.now() - validationStart;
      tests.push({
        name: 'Validation performance',
        passed: validationTime < 100, // Should complete in under 100ms
        duration: validationTime,
        details: { validationTimeMs: validationTime }
      });

      // Test 4: UI state update performance
      const uiBuilder = this.manager.getUIBuilder();
      if (uiBuilder) {
        const uiStart = Date.now();
        for (let i = 0; i < 100; i++) {
          uiBuilder.handleAction({
            type: 'select',
            target: 'torso',
            data: {}
          });
        }
        const uiTime = Date.now() - uiStart;
        tests.push({
          name: 'UI state update performance',
          passed: uiTime < 200, // Should complete 100 updates in under 200ms
          duration: uiTime,
          details: { uiTimeMs: uiTime, updatesPerSecond: 100000 / uiTime }
        });
      }

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      tests.push({
        name: 'Performance test error',
        passed: false,
        error: String(error),
        duration: new Date() - startTime
      });
    }

    return {
      name: 'Performance Tests',
      tests,
      totalDuration: new Date() - startTime,
      passed: tests.filter((t: any) => t.passed).length,
      failed: tests.filter((t: any) => !t.passed).length
    };
  }

  /**
   * Test error handling
   */
  private async testErrorHandling(): Promise<TestSuite> {
    const startTime = Date.now();
    const tests: TestResult[] = [];

    try {
      // Test 1: Invalid rig node access
      const rigBuilder = new RigBuilder();
      try {
        rigBuilder.getNode('nonexistent');
        tests.push({
          name: 'Invalid rig node access',
          passed: false,
          duration: new Date() - startTime,
          details: { error: 'Should have thrown error' }
        });
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        tests.push({
          name: 'Invalid rig node access',
          passed: true,
          duration: new Date() - startTime,
          details: { error: String(error) }
        });
      }

      // Test 2: Invalid limb attachment
      try {
        const limbAttachment = new LimbAttachment(rigBuilder.getConfig());
        limbAttachment.addLimb('test', 'arm', 'nonexistent', []);
        tests.push({
          name: 'Invalid limb attachment',
          passed: false,
          duration: new Date() - startTime,
          details: { error: 'Should have thrown error' }
        });
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        tests.push({
          name: 'Invalid limb attachment',
          passed: true,
          duration: new Date() - startTime,
          details: { error: String(error) }
        });
      }

      // Test 3: Invalid morph target application
      try {
        const skinGenerator = new SkinMeshGenerator(rigBuilder.getConfig());
        skinGenerator.applyMorphTarget('nonexistent', 1.0);
        tests.push({
          name: 'Invalid morph target application',
          passed: false,
          duration: new Date() - startTime,
          details: { error: 'Should have thrown error' }
        });
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        tests.push({
          name: 'Invalid morph target application',
          passed: true,
          duration: new Date() - startTime,
          details: { error: String(error) }
        });
      }

      // Test 4: Invalid animation keyframe
      try {
        const animSequencer = new AnimationSequencer(rigBuilder.getConfig());
        animSequencer.addKeyframe('nonexistent', {
          nodeId: 'nonexistent',
          transform: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            scale: { x: 1, y: 1, z: 1 }
          },
          interpolation: 'linear'
        }, 0);
        tests.push({
          name: 'Invalid animation keyframe',
          passed: false,
          duration: new Date() - startTime,
          details: { error: 'Should have thrown error' }
        });
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        tests.push({
          name: 'Invalid animation keyframe',
          passed: true,
          duration: new Date() - startTime,
          details: { error: String(error) }
        });
      }

      // Test 5: Invalid export format
      try {
        this.manager.exportCharacter('TestCharacter', 'invalid' as any);
        tests.push({
          name: 'Invalid export format',
          passed: false,
          duration: new Date() - startTime,
          details: { error: 'Should have thrown error' }
        });
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        tests.push({
          name: 'Invalid export format',
          passed: true,
          duration: new Date() - startTime,
          details: { error: String(error) }
        });
      }

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      tests.push({
        name: 'Error handling test error',
        passed: false,
        error: String(error),
        duration: new Date() - startTime
      });
    }

    return {
      name: 'Error Handling Tests',
      tests,
      totalDuration: new Date() - startTime,
      passed: tests.filter((t: any) => t.passed).length,
      failed: tests.filter((t: any) => !t.passed).length
    };
  }

  /**
   * Generate test report
   */
  generateReport(suites: TestSuite[]): string {
    const totalTests = suites.reduce((sum, suite) => sum + suite.tests.length, 0);
    const totalPassed = suites.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = suites.reduce((sum, suite) => sum + suite.failed, 0);
    const totalDuration = suites.reduce((sum, suite) => sum + suite.totalDuration, 0);

    let report = `# SkeletonAnimatorPure Integration Test Report\n\n`;
    report += `## Summary\n`;
    report += `- Total Tests: ${totalTests}\n`;
    report += `- Passed: ${totalPassed}\n`;
    report += `- Failed: ${totalFailed}\n`;
    report += `- Success Rate: ${((totalPassed / totalTests) * 100).toFixed(2)}%\n`;
    report += `- Total Duration: ${totalDuration}ms\n\n`;

    report += `## Test Suites\n\n`;
    suites.forEach((suite: any) => {
      report += `### ${suite.name}\n`;
      report += `- Tests: ${suite.tests.length}\n`;
      report += `- Passed: ${suite.passed}\n`;
      report += `- Failed: ${suite.failed}\n`;
      report += `- Duration: ${suite.totalDuration}ms\n\n`;

      suite.tests.forEach((test: any) => {
        const status = test.passed ? '✅' : '❌';
        report += `- ${status} ${test.name} (${test.duration}ms)\n`;
        if (test.error) {
          report += `  - Error: ${test.error}\n`;
        }
        if (test.details) {
          report += `  - Details: ${JSON.stringify(test.details)}\n`;
        }
      });
      report += `\n`;
    });

    return report;
  }
}