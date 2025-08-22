// BridgeSchemaPure - Unified renderData schema for all engine bridges
// Schema Version: v1

export type RenderDataType = 'sprite' | 'text' | 'sound' | 'animation' | 'node' | 'component' | 'resource' | 'scene' | 'input';

export interface Position3D {
  x: number;
  y: number;
  z?: number;
}

export interface EngineHints {
  unity?: {
    gameObject?: string;
    component?: string;
    prefab?: string;
    useECS?: boolean;
  };
  web?: {
    element?: string;
    canvas?: string;
    dom?: string;
    useWebGL?: boolean;
  };
  godot?: {
    node?: string;
    script?: string;
    scene?: string;
    language?: 'gdscript' | 'csharp';
  };
}

export interface RenderData {
  id: string;
  type: RenderDataType;
  name?: string;
  position?: Position3D;
  scale?: { x: number; y: number; z?: number };
  rotation?: { x: number; y: number; z?: number };
  asset?: string; // Path or ID to the asset
  props?: { [key: string]: any }; // Generic properties
  engineHints?: EngineHints; // Engine-specific hints
  children?: RenderData[]; // Nested render data
  signals?: RenderSignal[]; // Event signals/connections
  metadata?: { [key: string]: any }; // Additional metadata
}

export interface RenderSignal {
  name: string;
  parameters?: string[];
  connectedTo?: string[];
  engine?: 'unity' | 'web' | 'godot';
}

export interface RenderPayload {
  op: string;
  status: 'ok' | 'error';
  renderData: RenderData[];
  issues?: string[];
  metadata?: {
    schemaVersion: string;
    engine: string;
    timestamp: string;
    module: string;
  };
}

export interface BridgeConfig {
  engine: 'unity' | 'web' | 'godot';
  version: string;
  language?: string;
  useSignals?: boolean;
  useAnimations?: boolean;
  assetPath?: string;
  scriptPath?: string;
  scenePath?: string;
  resourcePath?: string;
}

// Utility functions for schema validation and conversion
export class BridgeSchemaValidator {
  static validateRenderData(data: RenderData): string[] {
    const issues: string[] = [];

    // Required fields
    if (!data.id) {
      issues.push('RenderData must have an id');
    }
    if (!data.type) {
      issues.push('RenderData must have a type');
    }

    // Type validation
    if (data.type && !['sprite', 'text', 'sound', 'animation', 'node', 'component', 'resource', 'scene', 'input'].includes(data.type)) {
      issues.push(`Invalid render type: ${data.type}`);
    }

    // Position validation
    if (data.position) {
      if (typeof data.position.x !== 'number' || typeof data.position.y !== 'number') {
        issues.push('Position x and y must be numbers');
      }
      if (data.position.z !== undefined && typeof data.position.z !== 'number') {
        issues.push('Position z must be a number if provided');
      }
    }

    // Scale validation
    if (data.scale) {
      if (typeof data.scale.x !== 'number' || typeof data.scale.y !== 'number') {
        issues.push('Scale x and y must be numbers');
      }
      if (data.scale.z !== undefined && typeof data.scale.z !== 'number') {
        issues.push('Scale z must be a number if provided');
      }
    }

    // Rotation validation
    if (data.rotation) {
      if (typeof data.rotation.x !== 'number' || typeof data.rotation.y !== 'number' || typeof data.rotation.z !== 'number') {
        issues.push('Rotation x, y, and z must be numbers');
      }
    }

    // Children validation
    if (data.children) {
      if (!Array.isArray(data.children)) {
        issues.push('Children must be an array');
      } else {
        data.children.forEach((child, index) => {
          const childIssues = this.validateRenderData(child);
          childIssues.forEach(issue => issues.push(`Child ${index}: ${issue}`));
        });
      }
    }

    // Signals validation
    if (data.signals) {
      if (!Array.isArray(data.signals)) {
        issues.push('Signals must be an array');
      } else {
        data.signals.forEach((signal, index) => {
          if (!signal.name) {
            issues.push(`Signal ${index}: must have a name`);
          }
          if (signal.parameters && !Array.isArray(signal.parameters)) {
            issues.push(`Signal ${index}: parameters must be an array`);
          }
          if (signal.connectedTo && !Array.isArray(signal.connectedTo)) {
            issues.push(`Signal ${index}: connectedTo must be an array`);
          }
        });
      }
    }

    return issues;
  }

