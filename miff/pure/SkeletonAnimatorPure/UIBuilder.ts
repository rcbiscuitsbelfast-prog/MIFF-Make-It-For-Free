/**
 * UI Builder Interface
 * 
 * Visual character customization with drag, resize, rotate, preview functionality
 * for all phases of the skeleton animator system
 */

import { 
  SkeletonState, 
  UIAction, 
  UIState, 
  ViewportState, 
  PanelState,
  RigNode,
  FaceFeature,
  Vec3,
  Quaternion,
  Transform
} from './types';

export class UIBuilder {
  private skeletonState: SkeletonState;
  private uiState: UIState;
  private actionHistory: UIAction[] = [];
  private nextActionId: number = 0;

  constructor(skeletonState: SkeletonState) {
    this.skeletonState = skeletonState;
    this.uiState = {
      mode: 'rig',
      selectedTool: 'select',
      viewport: {
        camera: {
          position: { x: 0, y: 2, z: 5 },
          target: { x: 0, y: 0, z: 0 },
          fov: 60
        },
        grid: {
          visible: true,
          size: 1
        },
        gizmos: {
          visible: true,
          size: 1
        }
      },
      panels: [
        {
          id: 'hierarchy',
          type: 'hierarchy',
          visible: true,
          position: { x: 10, y: 10 },
          size: { width: 250, height: 300 }
        },
        {
          id: 'properties',
          type: 'properties',
          visible: true,
          position: { x: 270, y: 10 },
          size: { width: 300, height: 400 }
        }
      ]
    };
  }

  /**
   * Handle UI action
   */
  handleAction(action: Omit<UIAction, 'id' | 'timestamp'>): UIBuilder {
    const fullAction: UIAction = {
      ...action,
      id: this.generateActionId(),
      timestamp: Date.now()
    };

    this.actionHistory.push(fullAction);
    this.executeAction(fullAction);

    return this;
  }

  /**
   * Execute UI action
   */
  private executeAction(action: UIAction): void {
    switch (action.type) {
      case 'create':
        this.handleCreateAction(action);
        break;
      case 'update':
        this.handleUpdateAction(action);
        break;
      case 'delete':
        this.handleDeleteAction(action);
        break;
      case 'select':
        this.handleSelectAction(action);
        break;
      case 'drag':
        this.handleDragAction(action);
        break;
      case 'resize':
        this.handleResizeAction(action);
        break;
      case 'rotate':
        this.handleRotateAction(action);
        break;
    }
  }

  /**
   * Handle create action
   */
  private handleCreateAction(action: UIAction): void {
    const { target, data } = action;

    switch (this.uiState.mode) {
      case 'rig':
        this.createRigNode(data);
        break;
      case 'limb':
        this.createLimbNode(data);
        break;
      case 'face':
        this.createFaceFeature(data);
        break;
      case 'skin':
        this.createMorphTarget(data);
        break;
      case 'animation':
        this.createKeyframe(data);
        break;
    }
  }

  /**
   * Handle update action
   */
  private handleUpdateAction(action: UIAction): void {
    const { target, data } = action;

    switch (this.uiState.mode) {
      case 'rig':
        this.updateRigNode(target, data);
        break;
      case 'limb':
        this.updateLimbNode(target, data);
        break;
      case 'face':
        this.updateFaceFeature(target, data);
        break;
      case 'skin':
        this.updateMorphTarget(target, data);
        break;
      case 'animation':
        this.updateKeyframe(target, data);
        break;
    }
  }

  /**
   * Handle delete action
   */
  private handleDeleteAction(action: UIAction): void {
    const { target } = action;

    switch (this.uiState.mode) {
      case 'rig':
        this.deleteRigNode(target);
        break;
      case 'limb':
        this.deleteLimbNode(target);
        break;
      case 'face':
        this.deleteFaceFeature(target);
        break;
      case 'skin':
        this.deleteMorphTarget(target);
        break;
      case 'animation':
        this.deleteKeyframe(target);
        break;
    }
  }

  /**
   * Handle select action
   */
  private handleSelectAction(action: UIAction): void {
    const { target } = action;
    this.skeletonState.selectedNode = target;
  }

  /**
   * Handle drag action
   */
  private handleDragAction(action: UIAction): void {
    const { target, data } = action;
    const { deltaPosition } = data;

    if (this.skeletonState.selectedNode) {
      this.updateNodePosition(this.skeletonState.selectedNode, deltaPosition);
    }
  }

  /**
   * Handle resize action
   */
  private handleResizeAction(action: UIAction): void {
    const { target, data } = action;
    const { deltaScale } = data;

    if (this.skeletonState.selectedNode) {
      this.updateNodeScale(this.skeletonState.selectedNode, deltaScale);
    }
  }

