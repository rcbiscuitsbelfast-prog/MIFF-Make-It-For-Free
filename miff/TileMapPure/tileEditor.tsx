import React, { useState } from 'react';
import { TileType } from './tileTypes';
import { TileManager } from './tileManager';

interface TileEditorProps {
  manager: TileManager;
}

export const TileEditor: React.FC<TileEditorProps> = ({ manager }) => {
  const [selected, setSelected] = useState<TileType>(TileType.Grass);

  const handleClick = (x: number, y: number) => {
    manager.setTile(x, y, selected);
  };

  return (
    <div>
      <select value={selected} onChange={e => setSelected(e.target.value as TileType)}>
        {Object.values(TileType).map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${manager.getGrid()[0].length}, 64px)` }}>
        {manager.getGrid().flat().map(tile => (
          <div
            key={`${tile.x}-${tile.y}`}
            onClick={() => handleClick(tile.x, tile.y)}
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#ccc',
              border: '1px solid #333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
            }}
          >
            {tile.type}
          </div>
        ))}
      </div>
    </div>
  );
};
