
import React from 'react';
import * as THREE from 'three';

export const FantasyDuskSkybox: React.FC = () => {
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[300, 32, 32]} />
      <meshBasicMaterial 
        side={THREE.BackSide}
        color={new THREE.Color().setHSL(280/360, 0.6, 0.3)} // Deep purple-pink dusk
      />
    </mesh>
  );
};
