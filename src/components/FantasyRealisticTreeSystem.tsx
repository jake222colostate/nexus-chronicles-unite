
import React, { useMemo } from 'react';
import { useGLTF, Instances, Instance } from '@react-three/drei';
import { Vector3 } from 'three';

const REALISTIC_TREE_PATH = '/assets/realistic_tree.glb';
const PINE_TREE_PATH = '/assets/pine_tree.glb';

// Preload the GLB files for instant loading
useGLTF.preload(REALISTIC_TREE_PATH);
useGLTF.preload(PINE_TREE_PATH);

interface FantasyRealisticTreeSystemProps {
  chunkCenter: Vector3;
}

export const FantasyRealisticTreeSystem: React.FC<FantasyRealisticTreeSystemProps> = ({ chunkCenter }) => {
  const { scene: realTree } = useGLTF(REALISTIC_TREE_PATH);
  const { scene: pineTree } = useGLTF(PINE_TREE_PATH);

  // Extract geometry and material from the loaded models
  const realGeom = realTree.children[0]?.geometry;
  const realMat = realTree.children[0]?.material;
  const pineGeom = pineTree.children[0]?.geometry;
  const pineMat = pineTree.children[0]?.material;

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
