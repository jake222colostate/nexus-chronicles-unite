
import React from 'react';
import * as THREE from 'three';

export const FantasyDuskLighting: React.FC = () => {
  return (
    <group>
      {/* Directional Light (Moonlight) */}
      <directionalLight
        position={[0, 10, -5]} // Behind camera toward path
        rotation={[Math.PI * 50/180, Math.PI, 0]} // 50° downward, 180° around Y
        color={new THREE.Color(0.4, 0.5, 1.0)} // Soft bluish-purple
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      {/* Ambient Light */}
      <ambientLight 
        color={new THREE.Color(0.15, 0.1, 0.2)} // Dark purple
        intensity={0.3}
      />
    </group>
  );
};
