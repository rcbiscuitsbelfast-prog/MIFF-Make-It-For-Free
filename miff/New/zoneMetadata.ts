export interface ZoneMetadata {
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
  name: string;
  description: string;
  ambientSound?: string;
  recommendedLevel?: number;
}

const metadataMap = new Map<string, ZoneMetadata>();

export function setZoneMetadata(zone: string, data: ZoneMetadata): void {
  metadataMap.set(zone, data);
}

export function getZoneMetadata(zone: string): ZoneMetadata | undefined {
  return metadataMap.get(zone);
}

// Example
setZoneMetadata('grove', {
  name: 'The Grove',
  description: 'A lush forest filled with ancient spirits.',
  ambientSound: 'forest_ambience.mp3',
  recommendedLevel: 1,
});
