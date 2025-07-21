import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Box3 } from 'three';
import { GLBModelLoader } from './GLBModelLoader';

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
    0, // Grounded at Y = 0
    index * pathLength // Repeated along Z-axis
  ], [index, pathLength]);

  // Calculate bounding box when model loads
  const handleModelLoad = (scene: any) => {
    if (scene && onBoundingBoxCalculated && index === 0) {
      const box = new Box3().setFromObject(scene);
      onBoundingBoxCalculated(box);
      console.log('🛤️ Path segment bounding box:', {
        width: box.max.x - box.min.x,
        height: box.max.y - box.min.y,
        length: box.max.z - box.min.z
      });
    }
  };

  if (!visible) return null;

  return (
    <group ref={segmentRef} position={position}>
      <GLBModelLoader
        path="/assets/Path.glb"
        scale={1}
        castShadow={true}
        receiveShadow={true}
        onLoad={handleModelLoad}
        onError={(error) => {
          console.warn(`❌ Failed to load path segment ${index}:`, error);
        }}
        fallback={
          // Fallback: Simple rectangular path
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[4, 0.1, pathLength]} />
            <meshStandardMaterial color="#8B7355" />
          </mesh>
        }
      />
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
  chunksAhead = 10,
  chunksBehind = 2,
  pathLength = 10,
  renderDistance = 100
}) => {
  const [actualPathLength, setActualPathLength] = React.useState(pathLength);
  
  // Auto-calculate path length from model bounding box
  const handleBoundingBoxCalculated = (box: Box3) => {
    const modelLength = box.max.z - box.min.z;
    if (modelLength > 0 && modelLength !== actualPathLength) {
      setActualPathLength(modelLength);
      console.log(`📏 Auto-detected path length: ${modelLength} units`);
    }
  };

  // Calculate which chunks to render based on player position
  const visibleChunks = useMemo(() => {
    const playerChunkIndex = Math.floor(playerPosition.z / actualPathLength);
    const chunks: { index: number; distance: number }[] = [];

    // Generate chunks from behind player to ahead of player
    for (let i = -chunksBehind; i <= chunksAhead; i++) {
      const chunkIndex = playerChunkIndex + i;
      const chunkZ = chunkIndex * actualPathLength;
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

  console.log(`🛤️ Rendering ${visibleChunks.length} path segments`);

  return (
    <group name="infinite-path-system">
      {visibleChunks.map(({ index, distance }) => (
        <PathSegment
          key={index}
          index={index}
          pathLength={actualPathLength}
          visible={distance <= renderDistance}
          onBoundingBoxCalculated={index === 0 ? handleBoundingBoxCalculated : undefined}
        />
      ))}
      
      {/* Debug helper: Show path bounds */}
      {process.env.NODE_ENV === 'development' && (
        <group>
          {visibleChunks.slice(0, 1).map(({ index }) => (
            <mesh key={`debug-${index}`} position={[0, 0.2, index * actualPathLength]}>
              <boxGeometry args={[0.2, 0.2, 0.2]} />
              <meshBasicMaterial color="#00ff00" />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

// Export for use in other components
export { PathSegment };