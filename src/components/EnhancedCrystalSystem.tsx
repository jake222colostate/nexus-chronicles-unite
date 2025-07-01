import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EnhancedCrystalSystemProps {
  maxUpgradeHeight?: number;
  realm: 'fantasy' | 'scifi';
}

const CrystalFormation: React.FC<{ 
  position: [number, number, number]; 
  scale: number;
  hue: number;
  timeOffset: number;
}> = ({ position, scale, hue, timeOffset }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime + timeOffset;
      
      // Dynamic color shifting over time
      const shiftedHue = (hue + time * 0.1) % 1;
      
      // Gentle floating animation
      groupRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.3;
      
      // Update crystal colors
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshLambertMaterial) {
          const newColor = new THREE.Color().setHSL(shiftedHue, 0.8, 0.6);
          child.material.color = newColor;
          child.material.emissive = new THREE.Color().setHSL(shiftedHue, 0.9, 0.3);
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Main crystal tower */}
      <mesh position={[0, 0, 0]} castShadow>
        <octahedronGeometry args={[1.5, 0]} />
        <meshLambertMaterial 
          color={new THREE.Color().setHSL(hue, 0.8, 0.6)}
          emissive={new THREE.Color().setHSL(hue, 0.9, 0.3)}
          emissiveIntensity={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>
      
      {/* Smaller floating crystals around the main one */}
      {Array.from({ length: 3 }, (_, i) => (
        <mesh 
          key={i}
          position={[
            Math.cos(i * 2.1) * 2,
            Math.sin(i * 1.3) * 1.5 + 2,
            Math.sin(i * 2.1) * 2
          ]}
          rotation={[0, i * Math.PI * 0.6, 0]}
          castShadow
        >
          <tetrahedronGeometry args={[0.8, 0]} />
          <meshLambertMaterial 
            color={new THREE.Color().setHSL((hue + i * 0.1) % 1, 0.8, 0.7)}
            emissive={new THREE.Color().setHSL((hue + i * 0.1) % 1, 0.9, 0.2)}
            emissiveIntensity={0.6}
            transparent
            opacity={0.75}
          />
        </mesh>
      ))}
      
      {/* Point light for crystal glow */}
      <pointLight 
        position={[0, 2, 0]}
        color={new THREE.Color().setHSL(hue, 1, 0.5)}
        intensity={1.2}
        distance={12}
      />
    </group>
  );
};

export const EnhancedCrystalSystem: React.FC<EnhancedCrystalSystemProps> = ({
  maxUpgradeHeight = 50,
  realm
}) => {
  const crystalFormations = useMemo(() => {
    const formations = [];
    const numLevels = Math.ceil(maxUpgradeHeight / 10);
    
    for (let level = 0; level < numLevels; level++) {
      const y = level * 12;
      const numCrystalsAtLevel = Math.max(3, 6 - level);
      
      for (let i = 0; i < numCrystalsAtLevel; i++) {
        const angle = (i / numCrystalsAtLevel) * Math.PI * 2;
        const radius = 25 + level * 5; // Crystals get further out as they go up
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Color based on realm and height
        const baseHue = realm === 'fantasy' ? 0.7 : 0.55; // Purple for fantasy, cyan for scifi
        const hue = (baseHue + level * 0.05 + i * 0.02) % 1;
        
        formations.push({
          id: `crystal-${level}-${i}`,
          position: [x, y, z] as [number, number, number],
          scale: 1.0 + level * 0.2,
          hue,
          timeOffset: i * 0.5 + level * 1.2
        });
      }
    }
    
    return formations;
  }, [maxUpgradeHeight, realm]);

  return (
    <group>
      {crystalFormations.map((formation) => (
        <CrystalFormation
          key={formation.id}
          position={formation.position}
          scale={formation.scale}
          hue={formation.hue}
          timeOffset={formation.timeOffset}
        />
      ))}
    </group>
  );
};