  /**
   * Handle rotate action
   */
  private handleRotateAction(action: UIAction): void {
    const { target, data } = action;
    const { deltaRotation } = data;

    if (this.skeletonState.selectedNode) {
      this.updateNodeRotation(this.skeletonState.selectedNode, deltaRotation);
    }
  }

  /**
   * Create rig node
   */
  private createRigNode(data): void {
    // This would integrate with RigBuilder
    console.log('Creating rig node:', data);
  }

  /**
   * Create limb node
   */
  private createLimbNode(data): void {
    // This would integrate with LimbAttachment
    console.log('Creating limb node:', data);
  }

  /**
   * Create face feature
   */
  private createFaceFeature(data): void {
    // This would integrate with FacialDetailBuilder
    console.log('Creating face feature:', data);
  }

  /**
   * Create morph target
   */
  private createMorphTarget(data): void {
    // This would integrate with SkinMeshGenerator
    console.log('Creating morph target:', data);
  }

  /**
   * Create keyframe
   */
  private createKeyframe(data): void {
    // This would integrate with AnimationSequencer
    console.log('Creating keyframe:', data);
  }

  /**
   * Update rig node
   */
  private updateRigNode(nodeId: string, data: any): void {
    const node = this.skeletonState.rig.nodes[nodeId!];
    if (node) {
      if (data.transform) {
        node.transform = { ...node.transform, ...data.transform };
      }
      if (data.metadata) {
        node.metadata = { ...node.metadata, ...data.metadata };
      }
    }
  }

  /**
   * Update limb node
   */
  private updateLimbNode(nodeId: string, data: any): void {
    // This would integrate with LimbAttachment
    console.log('Updating limb node:', nodeId, data);
  }

  /**
   * Update face feature
   */
  private updateFaceFeature(featureId: string, data: any): void {
    if (this.skeletonState.face) {
      const feature = this.skeletonState.face.features.find(f => f.id === featureId);
      if (feature) {
        if (data.position) feature.position = { ...feature.position, ...data.position };
        if (data.scale) feature.scale = { ...feature.scale, ...data.scale };
        if (data.rotation) feature.rotation = { ...feature.rotation, ...data.rotation };
      }
    }
  }

  /**
   * Update morph target
   */
  private updateMorphTarget(morphTargetId: string, data: any): void {
    if (this.skeletonState.skin) {
      const morphTarget = this.skeletonState.skin.morphTargets.find(mt => mt.id === morphTargetId);
      if (morphTarget) {
        if (data.weight !== undefined) morphTarget.weight = data.weight;
        if (data.vertices) morphTarget.vertices = data.vertices;
      }
    }
  }

  /**
   * Update keyframe
   */
  private updateKeyframe(keyframeId: string, data: any): void {
    // This would integrate with AnimationSequencer
    console.log('Updating keyframe:', keyframeId, data);
  }

  /**
   * Delete rig node
   */
  private deleteRigNode(nodeId: string): void {
    delete this.skeletonState.rig.nodes[nodeId!];
    if (this.skeletonState.selectedNode === nodeId) {
      this.skeletonState.selectedNode = undefined;
    }
  }

  /**
   * Delete limb node
   */
  private deleteLimbNode(nodeId: string): void {
    // This would integrate with LimbAttachment
    console.log('Deleting limb node:', nodeId);
  }

  /**
   * Delete face feature
   */
  private deleteFaceFeature(featureId: string): void {
    if (this.skeletonState.face) {
      this.skeletonState.face.features = this.skeletonState.face.features.filter((f: any) => f.id !== featureId);
    }
  }

  /**
   * Delete morph target
   */
  private deleteMorphTarget(morphTargetId: string): void {
    if (this.skeletonState.skin) {
      this.skeletonState.skin.morphTargets = this.skeletonState.skin.morphTargets.filter((mt: any) => mt.id !== morphTargetId);
    }
  }

  /**
   * Delete keyframe
   */
  private deleteKeyframe(keyframeId: string): void {
    // This would integrate with AnimationSequencer
    console.log('Deleting keyframe:', keyframeId);
  }

  /**
   * Update node position
   */
  private updateNodePosition(nodeId: string, deltaPosition: Vec3): void {
    const node = this.skeletonState.rig.nodes[nodeId!];
    if (node) {
      node.transform.position = {
        x: node.transform.position.x + deltaPosition.x,
        y: node.transform.position.y + deltaPosition.y,
        z: node.transform.position.z + deltaPosition.z
      };
    }
  }

  /**
   * Update node scale
   */
  private updateNodeScale(nodeId: string, deltaScale: Vec3): void {
    const node = this.skeletonState.rig.nodes[nodeId!];
    if (node) {
      node.transform.scale = {
        x: node.transform.scale.x * deltaScale.x,
        y: node.transform.scale.y * deltaScale.y,
        z: node.transform.scale.z * deltaScale.z
      };
    }
  }

