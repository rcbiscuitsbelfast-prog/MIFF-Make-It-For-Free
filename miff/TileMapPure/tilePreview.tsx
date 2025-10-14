import React from 'react';
import { TileType } from './tileTypes';
import { getTileColor, getTileLabel } from './tileUtils';

interface TilePreviewProps {
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

export const TilePreview: React.FC<TilePreviewProps> = ({ type }) => {
  const color = getTileColor(type);
  const label = getTileLabel(type);

  return (
    <div style={{
      width: '64px',
      height: '64px',
      backgroundColor: color,
      border: '1px solid #333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75rem',
      color: '#fff',
    }}>
      {label}
    </div>
  );
};
