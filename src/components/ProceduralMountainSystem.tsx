import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Vector3 } from 'three';
import { assetUrl } from '@/lib/utils';
import { FogChunkData } from './FogBasedChunkSystem';

// Preload the mountains model
useGLTF.preload(assetUrl('assets/environment/Mountains.glb'));

interface ProceduralMountainSystemProps {
  chunks: FogChunkData[];
  playerPosition: Vector3; // Fixed HMR cache issue
  chunkSize: number;
}

interface MountainInstance {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  chunkKey: string;
}

// Mountain Model Component
const MountainModel: React.FC<{ 
  position: [number, number, number]; 
  rotation: [number, number, number]; 
  scale: number 
}> = ({ position, rotation, scale }) => {
  try {
    const { scene } = useGLTF(assetUrl('assets/environment/Mountains.glb'));
    return (
      <primitive 
        object={scene.clone()} 
        position={position}
        rotation={rotation}
        scale={[scale, scale, scale]}
        castShadow 
        receiveShadow 
      />
    );
  } catch (error) {
    console.warn('Failed to load Mountains.glb, using fallback:', error);
    // Fallback mountain geometry
    return (
      <group position={position} rotation={rotation}>
        <mesh castShadow receiveShadow>
          <coneGeometry args={[8 * scale, 12 * scale, 8]} />
          <meshStandardMaterial color="#6B7280" />
        </mesh>
        <mesh position={[4 * scale, 0, 3 * scale]} castShadow receiveShadow>
          <coneGeometry args={[6 * scale, 10 * scale, 6]} />
          <meshStandardMaterial color="#4B5563" />
        </mesh>
        <mesh position={[-3 * scale, 0, -2 * scale]} castShadow receiveShadow>
          <coneGeometry args={[5 * scale, 8 * scale, 6]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
      </group>
    );
  }
};

export const ProceduralMountainSystem: React.FC<ProceduralMountainSystemProps> = ({
  chunks,
  playerPosition,
  chunkSize
}) => {
  // Generate mountains procedurally based on chunks
  const mountains = useMemo(() => {
    const mountainInstances: MountainInstance[] = [];
    
    // Seeded random function for consistent placement
    const seededRandom = (seed: number): number => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    chunks.forEach((chunk) => {
      // Only place mountains on distant chunks for dramatic backdrop
      const distanceFromPlayer = Math.sqrt(
        Math.pow(chunk.worldX - playerPosition.x, 2) + 
        Math.pow(chunk.worldZ - playerPosition.z, 2)
      );
      
      // Mountains appear on chunks 40+ units away from player
      if (distanceFromPlayer < 40) return;
      
      const chunkSeed = chunk.x * 1000 + chunk.z;
      
      // 30% chance for mountains in distant chunks
      if (seededRandom(chunkSeed) > 0.3) return;
      
      // Generate 1-3 mountain clusters per qualifying chunk
      const mountainCount = Math.floor(seededRandom(chunkSeed + 100) * 3) + 1;
      
      for (let i = 0; i < mountainCount; i++) {
        const seed = chunkSeed + i * 200;
        
        // Position within chunk bounds but towards edges
        const offsetX = (seededRandom(seed) - 0.5) * chunkSize * 0.8;
        const offsetZ = (seededRandom(seed + 1) - 0.5) * chunkSize * 0.8;
        
        const x = chunk.worldX + offsetX;
        const z = chunk.worldZ + offsetZ;
        
        // Vary height based on distance (further = higher for dramatic effect)
        const heightVariation = Math.min(distanceFromPlayer / 20, 3);
        const y = -2 + heightVariation; // Slightly below ground with height variation
        
        // Scale based on distance and randomness
        const baseScale = 1.5 + (distanceFromPlayer / 50); // Larger mountains in distance
        const scaleVariation = 0.7 + seededRandom(seed + 2) * 0.6; // 0.7x to 1.3x
        const finalScale = baseScale * scaleVariation;
        
        // Random rotation
        const rotationY = seededRandom(seed + 3) * Math.PI * 2;
        
        mountainInstances.push({
          id: `mountain-${chunk.id}-${i}`,
          position: [x, y, z],
          rotation: [0, rotationY, 0],
          scale: finalScale,
          chunkKey: `${chunk.x}_${chunk.z}_mountain_${i}`
        });
      }
    });
    
    console.log(`🏔️ Generated ${mountainInstances.length} procedural mountains`);
    return mountainInstances;
  }, [chunks, playerPosition.x, playerPosition.z, chunkSize]);
  
  return (
    <group name="procedural-mountain-system">
      {mountains.map((mountain) => (
        <MountainModel
          key={mountain.id}
          position={mountain.position}
          rotation={mountain.rotation}
          scale={mountain.scale}
        />
      ))}
    </group>
  );
};