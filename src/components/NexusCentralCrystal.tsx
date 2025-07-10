import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export const NexusCentralCrystal: React.FC = () => {
  const crystalRef = useRef<Mesh>(null);
  const beamRef = useRef<Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (crystalRef.current) {
      crystalRef.current.rotation.y = time * 0.5;
      crystalRef.current.position.y = 4 + Math.sin(time * 2) * 0.1;
    }
    
    if (beamRef.current && beamRef.current.material) {
      const material = beamRef.current.material as any;
      material.opacity = 0.6 + Math.sin(time * 3) * 0.2;
    }
  });

  return (
    <group>
      {/* Central Crystal Platform */}
      <mesh position={[0, 0.5, 0]} receiveShadow>
        <cylinderGeometry args={[3, 3, 1, 8]} />
        <meshStandardMaterial 
          color="#2a2a4e"
          metalness={0.8}
          roughness={0.2}
          emissive="#1a1a3e"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Crystal Base Ring */}
      <mesh position={[0, 1.1, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.8, 0.3, 16]} />
        <meshStandardMaterial 
          color="#60a5fa"
          metalness={0.7}
          roughness={0.1}
          emissive="#3b82f6"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Main Crystal - Brighter */}
      <mesh ref={crystalRef} position={[0, 4, 0]} castShadow>
        <coneGeometry args={[0.8, 4, 6]} />
        <meshStandardMaterial 
          color="#60a5fa"
          transparent
          opacity={0.9}
          emissive="#3b82f6"
          emissiveIntensity={0.6}
          metalness={0.2}
          roughness={0.1}
        />
      </mesh>

      {/* Crystal Top - Bright */}
      <mesh position={[0, 6.5, 0]} castShadow>
        <coneGeometry args={[0.4, 1, 6]} />
        <meshStandardMaterial 
          color="#93c5fd"
          transparent
          opacity={0.95}
          emissive="#60a5fa"
          emissiveIntensity={0.8}
          metalness={0.1}
          roughness={0.05}
        />
      </mesh>

      {/* Bright Energy Beam */}
      <mesh ref={beamRef} position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.1, 0.3, 7]} />
        <meshStandardMaterial 
          color="#93c5fd"
          transparent
          opacity={0.8}
          emissive="#60a5fa"
          emissiveIntensity={1.0}
        />
      </mesh>

      {/* Floating Crystal Shards */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 6) * Math.PI * 2) * 2.5,
            2 + Math.sin((i / 6) * Math.PI * 4) * 0.3,
            Math.sin((i / 6) * Math.PI * 2) * 2.5
          ]}
          rotation={[Math.random(), Math.random(), Math.random()]}
        >
          <octahedronGeometry args={[0.2]} />
          <meshStandardMaterial 
            color="#8b5cf6"
            transparent
            opacity={0.8}
            emissive="#7c3aed"
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}

      {/* Crystal Power Glow */}
      <pointLight 
        position={[0, 4, 0]} 
        intensity={2} 
        color="#6366f1" 
        distance={20}
        decay={2}
      />
    </group>
  );
};