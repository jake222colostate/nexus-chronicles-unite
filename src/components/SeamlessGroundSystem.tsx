import React, { useMemo, useRef } from 'react';
import { FogChunkData } from './FogBasedChunkSystem';
import { Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';

interface SeamlessGroundSystemProps {
  chunks: FogChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition: Vector3;
  fogDistance: number;
}

interface GroundTile {
  key: string;
  position: [number, number, number];
  size: number;
  opacity: number;
  distanceToPlayer: number;
  chunkId: string;
}

export const SeamlessGroundSystem: React.FC<SeamlessGroundSystemProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition,
  fogDistance
}) => {
  const meshRefs = useRef<{ [key: string]: any }>({});

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const groundElements = useMemo(() => {
    const elements: any[] = [];
    
    // Create bright green grass areas and dirt path like in reference image
    chunks.forEach((chunk) => {
      const { worldX, worldZ, fogOpacity, id, distanceToPlayer } = chunk;
      
      // Left grass area (bright green like reference)
      elements.push({
        key: `grass_left_${id}`,
        type: 'grass',
        position: [-6, -2.01, worldZ], // Slightly above ground to prevent z-fighting
        size: [10, chunkSize], // Width x Length
        color: '#4CAF50', // Bright green like reference
        opacity: fogOpacity
      });
      
      // Right grass area (bright green like reference)
      elements.push({
        key: `grass_right_${id}`,
        type: 'grass', 
        position: [6, -2.01, worldZ], // Slightly above ground to prevent z-fighting
        size: [10, chunkSize], // Width x Length
        color: '#4CAF50', // Bright green like reference
        opacity: fogOpacity
      });
      
      // Central dirt path (3 lanes like reference)
      elements.push({
        key: `path_${id}`,
        type: 'path',
        position: [0, -2.0, worldZ], // Ground level
        size: [8, chunkSize], // 3-lane width
        color: '#8D6E63', // Brown dirt color like reference
        opacity: fogOpacity
      });
    });
    
    console.log(`SeamlessGroundSystem: Generated ${elements.length} ground elements`);
    return elements;
  }, [chunks, chunkSize]);

  // Animate opacity transitions for smooth loading/unloading
  useFrame(() => {
    groundElements.forEach((element) => {
      const mesh = meshRefs.current[element.key];
      if (mesh && mesh.material) {
        // Smooth opacity transition
        const targetOpacity = element.opacity;
        const currentOpacity = mesh.material.opacity;
        const delta = targetOpacity - currentOpacity;
        
        if (Math.abs(delta) > 0.01) {
          mesh.material.opacity = currentOpacity + delta * 0.1; // Smooth interpolation
        }
      }
    });
  });

  return (
    <group name="SeamlessGroundSystem">
      {/* Render grass and path elements like in reference image */}
      {groundElements.map((element) => (
        <mesh
          key={element.key}
          ref={(ref) => {
            if (ref) meshRefs.current[element.key] = ref;
          }}
          position={element.position}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          frustumCulled={false}
        >
          <planeGeometry args={element.size} />
          <meshStandardMaterial
            color={element.color}
            roughness={element.type === 'grass' ? 0.9 : 0.8} // Grass more matte, path slightly shinier
            metalness={0.0}
            transparent
            opacity={element.opacity}
            alphaTest={0.1}
            fog={true}
          />
        </mesh>
      ))}
      
      {/* Base dark ground foundation */}
      <mesh 
        position={[0, -2.1, playerPosition.z]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
        frustumCulled={false}
      >
        <planeGeometry args={[40, 800]} />
        <meshStandardMaterial 
          color="#2E7D32" // Dark green base
          roughness={1.0}
          metalness={0.0}
          fog={true}
        />
      </mesh>
    </group>
  );
};