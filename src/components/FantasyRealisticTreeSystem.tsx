
import React, { useMemo } from 'react';
import { useGLTF, Instances, Instance } from '@react-three/drei';
import { Vector3 } from 'three';
import * as THREE from 'three';

// Use correct paths to existing GLB files
const REALISTIC_TREE_PATH = '/assets/realistic_tree.glb';
const PINE_TREE_PATH = '/assets/pine_tree_218poly.glb'; // Use the existing pine tree file

// Preload the GLB files for instant loading
useGLTF.preload(REALISTIC_TREE_PATH);
useGLTF.preload(PINE_TREE_PATH);

interface FantasyRealisticTreeSystemProps {
  chunkCenter: Vector3;
}

export const FantasyRealisticTreeSystem: React.FC<FantasyRealisticTreeSystemProps> = ({ chunkCenter }) => {
  const { scene: realTree } = useGLTF(REALISTIC_TREE_PATH);
  const { scene: pineTree } = useGLTF(PINE_TREE_PATH);

  // Extract geometry and material from the loaded models with proper type casting
  const realGeom = useMemo(() => {
    const mesh = realTree.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;
    return mesh?.geometry;
  }, [realTree]);

  const realMat = useMemo(() => {
    const mesh = realTree.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;
    return mesh?.material;
  }, [realTree]);

  const pineGeom = useMemo(() => {
    const mesh = pineTree.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;
    return mesh?.geometry;
  }, [pineTree]);

  const pineMat = useMemo(() => {
    const mesh = pineTree.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;
    return mesh?.material;
  }, [pineTree]);

  const COUNT = 20;
  const OFFSET = 6;

  // Generate stable tree positions based on chunk center
  const treePositions = useMemo(() => {
    const leftTrees = [];
    const rightTrees = [];
    
    for (let i = 0; i < COUNT; i++) {
      // Deterministic positioning based on chunk center and index
      const seed = Math.sin(chunkCenter.z * 0.001 + i * 13.7) * 10000;
      const randomZ = (seed - Math.floor(seed)) * 100;
      const randomX = (Math.sin(seed * 7.3) - Math.floor(Math.sin(seed * 7.3))) * 2 - 1;
      const scale = 1.2 + (Math.sin(seed * 11.1) - Math.floor(Math.sin(seed * 11.1))) * 0.6;
      
      const z = chunkCenter.z - randomZ;
      
      // Left side - realistic trees
      leftTrees.push({
        position: [-OFFSET + randomX, 0, z] as [number, number, number],
        scale: [scale * 1.5, scale * 1.5, scale * 1.5] as [number, number, number]
      });
      
      // Right side - pine trees
      rightTrees.push({
        position: [OFFSET + randomX, 0, z] as [number, number, number],
        scale: [scale * 1.4, scale * 1.4, scale * 1.4] as [number, number, number]
      });
    }
    
    return { leftTrees, rightTrees };
  }, [chunkCenter.z, COUNT, OFFSET]);

  // Return null if models haven't loaded yet
  if (!realGeom || !realMat || !pineGeom || !pineMat) {
    console.log('FantasyRealisticTreeSystem: Models not loaded yet, returning null');
    return null;
  }

  return (
    <>
      {/* Left side - Realistic trees */}
      <Instances geometry={realGeom} material={realMat}>
        {treePositions.leftTrees.map((tree, i) => (
          <Instance
            key={`left-realistic-${i}`}
            position={tree.position}
            scale={tree.scale}
          />
        ))}
      </Instances>

      {/* Right side - Pine trees */}
      <Instances geometry={pineGeom} material={pineMat}>
        {treePositions.rightTrees.map((tree, i) => (
          <Instance
            key={`right-pine-${i}`}
            position={tree.position}
            scale={tree.scale}
          />
        ))}
      </Instances>
    </>
  );
};
