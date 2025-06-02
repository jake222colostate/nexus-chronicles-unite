
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ChunkData } from './ChunkSystem';

interface CartoonMagicalCrystalsProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const CartoonMagicalCrystals: React.FC<CartoonMagicalCrystalsProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // Generate crystal positions
  const crystalPositions = useMemo(() => {
    const positions = [];
    
    chunks.forEach(chunk => {
      // Add 2-3 crystals per chunk
      const crystalCount = 2 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < crystalCount; i++) {
        positions.push({
          id: `crystal_${chunk.id}_${i}`,
          x: chunk.worldX + (Math.random() - 0.5) * chunkSize * 0.8,
          y: 2 + Math.random() * 3,
          z: chunk.worldZ + (Math.random() - 0.5) * chunkSize * 0.8,
          color: ['#FF69B4', '#87CEEB', '#DDA0DD', '#98FB98'][Math.floor(Math.random() * 4)],
          scale: 0.5 + Math.random() * 0.5,
          rotationSpeed: 0.005 + Math.random() * 0.01
        });
      }
    });
    
    return positions;
  }, [chunks, chunkSize]);

  return (
    <group>
      {crystalPositions.map(crystal => (
        <FloatingCrystal key={crystal.id} {...crystal} />
      ))}
    </group>
  );
};

const FloatingCrystal: React.FC<{
  x: number;
  y: number;
  z: number;
  color: string;
  scale: number;
  rotationSpeed: number;
}> = ({ x, y, z, color, scale, rotationSpeed }) => {
  const crystalRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (crystalRef.current) {
      // Floating animation
      crystalRef.current.position.y = y + Math.sin(state.clock.elapsedTime + x) * 0.3;
      crystalRef.current.rotation.y += rotationSpeed;
    }
    
    if (glowRef.current) {
      // Pulsing glow
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={[x, y, z]}>
      {/* Glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.5 * scale, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
        />
      </mesh>
      
      {/* Main crystal */}
      <mesh ref={crystalRef} scale={[scale, scale, scale]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Point light */}
      <pointLight
        color={color}
        intensity={0.5}
        distance={10}
      />
    </group>
  );
};
