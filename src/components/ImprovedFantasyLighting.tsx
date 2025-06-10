
import React from 'react';
import * as THREE from 'three';

export const ImprovedFantasyLighting: React.FC = () => {
  return (
    <group>
      {/* Main directional light (bright sun) - SIGNIFICANTLY ENHANCED */}
      <directionalLight
        position={[10, 25, 8]}
        color={new THREE.Color(1.0, 0.98, 0.9)} // Warmer, brighter sunlight
        intensity={2.5} // MASSIVELY INCREASED for vibrant lighting
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
      
      {/* Enhanced ambient light for overall bright illumination */}
      <ambientLight 
        color={new THREE.Color(0.6, 0.7, 0.9)} // Brighter blue-tinted ambient
        intensity={1.2} // DOUBLED for much brighter environment
      />
      
      {/* Enhanced hemisphere light for natural vibrant sky/ground lighting */}
      <hemisphereLight
        color={new THREE.Color(0.8, 0.9, 1.0)} // Brighter sky color
        groundColor={new THREE.Color(0.5, 0.4, 0.2)} // Warmer, brighter ground color
        intensity={1.0} // INCREASED for more vibrant lighting
      />
      
      {/* Additional fill light to eliminate dark areas */}
      <directionalLight
        position={[-8, 15, -8]}
        color={new THREE.Color(0.8, 0.9, 1.0)} // Cool fill light
        intensity={0.8} // INCREASED fill light intensity
        castShadow={false}
      />
      
      {/* Extra warm accent light from the side */}
      <directionalLight
        position={[15, 10, 0]}
        color={new THREE.Color(1.0, 0.9, 0.7)} // Warm golden accent
        intensity={0.6}
        castShadow={false}
      />
    </group>
  );
};
