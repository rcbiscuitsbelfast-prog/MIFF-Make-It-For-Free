export type AvatarStyle = '3d' | '2d-side' | 'overlay';

export interface AvatarComponent {
  kind: 'head' | 'torso' | 'legs' | 'boots' | 'shirt' | 'cloak' | 'hat' | 'accessory';
  id: string; // e.g. "tunic_blue_v1"
}

export interface AvatarAnchors {
  head?: { x: number; y: number };
  torso?: { x: number; y: number };
  feet?: { x: number; y: number };
  [key: string]: { x: number; y: number } | undefined;
}

export interface AvatarLayers {
  body?: string; // url or asset id
  clothing?: string[];
  face?: string; // url or asset id
}

export interface AvatarManifest {
  base: 'barbarian' | 'mage' | 'rogue' | string;
  clothing: string[];
  face: 'neutral' | 'smile' | 'angry' | string;
  style: AvatarStyle;
  layers?: AvatarLayers;
  anchor?: AvatarAnchors;
  performance?: {
    polyCount?: number;
    textureSize?: string;
    mobileOptimized?: boolean;
  };
}

export interface ResolvedAvatar {
  manifest: AvatarManifest;
  // Style-agnostic canonical parts list
  components: AvatarComponent[];
  // Concrete asset bindings per style
  assets: {
    style: AvatarStyle;
    entries: Array<{ anchor: string; url: string; meta?: Record<string, unknown> }>;
  };
}

export function isAvatarManifest(value: any): value is AvatarManifest {
  return !!value && typeof value === 'object' && typeof value.base === 'string' && typeof value.style === 'string';
}

