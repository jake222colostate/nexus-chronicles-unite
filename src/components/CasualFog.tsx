
import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Simple fog effect that slowly fades out to reveal the environment.
 */
export const CasualFog = () => {
  const { scene } = useThree();
  // Much lighter starting fog for better visibility
  const fogRef = useRef(new THREE.Fog('#2d1b4e', 20, 200)); // Enhanced fog for mountain rendering

  useEffect(() => {
    scene.fog = fogRef.current;
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame(() => {
    const fog = fogRef.current;
    if (fog.far < 800) { // Much greater visibility for infinite mountains
      fog.far += 2; // Faster fog clearing for better infinite rendering
    }
  });

  return null;
};
