import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Vector3, Group } from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { Asteroid } from './Asteroid';

const UPGRADE_TARGETS = [
  new Vector3(0, 4, 0),
  new Vector3(-2, 2.5, -1),
  new Vector3(2, 2.5, -1),
  new Vector3(-3, 1, -2),
  new Vector3(0, 1, -2),
  new Vector3(3, 1, -2),
];

interface SpawnedMeteor {
  id: number;
  position: Vector3;
  velocity: Vector3;
  health: number;
}

interface OptimizedScifiDefenseSystemProps {
  onMeteorDestroyed?: () => void;
  onEnergyGained?: (amount: number) => void;
  onUpgradeClick?: (upgradeId: string) => void;
  purchasedUpgrades?: string[];
  onMeteorPositionUpdate?: (positions: Vector3[]) => void;
}

export const OptimizedScifiDefenseSystem: React.FC<OptimizedScifiDefenseSystemProps> = ({ 
  onMeteorDestroyed, 
  onEnergyGained, 
  onUpgradeClick,
  purchasedUpgrades = [],
  onMeteorPositionUpdate
}) => {
  const [meteors, setMeteors] = useState<SpawnedMeteor[]>([]);
  const frameCountRef = useRef(0);
  const { camera } = useThree();

  // Reduced spawn frequency and meteor count
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      setMeteors(prev => {
        if (prev.length >= 3) return prev; // Reduced from 6 to 3
        
        const spawnDist = 20;
        const angle = Math.random() * Math.PI * 2;
        const height = Math.random() * 4 + 2;
        
        const x = camera.position.x + Math.cos(angle) * spawnDist;
        const z = camera.position.z + Math.sin(angle) * spawnDist;
        const spawnPos = new Vector3(x, height, z);
        
        const target = UPGRADE_TARGETS[Math.floor(Math.random() * UPGRADE_TARGETS.length)];
        const dir = target.clone().sub(spawnPos).normalize();
        
        return [
          ...prev,
          {
            id: Date.now(),
            position: spawnPos,
            velocity: dir.multiplyScalar(0.02),
            health: 3 // Reduced from 5 to 3
          }
        ];
      });
    }, 4000); // Increased from 2500 to 4000ms
    
    return () => clearInterval(spawnInterval);
  }, [camera]);

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
      onEnergyGained?.(10);
    }
  }, [onMeteorDestroyed, onEnergyGained]);

  // Optimize frame updates - only update every 2 frames
  useFrame(() => {
    frameCountRef.current++;
    if (frameCountRef.current % 2 !== 0) return;
    
    setMeteors(prev => {
      const updated = prev.map(m => ({ 
        ...m, 
        position: m.position.clone().add(m.velocity) 
      }));
      const filtered = updated.filter(m => m.position.z < camera.position.z);
      
      // Update positions less frequently
      if (frameCountRef.current % 6 === 0) {
        onMeteorPositionUpdate?.(filtered.map(m => m.position));
      }
      
      return filtered;
    });
  });

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