
import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Simple fog effect that slowly fades out to reveal the environment.
 */
export const CasualFog = () => {
  const { scene } = useThree();
  // Much lighter starting fog for better visibility
  const fogRef = useRef(new THREE.Fog('#2d1b4e', 15, 120)); // Increased near from 5 to 15, far from 50 to 120

  useEffect(() => {
    scene.fog = fogRef.current;
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame(() => {
    const fog = fogRef.current;
    if (fog.far < 400) { // Increased maximum visibility from 250 to 400
      fog.far += 1.2; // Faster fog clearing (increased from 0.7 to 1.2)
    }
  });

  return null;
};
