
import React, { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import { EnemyHealth } from '../hooks/useEnemyDamageSystem';

interface Projectile {
  id: string;
  position: Vector3;
  direction: Vector3;
  damage: number;
  speed: number;
}

interface ProjectileSystemProps {
  enemies: EnemyHealth[];
  onEnemyHit: (enemyId: string, damage: number) => void;
  projectileDamage: number;
  upgradeLevel: number;
}

export const ProjectileSystem: React.FC<ProjectileSystemProps> = ({
  enemies,
  onEnemyHit,
  projectileDamage,
  upgradeLevel
}) => {
  const { camera } = useThree();
  const groupRef = useRef<Group>(null);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  
  // Auto-fire based on upgrade level
  const fireRate = Math.max(300, 1000 - (upgradeLevel * 100)); // Faster with upgrades
  const lastFireTime = useRef(0);

  const createProjectile = useCallback((fromClick = false) => {
    const direction = new Vector3();
    camera.getWorldDirection(direction);
    
    // Offset projectile spawn position
    const spawnOffset = direction.clone().multiplyScalar(2);
    const rightOffset = new Vector3().crossVectors(direction, new Vector3(0, 1, 0)).multiplyScalar(0.3);
    const upOffset = new Vector3(0, -0.2, 0);
    
    const origin = camera.position.clone()
      .add(spawnOffset)
      .add(rightOffset)
      .add(upOffset);

    const newProjectile: Projectile = {
      id: `proj_${Date.now()}_${Math.random()}`,
      position: origin,
      direction: direction.normalize(),
      damage: projectileDamage,
      speed: 50
    };

    setProjectiles(prev => [...prev, newProjectile]);
  }, [camera, projectileDamage]);

  // Handle mouse click to shoot
  React.useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left click
        createProjectile(true);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [createProjectile]);

  useFrame((_, delta) => {
    const currentTime = Date.now();
    
    // Auto-fire
    if (currentTime - lastFireTime.current > fireRate) {
      createProjectile(false);
      lastFireTime.current = currentTime;
    }

    // Update projectiles and check collisions
    setProjectiles(prev => {
      const updated: Projectile[] = [];
      
      for (const projectile of prev) {
        // Move projectile
        const movement = projectile.direction.clone().multiplyScalar(projectile.speed * delta);
        const newPosition = projectile.position.clone().add(movement);
        
        // Check collision with enemies
        let hit = false;
        const hitRadius = 1.5; // Collision radius
        
        for (const enemy of enemies) {
          if (enemy.currentHealth <= 0) continue; // Skip dead enemies
          
          const enemyPos = new Vector3(...enemy.position);
          const distance = newPosition.distanceTo(enemyPos);
          
          if (distance < hitRadius) {
            onEnemyHit(enemy.id, projectile.damage);
            hit = true;
            break;
          }
        }
        
        // Remove projectile if hit or too far
        const maxDistance = 200;
        if (!hit && camera.position.distanceTo(newPosition) < maxDistance) {
          updated.push({
            ...projectile,
            position: newPosition
          });
        }
      }
      
      return updated;
    });
  });

  return (
    <group ref={groupRef}>
      {projectiles.map(projectile => (
        <mesh
          key={projectile.id}
          position={projectile.position.toArray() as [number, number, number]}
          castShadow
        >
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial 
            color="#FFD700" 
            emissive="#FFD700" 
            emissiveIntensity={0.5}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
};
