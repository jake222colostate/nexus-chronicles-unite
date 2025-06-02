
import React, { useMemo } from 'react';
import * as THREE from 'three';

const SteppingStone: React.FC<{ 
  position: [number, number, number]; 
  rotation: number;
  scale: number;
  index: number;
}> = ({ position, rotation, scale, index }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={[scale, 1, scale]}>
      {/* Main stepping stone - brown/orange color like in reference */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[1.2, 1.3, 0.4, 8]} />
        <meshStandardMaterial 
          color="#8B4513"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Stone base - darker */}
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <cylinderGeometry args={[1.4, 1.5, 0.3, 8]} />
        <meshStandardMaterial 
          color="#654321"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
};

const GrassyHill: React.FC<{ 
  position: [number, number, number]; 
  scale: [number, number, number];
}> = ({ position, scale }) => {
  return (
    <mesh position={position} scale={scale} receiveShadow>
      <sphereGeometry args={[1, 12, 8]} />
      <meshStandardMaterial 
        color="#228B22"
        roughness={0.9}
        metalness={0.0}
      />
    </mesh>
  );
};

export const FantasyGround: React.FC = () => {
  // Generate stepping stone pathway - exactly like in reference
  const steppingStones = useMemo(() => {
    const stones = [];
    for (let i = 0; i < 50; i++) {
      const z = -i * 2.5; // Closer spacing
      const x = Math.sin(i * 0.08) * 0.8; // Gentle curve
      const y = Math.sin(i * 0.05) * 0.1; // Slight elevation
      const rotation = (Math.random() - 0.5) * 0.4;
      const scale = 0.9 + Math.random() * 0.3;
      
      stones.push(
        <SteppingStone
          key={i}
          position={[x, y - 0.8, z]}
          rotation={rotation}
          scale={scale}
          index={i}
        />
      );
    }
    return stones;
  }, []);

  // Rolling grassy hills on both sides
  const grassyHills = useMemo(() => {
    const hills = [];
    for (let i = 0; i < 30; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const x = side * (3 + Math.random() * 8);
      const z = -i * 8 - Math.random() * 5;
      const scaleX = 2 + Math.random() * 3;
      const scaleY = 1 + Math.random() * 1.5;
      const scaleZ = 2 + Math.random() * 3;
      
      hills.push(
        <GrassyHill
          key={i}
          position={[x, -1, z]}
          scale={[scaleX, scaleY, scaleZ]}
        />
      );
    }
    return hills;
  }, []);

  // Ground plane with grass texture
  const groundPlane = useMemo(() => {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[200, 400]} />
        <meshStandardMaterial 
          color="#2E8B57"
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>
    );
  }, []);

  // Magical sparkles floating around
  const magicalSparkles = useMemo(() => {
    const sparkles = [];
    for (let i = 0; i < 80; i++) {
      sparkles.push(
        <mesh 
          key={`sparkle_${i}`}
          position={[
            (Math.random() - 0.5) * 60,
            Math.random() * 8 + 0.5,
            -Math.random() * 150
          ]}
        >
          <sphereGeometry args={[0.03, 6, 4]} />
          <meshStandardMaterial 
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
          />
        </mesh>
      );
    }
    return sparkles;
  }, []);

  return (
    <group>
      {/* Ground plane */}
      {groundPlane}
      
      {/* Rolling grassy hills */}
      {grassyHills}
      
      {/* Stepping stone pathway */}
      {steppingStones}
      
      {/* Magical sparkles */}
      {magicalSparkles}
    </group>
  );
};
