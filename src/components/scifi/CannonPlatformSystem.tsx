import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Vector3 } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { StationaryCannon } from './StationaryCannon';
import { RepairKit } from '../items/RepairKit';

interface CannonData {
  id: number;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  lastFired: number;
}

interface RepairKitData {
  id: number;
  position: [number, number, number];
}

interface CannonPlatformSystemProps {
  cannonCount: number;
  targets?: Vector3[];
  onCannonDestroyed?: () => void;
  onRepairKitUsed?: () => void;
  gameState?: any;
  onMeteorHit?: (id: number, damage: number) => void;
  platformPosition?: Vector3;
}

// Cannon positions on top of the enlarged light blue circular platform
const CANNON_POSITIONS: [number, number, number][] = [
  [0, 1, -2],      // Center on top of platform
  [-3, 1, -1.5],   // Front left on top
  [3, 1, -1.5],    // Front right on top
  [-4, 1, -2],     // Left on top
  [4, 1, -2],      // Right on top
  [-3, 1, -2.5],   // Back left on top
  [3, 1, -2.5],    // Back right on top
  [0, 1, -1],      // Front center on top
  [0, 1, -3],      // Back center on top
  [-5, 1, -1],     // Far left on top
];

export const CannonPlatformSystem: React.FC<CannonPlatformSystemProps> = ({
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
  const [repairKits, setRepairKits] = useState<RepairKitData[]>([]);
  const [projectiles, setProjectiles] = useState<any[]>([]);

  // Initialize cannons based on count
  useEffect(() => {
    const newCannons: CannonData[] = [];
    for (let i = 0; i < Math.min(cannonCount, 10); i++) {
      // Adjust cannon positions to follow platform position
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
  }, [cannonCount]);

  // Spawn repair kits occasionally
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every interval
        const randomPosition: [number, number, number] = [
          (Math.random() - 0.5) * 20,
          2,
          (Math.random() - 0.5) * 20
        ];
        
        setRepairKits(prev => [...prev, {
          id: Date.now(),
          position: randomPosition
        }]);
      }
    }, 5000);

    return () => clearInterval(spawnInterval);
  }, []);

  // Auto-fire cannons at targets
  useFrame((state) => {
    if (targets.length === 0) return;

    const currentTime = state.clock.elapsedTime * 1000;
    
    // Update cannon positions to follow floating platform
    const platformFloatingOffset = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    
    setCannons(prev => prev.map(cannon => {
      // Update cannon position to follow platform movement
      const basePosition = CANNON_POSITIONS[cannon.id];
      const updatedPosition: [number, number, number] = [
        basePosition[0] + platformPosition.x,
        basePosition[1] + platformPosition.y + platformFloatingOffset,
        basePosition[2] + platformPosition.z
      ];
      
      const updatedCannon = { ...cannon, position: updatedPosition };
      
      if (cannon.health <= 0 || currentTime - cannon.lastFired < 2000) {
        return updatedCannon;
      }

      // Find closest target
      const cannonPos = new Vector3(...updatedCannon.position);
      const closestTarget = targets.reduce((closest, target) => {
        const distToCannon = target.distanceTo(cannonPos);
        const distToClosest = closest.distanceTo(cannonPos);
        return distToCannon < distToClosest ? target : closest;
      }, targets[0]);

      // Fire projectile
      if (closestTarget.distanceTo(cannonPos) < 25) {
        const direction = closestTarget.clone().sub(cannonPos).normalize();
        
        setProjectiles(prevProjectiles => [
          ...prevProjectiles,
          {
            id: Date.now() + cannon.id,
            position: cannonPos.clone().add(direction.clone().multiplyScalar(1.5)),
            direction: direction,
            speed: 0.8,
            damage: 25,
            targetPosition: closestTarget.clone(),
            targetId: `meteor-${Date.now()}`
          }
        ]);

        return { ...updatedCannon, lastFired: currentTime };
      }

      return updatedCannon;
    }));

    // Update projectiles and check for hits
    setProjectiles(prev => prev
      .map(projectile => {
        const newPos = projectile.position.clone().add(
          projectile.direction.clone().multiplyScalar(projectile.speed)
        );
        
        // Check for meteor hits by checking distance to all targets
        let hit = false;
        targets.forEach(target => {
          if (newPos.distanceTo(target) < 1.0) {
            hit = true;
            // Simple hit detection - would need proper meteor ID system
            console.log('Cannon projectile hit meteor!');
          }
        });
        
        if (hit) {
          return null; // Remove projectile
        }
        
        return { ...projectile, position: newPos };
      })
      .filter(projectile => 
        projectile && projectile.position.distanceTo(camera.position) < 50
      )
    );
  });

  const handleCannonRepair = useCallback((cannonId: number) => {
    // Check if there are repair kits available
    if (repairKits.length === 0) return;

    // Use closest repair kit
    const cannonPos = new Vector3(...cannons.find(c => c.id === cannonId)?.position || [0, 0, 0]);
    const closestKit = repairKits.reduce((closest, kit) => {
      const kitPos = new Vector3(...kit.position);
      const distToCannon = kitPos.distanceTo(cannonPos);
      const distToClosest = new Vector3(...closest.position).distanceTo(cannonPos);
      return distToCannon < distToClosest ? kit : closest;
    }, repairKits[0]);

    // Remove repair kit and repair cannon
    setRepairKits(prev => prev.filter(kit => kit.id !== closestKit.id));
    setCannons(prev => prev.map(cannon => 
      cannon.id === cannonId 
        ? { ...cannon, health: cannon.maxHealth }
        : cannon
    ));

    onRepairKitUsed?.();
  }, [cannons, repairKits, onRepairKitUsed]);

  const handleRepairKitPickup = useCallback((kitId: number) => {
    setRepairKits(prev => prev.filter(kit => kit.id !== kitId));
    // Could add to inventory here
  }, []);

  const activeCannons = useMemo(() => 
    cannons.slice(0, Math.min(cannonCount, 10)), 
    [cannons, cannonCount]
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
          onRepair={() => handleCannonRepair(cannon.id)}
        />
      ))}

      {/* Render repair kits */}
      {repairKits.map(kit => (
        <RepairKit
          key={kit.id}
          position={kit.position}
          onPickup={() => handleRepairKitPickup(kit.id)}
        />
      ))}

      {/* Render projectiles */}
      {projectiles.map(projectile => (
        <mesh key={projectile.id} position={projectile.position}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial 
            color="#00ccff" 
            emissive="#0099cc"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
};