
import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import {
  OptimizedProjectileSystem,
  OptimizedProjectileSystemHandle
} from './OptimizedProjectileSystem';

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
  const staffTipPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const projectileSystemRef = useRef<OptimizedProjectileSystemHandle>(null);
  
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

  useEffect(() => {
    const handleClick = () => {
      projectileSystemRef.current?.manualFire();
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useFrame((state, delta) => {
    if (!staffGroupRef.current || !camera) return;

    // Position staff MUCH farther away and to the side - very visible
    const staffOffset = new THREE.Vector3(3.0, -1.5, -6.0); // Much further right, lower, and much farther away
    
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
    staffGroupRef.current.rotateY(-0.5); // More angle towards center
    staffGroupRef.current.rotateX(-0.2); // More downward angle
    staffGroupRef.current.rotateZ(0.2); // More tilt like being held

    // FIXED: Update staff tip position for projectile system (at the top of the staff)
    const staffTipOffset = new THREE.Vector3(0, 2.0, 0); // Even higher up the staff
    staffTipOffset.applyQuaternion(staffGroupRef.current.quaternion);
    staffTipPositionRef.current.copy(staffGroupRef.current.position).add(staffTipOffset);
    
    // Debug log to see staff position
    console.log('Staff position:', staffGroupRef.current.position);
    console.log('Staff tip position:', staffTipPositionRef.current);
  });

  // Create fallback staff if model fails to load - much bigger and brighter
  const createFallbackStaff = () => (
    <group>
      {/* Staff handle - much bigger */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 4, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Staff crystal - much bigger and brighter */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.4, 12, 8]} />
        <meshStandardMaterial 
          color="#4B0082" 
          emissive="#4B0082" 
          emissiveIntensity={1.2} 
        />
      </mesh>
      {/* Glow around crystal - much more visible */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.5, 12, 8]} />
        <meshBasicMaterial 
          color="#4B0082" 
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Additional bright light source */}
      <pointLight position={[0, 2.2, 0]} color="#4B0082" intensity={2} distance={10} />
    </group>
  );

  return (
    <group>
      {/* Staff model - much bigger and with lighting */}
      <group ref={staffGroupRef}>
        {staffScene ? (
          <primitive 
            object={staffScene.clone()} 
            scale={[2.0, 2.0, 2.0]} // Much bigger and more visible
            rotation={[0, Math.PI, 0]}
          />
        ) : (
          createFallbackStaff()
        )}
        {/* Add a bright light at the staff position to make it more visible */}
        <pointLight position={[0, 1, 0]} color="#ffffff" intensity={1} distance={5} />
      </group>

      {/* Optimized projectile system - FIXED: Pass current staff tip position */}
      <OptimizedProjectileSystem
        ref={projectileSystemRef}
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
