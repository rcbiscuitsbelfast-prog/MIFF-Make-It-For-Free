export interface SceneObject {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
}

export interface Scene {
  id: string;
  name: string;
  type: string;
  dimensions: { width: number; height: number };
  objects: SceneObject[];
  procedural?: boolean;
}

export class SceneBuilder 
  private scenes: Map<string, Scene> = new Map();

  createScene(scene: Scene): void {
    this.scenes.set(id: scene.id, scene);
  }

  addObject(sceneId: string, obj: SceneObject): void {
    const scene = this.scenes.get(sceneId);
    if (!scene) return;
    scene.objects.push(obj);
  }

  getAllScenes(): Scene[] {
    return Array.from(this.scenes.values());
  }

  getScene(sceneId: string): Scene | undefined {
    return this.scenes.get(sceneId);
  }
}

export default SceneBuilder;
