
import React, { useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

interface FantasyPortalSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
}

export const FantasyPortalSystem: React.FC<FantasyPortalSystemProps> = ({
  chunks,
  chunkSize
}) => {
  const { scene } = useGLTF('https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_portal.glb');
  const portalRefs = useRef<THREE.Group[]>([]);
  
  // Memoize portal instances - every 500 units (approximately 10 chunks)
  const portalInstances = useMemo(() => {
    if (!scene) return [];
    
    const instances = [];
    
    chunks.forEach(chunk => {
      const { worldZ, x, z } = chunk;
      
      // Only place portals at specific intervals (every 500 units)
      if (Math.abs(worldZ) % 500 < chunkSize && x === 0 && z % 10 === 0) {
        instances.push({
          key: `portal_${chunk.id}`,
          position: [0, 2, worldZ] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [1.2, 1.2, 1.2] as [number, number, number]
        });
      }
    });
    
    return instances;
  }, [chunks, chunkSize, scene]);

  // Animate portals
  useFrame((state) => {
    portalRefs.current.forEach((portal, index) => {
      if (portal) {
        // Gentle floating animation
        portal.position.y = 2 + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.3;
        // Slow rotation
        portal.rotation.y += 0.003;
      }
    });
  });

  if (!scene) {
    return null;
  }

  return (
    <group>
      {portalInstances.map((instance, index) => {
        const clonedScene = scene.clone();
        
        clonedScene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        return (
          <group
            key={instance.key}
            ref={(ref) => {
              if (ref) portalRefs.current[index] = ref;
            }}
            position={instance.position}
            rotation={instance.rotation}
            scale={instance.scale}
          >
            <primitive object={clonedScene} />
            
            {/* Add subtle glow effect */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[3, 16, 16]} />
              <meshBasicMaterial
                color="#a855f7"
                transparent
                opacity={0.1}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

useGLTF.preload('https://raw.githubusercontent.com/jake222colostate/enviornment/main/fantasy_portal.glb');
