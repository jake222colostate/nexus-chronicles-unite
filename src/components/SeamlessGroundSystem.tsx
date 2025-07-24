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

interface GroundElement {
  key: string;
  type: 'grass' | 'path';
  position: [number, number, number];
  size: [number, number];
  color: string;
  opacity: number;
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
    const elements: GroundElement[] = [];
    
    // Create bright green grass areas and recessed dirt path like in reference image
    chunks.forEach((chunk) => {
      const { worldX, worldZ, fogOpacity, id } = chunk;
      
      // Left grass area (bright green like reference) - higher level
      elements.push({
        key: `grass_left_${id}`,
        type: 'grass',
        position: [-6, -2.0, worldZ], // Grass at ground level
        size: [10, chunkSize],
        color: '#4CAF50',
        opacity: fogOpacity
      });
      
      // Right grass area (bright green like reference) - higher level  
      elements.push({
        key: `grass_right_${id}`,
        type: 'grass', 
        position: [6, -2.0, worldZ], // Grass at ground level
        size: [10, chunkSize],
        color: '#4CAF50',
        opacity: fogOpacity
      });
      
      // Central dirt path (recessed/lower than grass like reference)
      elements.push({
        key: `path_${id}`,
        type: 'path',
        position: [0, -2.3, worldZ], // Path LOWER than grass
        size: [8, chunkSize],
        color: '#8D6E63',
        opacity: fogOpacity
      });
    });
    
    console.log(`SeamlessGroundSystem: Generated ${elements.length} ground elements with recessed path`);
    return elements;
  }, [chunks, chunkSize]);

  // Animate opacity transitions for smooth loading/unloading
  useFrame(() => {
    groundElements.forEach((element) => {
      const mesh = meshRefs.current[element.key];
      if (mesh && mesh.material) {
        const targetOpacity = element.opacity;
        const currentOpacity = mesh.material.opacity;
        const delta = targetOpacity - currentOpacity;
        
        if (Math.abs(delta) > 0.01) {
          mesh.material.opacity = currentOpacity + delta * 0.1;
        }
      }
    });
  });

  return (
    <group name="SeamlessGroundSystem">
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
            roughness={element.type === 'grass' ? 0.9 : 0.8}
            metalness={0.0}
            transparent
            opacity={element.opacity}
            alphaTest={0.1}
            fog={true}
          />
        </mesh>
      ))}
    </group>
  );
};