
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GlowTree: React.FC<{ position: [number, number, number]; scale: number }> = ({ position, scale }) => {
  const treeRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (treeRef.current) {
      const time = state.clock.elapsedTime;
      treeRef.current.rotation.y = Math.sin(time * 0.2) * 0.05;
    }
  });

  return (
    <group ref={treeRef} position={position} scale={[scale, scale, scale]}>
      {/* Tree trunk */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 2]} />
        <meshStandardMaterial 
          color="#4a2c2a"
          roughness={0.8}
        />
      </mesh>
      
      {/* Tree foliage layers */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <coneGeometry args={[2.5, 3, 8]} />
        <meshStandardMaterial 
          color="#1c471f"
          emissive="#0a2a0c"
          emissiveIntensity={0.3}
          roughness={0.6}
        />
      </mesh>
      
      <mesh position={[0, 3.2, 0]} castShadow>
        <coneGeometry args={[2, 2.5, 8]} />
        <meshStandardMaterial 
          color="#256d29"
          emissive="#0f3f12"
          emissiveIntensity={0.4}
          roughness={0.5}
        />
      </mesh>
      
      <mesh position={[0, 3.8, 0]} castShadow>
        <coneGeometry args={[1.5, 2, 8]} />
        <meshStandardMaterial 
          color="#2d8a32"
          emissive="#1a5c1e"
          emissiveIntensity={0.5}
          roughness={0.4}
        />
      </mesh>
      
      {/* Magical glow effect */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial 
          color="#64ffaa"
          transparent
          opacity={0.1}
        />
      </mesh>
      
      {/* Point light for glow */}
      <pointLight 
        position={[0, 3, 0]}
        color="#64ffaa"
        intensity={0.3}
        distance={8}
      />
    </group>
  );
};

export const GradientGlowTrees: React.FC = () => {
  const trees = [];
  
  for (let i = 0; i < 30; i++) {
    const x = (Math.random() - 0.5) * 80;
    const z = -Math.random() * 150 - 10;
    const scale = 0.7 + Math.random() * 0.6;
    
    // Avoid placing trees on the path
    if (Math.abs(x) > 6) {
      trees.push(
        <GlowTree 
          key={i}
          position={[x, 0, z]}
          scale={scale}
        />
      );
    }
  }
  
  return <>{trees}</>;
};
