
import React from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const FantasyPostProcessing: React.FC = () => {
  const { scene } = useThree();
  
  // Set fog directly on the scene
  React.useEffect(() => {
    scene.fog = new THREE.Fog(
      new THREE.Color(0.2, 0.1, 0.3), // Deep purple haze
      20, // Start distance
      60  // End distance
    );
    
    // Cleanup fog when component unmounts
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  return null; // This component doesn't render anything visible
};
