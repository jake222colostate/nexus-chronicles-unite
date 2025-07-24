import React, { useMemo } from 'react';
import { FantasyChunkData } from './NewFantasyChunkSystem';

interface ValleyTerrainProps {
  chunks: FantasyChunkData[];
  chunkSize: number;
}

interface TerrainPatch {
  key: string;
  position: [number, number, number];
  size: [number, number];
  color: string;
  opacity: number;
}

export const ValleyTerrain: React.FC<ValleyTerrainProps> = ({
  chunks,
  chunkSize
}) => {
  const terrainPatches = useMemo(() => {
    const patches: TerrainPatch[] = [];
    
    chunks.forEach((chunk) => {
      const { worldX, worldZ, opacity, id } = chunk;
      
      // Left valley side (purple/dark)
      patches.push({
        key: `valley_left_${id}`,
        position: [-25, -2.1, worldZ], // Far left
        size: [40, chunkSize], // Wide area
        color: '#4A148C', // Deep purple
        opacity
      });
      
      // Right valley side (purple/dark)
      patches.push({
        key: `valley_right_${id}`,
        position: [25, -2.1, worldZ], // Far right
        size: [40, chunkSize], // Wide area
        color: '#4A148C', // Deep purple
        opacity
      });
      
      // Inner valley walls (darker purple)
      patches.push({
        key: `inner_left_${id}`,
        position: [-12, -2.05, worldZ], // Closer to path
        size: [8, chunkSize],
        color: '#6A1B9A', // Lighter purple
        opacity: opacity * 0.9
      });
      
      patches.push({
        key: `inner_right_${id}`,
        position: [12, -2.05, worldZ], // Closer to path
        size: [8, chunkSize],
        color: '#6A1B9A', // Lighter purple
        opacity: opacity * 0.9
      });
    });
    
    console.log(`ValleyTerrain: Generated ${patches.length} valley terrain patches`);
    return patches;
  }, [chunks, chunkSize]);

  return (
    <group name="ValleyTerrain">
      {terrainPatches.map((patch) => (
        <mesh
          key={patch.key}
          position={patch.position}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          frustumCulled={false}
        >
          <planeGeometry args={patch.size} />
          <meshStandardMaterial
            color={patch.color}
            roughness={0.9}
            metalness={0.0}
            transparent
            opacity={patch.opacity}
            fog={true}
          />
        </mesh>
      ))}
    </group>
  );
};