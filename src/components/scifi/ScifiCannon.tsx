
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
      
      // Position weapon for first-person view - optimized for better visibility
      const cannonPosition = camera.position.clone()
        .add(cameraRight.clone().multiplyScalar(0.8))     // X = 0.8 (more to the right)
        .add(cameraUp.clone().multiplyScalar(-0.4))       // Y = -0.4 (lower for better view)
        .add(cameraForward.clone().multiplyScalar(1.2));   // Z = 1.2 (closer to camera)

      weaponGroupRef.current.position.copy(cannonPosition);
      
      // Rotation to match camera orientation with adjustments for cannon
      weaponGroupRef.current.rotation.copy(camera.rotation);
      weaponGroupRef.current.rotateY(-15 * Math.PI / 180); // Y = -15° more inward angle
      weaponGroupRef.current.rotateZ(8 * Math.PI / 180);   // Z = 8° slight tilt
      weaponGroupRef.current.rotateX(-5 * Math.PI / 180);  // X = -5° more downward
      
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
      {/* Procedural Sci-Fi Cannon - scaled up for better visibility */}
      <group scale={[1.2, 1.2, 1.2]} rotation={[0, 0, 0]}>
        {/* Main barrel - longer and thicker */}
        <mesh position={[0, 0, -0.6]}>
          <cylinderGeometry args={[0.08, 0.1, 1.5, 8]} />
          <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Barrel tip - more prominent */}
        <mesh position={[0, 0, -1.35]}>
          <cylinderGeometry args={[0.05, 0.08, 0.15, 8]} />
          <meshStandardMaterial color="#2d3748" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Main body - larger */}
        <mesh position={[0, 0, 0.25]}>
          <boxGeometry args={[0.25, 0.18, 0.7]} />
          <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Grip - more visible */}
        <mesh position={[0, -0.18, 0.5]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.1, 0.35, 0.12]} />
          <meshStandardMaterial color="#1a202c" metalness={0.5} roughness={0.4} />
        </mesh>
        
        {/* Trigger guard - larger */}
        <mesh position={[0, -0.12, 0.25]}>
          <torusGeometry args={[0.08, 0.025, 8, 16]} />
          <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Side details - more prominent glow */}
        <mesh position={[0.1, 0.06, 0.15]}>
          <boxGeometry args={[0.05, 0.03, 0.35]} />
          <meshStandardMaterial color="#63b3ed" metalness={0.9} roughness={0.1} emissive="#1e40af" emissiveIntensity={0.4} />
        </mesh>
        
        <mesh position={[-0.1, 0.06, 0.15]}>
          <boxGeometry args={[0.05, 0.03, 0.35]} />
          <meshStandardMaterial color="#63b3ed" metalness={0.9} roughness={0.1} emissive="#1e40af" emissiveIntensity={0.4} />
        </mesh>
        
        {/* Scope - more visible */}
        <mesh position={[0, 0.15, -0.25]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
          <meshStandardMaterial color="#1a202c" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Additional detail - power core */}
        <mesh position={[0, 0.08, 0.4]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#00ffff" metalness={0.9} roughness={0.1} emissive="#00ffff" emissiveIntensity={0.6} />
        </mesh>
      </group>
      
      {/* Enhanced muzzle glow effect */}
      <pointLight 
        position={[0, 0, -1.35]} 
        color="#00ffff" 
        intensity={0.8} 
        distance={4}
        decay={2}
      />
      
      {/* Weapon highlight light - brighter */}
      <pointLight 
        position={[0, 0.25, 0]} 
        color="#4299e1" 
        intensity={0.5} 
        distance={3}
        decay={1}
      />
    </group>
  );
};
