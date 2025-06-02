
import React from 'react';
import * as THREE from 'three';

export const FantasyTreesWithGlow: React.FC = () => {
  const trees = [];
  
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 120 - 60;
    const z = -Math.random() * 300;
    const scale = 0.8 + Math.random() * 0.4;
    
    trees.push(
      <group key={i} position={[x, 0, z]} scale={[scale, scale, scale]}>
        {/* Tree trunk */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 3]} />
          <meshStandardMaterial color="#60392d" />
        </mesh>
        
        {/* Glowing tree canopy - sphere instead of cone */}
        <mesh position={[0, 3.5, 0]} castShadow>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshStandardMaterial 
            color="#1cc378" 
            emissive="#00ffcc" 
            emissiveIntensity={0.3} 
          />
        </mesh>
        
        {/* Point light for tree glow */}
        <pointLight 
          position={[0, 3.5, 0]}
          color="#00ffcc"
          intensity={0.4}
          distance={8}
        />
      </group>
    );
  }
  
  return <>{trees}</>;
};
