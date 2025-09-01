import { initWorld, setFlag, placeNPC } from './worldState';
import { setPlayerPosition } from './playerPosition';
import { SaveData } from './saveGame';

export function loadGame(data: SaveData): void {
  initWorld(data.zone, 10, 10); // Default size; can be dynamic
  setPlayerPosition(data.player.x, data.player.y);

  for (const [flag, value] of Object.entries(data.flags)) {
    setFlag(flag, value);
  }

  for (const [id, npc] of Object.entries(data.npcs)) {
    placeNPC(id, npc.x, npc.y);
  }

  console.log(`Game loaded into zone: ${data.zone}`);
}
