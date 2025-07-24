import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Box3 } from 'three';

// Basic Path Geometry Component
const PathModel: React.FC<{ onLoad?: (scene: any) => void }> = ({ onLoad }) => {
  // Use basic geometry instead of GLB - no need for bounding box calculation
  return (
    <mesh position={[0, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[4, 0.2, 10]} />
      <meshStandardMaterial color="#D2B48C" />
    </mesh>
  );
};

interface PathSegmentProps {
  index: number;
  pathLength?: number;
  visible?: boolean;
  onBoundingBoxCalculated?: (box: Box3) => void;
}

// Single path segment component
const PathSegment: React.FC<PathSegmentProps> = ({ 
  index, 
  pathLength = 10, 
  visible = true,
  onBoundingBoxCalculated 
}) => {
  const segmentRef = useRef<any>(null);

  const position: [number, number, number] = useMemo(() => [
    0, // Centered on X
    -1, // Adjusted to -1 as requested
    -index * pathLength // NEGATIVE Z for forward movement (player moves in -Z direction)
  ], [index, pathLength]);

  // Random horizontal rotation (90 degree range: -45 to +45 degrees)
  const rotation: [number, number, number] = useMemo(() => [
    0, // No X rotation
    (Math.random() - 0.5) * Math.PI * 0.5, // Random Y rotation within 90 degrees (-45 to +45)
    0  // No Z rotation
  ], [index]);


  if (!visible) return null;

  return (
    <group ref={segmentRef} position={position} rotation={rotation} scale={[2.5, 1, 2]} name={`path-segment-${index}`}>
      <Suspense fallback={
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[6, 0.1, pathLength * 2]} />
          <meshStandardMaterial color="#8B7355" transparent opacity={0.5} />
        </mesh>
      }>
        <PathModel />
      </Suspense>
    </group>
  );
};

interface InfinitePathSystemProps {
  playerPosition?: Vector3;
  chunksAhead?: number;
  chunksBehind?: number;
  pathLength?: number;
  renderDistance?: number;
}

export const InfinitePathSystem: React.FC<InfinitePathSystemProps> = ({
  playerPosition = new Vector3(0, 0, 0),
  chunksAhead = 12,   // Increased from 8 to 12 for more path segments
  chunksBehind = 4,   // Increased from 3 to 4 for smoother transitions  
  pathLength = 10,    // Fixed length for basic geometry (matches boxGeometry args)
  renderDistance = 60
}) => {
  const actualPathLength = pathLength; // Use fixed length for basic geometry

  // Calculate which chunks to render based on player position
  const visibleChunks = useMemo(() => {
    const playerChunkIndex = Math.floor(-playerPosition.z / actualPathLength); // Player moves in negative Z
    const chunks: { index: number; distance: number }[] = [];

    // Generate chunks to render path forward from spawn point
    for (let i = -chunksBehind; i <= chunksAhead; i++) {
      const chunkIndex = playerChunkIndex + i; // Generate chunks ahead and behind player
      const chunkZ = -chunkIndex * actualPathLength; // Negative Z for forward path
      const distance = Math.abs(chunkZ - playerPosition.z);
      
      // Only render chunks within render distance
      if (distance <= renderDistance) {
        chunks.push({ index: chunkIndex, distance });
      }
    }

    return chunks;
  }, [playerPosition.z, actualPathLength, chunksAhead, chunksBehind, renderDistance]);

  // Performance monitoring
  useFrame(() => {
    // Log chunk count every 5 seconds for monitoring
    if (Math.floor(Date.now() / 5000) % 2 === 0) {
      const chunkCount = visibleChunks.length;
      if (chunkCount > 15) {
        console.warn(`⚠️ High chunk count: ${chunkCount} path segments`);
      }
    }
  });

  console.log(`🛤️ Path System Active: ${visibleChunks.length} segments, player Z: ${playerPosition.z.toFixed(1)}`);

  return (
    <group name="infinite-path-system">
      {/* Debug info */}
      <mesh position={[-5, 2, playerPosition.z]} scale={0.5}>
        <sphereGeometry args={[0.2]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>
      
      {visibleChunks.map(({ index, distance }) => (
        <PathSegment
          key={index}
          index={index}
          pathLength={actualPathLength}
          visible={distance <= renderDistance}
          
        />
      ))}
      
      {/* Debug helper: Show path bounds */}
      {process.env.NODE_ENV === 'development' && (
        <group>
          {visibleChunks.slice(0, 3).map(({ index }) => (
            <mesh key={`debug-${index}`} position={[0, 0.2, -index * actualPathLength]}>
              <boxGeometry args={[0.2, 0.2, 0.2]} />
              <meshBasicMaterial color="#ff0000" />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

// Export for use in other components
export { PathSegment };