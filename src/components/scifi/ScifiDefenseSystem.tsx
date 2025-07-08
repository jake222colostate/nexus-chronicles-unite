import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Vector3, Group } from 'three';
import { useThree, useFrame } from '@react-three/fiber';
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

interface SpawnedMeteor {
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
  onUpgradeClick?: (upgradeId: string) => void;
  purchasedUpgrades?: string[];
  onMeteorPositionUpdate?: (positions: Vector3[]) => void;
}

export const ScifiDefenseSystem: React.FC<ScifiDefenseSystemProps> = ({ 
  onMeteorDestroyed, 
  onEnergyGained, 
  onUpgradeClick,
  purchasedUpgrades = [],
  onMeteorPositionUpdate
}) => {
  const [meteors, setMeteors] = useState<SpawnedMeteor[]>([]);
  const spawnIntervalRef = useRef<NodeJS.Timeout>();
  const { camera } = useThree();
  const collisionContext = useCollisionContext();

  useEffect(() => {
    spawnIntervalRef.current = setInterval(() => {
      setMeteors(prev => {
        if (prev.length >= 6) return prev; // Limit active meteors
        
        // Spawn meteors from all angles around the camera
        const spawnDist = 25; // Increased distance for better effect
        const angle = Math.random() * Math.PI * 2; // Full 360 degree angle
        const height = Math.random() * 8 + 2; // Random height between 2-10
        
        // Calculate spawn position in a circle around the camera
        const x = camera.position.x + Math.cos(angle) * spawnDist;
        const z = camera.position.z + Math.sin(angle) * spawnDist;
        const spawnPos = new Vector3(x, height, z);
        
        // Target a random upgrade position
        const target = UPGRADE_TARGETS[Math.floor(Math.random() * UPGRADE_TARGETS.length)];
        const dir = target.clone().sub(spawnPos).normalize();
        
        return [
          ...prev,
          {
            id: Date.now(),
            position: spawnPos,
            velocity: dir.multiplyScalar(0.025), // Slightly slower for better tracking
            health: 5
          }
        ];
      });
    }, 2500); // Slightly faster spawn rate for more dynamic action
    
    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    };
  }, [camera]);

  const isUpgradeVisible = useCallback(
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

  const handleMeteorHit = useCallback((id: number, damage: number) => {
    let destroyed = false;
    setMeteors(prev =>
      prev
        .map(m => {
          if (m.id === id) {
            const newHealth = m.health - damage;
            destroyed = newHealth <= 0;
            return { ...m, health: newHealth };
          }
          return m;
        })
        .filter(m => m.health > 0)
    );
    if (destroyed) {
      onMeteorDestroyed?.();
      onEnergyGained?.(10); // Grant 10 energy for destroying a meteor
    }
  }, [onMeteorDestroyed, onEnergyGained]);

  // Update meteor positions and notify parent component
  useFrame(() => {
    setMeteors(prev => {
      const updated = prev.map(m => ({ ...m, position: m.position.clone().add(m.velocity) }));
      const filtered = updated.filter(m => m.position.z < camera.position.z);
      
      // Update meteor positions for cannon targeting
      onMeteorPositionUpdate?.(filtered.map(m => m.position));
      
      return filtered;
    });
  });

  // Expose meteor hit function for external use
  const exposedHandleMeteorHit = useCallback((id: number, damage: number) => {
    handleMeteorHit(id, damage);
  }, [handleMeteorHit]);

  return (
    <group>
      {meteors.map((meteor, index) => (
        <Asteroid 
          key={meteor.id} 
          position={meteor.position} 
          health={meteor.health} 
          isUpgrade={false}
          upgradeIndex={index}
        />
      ))}
    </group>
  );
};