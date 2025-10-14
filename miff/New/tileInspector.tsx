import React from 'react';
import { TileType } from '../TileMapPure/tileTypes';
import { getTileColor, getTileLabel } from '../TileMapPure/tileUtils';

interface TileInspectorProps {
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
