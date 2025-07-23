
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

  // DISABLED FOR PERFORMANCE - Trees removed
  const trees = [];

  // Ground plane with grass texture - simplified for performance
  const groundPlane = useMemo(() => {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, -100]} receiveShadow>
        <planeGeometry args={[200, 400]} />
        <meshBasicMaterial color="#2E7D32" />
      </mesh>
    );
  }, []);

  return (
    <group>
      {/* Ground plane */}
      {groundPlane}
      
      {/* Trees removed for performance */}
      
      {/* Winding stepping stone path */}
      
      {/* Winding stepping stone path */}
      {steppingStones}
    </group>
  );
};
