import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Simple fog effect that slowly fades out to reveal the environment.
 */
export const CasualFog = () => {
  const { scene } = useThree();
  const fogRef = useRef(new THREE.Fog('#2d1b4e', 10, 60));

  useEffect(() => {
    scene.fog = fogRef.current;
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame(() => {
    const fog = fogRef.current;
    if (fog.far < 180) {
      fog.far += 0.5; // gradually increase visibility
    }
  });

  return null;
};
