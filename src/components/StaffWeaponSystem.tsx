
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
  
  // UPDATED: Much slower auto-fire rate (3-5 seconds between shots)
  const autoFireRate = Math.max(3000, 5000 - (upgrades * 200)); // 3-5 seconds instead of 200-800ms

  useEffect(() => {
    const handleClick = () => {
      projectileSystemRef.current?.manualFire();
    };
    
    // Add click event to the canvas or window for manual shooting
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('click', handleClick);
      return () => canvas.removeEventListener('click', handleClick);
    } else {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, []);

  useFrame((state, delta) => {
    // PERFORMANCE FIX: Only update every 3rd frame
    frameCount.current++;
    if (frameCount.current % 3 !== 0) return;

    if (!staffGroupRef.current || !camera) return;

    // FIXED: Position staff much closer to player for better visibility
    const staffOffset = new THREE.Vector3(0.8, -0.5, -2.0); // Closer positioning
    const worldPosition = camera.position.clone().add(staffOffset);
    staffGroupRef.current.position.copy(worldPosition);
    
    // Simplified rotation - less dramatic angles
    staffGroupRef.current.rotation.copy(camera.rotation);
    staffGroupRef.current.rotateY(-0.2); // Reduced angle
    staffGroupRef.current.rotateX(-0.05); // Reduced angle

    // Update staff tip position for projectiles
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
        autoFireRate={autoFireRate}
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
