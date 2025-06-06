import React, { useState, useCallback, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import { WizardStaff } from './WizardStaff';
import { EnemyData } from './EnemySystem';

interface Projectile {
  id: string;
  position: Vector3;
  direction: Vector3;
  damage: number;
  speed: number;
  age: number;
}

interface WizardStaffWeaponProps {
  enemies: EnemyData[];
  weaponStats: { damage: number; fireRate: number; range: number };
  onEnemyHit: (enemyId: string, damage: number) => void;
}

export const WizardStaffWeapon: React.FC<WizardStaffWeaponProps> = ({
  enemies,
  weaponStats,
  onEnemyHit
}) => {
  const { camera } = useThree();
  const staffGroup = useRef<Group>(null);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const lastShot = useRef(0);

  const shoot = useCallback((direction: Vector3) => {
    const origin = camera.position.clone();
    setProjectiles(prev => [
      ...prev,
      {
        id: `proj_${Date.now()}_${Math.random()}`,
        position: origin.clone(),
        direction,
        damage: weaponStats.damage,
        speed: 20 + weaponStats.damage * 5,
        age: 0
      }
    ]);
  }, [camera, weaponStats.damage]);

  useFrame((_, delta) => {
    const now = performance.now();
    if (now - lastShot.current > weaponStats.fireRate) {
      const target = enemies
        .filter(e => new Vector3(...e.position).distanceTo(camera.position) <= weaponStats.range)
        .sort((a, b) =>
          new Vector3(...a.position).distanceTo(camera.position) -
          new Vector3(...b.position).distanceTo(camera.position)
        )[0];

      const direction = target
        ? new Vector3(...target.position).sub(camera.position).normalize()
        : camera.getWorldDirection(new Vector3());

      shoot(direction);
      lastShot.current = now;
    }

    setProjectiles(prev => {
      const updated: Projectile[] = [];
      for (const p of prev) {
        const newPos = p.position.clone().add(p.direction.clone().multiplyScalar(p.speed * delta));
        const age = p.age + delta;
        let hit = false;
        for (const enemy of enemies) {
          const ePos = new Vector3(...enemy.position);
          if (newPos.distanceTo(ePos) < 1) {
            onEnemyHit(enemy.id, p.damage);
            hit = true;
            break;
          }
        }
        if (!hit && age < 3 && camera.position.distanceTo(newPos) < weaponStats.range * 1.5) {
          updated.push({ ...p, position: newPos, age });
        }
      }
      return updated;
    });

    if (staffGroup.current) {
      staffGroup.current.position.copy(camera.position);
      staffGroup.current.rotation.copy(camera.rotation);
    }
  });

  return (
    <group ref={staffGroup}>
      <WizardStaff visible />
      {projectiles.map(p => (
        <mesh
          key={p.id}
          position={p.position.toArray() as [number, number, number]}
          castShadow
        >
          <sphereGeometry args={[0.1, 6, 6]} />
          <meshStandardMaterial color="yellow" emissive="yellow" />
        </mesh>
      ))}
    </group>
  );
};
