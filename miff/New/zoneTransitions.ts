import { loadZone } from './zoneLoader';
import { setPlayerPosition } from './playerPosition';

export function transitionToZone(zone: string, entryX = 0, entryY = 0): void {
  loadZone(zone);
  setPlayerPosition(entryX, entryY);
  console.log(`Transitioned to zone: ${zone} at (${entryX}, ${entryY})`);
}
