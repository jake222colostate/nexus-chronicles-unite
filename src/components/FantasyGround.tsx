import React, { useMemo } from 'react';
import * as THREE from 'three';

const StoneTile: React.FC<{ 
  position: [number, number, number]; 
  rotation: number;
  scale: number;
}> = ({ position, rotation, scale }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={[scale, 1, scale]}>
      {/* Main stone tile */}
      <mesh receiveShadow>
        <boxGeometry args={[2, 0.3, 3]} />
        <meshStandardMaterial 
          color="#b76e35"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Purple glowing moss underneath */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[2.2, 0.1, 3.2]} />
        <meshStandardMaterial 
          color="#9966cc"
          emissive="#6633aa"
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
};

export const FantasyGround: React.FC = () => {
  // Generate stone pathway tiles
  const pathTiles = useMemo(() => {
    const tiles = [];
    for (let i = 0; i < 100; i++) {
      const z = -i * 4; // Space tiles along the path
      const x = Math.sin(i * 0.1) * 1; // Slight curve to the path
      const y = Math.sin(i * 0.05) * 0.2; // Gentle elevation changes
      const rotation = (Math.random() - 0.5) * 0.3; // Random rotation
      const scale = 0.9 + Math.random() * 0.2; // Slight size variation
      
      tiles.push(
        <StoneTile
          key={i}
          position={[x, y - 1, z]}
          rotation={rotation}
          scale={scale}
        />
      );
    }
    return tiles;
  }, []);

  // Ground terrain with undulations
  const terrainChunks = useMemo(() => {
    const chunks = [];
    for (let x = -5; x <= 5; x++) {
      for (let z = -20; z <= 5; z++) {
        const worldX = x * 20;
        const worldZ = z * 20;
        const height = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2;
        
        chunks.push(
          <mesh 
            key={`terrain_${x}_${z}`}
            position={[worldX, height - 2, worldZ]} 
            receiveShadow
          >
            <planeGeometry args={[20, 20, 8, 8]} />
            <meshStandardMaterial 
              color="#228b22"
              roughness={0.9}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      }
    }
    return chunks;
  }, []);

  return (
    <group>
      {/* Terrain base */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {terrainChunks}
      </group>
      
      {/* Stone pathway */}
      {pathTiles}
      
      {/* Floating fairy dust particles */}
      {Array.from({ length: 50 }, (_, i) => (
        <mesh 
          key={`particle_${i}`}
          position={[
            (Math.random() - 0.5) * 100,
            Math.random() * 3 + 0.5,
            -Math.random() * 200
          ]}
        >
          <sphereGeometry args={[0.05, 6, 4]} />
          <meshStandardMaterial 
            color={Math.random() > 0.5 ? "#00ffff" : "#ffffff"}
            emissive={Math.random() > 0.5 ? "#00ffff" : "#ffffff"}
            emissiveIntensity={0.8}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
};
