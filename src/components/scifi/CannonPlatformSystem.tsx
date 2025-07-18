import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

interface ExplosionParticle {
  id: number;
  position: Vector3;
  velocity: Vector3;
  life: number;
  maxLife: number;
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

// Generate evenly distributed cannon positions on a circular platform
const generateCannonPositions = (count: number, platformRadius: number = 6): [number, number, number][] => {
  const positions: [number, number, number][] = [];
  
  console.log(`Generating ${count} cannon positions with platform radius ${platformRadius}`);
  
  if (count === 1) {
    // Single cannon in center
    positions.push([0, 1, 0]);
  } else if (count <= 6) {
    // For 2-6 cannons, arrange in a single circle
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = platformRadius * 0.6; // Use 60% of platform radius to stay well within bounds
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius; // Remove the -2 offset, cannons should be centered on platform
      positions.push([x, 1, z]);
    }
  } else {
    // For more than 6 cannons, use multiple rings
    // First ring of 6 cannons
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = platformRadius * 0.4; // Inner ring
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius; // Remove the -2 offset
      positions.push([x, 1, z]);
    }
    
    // Second ring for remaining cannons
    const remaining = count - 6;
    for (let i = 0; i < remaining; i++) {
      const angle = (i / remaining) * Math.PI * 2 + Math.PI / remaining; // Offset for better distribution
      const radius = platformRadius * 0.8; // Outer ring
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius; // Remove the -2 offset
      positions.push([x, 1, z]);
    }
  }
  
  console.log('Generated cannon positions:', positions);
  return positions.slice(0, count);
};

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
  const [explosionParticles, setExplosionParticles] = useState<ExplosionParticle[]>([]);
  const platformRotationRef = useRef(0);

  // Initialize cannons based on count
  useEffect(() => {
    console.log(`CannonPlatformSystem: Setting up ${cannonCount} cannons`);
    const cannonPositions = generateCannonPositions(Math.min(cannonCount, 10));
    const newCannons: CannonData[] = [];
    
    for (let i = 0; i < cannonPositions.length; i++) {
      // Adjust cannon positions to follow platform position
      const basePosition = cannonPositions[i];
      const adjustedPosition: [number, number, number] = [
        basePosition[0] + platformPosition.x,
        basePosition[1] + platformPosition.y,
        basePosition[2] + platformPosition.z
      ];
      console.log(`Cannon ${i} positioned at:`, adjustedPosition);
      newCannons.push({
        id: i,
        position: adjustedPosition,
        health: 999999, // Infinite health for testing
        maxHealth: 999999,
        lastFired: 0
      });
    }
    setCannons(newCannons);
    console.log('All cannons positioned:', newCannons.map(c => c.position));
  }, [cannonCount, platformPosition.x, platformPosition.y, platformPosition.z]);

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

  // Create explosion effect - enhanced visuals
  const createExplosion = useCallback((position: Vector3, particleCount: number = 8) => {
    const newParticles: ExplosionParticle[] = [];
    const maxParticles = Math.min(particleCount, 25); // Allow more particles for big explosions
    
    for (let i = 0; i < maxParticles; i++) {
      // Create varied explosion patterns
      const isCore = i < maxParticles * 0.3; // 30% core particles
      
      const velocity = new Vector3(
        (Math.random() - 0.5) * (isCore ? 2 : 6), // Core particles slower
        Math.random() * (isCore ? 1 : 4) + (isCore ? 0.2 : 0.5),
        (Math.random() - 0.5) * (isCore ? 2 : 6)
      );
      
      newParticles.push({
        id: Date.now() + i + Math.random() * 1000, // Ensure unique IDs
        position: position.clone().add(new Vector3(
          (Math.random() - 0.5) * 0.3, // Small spawn radius variation
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3
        )),
        velocity,
        life: isCore ? 1500 : 800, // Core lasts longer
        maxLife: isCore ? 1500 : 800
      });
    }
    setExplosionParticles(prev => [...prev.slice(-30), ...newParticles]); // Allow more particles
  }, []);
  // Auto-fire cannons at targets with directional assignment
  useFrame((state) => {
    if (targets.length === 0) return;

    const currentTime = state.clock.elapsedTime * 1000;
    
    // Update platform rotation to match FloatingIsland's slow rotation
    platformRotationRef.current += 0.001; // Same speed as FloatingIsland
    
    // Update cannon positions to follow floating platform
    const platformFloatingOffset = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    
    setCannons(prev => prev.map(cannon => {
      // Get the updated position from the generated positions
      const cannonPositions = generateCannonPositions(Math.min(cannonCount, 10));
      const basePosition = cannonPositions[cannon.id] || [0, 1, -2];
      const updatedPosition: [number, number, number] = [
        basePosition[0] + platformPosition.x,
        basePosition[1] + platformPosition.y + platformFloatingOffset,
        basePosition[2] + platformPosition.z
      ];
      
      const updatedCannon = { ...cannon, position: updatedPosition };
      
      if (cannon.health <= 0 || currentTime - cannon.lastFired < 2000) {
        return updatedCannon;
      }

      // Assign meteors to cannons based on direction/sector
      const cannonPos = new Vector3(...updatedCannon.position);
      const platformCenter = new Vector3(platformPosition.x, platformPosition.y, platformPosition.z);
      
      // Calculate cannon's directional sector (angle from platform center)
      const cannonDirection = cannonPos.clone().sub(platformCenter).normalize();
      const cannonAngle = Math.atan2(cannonDirection.x, cannonDirection.z);
      
      // Find meteors in this cannon's sector
      const sectorSize = (Math.PI * 2) / Math.max(cannons.length, 1); // Divide 360 degrees by number of cannons
      const assignedMeteors = targets.filter(target => {
        const meteorDirection = target.clone().sub(platformCenter).normalize();
        const meteorAngle = Math.atan2(meteorDirection.x, meteorDirection.z);
        
        // Calculate angle difference, accounting for wrap-around
        let angleDiff = meteorAngle - cannonAngle;
        if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        // Check if meteor is in this cannon's sector
        return Math.abs(angleDiff) <= sectorSize / 2;
      });
      
      // If no meteors in sector, target closest meteor as fallback
      let targetMeteor = null;
      if (assignedMeteors.length > 0) {
        // Target closest meteor in assigned sector
        targetMeteor = assignedMeteors.reduce((closest, target) => {
          const distToCannon = target.distanceTo(cannonPos);
          const distToClosest = closest.distanceTo(cannonPos);
          return distToCannon < distToClosest ? target : closest;
        }, assignedMeteors[0]);
      } else {
        // Fallback to closest meteor overall
        targetMeteor = targets.reduce((closest, target) => {
          const distToCannon = target.distanceTo(cannonPos);
          const distToClosest = closest.distanceTo(cannonPos);
          return distToCannon < distToClosest ? target : closest;
        }, targets[0]);
      }

      // Fire projectile at assigned target
      if (targetMeteor && targetMeteor.distanceTo(cannonPos) < 25) {
        const direction = targetMeteor.clone().sub(cannonPos).normalize();
        
        setProjectiles(prevProjectiles => [
          ...prevProjectiles,
          {
            id: Date.now() + cannon.id,
            position: cannonPos.clone().add(direction.clone().multiplyScalar(1.5)),
            direction: direction,
            speed: 0.8,
            damage: 25,
            targetPosition: targetMeteor.clone(),
            targetId: `meteor-${Date.now()}`
          }
        ]);

        return { ...updatedCannon, lastFired: currentTime };
      }

      return updatedCannon;
    }));

    // Update projectiles and check for collisions
    setProjectiles(prev => prev
      .map(projectile => {
        const newPos = projectile.position.clone().add(
          projectile.direction.clone().multiplyScalar(projectile.speed)
        );
        
        // Check for meteor hits by checking distance to all targets (optimized)
        let hit = false;
        for (let i = 0; i < targets.length && !hit; i++) {
          const target = targets[i];
          if (newPos.distanceTo(target) < 1.2) {
            hit = true;
            createExplosion(target, 6); // Reduced particle count
            console.log('Cannon projectile hit meteor!');
            break; // Exit early for performance
          }
        }
        
        // Check collision with cannons (optimized)
        if (!hit) {
          for (let i = 0; i < cannons.length && !hit; i++) {
            const cannon = cannons[i];
            const cannonPos = new Vector3(...cannon.position);
            if (newPos.distanceTo(cannonPos) < 1.0) {
              hit = true;
              createExplosion(cannonPos, 8);
              // Damage cannon
              setCannons(prevCannons => prevCannons.map(c => 
                c.id === cannon.id ? { ...c, health: Math.max(0, c.health - 25) } : c
              ));
              break;
            }
          }
        }
        
        if (hit) {
          return null; // Remove projectile
        }
        
        return { ...projectile, position: newPos };
      })
      .filter(projectile => 
        projectile && projectile.position.distanceTo(camera.position) < 50
      )
    );

    // Check meteor-to-cannon collisions (explode on ANY cannon, damage area)
    if (targets.length > 0 && Math.random() < 0.2) { // Check 20% of frames for better responsiveness
      for (let i = 0; i < Math.min(targets.length, 6); i++) {
        const meteorPos = targets[i];
        for (let j = 0; j < cannons.length; j++) {
          const cannon = cannons[j];
          const cannonPos = new Vector3(...cannon.position);
          
          if (meteorPos.distanceTo(cannonPos) < 1.5) { // Removed health check - explode on any cannon
            // Create massive explosion at impact point
            createExplosion(cannonPos, 20);
            console.log(`Meteor exploded on cannon ${cannon.id}! Area damage explosion.`);
            
            // Area damage - damage all cannons within explosion radius
            setCannons(prevCannons => prevCannons.map(c => {
              const cPos = new Vector3(...c.position);
              const distance = cPos.distanceTo(cannonPos);
              
              if (distance < 4.0 && c.health > 0) { // 4 unit damage radius
                const damage = distance < 2.0 ? 40 : 20; // More damage closer to explosion
                console.log(`Explosion damaged cannon ${c.id} for ${damage} damage (distance: ${distance.toFixed(1)})`);
                return { ...c, health: Math.max(0, c.health - damage) };
              }
              return c;
            }));
            
            // Call meteor hit callback to remove meteor
            onMeteorHit?.(i, 50);
            break; // Only one meteor-cannon collision per frame
          }
        }
      }
    }

    // Check meteor-to-meteor collisions (throttled for performance)
    if (targets.length > 1 && Math.random() < 0.1) { // Only check 10% of frames
      for (let i = 0; i < Math.min(targets.length, 4); i++) { // Limit checks
        for (let j = i + 1; j < Math.min(targets.length, 4); j++) {
          if (targets[i].distanceTo(targets[j]) < 1.8) {
            createExplosion(targets[i], 5);
            createExplosion(targets[j], 5);
            console.log('Meteors collided!');
            break; // Only one collision per frame
          }
        }
      }
    }

    // Update explosion particles - fixed cleanup logic
    setExplosionParticles(prev => {
      const updated = prev.map(particle => {
        // Update position and physics
        particle.position.add(particle.velocity.clone().multiplyScalar(0.016));
        particle.velocity.y -= 0.08; // Gravity
        particle.velocity.multiplyScalar(0.98); // Air resistance
        particle.life -= 16; // Reduce life (60fps = ~16ms per frame)
        return particle;
      });
      
      // Filter out dead particles
      const alive = updated.filter(particle => particle.life > 0);
      return alive.length > 30 ? alive.slice(-30) : alive; // Hard limit on particles
    });
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
    <group position={platformPosition}>
      {/* Platform reference for rotation - cannons will rotate with this */}
      <group rotation={[0, platformRotationRef.current, 0]}>
        {/* Render cannons as children of platform so they rotate together */}
        {activeCannons.map(cannon => {
          // Use local position relative to platform, not world position
          const cannonPositions = generateCannonPositions(Math.min(cannonCount, 10));
          const localPosition = cannonPositions[cannon.id] || [0, 1, 0];
          
          return (
            <StationaryCannon
              key={cannon.id}
              position={localPosition}
              health={cannon.health}
              maxHealth={cannon.maxHealth}
              target={targets[0]}
              onRepair={() => handleCannonRepair(cannon.id)}
            />
          );
        })}
      </group>

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

      {/* Render explosion particles - optimized rendering */}
      {explosionParticles.length > 0 && explosionParticles.map(particle => {
        const alpha = Math.max(0, Math.min(1, particle.life / particle.maxLife));
        const scale = 0.1 + (1 - alpha) * 0.2; // Particles grow as they fade
        return (
          <mesh key={particle.id} position={particle.position}>
            <sphereGeometry args={[scale, 4, 4]} />
            <meshBasicMaterial 
              color={alpha > 0.5 ? "#ff4400" : "#ff8800"} 
              transparent 
              opacity={alpha}
            />
          </mesh>
        );
      })}
    </group>
  );
};