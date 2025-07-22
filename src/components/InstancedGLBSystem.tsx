import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Matrix4, Vector3, Mesh } from 'three';
import { useGLBSceneReuse } from '../hooks/useGLBSceneReuse';

interface InstancedGLBSystemProps {
  modelUrl: string;
  positions: Array<{
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number | [number, number, number];
  }>;
  maxCount: number;
  frustumCull?: boolean;
}

export const InstancedGLBSystem: React.FC<InstancedGLBSystemProps> = ({
  modelUrl,
  positions,
  maxCount,
  frustumCull = true
}) => {
  const { scene } = useGLBSceneReuse(modelUrl);
  const instancedMeshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  
  // Extract geometry and material from GLB
  const { geometry, material } = useMemo(() => {
    if (!scene) return { geometry: null, material: null };
    
    let foundGeometry = null;
    let foundMaterial = null;
    
    scene.traverse((child) => {
      if (child instanceof Mesh && child.geometry && child.material) {
        foundGeometry = child.geometry;
        foundMaterial = child.material;
      }
    });
    
    return { geometry: foundGeometry, material: foundMaterial };
  }, [scene]);
  
  // Update instanced mesh matrices
  useEffect(() => {
    if (!instancedMeshRef.current) return;
    
    positions.forEach((item, i) => {
      if (i >= maxCount) return;
      
      dummy.position.set(...item.position);
      
      if (item.rotation) {
        dummy.rotation.set(...item.rotation);
      }
      
      if (item.scale) {
        if (typeof item.scale === 'number') {
          dummy.scale.setScalar(item.scale);
        } else {
          dummy.scale.set(...item.scale);
        }
      }
      
      dummy.updateMatrix();
      instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
    });
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    instancedMeshRef.current.count = Math.min(positions.length, maxCount);
  }, [positions, maxCount, dummy]);
  
  // Frustum culling optimization
  useFrame(({ camera }) => {
    if (!instancedMeshRef.current || !frustumCull) return;
    
    // Simple distance-based culling as backup to frustum culling
    const cameraPosition = camera.position;
    let visibleCount = 0;
    
    for (let i = 0; i < Math.min(positions.length, maxCount); i++) {
      const pos = positions[i].position;
      const distance = cameraPosition.distanceTo(new Vector3(...pos));
      
      if (distance < 150) { // Within fog distance
        visibleCount++;
      }
    }
    
    instancedMeshRef.current.count = visibleCount;
  });
  
  if (!geometry || !material) {
    return null;
  }
  
  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[geometry, material, maxCount]}
      frustumCulled={frustumCull}
      castShadow
      receiveShadow
    />
  );
};