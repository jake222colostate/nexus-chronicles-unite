
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
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshLambertMaterial) {
              // Adjust material for better environment integration
              mat.roughness = 0.8;
              mat.metalness = 0.1;
              mat.envMapIntensity = 0.5;
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
    const pathWidth = 24; // Scaled to cover full playable area between mountains
    const segmentLength = 6; // Optimized segment length for smooth transitions

    chunks.forEach(chunk => {
      const { worldZ, seed } = chunk;
      const segmentCount = Math.ceil(chunkSize / segmentLength);
      
      for (let i = 0; i < segmentCount; i++) {
        const z = worldZ - (i * segmentLength);
        elements.push({
          x: 0, // Perfectly centered on X-axis
          y: -1.75, // Positioned to sit flush with terrain surface
          z: z,
          scaleX: pathWidth / 4, // Scale to cover full width (original model ~4 units wide)
          scaleY: 1.0, // Maintain vertical scale
          scaleZ: segmentLength / 4, // Scale length to match segment size
          chunkId: chunk.id,
          index: i
        });
      }
    });

    console.log(`CleanPathSystem: Generated ${elements.length} properly scaled and aligned path segments`);
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
      
      {/* Additional terrain blending strips for seamless integration */}
      {pathElements.map((element) => (
        <mesh
          key={`path_blend_${element.chunkId}_${element.index}`}
          position={[element.x, element.y - 0.01, element.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          frustumCulled={false}
        >
          <planeGeometry args={[element.scaleX * 4.2, element.scaleZ * 4.2]} />
          <meshStandardMaterial
            color="#2d4a2b"
            roughness={0.9}
            metalness={0.05}
            transparent={true}
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

useGLTF.preload(PATH_MODEL_URL);
