
import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Group } from 'three';

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
      
      // Position weapon for first-person view - positioned relative to camera
      const cannonPosition = camera.position.clone()
        .add(cameraRight.clone().multiplyScalar(0.8))     // Move to the right
        .add(cameraUp.clone().multiplyScalar(-0.4))       // Move down slightly
        .add(cameraForward.clone().multiplyScalar(1.2));   // Move forward from camera

      weaponGroupRef.current.position.copy(cannonPosition);
      
      // Rotation to match camera orientation with adjustments for cannon
      weaponGroupRef.current.rotation.copy(camera.rotation);
      weaponGroupRef.current.rotateX(-Math.PI / 2);        // Aim down screen
      weaponGroupRef.current.rotateY(-15 * Math.PI / 180); // Slight inward angle
      weaponGroupRef.current.rotateZ(8 * Math.PI / 180);   // Slight tilt
    }
  });

  return (
    <group ref={weaponGroupRef}>
      {/* Procedural Sci-Fi Cannon - follows camera */}
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
