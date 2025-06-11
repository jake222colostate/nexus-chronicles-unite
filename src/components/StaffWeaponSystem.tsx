
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
  
  // Calculate fire rate based on upgrades (1 second base, faster with upgrades)
  const fireRate = Math.max(300, 1000 - (upgrades * 100)); // Faster with more upgrades

  useFrame((state, delta) => {
    if (!staffGroupRef.current || !camera) return;

    // Position staff in bottom-right corner, but visible on screen
    const staffOffset = new THREE.Vector3(0.5, -0.6, -1.5); // Closer to center, forward of camera
    
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
    staffGroupRef.current.rotateY(-0.1); // Slight angle towards center
    staffGroupRef.current.rotateX(-0.15); // Angle down slightly

    // Calculate staff tip position for projectile spawning (top of staff)
    const staffTipOffset = new THREE.Vector3(0, 1.0, 0); // Top of staff
    staffTipOffset.applyQuaternion(staffGroupRef.current.quaternion);
    const staffTipPosition = staffGroupRef.current.position.clone().add(staffTipOffset);

    // Auto-fire at closest enemy
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
        speed: 20,
        damage: damage,
        targetIndex: closestIndex
      };

      setProjectiles(prev => [...prev, newProjectile]);
      lastFireTime.current = now;
    }

    // Update projectiles
    setProjectiles(prev => {
      return prev.map(projectile => {
        // Move projectile
        const newPosition = projectile.position.clone()
          .add(projectile.direction.clone().multiplyScalar(projectile.speed * delta));
        
        // Check if projectile hit target
        const targetPos = enemyPositions[projectile.targetIndex];
        if (targetPos && newPosition.distanceTo(targetPos) < 2) {
          onHitEnemy(projectile.targetIndex, projectile.damage);
          return null; // Remove projectile
        }
        
        // Remove projectile if too far
        if (newPosition.distanceTo(camera.position) > 100) {
          return null;
        }
        
        return {
          ...projectile,
          position: newPosition
        };
      }).filter(Boolean) as Projectile[];
    });
  });

  return (
    <group>
      {/* Staff model */}
      <group ref={staffGroupRef}>
        <primitive 
          object={scene.clone()} 
          scale={[0.3, 0.3, 0.3]} // Smaller scale to fit better on screen
          rotation={[0, Math.PI, 0]}
        />
      </group>

      {/* Render projectiles */}
      {projectiles.map(projectile => (
        <group key={projectile.id} position={projectile.position.toArray()}>
          <mesh>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
          </mesh>
          {/* Glowing effect */}
          <pointLight intensity={0.5} color="#00ffff" distance={3} />
        </group>
      ))}
    </group>
  );
};

useGLTF.preload('/staffs/staff_4.glb');
