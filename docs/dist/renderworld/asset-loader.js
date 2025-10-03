export class AssetLoader {
  constructor(THREE, GLTFLoader) {
    this.THREE = THREE;
    this.GLTFLoader = GLTFLoader;
    this.textureLoader = new THREE.TextureLoader();
  }

  async loadGLTF(path) {
    const loader = new this.GLTFLoader();
    const glb = await loader.loadAsync(path);
    return glb;
  }

  async loadTexture(path) {
    const tex = await this.textureLoader.loadAsync(path);
    return tex;
  }

  async loadWarehouseAssets(scene) {
    // Load MIFF-native isometric tiles as textured quads for a simple floor map
    const base = '/docs/assets/Isometric Blocks';
    try {
      const res = await fetch(`${base}/tile_manifest.json`);
      const manifest = await res.json();
      const tiles = Array.isArray(manifest.tiles) ? manifest.tiles : (Array.isArray(manifest) ? manifest : []);
      for (const t of tiles) {
        const file = t.src || t.filename || t.file || t.path;
        if (!file) continue;
        const tex = await this.loadTexture(`${base}/${file}`);
        tex.wrapS = tex.wrapT = this.THREE.ClampToEdgeWrapping;
        const mat = new this.THREE.MeshBasicMaterial({ map: tex, transparent: true });
        const geo = new this.THREE.PlaneGeometry(t.size || 1, t.size || 1);
        const mesh = new this.THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(t.x || 0, (t.alt || 0) + 0.01, (typeof t.z === 'number') ? t.z : (t.y || 0));
        scene.add(mesh);
      }
    } catch {}
  }
}
