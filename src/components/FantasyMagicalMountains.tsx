
import React from 'react';
import * as THREE from 'three';

export const FantasyMagicalMountains: React.FC = () => {
  const mountains = [];
  
  // Left side mountains
  for (let i = 0; i < 4; i++) {
    const x = -60 - Math.random() * 20;
    const z = -50 - i * 40;
    const height = 20 + Math.random() * 15;
    
    mountains.push(
      <group key={`left-${i}`} position={[x, 0, z]}>
        {/* Mountain base */}
        <mesh castShadow>
          <coneGeometry args={[10, height, 6]} />
          <meshStandardMaterial 
            color="#9338b1" 
            flatShading 
            emissive="#5c2a7a"
            emissiveIntensity={0.1}
          />
        </mesh>
        
        {/* Glowing crystal at peak */}
        <mesh position={[0, height / 2 + 2, 0]}>
          <octahedronGeometry args={[2]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={2}
          />
        </mesh>
        
        {/* Crystal light */}
        <pointLight 
          position={[0, height / 2 + 2, 0]}
          color="#00ffff"
          intensity={1}
          distance={20}
        />
      </group>
    );
  }
  
  // Right side mountains
  for (let i = 0; i < 4; i++) {
    const x = 60 + Math.random() * 20;
    const z = -50 - i * 40;
    const height = 20 + Math.random() * 15;
    
    mountains.push(
      <group key={`right-${i}`} position={[x, 0, z]}>
        {/* Mountain base */}
        <mesh castShadow>
          <coneGeometry args={[10, height, 6]} />
          <meshStandardMaterial 
            color="#9338b1" 
            flatShading 
            emissive="#5c2a7a"
            emissiveIntensity={0.1}
          />
        </mesh>
        
        {/* Glowing crystal at peak */}
        <mesh position={[0, height / 2 + 2, 0]}>
          <octahedronGeometry args={[2]} />
          <meshStandardMaterial
            color="#ff6b9d"
            emissive="#ff6b9d"
            emissiveIntensity={2}
          />
        </mesh>
        
        {/* Crystal light */}
        <pointLight 
          position={[0, height / 2 + 2, 0]}
          color="#ff6b9d"
          intensity={1}
          distance={20}
        />
      </group>
    );
  }
  
  return <>{mountains}</>;
};
