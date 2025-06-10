
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
        
        // Enhanced material properties for vibrant lighting
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(mat => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.roughness = 0.6; // Reduced for more reflectivity
              mat.metalness = 0.05;
              mat.envMapIntensity = 1.2; // Increased for better lighting response
              // Brighten the base color
              if (mat.color) {
                mat.color.multiplyScalar(1.4);
              }
              mat.needsUpdate = true;
            } else if (mat instanceof THREE.MeshLambertMaterial) {
              // Brighten Lambert materials too
              if (mat.color) {
                mat.color.multiplyScalar(1.3);
              }
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
    const pathWidth = 200; // DRAMATICALLY INCREASED to cover entire map width
    const segmentLength = 6; // Slightly larger segments for better coverage
    const segmentOverlap = 2; // Overlap between segments for seamless connection

    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      const segmentCount = Math.ceil(chunkSize / (segmentLength - segmentOverlap)) + 4; // More segments with overlap
      
      for (let i = -2; i < segmentCount + 2; i++) { // Extra segments for complete coverage
        const z = worldZ - (i * (segmentLength - segmentOverlap)); // Account for overlap
        elements.push({
          x: 0, // Perfectly centered
          y: -1.6, // Optimal height for visibility
          z: z,
          scaleX: pathWidth / 1.2, // MASSIVE horizontal scaling for full map coverage
          scaleY: 2.5, // Increased vertical scale for better definition
          scaleZ: segmentLength / 1.2, // Large Z scaling with overlap consideration
          chunkId: chunk.id,
          index: i
        });
      }
    });

    console.log(`CleanPathSystem: Generated ${elements.length} MASSIVELY SCALED connected path segments`);
    return elements;
  }, [chunks, chunkSize]);

  return (
    <group name="CleanPathSystem">
      {pathElements.map((element) => (
        <primitive
          key={`clean_path_${element.chunkId}_${element.index}`}
          object={pathModel.clone()}
          position={[element.x, element.y, element.z]}
          rotation={[0, 0, 0]} // Keep flat and forward-facing
          scale={[element.scaleX, element.scaleY, element.scaleZ]}
          receiveShadow
          castShadow
          frustumCulled={false}
          matrixAutoUpdate={true}
        />
      ))}
      
      {/* Enhanced terrain blending with brighter colors */}
      {pathElements.map((element) => (
        <mesh
          key={`path_blend_${element.chunkId}_${element.index}`}
          position={[element.x, element.y - 0.005, element.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          frustumCulled={false}
        >
          <planeGeometry args={[element.scaleX * 1.1, element.scaleZ * 1.1]} />
          <meshStandardMaterial
            color="#3d5a3e" // Brighter green for better visibility
            roughness={0.8}
            metalness={0.1}
            transparent={true}
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

useGLTF.preload(PATH_MODEL_URL);
