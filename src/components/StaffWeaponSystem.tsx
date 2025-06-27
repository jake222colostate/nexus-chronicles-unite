
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
  const staffTipPositionRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const projectileSystemRef = useRef<OptimizedProjectileSystemHandle>(null);
  const frameCount = useRef(0);
  
  // Smooth position interpolation for less glitchy movement
  const targetPositionRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const currentPositionRef = useRef<THREE.Vector3>(new THREE.Vector3());
  
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
    // PERFORMANCE FIX: Only update every 2nd frame instead of 3rd for smoother movement
    frameCount.current++;
    if (frameCount.current % 2 !== 0) return;

    if (!staffGroupRef.current || !camera) return;

    // FIXED: Lowered staff position and smoother positioning
    const staffOffset = new THREE.Vector3(0.6, -0.8, -1.8); // Y lowered from -0.5 to -0.8
    targetPositionRef.current.copy(camera.position).add(staffOffset);
    
    // FIXED: Smooth interpolation to reduce glitchy movement
    currentPositionRef.current.lerp(targetPositionRef.current, 0.1);
    staffGroupRef.current.position.copy(currentPositionRef.current);
    
    // FIXED: Smoother rotation with less dramatic changes
    const targetRotation = camera.rotation.clone();
    staffGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      staffGroupRef.current.rotation.x, 
      targetRotation.x - 0.05, 
      0.1
    );
    staffGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      staffGroupRef.current.rotation.y, 
      targetRotation.y - 0.15, 
      0.1
    );
    staffGroupRef.current.rotation.z = THREE.MathUtils.lerp(
      staffGroupRef.current.rotation.z, 
      targetRotation.z, 
      0.1
    );

    // Update staff tip position for projectiles with smooth movement
    const staffTipOffset = new THREE.Vector3(0, 1.2, 0);
    staffTipPositionRef.current.copy(staffGroupRef.current.position).add(staffTipOffset);
  });

  // Simplified fallback staff
  const createFallbackStaff = () => (
    <group>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 2, 6]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshStandardMaterial 
          color="#4B0082" 
          emissive="#4B0082" 
          emissiveIntensity={0.5} 
        />
      </mesh>
    </group>
  );

  return (
    <group>
      <group ref={staffGroupRef}>
        {staffScene ? (
          <primitive 
            object={staffScene.clone()} 
            scale={[1.2, 1.2, 1.2]}
            rotation={[0, Math.PI, 0]}
          />
        ) : (
          createFallbackStaff()
        )}
      </group>

      <OptimizedProjectileSystem
        ref={projectileSystemRef}
        staffTipPosition={staffTipPositionRef.current}
        targetPositions={enemyPositions}
        damage={damage}
        fireRate={fireRate}
        onHitEnemy={onHitEnemy}
        upgrades={upgrades}
      />
    </group>
  );
};

try {
  useGLTF.preload('staffs/staff_4.glb');
} catch (error) {
  console.warn('Failed to preload staff model:', error);
}
