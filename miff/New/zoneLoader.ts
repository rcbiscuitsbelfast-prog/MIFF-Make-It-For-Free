import { initWorld } from './worldState';

export function loadZone(zone: string): void {
  switch (zone) {
    case 'grove':
      initWorld('grove', 10, 10);
      break;
    case 'village':
      initWorld('village', 8, 8);
      break;
    case 'cave':
      initWorld('cave', 6, 6);
      break;
    default:
      initWorld('unknown', 5, 5);
      break;
  }
}
