import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Vector3 } from 'three';
import { ScifiCannon } from './ScifiCannon';
import { Asteroid } from './Asteroid';

interface SpawnedAsteroid {
  id: number;
  position: [number, number, number];
}

export const ScifiDefenseSystem: React.FC = () => {
  const [asteroids, setAsteroids] = useState<SpawnedAsteroid[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const x = Math.random() * 6 - 3;
      const y = Math.random() * 2 + 3;
      setAsteroids((prev) => [...prev, { id: Date.now(), position: [x, y, -10] }]);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleAsteroidReach = useCallback((id: number) => {
    setAsteroids((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const target = asteroids[0] ? new Vector3(...asteroids[0].position) : undefined;

  return (
    <group>
      <ScifiCannon target={target} />
      {asteroids.map((ast) => (
        <Asteroid
          key={ast.id}
          startPosition={ast.position}
          onReachTarget={() => handleAsteroidReach(ast.id)}
        />
      ))}
    </group>
  );
};


