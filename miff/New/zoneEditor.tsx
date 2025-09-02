import React from 'react';
import { TileManager } from '../TileMapPure/TileMapPure/tileManager';
import { TileType } from '../TileMapPure/TileMapPure/tileTypes';

interface ZoneEditorProps {
  manager: TileManager;
  onSave: () => void;
}

export const ZoneEditor: React.FC<ZoneEditorProps> = ({ manager, onSave }) => {
  const handleClick = (x: number, y: number) => {
    manager.setTile(x, y, TileType.Forest);
  };

  return (
    <div>
      <h3>Zone Editor</h3>
      <button onClick={onSave}>Save Zone</button>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${manager.getGrid()[0].length}, 32px)` }}>
        {manager.getGrid().flat().map((tile: any) => (
          <div
            key={`${tile.x}-${tile.y}`}
            onClick={() => handleClick(tile.x, tile.y)}
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#ccc',
              border: '1px solid #333',
              fontSize: '0.6rem',
              textAlign: 'center',
            }}
          >
            {tile.type[0]}
          </div>
        ))}
      </div>
    </div>
  );
};
