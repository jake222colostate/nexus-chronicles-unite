
import React from 'react';
import * as THREE from 'three';

const CrystalMountain: React.FC<{ 
  position: [number, number, number]; 
  scale: number;
  hue: number;
}> = ({ position, scale, hue }) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Main mountain base */}
      <mesh position={[0, 0, 0]} castShadow>
        <coneGeometry args={[6, 12, 6]} />
        <meshStandardMaterial 
          color={new THREE.Color().setHSL(hue, 0.6, 0.3)}
          emissive={new THREE.Color().setHSL(hue, 0.8, 0.1)}
          emissiveIntensity={0.2}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      
      {/* Crystal peaks */}
      {Array.from({ length: 3 }, (_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 4,
            8 + Math.random() * 4,
            (Math.random() - 0.5) * 4
          ]}
          rotation={[0, Math.random() * Math.PI * 2, 0]}
          castShadow
        >
          <octahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial 
            color="#4fd3ff"
            emissive="#1fa8d4"
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      ))}
      
      {/* Mountain glow */}
      <pointLight 
        position={[0, 8, 0]}
        color={new THREE.Color().setHSL(hue, 1, 0.5)}
        intensity={0.4}
        distance={20}
      />
    </group>
  );
};

export const FantasyMountains: React.FC = () => {
  return (
    <group>
      {/* Left side mountains */}
      {Array.from({ length: 4 }, (_, i) => (
        <CrystalMountain 
          key={`left-${i}`}
          position={[-30 - i * 15, 0, -i * 40 - 20]}
          scale={1.2 + i * 0.3}
          hue={0.7 + i * 0.1}
        />
      ))}
      
      {/* Right side mountains */}
      {Array.from({ length: 4 }, (_, i) => (
        <CrystalMountain 
          key={`right-${i}`}
          position={[30 + i * 15, 0, -i * 40 - 20]}
          scale={1.2 + i * 0.3}
          hue={0.8 + i * 0.1}
        />
      ))}
      
      {/* Background mountains */}
      {Array.from({ length: 6 }, (_, i) => (
        <CrystalMountain 
          key={`bg-${i}`}
          position={[
            (Math.random() - 0.5) * 200,
            0,
            -150 - i * 30
          ]}
          scale={2 + Math.random()}
          hue={0.75 + Math.random() * 0.2}
        />
      ))}
    </group>
  );
};
