/**
 * Visual Tools Integration for MIFF Main Orchestrator
 * 
 * Integrates React-based visual tools with the main game loop:
 * - Tile Editor integration
 * - Zone Editor integration  
 * - Tile Inspector integration
 * - Tile Preview integration
 * - Debug overlay components
 * - Mobile-responsive UI components
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TileManager } from '../TileMapPure/TileMapPure/tileManager';
import { TileType } from '../TileMapPure/TileMapPure/tileTypes';
import { getTileColor, getTileLabel } from '../TileMapPure/TileMapPure/tileUtils';
import { mainOrchestrator, GameState } from './mainOrchestrator';

// Enhanced Tile Editor with orchestrator integration
interface EnhancedTileEditorProps {
  manager: TileManager;
  onTileChange?: (x: number, y: number, type: TileType) => void;
  showGrid?: boolean;
  tileSize?: number;
  isMobile?: boolean;
}

export const EnhancedTileEditor: React.FC<EnhancedTileEditorProps> = ({ 
  manager, 
  onTileChange,
  showGrid = true,
  tileSize = 32,
  isMobile = false
}) => {
  const [selected, setSelected] = useState<TileType>(TileType.Grass);
  const [isEditing, setIsEditing] = useState(false);
  const [showPalette, setShowPalette] = useState(!isMobile);

  const handleClick = useCallback((x: number, y: number) => {
    if (!isEditing) return;
    
    manager.setTile(x, y, selected);
    onTileChange?.(x, y, selected);
    
    // Emit tile change event
    mainOrchestrator.getRenderBridge()?.emit('tileChanged', { x, y, type: selected });
  }, [manager, selected, onTileChange, isEditing]);

  const handleTouch = useCallback((e: React.TouchEvent, x: number, y: number) => {
    e.preventDefault();
    handleClick(x, y);
  }, [handleClick]);

  const grid = manager.getGrid();
  const gridWidth = grid[0]?.length || 0;
  const gridHeight = grid.length;

  return (
    <div className="enhanced-tile-editor">
      {/* Mobile-friendly controls */}
      {isMobile && (
        <div className="mobile-controls">
          <button 
            className={`edit-toggle ${isEditing ? 'active' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Stop Editing' : 'Edit Tiles'}
          </button>
          <button 
            className="palette-toggle"
            onClick={() => setShowPalette(!showPalette)}
          >
            {showPalette ? 'Hide Palette' : 'Show Palette'}
          </button>
        </div>
      )}

      {/* Tile palette */}
      {showPalette && (
        <div className={`tile-palette ${isMobile ? 'mobile-palette' : ''}`}>
          <h4>Tile Types</h4>
          <div className="palette-grid">
            {Object.values(TileType).map(type => (
              <div
                key={type}
                className={`palette-item ${selected === type ? 'selected' : ''}`}
                onClick={() => setSelected(type)}
                style={{
                  backgroundColor: getTileColor(type),
                  border: selected === type ? '3px solid #fff' : '1px solid #333',
                  width: isMobile ? '48px' : '32px',
                  height: isMobile ? '48px' : '32px',
                }}
                title={getTileLabel(type)}
              >
                {isMobile && <span className="tile-label">{getTileLabel(type)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid display */}
      <div 
        className="tile-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridWidth}, ${tileSize}px)`,
          gap: showGrid ? '1px' : '0',
          backgroundColor: showGrid ? '#333' : 'transparent',
          padding: showGrid ? '1px' : '0',
        }}
      >
        {grid.flat().map(tile => (
          <div
            key={`${tile.x}-${tile.y}`}
            className={`tile-cell ${isEditing ? 'editable' : ''}`}
            onClick={() => handleClick(tile.x, tile.y)}
            onTouchEnd={(e) => handleTouch(e, tile.x, tile.y)}
            style={{
              width: `${tileSize}px`,
              height: `${tileSize}px`,
              backgroundColor: getTileColor(tile.type),
              border: showGrid ? '1px solid #333' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: `${Math.max(8, tileSize * 0.3)}px`,
              cursor: isEditing ? 'pointer' : 'default',
              userSelect: 'none',
              touchAction: 'none',
            }}
            title={`${getTileLabel(tile.type)} at (${tile.x}, ${tile.y})`}
          >
            {tileSize > 24 && (
              <span style={{ color: '#fff', textShadow: '1px 1px 1px #000' }}>
                {getTileLabel(tile.type).charAt(0)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Zone Editor with orchestrator integration
interface EnhancedZoneEditorProps {
  manager: TileManager;
  onSave: () => void;
  onLoad?: () => void;
  isMobile?: boolean;
}

export const EnhancedZoneEditor: React.FC<EnhancedZoneEditorProps> = ({ 
  manager, 
  onSave, 
  onLoad,
  isMobile = false
}) => {
  const [selectedTool, setSelectedTool] = useState<TileType>(TileType.Forest);
  const [isPainting, setIsPainting] = useState(false);
  const [showTools, setShowTools] = useState(!isMobile);

  const handleTileClick = useCallback((x: number, y: number) => {
    if (!isPainting) return;
    manager.setTile(x, y, selectedTool);
  }, [manager, selectedTool, isPainting]);

  const handleSave = useCallback(() => {
    onSave();
    mainOrchestrator.saveGame();
  }, [onSave]);

  const handleLoad = useCallback(() => {
    onLoad?.();
    mainOrchestrator.loadGame();
  }, [onLoad]);

  return (
    <div className="enhanced-zone-editor">
      {/* Mobile controls */}
      {isMobile && (
        <div className="mobile-zone-controls">
          <button 
            className={`paint-toggle ${isPainting ? 'active' : ''}`}
            onClick={() => setIsPainting(!isPainting)}
          >
            {isPainting ? 'Stop Painting' : 'Start Painting'}
          </button>
          <button 
            className="tools-toggle"
            onClick={() => setShowTools(!showTools)}
          >
            {showTools ? 'Hide Tools' : 'Show Tools'}
          </button>
        </div>
      )}

      {/* Tool palette */}
      {showTools && (
        <div className={`zone-tools ${isMobile ? 'mobile-tools' : ''}`}>
          <h4>Zone Tools</h4>
          <div className="tool-buttons">
            {Object.values(TileType).map(type => (
              <button
                key={type}
                className={`tool-button ${selectedTool === type ? 'selected' : ''}`}
                onClick={() => setSelectedTool(type)}
                style={{
                  backgroundColor: getTileColor(type),
                  border: selectedTool === type ? '3px solid #fff' : '1px solid #333',
                }}
                title={getTileLabel(type)}
              >
                {getTileLabel(type)}
              </button>
            ))}
          </div>
          <div className="action-buttons">
            <button onClick={handleSave} className="save-button">Save Zone</button>
            <button onClick={handleLoad} className="load-button">Load Zone</button>
          </div>
        </div>
      )}

      {/* Zone grid */}
      <EnhancedTileEditor
        manager={manager}
        onTileChange={handleTileClick}
        showGrid={true}
        tileSize={isMobile ? 24 : 32}
        isMobile={isMobile}
      />
    </div>
  );
};

// Enhanced Tile Inspector with orchestrator integration
interface EnhancedTileInspectorProps {
  type: TileType;
  x: number;
  y: number;
  showAdvanced?: boolean;
  isMobile?: boolean;
}

export const EnhancedTileInspector: React.FC<EnhancedTileInspectorProps> = ({ 
  type, 
  x, 
  y, 
  showAdvanced = false,
  isMobile = false
}) => {
  const [showDetails, setShowDetails] = useState(!isMobile);

  const color = getTileColor(type);
  const label = getTileLabel(type);

  return (
    <div className={`enhanced-tile-inspector ${isMobile ? 'mobile-inspector' : ''}`}>
      <div 
        className="tile-preview"
        style={{
          width: isMobile ? '64px' : '48px',
          height: isMobile ? '64px' : '48px',
          backgroundColor: color,
          border: '2px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isMobile ? '12px' : '10px',
          color: '#fff',
          textShadow: '1px 1px 1px #000',
        }}
      >
        {label}
      </div>
      
      <div className="tile-info">
        <h4>{label}</h4>
        <p>Type: {type}</p>
        <p>Position: ({x}, {y})</p>
        
        {isMobile && (
          <button 
            className="details-toggle"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        )}
        
        {showDetails && (
          <div className="tile-details">
            <p>Color: {color}</p>
            <p>Walkable: {type !== TileType.Water && type !== TileType.Cliff ? 'Yes' : 'No'}</p>
            {showAdvanced && (
              <div className="advanced-details">
                <p>Movement Cost: {type === TileType.Sand ? '2' : type === TileType.Forest ? '3' : '1'}</p>
                <p>Audio: {type === TileType.Forest ? 'Forest Ambience' : type === TileType.Water ? 'Waves' : 'None'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Game UI Overlay with mobile support
interface GameUIOverlayProps {
  gameState: GameState;
  isMobile?: boolean;
  onToggleInventory?: () => void;
  onToggleQuests?: () => void;
  onToggleDebug?: () => void;
  onSave?: () => void;
  onLoad?: () => void;
}

export const GameUIOverlay: React.FC<GameUIOverlayProps> = ({
  gameState,
  isMobile = false,
  onToggleInventory,
  onToggleQuests,
  onToggleDebug,
  onSave,
  onLoad
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  if (gameState === GameState.DIALOGUE) {
    return (
      <div className="dialogue-overlay">
        <div className="dialogue-box">
          <p>Press Enter to continue...</p>
        </div>
      </div>
    );
  }

  if (gameState === GameState.MENU) {
    return (
      <div className="menu-overlay">
        <div className="menu-content">
          <h3>Game Menu</h3>
          <div className="menu-buttons">
            <button onClick={onSave}>Save Game</button>
            <button onClick={onLoad}>Load Game</button>
            <button onClick={() => setShowMobileMenu(false)}>Resume</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`game-ui-overlay ${isMobile ? 'mobile-ui' : ''}`}>
      {/* Mobile menu button */}
      {isMobile && (
        <button 
          className="mobile-menu-button"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          ☰
        </button>
      )}

      {/* Mobile menu */}
      {isMobile && showMobileMenu && (
        <div className="mobile-menu">
          <button onClick={onToggleInventory}>Inventory</button>
          <button onClick={onToggleQuests}>Quests</button>
          <button onClick={onSave}>Save</button>
          <button onClick={onLoad}>Load</button>
          <button onClick={onToggleDebug}>Debug</button>
        </div>
      )}

      {/* Desktop controls */}
      {!isMobile && (
        <div className="desktop-controls">
          <button onClick={onToggleInventory}>I - Inventory</button>
          <button onClick={onToggleQuests}>Q - Quests</button>
          <button onClick={onSave}>F5 - Save</button>
          <button onClick={onLoad}>F9 - Load</button>
          <button onClick={onToggleDebug}>F12 - Debug</button>
        </div>
      )}

      {/* Game state indicator */}
      <div className="game-state-indicator">
        <span className={`state-badge ${gameState.toLowerCase()}`}>
          {gameState}
        </span>
      </div>
    </div>
  );
};

// Debug Overlay with mobile support
interface DebugOverlayProps {
  isVisible: boolean;
  isMobile?: boolean;
  playerPos: { x: number; y: number };
  gameState: GameState;
  frameCount: number;
  fps: number;
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({
  isVisible,
  isMobile = false,
  playerPos,
  gameState,
  frameCount,
  fps
}) => {
  if (!isVisible) return null;

  return (
    <div className={`debug-overlay ${isMobile ? 'mobile-debug' : ''}`}>
      <div className="debug-panel">
        <h4>Debug Info</h4>
        <div className="debug-stats">
          <p>FPS: {fps}</p>
          <p>Frame: {frameCount}</p>
          <p>Player: ({playerPos.x}, {playerPos.y})</p>
          <p>State: {gameState}</p>
          <p>Touch: {isMobile ? 'ON' : 'OFF'}</p>
        </div>
      </div>
    </div>
  );
};

// Main Visual Tools Container
interface VisualToolsContainerProps {
  manager: TileManager;
  isMobile?: boolean;
  showEditor?: boolean;
  showInspector?: boolean;
  showDebug?: boolean;
}

export const VisualToolsContainer: React.FC<VisualToolsContainerProps> = ({
  manager,
  isMobile = false,
  showEditor = false,
  showInspector = false,
  showDebug = false
}) => {
  const [gameState, setGameState] = useState<GameState>(GameState.PLAYING);
  const [selectedTile, setSelectedTile] = useState<{ type: TileType; x: number; y: number } | null>(null);

  useEffect(() => {
    // Listen to orchestrator events
    const handleGameStateChange = (newState: GameState) => {
      setGameState(newState);
    };

    // Subscribe to events (implementation depends on event system)
    return () => {
      // Cleanup
    };
  }, []);

  const handleTileSelect = useCallback((x: number, y: number, type: TileType) => {
    setSelectedTile({ type, x, y });
  }, []);

  return (
    <div className={`visual-tools-container ${isMobile ? 'mobile-container' : ''}`}>
      {/* Game UI */}
      <GameUIOverlay
        gameState={gameState}
        isMobile={isMobile}
        onToggleInventory={() => setGameState(GameState.MENU)}
        onToggleQuests={() => setGameState(GameState.MENU)}
        onToggleDebug={() => setGameState(GameState.PLAYING)}
        onSave={() => mainOrchestrator.saveGame()}
        onLoad={() => mainOrchestrator.loadGame()}
      />

      {/* Debug overlay */}
      {showDebug && (
        <DebugOverlay
          isVisible={true}
          isMobile={isMobile}
          playerPos={mainOrchestrator.getGameState() === GameState.PLAYING ? { x: 0, y: 0 } : { x: 0, y: 0 }}
          gameState={gameState}
          frameCount={0}
          fps={60}
        />
      )}

      {/* Tile editor */}
      {showEditor && (
        <div className="editor-panel">
          <h3>Tile Editor</h3>
          <EnhancedTileEditor
            manager={manager}
            onTileChange={handleTileSelect}
            isMobile={isMobile}
          />
        </div>
      )}

      {/* Tile inspector */}
      {showInspector && selectedTile && (
        <div className="inspector-panel">
          <h3>Tile Inspector</h3>
          <EnhancedTileInspector
            type={selectedTile.type}
            x={selectedTile.x}
            y={selectedTile.y}
            isMobile={isMobile}
          />
        </div>
      )}
    </div>
  );
};

export default VisualToolsContainer;