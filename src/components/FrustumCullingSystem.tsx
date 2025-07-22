import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Frustum, Matrix4, Group, Mesh, BufferGeometry, Sphere } from 'three';

interface FrustumCullingSystemProps {
  children: React.ReactNode;
  enabled?: boolean;
  cullDistance?: number;
}

export const FrustumCullingSystem: React.FC<FrustumCullingSystemProps> = ({
  children,
  enabled = true,
  cullDistance = 200
}) => {
  const groupRef = useRef<Group>(null);
  const { camera } = useThree();
  
  // Create frustum for culling calculations
  const frustum = useRef(new Frustum());
  const cameraMatrix = useRef(new Matrix4());
  const sphereCache = useRef(new WeakMap<BufferGeometry, Sphere>());
  
  useFrame(() => {
    if (!enabled || !groupRef.current) return;
    
    // Update frustum from camera
    cameraMatrix.current.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.current.setFromProjectionMatrix(cameraMatrix.current);
    
    // Cull objects outside frustum
    groupRef.current.traverse((child) => {
      if (child.type === 'Mesh' || child.type === 'Group') {
        // Distance-based culling
        const distance = camera.position.distanceTo(child.position);
        if (distance > cullDistance) {
          child.visible = false;
          return;
        }

        // Frustum-based culling for meshes
        if (child instanceof Mesh && child.geometry) {
          let sphere = sphereCache.current.get(child.geometry as BufferGeometry);
          if (!sphere) {
            child.geometry.computeBoundingSphere();
            if (child.geometry.boundingSphere) {
              sphere = child.geometry.boundingSphere.clone();
              sphereCache.current.set(child.geometry as BufferGeometry, sphere);
            }
          }
          if (sphere) {
            const worldSphere = sphere.clone();
            worldSphere.applyMatrix4(child.matrixWorld);
            child.visible = frustum.current.intersectsSphere(worldSphere);
          } else {
            child.visible = true;
          }
        } else {
          child.visible = true; // Keep groups visible for traversal
        }
      }
    });
  });
  
  return (
    <group ref={groupRef}>
      {children}
    </group>
  );
};
