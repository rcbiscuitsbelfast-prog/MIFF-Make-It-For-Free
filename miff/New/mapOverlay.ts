export interface MapOverlay {
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

const overlays: MapOverlay[] = [];

export function addMapOverlay(x: number, y: number, label?: string, icon?: string): void {
  overlays.push({ x, y, label, icon, visible: true });
}

export function getMapOverlays(): MapOverlay[] {
  return overlays.filter(o => o.visible);
}

export function clearMapOverlays(): void {
  overlays.length = 0;
}
