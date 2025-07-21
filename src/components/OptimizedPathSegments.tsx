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
  const meshRef = useRef<InstancedMesh>(null);
  const { scene: pathScene } = useGLTF(assetUrl('assets/Path.glb'));

  // Calculate visible segments based on player position
  const visibleSegments = useMemo(() => {
    const playerChunkIndex = Math.floor(playerPosition.z / pathLength);
    const segments: { index: number; position: Vector3 }[] = [];

    for (let i = -2; i <= segmentCount; i++) {
      const segmentIndex = playerChunkIndex + i;
      const segmentPosition = new Vector3(0, 0, segmentIndex * pathLength);
      const distance = segmentPosition.distanceTo(playerPosition);

      if (distance <= renderDistance) {
        segments.push({ index: segmentIndex, position: segmentPosition });
      }
    }

    return segments;
  }, [playerPosition.z, pathLength, segmentCount, renderDistance]);

  // Update instance matrices
  useEffect(() => {
    if (!meshRef.current || !pathScene) return;

    visibleSegments.forEach((segment, i) => {
      const matrix = new Matrix4();
      matrix.setPosition(segment.position);
      meshRef.current!.setMatrixAt(i, matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.count = visibleSegments.length;
  }, [visibleSegments, pathScene]);

  if (!pathScene) return null;

  // Extract geometry and material from the loaded scene
  let geometry = null;
  let material = null;

  pathScene.traverse((child) => {
    if (child.type === 'Mesh') {
      geometry = (child as any).geometry;
      material = (child as any).material;
    }
  });

  if (!geometry || !material) {
    console.warn('⚠️ Could not extract geometry/material from Path.glb');
    return null;
  }

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, Math.max(segmentCount + 4, 10)]}
      castShadow
      receiveShadow
    />
  );
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