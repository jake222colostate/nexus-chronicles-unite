
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
    const pathWidth = 80; // MASSIVELY INCREASED to cover full playable area
    const segmentLength = 4; // Smaller segments for more overlap and coverage

    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      const segmentCount = Math.ceil(chunkSize / segmentLength) + 2; // Extra segments for overlap
      
      for (let i = -1; i < segmentCount + 1; i++) { // Start before and end after chunk
        const z = worldZ - (i * segmentLength);
        elements.push({
          x: 0, // Perfectly centered on X-axis
          y: -1.65, // Slightly higher for better visibility
          z: z,
          scaleX: pathWidth / 1.5, // MASSIVE horizontal scaling
          scaleY: 2.0, // Increased vertical scale
          scaleZ: segmentLength / 1.5, // MASSIVE Z scaling for full coverage
          chunkId: chunk.id,
          index: i
        });
      }
    });

    console.log(`CleanPathSystem: Generated ${elements.length} MASSIVELY SCALED path segments covering full ground`);
    return elements;
  }, [chunks, chunkSize]);

  return (
    <group name="CleanPathSystem">
      {pathElements.map((element) => (
        <primitive
          key={`clean_path_${element.chunkId}_${element.index}`}
          object={pathModel.clone()}
          position={[element.x, element.y, element.z]}
          rotation={[0, 0, 0]} // FIXED: Remove the sideways rotation - keep it flat and forward-facing
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
          <planeGeometry args={[element.scaleX * 1.2, element.scaleZ * 1.2]} />
          <meshStandardMaterial
            color="#2d4a2b"
            roughness={0.9}
            metalness={0.05}
            transparent={true}
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

useGLTF.preload(PATH_MODEL_URL);
