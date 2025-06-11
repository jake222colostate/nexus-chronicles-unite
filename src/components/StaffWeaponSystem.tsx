
import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { OptimizedProjectileSystem } from './OptimizedProjectileSystem';

interface StaffWeaponSystemProps {
  damage: number;
  enemyPositions: THREE.Vector3[];
  onHitEnemy: (index: number, damage: number) => void;
  upgrades: number;
}

export const StaffWeaponSystem: React.FC<StaffWeaponSystemProps> = ({
  damage,
  enemyPositions,
  onHitEnemy,
  upgrades
}) => {
  const { camera } = useThree();
  const staffGroupRef = useRef<THREE.Group>(null);
  const staffTipPositionRef = useRef<THREE.Vector3>(new THREE.Vector3());
  
  // Load staff model with proper path and error handling
  let staffScene = null;
  try {
    const { scene } = useGLTF('staffs/staff_4.glb');
    staffScene = scene;
  } catch (error) {
    console.warn('Failed to load staff model, using fallback:', error);
  }
  
  // Calculate fire rate based on upgrades (faster with more upgrades)
  const fireRate = Math.max(200, 800 - (upgrades * 80));

  useFrame((state, delta) => {
    if (!staffGroupRef.current || !camera) return;

    // Position staff in front and to the right of camera - much more visible
    const staffOffset = new THREE.Vector3(1.2, -0.8, -2.5); // Further right, lower, and farther away
    
    // Get camera vectors for positioning
    const cameraRight = new THREE.Vector3();
    const cameraUp = new THREE.Vector3();
    const cameraForward = new THREE.Vector3();
    
    camera.getWorldDirection(cameraForward);
    cameraRight.crossVectors(cameraUp.set(0, 1, 0), cameraForward).normalize();
    cameraUp.crossVectors(cameraForward, cameraRight).normalize();
    
    // Calculate world position relative to camera
    const worldOffset = new THREE.Vector3()
      .addScaledVector(cameraRight, staffOffset.x)
      .addScaledVector(cameraUp, staffOffset.y)
      .addScaledVector(cameraForward, -staffOffset.z);
    
    const worldPosition = camera.position.clone().add(worldOffset);
    staffGroupRef.current.position.copy(worldPosition);
    
    // Rotate staff to point forward like being held
    staffGroupRef.current.rotation.copy(camera.rotation);
    staffGroupRef.current.rotateY(-0.4); // Angle towards center
    staffGroupRef.current.rotateX(-0.1); // Slight downward angle
    staffGroupRef.current.rotateZ(0.15); // Slight tilt like being held

    // Update staff tip position for projectile system (at the top of the staff)
    const staffTipOffset = new THREE.Vector3(0, 1.5, 0); // Higher up the staff
    staffTipOffset.applyQuaternion(staffGroupRef.current.quaternion);
    staffTipPositionRef.current.copy(staffGroupRef.current.position).add(staffTipOffset);
    
    // Debug log to see staff position
    console.log('Staff position:', staffGroupRef.current.position);
  });

  // Create fallback staff if model fails to load
  const createFallbackStaff = () => (
    <group>
      {/* Staff handle */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 3, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Staff crystal */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.2, 12, 8]} />
        <meshStandardMaterial 
          color="#4B0082" 
          emissive="#4B0082" 
          emissiveIntensity={0.8} 
        />
      </mesh>
      {/* Glow around crystal */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.25, 12, 8]} />
        <meshBasicMaterial 
          color="#4B0082" 
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );

  return (
    <group>
      {/* Staff model */}
      <group ref={staffGroupRef}>
        {staffScene ? (
          <primitive 
            object={staffScene.clone()} 
            scale={[1.0, 1.0, 1.0]} // Even bigger and more visible
            rotation={[0, Math.PI, 0]}
          />
        ) : (
          createFallbackStaff()
        )}
      </group>

      {/* Optimized projectile system */}
      <OptimizedProjectileSystem
        staffTipPosition={staffTipPositionRef.current}
        targetPositions={enemyPositions}
        damage={damage}
        fireRate={fireRate}
        onHitEnemy={onHitEnemy}
      />
    </group>
  );
};

// Preload with correct path
try {
  useGLTF.preload('staffs/staff_4.glb');
} catch (error) {
  console.warn('Failed to preload staff model:', error);
}
