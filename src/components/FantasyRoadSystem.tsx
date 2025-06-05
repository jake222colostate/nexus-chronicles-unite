
import React, { useMemo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

const FANTASY_ROAD_TILE_URL = 'https://raw.githubusercontent.com/jake222colostate/OK/main/fantasy_road_tile.glb';

// Fallback road tile component using basic geometry
const FallbackRoadTile: React.FC<{ 
  position: [number, number, number]; 
}> = ({ position }) => {
  return (
    <group position={position}>
      <mesh receiveShadow>
        <boxGeometry args={[6, 0.1, 6]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      {/* Add stone border details */}
      <mesh position={[-2.8, 0.05, 0]} receiveShadow>
        <boxGeometry args={[0.4, 0.1, 6]} />
        <meshLambertMaterial color="#696969" />
      </mesh>
      <mesh position={[2.8, 0.05, 0]} receiveShadow>
        <boxGeometry args={[0.4, 0.1, 6]} />
        <meshLambertMaterial color="#696969" />
      </mesh>
    </group>
  );
};

// Individual road tile component with fallback
const FantasyRoadTile: React.FC<{ 
  position: [number, number, number]; 
}> = ({ position }) => {
  
  try {
    const { scene } = useGLTF(FANTASY_ROAD_TILE_URL);
    
    if (!scene) {
      console.warn('Fantasy road tile scene not loaded, using fallback');
      return <FallbackRoadTile position={position} />;
    }


    
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
    console.error('Failed to load fantasy road tile model, using fallback:', error);
    return <FallbackRoadTile position={position} />;
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


  // Only render for fantasy realm
  if (realm !== 'fantasy') {

    return null;
  }

  // Generate road tile positions for each chunk
  const roadTilePositions = useMemo(() => {

    const positions = [];
    const tileSize = 6; // Each tile is 6 units long

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

// Don't preload the broken model
