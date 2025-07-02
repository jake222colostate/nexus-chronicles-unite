
import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Optimized fog system for 60fps performance with intelligent culling
 */
export const CasualFog = () => {
  const { scene } = useThree();
  // Performance-optimized fog with realistic distance culling
  const fogRef = useRef(new THREE.Fog('#2d1b4e', 30, 120)); // Closer near fog for better culling

  useEffect(() => {
    scene.fog = fogRef.current;
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame((state) => {
    const fog = fogRef.current;
    
    // Dynamic fog adjustment for performance
    // Allow seeing far ahead (200 units) but cull behind more aggressively
    if (fog.far < 200) { 
      fog.far += 1.5; // Gradual increase to 200 units visibility
    }
    
    // Adjust near fog based on movement for better culling
    const targetNear = 25; // Closer culling for better performance
    if (fog.near > targetNear) {
      fog.near = Math.max(targetNear, fog.near - 0.5);
    }
  });

  return null;
};
