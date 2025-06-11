import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface Projectile {
  id: string;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  speed: number;
  damage: number;
  targetIndex: number;
}

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
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const lastFireTime = useRef(0);
  const projectileIdCounter = useRef(0);
  
  // Load staff model
  const { scene } = useGLTF('/staffs/staff_4.glb');
  
  // Calculate fire rate based on upgrades (slower to reduce lag)
  const fireRate = Math.max(500, 1200 - (upgrades * 150)); // Slower firing rate

  useFrame((state, delta) => {
    if (!staffGroupRef.current || !camera) return;

    // Position staff on the RIGHT side of the screen
    const staffOffset = new THREE.Vector3(2.0, -1.2, -2.0); // Far right, lower, forward
    
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
    
    // Rotate staff to follow camera and point forward
    staffGroupRef.current.rotation.copy(camera.rotation);
    staffGroupRef.current.rotateY(0.3); // Angle towards center from right side
    staffGroupRef.current.rotateX(-0.1); // Slight downward angle

    // Calculate staff tip position for projectile spawning (top of staff)
    const staffTipOffset = new THREE.Vector3(0, 1.5, 0); // Higher tip for bigger staff
    staffTipOffset.applyQuaternion(staffGroupRef.current.quaternion);
    const staffTipPosition = staffGroupRef.current.position.clone().add(staffTipOffset);

    // Auto-fire at closest enemy with reduced frequency
    const now = Date.now();
    if (now - lastFireTime.current >= fireRate && enemyPositions.length > 0) {
      // Find closest enemy
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      enemyPositions.forEach((enemyPos, index) => {
        const distance = staffTipPosition.distanceTo(enemyPos);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      // Create projectile from staff tip towards closest enemy
      const targetPosition = enemyPositions[closestIndex];
      const direction = new THREE.Vector3()
        .subVectors(targetPosition, staffTipPosition)
        .normalize();

      const newProjectile: Projectile = {
        id: `proj_${projectileIdCounter.current++}`,
        position: staffTipPosition.clone(),
        direction: direction,
        speed: 25, // Slightly faster projectiles
        damage: damage,
        targetIndex: closestIndex
      };

      setProjectiles(prev => [...prev, newProjectile]);
      lastFireTime.current = now;
    }

    // Update projectiles with performance optimization
    setProjectiles(prev => {
      const updatedProjectiles: Projectile[] = [];
      
      for (const projectile of prev) {
        // Move projectile
        const newPosition = projectile.position.clone()
          .add(projectile.direction.clone().multiplyScalar(projectile.speed * delta));
        
        // Check if projectile hit target
        const targetPos = enemyPositions[projectile.targetIndex];
        if (targetPos && newPosition.distanceTo(targetPos) < 2) {
          onHitEnemy(projectile.targetIndex, projectile.damage);
          continue; // Don't add to updated array (remove projectile)
        }
        
        // Remove projectile if too far
        if (newPosition.distanceTo(camera.position) > 80) {
          continue; // Don't add to updated array (remove projectile)
        }
        
        // Keep projectile
        updatedProjectiles.push({
          ...projectile,
          position: newPosition
        });
      }
      
      return updatedProjectiles;
    });
  });

  return (
    <group>
      {/* Staff model - BIGGER and on RIGHT side */}
      <group ref={staffGroupRef}>
        <primitive 
          object={scene.clone()} 
          scale={[0.8, 0.8, 0.8]} // Much bigger staff
          rotation={[0, Math.PI, 0]}
        />
      </group>

      {/* Render projectiles with reduced visual complexity for performance */}
      {projectiles.map(projectile => (
        <group key={projectile.id} position={projectile.position.toArray()}>
          <mesh>
            <sphereGeometry args={[0.08, 6, 6]} /> {/* Reduced geometry complexity */}
            <meshBasicMaterial color="#00ffff" /> {/* Basic material for performance */}
          </mesh>
          {/* Reduced lighting for performance - only every 3rd projectile gets light */}
          {projectile.id.endsWith('0') || projectile.id.endsWith('3') || projectile.id.endsWith('6') ? (
            <pointLight intensity={0.3} color="#00ffff" distance={2} />
          ) : null}
        </group>
      ))}
    </group>
  );
};

useGLTF.preload('/staffs/staff_4.glb');
