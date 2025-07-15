import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Vector3, Group, InstancedMesh, Matrix4 } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { StationaryCannon } from './StationaryCannon';

interface CannonData {
  id: number;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  lastFired: number;
}

interface Projectile {
  id: number;
  position: Vector3;
  direction: Vector3;
  speed: number;
  damage: number;
}

interface OptimizedCannonPlatformSystemProps {
  cannonCount: number;
  targets?: Vector3[];
  onCannonDestroyed?: () => void;
  onRepairKitUsed?: () => void;
  gameState?: any;
  onMeteorHit?: (id: number, damage: number) => void;
  platformPosition?: Vector3;
}

// Reduced cannon positions
const CANNON_POSITIONS: [number, number, number][] = [
  [0, 1, -2],
  [-2, 1, -1.5],
  [2, 1, -1.5],
  [-3, 1, -2],
  [3, 1, -2],
];

export const OptimizedCannonPlatformSystem: React.FC<OptimizedCannonPlatformSystemProps> = ({
  cannonCount,
  targets = [],
  onCannonDestroyed,
  onRepairKitUsed,
  gameState,
  onMeteorHit,
  platformPosition = new Vector3(0, -3, -2)
}) => {
  const { camera } = useThree();
  const [cannons, setCannons] = useState<CannonData[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const projectileInstanceRef = useRef<InstancedMesh>(null);
  const frameCountRef = useRef(0);

  // Limit cannon count for performance
  const maxCannons = Math.min(cannonCount, 5); // Reduced from 10 to 5

  // Initialize cannons
  useEffect(() => {
    const newCannons: CannonData[] = [];
    for (let i = 0; i < maxCannons; i++) {
      const basePosition = CANNON_POSITIONS[i];
      const adjustedPosition: [number, number, number] = [
        basePosition[0] + platformPosition.x,
        basePosition[1] + platformPosition.y,
        basePosition[2] + platformPosition.z
      ];
      newCannons.push({
        id: i,
        position: adjustedPosition,
        health: 100,
        maxHealth: 100,
        lastFired: 0
      });
    }
    setCannons(newCannons);
  }, [maxCannons, platformPosition]);

  // Optimized firing logic - only fire every 4 frames
  useFrame((state) => {
    frameCountRef.current++;
    
    // Update projectiles every frame
    setProjectiles(prev => {
      const updated = prev.map(projectile => ({
        ...projectile,
        position: projectile.position.clone().add(
          projectile.direction.clone().multiplyScalar(projectile.speed)
        )
      }));
      
      // Check hits and remove distant projectiles
      return updated.filter(projectile => {
        let hit = false;
        targets.forEach(target => {
          if (projectile.position.distanceTo(target) < 1.5) {
            hit = true;
          }
        });
        
        if (hit) return false;
        return projectile.position.distanceTo(camera.position) < 40;
      });
    });
    
    // Only fire cannons every 4 frames
    if (frameCountRef.current % 4 !== 0 || targets.length === 0) {
      updateProjectileInstances();
      return;
    }

    const currentTime = state.clock.elapsedTime * 1000;
    
    setCannons(prev => prev.map(cannon => {
      if (cannon.health <= 0 || currentTime - cannon.lastFired < 3000) {
        return cannon;
      }

      // Find closest target
      const cannonPos = new Vector3(...cannon.position);
      const closestTarget = targets.reduce((closest, target) => {
        const distToCannon = target.distanceTo(cannonPos);
        const distToClosest = closest.distanceTo(cannonPos);
        return distToCannon < distToClosest ? target : closest;
      }, targets[0]);

      // Fire if target is close enough
      if (closestTarget.distanceTo(cannonPos) < 25) {
        const direction = closestTarget.clone().sub(cannonPos).normalize();
        
        setProjectiles(prevProjectiles => [
          ...prevProjectiles,
          {
            id: Date.now() + cannon.id,
            position: cannonPos.clone().add(direction.clone().multiplyScalar(1.5)),
            direction: direction,
            speed: 0.6,
            damage: 25
          }
        ]);

        return { ...cannon, lastFired: currentTime };
      }

      return cannon;
    }));
    
    updateProjectileInstances();
  });

  // Update instanced mesh for projectiles
  const updateProjectileInstances = useCallback(() => {
    if (!projectileInstanceRef.current) return;
    
    const matrix = new Matrix4();
    projectiles.forEach((projectile, i) => {
      matrix.setPosition(projectile.position);
      matrix.scale(new Vector3(0.15, 0.15, 0.15));
      projectileInstanceRef.current!.setMatrixAt(i, matrix);
    });
    
    projectileInstanceRef.current.instanceMatrix.needsUpdate = true;
  }, [projectiles]);

  const activeCannons = useMemo(() => 
    cannons.slice(0, maxCannons), 
    [cannons, maxCannons]
  );

  return (
    <group>
      {/* Render cannons */}
      {activeCannons.map(cannon => (
        <StationaryCannon
          key={cannon.id}
          position={cannon.position}
          health={cannon.health}
          maxHealth={cannon.maxHealth}
          target={targets[0]}
          onRepair={() => {}}
        />
      ))}

      {/* Instanced projectiles for better performance */}
      <instancedMesh
        ref={projectileInstanceRef}
        args={[undefined, undefined, Math.max(projectiles.length, 1)]}
      >
        <sphereGeometry args={[1, 6, 6]} />
        <meshStandardMaterial 
          color="#00ccff" 
          emissive="#0099cc"
          emissiveIntensity={0.5}
        />
      </instancedMesh>
    </group>
  );
};