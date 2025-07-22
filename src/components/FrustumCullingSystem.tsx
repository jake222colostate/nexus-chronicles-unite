import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Frustum, Matrix4, Vector3, Group, Mesh } from 'three';

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
        
        // Frustum-based culling
        if (child instanceof Mesh && child.geometry) {
          child.geometry.computeBoundingSphere();
          if (child.geometry.boundingSphere) {
            const sphere = child.geometry.boundingSphere.clone();
            sphere.applyMatrix4(child.matrixWorld);
            child.visible = frustum.current.intersectsSphere(sphere);
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