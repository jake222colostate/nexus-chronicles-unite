
import React from 'react';
import * as THREE from 'three';

interface SimpleSkyboxProps {
  realm: 'fantasy' | 'scifi';
}

export const SimpleSkybox: React.FC<SimpleSkyboxProps> = ({ realm }) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[200, 32, 32]} />
      <meshBasicMaterial 
        side={THREE.BackSide}
        color="#87CEEB"
      />
    </mesh>
  );
};
