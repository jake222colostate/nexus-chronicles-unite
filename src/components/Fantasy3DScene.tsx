
import React, { Suspense, useMemo, useState, useEffect, useCallback } from 'react';
import { Vector3 } from 'three';
import { ContactShadows } from '@react-three/drei';
import { Enhanced360Controller } from './Enhanced360Controller';
import { ChunkSystem, ChunkData } from './ChunkSystem';
import { OptimizedFantasyEnvironment } from './OptimizedFantasyEnvironment';
import { CasualFog } from './CasualFog';
import { Sun } from './Sun';
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

  // OPTIMIZED: Stable camera position with less frequent updates
  const safeCameraPosition = useMemo(() => {
    if (!cameraPosition || isNaN(cameraPosition.x) || isNaN(cameraPosition.y) || isNaN(cameraPosition.z)) {
      return new Vector3(0, 2, 20);
    }
    return cameraPosition;
  }, [
    Math.floor(cameraPosition.x / 5) * 5,
    Math.floor(cameraPosition.y / 5) * 5,
    Math.floor(cameraPosition.z / 5) * 5
  ]);

  // OPTIMIZED: Reduced leech spawning frequency
  const playerProgressMemo = useMemo(() => 
    Math.floor(Math.abs(safeCameraPosition.z) / 50) * 50, // Update every 50 units
    [Math.abs(safeCameraPosition.z)]
  );

  // Spawn leeches based on player progress - optimized
  useEffect(() => {
    const desiredLeechCount = Math.min(Math.floor(playerProgressMemo / 100) + 1, 4); // Reduced max leeches
    
    setLeeches(currentLeeches => {
      const aliveLeeches = currentLeeches.filter(leech => leech.alive);
      const neededLeeches = desiredLeechCount - aliveLeeches.length;
      
      if (neededLeeches > 0) {
        const newLeeches: LeechData[] = [];
        
        for (let i = 0; i < neededLeeches; i++) {
          const spawnDistance = playerProgressMemo + 80 + (i * 40);
          const spawnX = (Math.random() - 0.5) * 15; // Reduced spawn width
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
  }, [playerProgressMemo, nextLeechId]);

  // OPTIMIZED: Memoized enemy count update
  const aliveLeechCount = useMemo(() => 
    leeches.filter(leech => leech.alive).length,
    [leeches]
  );

  useEffect(() => {
    if (onEnemyCountChange) onEnemyCountChange(aliveLeechCount);
  }, [aliveLeechCount, onEnemyCountChange]);

  // OPTIMIZED: Memoized callbacks to prevent re-renders
  const handleLeechPositionUpdate = useCallback((leechId: string, newPosition: Vector3) => {
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
  }, []);

  const handleLeechReachPlayer = useCallback((leechId: string) => {
    setLeeches(current => 
      current.map(leech => 
        leech.id === leechId 
          ? { ...leech, alive: false }
          : leech
      )
    );
    onEnemyKilled?.();
  }, [onEnemyKilled]);

  const handleLeechHit = useCallback((leechId: string, damage: number) => {
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
  }, [onEnemyKilled]);

  // OPTIMIZED: Memoized leech positions
  const aliveLeechPositions = useMemo(() => 
    leeches
      .filter(leech => leech.alive && leech.position)
      .map(leech => leech.position),
    [leeches]
  );

  const handlePositionChange = useCallback((position: Vector3) => {
    if (onPositionChange && position) {
      onPositionChange(position);
    }
  }, [onPositionChange]);

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

        {/* OPTIMIZED: Smaller ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#2d4a2d" />
        </mesh>

        <ambientLight intensity={0.4} />
        <Sun position={[10, 20, 5]} />

        {/* OPTIMIZED: Render fewer leeches */}
        {leeches.slice(0, 3).map(leech => 
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

        {/* OPTIMIZED: Reduced chunk size and render distance */}
        <ChunkSystem
          playerPosition={safeCameraPosition}
          chunkSize={chunkSize}
          renderDistance={Math.min(renderDistance, 80)} // Reduced render distance
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

        {/* OPTIMIZED: Reduced shadow complexity */}
        <ContactShadows 
          position={[0, -1.4, safeCameraPosition.z]} 
          opacity={0.02}
          scale={10}
          blur={1} 
          far={2}
        />
      </Suspense>
    </CollisionProvider>
  );
});

Fantasy3DScene.displayName = 'Fantasy3DScene';
