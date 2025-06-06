
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
  targetEnemyId?: string;
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
  
  // Slower auto-fire rate for more strategic combat
  const fireRate = Math.max(400, 1000 - (upgradeLevel * 50)); // Slower firing
  const lastFireTime = useRef(0);

  // Find closest living enemy for automatic targeting
  const findClosestEnemy = useCallback(() => {
    const livingEnemies = enemies.filter(enemy => enemy.currentHealth > 0);
    if (livingEnemies.length === 0) return null;

    let closest = livingEnemies[0];
    let closestDistance = camera.position.distanceTo(new Vector3(...closest.position));

    for (const enemy of livingEnemies) {
      const distance = camera.position.distanceTo(new Vector3(...enemy.position));
      if (distance < closestDistance) {
        closest = enemy;
        closestDistance = distance;
      }
    }

    // Only target enemies within reasonable range
    return closestDistance < 100 ? closest : null;
  }, [enemies, camera]);

  const createProjectile = useCallback((fromClick = false) => {
    const targetEnemy = findClosestEnemy();
    if (!targetEnemy) return; // Don't shoot if no targets

    const targetPosition = new Vector3(...targetEnemy.position);
    const direction = new Vector3()
      .subVectors(targetPosition, camera.position)
      .normalize();
    
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
      damage: projectileDamage, // Use the exact damage value from the system
      speed: 40, // Slower projectiles for more visible combat
      targetEnemyId: targetEnemy.id
    };

    setProjectiles(prev => [...prev, newProjectile]);
    console.log(`Projectile fired at enemy ${targetEnemy.id} with ${projectileDamage} damage`);
  }, [camera, projectileDamage, findClosestEnemy]);

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
    
    // Auto-fire at closest enemy
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
        
        // Check collision with enemies (prioritize target enemy)
        let hit = false;
        const hitRadius = 1.5; // Smaller hit radius for more precision
        
        // Check target enemy first
        if (projectile.targetEnemyId) {
          const targetEnemy = enemies.find(e => e.id === projectile.targetEnemyId && e.currentHealth > 0);
          if (targetEnemy) {
            const enemyPos = new Vector3(...targetEnemy.position);
            const distance = newPosition.distanceTo(enemyPos);
            
            if (distance < hitRadius) {
              onEnemyHit(targetEnemy.id, projectile.damage);
              hit = true;
            }
          }
        }
        
        // If target enemy wasn't hit, check all other enemies
        if (!hit) {
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
        }
        
        // Remove projectile if hit or too far
        const maxDistance = 150;
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
          <sphereGeometry args={[0.15, 6, 6]} />
          <meshStandardMaterial 
            color="#FFD700" 
            emissive="#FFD700" 
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};
