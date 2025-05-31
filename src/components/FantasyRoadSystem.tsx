
import React, { useMemo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

const FANTASY_ROAD_TILE_URL = 'https://github.com/jake222colostate/HIGHPOLY/raw/main/fantasy_road_tile.glb';

// Individual road tile component
const FantasyRoadTile: React.FC<{ 
  position: [number, number, number]; 
}> = ({ position }) => {
  
  try {
    const { scene } = useGLTF(FANTASY_ROAD_TILE_URL);
    
    if (!scene) {
      console.error('Fantasy road tile scene not loaded');
      return null;
    }

    console.log('Fantasy road tile loaded successfully - Position:', position);
    
    // Clone the scene to avoid sharing geometry between instances
    const clonedScene = scene.clone();
    
    // Ensure all meshes receive shadows
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.receiveShadow = true;
        if (child.material) {
          child.material.needsUpdate = true;
        }
      }
    });
    
    return (
      <primitive 
        object={clonedScene} 
        position={position}
        receiveShadow 
      />
    );
  } catch (error) {
    console.error('Failed to load fantasy road tile model:', error);
    return null;
  }
};

interface FantasyRoadSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const FantasyRoadSystem: React.FC<FantasyRoadSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  console.log('FantasyRoadSystem render - Realm:', realm, 'Chunks:', chunks.length);

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('FantasyRoadSystem: Not fantasy realm, skipping');
    return null;
  }

  // Generate road tile positions for each chunk
  const roadTilePositions = useMemo(() => {
    console.log('Generating road tile positions for', chunks.length, 'chunks');
    const positions = [];
    const tileSize = 6; // Assuming each tile is 6 units long

    chunks.forEach(chunk => {
      const { worldZ } = chunk;
      
      // Calculate how many tiles we need for this chunk
      const tilesPerChunk = Math.ceil(chunkSize / tileSize);
      
      for (let i = 0; i < tilesPerChunk; i++) {
        const z = worldZ - (i * tileSize);
        positions.push({
          x: 0, // Road runs down the center
          y: -0.1, // Slightly below ground level
          z: z,
          chunkId: chunk.id,
          tileIndex: i
        });
      }
    });
    
    console.log(`Total fantasy road tiles generated: ${positions.length}`);
    return positions;
  }, [chunks, chunkSize]);

  return (
    <group>
      {roadTilePositions.map((pos, index) => {
        return (
          <Suspense key={`fantasy-road-${pos.chunkId}-${pos.tileIndex}`} fallback={null}>
            <FantasyRoadTile
              position={[pos.x, pos.y, pos.z]}
            />
          </Suspense>
        );
      })}
    </group>
  );
};

// Preload the model for better performance
console.log('Attempting to preload fantasy road tile model:', FANTASY_ROAD_TILE_URL);
try {
  useGLTF.preload(FANTASY_ROAD_TILE_URL);
} catch (error) {
  console.error('Failed to preload fantasy road tile model:', error);
}
