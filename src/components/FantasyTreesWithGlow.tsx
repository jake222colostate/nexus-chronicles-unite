
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LushMagicalTree: React.FC<{ 
  position: [number, number, number]; 
  scale: number;
  treeType: 'large' | 'medium' | 'small';
}> = ({ position, scale, treeType }) => {
  const foliageRef = useRef<THREE.Mesh>(null);
  
  // Gentle swaying animation
  useFrame((state) => {
    if (foliageRef.current) {
      const time = state.clock.elapsedTime;
      foliageRef.current.rotation.z = Math.sin(time * 0.5) * 0.05;
    }
  });

  const getTreeSize = () => {
    switch (treeType) {
      case 'large':
        return { trunkHeight: 2.5, trunkRadius: 0.3, foliageRadius: 2.2, foliageY: 3.5 };
      case 'medium':
        return { trunkHeight: 1.8, trunkRadius: 0.25, foliageRadius: 1.8, foliageY: 2.7 };
      case 'small':
        return { trunkHeight: 1.2, trunkRadius: 0.2, foliageRadius: 1.4, foliageY: 2.0 };
      default:
        return { trunkHeight: 2.0, trunkRadius: 0.25, foliageRadius: 1.8, foliageY: 3.0 };
    }
  };

  const { trunkHeight, trunkRadius, foliageRadius, foliageY } = getTreeSize();

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Tree trunk - brown and textured */}
      <mesh position={[0, trunkHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[trunkRadius * 0.8, trunkRadius, trunkHeight, 8]} />
        <meshStandardMaterial 
          color="#5D4037"
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
      
      {/* Main lush green foliage - very rounded like in reference */}
      <mesh ref={foliageRef} position={[0, foliageY, 0]} castShadow>
        <sphereGeometry args={[foliageRadius, 12, 8]} />
        <meshStandardMaterial 
          color="#228B22"
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>
      
      {/* Additional foliage layers for lushness */}
      <mesh position={[foliageRadius * 0.3, foliageY + 0.3, foliageRadius * 0.2]} castShadow>
        <sphereGeometry args={[foliageRadius * 0.6, 8, 6]} />
        <meshStandardMaterial 
          color="#32CD32"
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>
      
      <mesh position={[-foliageRadius * 0.2, foliageY - 0.2, foliageRadius * 0.3]} castShadow>
        <sphereGeometry args={[foliageRadius * 0.5, 8, 6]} />
        <meshStandardMaterial 
          color="#228B22"
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>

      {/* Subtle green glow around the tree */}
      <pointLight 
        position={[0, foliageY, 0]}
        color="#90EE90"
        intensity={0.1}
        distance={foliageRadius * 3}
      />
    </group>
  );
};

export const FantasyTreesWithGlow: React.FC = () => {
  const trees = [];
  
  // Generate lush trees on both sides of the path like in reference
  for (let i = 0; i < 25; i++) {
    const z = -i * 6 - 5;
    
    // Left side trees
    const leftX = -4 - Math.random() * 6;
    const leftScale = 0.8 + Math.random() * 0.6;
    const leftType = Math.random() > 0.7 ? 'large' : Math.random() > 0.4 ? 'medium' : 'small';
    
    trees.push(
      <LushMagicalTree
        key={`left_${i}`}
        position={[leftX, 0, z]}
        scale={leftScale}
        treeType={leftType as 'large' | 'medium' | 'small'}
      />
    );
    
    // Right side trees
    const rightX = 4 + Math.random() * 6;
    const rightScale = 0.8 + Math.random() * 0.6;
    const rightType = Math.random() > 0.7 ? 'large' : Math.random() > 0.4 ? 'medium' : 'small';
    
    trees.push(
      <LushMagicalTree
        key={`right_${i}`}
        position={[rightX, 0, z]}
        scale={rightScale}
        treeType={rightType as 'large' | 'medium' | 'small'}
      />
    );
    
    // Additional background trees for depth
    if (i % 2 === 0) {
      const bgLeftX = -8 - Math.random() * 8;
      const bgRightX = 8 + Math.random() * 8;
      const bgScale = 0.6 + Math.random() * 0.4;
      
      trees.push(
        <LushMagicalTree
          key={`bg_left_${i}`}
          position={[bgLeftX, 0, z - 5]}
          scale={bgScale}
          treeType="small"
        />
      );
      
      trees.push(
        <LushMagicalTree
          key={`bg_right_${i}`}
          position={[bgRightX, 0, z - 5]}
          scale={bgScale}
          treeType="small"
        />
      );
    }
  }
  
  return <>{trees}</>;
};
