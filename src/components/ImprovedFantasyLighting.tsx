
import React from 'react';
import * as THREE from 'three';

export const ImprovedFantasyLighting: React.FC = () => {
  return (
    <group>
      {/* Main directional light (bright sun) - SIGNIFICANTLY ENHANCED */}
      <directionalLight
        position={[10, 25, 8]}
        color={new THREE.Color(1.0, 1.0, 1.0)} // Pure white bright sunlight
        intensity={4.0} // MASSIVELY INCREASED for very bright lighting
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
        color={new THREE.Color(0.8, 0.9, 1.0)} // Bright blue-tinted ambient
        intensity={2.0} // TRIPLED for much brighter environment
      />
      
      {/* Enhanced hemisphere light for natural vibrant sky/ground lighting */}
      <hemisphereLight
        color={new THREE.Color(0.9, 0.95, 1.0)} // Very bright sky color
        groundColor={new THREE.Color(0.7, 0.6, 0.4)} // Brighter, warmer ground color
        intensity={1.5} // INCREASED for more vibrant lighting
      />
      
      {/* Additional fill light to eliminate dark areas */}
      <directionalLight
        position={[-8, 15, -8]}
        color={new THREE.Color(0.9, 0.95, 1.0)} // Bright cool fill light
        intensity={1.2} // INCREASED fill light intensity
        castShadow={false}
      />
      
      {/* Extra warm accent light from the side */}
      <directionalLight
        position={[15, 10, 0]}
        color={new THREE.Color(1.0, 0.95, 0.8)} // Bright golden accent
        intensity={1.0} // INCREASED accent light
        castShadow={false}
      />
    </group>
  );
};
