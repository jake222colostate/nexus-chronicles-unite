
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

  // Check if asteroid is within camera view bounds
  const isAsteroidInView = (asteroid: Asteroid): boolean => {
    const worldPosition = asteroid.position.clone();
    const screenPosition = worldPosition.project(camera);
    
    // Convert to screen coordinates and check if within iPhone screen bounds
    const x = (screenPosition.x * 0.5 + 0.5) * viewport.width;
    const y = (screenPosition.y * -0.5 + 0.5) * viewport.height;
    
    // iPhone screen bounds (375x667)
    const screenWidth = 375;
    const screenHeight = 667;
    const margin = 50; // Small margin for smooth transitions
    
    return (
      x >= -margin && 
      x <= screenWidth + margin && 
      y >= -margin && 
      y <= screenHeight + margin &&
      worldPosition.z > camera.position.z - 50 // Not too far behind camera
    );
  };

  // Spawn asteroids periodically
  useFrame((state) => {
    const currentTime = state.clock.elapsedTime;
    
    // Spawn new asteroid every 3-5 seconds
    if (currentTime - lastSpawnTime.current > 3 + Math.random() * 2) {
      const newAsteroid: Asteroid = {
        id: asteroidCounter.current++,
        position: new Vector3(
          (Math.random() - 0.5) * 30, // Random X within reasonable bounds
          10 + Math.random() * 10,    // Start above view
          (Math.random() - 0.5) * 20  // Random Z depth
        ),
        velocity: new Vector3(
          (Math.random() - 0.5) * 2,  // Slight horizontal drift
          -2 - Math.random() * 3,     // Downward motion
          (Math.random() - 0.5) * 1   // Slight depth movement
        ),
        size: 0.5 + Math.random() * 1,
        rotation: new Euler(0, 0, 0),
        rotationVelocity: new Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        )
      };
      
      setAsteroids(prev => [...prev, newAsteroid]);
      lastSpawnTime.current = currentTime;
    }

    // Update asteroid positions and remove those outside view or below screen
    setAsteroids(prev => {
      return prev.map(asteroid => {
        // Update position
        asteroid.position.add(asteroid.velocity.clone().multiplyScalar(0.016));
        
        // Update rotation - convert Vector3 to Euler properly
        asteroid.rotation.x += asteroid.rotationVelocity.x;
        asteroid.rotation.y += asteroid.rotationVelocity.y;
        asteroid.rotation.z += asteroid.rotationVelocity.z;
        
        return asteroid;
      }).filter(asteroid => {
        // Remove asteroids that are too far below or outside camera frustum
        const inView = isAsteroidInView(asteroid);
        const notTooLow = asteroid.position.y > -15;
        
        return inView && notTooLow;
      });
    });

    // Update targeted asteroid - only target if in view
    if (targetedAsteroid && !isAsteroidInView(targetedAsteroid)) {
      setTargetedAsteroid(null);
    } else if (!targetedAsteroid && asteroids.length > 0) {
      // Find closest asteroid that's in view
      const visibleAsteroids = asteroids.filter(isAsteroidInView);
      if (visibleAsteroids.length > 0) {
        const closest = visibleAsteroids.reduce((closest, current) => {
          const closestDist = closest.position.distanceTo(camera.position);
          const currentDist = current.position.distanceTo(camera.position);
          return currentDist < closestDist ? current : closest;
        });
        setTargetedAsteroid(closest);
      }
    }
  });

  // Handle asteroid click/destruction
  const handleAsteroidDestroy = (asteroidId: number) => {
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
      
      {/* Render asteroids */}
      {asteroids.map(asteroid => (
        <group key={asteroid.id} position={asteroid.position} rotation={asteroid.rotation}>
          <mesh
            onClick={() => handleAsteroidDestroy(asteroid.id)}
            scale={asteroid.size}
          >
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial 
              color="#8B4513" 
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>
          
          {/* Glow effect for targeted asteroid */}
          {targetedAsteroid?.id === asteroid.id && (
            <mesh scale={asteroid.size * 1.5}>
              <icosahedronGeometry args={[1, 0]} />
              <meshBasicMaterial 
                color="#ff4444" 
                transparent 
                opacity={0.3}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};
