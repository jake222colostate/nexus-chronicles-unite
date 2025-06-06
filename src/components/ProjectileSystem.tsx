import React, { useState, useCallback, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { EnemyData } from './EnemySystem';

interface Projectile {
  id: string;
  position: Vector3;
  direction: Vector3;
  damage: number;
  speed: number;
  age: number;
  type: 'wizard' | 'auto';
}

interface ProjectileSystemProps {
  enemies: EnemyData[];
  upgradeDamage: number;
  onEnemyHit: (enemyId: string, damage: number) => void;
  onProjectileCreate?: (projectile: Projectile) => void;
}

export const ProjectileSystem: React.FC<ProjectileSystemProps> = ({
  enemies,
  upgradeDamage,
  onEnemyHit,
  onProjectileCreate
}) => {
  const { camera } = useThree();
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const lastShot = useRef(0);

  const createProjectile = useCallback((
    origin: Vector3,
    direction: Vector3,
    damage: number,
    type: 'wizard' | 'auto' = 'wizard'
  ) => {
    const projectile: Projectile = {
      id: `proj_${Date.now()}_${Math.random()}`,
      position: origin.clone(),
      direction: direction.normalize(),
      damage: damage + upgradeDamage,
      speed: type === 'wizard' ? 25 : 20,
      age: 0,
      type
    };

    setProjectiles(prev => [...prev, projectile]);
    
    if (onProjectileCreate) {
      onProjectileCreate(projectile);
    }

    return projectile;
  }, [upgradeDamage, onProjectileCreate]);

  const shootAtTarget = useCallback((target: Vector3, damage: number = 5) => {
    const now = performance.now();
    if (now - lastShot.current < 500) return; // Rate limiting

    const origin = camera.position.clone();
    const direction = new Vector3().subVectors(target, origin).normalize();
    
    createProjectile(origin, direction, damage, 'wizard');
    lastShot.current = now;
  }, [camera, createProjectile]);

  useFrame((_, delta) => {
    // Update projectiles
    setProjectiles(prev => {
      const updated: Projectile[] = [];
      
      for (const projectile of prev) {
        // Move projectile
        const movement = projectile.direction.clone().multiplyScalar(projectile.speed * delta);
        const newPos = projectile.position.clone().add(movement);
        const newAge = projectile.age + delta;
        
        // Check collision with enemies
        let hit = false;
        const hitRadius = 1.2;
        
        for (const enemy of enemies) {
          const enemyPos = new Vector3(...enemy.position);
          const distance = newPos.distanceTo(enemyPos);
          
          if (distance < hitRadius) {
            onEnemyHit(enemy.id, projectile.damage);
            hit = true;
            break;
          }
        }
        
        // Keep projectile if not hit and still valid
        if (!hit && newAge < 5 && camera.position.distanceTo(newPos) < 50) {
          updated.push({
            ...projectile,
            position: newPos,
            age: newAge
          });
        }
      }
      
      return updated;
    });
  });

  return (
    <group>
      {projectiles.map(projectile => (
        <mesh
          key={projectile.id}
          position={projectile.position.toArray() as [number, number, number]}
          castShadow
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial 
            color={projectile.type === 'wizard' ? '#ffff00' : '#00ffff'}
            emissive={projectile.type === 'wizard' ? '#ffff00' : '#00ffff'}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
};

export { type Projectile };
