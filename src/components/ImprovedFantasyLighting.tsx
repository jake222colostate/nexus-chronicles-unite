
import React from 'react';
import * as THREE from 'three';

export const ImprovedFantasyLighting: React.FC = () => {
  return (
    <group>
      {/* Main directional light (sun/moon) */}
      <directionalLight
        position={[20, 30, 10]}
        color={new THREE.Color(0.8, 0.7, 1.0)}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={300}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.0001}
      />
      
      {/* Ambient light for overall scene illumination */}
      <ambientLight 
        color={new THREE.Color(0.3, 0.2, 0.4)}
        intensity={0.4}
      />
      
      {/* Hemisphere light for sky/ground color variation */}
      <hemisphereLight
        color={new THREE.Color(0.5, 0.4, 0.8)}
        groundColor={new THREE.Color(0.1, 0.1, 0.2)}
        intensity={0.6}
      />
      
      {/* Point lights for magical atmosphere */}
      <pointLight
        position={[-10, 8, -50]}
        color="#00FFFF"
        intensity={0.8}
        distance={30}
        decay={2}
      />
      
      <pointLight
        position={[10, 6, -80]}
        color="#FF69B4"
        intensity={0.6}
        distance={25}
        decay={2}
      />
      
      <pointLight
        position={[0, 4, -120]}
        color="#FFD700"
        intensity={0.7}
        distance={35}
        decay={2}
      />
    </group>
  );
};
