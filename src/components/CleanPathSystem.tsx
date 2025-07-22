
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

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

  const pathElements = useMemo(() => {
    const elements = [];
    const pathWidth = 80; // Very wide path to cover the full playable area
    const segmentLength = chunkSize; // Each segment covers one full chunk

    chunks.forEach(chunk => {
      const { worldZ } = chunk;
      
      // Create one wide path segment per chunk for seamless coverage
      elements.push({
        x: 0, // Centered at origin
        y: -1.5, // Just above ground level
        z: worldZ,
        width: pathWidth,
        length: segmentLength + 10, // Overlap for seamless connection
        chunkId: chunk.id
      });
    });

    console.log(`CleanPathSystem: Generated ${elements.length} wide straight path segments`);
    return elements;
  }, [chunks, chunkSize]);

  return (
    <group name="CleanPathSystem">
      {/* Main path segments - straight planes */}
      {pathElements.map((element) => (
        <mesh
          key={`clean_path_${element.chunkId}`}
          position={[element.x, element.y, element.z]}
          rotation={[-Math.PI / 2, 0, 0]} // Flat on ground, no rotation
          receiveShadow
          castShadow
          frustumCulled={false}
        >
          <planeGeometry args={[element.width, element.length]} />
          <meshStandardMaterial
            color="#8B4513" // Brown dirt path color
            roughness={0.8}
            metalness={0.1}
            transparent={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      
      {/* Path edges for definition */}
      {pathElements.map((element) => (
        <group key={`path_edges_${element.chunkId}`}>
          {/* Left edge */}
          <mesh
            position={[-element.width/2, element.y + 0.05, element.z]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
            frustumCulled={false}
          >
            <planeGeometry args={[2, element.length]} />
            <meshStandardMaterial
              color="#654321"
              roughness={0.9}
              metalness={0.0}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Right edge */}
          <mesh
            position={[element.width/2, element.y + 0.05, element.z]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
            frustumCulled={false}
          >
            <planeGeometry args={[2, element.length]} />
            <meshStandardMaterial
              color="#654321"
              roughness={0.9}
              metalness={0.0}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
