
import React, { useMemo } from 'react';
import * as THREE from 'three';

const FantasyTree: React.FC<{ 
  position: [number, number, number]; 
  scale: number;
}> = ({ position, scale }) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Tree trunk - brown */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
        <meshStandardMaterial 
          color="#4a2c2a"
          roughness={0.9}
        />
      </mesh>
      
      {/* Tree foliage - bright green round shape like reference */}
      <mesh position={[0, 4, 0]} castShadow>
        <sphereGeometry args={[2.2, 12, 8]} />
        <meshStandardMaterial 
          color="#4CAF50"
          roughness={0.7}
        />
      </mesh>
      
      {/* Additional foliage layers for fuller look */}
      <mesh position={[0.5, 3.5, 0.3]} castShadow>
        <sphereGeometry args={[1.8, 10, 6]} />
        <meshStandardMaterial 
          color="#66BB6A"
          roughness={0.7}
        />
      </mesh>
      
      <mesh position={[-0.3, 3.8, -0.2]} castShadow>
        <sphereGeometry args={[1.6, 8, 6]} />
        <meshStandardMaterial 
          color="#81C784"
          roughness={0.7}
        />
      </mesh>
    </group>
  );
};

const SteppingStone: React.FC<{ 
  position: [number, number, number]; 
  rotation: number;
  scale: number;
}> = ({ position, rotation, scale }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={[scale, 1, scale]}>
      {/* Main stepping stone - brown/orange like reference */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[1.5, 1.6, 0.3, 8]} />
        <meshStandardMaterial 
          color="#D2691E"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Stone edge detail */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <cylinderGeometry args={[1.7, 1.8, 0.2, 8]} />
        <meshStandardMaterial 
          color="#8B4513"
          roughness={0.9}
        />
      </mesh>
    </group>
  );
};

export const FantasyGround: React.FC = () => {
  // Generate the winding stone path exactly like reference
  const steppingStones = useMemo(() => {
    const stones = [];
    for (let i = 0; i < 80; i++) {
      const z = -i * 2.5;
      // Create the winding pattern from the reference
      const curve = Math.sin(i * 0.08) * 1.2;
      const x = curve;
      const y = -0.9;
      const rotation = (Math.random() - 0.5) * 0.4;
      const scale = 0.9 + Math.random() * 0.2;
      
      stones.push(
        <SteppingStone
          key={`stone-${i}`}
          position={[x, y, z]}
          rotation={rotation}
          scale={scale}
        />
      );
    }
    return stones;
  }, []);

  // Generate trees on both sides exactly like reference
  const trees = useMemo(() => {
    const treeList = [];
    for (let i = 0; i < 25; i++) {
      const z = -i * 8 - 5;
      
      // Left side trees
      const leftX = -8 - Math.random() * 6;
      const leftScale = 0.8 + Math.random() * 0.4;
      treeList.push(
        <FantasyTree
          key={`tree-left-${i}`}
          position={[leftX, -1, z]}
          scale={leftScale}
        />
      );
      
      // Right side trees
      const rightX = 8 + Math.random() * 6;
      const rightScale = 0.8 + Math.random() * 0.4;
      treeList.push(
        <FantasyTree
          key={`tree-right-${i}`}
          position={[rightX, -1, z]}
          scale={rightScale}
        />
      );
      
      // Additional background trees for depth
      if (i % 2 === 0) {
        const backLeftX = -15 - Math.random() * 8;
        const backRightX = 15 + Math.random() * 8;
        const backScale = 0.6 + Math.random() * 0.3;
        
        treeList.push(
          <FantasyTree
            key={`tree-back-left-${i}`}
            position={[backLeftX, -1, z - 5]}
            scale={backScale}
          />
        );
        
        treeList.push(
          <FantasyTree
            key={`tree-back-right-${i}`}
            position={[backRightX, -1, z - 5]}
            scale={backScale}
          />
        );
      }
    }
    return treeList;
  }, []);

  // Ground plane with grass texture
  const groundPlane = useMemo(() => {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, -100]} receiveShadow>
        <planeGeometry args={[200, 400]} />
        <meshStandardMaterial 
          color="#2E7D32"
          roughness={0.8}
        />
      </mesh>
    );
  }, []);

  return (
    <group>
      {/* Ground plane */}
      {groundPlane}
      
      {/* Trees on both sides */}
      {trees}
      
      {/* Winding stepping stone path */}
      {steppingStones}
    </group>
  );
};