  static validateRenderPayload(payload: RenderPayload): string[] {
    const issues: string[] = [];

    // Required fields
    if (!payload.op) {
      issues.push('RenderPayload must have an op');
    }
    if (!payload.status) {
      issues.push('RenderPayload must have a status');
    }
    if (!Array.isArray(payload.renderData)) {
      issues.push('RenderPayload renderData must be an array');
    }

    // Status validation
    if (payload.status && !['ok', 'error'].includes(payload.status)) {
      issues.push('Status must be "ok" or "error"');
    }

    // RenderData validation
    if (payload.renderData) {
      payload.renderData.forEach((data, index) => {
        const dataIssues = this.validateRenderData(data);
        dataIssues.forEach(issue => issues.push(`RenderData ${index}: ${issue}`));
      });
    }

    // Issues validation
    if (payload.issues && !Array.isArray(payload.issues)) {
      issues.push('Issues must be an array');
    }

    return issues;
  }

  static convertFromUnity(unityData: any): RenderData {
    return {
      id: unityData.id || unityData.gameObject,
      type: this.mapUnityType(unityData),
      name: unityData.name,
      position: unityData.transform?.position,
      scale: unityData.transform?.scale,
      rotation: unityData.transform?.rotation,
      asset: unityData.prefab,
      props: unityData.components,
      engineHints: {
        unity: {
          gameObject: unityData.gameObject,
          component: unityData.componentType,
          prefab: unityData.prefab,
          useECS: unityData.useECS
        }
      },
      children: unityData.children?.map((child: any) => this.convertFromUnity(child)),
      signals: unityData.signals?.map((signal: any) => ({
        name: signal.name,
        parameters: signal.parameters,
        connectedTo: signal.connectedTo,
        engine: 'unity'
      }))
    };
  }

  static convertFromWeb(webData: any): RenderData {
    return {
      id: webData.id,
      type: this.mapWebType(webData),
      name: webData.name,
      position: { x: webData.x, y: webData.y },
      scale: webData.width && webData.height ? { x: webData.width, y: webData.height } : undefined,
      asset: webData.texture || webData.src,
      props: webData.properties,
      engineHints: {
        web: {
          element: webData.element,
          canvas: webData.canvas,
          dom: webData.dom,
          useWebGL: webData.useWebGL
        }
      },
      children: webData.children?.map((child: any) => this.convertFromWeb(child)),
      signals: webData.events?.map((event: any) => ({
        name: event.name,
        parameters: event.parameters,
        connectedTo: event.handlers,
        engine: 'web'
      }))
    };
  }

  static convertFromGodot(godotData: any): RenderData {
    return {
      id: godotData.id,
      type: this.mapGodotType(godotData),
      name: godotData.name,
      position: godotData.position,
      scale: godotData.scale,
      rotation: godotData.rotation ? { x: 0, y: 0, z: godotData.rotation } : undefined,
      asset: godotData.texture || godotData.script,
      props: godotData.properties,
      engineHints: {
        godot: {
          node: godotData.type,
          script: godotData.script,
          scene: godotData.scene,
          language: godotData.language
        }
      },
      children: godotData.children?.map((child: any) => this.convertFromGodot(child)),
      signals: godotData.signals?.map((signal: any) => ({
        name: signal.name,
        parameters: signal.parameters,
        connectedTo: signal.connectedTo,
        engine: 'godot'
      }))
    };
  }

