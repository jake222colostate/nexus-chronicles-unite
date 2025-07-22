import React, { useMemo } from 'react';
import { Vector3 } from 'three';
import { LODGLBSystem } from './LODGLBSystem';
import { FrustumCullingSystem } from './FrustumCullingSystem';
import { assetUrl } from '@/lib/utils';

interface OptimizedMountainSystemProps {
  playerPosition: Vector3;
  realm: 'fantasy' | 'scifi';
}

export const OptimizedMountainSystem: React.FC<OptimizedMountainSystemProps> = ({
  playerPosition,
  realm
}) => {
  // Generate mountain positions around the player
  const mountainPositions = useMemo(() => {
    if (realm !== 'fantasy') return [];

    return [
      // Mountains behind player
      { position: [0, 0, 20] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: 30 },
      { position: [0, 0, 50] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number], scale: 25 },
      { position: [0, 0, 80] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: 20 },
      
      // Mountains to the sides
      { position: [-40, 0, 10] as [number, number, number], rotation: [0, Math.PI * 0.5, 0] as [number, number, number], scale: 25 },
      { position: [40, 0, 10] as [number, number, number], rotation: [0, -Math.PI * 0.5, 0] as [number, number, number], scale: 25 },
      { position: [-60, 0, 40] as [number, number, number], rotation: [0, Math.PI * 0.3, 0] as [number, number, number], scale: 20 },
      { position: [60, 0, 40] as [number, number, number], rotation: [0, -Math.PI * 0.3, 0] as [number, number, number], scale: 20 },
      
      // Distant mountains for depth
      { position: [-80, 0, 100] as [number, number, number], rotation: [0, Math.PI * 0.7, 0] as [number, number, number], scale: 15 },
      { position: [80, 0, 100] as [number, number, number], rotation: [0, -Math.PI * 0.7, 0] as [number, number, number], scale: 15 },
    ];
  }, [realm]);

  if (realm !== 'fantasy') {
    return null;
  }

  return (
    <FrustumCullingSystem cullDistance={200}>
      {mountainPositions.map((mountain, index) => (
        <LODGLBSystem
          key={`mountain-${index}`}
          modelUrl={assetUrl('assets/environment/Mountains.glb')}
          position={mountain.position}
          rotation={mountain.rotation}
          scale={mountain.scale}
          lodDistances={[100, 200, 300]}
          cameraPosition={playerPosition}
        />
      ))}
    </FrustumCullingSystem>
  );
};