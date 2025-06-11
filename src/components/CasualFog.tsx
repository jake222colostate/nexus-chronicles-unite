import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Simple fog effect that slowly fades out to reveal the environment.
 */
export const CasualFog = () => {
  const { scene } = useThree();
  // Denser starting fog to hide far objects until they load
  const fogRef = useRef(new THREE.Fog('#2d1b4e', 5, 50));

  useEffect(() => {
    scene.fog = fogRef.current;
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame(() => {
    const fog = fogRef.current;
    if (fog.far < 250) {
      fog.far += 0.7; // gradually increase visibility over time
    }
  });

  return null;
};
