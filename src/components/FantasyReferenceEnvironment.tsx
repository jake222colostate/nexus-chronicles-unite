
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import { FantasyMagicalMountains } from './FantasyMagicalMountains';
import { FantasyGround } from './FantasyGround';
import { EnhancedPathwaySystem } from './EnhancedPathwaySystem';
import { FantasyDuskSkybox } from './FantasyDuskSkybox';
import * as THREE from 'three';

interface FantasyReferenceEnvironmentProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
  playerPosition?: THREE.Vector3;
}

export const FantasyReferenceEnvironment: React.FC<FantasyReferenceEnvironmentProps> = ({
  chunks,
  chunkSize,
  realm,
  playerPosition = new THREE.Vector3(0, 0, 0)
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  // Generate floating crystal positions
  const floatingCrystals = useMemo(() => {
    const crystals = [];
    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * 120;
      const y = 8 + Math.random() * 15;
      const z = -Math.random() * 200;
      const scale = 0.3 + Math.random() * 0.7;
      
      crystals.push(
        <group key={`floating-crystal-${i}`} position={[x, y, z]}>
          <mesh>
            <octahedronGeometry args={[scale, 0]} />
            <meshStandardMaterial 
              color="#00FFFF"
              emissive="#00CCCC"
              emissiveIntensity={1.2}
              transparent
              opacity={0.9}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
          <pointLight 
            position={[0, 0, 0]}
            color="#00FFFF"
            intensity={0.8}
            distance={15}
          />
        </group>
      );
    }
    return crystals;
  }, []);

  // Generate stone archway at the end of the path
  const stoneArchway = useMemo(() => {
    return (
      <group position={[0, 0, -100]}>
        {/* Main archway structure */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[12, 15, 3]} />
          <meshStandardMaterial 
            color="#6B6B6B"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
        {/* Arch opening */}
        <mesh position={[0, -2, 0]}>
          <ringGeometry args={[0, 4, 16]} />
          <meshStandardMaterial 
            color="#4A4A4A"
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Decorative elements */}
        <mesh position={[0, 6, 1.6]} castShadow>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial 
            color="#8B8B8B"
            roughness={0.8}
          />
        </mesh>
      </group>
    );
  }, []);

  return (
    <group>
      {/* Magical dusk skybox exactly like reference */}
      <FantasyDuskSkybox />
      
      {/* Ground with grass and stepping stones */}
      <FantasyGround />
      
      {/* Enhanced stone pathway down the center */}
      <EnhancedPathwaySystem chunks={chunks} chunkSize={chunkSize} />
      
      {/* Magical crystalline mountains in background */}
      <FantasyMagicalMountains />
      
      {/* Floating cyan crystals scattered throughout */}
      {floatingCrystals}
      
      {/* Stone archway at the end of the path */}
      {stoneArchway}
      
      {/* Specialized lighting for dusk atmosphere */}
      <directionalLight
        position={[10, 20, 10]}
        color={new THREE.Color(0.6, 0.4, 0.8)}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      
      <ambientLight 
        color={new THREE.Color(0.2, 0.1, 0.3)}
        intensity={0.4}
      />
      
      {/* Magical particle effects */}
      {Array.from({ length: 60 }, (_, i) => (
        <mesh 
          key={`particle-${i}`}
          position={[
            (Math.random() - 0.5) * 80,
            Math.random() * 25 + 2,
            -Math.random() * 180
          ]}
        >
          <sphereGeometry args={[0.02, 4, 3]} />
          <meshStandardMaterial 
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={1.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};
