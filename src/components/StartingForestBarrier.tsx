import React from 'react';
import { Vector3 } from 'three';

interface StartingForestBarrierProps {
  playerPosition: Vector3;
}

export const StartingForestBarrier: React.FC<StartingForestBarrierProps> = ({
  playerPosition // Fixed HMR cache issue
}) => {
  // Only render if player is near starting position
  if (Math.abs(playerPosition.z) > 50) return null;

  const trees = [];
  
  // Create dense forest behind starting point (positive Z values - behind player)
  for (let x = -30; x <= 30; x += 3) {
    for (let z = 5; z <= 50; z += 4) { // Changed from negative to positive Z
      const treeId = `barrier-tree-${x}-${z}`;
      const height = 8 + Math.random() * 4; // Random height 8-12
      const width = 2 + Math.random() * 1; // Random width 2-3
      
      trees.push(
        <group key={treeId} position={[x + (Math.random() - 0.5) * 2, 0, z + (Math.random() - 0.5) * 2]}>
          {/* Tree trunk */}
          <mesh position={[0, height / 2, 0]} castShadow>
            <cylinderGeometry args={[width * 0.2, width * 0.3, height]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          
          {/* Tree foliage - multiple layers for density */}
          <mesh position={[0, height * 0.8, 0]} castShadow>
            <sphereGeometry args={[width * 1.2]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          
          <mesh position={[0, height * 0.9, 0]} castShadow>
            <sphereGeometry args={[width * 0.9]} />
            <meshStandardMaterial color="#32CD32" />
          </mesh>
          
          <mesh position={[0, height, 0]} castShadow>
            <sphereGeometry args={[width * 0.6]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
        </group>
      );
    }
  }

  return (
    <group name="starting-forest-barrier">
      {trees}
      
      {/* Add some undergrowth bushes */}
      {Array.from({ length: 20 }, (_, i) => {
        const x = -25 + Math.random() * 50;
        const z = 10 + Math.random() * 35; // Changed to positive Z (behind player)
        return (
          <mesh key={`bush-${i}`} position={[x, 0.5, z]} castShadow>
            <sphereGeometry args={[1 + Math.random() * 0.5]} />
            <meshStandardMaterial color="#006400" />
          </mesh>
        );
      })}
      
      {/* Dense visual wall effect */}
      <mesh position={[0, 6, 50]} rotation={[0, 0, 0]}> {/* Changed to positive Z */}
        <planeGeometry args={[80, 12]} />
        <meshStandardMaterial 
          color="#1a4d1a" 
          transparent 
          opacity={0.8}
          side={2} // Double-sided
        />
      </mesh>
    </group>
  );
};