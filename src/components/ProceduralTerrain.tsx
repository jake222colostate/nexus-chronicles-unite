
import React from 'react';
import { ChunkData } from './ChunkSystem';

interface ProceduralTerrainProps {
  chunk: ChunkData;
  chunkSize: number;
}

// Simple seeded random number generator
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const ProceduralTerrain: React.FC<ProceduralTerrainProps> = ({
  chunk,
  chunkSize
}) => {
  const generateTerrainFeatures = () => {
    const features = [];
    const { worldX, worldZ, seed } = chunk;
    
    // Generate 2-4 terrain features per chunk
    const featureCount = Math.floor(seededRandom(seed) * 3) + 2;
    
    for (let i = 0; i < featureCount; i++) {
      const featureSeed = seed + i * 100;
      const x = worldX + seededRandom(featureSeed) * chunkSize;
      const z = worldZ - seededRandom(featureSeed + 1) * chunkSize;
      const rotation = seededRandom(featureSeed + 2) * Math.PI * 2;
      const scale = 0.8 + seededRandom(featureSeed + 3) * 0.4;
      const type = Math.floor(seededRandom(featureSeed + 4) * 3);
      
      let color;
      switch (type) {
        case 0: color = "#2d5a27"; break; // Dark green
        case 1: color = "#8B7355"; break; // Brown
        case 2: color = "#6B7280"; break; // Gray
        default: color = "#4B5563"; break;
      }
      
      features.push(
        <group key={`feature_${chunk.id}_${i}`} position={[x, 0, z]} rotation={[0, rotation, 0]}>
          <mesh>
            <boxGeometry args={[2 * scale, 1 * scale, 2 * scale]} />
            <meshLambertMaterial color={color} />
          </mesh>
        </group>
      );
    }
    
    return features;
  };

  return (
    <group>
      {/* Chunk base terrain */}
      <mesh position={[chunk.worldX + chunkSize/2, -0.5, chunk.worldZ - chunkSize/2]} receiveShadow>
        <boxGeometry args={[chunkSize, 1, chunkSize]} />
        <meshLambertMaterial color="#8B7355" />
      </mesh>
      
      {/* Procedural features */}
      {generateTerrainFeatures()}
    </group>
  );
};
