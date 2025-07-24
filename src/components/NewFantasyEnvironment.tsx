import React, { Suspense } from 'react';
import { Vector3 } from 'three';
import { NewFantasyChunkSystem, FantasyChunkData } from './NewFantasyChunkSystem';
import { RaisedPathTiles } from './RaisedPathTiles';
import { BrightGreenTerrain } from './BrightGreenTerrain';
import { BackgroundMountains } from './BackgroundMountains';
import { StylizedTrees } from './StylizedTrees';
import { PolishedFantasySkybox } from './PolishedFantasySkybox';
import { SkeletonEnemySystem } from './SkeletonEnemySystem';
import { ForestEnvironmentSystem } from './ForestEnvironmentSystem';

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
        {/* Bright daylight skybox */}
        <PolishedFantasySkybox />
        
        {/* Bright daylight lighting system */}
        <ambientLight intensity={0.6} color="#FFFFFF" />
        <directionalLight
          position={[50, 80, 30]}
          intensity={1.8}
          color="#FFFFFF"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={300}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
          shadow-bias={-0.0001}
        />
        
        {/* Fill light for even illumination */}
        <directionalLight
          position={[-30, 60, 20]}
          intensity={0.8}
          color="#E3F2FD"
          castShadow={false}
        />
        
        {/* Background mountains (static) */}
        <BackgroundMountains playerPosition={playerPosition} />
        
        {/* Dynamic chunk-based environment */}
        <NewFantasyChunkSystem
          playerPosition={playerPosition}
          chunkSize={chunkSize}
          renderDistance={renderDistance}
        >
          {(chunks: FantasyChunkData[]) => (
            <>
              {/* Bright green terrain base */}
              <BrightGreenTerrain chunks={chunks} chunkSize={chunkSize} />
              
              {/* Raised 3-lane path tiles */}
              <RaisedPathTiles chunks={chunks} chunkSize={chunkSize} />
              
              {/* Sparse stylized trees */}
              <StylizedTrees chunks={chunks} chunkSize={chunkSize} />
              
              {/* Enemy system using chunks */}
              <SkeletonEnemySystem
                chunks={chunks.map(chunk => ({
                  x: chunk.x,
                  z: chunk.z,
                  worldX: chunk.worldX,
                  worldZ: chunk.worldZ,
                  id: chunk.id,
                  seed: chunk.seed
                }))}
                chunkSize={chunkSize}
                playerPosition={playerPosition}
                onEnemyCountChange={onEnemyCountChange}
                onEnemyKilled={onEnemyKilled}
                weaponDamage={weaponDamage}
                realm={realm}
              />
              
              {/* Forest environment assets (if needed) */}
              <ForestEnvironmentSystem
                chunks={chunks.map(chunk => ({
                  x: chunk.x,
                  z: chunk.z,
                  worldX: chunk.worldX,
                  worldZ: chunk.worldZ,
                  id: chunk.id,
                  seed: chunk.seed
                }))}
                chunkSize={chunkSize}
                realm={realm}
                playerPosition={playerPosition}
              />
            </>
          )}
        </NewFantasyChunkSystem>
        
        {/* Depth fog for atmosphere */}
        <fog attach="fog" args={['#B0E0E6', 100, 250]} />
      </group>
    </Suspense>
  );
};