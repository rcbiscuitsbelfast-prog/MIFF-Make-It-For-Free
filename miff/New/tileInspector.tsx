import React from 'react';
import { TileType } from '../TileMapPure/tileTypes';
import { getTileColor, getTileLabel } from '../TileMapPure/tileUtils';

interface TileInspectorProps {
  type: TileType;
}

export const TileInspector: React.FC<TileInspectorProps> = ({ type }) => {
  return (
    <div style={{
      padding: '8px',
      border: '1px solid #444',
      backgroundColor: getTileColor(type),
      color: '#fff',
      fontSize: '0.8rem',
    }}>
      <strong>{getTileLabel(type)}</strong>
      <div>Type: {type}</div>
    </div>
  );
};
