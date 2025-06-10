
import React, { useMemo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

const FANTASY_PATH_TILE_URL = '/assets/dusty_foot_path_way_in_grass_garden.glb';

// Fallback path tile component using basic geometry
const FallbackPathTile: React.FC<{ 
  position: [number, number, number]; 
}> = ({ position }) => {
  return (
    <group position={position}>
      <mesh receiveShadow>
        <boxGeometry args={[4, 0.05, 4]} />
        <meshLambertMaterial color="#DEB887" />
      </mesh>
      {/* Add decorative stones */}
      <mesh position={[1.5, 0.025, 1.5]} receiveShadow>
        <sphereGeometry args={[0.1]} />
        <meshLambertMaterial color="#A0522D" />
      </mesh>
      <mesh position={[-1.5, 0.025, -1.5]} receiveShadow>
        <sphereGeometry args={[0.08]} />
        <meshLambertMaterial color="#A0522D" />
      </mesh>
    </group>
  );
};

// Individual path tile component with fallback
const FantasyPathTile: React.FC<{ 
  position: [number, number, number]; 
}> = ({ position }) => {
  
  try {
    const { scene } = useGLTF(FANTASY_PATH_TILE_URL);
    
    if (!scene) {
      console.warn('Fantasy path tile scene not loaded, using fallback');
      return <FallbackPathTile position={position} />;
    }

    console.log('Fantasy path tile loaded successfully - Position:', position);
    
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
    console.error('Failed to load fantasy path tile model, using fallback:', error);
    return <FallbackPathTile position={position} />;
  }
};

interface FantasyPathSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const FantasyPathSystem: React.FC<FantasyPathSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  console.log('FantasyPathSystem render - Realm:', realm, 'Chunks:', chunks.length);

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('FantasyPathSystem: Not fantasy realm, skipping');
    return null;
  }

  // Generate path tile positions for each chunk
  const pathTilePositions = useMemo(() => {
    console.log('Generating path tile positions for', chunks.length, 'chunks');
    const positions = [];
    const tileSize = 4; // Smaller tiles for path detail

    chunks.forEach(chunk => {
      const { worldZ } = chunk;
      
      // Calculate how many tiles we need for this chunk
      const tilesPerChunk = Math.ceil(chunkSize / tileSize);
      
      for (let i = 0; i < tilesPerChunk; i++) {
        const z = worldZ - (i * tileSize);
        positions.push({
          x: 0, // Path runs down the center
          y: -0.05, // Slightly above the road
          z: z,
          chunkId: chunk.id,
          tileIndex: i
        });
      }
    });
    
    console.log(`Total fantasy path tiles generated: ${positions.length}`);
    return positions;
  }, [chunks, chunkSize]);

  return (
    <group>
      {pathTilePositions.map((pos, index) => {
        return (
          <Suspense key={`fantasy-path-${pos.chunkId}-${pos.tileIndex}`} fallback={null}>
            <FantasyPathTile
              position={[pos.x, pos.y, pos.z]}
            />
          </Suspense>
        );
      })}
    </group>
  );
};

// Don't preload the broken model
console.log('FantasyPathSystem: Using fallback geometry for path tiles');
