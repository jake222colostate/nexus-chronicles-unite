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

export const ScifiDefenseSystem: React.FC = () => {
  const [asteroids, setAsteroids] = useState<SpawnedAsteroid[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const spawnIntervalRef = useRef<NodeJS.Timeout>();
  const fireIntervalRef = useRef<NodeJS.Timeout>();
  const cannonGroup = useRef<Group>(null);
  const { camera } = useThree();

  useEffect(() => {
    spawnIntervalRef.current = setInterval(() => {
      const spawnDist = 20;
      const side = Math.random() < 0.5 ? -1 : 1;
      const x = side * (10 + Math.random() * 5);
      const y = Math.random() * 5 + 2;
      const spawnPos = new Vector3(x, y, camera.position.z + spawnDist);
      const target = UPGRADE_TARGETS[Math.floor(Math.random() * UPGRADE_TARGETS.length)];
      const dir = target.clone().sub(spawnPos).normalize();
      setAsteroids(prev => [
        ...prev,
        {
          id: Date.now(),
          position: spawnPos,
          velocity: dir.multiplyScalar(0.2),
          health: 5
        }
      ]);
    }, 4000);
    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    };
  }, [camera.position.z]);

  const handleAsteroidHit = useCallback((id: number, damage: number) => {
    setAsteroids((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, health: a.health - damage } : a
      ).filter((a) => a.health > 0)
    );
  }, []);

  // Keep cannon attached to the player's camera
  const offset = useRef(new Vector3(0, -1.5, -3));
  useFrame(() => {
    if (cannonGroup.current) {
      cannonGroup.current.position.copy(camera.position).add(offset.current);
      cannonGroup.current.quaternion.copy(camera.quaternion);
    }
  });

  // Fire projectiles at the closest asteroid
  useEffect(() => {
    fireIntervalRef.current = setInterval(() => {
      if (!cannonGroup.current || asteroids.length === 0) return;
      const start = new Vector3();
      cannonGroup.current.getWorldPosition(start);
      const targetPos = asteroids[0].position.clone();
      const dir = targetPos.clone().sub(start).normalize();
      setProjectiles((prev) => [
        ...prev,
        { id: Date.now(), position: start, direction: dir, speed: 0.5 }
      ]);
    }, 1000);
    return () => {
      if (fireIntervalRef.current) clearInterval(fireIntervalRef.current);
    };
  }, [asteroids]);

  // Update projectiles each frame
  useFrame(() => {
    setAsteroids(prev => {
      const updated = prev.map(a => ({
        ...a,
        position: a.position.clone().add(a.velocity)
      }));

      for (let i = 0; i < updated.length; i++) {
        for (let j = i + 1; j < updated.length; j++) {
          const a = updated[i];
          const b = updated[j];
          if (a.position.distanceTo(b.position) < 1) {
            const temp = a.velocity.clone();
            a.velocity = b.velocity.clone();
            b.velocity = temp;
          }
        }
      }

      return updated.filter(a => a.position.z < 0);
    });

    setProjectiles((prev) => {
      return prev
        .map((p) => {
          const newPos = p.position
            .clone()
            .add(p.direction.clone().multiplyScalar(p.speed));
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
      {asteroids.map((ast) => (
        <Asteroid key={ast.id} position={ast.position} health={ast.health} />
      ))}
      {projectiles.map((p) => (
        <mesh key={p.id} position={p.position}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
      ))}
    </group>
  );
};


