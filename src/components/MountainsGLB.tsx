import React from 'react';
import { Vector3 } from 'three';
import { useGLTF } from '@react-three/drei';
import { assetUrl } from '@/lib/utils';

// Preload the mountains model
useGLTF.preload(assetUrl('assets/environment/Mountains.glb'));

interface MountainsGLBProps {
  playerPosition: Vector3;
}

// Mountains Model Component
const MountainsModel: React.FC<{ 
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
    // Fallback geometry - much larger
    return (
      <group position={position} rotation={rotation}>
        <mesh position={[0, 15, 0]} castShadow>
          <coneGeometry args={[25, 50, 8]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
        <mesh position={[10, 10, 5]} castShadow>
          <coneGeometry args={[20, 40, 6]} />
          <meshStandardMaterial color="#5a5a5a" />
        </mesh>
        <mesh position={[-8, 12, -3]} castShadow>
          <coneGeometry args={[18, 35, 7]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>
      </group>
    );
  }
};

export const MountainsGLB: React.FC<MountainsGLBProps> = ({ playerPosition }) => {
  const mountains = [];
  
  // Create mountain ring around the scene at closer distance
  const mountainPositions = [
    // Behind the player (positive Z) - closer and bigger
    { pos: [0, 0, 80] as [number, number, number], rot: [0, 0, 0] as [number, number, number] },
    { pos: [-60, 0, 70] as [number, number, number], rot: [0, Math.PI * 0.3, 0] as [number, number, number] },
    { pos: [60, 0, 70] as [number, number, number], rot: [0, -Math.PI * 0.3, 0] as [number, number, number] },
    
    // To the sides - closer and bigger
    { pos: [-80, 0, 20] as [number, number, number], rot: [0, Math.PI * 0.5, 0] as [number, number, number] },
    { pos: [80, 0, 20] as [number, number, number], rot: [0, -Math.PI * 0.5, 0] as [number, number, number] },
    
    // Ahead of player (negative Z) - visible mountains
    { pos: [0, 0, -60] as [number, number, number], rot: [0, Math.PI, 0] as [number, number, number] },
    { pos: [-50, 0, -50] as [number, number, number], rot: [0, Math.PI * 0.8, 0] as [number, number, number] },
    { pos: [50, 0, -50] as [number, number, number], rot: [0, Math.PI * 1.2, 0] as [number, number, number] },
  ];

  mountainPositions.forEach((mountain, index) => {
    const scale = 50 + Math.random() * 30; // Much larger scale 50-80
    mountains.push(
      <MountainsModel
        key={`mountain-${index}`}
        position={mountain.pos}
        rotation={mountain.rot}
        scale={scale}
      />
    );
  });

  return (
    <group name="mountains-glb">
      {mountains}
    </group>
  );
};