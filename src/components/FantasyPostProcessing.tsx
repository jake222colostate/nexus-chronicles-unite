
import React from 'react';

export const FantasyPostProcessing: React.FC = () => {
  return (
    <group>
      {/* Volumetric Fog */}
      <fog 
        attach="fog" 
        args={[
          new THREE.Color(0.2, 0.1, 0.3), // Deep purple haze
          20, // Start distance
          60  // End distance
        ]} 
      />
    </group>
  );
};
