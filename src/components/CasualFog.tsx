
import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Simple fog effect that slowly fades out to reveal the environment.
 */
export const CasualFog = () => {
  const { scene } = useThree();
  // Aggressive fog for 60fps performance
  const fogRef = useRef(new THREE.Fog('#2d1b4e', 10, 60)); // Much closer fog for performance

  useEffect(() => {
    scene.fog = fogRef.current;
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame(() => {
    const fog = fogRef.current;
    if (fog.far < 120) { // Limited visibility for 60fps performance
      fog.far += 1; // Slower fog clearing to maintain performance
    }
  });

  return null;
};
