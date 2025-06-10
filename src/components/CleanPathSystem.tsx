
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
        
        // Enhanced material properties for better lighting integration
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(mat => {
            // Only set these properties on MeshStandardMaterial
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.roughness = 0.8;
              mat.metalness = 0.1;
              mat.envMapIntensity = 0.5;
              mat.needsUpdate = true;
            } else if (mat instanceof THREE.MeshLambertMaterial) {
              // For MeshLambertMaterial, we can only adjust basic properties
              mat.needsUpdate = true;
            }
          });
        }
      }
    });
    return clone;
  }, [pathScene]);

  const pathElements = useMemo(() => {
    const elements = [];
    const pathWidth = 50; // DRAMATICALLY INCREASED from 24 to 50 for much wider coverage
    const segmentLength = 8; // Slightly increased for better coverage

    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      const segmentCount = Math.ceil(chunkSize / segmentLength);
      
      for (let i = 0; i < segmentCount; i++) {
        const z = worldZ - (i * segmentLength);
        elements.push({
          x: 0, // Perfectly centered on X-axis
          y: -1.7, // Slightly raised for better visibility
          z: z,
          scaleX: pathWidth / 2, // MASSIVELY INCREASED scaling (was pathWidth / 4)
          scaleY: 1.5, // Increased vertical scale for better visibility
          scaleZ: segmentLength / 2, // INCREASED Z scaling (was segmentLength / 4)
          chunkId: chunk.id,
          index: i
        });
      }
    });

    console.log(`CleanPathSystem: Generated ${elements.length} MUCH LARGER path segments with dramatic scaling increase`);
    return elements;
  }, [chunks, chunkSize]);

  return (
    <group name="CleanPathSystem">
      {pathElements.map((element) => (
        <primitive
          key={`clean_path_${element.chunkId}_${element.index}`}
          object={pathModel.clone()}
          position={[element.x, element.y, element.z]}
          rotation={[-Math.PI / 2, 0, 0]} // Perfectly horizontal - only 90° X rotation
          scale={[element.scaleX, element.scaleY, element.scaleZ]}
          receiveShadow
          castShadow
          frustumCulled={false}
          matrixAutoUpdate={true}
        />
      ))}
      
      {/* ENLARGED terrain blending strips for seamless integration */}
      {pathElements.map((element) => (
        <mesh
          key={`path_blend_${element.chunkId}_${element.index}`}
          position={[element.x, element.y - 0.01, element.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          frustumCulled={false}
        >
          <planeGeometry args={[element.scaleX * 2.5, element.scaleZ * 2.5]} />
          <meshStandardMaterial
            color="#2d4a2b"
            roughness={0.9}
            metalness={0.05}
            transparent={true}
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

useGLTF.preload(PATH_MODEL_URL);
