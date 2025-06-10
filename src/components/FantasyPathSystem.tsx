
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
        <boxGeometry args={[36, 0.05, 8]} />
        <meshLambertMaterial color="#DEB887" />
      </mesh>
      {/* Add decorative stones */}
      <mesh position={[15, 0.025, 3]} receiveShadow>
        <sphereGeometry args={[0.2]} />
        <meshLambertMaterial color="#A0522D" />
      </mesh>
      <mesh position={[-15, 0.025, -3]} receiveShadow>
        <sphereGeometry args={[0.15]} />
        <meshLambertMaterial color="#A0522D" />
      </mesh>
    </group>
  );
};

// Individual path tile component with proper rotation to lay flat as ground
const FantasyPathTile: React.FC<{
  position: [number, number, number];
  chunkSize: number;
}> = ({ position, chunkSize }) => {
  
  try {
    const { scene } = useGLTF(FANTASY_PATH_TILE_URL);
    
    if (!scene) {
      console.warn('Fantasy path tile scene not loaded, using fallback');
      return <FallbackPathTile position={position} />;
    }

    console.log('Fantasy path tile loaded successfully - Position:', position);
    
    // Clone the scene to avoid sharing geometry between instances
    const clonedScene = scene.clone();
    
    // Ensure all meshes receive shadows and apply proper materials
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.receiveShadow = true;
        child.castShadow = true;
        if (child.material) {
          child.material.needsUpdate = true;
          // Ensure proper lighting response
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.roughness = 0.8;
            child.material.metalness = 0.1;
          }
        }
      }
    });

    return (
      <group position={position}>
        <primitive
          object={clonedScene}
          // FIXED: Try multiple rotation approaches - rotate around X and Z axes
          rotation={[Math.PI / 2, 0, Math.PI / 2]}
          // FIXED: Larger scale and position adjustment
          scale={[5, 5, 5]}
          // FIXED: Lower position to ensure it's at ground level
          position={[0, -0.5, 0]}
          receiveShadow
          castShadow
        />
      </group>
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

  // Generate path tile positions for seamless coverage across chunks
  const pathTilePositions = useMemo(() => {
    console.log('Generating path tile positions for', chunks.length, 'chunks');
    const positions = [];
    chunks.forEach(chunk => {
      const { worldZ } = chunk;

      // FIXED: One path segment per chunk, aligned and positioned for seamless connection
      positions.push({
        x: 0, // Centered at X=0
        y: 0, // At ground level
        z: worldZ, // Aligned with chunk Z position
        chunkId: chunk.id,
        tileIndex: 0
      });
    });

    console.log(`Total fantasy path tiles generated: ${positions.length}`);
    return positions;
  }, [chunks]);

  return (
    <group name="FantasyPathSystem">
      {pathTilePositions.map((pos, index) => {
        return (
          <Suspense key={`fantasy-path-${pos.chunkId}-${pos.tileIndex}`} fallback={null}>
            <FantasyPathTile
              position={[pos.x, pos.y, pos.z]}
              chunkSize={chunkSize}
            />
          </Suspense>
        );
      })}
    </group>
  );
};

// Preload the model for better performance
useGLTF.preload(FANTASY_PATH_TILE_URL);

console.log('FantasyPathSystem: Applied combined X and Z rotations to properly orient path as ground');
