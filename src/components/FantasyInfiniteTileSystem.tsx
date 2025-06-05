
import React, { useMemo, useRef } from 'react';
import { Vector3 } from 'three';
import { FantasyInfiniteTileLoader } from './FantasyInfiniteTileLoader';

interface FantasyInfiniteTileSystemProps {
  playerPosition: Vector3;
  renderDistance: number;
}

export const FantasyInfiniteTileSystem: React.FC<FantasyInfiniteTileSystemProps> = ({
  playerPosition,
  renderDistance
}) => {
  const TILE_SIZE = 50; // Each tile is 50 units long in Z direction
  const tileQueue = useRef<number[]>([]);

  // Calculate which tiles should be visible
  const visibleTiles = useMemo(() => {
    const tiles: Array<{ position: [number, number, number], index: number }> = [];
    const playerZ = Math.abs(playerPosition.z);
    
    // Calculate tile indices that should be rendered
    const startTileIndex = Math.floor((playerZ - renderDistance) / TILE_SIZE);
    const endTileIndex = Math.floor((playerZ + renderDistance) / TILE_SIZE) + 2; // +2 for buffer
    
    // Generate tiles
    for (let i = Math.max(0, startTileIndex); i <= endTileIndex; i++) {
      const tileZ = -(i * TILE_SIZE); // Negative Z for forward progression
      
      tiles.push({
        position: [0, 0, tileZ] as [number, number, number],
        index: i
      });
    }
    
    // Update tile queue for memory management
    const currentTileIndices = tiles.map(t => t.index);
    tileQueue.current = currentTileIndices.slice(-3); // Keep only last 3 tiles
    

    
    return tiles;
  }, [playerPosition.z, renderDistance]);

  return (
    <group>
      {visibleTiles.map((tile) => (
        <FantasyInfiniteTileLoader
          key={`fantasy-tile-${tile.index}`}
          position={tile.position}
          tileIndex={tile.index}
        />
      ))}
    </group>
  );
};
