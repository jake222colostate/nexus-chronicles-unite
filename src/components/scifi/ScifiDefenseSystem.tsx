import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Vector3, Group } from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { ScifiCannon } from './ScifiCannon';
import { Asteroid } from './Asteroid';

interface SpawnedAsteroid {
  id: number;
  position: [number, number, number];
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
      const x = Math.random() * 6 - 3;
      const y = Math.random() * 2 + 3;
      setAsteroids((prev) => [
        ...prev,
        { id: Date.now(), position: [x, y, -10], health: 5 }
      ]);
    }, 4000);
    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    };
  }, []);

  const handleAsteroidReach = useCallback((id: number) => {
    setAsteroids((prev) => prev.filter((a) => a.id !== id));
  }, []);

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
      const targetPos = new Vector3(...asteroids[0].position);
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
    setProjectiles((prev) => {
      return prev
        .map((p) => {
          const newPos = p.position
            .clone()
            .add(p.direction.clone().multiplyScalar(p.speed));
          let hit = false;
          for (const ast of asteroids) {
            const astPos = new Vector3(...ast.position);
            if (newPos.distanceTo(astPos) < 0.7) {
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

  const target = asteroids[0] ? new Vector3(...asteroids[0].position) : undefined;

  return (
    <group>
      <group ref={cannonGroup}>
        <ScifiCannon target={target} />
      </group>
      {asteroids.map((ast) => (
        <Asteroid
          key={ast.id}
          startPosition={ast.position}
          health={ast.health}
          onReachTarget={() => handleAsteroidReach(ast.id)}
        />
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


