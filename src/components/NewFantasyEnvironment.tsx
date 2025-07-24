import React, { Suspense } from 'react';
import { Vector3 } from 'three';
import { NewFantasyChunkSystem, FantasyChunkData } from './NewFantasyChunkSystem';
import { BrownDirtPath } from './BrownDirtPath';
import { ValleyTerrain } from './ValleyTerrain';
import { ValleyMountains } from './ValleyMountains';
import { ValleyFantasySkybox } from './ValleyFantasySkybox';
import { SkeletonEnemySystem } from './SkeletonEnemySystem';

interface NewFantasyEnvironmentProps {
  playerPosition: Vector3;
  realm: 'fantasy' | 'scifi';
  onEnemyCountChange?: (count: number) => void;
  onEnemyKilled?: () => void;
  weaponDamage: number;
  upgradesPurchased?: number;
}

export const NewFantasyEnvironment: React.FC<NewFantasyEnvironmentProps> = ({
  playerPosition,
  realm,
  onEnemyCountChange,
  onEnemyKilled,
  weaponDamage,
  upgradesPurchased = 0
}) => {
  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    return null;
  }

  const chunkSize = 40;
  const renderDistance = 150;

  console.log('NewFantasyEnvironment: Rendering polished fantasy realm');

  return (
    <Suspense fallback={null}>
      <group name="NewFantasyEnvironment">
        {/* Valley-appropriate skybox */}
        <ValleyFantasySkybox />
        
        {/* Valley lighting system - softer, more atmospheric */}
        <ambientLight intensity={0.5} color="#B0BEC5" />
        <directionalLight
          position={[30, 50, 20]}
          intensity={1.2}
          color="#CFD8DC"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={200}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
          shadow-bias={-0.0001}
        />
        
        {/* Valley rim light for atmosphere */}
        <directionalLight
          position={[-20, 40, 10]}
          intensity={0.6}
          color="#90A4AE"
          castShadow={false}
        />
        
        {/* Close valley mountains */}
        <ValleyMountains playerPosition={playerPosition} />
        
        {/* Dynamic chunk-based environment */}
        <NewFantasyChunkSystem
          playerPosition={playerPosition}
          chunkSize={chunkSize}
          renderDistance={renderDistance}
        >
          {(chunks: FantasyChunkData[]) => (
            <>
              {/* Purple valley terrain sides */}
              <ValleyTerrain chunks={chunks} chunkSize={chunkSize} />
              
              {/* Brown dirt path down the valley */}
              <BrownDirtPath chunks={chunks} chunkSize={chunkSize} />
              
              {/* Enemy system temporarily removed */}
            </>
          )}
        </NewFantasyChunkSystem>
        
        {/* Valley fog for atmospheric depth */}
        <fog attach="fog" args={['#CFD8DC', 80, 200]} />
      </group>
    </Suspense>
  );
};