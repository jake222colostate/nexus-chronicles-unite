
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

  // FIXED: Simplified camera position validation - don't be too aggressive
  const safeCameraPosition = useMemo(() => {
    if (!cameraPosition || isNaN(cameraPosition.x) || isNaN(cameraPosition.y) || isNaN(cameraPosition.z)) {
      return new Vector3(0, 2, 20);
    }
    return cameraPosition;
  }, [cameraPosition]);

  // Spawn leeches based on player progress
  useEffect(() => {
    const playerProgress = Math.abs(safeCameraPosition.z);
    const desiredLeechCount = Math.min(Math.floor(playerProgress / 30) + 1, 8);
    
    setLeeches(currentLeeches => {
      const aliveLeeches = currentLeeches.filter(leech => leech.alive);
      const neededLeeches = desiredLeechCount - aliveLeeches.length;
      
      if (neededLeeches > 0) {
        const newLeeches: LeechData[] = [];
        
        for (let i = 0; i < neededLeeches; i++) {
          const spawnDistance = playerProgress + 80 + (i * 25);
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
  }, [Math.floor(Math.abs(safeCameraPosition.z) / 30), nextLeechId]);

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

  // FIXED: Simplified leech position filtering
  const aliveLeechPositions = useMemo(() => 
    leeches
      .filter(leech => leech.alive && leech.position)
      .map(leech => leech.position),
    [leeches]
  );

  // FIXED: Simplified position change handler
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

        <CasualFog />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <planeGeometry args={[300, 300]} />
          <meshStandardMaterial color="#2d4a2d" />
        </mesh>

        <ambientLight intensity={0.6} />
        <Sun position={[10, 20, 5]} />

        {leeches.map(leech => 
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

        <ContactShadows 
          position={[0, -1.4, safeCameraPosition.z]} 
          opacity={0.05}
          scale={15}
          blur={2} 
          far={4}
        />
      </Suspense>
    </CollisionProvider>
  );
});

Fantasy3DScene.displayName = 'Fantasy3DScene';
