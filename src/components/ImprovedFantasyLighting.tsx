
import React from 'react';
import * as THREE from 'three';

export const ImprovedFantasyLighting: React.FC = () => {
  return (
    <group>
      {/* Main directional light (sun) */}
      <directionalLight
        position={[10, 20, 5]}
        color={new THREE.Color(1.0, 0.95, 0.8)}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.001}
      />
      
      {/* Ambient light for overall scene illumination */}
      <ambientLight 
        color={new THREE.Color(0.4, 0.5, 0.6)}
        intensity={0.8}
      />
      
      {/* Hemisphere light for natural sky/ground lighting */}
      <hemisphereLight
        color={new THREE.Color(0.7, 0.8, 1.0)}
        groundColor={new THREE.Color(0.3, 0.2, 0.1)}
        intensity={0.6}
      />
      
      {/* Fill light to reduce harsh shadows */}
      <directionalLight
        position={[-5, 10, -5]}
        color={new THREE.Color(0.6, 0.7, 1.0)}
        intensity={0.3}
        castShadow={false}
      />
    </group>
  );
};
