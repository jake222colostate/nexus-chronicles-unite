
import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { Vector3 } from 'three';
import { Enhanced360Controller } from './Enhanced360Controller';
import { ChunkSystem, ChunkData } from './ChunkSystem';
import { OptimizedFantasyEnvironment } from './OptimizedFantasyEnvironment';
import { LeechEnemy } from './LeechEnemy';
import { MagicStaffWeaponSystem } from './MagicStaffWeaponSystem';
import { CollisionProvider } from '@/lib/CollisionContext';

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

  // SIMPLIFIED: Basic camera position with fallback
  const safeCameraPosition = useMemo(() => {
    if (!cameraPosition || isNaN(cameraPosition.x) || isNaN(cameraPosition.y) || isNaN(cameraPosition.z)) {
      return new Vector3(0, 2, 20);
    }
    return cameraPosition;
  }, [cameraPosition]);

  // REDUCED: Spawn fewer leeches for 60 FPS
  useEffect(() => {
    const playerProgress = Math.abs(safeCameraPosition.z);
    const desiredLeechCount = Math.min(Math.floor(playerProgress / 100) + 1, 3); // REDUCED from 8 to 3
    
    setLeeches(currentLeeches => {
      const aliveLeeches = currentLeeches.filter(leech => leech.alive);
      const neededLeeches = desiredLeechCount - aliveLeeches.length;
      
      if (neededLeeches > 0) {
        const newLeeches: LeechData[] = [];
        
        for (let i = 0; i < neededLeeches; i++) {
          const spawnDistance = playerProgress + 80 + (i * 50); // INCREASED spacing
          const spawnX = (Math.random() - 0.5) * 20;
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
  }, [Math.floor(Math.abs(safeCameraPosition.z) / 100), nextLeechId]); // REDUCED frequency

  // Update enemy count for UI
  useEffect(() => {
    const aliveCount = leeches.filter(leech => leech.alive).length;
    if (onEnemyCountChange) onEnemyCountChange(aliveCount);
  }, [leeches, onEnemyCountChange]);

  // Handle leech position updates
  const handleLeechPositionUpdate = (leechId: string, newPosition: Vector3) => {
    if (!newPosition || isNaN(newPosition.x) || isNaN(newPosition.y) || isNaN(newPosition.z)) {
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

  // Simplified leech position filtering
  const aliveLeechPositions = useMemo(() => 
    leeches
      .filter(leech => leech.alive && leech.position)
      .map(leech => leech.position),
    [leeches]
  );

  // Simplified position change handler
  const handlePositionChange = (position: Vector3) => {
    if (onPositionChange && position) {
      onPositionChange(position);
    }
  };

  return (
    <CollisionProvider>
      <Suspense fallback={null}>
        <Enhanced360Controller
          position={[0, 2, 20]}
          onPositionChange={handlePositionChange}
          enemyPositions={aliveLeechPositions}
        />

        <color attach="background" args={['#2d1b4e']} />

        {/* MINIMAL: Basic lighting for 60 FPS */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.0} />

        {/* REDUCED: Fewer leeches */}
        {leeches.slice(0, 2).map(leech => 
          leech.alive && leech.spawnPosition && (
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

        <MagicStaffWeaponSystem
          upgradeLevel={maxUnlockedUpgrade}
          visible={true}
          enemyPositions={aliveLeechPositions}
          onHitEnemy={(index, damage) => {
            const aliveLeech = leeches.filter(leech => leech.alive)[index];
            if (aliveLeech) {
              handleLeechHit(aliveLeech.id, damage);
            }
          }}
          damage={weaponDamage}
        />

        {/* ULTRA-REDUCED: Minimal chunk system */}
        <ChunkSystem
          playerPosition={safeCameraPosition}
          chunkSize={100} // INCREASED for fewer chunks
          renderDistance={50} // REDUCED for 60 FPS
        >
          {(chunks: ChunkData[]) => (
            <OptimizedFantasyEnvironment
              chunks={chunks}
              chunkSize={100}
              realm={realm}
              playerPosition={safeCameraPosition}
            />
          )}
        </ChunkSystem>
      </Suspense>
    </CollisionProvider>
  );
});

Fantasy3DScene.displayName = 'Fantasy3DScene';