  /**
   * Update node rotation
   */
  private updateNodeRotation(nodeId: string, deltaRotation: Quaternion): void {
    const node = this.skeletonState.rig.nodes[nodeId!];
    if (node) {
      // Quaternion multiplication (simplified)
      const q1 = node.transform.rotation;
      const q2 = deltaRotation;
      
      node.transform.rotation = {
        x: q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y,
        y: q1.w * q2.y - q1.x * q2.z + q1.y * q2.w + q1.z * q2.x,
        z: q1.w * q2.z + q1.x * q2.y - q1.y * q2.x + q1.z * q2.w,
        w: q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z
      };
    }
  }

  /**
   * Set UI mode
   */
  setMode(mode: UIState['mode']): UIBuilder {
    this.uiState.mode = mode;
    return this;
  }

  /**
   * Set selected tool
   */
  setTool(tool: string): UIBuilder {
    this.uiState.selectedTool = tool;
    return this;
  }

  /**
   * Update viewport camera
   */
  updateCamera(position: Vec3, target: Vec3, fov?: number): UIBuilder {
    this.uiState.viewport.camera.position = { ...position };
    this.uiState.viewport.camera.target = { ...target };
    if (fov !== undefined) {
      this.uiState.viewport.camera.fov = fov;
    }
    return this;
  }

  /**
   * Toggle grid visibility
   */
  toggleGrid(): UIBuilder {
    this.uiState.viewport.grid.visible = !this.uiState.viewport.grid.visible;
    return this;
  }

  /**
   * Toggle gizmos visibility
   */
  toggleGizmos(): UIBuilder {
    this.uiState.viewport.gizmos.visible = !this.uiState.viewport.gizmos.visible;
    return this;
  }

  /**
   * Add panel
   */
  addPanel(panel: Omit<PanelState, 'id'>): UIBuilder {
    const newPanel: PanelState = {
      ...panel,
      id: this.generatePanelId()
    };
    this.uiState.panels.push(newPanel);
    return this;
  }

  /**
   * Remove panel
   */
  removePanel(panelId: string): UIBuilder {
    this.uiState.panels = this.uiState.panels.filter((p: any) => p.id !== panelId);
    return this;
  }

  /**
   * Update panel position
   */
  updatePanelPosition(panelId: string, position: { x: number; y: number }): UIBuilder {
    const panel = this.uiState.panels.find(p => p.id === panelId);
    if (panel) {
      panel.position = { ...position };
    }
    return this;
  }

  /**
   * Update panel size
   */
  updatePanelSize(panelId: string, size: { width: number; height: number }): UIBuilder {
    const panel = this.uiState.panels.find(p => p.id === panelId);
    if (panel) {
      panel.size = { ...size };
    }
    return this;
  }

  /**
   * Toggle panel visibility
   */
  togglePanel(panelId: string): UIBuilder {
    const panel = this.uiState.panels.find(p => p.id === panelId);
    if (panel) {
      panel.visible = !panel.visible;
    }
    return this;
  }

  /**
   * Undo last action
   */
  undo(): UIBuilder {
    if (this.actionHistory.length > 0) {
      const lastAction = this.actionHistory.pop()!;
      this.reverseAction(lastAction);
    }
    return this;
  }

  /**
   * Reverse action (for undo)
   */
  private reverseAction(action: UIAction): void {
    // This would implement the reverse of each action
    console.log('Reversing action:', action);
  }

  /**
   * Get UI state
   */
  getUIState(): UIState {
    return { ...this.uiState };
  }

  /**
   * Get skeleton state
   */
  getSkeletonState(): SkeletonState {
    return { ...this.skeletonState };
  }

  /**
   * Get action history
   */
  getActionHistory(): UIAction[] {
    return [...this.actionHistory];
  }

  /**
   * Clear action history
   */
  clearHistory(): UIBuilder {
    this.actionHistory = [];
    return this;
  }

  /**
   * Export UI state
   */
  exportUIState(): string {
    const exportData = {
      uiState: this.uiState,
      skeletonState: this.skeletonState,
      actionHistory: this.actionHistory,
      exportFormat: 'miff-ui-v1',
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import UI state
   */
  importUIState(json: string): UIBuilder {
    const importData = JSON.parse(json);
    this.uiState = importData.uiState;
    this.skeletonState = importData.skeletonState;
    this.actionHistory = importData.actionHistory || [];
    return this;
  }

  private generateActionId(): string {
    return `action_${this.nextActionId++}_${Date.now()}`;
  }

  private generatePanelId(): string {
    return `panel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}