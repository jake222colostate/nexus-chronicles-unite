
import React from 'react';
import * as THREE from 'three';

export const GradientPathTerrain: React.FC = () => {
  return (
    <group>
      {/* Main terrain base */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200, 64, 64]} />
        <meshStandardMaterial 
          color="#462d72" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Path stones */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 4, 
            -0.8, 
            -i * 6 - Math.random() * 2
          ]}
          rotation={[0, Math.random() * Math.PI, 0]}
          receiveShadow
        >
          <cylinderGeometry args={[1.5, 1.8, 0.3, 8]} />
          <meshStandardMaterial 
            color="#8b5a3c"
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>
      ))}
      
      {/* Grass patches */}
      {Array.from({ length: 40 }, (_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 80, 
            -0.9, 
            -Math.random() * 150
          ]}
          rotation={[-Math.PI / 2, 0, Math.random() * Math.PI * 2]}
          receiveShadow
        >
          <circleGeometry args={[2 + Math.random() * 3, 8]} />
          <meshStandardMaterial 
            color="#2d5a3d"
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
};
