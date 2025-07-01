
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

interface SpawnedAsteroid {
  id: number;
  position: Vector3;
  velocity: Vector3;
  health: number;
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
}

export const ScifiDefenseSystem: React.FC<ScifiDefenseSystemProps> = ({ onMeteorDestroyed, onEnergyGained }) => {
  const [asteroids, setAsteroids] = useState<SpawnedAsteroid[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const spawnIntervalRef = useRef<NodeJS.Timeout>();
  const fireIntervalRef = useRef<NodeJS.Timeout>();
  const cannonGroup = useRef<Group>(null);
  const { camera } = useThree();
  const collisionContext = useCollisionContext();

  useEffect(() => {
    spawnIntervalRef.current = setInterval(() => {
      setAsteroids(prev => {
        if (prev.length >= 5) return prev; // Spawn more upgrades
        const spawnDist = 15;
        const x = (Math.random() - 0.5) * 8;
        const y = Math.random() * 6 + 1;
        const spawnPos = new Vector3(x, y, camera.position.z - spawnDist);
        
        // Slow floating movement for upgrades
        const floatDir = new Vector3(
          (Math.random() - 0.5) * 0.02,
          Math.sin(Date.now() * 0.001) * 0.01,
          0.01
        );
        
        return [
          ...prev,
          {
            id: Date.now(),
            position: spawnPos,
            velocity: floatDir,
            health: 1 // Upgrades don't need health
          }
        ];
      });
    }, 3000); // Spawn upgrades more frequently
    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    };
  }, [camera]);

  const isAsteroidVisible = useCallback(
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

  useEffect(() => {
    const handleClick = () => {
      if (!cannonGroup.current) return;
      const visible = asteroids.filter(a => isAsteroidVisible(a.position));
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
  }, [asteroids, isAsteroidVisible]);

  const handleAsteroidHit = useCallback((id: number, damage: number) => {
    let destroyed = false;
    setAsteroids(prev =>
      prev
        .map(a => {
          if (a.id === id) {
            const newHealth = a.health - damage;
            destroyed = newHealth <= 0;
            return { ...a, health: newHealth };
          }
          return a;
        })
        .filter(a => a.health > 0)
    );
    if (destroyed) {
      onMeteorDestroyed?.();
      onEnergyGained?.(10); // Grant 10 energy for destroying a meteor
    }
  }, [onMeteorDestroyed]);

  const offset = useRef(new Vector3(0, -1.5, -3));
  useFrame(() => {
    if (cannonGroup.current) {
      cannonGroup.current.position.copy(camera.position).add(offset.current);
      cannonGroup.current.quaternion.copy(camera.quaternion);
    }
  });

  useEffect(() => {
    fireIntervalRef.current = setInterval(() => {
      if (!cannonGroup.current) return;
      const visible = asteroids.filter(a => isAsteroidVisible(a.position));
      if (visible.length === 0) return;
      const start = new Vector3();
      cannonGroup.current.getWorldPosition(start);
      const targetPos = visible[0].position.clone();
      const dir = targetPos.clone().sub(start).normalize();
      setProjectiles(prev => [
        ...prev,
        { id: Date.now(), position: start, direction: dir, speed: 0.5 }
      ]);
    }, 1000);
    return () => {
      if (fireIntervalRef.current) clearInterval(fireIntervalRef.current);
    };
  }, [asteroids, isAsteroidVisible]);

  useFrame(() => {
    setAsteroids(prev => {
      const updated = prev.map(a => ({ ...a, position: a.position.clone().add(a.velocity) }));
      return updated.filter(a => a.position.z < camera.position.z);
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
                  // Find the asteroid by position to get its ID
                  const asteroid = asteroids.find(ast => 
                    ast.position.distanceTo(collider.position) < 0.1
                  );
                  if (asteroid) {
                    handleAsteroidHit(asteroid.id, 1);
                    hit = true;
                    break;
                  }
                }
              }
            }
          } else {
            // Fallback to simple distance check if collision context not available
            for (const ast of asteroids) {
              if (newPos.distanceTo(ast.position) < 0.7) {
                handleAsteroidHit(ast.id, 1);
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

  const target = asteroids[0] ? asteroids[0].position.clone() : undefined;

  return (
    <group>
      <group ref={cannonGroup}>
        <ScifiCannon target={target} />
      </group>
      {asteroids.map((ast, index) => (
        <Asteroid 
          key={ast.id} 
          position={ast.position} 
          health={ast.health} 
          isUpgrade={true}
          upgradeId={`floating-upgrade-${ast.id}`}
          upgradeIndex={index}
          onUpgradeClick={(upgradeId) => {
            onEnergyGained?.(25); // Grant energy for clicking upgrade
            onMeteorDestroyed?.(); // Remove upgrade after click
            setAsteroids(prev => prev.filter(a => a.id !== ast.id));
          }}
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
