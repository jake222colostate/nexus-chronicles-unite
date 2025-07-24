import React, { useMemo } from 'react';
import { FantasyChunkData } from './NewFantasyChunkSystem';

interface BrightGreenTerrainProps {
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

export const BrightGreenTerrain: React.FC<BrightGreenTerrainProps> = ({
  chunks,
  chunkSize
}) => {
  const terrainPatches = useMemo(() => {
    const patches: TerrainPatch[] = [];
    
    chunks.forEach((chunk) => {
      const { worldX, worldZ, opacity, id } = chunk;
      
      // Left side grass (bright vibrant green)
      patches.push({
        key: `grass_left_${id}`,
        position: [-12, -2.0, worldZ], // Left of path
        size: [18, chunkSize], // Wide grass area
        color: '#4CAF50', // Bright green
        opacity
      });
      
      // Right side grass (bright vibrant green)
      patches.push({
        key: `grass_right_${id}`,
        position: [12, -2.0, worldZ], // Right of path
        size: [18, chunkSize], // Wide grass area
        color: '#4CAF50', // Bright green
        opacity
      });
      
      // Add some subtle color variations for interest
      const leftVariation = `grass_left_var_${id}`;
      const rightVariation = `grass_right_var_${id}`;
      
      // Slightly different green tones for depth
      patches.push({
        key: leftVariation,
        position: [-18, -1.99, worldZ + chunkSize * 0.3],
        size: [6, chunkSize * 0.4],
        color: '#66BB6A', // Slightly lighter green
        opacity: opacity * 0.8
      });
      
      patches.push({
        key: rightVariation,
        position: [18, -1.99, worldZ + chunkSize * 0.6],
        size: [6, chunkSize * 0.4],
        color: '#66BB6A', // Slightly lighter green
        opacity: opacity * 0.8
      });
    });
    
    console.log(`BrightGreenTerrain: Generated ${patches.length} terrain patches`);
    return patches;
  }, [chunks, chunkSize]);

  return (
    <group name="BrightGreenTerrain">
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