
import React from 'react';
import * as THREE from 'three';

export const ImprovedFantasyLighting: React.FC = () => {
  return (
    <group>
      {/* Main directional light with reduced shadow quality for performance */}
      <directionalLight
        position={[20, 30, 10]}
        color={new THREE.Color(0.8, 0.7, 1.0)}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024} // Reduced from 4096 for performance
        shadow-mapSize-height={1024}
        shadow-camera-far={150} // Reduced from 300
        shadow-camera-left={-50} // Reduced from -100
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0001}
      />
      
      {/* Ambient light for overall scene illumination */}
      <ambientLight 
        color={new THREE.Color(0.3, 0.2, 0.4)}
        intensity={0.6} // Increased to compensate for fewer point lights
      />
      
      {/* Hemisphere light for sky/ground color variation */}
      <hemisphereLight
        color={new THREE.Color(0.5, 0.4, 0.8)}
        groundColor={new THREE.Color(0.1, 0.1, 0.2)}
        intensity={0.8} // Increased
      />
      
      {/* Reduced number of point lights for performance */}
      <pointLight
        position={[0, 8, -50]}
        color="#00FFFF"
        intensity={0.6}
        distance={25} // Reduced distance
        decay={2}
      />
      
      <pointLight
        position={[0, 4, -120]}
        color="#FFD700"
        intensity={0.5}
        distance={30}
        decay={2}
      />
    </group>
  );
};
