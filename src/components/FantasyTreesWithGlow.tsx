import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MagicalTree: React.FC<{ 
  position: [number, number, number]; 
  scale: number;
  hasOrbs?: boolean;
}> = ({ position, scale, hasOrbs = false }) => {
  const orbRef = useRef<THREE.Group>(null);
  
  // Animate orbiting light particles
  useFrame((state) => {
    if (orbRef.current && hasOrbs) {
      const time = state.clock.elapsedTime * 0.5;
      orbRef.current.rotation.y = time;
      orbRef.current.children.forEach((child, index) => {
        const offset = (index / orbRef.current!.children.length) * Math.PI * 2;
        const radius = 2.5;
        child.position.x = Math.cos(time + offset) * radius;
        child.position.z = Math.sin(time + offset) * radius;
        child.position.y = 4 + Math.sin(time * 2 + offset) * 0.5;
      });
    }
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Tree trunk - short and thick */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.5, 1.5]} />
        <meshStandardMaterial color="#5e382e" roughness={0.9} />
      </mesh>
      
      {/* Puffy spherical canopy with slight deformation */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <sphereGeometry args={[1.8, 12, 8]} />
        <meshStandardMaterial 
          color="#32cd32"
          emissive="#20b2aa"
          emissiveIntensity={0.1}
          roughness={0.6}
        />
      </mesh>
      
      {/* Cyan glow around canopy edges */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[2.1, 16, 12]} />
        <meshBasicMaterial 
          color="#00ffff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Orbiting light particles for special trees */}
      {hasOrbs && (
        <group ref={orbRef} position={[0, 2.2, 0]}>
          {Array.from({ length: 3 }, (_, i) => (
            <mesh key={i} position={[2.5, 0, 0]}>
              <sphereGeometry args={[0.1, 8, 6]} />
              <meshStandardMaterial 
                color="#ffff00"
                emissive="#ffff00"
                emissiveIntensity={1}
              />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Soft point light for tree glow */}
      <pointLight 
        position={[0, 2.5, 0]}
        color="#20b2aa"
        intensity={0.3}
        distance={8}
      />
    </group>
  );
};

export const FantasyTreesWithGlow: React.FC = () => {
  const trees = [];
  
  // Generate trees along both sides of the road
  for (let i = 0; i < 40; i++) {
    const z = -i * 12 - 20; // Spread along the path
    const side = i % 2 === 0 ? 1 : -1; // Alternate sides
    const x = side * (8 + Math.random() * 6); // Distance from road center
    const scale = 0.8 + Math.random() * 0.4;
    const hasOrbs = i % 5 === 0; // Every 5th tree has orbs
    
    trees.push(
      <MagicalTree
        key={i}
        position={[x, 0, z]}
        scale={scale}
        hasOrbs={hasOrbs}
      />
    );
    
    // Add background trees for depth
    if (i % 3 === 0) {
      trees.push(
        <MagicalTree
          key={`bg_${i}`}
          position={[side * (15 + Math.random() * 10), 0, z - 10]}
          scale={scale * 0.7}
          hasOrbs={false}
        />
      );
    }
  }
  
  return <>{trees}</>;
};
