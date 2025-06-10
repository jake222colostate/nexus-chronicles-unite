
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Path tile component using the Japanese park stone floor asset
const JapanesePathTile: React.FC<{ 
  position: [number, number, number]; 
}> = ({ position }) => {
  const { scene } = useGLTF('/assets/japanese_park_stone_floor_uljcfd0_low.glb');

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Create stone path material
    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.8, 0.8, 0.75), // Light stone color
      roughness: 0.7,
      metalness: 0.1
    });

    // Apply material to path meshes
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = stoneMaterial;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return clone;
  }, [scene]);

  return (
    <group position={position} scale={[8, 1, 2]}>
      <primitive object={clonedScene} />
    </group>
  );
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
  console.log('FantasyPathSystem render - Realm:', realm, 'Chunks:', chunks.length);

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('FantasyPathSystem: Not fantasy realm, skipping');
    return null;
  }

  // Generate path tile positions for seamless coverage across chunks
  const pathTilePositions = useMemo(() => {
    console.log('Generating Japanese stone path tile positions for', chunks.length, 'chunks');
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

    console.log(`Total Japanese stone path tiles generated: ${positions.length}`);
    return positions;
  }, [chunks]);

  return (
    <group name="FantasyPathSystem">
      {pathTilePositions.map((pos, index) => {
        return (
          <FantasyPathTile
            key={`fantasy-path-${pos.chunkId}-${pos.tileIndex}`}
            position={[pos.x, pos.y, pos.z]}
            chunkSize={chunkSize}
          />
        );
      })}
    </group>
  );
};

// Preload the Japanese stone path model
useGLTF.preload('/assets/japanese_park_stone_floor_uljcfd0_low.glb');

console.log('FantasyPathSystem: Now using Japanese park stone floor asset for infinite path generation');
