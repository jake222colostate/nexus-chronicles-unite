
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface SimpleMountainSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

// Simple seeded random number generator
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Simple geometric mountain component
const SimpleMountain: React.FC<{
  position: [number, number, number];
  scale: [number, number, number];
  seed: number;
}> = ({ position, scale, seed }) => {
  const mountainColor = new THREE.Color().setHSL(
    0.7 + seededRandom(seed) * 0.1, // Purple-blue hue
    0.4 + seededRandom(seed + 1) * 0.3,
    0.3 + seededRandom(seed + 2) * 0.2
  );

  return (
    <group position={position} scale={scale}>
      {/* Main mountain peak */}
      <mesh castShadow receiveShadow>
        <coneGeometry args={[3, 6, 8]} />
        <meshLambertMaterial color={mountainColor} />
      </mesh>
      
      {/* Secondary peaks */}
      <mesh position={[-2, -1, 1]} castShadow receiveShadow>
        <coneGeometry args={[2, 4, 6]} />
        <meshLambertMaterial color={mountainColor.clone().multiplyScalar(0.8)} />
      </mesh>
      
      <mesh position={[1.5, -1.5, -0.5]} castShadow receiveShadow>
        <coneGeometry args={[1.5, 3, 6]} />
        <meshLambertMaterial color={mountainColor.clone().multiplyScalar(0.9)} />
      </mesh>
    </group>
  );
};

export const SimpleMountainSystem: React.FC<SimpleMountainSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const mountainInstances = useMemo(() => {
    const instances = [];
    
    chunks.forEach(chunk => {
      // Create mountains every 80 units along Z-axis
      for (let zOffset = -40; zOffset < chunkSize + 40; zOffset += 80) {
        const finalZ = chunk.worldZ - zOffset;
        const mountainSeed = chunk.seed + zOffset;
        
        // Left side mountains
        instances.push({
          key: `left-${chunk.id}-${zOffset}`,
          position: [-35, 0, finalZ] as [number, number, number],
          scale: [2, 2, 2] as [number, number, number],
          seed: mountainSeed
        });
        
        // Right side mountains
        instances.push({
          key: `right-${chunk.id}-${zOffset}`,
          position: [35, 0, finalZ] as [number, number, number],
          scale: [2, 2, 2] as [number, number, number],
          seed: mountainSeed + 1000
        });
      }
    });
    
    return instances;
  }, [chunks, chunkSize]);

  return (
    <group>
      {mountainInstances.map(instance => (
        <SimpleMountain
          key={instance.key}
          position={instance.position}
          scale={instance.scale}
          seed={instance.seed}
        />
      ))}
    </group>
  );
};
