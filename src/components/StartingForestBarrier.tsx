import React from 'react';
import { Vector3 } from 'three';
import { useGLTF } from '@react-three/drei';
import { assetUrl } from '@/lib/utils';

// Preload the ancient tree models
useGLTF.preload(assetUrl('assets/environment/AncientTree.glb'));

interface StartingForestBarrierProps {
  playerPosition: Vector3;
}

// Ancient Tree Model Component
const AncientTreeModel: React.FC<{ position: [number, number, number]; rotation: [number, number, number]; scale: number }> = ({ 
  position, 
  rotation, 
  scale 
}) => {
  try {
    const { scene } = useGLTF(assetUrl('assets/environment/AncientTree.glb'));
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
    console.warn('Failed to load AncientTree.glb, using fallback:', error);
    // Fallback geometry
    return (
      <group position={position} rotation={rotation}>
        <mesh position={[0, 4, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.4, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 7, 0]} castShadow>
          <sphereGeometry args={[3]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      </group>
    );
  }
};

export const StartingForestBarrier: React.FC<StartingForestBarrierProps> = ({
  playerPosition
}) => {
  // Only render when player is near spawn
  if (Math.abs(playerPosition.z) > 100) return null;

  const trees = [];
  
  // Create dense forest barrier BEHIND character (positive Z values - behind starting point)  
  for (let x = -40; x <= 40; x += 4) {
    for (let z = 30; z <= 75; z += 6) { // POSITIVE Z: behind character, starting well behind spawn at Z=20
      const treeId = `barrier-tree-${x}-${z}`;
      const scale = 0.8 + Math.random() * 0.6; // Random scale 0.8-1.4
      const randomOffset: [number, number, number] = [
        x + (Math.random() - 0.5) * 3,
        0,
        z + (Math.random() - 0.5) * 3
      ];
      const randomRotation: [number, number, number] = [
        0,
        Math.random() * Math.PI * 2,
        0
      ];
      
      trees.push(
        <AncientTreeModel
          key={treeId}
          position={randomOffset}
          rotation={randomRotation}
          scale={scale * 12} // 4x larger than current: now 9.6x to 16.8x original scale
        />
      );
    }
  }

  return (
    <group name="starting-forest-barrier">
      {trees}
      
      {/* Add undergrowth bushes behind character */}
      {Array.from({ length: 20 }, (_, i) => {
        const x = -35 + Math.random() * 70;
        const z = 35 + Math.random() * 35; // POSITIVE Z: behind character (35 to 70)
        return (
          <mesh key={`bush-${i}`} position={[x, 0.5, z]} castShadow>
            <sphereGeometry args={[1 + Math.random() * 0.8]} />
            <meshStandardMaterial color="#006400" />
          </mesh>
        );
      })}
      
      {/* Visual wall behind character */}
      <mesh position={[0, 8, 75]} rotation={[0, 0, 0]}>
        <planeGeometry args={[100, 16]} />
        <meshStandardMaterial 
          color="#0d2818" 
          transparent 
          opacity={0.9}
          side={2} // Double-sided
        />
      </mesh>
    </group>
  );
};