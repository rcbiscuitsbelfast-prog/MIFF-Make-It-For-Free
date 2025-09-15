import { ResolvedAvatar, AvatarManifest, AvatarAnchors, AvatarLayers } from '../AvatarSystemPure/schema';

export class AvatarRendererGodotPure {
  public static toGodotSceneJSON(avatar: ResolvedAvatar): any {
    return {
      type: 'GodotScene',
      nodes: avatar.assets.entries.map(e => ({ type: 'Sprite2D', name: e.anchor, anchor: e.anchor, texture: e.url })),
      meta: { style: avatar.assets.style, base: avatar.manifest.base }
    };
  }

  public static manifestToGodotNodes(manifest: AvatarManifest): Array<{ type: string; name: string; texture?: string; position?: {x:number;y:number} }> {
    const nodes: Array<{ type: string; name: string; texture?: string; position?: {x:number;y:number} }> = [];
    const anchors: AvatarAnchors | undefined = manifest.anchor;
    const layers: AvatarLayers | undefined = manifest.layers;
    if (layers?.body) nodes.push({ type: 'Sprite2D', name: 'anchor_torso', texture: layers.body, position: AvatarRendererGodotPure.toPos(anchors?.torso) });
    if (Array.isArray(layers?.clothing)) layers.clothing.forEach((c, i)=> nodes.push({ type: 'Sprite2D', name: `anchor_shirt_${i}`, texture: c, position: AvatarRendererGodotPure.toPos(anchors?.torso) }));
    if (layers?.face) nodes.push({ type: 'Sprite2D', name: 'anchor_head', texture: layers.face, position: AvatarRendererGodotPure.toPos(anchors?.head) });
    return nodes;
  }

  private static toPos(p?: {x:number;y:number}): {x:number;y:number} | undefined { return p ? { x: p.x, y: p.y } : undefined; }
}

