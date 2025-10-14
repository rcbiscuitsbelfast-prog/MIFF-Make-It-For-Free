
export interface TileOverlay {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  x: number;
  y: number;
  label?: string;
  icon?: string;
  visible: boolean;
}

const overlays: TileOverlay[] = [];

export function addOverlay(x: number, y: number, label?: string, icon?: string): void {
  overlays.push({ x, y, label, icon, visible: true });
}

export function getOverlays(): TileOverlay[] {
  return overlays.filter(o => o.visible);
}

export function clearOverlays(): void {
  overlays.length = 0;
}
