import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Fallback path tile component using basic geometry
const FallbackPathTile: React.FC<{ 
  position: [number, number, number]; 
}> = ({ position }) => {
  // Rendering fallback path tile
  return (
    <group position={position}>
      <mesh receiveShadow>
        <boxGeometry args={[8, 0.1, 6]} />
        <meshLambertMaterial color="#8B7355" />
      </mesh>
      {/* Stone texture simulation */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[7.5, 0.02, 5.5]} />
        <meshLambertMaterial color="#A0A0A0" />
      </mesh>
    </group>
  );
};

// Path tile component using the Japanese park stone floor asset
const JapanesePathTile: React.FC<{ 
  position: [number, number, number]; 
}> = ({ position }) => {
  // Loading Japanese stone path tile
  
  try {
    const { scene } = useGLTF('/assets/japanese_park_stone_floor_uljcfd0_low.glb');
    
    if (!scene) {
      console.warn('JapanesePathTile: Scene is null/undefined, using fallback');
      return <FallbackPathTile position={position} />;
    }

    // Process loaded GLB scene
    const clonedScene = useMemo(() => {
      const clone = scene.clone();
      
      // Create stone path material
      const stoneMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0.8, 0.8, 0.75), // Light stone color
        roughness: 0.7,
        metalness: 0.1
      });

      // Apply material to path meshes
      let meshCount = 0;
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = stoneMaterial;
          child.castShadow = true;
          child.receiveShadow = true;
          meshCount++;
        }
      });
      
      // Processed meshes in cloned scene
      return clone;
    }, [scene]);

    return (
      <group position={position} scale={[8, 1, 2]}>
        <primitive object={clonedScene} />
      </group>
    );
  } catch (error) {
    console.error('JapanesePathTile: Exception caught while loading:', error);
    return <FallbackPathTile position={position} />;
  }
};

// Individual path tile component
const FantasyPathTile: React.FC<{
  position: [number, number, number];
  chunkSize: number;
}> = ({ position, chunkSize }) => {
  return <JapanesePathTile position={position} />;
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
  // Only render in fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // Generate path tile positions for seamless coverage across chunks
  const pathTilePositions = useMemo(() => {
    const positions = [];
    chunks.forEach(chunk => {
      const { worldZ } = chunk;

      // One path segment per chunk, aligned with the chunk position
      positions.push({
        x: 0,
        y: 0,
        z: worldZ,
        chunkId: chunk.id,
        tileIndex: 0
      });
    });

    return positions;
  }, [chunks]);

  return (
    <group name="FantasyPathSystem">
      {pathTilePositions.map((pos, index) => (
        <FantasyPathTile
          key={`fantasy-path-${pos.chunkId}-${pos.tileIndex}`}
          position={[pos.x, pos.y, pos.z]}
          chunkSize={chunkSize}
        />
      ))}
    </group>
  );
};

// Preload the Japanese stone path model
try {
  useGLTF.preload('/assets/japanese_park_stone_floor_uljcfd0_low.glb');
} catch (error) {
  console.error('FantasyPathSystem: Failed to preload Japanese stone path:', error);
}
