
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CrystallineMountain: React.FC<{ 
  position: [number, number, number]; 
  scale: number;
  crystalSeed: number;
  mountainType: 'pink' | 'purple' | 'blue';
}> = ({ position, scale, crystalSeed, mountainType }) => {
  const crystalRef = useRef<THREE.Group>(null);
  
  // Gentle pulsing glow for crystals
  useFrame((state) => {
    if (crystalRef.current) {
      const time = state.clock.elapsedTime + crystalSeed;
      crystalRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissiveIntensity = 0.7 + Math.sin(time * 0.8 + index) * 0.3;
        }
      });
    }
  });

  const getMountainColor = () => {
    switch (mountainType) {
      case 'pink':
        return '#FF69B4';
      case 'purple':
        return '#9932CC';
      case 'blue':
        return '#4169E1';
      default:
        return '#FF69B4';
    }
  };

  return (
    <group ref={crystalRef} position={position} scale={[scale, scale, scale]}>
      {/* Main mountain peak - crystalline and angular like in reference */}
      <mesh castShadow>
        <coneGeometry args={[12, 35, 6]} />
        <meshStandardMaterial 
          color={getMountainColor()}
          roughness={0.3}
          metalness={0.4}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Secondary peaks for complex silhouette */}
      <mesh position={[6, 20, 4]} rotation={[0, 0.3, 0.1]} castShadow>
        <coneGeometry args={[8, 25, 5]} />
        <meshStandardMaterial 
          color={getMountainColor()}
          roughness={0.3}
          metalness={0.4}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      <mesh position={[-7, 25, -3]} rotation={[0, -0.2, -0.1]} castShadow>
        <coneGeometry args={[6, 20, 5]} />
        <meshStandardMaterial 
          color={getMountainColor()}
          roughness={0.3}
          metalness={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Large bright cyan crystals like in reference image */}
      <mesh position={[0, 25, 0]} rotation={[0, Math.PI * 0.25, 0]}>
        <octahedronGeometry args={[4, 0]} />
        <meshStandardMaterial 
          color="#00FFFF"
          emissive="#00CCCC"
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      
      <mesh position={[6, 18, 4]} rotation={[0.2, 0.5, 0.1]}>
        <octahedronGeometry args={[3, 0]} />
        <meshStandardMaterial 
          color="#00FFFF"
          emissive="#00CCCC"
          emissiveIntensity={0.7}
          transparent
          opacity={0.9}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      
      <mesh position={[-4, 22, -2]} rotation={[-0.1, -0.3, 0]}>
        <octahedronGeometry args={[2.5, 0]} />
        <meshStandardMaterial 
          color="#00FFFF"
          emissive="#00CCCC"
          emissiveIntensity={0.9}
          transparent
          opacity={0.9}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Additional smaller crystals scattered on the mountain */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 15,
            10 + Math.random() * 15,
            (Math.random() - 0.5) * 10
          ]}
          rotation={[
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          ]}
        >
          <octahedronGeometry args={[0.8 + Math.random() * 1.2, 0]} />
          <meshStandardMaterial 
            color="#00FFFF"
            emissive="#00CCCC"
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      ))}

      {/* Bright point lights for crystal glow */}
      <pointLight 
        position={[0, 25, 0]}
        color="#00FFFF"
        intensity={1.2}
        distance={40}
      />
      <pointLight 
        position={[6, 18, 4]}
        color="#00FFFF"
        intensity={0.8}
        distance={30}
      />
      <pointLight 
        position={[-4, 22, -2]}
        color="#00FFFF"
        intensity={0.6}
        distance={25}
      />
    </group>
  );
};

export const FantasyMagicalMountains: React.FC = () => {
  return (
    <group>
      {/* Left side mountain range - mixed colors like in reference */}
      <CrystallineMountain position={[-80, 0, -150]} scale={1.8} crystalSeed={1} mountainType="pink" />
      <CrystallineMountain position={[-50, 0, -120]} scale={1.4} crystalSeed={2} mountainType="purple" />
      <CrystallineMountain position={[-110, 0, -180]} scale={2.2} crystalSeed={3} mountainType="blue" />
      <CrystallineMountain position={[-30, 0, -100]} scale={1.0} crystalSeed={4} mountainType="pink" />
      
      {/* Right side mountain range */}
      <CrystallineMountain position={[80, 0, -150]} scale={1.6} crystalSeed={5} mountainType="purple" />
      <CrystallineMountain position={[50, 0, -120]} scale={1.3} crystalSeed={6} mountainType="pink" />
      <CrystallineMountain position={[110, 0, -180]} scale={2.0} crystalSeed={7} mountainType="blue" />
      <CrystallineMountain position={[30, 0, -100]} scale={1.1} crystalSeed={8} mountainType="purple" />
      
      {/* Background distant mountains */}
      <CrystallineMountain position={[0, 0, -250]} scale={2.8} crystalSeed={9} mountainType="blue" />
      <CrystallineMountain position={[-150, 0, -220]} scale={2.4} crystalSeed={10} mountainType="pink" />
      <CrystallineMountain position={[150, 0, -220]} scale={2.6} crystalSeed={11} mountainType="purple" />
      
      {/* Additional foreground smaller peaks */}
      <CrystallineMountain position={[-25, 0, -80]} scale={0.8} crystalSeed={12} mountainType="purple" />
      <CrystallineMountain position={[25, 0, -80]} scale={0.9} crystalSeed={13} mountainType="pink" />
    </group>
  );
};
