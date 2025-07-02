
import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Simple fog effect that slowly fades out to reveal the environment.
 */
export const CasualFog = () => {
  const { scene } = useThree();
  // 60fps optimization - aggressive fog for culling
  const fogRef = useRef(new THREE.Fog('#2d1b4e', 15, 120)); // Reduced for 60fps performance

  useEffect(() => {
    scene.fog = fogRef.current;
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame(() => {
    const fog = fogRef.current;
    if (fog.far < 150) { // 60fps limit - keep fog close for culling
      fog.far += 1; // Slower expansion for performance
    }
  });

  return null;
};
