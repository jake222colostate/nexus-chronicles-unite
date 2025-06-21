
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Vector3, Group } from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { ScifiCannon } from './ScifiCannon';
import { TemporaryMeteor } from './TemporaryMeteor';

interface SpawnedAsteroid {
  id: number;
  position: Vector3;
  velocity: Vector3;
  health: number;
  target: Vector3;
}

interface Projectile {
  id: number;
  position: Vector3;
  direction: Vector3;
  speed: number;
}

interface EnhancedScifiDefenseSystemProps {
  onMeteorDestroyed?: () => void;
}

export const EnhancedScifiDefenseSystem: React.FC<EnhancedScifiDefenseSystemProps> = ({ 
  onMeteorDestroyed 
}) => {
  const [asteroids, setAsteroids] = useState<SpawnedAsteroid[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const spawnIntervalRef = useRef<NodeJS.Timeout>();
  const fireIntervalRef = useRef<NodeJS.Timeout>();
  const cannonGroup = useRef<Group>(null);
  const { camera } = useThree();

  // Enhanced asteroid spawning - more frequent and from multiple directions
  useEffect(() => {
    spawnIntervalRef.current = setInterval(() => {
      setAsteroids(prev => {
        if (prev.length >= 8) return prev; // Increased max asteroids
        
        // Spawn from multiple directions around the player
        const spawnDistance = 30;
        const angle = Math.random() * Math.PI * 2;
        const height = Math.random() * 10 + 5;
        
        const spawnPos = new Vector3(
          camera.position.x + Math.cos(angle) * spawnDistance,
          height,
          camera.position.z + Math.sin(angle) * spawnDistance
        );

        // Random target near player
        const target = new Vector3(
          camera.position.x + (Math.random() - 0.5) * 20,
          camera.position.y + (Math.random() - 0.5) * 10,
          camera.position.z + (Math.random() - 0.5) * 20
        );

        const direction = target.clone().sub(spawnPos).normalize();
        
        return [
          ...prev,
          {
            id: Date.now() + Math.random(),
            position: spawnPos,
            velocity: direction.multiplyScalar(0.08), // Slightly faster
            health: Math.floor(Math.random() * 3) + 3, // Random health 3-5
            target
          }
        ];
      });
    }, 2000); // More frequent spawning

    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    };
  }, [camera]);

  const isAsteroidVisible = useCallback(
    (pos: Vector3) => {
      const distance = pos.distanceTo(camera.position);
      return distance < 40; // Increased render distance
    },
    [camera]
  );

  // Auto-firing system
  useEffect(() => {
    fireIntervalRef.current = setInterval(() => {
      if (!cannonGroup.current) return;
      
      const visibleAsteroids = asteroids.filter(a => isAsteroidVisible(a.position));
      if (visibleAsteroids.length === 0) return;

      // Target closest asteroid
      const closest = visibleAsteroids.reduce((prev, current) => {
        const prevDist = prev.position.distanceTo(camera.position);
        const currentDist = current.position.distanceTo(camera.position);
        return currentDist < prevDist ? current : prev;
      });

      const start = new Vector3();
      cannonGroup.current.getWorldPosition(start);
      const dir = closest.position.clone().sub(start).normalize();
      
      setProjectiles(prev => [
        ...prev,
        { 
          id: Date.now() + Math.random(), 
          position: start.clone(), 
          direction: dir, 
          speed: 0.8 
        }
      ]);
    }, 800); // Faster firing rate

    return () => {
      if (fireIntervalRef.current) clearInterval(fireIntervalRef.current);
    };
  }, [asteroids, isAsteroidVisible, camera]);

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

  // Position cannon relative to camera
  const offset = useRef(new Vector3(0, -1.5, -3));
  useFrame(() => {
    if (cannonGroup.current) {
      cannonGroup.current.position.copy(camera.position).add(offset.current);
      cannonGroup.current.quaternion.copy(camera.quaternion);
    }
  });

  // Update asteroid and projectile positions
  useFrame(() => {
    // Update asteroids
    setAsteroids(prev => {
      return prev
        .map(a => ({ 
          ...a, 
          position: a.position.clone().add(a.velocity) 
        }))
        .filter(a => a.position.distanceTo(camera.position) < 60); // Remove distant asteroids
    });

    // Update projectiles and check collisions
    setProjectiles(prev => {
      return prev
        .map(p => {
          const newPos = p.position.clone().add(p.direction.clone().multiplyScalar(p.speed));
          
          // Check for asteroid collisions
          let hit = false;
          for (const ast of asteroids) {
            if (newPos.distanceTo(ast.position) < 1.2) {
              handleAsteroidHit(ast.id, 2);
              hit = true;
              break;
            }
          }
          
          if (hit || newPos.distanceTo(camera.position) > 80) return null;
          return { ...p, position: newPos } as Projectile;
        })
        .filter(Boolean) as Projectile[];
    });
  });

  const target = asteroids.length > 0 ? asteroids[0].position.clone() : undefined;

  return (
    <group>
      <group ref={cannonGroup}>
        <ScifiCannon target={target} />
      </group>
      
      {asteroids.map(ast => (
        <TemporaryMeteor 
          key={ast.id} 
          position={ast.position} 
          health={ast.health}
          onReachTarget={() => console.log('Meteor reached target!')}
        />
      ))}
      
      {projectiles.map(p => (
        <mesh key={p.id} position={p.position}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#ff4444" emissive="#ff0000" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
};
