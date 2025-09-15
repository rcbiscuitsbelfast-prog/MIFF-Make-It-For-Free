import { AvatarManifest, AvatarStyle, ResolvedAvatar, isAvatarManifest } from './schema';

export interface AssetRegistryRecord {
  id: string;
  remixSafety: 'CC0' | 'restricted' | string;
  compatibility: Array<'web' | 'godot' | 'unity'>;
  anchors: Record<string, string>; // anchorId -> asset URL
  generationHints?: Record<string, unknown>;
}

export interface AvatarRegistry {
  version: string;
  items: AssetRegistryRecord[];
}

export interface ResolveOptions {
  registry: AvatarRegistry;
  style: AvatarStyle;
}

export class AvatarSystemPure {
  public static validate(manifest: unknown): { ok: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!isAvatarManifest(manifest)) {
      return { ok: false, errors: ['Not an AvatarManifest'] };
    }
    if (!['3d', '2d-side', 'overlay'].includes(manifest.style)) {
      errors.push('Unsupported style');
    }
    if (!Array.isArray(manifest.clothing)) {
      errors.push('clothing must be an array');
    }
    return { ok: errors.length === 0, errors };
  }

  public static translateStyle(manifest: AvatarManifest, to: AvatarStyle): AvatarManifest {
    return { ...manifest, style: to };
  }

  public static resolve(manifest: AvatarManifest, opts: ResolveOptions): ResolvedAvatar {
    const components = AvatarSystemPure.toComponents(manifest);
    const entries: Array<{ anchor: string; url: string; meta?: Record<string, unknown> }> = [];
    for (const comp of components) {
      const anchor = AvatarSystemPure.anchorFor(comp);
      const url = AvatarSystemPure.findAssetURL(anchor, opts.registry, opts.style);
      entries.push({ anchor, url, meta: { component: comp.id } });
    }
    return { manifest, components, assets: { style: opts.style, entries } };
  }

  public static toComponents(manifest: AvatarManifest): Array<{ kind: AvatarComponentKind; id: string }> {
    const base: Array<{ kind: AvatarComponentKind; id: string }> = [
      { kind: 'head', id: `${manifest.base}_head` },
      { kind: 'torso', id: `${manifest.base}_torso` },
    ];
    const clothing: Array<{ kind: AvatarComponentKind; id: string }> = (manifest.clothing || []).map((c) => ({ kind: 'shirt', id: c }));
    return [...base, ...clothing];
  }
}

export type AvatarComponentKind = 'head' | 'torso' | 'legs' | 'boots' | 'shirt' | 'cloak' | 'hat' | 'accessory';

export namespace AvatarSystemPure {
  export function anchorFor(comp: { kind: AvatarComponentKind; id: string }): string {
    switch (comp.kind) {
      case 'head': return 'anchor_head';
      case 'torso': return 'anchor_torso';
      case 'legs': return 'anchor_legs';
      case 'boots': return 'anchor_boots';
      case 'shirt': return 'anchor_shirt';
      case 'cloak': return 'anchor_cloak';
      case 'hat': return 'anchor_hat';
      case 'accessory': return 'anchor_accessory';
    }
  }

  export function findAssetURL(anchor: string, registry: AvatarRegistry, style: AvatarStyle): string {
    // Fallback chain: registry -> procedural -> template -> AI -> placeholder
    for (const item of registry.items) {
      const url = item.anchors[`${style}:${anchor}`] || item.anchors[anchor] || '';
      if (url) return url;
    }
    // Procedural
    const procedural = generateProcedural(anchor, style);
    if (procedural) return procedural;
    // Template
    const template = templateURL(anchor, style);
    if (template) return template;
    // AI hint (non-blocking placeholder)
    const ai = aiHintURL(anchor, style);
    if (ai) return ai;
    // Final placeholder
    return placeholderURL(anchor, style);
  }

  export function generateProcedural(anchor: string, style: AvatarStyle): string | null {
    return null;
  }

  export function templateURL(anchor: string, style: AvatarStyle): string | null {
    return `/site/assets/avatars/templates/${style}/${anchor}.png`;
  }

  export function aiHintURL(anchor: string, style: AvatarStyle): string | null {
    return `/site/assets/avatars/hints/${style}/${anchor}.png`;
  }

  export function placeholderURL(anchor: string, style: AvatarStyle): string {
    return `/site/assets/avatars/placeholders/${style}/${anchor}.png`;
  }
}

