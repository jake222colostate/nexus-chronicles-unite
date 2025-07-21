import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Fog } from 'three';

export const PerformanceOptimizer: React.FC = () => {
  const { scene } = useThree();

  useEffect(() => {
    // Add heavy fog for maximum performance optimization
    const heavyFog = new Fog('#2d1b4e', 5, 35);
    scene.fog = heavyFog;

    return () => {
      scene.fog = null;
    };
  }, [scene]);

  return null; // This component only adds fog, no visual elements
};