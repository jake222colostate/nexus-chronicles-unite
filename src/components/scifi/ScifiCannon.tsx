
import React, { useRef, useEffect } from 'react';
import { useFBX } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import * as THREE from 'three';

interface ScifiCannonProps {
  target?: Vector3;
}

export const ScifiCannon: React.FC<ScifiCannonProps> = ({ target }) => {
  const { camera } = useThree();
  const weaponGroupRef = useRef<Group>(null);
  const fbx = useFBX('/assets/c1/scifi-cannon/source/300_Gun.fbx');

  // Initialize and optimize the cannon model
  useEffect(() => {
    if (fbx && weaponGroupRef.current) {
      // Clone the model to avoid modifying the original
      const cannonModel = fbx.clone();
      
      // Clear any existing children
      weaponGroupRef.current.clear();
      weaponGroupRef.current.add(cannonModel);
      
      // Optimize the model for first-person view
      cannonModel.traverse((child) => {
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
      
      console.log('Cannon model loaded and optimized for first-person view');
    }
  }, [fbx]);

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
      
      // Position cannon for first-person view - optimized for iPhone screen
      // Similar positioning to the staff but adjusted for the cannon model
      const cannonPosition = camera.position.clone()
        .add(cameraRight.clone().multiplyScalar(0.4))     // X = 0.4 (slightly to the right)
        .add(cameraUp.clone().multiplyScalar(-0.3))        // Y = -0.3 (lower for cannon)
        .add(cameraForward.clone().multiplyScalar(0.5));   // Z = 0.5 (close to camera)
      
      weaponGroupRef.current.position.copy(cannonPosition);
      
      // Rotation to match camera orientation with adjustments for cannon
      weaponGroupRef.current.rotation.copy(camera.rotation);
      weaponGroupRef.current.rotateY(-10 * Math.PI / 180); // Y = -10° (slight angle)
      weaponGroupRef.current.rotateZ(15 * Math.PI / 180);  // Z = 15° (slight tilt)
      weaponGroupRef.current.rotateX(-5 * Math.PI / 180);  // X = -5° (slight downward angle)
      
      // If there's a target, slightly adjust aim towards it
      if (target) {
        const targetDirection = new Vector3().subVectors(target, cannonPosition).normalize();
        const currentForward = new Vector3(0, 0, -1).applyQuaternion(weaponGroupRef.current.quaternion);
        const adjustmentAngle = currentForward.angleTo(targetDirection) * 0.1; // Subtle adjustment
        
        if (adjustmentAngle > 0.01) { // Only adjust if significant difference
          weaponGroupRef.current.lookAt(
            cannonPosition.x + targetDirection.x * 0.1,
            cannonPosition.y + targetDirection.y * 0.1,
            cannonPosition.z + targetDirection.z * 0.1
          );
        }
      }
    }
  });

  return (
    <group ref={weaponGroupRef}>
      {fbx && (
        <primitive 
          object={fbx} 
          scale={[0.004, 0.004, 0.004]} // Slightly larger for better visibility
          rotation={[Math.PI / 2, 0, 0]} // Initial rotation correction
        />
      )}
      {/* Add a subtle light to make the cannon more visible */}
      <pointLight position={[0, 0.2, 0]} color="#00ffff" intensity={0.3} distance={2} />
    </group>
  );
};
