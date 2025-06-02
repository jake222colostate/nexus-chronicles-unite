
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CrystalMountain: React.FC<{ 
  position: [number, number, number]; 
  scale: number;
  crystalSeed: number;
}> = ({ position, scale, crystalSeed }) => {
  const crystalRef = useRef<THREE.Group>(null);
  
  // Gentle pulsing animation for crystals
  useFrame((state) => {
    if (crystalRef.current) {
      const time = state.clock.elapsedTime + crystalSeed;
      crystalRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissiveIntensity = 0.5 + Math.sin(time * 0.5 + index) * 0.3;
        }
      });
    }
  });

  return (
    <group ref={crystalRef} position={position} scale={[scale, scale, scale]}>
      {/* Jagged mountain base - low poly spires */}
      <mesh castShadow>
        <coneGeometry args={[8, 25, 5]} />
        <meshStandardMaterial 
          color="#502d82"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Additional jagged spires */}
      <mesh position={[3, 15, 2]} rotation={[0, 0.5, 0.2]} castShadow>
        <coneGeometry args={[4, 15, 4]} />
        <meshStandardMaterial color="#502d82" roughness={0.8} />
      </mesh>
      
      <mesh position={[-4, 18, -1]} rotation={[0, -0.3, -0.1]} castShadow>
        <coneGeometry args={[3, 12, 4]} />
        <meshStandardMaterial color="#502d82" roughness={0.8} />
      </mesh>

      {/* Large glowing cyan crystals */}
      <mesh position={[0, 20, 0]} rotation={[0, Math.PI * 0.25, 0]}>
        <octahedronGeometry args={[3, 0]} />
        <meshStandardMaterial 
          color="#00ffff"
          emissive="#00cccc"
          emissiveIntensity={0.6}
          transparent
          opacity={0.9}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      
      <mesh position={[4, 12, 3]} rotation={[0.2, 0, 0.1]}>
        <octahedronGeometry args={[2, 0]} />
        <meshStandardMaterial 
          color="#00ffff"
          emissive="#00cccc"
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      
      <mesh position={[-3, 16, -2]} rotation={[-0.1, 0.5, 0]}>
        <octahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial 
          color="#00ffff"
          emissive="#00cccc"
          emissiveIntensity={0.7}
          transparent
          opacity={0.9}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Point lights for crystal glow */}
      <pointLight 
        position={[0, 20, 0]}
        color="#00ffff"
        intensity={0.8}
        distance={25}
      />
      <pointLight 
        position={[4, 12, 3]}
        color="#00ffff"
        intensity={0.6}
        distance={20}
      />
    </group>
  );
};

export const FantasyMagicalMountains: React.FC = () => {
  return (
    <group>
      {/* Left side mountain range */}
      <CrystalMountain position={[-60, 0, -120]} scale={1.5} crystalSeed={1} />
      <CrystalMountain position={[-30, 0, -100]} scale={1.2} crystalSeed={2} />
      <CrystalMountain position={[-80, 0, -140]} scale={1.8} crystalSeed={3} />
      
      {/* Right side mountain range */}
      <CrystalMountain position={[60, 0, -120]} scale={1.4} crystalSeed={4} />
      <CrystalMountain position={[30, 0, -100]} scale={1.3} crystalSeed={5} />
      <CrystalMountain position={[80, 0, -140]} scale={1.6} crystalSeed={6} />
      
      {/* Background distant mountains */}
      <CrystalMountain position={[0, 0, -200]} scale={2.2} crystalSeed={7} />
      <CrystalMountain position={[-100, 0, -180]} scale={1.9} crystalSeed={8} />
      <CrystalMountain position={[100, 0, -180]} scale={2.0} crystalSeed={9} />
    </group>
  );
};
