
import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { Vector3 } from 'three';
import { ContactShadows } from '@react-three/drei';
import { Enhanced360Controller } from './Enhanced360Controller';
import { ChunkSystem, ChunkData } from './ChunkSystem';
import { OptimizedFantasyEnvironment } from './OptimizedFantasyEnvironment';
import { CasualFog } from './CasualFog';
import { Sun } from './Sun';
import { LeechEnemy } from './LeechEnemy';
import { StaffWeaponSystem } from './StaffWeaponSystem';

interface Fantasy3DSceneProps {
  cameraPosition: Vector3;
  onPositionChange: (position: Vector3) => void;
  realm: 'fantasy' | 'scifi';
  maxUnlockedUpgrade: number;
  upgradeSpacing: number;
  onTierProgression: () => void;
  chunkSize: number;
  renderDistance: number;
  onEnemyCountChange?: (count: number) => void;
  onEnemyKilled?: () => void;
  weaponDamage: number;
}

interface LeechData {
  id: string;
  position: Vector3;
  health: number;
  alive: boolean;
  spawnPosition: Vector3;
}

export const Fantasy3DScene: React.FC<Fantasy3DSceneProps> = React.memo(({
  cameraPosition,
  onPositionChange,
  realm,
  chunkSize,
  renderDistance,
  onEnemyCountChange,
  onEnemyKilled,
  maxUnlockedUpgrade,
  weaponDamage
}) => {
  const [leeches, setLeeches] = useState<LeechData[]>([]);
  const [nextLeechId, setNextLeechId] = useState(0);

  // SAFETY CHECK: Ensure cameraPosition is valid before using it
  const safeCameraPosition = useMemo(() => {
    if (!cameraPosition || !(cameraPosition instanceof Vector3) || 
        isNaN(cameraPosition.x) || isNaN(cameraPosition.y) || isNaN(cameraPosition.z)) {
      console.log('Fantasy3DScene: Invalid camera position, using safe default');
      return new Vector3(0, 2, 20);
    }
    return cameraPosition;
  }, [cameraPosition]);

  // Spawn leeches based on player progress
  useEffect(() => {
    const playerProgress = Math.abs(safeCameraPosition.z);
    const desiredLeechCount = Math.min(Math.floor(playerProgress / 30) + 1, 8); // Max 8 leeches
    
    setLeeches(currentLeeches => {
      const aliveLeeches = currentLeeches.filter(leech => leech.alive);
      const neededLeeches = desiredLeechCount - aliveLeeches.length;
      
      if (neededLeeches > 0) {
        const newLeeches: LeechData[] = [];
        
        for (let i = 0; i < neededLeeches; i++) {
          const spawnDistance = playerProgress + 80 + (i * 25); // Increased from 40 to 80, spacing from 15 to 25
          const spawnX = (Math.random() - 0.5) * 20; // Random X position within range
          const spawnPosition = new Vector3(spawnX, 0, -spawnDistance);
          
          newLeeches.push({
            id: `leech_${nextLeechId + i}`,
            position: spawnPosition.clone(),
            health: 5,
            alive: true,
            spawnPosition: spawnPosition
          });
        }
        
        setNextLeechId(prev => prev + neededLeeches);
        return [...aliveLeeches, ...newLeeches];
      }
      
      return currentLeeches;
    });
  }, [Math.floor(Math.abs(safeCameraPosition.z) / 30), nextLeechId]);

  // Update enemy count for UI
  useEffect(() => {
    const aliveCount = leeches.filter(leech => leech.alive).length;
    if (onEnemyCountChange) onEnemyCountChange(aliveCount);
  }, [leeches, onEnemyCountChange]);

  // Handle leech position updates
  const handleLeechPositionUpdate = (leechId: string, newPosition: Vector3) => {
    // SAFETY CHECK: Validate position before updating
    if (!newPosition || !(newPosition instanceof Vector3) || 
        isNaN(newPosition.x) || isNaN(newPosition.y) || isNaN(newPosition.z)) {
      console.log('Fantasy3DScene: Invalid leech position update, ignoring');
      return;
    }
    
    setLeeches(current => 
      current.map(leech => 
        leech.id === leechId 
          ? { ...leech, position: newPosition.clone() }
          : leech
      )
    );
  };

  // Handle leech reaching player
  const handleLeechReachPlayer = (leechId: string) => {
    setLeeches(current => 
      current.map(leech => 
        leech.id === leechId 
          ? { ...leech, alive: false }
          : leech
      )
    );
    onEnemyKilled?.();
  };

  // Handle leech taking damage
  const handleLeechHit = (leechId: string, damage: number) => {
    setLeeches(current => 
      current.map(leech => {
        if (leech.id === leechId && leech.alive) {
          const newHealth = leech.health - damage;
          if (newHealth <= 0) {
            onEnemyKilled?.();
            return { ...leech, health: 0, alive: false };
          }
          return { ...leech, health: newHealth };
        }
        return leech;
      })
    );
  };

  // SAFETY CHECK: Filter and validate leech positions for weapon system
  const aliveLeechPositions = useMemo(() => 
    leeches
      .filter(leech => leech.alive && leech.position && leech.position instanceof Vector3)
      .map(leech => leech.position)
      .filter(pos => !isNaN(pos.x) && !isNaN(pos.y) && !isNaN(pos.z)),
    [leeches]
  );

  // SAFETY CHECK: Ensure onPositionChange callback is properly wrapped
  const handlePositionChange = (position: Vector3) => {
    if (onPositionChange && position && position instanceof Vector3) {
      onPositionChange(position);
    }
  };

  return (
    <Suspense fallback={null}>
      {/* Camera controller with guaranteed safe valley center starting position */}
      <Enhanced360Controller
        position={[0, 2, 20]} // Start far back in the valley center for absolute safety
        onPositionChange={handlePositionChange}
        enemyPositions={aliveLeechPositions}
      />

      {/* Background color for fantasy dusk */}
      <color attach="background" args={['#2d1b4e']} />

      {/* Subtle fog that fades as you progress */}
      <CasualFog />

      {/* Ground plane to ensure there's always a visible floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#2d4a2d" />
      </mesh>

      {/* Basic ambient light plus warm sun */}
      <ambientLight intensity={0.6} />
      <Sun position={[10, 20, 5]} />

      {/* Render all alive leeches with safety checks */}
      {leeches.map(leech => 
        leech.alive && leech.spawnPosition && leech.spawnPosition instanceof Vector3 && (
          <LeechEnemy
            key={leech.id}
            playerPosition={safeCameraPosition}
            startPosition={leech.spawnPosition}
            health={leech.health}
            onUpdatePosition={(pos) => handleLeechPositionUpdate(leech.id, pos)}
            onReachPlayer={() => handleLeechReachPlayer(leech.id)}
          />
        )
      )}

      <StaffWeaponSystem
        damage={weaponDamage}
        enemyPositions={aliveLeechPositions}
        onHitEnemy={(index, damage) => {
          const aliveLeech = leeches.filter(leech => leech.alive)[index];
          if (aliveLeech) {
            handleLeechHit(aliveLeech.id, damage);
          }
        }}
        upgrades={maxUnlockedUpgrade}
      />

      {/* Optimized chunk system with performance limits */}
      <ChunkSystem
        playerPosition={safeCameraPosition}
        chunkSize={chunkSize}
        renderDistance={renderDistance}
      >
        {(chunks: ChunkData[]) => (
          <OptimizedFantasyEnvironment
            chunks={chunks}
            chunkSize={chunkSize}
            realm={realm}
            playerPosition={safeCameraPosition}
          />
        )}
      </ChunkSystem>

      {/* Simplified contact shadows */}
      <ContactShadows 
        position={[0, -1.4, safeCameraPosition.z]} 
        opacity={0.05}
        scale={15}
        blur={2} 
        far={4}
      />
    </Suspense>
  );
});

Fantasy3DScene.displayName = 'Fantasy3DScene';
