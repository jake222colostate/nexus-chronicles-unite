import React from 'react';
import { Vector3 } from 'three';
import { useGLTF } from '@react-three/drei';
import { assetUrl } from '@/lib/utils';

// Preload the mountains model
useGLTF.preload(assetUrl('assets/environment/Mountains.glb'));

interface MountainsGLBProps {
  playerPosition: Vector3;
}

// Single Mountains Model Component
const MountainsModel: React.FC<{ 
  position: [number, number, number]; 
  rotation: [number, number, number]; 
  scale: number 
}> = ({ position, rotation, scale }) => {
  console.log('MountainsModel rendering at position:', position, 'scale:', scale);
  
  try {
    const { scene } = useGLTF(assetUrl('assets/environment/Mountains.glb'));
    console.log('Mountains GLB loaded successfully:', scene);
    
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
    // Large fallback geometry
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
  console.log('MountainsGLB component rendering');
  
  // Simplified - just a few large mountains to test
  return (
    <group name="mountains-glb">
      <MountainsModel
        position={[0, 0, 80]}
        rotation={[0, 0, 0]}
        scale={50}
      />
      <MountainsModel
        position={[-60, 0, 70]}
        rotation={[0, Math.PI * 0.3, 0]}
        scale={40}
      />
      <MountainsModel
        position={[60, 0, 70]}
        rotation={[0, -Math.PI * 0.3, 0]}
        scale={45}
      />
    </group>
  );
};