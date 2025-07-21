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
  
  // Position mountains closer and within fog distance (fog is at 25)
  return (
    <group name="mountains-glb">
      {/* Mountains behind player - within fog range */}
      <MountainsModel
        position={[0, 0, 20]}
        rotation={[0, 0, 0]}
        scale={30}
      />
      
      {/* Mountains to the sides - close and visible */}
      <MountainsModel
        position={[-20, 0, 10]}
        rotation={[0, Math.PI * 0.5, 0]}
        scale={25}
      />
      <MountainsModel
        position={[20, 0, 10]}
        rotation={[0, -Math.PI * 0.5, 0]}
        scale={25}
      />
      
      {/* Additional mountains further behind player */}
      <MountainsModel
        position={[0, 0, 30]}
        rotation={[0, Math.PI, 0]}
        scale={20}
      />
    </group>
  );
};