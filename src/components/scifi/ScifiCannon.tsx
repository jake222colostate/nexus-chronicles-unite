
import React, { useRef, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { USDZLoader } from 'three/examples/jsm/loaders/USDZLoader.js';
import { Vector3, Group } from 'three';
import * as THREE from 'three';

interface ScifiCannonProps {
  target?: Vector3;
}

export const ScifiCannon: React.FC<ScifiCannonProps> = ({ target }) => {
  const { camera } = useThree();
  const weaponGroupRef = useRef<Group>(null);
  const laserRifle = useLoader(USDZLoader, '/assets/c1/laserrifle.usdz');

  // Initialize and optimize the laser rifle model
  useEffect(() => {
    if (laserRifle && weaponGroupRef.current) {
      // Clone the model to avoid modifying the original
      const rifleModel = laserRifle.clone();
      
      // Clear any existing children
      weaponGroupRef.current.clear();
      weaponGroupRef.current.add(rifleModel);
      
      // Optimize the model for first-person view
      rifleModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = false;
          child.frustumCulled = false; // Prevent first-person culling issues
          
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.transparent = false;
                mat.opacity = 1.0;
                mat.side = THREE.DoubleSide;
                mat.needsUpdate = true;
              });
            } else {
              child.material.transparent = false;
              child.material.opacity = 1.0;
              child.material.side = THREE.DoubleSide;
              child.material.needsUpdate = true;
            }
          }
        }
      });
      
      console.log('Laser rifle model loaded and optimized for first-person view');
    }
  }, [laserRifle]);

  // First-person weapon positioning - follows camera exactly like the staff
  useFrame(() => {
    if (weaponGroupRef.current && camera) {
      // Get camera vectors for positioning
      const cameraForward = new Vector3();
      const cameraRight = new Vector3();
      const cameraUp = new Vector3();
      
      camera.getWorldDirection(cameraForward);
      cameraRight.crossVectors(cameraUp.set(0, 1, 0), cameraForward).normalize();
      cameraUp.crossVectors(cameraForward, cameraRight).normalize();
      
      // Position weapon for first-person view - optimized for iPhone screen
      const riflePosition = camera.position.clone()
        .add(cameraRight.clone().multiplyScalar(0.5))     // X = 0.5 (right side of screen)
        .add(cameraUp.clone().multiplyScalar(-0.25))      // Y = -0.25 (slightly lower)
        .add(cameraForward.clone().multiplyScalar(0.7));   // Z = 0.7 (in front of camera)

      weaponGroupRef.current.position.copy(riflePosition);
      
      // Rotation to match camera orientation with adjustments for rifle
      weaponGroupRef.current.rotation.copy(camera.rotation);
      weaponGroupRef.current.rotateY(-8 * Math.PI / 180); // Y = -8° slight inward angle
      weaponGroupRef.current.rotateZ(12 * Math.PI / 180);  // Z = 12° slight tilt
      weaponGroupRef.current.rotateX(-3 * Math.PI / 180);  // X = -3° downward
      
      // If there's a target, slightly adjust aim towards it
      if (target) {
        const targetDirection = new Vector3().subVectors(target, riflePosition).normalize();
        const currentForward = new Vector3(0, 0, -1).applyQuaternion(weaponGroupRef.current.quaternion);
        const adjustmentAngle = currentForward.angleTo(targetDirection) * 0.1; // Subtle adjustment
        
        if (adjustmentAngle > 0.01) { // Only adjust if significant difference
          weaponGroupRef.current.lookAt(
            riflePosition.x + targetDirection.x * 0.1,
            riflePosition.y + targetDirection.y * 0.1,
            riflePosition.z + targetDirection.z * 0.1
          );
        }
      }
    }
  });

  return (
    <group ref={weaponGroupRef}>
      {laserRifle && (
        <primitive
          object={laserRifle}
          scale={[0.004, 0.004, 0.004]} // Slightly larger for better visibility
          rotation={[Math.PI / 2, 0, 0]} // Initial rotation correction
        />
      )}
      {/* Subtle light to highlight the rifle */}
      <pointLight position={[0, 0.2, 0]} color="#00ffff" intensity={0.3} distance={2} />
    </group>
  );
};
