
import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import * as THREE from 'three';

interface ScifiCannonProps {
  target?: Vector3;
}

export const ScifiCannon: React.FC<ScifiCannonProps> = ({ target }) => {
  const { camera } = useThree();
  const weaponGroupRef = useRef<Group>(null);

  // First-person weapon positioning - follows camera exactly
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
      const cannonPosition = camera.position.clone()
        .add(cameraRight.clone().multiplyScalar(0.5))     // X = 0.5 (right side of screen)
        .add(cameraUp.clone().multiplyScalar(-0.25))      // Y = -0.25 (slightly lower)
        .add(cameraForward.clone().multiplyScalar(0.7));   // Z = 0.7 (in front of camera)

      weaponGroupRef.current.position.copy(cannonPosition);
      
      // Rotation to match camera orientation with adjustments for cannon
      weaponGroupRef.current.rotation.copy(camera.rotation);
      weaponGroupRef.current.rotateY(-8 * Math.PI / 180); // Y = -8° slight inward angle
      weaponGroupRef.current.rotateZ(12 * Math.PI / 180);  // Z = 12° slight tilt
      weaponGroupRef.current.rotateX(-3 * Math.PI / 180);  // X = -3° downward
      
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
      {/* Procedural Sci-Fi Cannon */}
      <group scale={[0.8, 0.8, 0.8]} rotation={[0, 0, 0]}>
        {/* Main barrel */}
        <mesh position={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.06, 0.08, 1.2, 8]} />
          <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Barrel tip */}
        <mesh position={[0, 0, -1.1]}>
          <cylinderGeometry args={[0.04, 0.06, 0.1, 8]} />
          <meshStandardMaterial color="#2d3748" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Main body */}
        <mesh position={[0, 0, 0.2]}>
          <boxGeometry args={[0.2, 0.15, 0.6]} />
          <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Grip */}
        <mesh position={[0, -0.15, 0.4]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.08, 0.3, 0.1]} />
          <meshStandardMaterial color="#1a202c" metalness={0.5} roughness={0.4} />
        </mesh>
        
        {/* Trigger guard */}
        <mesh position={[0, -0.1, 0.2]}>
          <torusGeometry args={[0.06, 0.02, 8, 16]} />
          <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Side details */}
        <mesh position={[0.08, 0.05, 0.1]}>
          <boxGeometry args={[0.04, 0.02, 0.3]} />
          <meshStandardMaterial color="#63b3ed" metalness={0.9} roughness={0.1} emissive="#1e40af" emissiveIntensity={0.2} />
        </mesh>
        
        <mesh position={[-0.08, 0.05, 0.1]}>
          <boxGeometry args={[0.04, 0.02, 0.3]} />
          <meshStandardMaterial color="#63b3ed" metalness={0.9} roughness={0.1} emissive="#1e40af" emissiveIntensity={0.2} />
        </mesh>
        
        {/* Scope */}
        <mesh position={[0, 0.12, -0.2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
          <meshStandardMaterial color="#1a202c" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      
      {/* Muzzle glow effect */}
      <pointLight 
        position={[0, 0, -1.1]} 
        color="#00ffff" 
        intensity={0.5} 
        distance={3}
        decay={2}
      />
      
      {/* Weapon highlight light */}
      <pointLight 
        position={[0, 0.2, 0]} 
        color="#4299e1" 
        intensity={0.3} 
        distance={2}
        decay={1}
      />
    </group>
  );
};
