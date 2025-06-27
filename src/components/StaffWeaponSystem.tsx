
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
    // PERFORMANCE FIX: Only update every 3rd frame
    frameCount.current++;
    if (frameCount.current % 3 !== 0) return;

    if (!staffGroupRef.current || !camera) return;

    // Position staff - simplified calculation
    const staffOffset = new THREE.Vector3(2.0, -1.0, -4.0);
    const worldPosition = camera.position.clone().add(staffOffset);
    staffGroupRef.current.position.copy(worldPosition);
    
    // Simplified rotation
    staffGroupRef.current.rotation.copy(camera.rotation);
    staffGroupRef.current.rotateY(-0.3);
    staffGroupRef.current.rotateX(-0.1);

    // Update staff tip position (simplified)
    const staffTipOffset = new THREE.Vector3(0, 1.5, 0);
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
            scale={[1.0, 1.0, 1.0]}
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
      />
    </group>
  );
};

try {
  useGLTF.preload('staffs/staff_4.glb');
} catch (error) {
  console.warn('Failed to preload staff model:', error);
}
