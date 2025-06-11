
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
  
  // Load staff model with error handling
  const { scene } = useGLTF('/staffs/staff_4.glb');
  
  // Calculate fire rate based on upgrades (faster with more upgrades)
  const fireRate = Math.max(200, 800 - (upgrades * 80));

  useFrame((state, delta) => {
    if (!staffGroupRef.current || !camera) return;

    // Position staff in bottom-right corner
    const staffOffset = new THREE.Vector3(0.45, -0.6, -1.2);
    
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
    
    // Rotate staff to follow camera
    staffGroupRef.current.rotation.copy(camera.rotation);
    staffGroupRef.current.rotateY(-0.08);
    staffGroupRef.current.rotateX(-0.12);

    // Update staff tip position for projectile system
    const staffTipOffset = new THREE.Vector3(0, 0.8, 0);
    staffTipOffset.applyQuaternion(staffGroupRef.current.quaternion);
    staffTipPositionRef.current.copy(staffGroupRef.current.position).add(staffTipOffset);
  });

  return (
    <group>
      {/* Staff model */}
      <group ref={staffGroupRef}>
        <primitive 
          object={scene.clone()} 
          scale={[0.25, 0.25, 0.25]}
          rotation={[0, Math.PI, 0]}
        />
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

useGLTF.preload('/staffs/staff_4.glb');
