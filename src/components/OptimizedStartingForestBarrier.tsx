import React, { useMemo } from 'react';
import { Vector3 } from 'three';
import { InstancedGLBSystem } from './InstancedGLBSystem';
import { FrustumCullingSystem } from './FrustumCullingSystem';
import { assetUrl } from '@/lib/utils';

interface OptimizedStartingForestBarrierProps {
  playerPosition: Vector3;
}

export const OptimizedStartingForestBarrier: React.FC<OptimizedStartingForestBarrierProps> = ({
  playerPosition
}) => {
  // Only render when player is near spawn
  if (Math.abs(playerPosition.z) > 100) return null;

  const treePositions = useMemo(() => {
    const positions = [];
    
    // Create dense forest barrier BEHIND character (positive Z values)
    for (let x = -40; x <= 40; x += 4) {
      for (let z = 30; z <= 75; z += 6) {
        const scale = 0.8 + Math.random() * 0.6; // Random scale 0.8-1.4
        const position: [number, number, number] = [
          x + (Math.random() - 0.5) * 3,
          0,
          z + (Math.random() - 0.5) * 3
        ];
        const rotation: [number, number, number] = [
          0,
          Math.random() * Math.PI * 2,
          0
        ];
        
        positions.push({
          position,
          rotation,
          scale: scale * 12 // Large scale for barrier effect
        });
      }
    }
    
    return positions;
  }, []); // Only calculate once since positions are static

  const bushPositions = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const x = -35 + Math.random() * 70;
      const z = 35 + Math.random() * 35;
      return {
        position: [x, 0.5, z] as [number, number, number],
        rotation: [0, Math.random() * Math.PI * 2, 0] as [number, number, number],
        scale: 1 + Math.random() * 0.8
      };
    });
  }, []);

  return (
    <FrustumCullingSystem cullDistance={100}>
      <group name="optimized-starting-forest-barrier">
        {/* Instanced ancient trees for performance */}
        <InstancedGLBSystem
          modelUrl={assetUrl('assets/environment/AncientTree.glb')}
          positions={treePositions}
          maxCount={500}
          frustumCull={true}
        />
        
        {/* Procedural bushes for undergrowth */}
        {bushPositions.map((bush, i) => (
          <mesh key={`bush-${i}`} position={bush.position} rotation={bush.rotation} castShadow>
            <sphereGeometry args={[bush.scale]} />
            <meshStandardMaterial color="#006400" />
          </mesh>
        ))}
        
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
    </FrustumCullingSystem>
  );
};