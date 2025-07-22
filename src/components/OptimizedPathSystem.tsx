import React, { useMemo } from 'react';
import { Vector3 } from 'three';
import { InstancedGLBSystem } from './InstancedGLBSystem';
import { FrustumCullingSystem } from './FrustumCullingSystem';
import { assetUrl } from '@/lib/utils';

interface OptimizedPathSystemProps {
  playerPosition: Vector3;
  chunksAhead?: number;
  chunksBehind?: number;
  chunkSize?: number;
}

export const OptimizedPathSystem: React.FC<OptimizedPathSystemProps> = ({
  playerPosition,
  chunksAhead = 8,
  chunksBehind = 2,
  chunkSize = 20
}) => {
  // Generate path segment positions
  const pathPositions = useMemo(() => {
    const positions = [];
    
    // Calculate player's current chunk
    const playerChunkZ = Math.floor(playerPosition.z / chunkSize);
    
    // Generate path segments from behind player to ahead
    for (let i = -chunksBehind; i <= chunksAhead; i++) {
      const chunkZ = playerChunkZ + i;
      const worldZ = chunkZ * chunkSize;
      
      positions.push({
        position: [0, -1, worldZ] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        scale: 1
      });
    }
    
    return positions;
  }, [playerPosition.z, chunksAhead, chunksBehind, chunkSize]);

  return (
    <FrustumCullingSystem cullDistance={200}>
      <InstancedGLBSystem
        modelUrl={assetUrl('assets/Path.glb')}
        positions={pathPositions}
        maxCount={100}
        frustumCull={true}
      />
    </FrustumCullingSystem>
  );
};