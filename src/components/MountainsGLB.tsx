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
    // Fallback geometry
    return (
      <group position={position} rotation={rotation}>
        <mesh position={[0, 5, 0]} castShadow>
          <coneGeometry args={[8, 15, 8]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      </group>
    );
  }
};

export const MountainsGLB: React.FC<MountainsGLBProps> = ({ playerPosition }) => {
  const mountains = [];
  
  // Create mountain ring around the scene at a distance
  const mountainPositions = [
    // Behind the player (positive Z)
    { pos: [0, 0, 150] as [number, number, number], rot: [0, 0, 0] as [number, number, number] },
    { pos: [-80, 0, 120] as [number, number, number], rot: [0, Math.PI * 0.3, 0] as [number, number, number] },
    { pos: [80, 0, 120] as [number, number, number], rot: [0, -Math.PI * 0.3, 0] as [number, number, number] },
    
    // To the sides
    { pos: [-150, 0, 0] as [number, number, number], rot: [0, Math.PI * 0.5, 0] as [number, number, number] },
    { pos: [150, 0, 0] as [number, number, number], rot: [0, -Math.PI * 0.5, 0] as [number, number, number] },
    
    // Ahead of player (negative Z) - distant mountains
    { pos: [0, 0, -200] as [number, number, number], rot: [0, Math.PI, 0] as [number, number, number] },
    { pos: [-100, 0, -180] as [number, number, number], rot: [0, Math.PI * 0.8, 0] as [number, number, number] },
    { pos: [100, 0, -180] as [number, number, number], rot: [0, Math.PI * 1.2, 0] as [number, number, number] },
  ];

  mountainPositions.forEach((mountain, index) => {
    const scale = 15 + Math.random() * 10; // Random scale 15-25
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