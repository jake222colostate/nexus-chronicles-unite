import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group, Color } from 'three';
import * as THREE from 'three';

interface ScifiUpgradeOrbProps {
  position: Vector3;
  id: string;
  onClick: (id: string) => void;
}

export const ScifiUpgradeOrb: React.FC<ScifiUpgradeOrbProps> = ({
  position,
  id,
  onClick
}) => {
  const group = useRef<Group>(null);
  const orbRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  // Enhanced color palette with cyber/neon colors
  const orbData = useMemo(() => {
    const colors = [
      { primary: '#00FFFF', secondary: '#0088FF', glow: '#00DDDD' }, // Cyan
      { primary: '#FF0080', secondary: '#AA0055', glow: '#FF00AA' }, // Hot Pink
      { primary: '#00FF80', secondary: '#00AA55', glow: '#00DD66' }, // Neon Green
      { primary: '#8000FF', secondary: '#5500AA', glow: '#AA00FF' }, // Purple
      { primary: '#FFD700', secondary: '#FFAA00', glow: '#FFCC00' }, // Gold
    ];
    const colorSet = colors[Math.floor(Math.random() * colors.length)];
    const scale = 0.4 + Math.random() * 0.3;
    const speed = 0.5 + Math.random() * 0.5;
    return { ...colorSet, scale, speed };
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (group.current) {
      // Advanced floating pattern
      group.current.position.copy(position);
      group.current.position.y += 
        Math.sin(time * orbData.speed + position.x) * 0.15 +
        Math.cos(time * orbData.speed * 0.7 + position.z) * 0.1;
    }
    
    if (orbRef.current) {
      // Complex rotation with multiple axes
      orbRef.current.rotation.x = time * 0.8;
      orbRef.current.rotation.y = time * 1.2;
      orbRef.current.rotation.z = Math.sin(time * 0.5) * 0.3;
      
      // Pulsing scale effect
      const pulseScale = 1 + Math.sin(time * 3) * 0.1;
      orbRef.current.scale.setScalar(orbData.scale * pulseScale);
    }
    
    if (ringRef.current) {
      // Counter-rotating outer ring
      ringRef.current.rotation.z = -time * 2;
      const ringPulse = 1 + Math.sin(time * 4) * 0.2;
      ringRef.current.scale.setScalar(orbData.scale * ringPulse);
    }
    
    if (particlesRef.current) {
      // Orbiting particles
      particlesRef.current.children.forEach((particle, i) => {
        const angle = time * 2 + (i * Math.PI * 2) / 6;
        const radius = 1.5 + Math.sin(time * 3 + i) * 0.3;
        particle.position.x = Math.cos(angle) * radius;
        particle.position.z = Math.sin(angle) * radius;
        particle.position.y = Math.sin(time * 2 + i) * 0.5;
        particle.rotation.x = time + i;
        particle.rotation.y = time * 1.5 + i;
      });
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick(id);
  };

  return (
    <group ref={group} position={position}>
      {/* Main core orb with advanced materials */}
      <mesh ref={orbRef} onClick={handleClick}>
        <icosahedronGeometry args={[1, 1]} />
        <meshPhysicalMaterial 
          color={orbData.primary}
          emissive={orbData.primary}
          emissiveIntensity={0.4}
          transparent
          opacity={0.9}
          roughness={0.1}
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Inner energy core */}
      <mesh scale={0.6}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial 
          color={orbData.glow}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Rotating outer ring with segments */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.1, 8, 32]} />
        <meshStandardMaterial 
          color={orbData.secondary}
          emissive={orbData.secondary}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Secondary ring at different angle */}
      <mesh rotation={[0, Math.PI / 4, Math.PI / 3]} scale={1.2}>
        <torusGeometry args={[1.8, 0.05, 6, 24]} />
        <meshBasicMaterial 
          color={orbData.glow}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Orbiting energy particles */}
      <group ref={particlesRef}>
        {[...Array(6)].map((_, i) => (
          <mesh key={i} scale={0.08}>
            <octahedronGeometry args={[1, 0]} />
            <meshBasicMaterial 
              color={orbData.glow}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>
      
      {/* Energy field effect */}
      <mesh scale={3}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial 
          color={orbData.primary}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Point light for dynamic lighting */}
      <pointLight 
        color={orbData.glow}
        intensity={0.5}
        distance={8}
        decay={2}
      />
    </group>
  );
};