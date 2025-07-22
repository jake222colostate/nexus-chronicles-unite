import React, { useMemo } from 'react';
import { Vector3 } from 'three';
import { FogChunkData } from './FogBasedChunkSystem';

interface OptimizedEnemySystemProps {
  chunks: FogChunkData[];
  chunkSize: number;
  playerPosition: Vector3;
  onEnemyCountChange?: (count: number) => void;
  onEnemyKilled?: () => void;
  weaponDamage: number;
  realm: 'fantasy' | 'scifi';
  maxEnemies?: number;
}

export const OptimizedEnemySystem: React.FC<OptimizedEnemySystemProps> = ({
  chunks,
  chunkSize,
  playerPosition,
  onEnemyCountChange,
  onEnemyKilled,
  weaponDamage,
  realm,
  maxEnemies = 15 // Reduced from default for 60 FPS
}) => {
  // Filter chunks to only those close to player for enemy spawning
  const nearbyChunks = useMemo(() => {
    return chunks
      .filter(chunk => chunk.distanceToPlayer < 25) // Only spawn enemies very close to player
      .slice(0, 8); // Limit chunk processing for performance
  }, [chunks]);

  // Limit total enemy count for performance
  const enemyCount = useMemo(() => {
    return Math.min(nearbyChunks.length * 2, maxEnemies);
  }, [nearbyChunks.length, maxEnemies]);

  // Only render for fantasy realm and limit enemy density
  if (realm !== 'fantasy' || nearbyChunks.length === 0) {
    return null;
  }

  return (
    <group name="OptimizedEnemySystem">
      {/* Simplified enemy system with reduced spawn rate */}
      {nearbyChunks.slice(0, 5).map(chunk => ( // Process even fewer chunks
        <group key={`enemy-chunk-${chunk.id}`}>
          {/* Very limited enemy spawning for performance */}
          {Math.random() < 0.3 && ( // 30% chance instead of higher
            <mesh 
              position={[
                chunk.worldX + (Math.random() - 0.5) * 10,
                0.5,
                chunk.worldZ + (Math.random() - 0.5) * 10
              ]}
              castShadow={false} // Disable shadows for performance
              receiveShadow={false}
            >
              <boxGeometry args={[0.5, 1, 0.5]} />
              <meshLambertMaterial color="#8B4513" /> {/* Simple material */}
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

OptimizedEnemySystem.displayName = 'OptimizedEnemySystem';