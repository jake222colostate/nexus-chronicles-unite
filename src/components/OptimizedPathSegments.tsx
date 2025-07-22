import React, { useMemo, useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { Object3D, InstancedMesh, Matrix4, Vector3 } from 'three';
import { assetUrl } from '@/lib/utils';

interface OptimizedPathSegmentsProps {
  playerPosition: Vector3;
  segmentCount: number;
  pathLength: number;
  renderDistance: number;
}

/**
 * High-performance path renderer using InstancedMesh for better performance
 * when rendering many identical path segments
 */
export const OptimizedPathSegments: React.FC<OptimizedPathSegmentsProps> = ({
  playerPosition,
  segmentCount,
  pathLength,
  renderDistance
}) => {
  // GLB assets disabled - returning null to disable path rendering
  return null;
};

// Performance monitoring hook for path system
export const usePathPerformance = () => {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = performance.now();
      const fps = Math.round(frameCount.current / ((now - lastTime.current) / 1000));
      
      if (fps < 30) {
        console.warn(`🐌 Path system FPS low: ${fps}`);
      }
      
      frameCount.current = 0;
      lastTime.current = now;
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const incrementFrame = () => {
    frameCount.current++;
  };

  return { incrementFrame };
};