import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Group, Mesh, BufferGeometry, Material, Euler } from 'three';
import { ScifiCannon } from './ScifiCannon';

interface Asteroid {
  id: number;
  position: Vector3;
  velocity: Vector3;
  size: number;
  rotation: Euler;
  rotationVelocity: Vector3;
  health: number;
}

interface ScifiDefenseSystemProps {
  onMeteorDestroyed?: () => void;
}

export const ScifiDefenseSystem: React.FC<ScifiDefenseSystemProps> = ({ onMeteorDestroyed }) => {
  const { camera, viewport } = useThree();
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [targetedAsteroid, setTargetedAsteroid] = useState<Asteroid | null>(null);
  const lastSpawnTime = useRef(0);
  const asteroidCounter = useRef(0);

  // Enhanced asteroid spawn system
  useFrame((state) => {
    const currentTime = state.clock.elapsedTime;
    
    // Spawn new asteroid every 2-4 seconds for better gameplay
    if (currentTime - lastSpawnTime.current > 2 + Math.random() * 2) {
      const spawnDistance = 15 + Math.random() * 10;
      const angle = Math.random() * Math.PI * 2;
      
      const newAsteroid: Asteroid = {
        id: asteroidCounter.current++,
        position: new Vector3(
          Math.cos(angle) * spawnDistance,
          8 + Math.random() * 5,    // Start above camera view
          Math.sin(angle) * spawnDistance
        ),
        velocity: new Vector3(
          -Math.cos(angle) * (1 + Math.random() * 2), // Move toward center
          -1 - Math.random() * 2,     // Downward motion
          -Math.sin(angle) * (1 + Math.random() * 2)  // Move toward center
        ),
        size: 0.3 + Math.random() * 0.7,
        rotation: new Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ),
        rotationVelocity: new Vector3(
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03
        ),
        health: 1
      };
      
      setAsteroids(prev => [...prev, newAsteroid]);
      lastSpawnTime.current = currentTime;
      console.log('Spawned new asteroid:', newAsteroid.id);
    }

    // Update asteroid positions and remove those that are too far away
    setAsteroids(prev => {
      return prev.map(asteroid => {
        // Update position
        asteroid.position.add(asteroid.velocity.clone().multiplyScalar(0.016));
        
        // Update rotation
        asteroid.rotation.x += asteroid.rotationVelocity.x;
        asteroid.rotation.y += asteroid.rotationVelocity.y;
        asteroid.rotation.z += asteroid.rotationVelocity.z;
        
        return asteroid;
      }).filter(asteroid => {
        // Keep asteroids that are within reasonable distance and not too low
        const distanceFromCamera = asteroid.position.distanceTo(camera.position);
        const notTooFar = distanceFromCamera < 50;
        const notTooLow = asteroid.position.y > -10;
        
        return notTooFar && notTooLow;
      });
    });

    // Update targeting system - target closest asteroid to camera
    if (asteroids.length > 0) {
      const visibleAsteroids = asteroids.filter(asteroid => {
        const distanceFromCamera = asteroid.position.distanceTo(camera.position);
        return distanceFromCamera < 30 && asteroid.position.y > camera.position.y - 5;
      });
      
      if (visibleAsteroids.length > 0) {
        const closest = visibleAsteroids.reduce((closest, current) => {
          const closestDist = closest.position.distanceTo(camera.position);
          const currentDist = current.position.distanceTo(camera.position);
          return currentDist < closestDist ? current : closest;
        });
        
        if (!targetedAsteroid || targetedAsteroid.id !== closest.id) {
          setTargetedAsteroid(closest);
        }
      } else {
        setTargetedAsteroid(null);
      }
    } else {
      setTargetedAsteroid(null);
    }
  });

  // Handle asteroid destruction
  const handleAsteroidDestroy = (asteroidId: number) => {
    console.log('Destroying asteroid:', asteroidId);
    setAsteroids(prev => prev.filter(a => a.id !== asteroidId));
    if (targetedAsteroid?.id === asteroidId) {
      setTargetedAsteroid(null);
    }
    onMeteorDestroyed?.();
  };

  return (
    <group>
      {/* Cannon that targets asteroids */}
      <ScifiCannon target={targetedAsteroid?.position} />
      
      {/* Render asteroids with enhanced visuals */}
      {asteroids.map(asteroid => (
        <group 
          key={asteroid.id} 
          position={asteroid.position} 
          rotation={asteroid.rotation}
        >
          {/* Main asteroid body */}
          <mesh
            onClick={() => handleAsteroidDestroy(asteroid.id)}
            scale={asteroid.size}
            castShadow
            receiveShadow
          >
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial 
              color="#654321" 
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>
          
          {/* Targeting indicator for targeted asteroid */}
          {targetedAsteroid?.id === asteroid.id && (
            <>
              {/* Red glow effect */}
              <mesh scale={asteroid.size * 1.8}>
                <icosahedronGeometry args={[1, 0]} />
                <meshBasicMaterial 
                  color="#ff0000" 
                  transparent 
                  opacity={0.2}
                />
              </mesh>
              
              {/* Targeting reticle */}
              <group>
                <mesh position={[0, 0, 1.2 * asteroid.size]}>
                  <ringGeometry args={[0.8 * asteroid.size, 1.0 * asteroid.size, 8]} />
                  <meshBasicMaterial 
                    color="#ff4444" 
                    transparent 
                    opacity={0.8}
                  />
                </mesh>
              </group>
            </>
          )}
          
          {/* Asteroid trail effect */}
          <mesh 
            position={[0, 0, 0.5 * asteroid.size]}
            scale={[asteroid.size * 0.3, asteroid.size * 0.3, asteroid.size * 2]}
          >
            <coneGeometry args={[0.2, 1, 4]} />
            <meshBasicMaterial 
              color="#ff6600" 
              transparent 
              opacity={0.4}
            />
          </mesh>
        </group>
      ))}
      
      {/* Debug info */}
      {asteroids.length > 0 && (
        <group>
          {/* Add some ambient particles for atmosphere */}
          <pointLight 
            position={[0, 10, 0]} 
            color="#4080ff" 
            intensity={0.3} 
            distance={20}
          />
        </group>
      )}
    </group>
  );
};
