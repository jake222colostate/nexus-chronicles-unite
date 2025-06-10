
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const PATH_MODEL_URL = '/assets/dusty_foot_path_way_in_grass_garden.glb';

interface CleanPathSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}


export const CleanPathSystem: React.FC<CleanPathSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const { scene: pathScene } = useGLTF(PATH_MODEL_URL);

  const pathModel = useMemo(() => {
    const clone = pathScene.clone();
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [pathScene]);

  const pathElements = useMemo(() => {
    const elements = [];

    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      const segmentCount = Math.ceil(chunkSize / 4);
      
      for (let i = 0; i < segmentCount; i++) {
        const z = worldZ - (i * 4);
        elements.push({
          x: 0,
          y: -1.8,
          z: z,
          chunkId: chunk.id,
          index: i
        });
      }
    });

    return elements;
  }, [chunks, chunkSize]);

  return (
    <group>
      {pathElements.map((element) => (
        <primitive
          key={`clean_path_${element.chunkId}_${element.index}`}
          object={pathModel.clone()}
          position={[element.x, element.y, element.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[0.4, 0.4, 0.4]}
          receiveShadow
        />
      ))}
    </group>
  );
};

useGLTF.preload(PATH_MODEL_URL);
