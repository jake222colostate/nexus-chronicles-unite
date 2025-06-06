import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import { WizardStaff } from './WizardStaff';
import { EnemyData } from './EnemySystem';

interface Projectile {
  id: string;
  position: Vector3;
  direction: Vector3;
}

interface WizardStaffWeaponProps {
  enemies: EnemyData[];
  onEnemyHit: (enemyId: string) => void;
}

export const WizardStaffWeapon: React.FC<WizardStaffWeaponProps> = ({
  enemies,
  onEnemyHit
}) => {
  const { camera } = useThree();
  const staffGroup = useRef<Group>(null);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);

  const shoot = useCallback(() => {
    const direction = new Vector3();
    camera.getWorldDirection(direction);
    const origin = camera.position.clone().add(direction.clone().multiplyScalar(1));
    setProjectiles(prev => [
      ...prev,
      { id: `proj_${Date.now()}_${Math.random()}`, position: origin, direction }
    ]);
  }, [camera]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        shoot();
      }
    };
    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [shoot]);

  useFrame((_, delta) => {
    setProjectiles(prev => {
      const updated: Projectile[] = [];
      for (const p of prev) {
        const newPos = p.position.clone().add(p.direction.clone().multiplyScalar(30 * delta));
        let hit = false;
        for (const enemy of enemies) {
          const ePos = new Vector3(...enemy.position);
          if (newPos.distanceTo(ePos) < 1) {
            onEnemyHit(enemy.id);
            hit = true;
            break;
          }
        }
        if (!hit && camera.position.distanceTo(newPos) < 200) {
          updated.push({ ...p, position: newPos });
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
      <WizardStaff />
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
