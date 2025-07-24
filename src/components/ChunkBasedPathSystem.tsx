import React, { useMemo } from 'react';
import { FogChunkData } from './FogBasedChunkSystem';
import { Vector3 } from 'three';

interface ChunkBasedPathSystemProps {
  chunks: FogChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition: Vector3;
}

interface PathSegment {
  key: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  opacity: number;
}

export const ChunkBasedPathSystem: React.FC<ChunkBasedPathSystemProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const pathSegments = useMemo(() => {
    const segments: PathSegment[] = [];
    
    chunks.forEach((chunk) => {
      const { worldX, worldZ, fogOpacity, id } = chunk;
      
      // Create path segments along the Z axis (forward direction)
      const segmentsPerChunk = Math.ceil(chunkSize / 10); // One segment every 10 units
      
      for (let i = 0; i < segmentsPerChunk; i++) {
        const segmentZ = worldZ + (i * 10);
        
        // Random horizontal rotation for variety (-45 to +45 degrees)
        const seed = Math.abs(worldX * 1000 + segmentZ * 100) % 1000;
        const seededRandom = (s: number) => {
          const x = Math.sin(s) * 10000;
          return x - Math.floor(x);
        };
        
        const rotation = (seededRandom(seed) - 0.5) * Math.PI * 0.5;
        
        segments.push({
          key: `path_${id}_${i}`,
          position: [0, -1.65, segmentZ], // Slightly above ground for clear definition
          rotation: [0, rotation, 0],
          scale: [2.8, 1, 2.2], // Wider for 3-lane path
          opacity: fogOpacity
        });
      }
    });
    
    console.log(`ChunkBasedPathSystem: Generated ${segments.length} path segments`);
    return segments;
  }, [chunks, chunkSize]);

  return (
    <group name="ChunkBasedPathSystem">
      {pathSegments.map((segment) => (
        <group
          key={segment.key}
          position={segment.position}
          rotation={segment.rotation}
          scale={segment.scale}
        >
          <mesh castShadow receiveShadow>
            {/* Main path surface */}
            <boxGeometry args={[5, 0.15, 10]} />
            <meshStandardMaterial 
              color="#8B6914" 
              transparent 
              opacity={segment.opacity}
              roughness={0.95}
              metalness={0.0}
            />
          </mesh>
          
          {/* Left lane divider */}
          <mesh position={[-1.2, 0.08, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.1, 0.02, 10]} />
            <meshStandardMaterial 
              color="#5D4412" 
              transparent 
              opacity={segment.opacity}
            />
          </mesh>
          
          {/* Right lane divider */}
          <mesh position={[1.2, 0.08, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.1, 0.02, 10]} />
            <meshStandardMaterial 
              color="#5D4412" 
              transparent 
              opacity={segment.opacity}
            />
          </mesh>
          
          {/* Path edge borders - left */}
          <mesh position={[-2.5, 0.08, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.2, 0.03, 10]} />
            <meshStandardMaterial 
              color="#4A3010" 
              transparent 
              opacity={segment.opacity}
            />
          </mesh>
          
          {/* Path edge borders - right */}
          <mesh position={[2.5, 0.08, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.2, 0.03, 10]} />
            <meshStandardMaterial 
              color="#4A3010" 
              transparent 
              opacity={segment.opacity}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};