import { AvatarStyle } from '../AvatarSystemPure/schema';

export interface VariantMap {
  id: string;
  variants: Partial<Record<'2d-topdown' | '2d-side' | '3d' | 'overlay', string>>;
  remixSafety: 'CC0' | 'restricted' | string;
  generationHints?: Record<string, unknown>;
}

export interface AvatarAssetRegistry {
  version: string;
  items: VariantMap[];
}

export class AvatarAssetRegistryPure {
  public static resolveVariant(id: string, style: AvatarStyle, reg: AvatarAssetRegistry): string | null {
    const item = reg?.items.find(x=>x?.id===id);
    if (!item) return null;
    const key = style === '3d' ? '3d' : (style === 'overlay' ? 'overlay' : style as '2d-side');
    return (item?.variants as any)[key!] || null;
  }
}

