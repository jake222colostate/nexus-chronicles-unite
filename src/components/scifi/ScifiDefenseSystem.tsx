import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Vector3, Group } from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { ScifiCannon } from './ScifiCannon';
import { Asteroid } from './Asteroid';

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
}

export const ScifiDefenseSystem: React.FC<ScifiDefenseSystemProps> = ({ onMeteorDestroyed }) => {
  const [asteroids, setAsteroids] = useState<SpawnedAsteroid[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const spawnIntervalRef = useRef<NodeJS.Timeout>();
  const fireIntervalRef = useRef<NodeJS.Timeout>();
  const cannonGroup = useRef<Group>(null);
  const { camera } = useThree();

  useEffect(() => {
    spawnIntervalRef.current = setInterval(() => {
      setAsteroids(prev => {
        if (prev.length >= 3) return prev;
        const spawnDist = 20;
        const x = (Math.random() - 0.5) * 6;
        const y = Math.random() * 5 + 2;
        const spawnPos = new Vector3(x, y, camera.position.z - spawnDist);
        const target = UPGRADE_TARGETS[Math.floor(Math.random() * UPGRADE_TARGETS.length)];
        const dir = target.clone().sub(spawnPos).normalize();
        return [
          ...prev,
          {
            id: Date.now(),
            position: spawnPos,
            velocity: dir.multiplyScalar(0.05),
            health: 5
          }
        ];
      });
    }, 4000);
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
          for (const ast of asteroids) {
            if (newPos.distanceTo(ast.position) < 0.7) {
              handleAsteroidHit(ast.id, 1);
              hit = true;
              break;
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
      {asteroids.map(ast => (
        <Asteroid key={ast.id} position={ast.position} health={ast.health} />
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