  private static mapUnityType(unityData: any): RenderDataType {
    if (unityData.componentType === 'Transform') return 'node';
    if (unityData.componentType === 'SpriteRenderer') return 'sprite';
    if (unityData.componentType === 'TextMesh') return 'text';
    if (unityData.componentType === 'AudioSource') return 'sound';
    if (unityData.componentType === 'Animator') return 'animation';
    return 'component';
  }

  private static mapWebType(webData: any): RenderDataType {
    if (webData.type === 'sprite') return 'sprite';
    if (webData.type === 'text') return 'text';
    if (webData.type === 'audio') return 'sound';
    if (webData.type === 'animation') return 'animation';
    if (webData.type === 'container' || webData.type === 'group') return 'node';
    return 'component';
  }

  private static mapGodotType(godotData: any): RenderDataType {
    if (godotData.type === 'Sprite') return 'sprite';
    if (godotData.type === 'Label') return 'text';
    if (godotData.type === 'AudioStreamPlayer') return 'sound';
    if (godotData.type === 'AnimationPlayer') return 'animation';
    if (godotData.type === 'Node2D' || godotData.type === 'Control') return 'node';
    return 'component';
  }

  static convertToUnity(renderData: RenderData): any {
    return {
      id: renderData.id,
      gameObject: renderData.name || renderData.id,
      transform: {
        position: renderData.position,
        scale: renderData.scale,
        rotation: renderData.rotation
      },
      componentType: this.mapToUnityComponent(renderData.type),
      prefab: renderData.asset,
      components: renderData.props,
      children: renderData.children?.map(child => this.convertToUnity(child)),
      signals: renderData.signals?.filter(s => s.engine === 'unity').map(signal => ({
        name: signal.name,
        parameters: signal.parameters,
        connectedTo: signal.connectedTo
      }))
    };
  }

  static convertToWeb(renderData: RenderData): any {
    return {
      id: renderData.id,
      type: this.mapToWebType(renderData.type),
      name: renderData.name,
      x: renderData.position?.x,
      y: renderData.position?.y,
      width: renderData.scale?.x,
      height: renderData.scale?.y,
      texture: renderData.asset,
      properties: renderData.props,
      children: renderData.children?.map(child => this.convertToWeb(child)),
      events: renderData.signals?.filter(s => s.engine === 'web').map(signal => ({
        name: signal.name,
        parameters: signal.parameters,
        handlers: signal.connectedTo
      }))
    };
  }

  static convertToGodot(renderData: RenderData): any {
    return {
      id: renderData.id,
      type: this.mapToGodotType(renderData.type),
      name: renderData.name,
      position: renderData.position,
      scale: renderData.scale,
      rotation: renderData.rotation?.z,
      texture: renderData.asset,
      properties: renderData.props,
      children: renderData.children?.map(child => this.convertToGodot(child)),
      signals: renderData.signals?.filter(s => s.engine === 'godot').map(signal => ({
        name: signal.name,
        parameters: signal.parameters,
        connectedTo: signal.connectedTo
      }))
    };
  }

  private static mapToUnityComponent(type: RenderDataType): string {
    switch (type) {
      case 'sprite': return 'SpriteRenderer';
      case 'text': return 'TextMesh';
      case 'sound': return 'AudioSource';
      case 'animation': return 'Animator';
      case 'node': return 'Transform';
      default: return 'MonoBehaviour';
    }
  }

  private static mapToWebType(type: RenderDataType): string {
    switch (type) {
      case 'sprite': return 'sprite';
      case 'text': return 'text';
      case 'sound': return 'audio';
      case 'animation': return 'animation';
      case 'node': return 'container';
      default: return 'element';
    }
  }

  private static mapToGodotType(type: RenderDataType): string {
    switch (type) {
      case 'sprite': return 'Sprite';
      case 'text': return 'Label';
      case 'sound': return 'AudioStreamPlayer';
      case 'animation': return 'AnimationPlayer';
      case 'node': return 'Node2D';
      default: return 'Node';
    }
  }
}