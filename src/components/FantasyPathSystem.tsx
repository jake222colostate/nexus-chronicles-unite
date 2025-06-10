
import React, { useMemo } from 'react';
import { ChunkData } from './ChunkSystem';
import * as THREE from 'three';

// Fallback path tile component using basic geometry
const FallbackPathTile: React.FC<{ 
  position: [number, number, number]; 
}> = ({ position }) => {
  return (
    <group position={position}>
      <mesh receiveShadow>
        <boxGeometry args={[36, 0.05, 8]} />
        <meshLambertMaterial color="#DEB887" />
      </mesh>
      {/* Add decorative stones */}
      <mesh position={[15, 0.025, 3]} receiveShadow>
        <sphereGeometry args={[0.2]} />
        <meshLambertMaterial color="#A0522D" />
      </mesh>
      <mesh position={[-15, 0.025, -3]} receiveShadow>
        <sphereGeometry args={[0.15]} />
        <meshLambertMaterial color="#A0522D" />
      </mesh>
    </group>
  );
};

// Individual path tile component with simple fallback
const FantasyPathTile: React.FC<{
  position: [number, number, number];
  chunkSize: number;
}> = ({ position, chunkSize }) => {
  // Use fallback since we removed the path asset
  return <FallbackPathTile position={position} />;
};

interface FantasyPathSystemProps {
  chunks: ChunkData[];
  chunkSize: number;
  realm: 'fantasy' | 'scifi';
}

export const FantasyPathSystem: React.FC<FantasyPathSystemProps> = ({
  chunks,
  chunkSize,
  realm
}) => {
  console.log('FantasyPathSystem render - Realm:', realm, 'Chunks:', chunks.length);

  // Only render for fantasy realm
  if (realm !== 'fantasy') {
    console.log('FantasyPathSystem: Not fantasy realm, skipping');
    return null;
  }

  // Generate path tile positions for seamless coverage across chunks
  const pathTilePositions = useMemo(() => {
    console.log('Generating path tile positions for', chunks.length, 'chunks');
    const positions = [];
    chunks.forEach(chunk => {
      const { worldZ } = chunk;

      // One path segment per chunk, aligned with the chunk position
      positions.push({
        x: 0,
        y: 0,
        z: worldZ,
        chunkId: chunk.id,
        tileIndex: 0
      });
    });

    console.log(`Total fantasy path tiles generated: ${positions.length}`);
    return positions;
  }, [chunks]);

  return (
    <group name="FantasyPathSystem">
      {pathTilePositions.map((pos, index) => {
        return (
          <FantasyPathTile
            key={`fantasy-path-${pos.chunkId}-${pos.tileIndex}`}
            position={[pos.x, pos.y, pos.z]}
            chunkSize={chunkSize}
          />
        );
      })}
    </group>
  );
};

console.log('FantasyPathSystem: Using fallback geometry while waiting for new path asset');
