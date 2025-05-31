
import React from 'react';
import { ChunkData } from './ChunkSystem';
import { FantasyRoadSystem } from './FantasyRoadSystem';
import { FantasyMountainSystem } from './FantasyMountainSystem';
import { FantasyPortalSystem } from './FantasyPortalSystem';
import { FantasySkybox } from './FantasySkybox';

interface FantasyEnvironmentSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const FantasyEnvironmentSystem: React.FC<FantasyEnvironmentSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  console.log('FantasyEnvironmentSystem: Active Realm:', realm);
  
  // CRITICAL: Absolutely no rendering if not fantasy realm
  if (realm !== 'fantasy') {
    console.log('FantasyEnvironmentSystem: REJECTING - not fantasy realm');
    return null;
  }

  console.log('FantasyEnvironmentSystem: PROCEEDING with fantasy realm');

  return (
    <>
      {/* Fantasy Skybox */}
      <FantasySkybox realm={realm} />
      
      {/* Fantasy Road System */}
      <FantasyRoadSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
      
      {/* Fantasy Mountain System */}
      <FantasyMountainSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
      
      {/* Fantasy Portal System */}
      <FantasyPortalSystem
        chunks={chunks}
        chunkSize={chunkSize}
        realm={realm}
      />
    </>
  );
};
