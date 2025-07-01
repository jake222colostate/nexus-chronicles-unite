import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Vector3, Group } from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { ScifiCannon } from './ScifiCannon';
import { Asteroid } from './Asteroid';
import { useCollisionContext } from '../../lib/CollisionContext';

const UPGRADE_TARGETS = [
  new Vector3(0, 4, 0),
  new Vector3(-2, 2.5, -1),
  new Vector3(2, 2.5, -1),
  new Vector3(-3, 1, -2),
  new Vector3(0, 1, -2),
  new Vector3(3, 1, -2),
  new Vector3(-1, -0.5, -3),
  new Vector3(0, -2, -4)
];

interface SpawnedUpgrade {
  id: number;
  position: Vector3;
  velocity: Vector3;
  health: number;
  upgradeId: string;
}

interface Projectile {
  id: number;
  position: Vector3;
  direction: Vector3;
  speed: number;
}

interface ScifiDefenseSystemProps {
  onMeteorDestroyed?: () => void;
  onEnergyGained?: (amount: number) => void;
  onUpgradeClick?: (upgradeId: string) => void;
  purchasedUpgrades?: string[];
}

export const ScifiDefenseSystem: React.FC<ScifiDefenseSystemProps> = ({ 
  onMeteorDestroyed, 
  onEnergyGained, 
  onUpgradeClick,
  purchasedUpgrades = []
}) => {
  const [upgrades, setUpgrades] = useState<SpawnedUpgrade[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const spawnIntervalRef = useRef<NodeJS.Timeout>();
  const fireIntervalRef = useRef<NodeJS.Timeout>();
  const cannonGroup = useRef<Group>(null);
  const { camera } = useThree();
  const collisionContext = useCollisionContext();

  useEffect(() => {
    spawnIntervalRef.current = setInterval(() => {
      setUpgrades(prev => {
        if (prev.length >= 6) return prev; // Spawn more upgrades
        const spawnDist = 20;
        const x = (Math.random() - 0.5) * 8;
        const y = Math.random() * 6 + 2;
        const spawnPos = new Vector3(x, y, camera.position.z - spawnDist);
        const target = UPGRADE_TARGETS[Math.floor(Math.random() * UPGRADE_TARGETS.length)];
        const dir = target.clone().sub(spawnPos).normalize();
        return [
          ...prev,
          {
            id: Date.now(),
            position: spawnPos,
            velocity: dir.multiplyScalar(0.03), // Slower movement
            health: 5,
            upgradeId: `floating-upgrade-${Date.now()}`
          }
        ];
      });
    }, 3000); // Spawn more frequently
    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    };
  }, [camera]);

  const isUpgradeVisible = useCallback(
    (pos: Vector3) => {
      const ndc = pos.clone().project(camera);
      return (
        Math.abs(ndc.x) <= 1 &&
        Math.abs(ndc.y) <= 1 &&
        ndc.z >= -1 &&
        ndc.z <= 1
      );
    },
    [camera]
  );

  const handleUpgradeClick = useCallback((upgradeId: string) => {
    onUpgradeClick?.(upgradeId);
    // Remove the clicked upgrade
    setUpgrades(prev => prev.filter(u => u.upgradeId !== upgradeId));
  }, [onUpgradeClick]);

  const handleUpgradeHit = useCallback((id: number, damage: number) => {
    let destroyed = false;
    setUpgrades(prev =>
      prev
        .map(u => {
          if (u.id === id) {
            const newHealth = u.health - damage;
            destroyed = newHealth <= 0;
            return { ...u, health: newHealth };
          }
          return u;
        })
        .filter(u => u.health > 0)
    );
    if (destroyed) {
      onMeteorDestroyed?.();
      onEnergyGained?.(10); // Grant 10 energy for destroying an upgrade
    }
  }, [onMeteorDestroyed, onEnergyGained]);

  const offset = useRef(new Vector3(0, -1.5, -3));
  useFrame(() => {
    if (cannonGroup.current) {
      cannonGroup.current.position.copy(camera.position).add(offset.current);
      cannonGroup.current.quaternion.copy(camera.quaternion);
    }
  });

  // Remove auto-firing - let players click upgrades instead
  useEffect(() => {
    const handleClick = () => {
      if (!cannonGroup.current) return;
      const visible = upgrades.filter(u => isUpgradeVisible(u.position));
      if (visible.length === 0) return;
      const start = new Vector3();
      cannonGroup.current.getWorldPosition(start);
      const targetPos = visible[0].position.clone();
      const dir = targetPos.clone().sub(start).normalize();
      setProjectiles(prev => [
        ...prev,
        { id: Date.now(), position: start, direction: dir, speed: 0.5 }
      ]);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [upgrades, isUpgradeVisible]);

  useFrame(() => {
    setUpgrades(prev => {
      const updated = prev.map(u => ({ ...u, position: u.position.clone().add(u.velocity) }));
      return updated.filter(u => u.position.z < camera.position.z);
    });

    setProjectiles(prev => {
      return prev
        .map(p => {
          const newPos = p.position.clone().add(p.direction.clone().multiplyScalar(p.speed));
          let hit = false;
          
          // Use collision context for accurate hit detection
          if (collisionContext?.colliders.current) {
            for (const [colliderId, collider] of collisionContext.colliders.current) {
              if (colliderId.startsWith('asteroid-')) {
                const distance = newPos.distanceTo(collider.position);
                if (distance < collider.radius) {
                  // Find the upgrade by position to get its ID
                  const upgrade = upgrades.find(upg => 
                    upg.position.distanceTo(collider.position) < 0.1
                  );
                  if (upgrade) {
                    handleUpgradeHit(upgrade.id, 1);
                    hit = true;
                    break;
                  }
                }
              }
            }
          } else {
            // Fallback to simple distance check if collision context not available
            for (const upg of upgrades) {
              if (newPos.distanceTo(upg.position) < 0.7) {
                handleUpgradeHit(upg.id, 1);
                hit = true;
                break;
              }
            }
          }
          
          if (hit || newPos.distanceTo(camera.position) > 50) return null;
          return { ...p, position: newPos } as Projectile;
        })
        .filter(Boolean) as Projectile[];
    });
  });

  const target = upgrades[0] ? upgrades[0].position.clone() : undefined;

  return (
    <group>
      <group ref={cannonGroup}>
        <ScifiCannon target={target} />
      </group>
      {upgrades.map((upg, index) => (
        <Asteroid 
          key={upg.id} 
          position={upg.position} 
          health={upg.health} 
          isUpgrade={true}
          upgradeId={upg.upgradeId}
          onUpgradeClick={handleUpgradeClick}
          upgradeIndex={index}
        />
      ))}
      {projectiles.map(p => (
        <mesh key={p.id} position={p.position}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
      ))}
    </group>
  );
};