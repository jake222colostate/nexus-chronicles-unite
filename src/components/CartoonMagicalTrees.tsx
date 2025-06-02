
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ChunkData } from './ChunkSystem';

interface CartoonMagicalTreesProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const CartoonMagicalTrees: React.FC<CartoonMagicalTreesProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // Generate tree positions
  const treePositions = useMemo(() => {
    const positions = [];
    
    chunks.forEach(chunk => {
      // Add 3-5 trees per chunk
      const treeCount = 3 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < treeCount; i++) {
        positions.push({
          id: `tree_${chunk.id}_${i}`,
          x: chunk.worldX + (Math.random() - 0.5) * chunkSize * 0.9,
          z: chunk.worldZ + (Math.random() - 0.5) * chunkSize * 0.9,
          scale: 0.8 + Math.random() * 0.6,
          foliageColor: ['#32CD32', '#228B22', '#90EE90', '#98FB98'][Math.floor(Math.random() * 4)]
        });
      }
    });
    
    return positions;
  }, [chunks, chunkSize]);

  return (
    <group>
      {treePositions.map(tree => (
        <CartoonTree key={tree.id} {...tree} />
      ))}
    </group>
  );
};

const CartoonTree: React.FC<{
  x: number;
  z: number;
  scale: number;
  foliageColor: string;
}> = ({ x, z, scale, foliageColor }) => {
  const foliageRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (foliageRef.current) {
      // Gentle swaying
      foliageRef.current.rotation.z = Math.sin(state.clock.elapsedTime + x) * 0.05;
    }
  });

  return (
    <group position={[x, 0, z]} scale={[scale, scale, scale]}>
      {/* Tree trunk */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Main foliage */}
      <mesh ref={foliageRef} position={[0, 2.5, 0]}>
        <sphereGeometry args={[1.5, 8, 6]} />
        <meshStandardMaterial color={foliageColor} />
      </mesh>
      
      {/* Additional foliage layers */}
      <mesh position={[0.5, 3, 0.3]}>
        <sphereGeometry args={[0.8, 8, 6]} />
        <meshStandardMaterial color={foliageColor} />
      </mesh>
      
      <mesh position={[-0.4, 2.8, -0.2]}>
        <sphereGeometry args={[0.6, 8, 6]} />
        <meshStandardMaterial color={foliageColor} />
      </mesh>
      
      {/* Magical glow */}
      <pointLight
        position={[0, 2.5, 0]}
        color="#90EE90"
        intensity={0.3}
        distance={8}
      />
      
      {/* Floating sparkles around tree */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * 1.57) * 2,
            2.5 + Math.sin(i * 1.57) * 0.5,
            Math.sin(i * 1.57) * 2
          ]}
        >
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};
