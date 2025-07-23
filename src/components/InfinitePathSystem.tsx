import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Box3 } from 'three';
import { useGLTF } from '@react-three/drei';
import { assetUrl } from '@/lib/utils';

// Preload the path model immediately
useGLTF.preload(assetUrl('assets/Path.glb'));

// Path Model Component with direct useGLTF
const PathModel: React.FC<{ onLoad?: (scene: any) => void }> = ({ onLoad }) => {
  try {
    const { scene } = useGLTF(assetUrl('assets/Path.glb'));
    
    // Call onLoad when model is successfully loaded
    React.useEffect(() => {
      if (scene && onLoad) {
        console.log('✅ Path.glb loaded successfully');
        onLoad(scene);
      }
    }, [scene, onLoad]);

    return <primitive object={scene.clone()} castShadow receiveShadow />;
  } catch (error) {
    console.error('❌ Failed to load Path.glb:', error);
    // Fallback geometry if model fails to load
    return (
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.2, 10]} />
        <meshStandardMaterial color="#D2B48C" />
      </mesh>
    );
  }
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
    -0.1, // Grounded at Y = -0.1 (slightly below ground)
    index * pathLength // POSITIVE Z for forward movement (corrected orientation)
  ], [index, pathLength]);

  // Random horizontal rotation (90 degree range: -45 to +45 degrees)
  const rotation: [number, number, number] = useMemo(() => [
    0, // No X rotation
    (Math.random() - 0.5) * Math.PI * 0.5, // Random Y rotation within 90 degrees (-45 to +45)
    0  // No Z rotation
  ], [index]);

  // Calculate bounding box when model loads
  const handleModelLoad = (scene: any) => {
    console.log(`🛤️ Path segment ${index} loaded`);
    if (scene && onBoundingBoxCalculated && index === 0) {
      const box = new Box3().setFromObject(scene);
      onBoundingBoxCalculated(box);
      console.log('📏 Path segment dimensions:', {
        width: (box.max.x - box.min.x).toFixed(2),
        height: (box.max.y - box.min.y).toFixed(2),
        length: (box.max.z - box.min.z).toFixed(2)
      });
    }
  };

  if (!visible) return null;

  return (
    <group ref={segmentRef} position={position} rotation={rotation} scale={[2.5, 1, 2]} name={`path-segment-${index}`}>
      <Suspense fallback={
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[6, 0.1, pathLength * 2]} />
          <meshStandardMaterial color="#8B7355" transparent opacity={0.5} />
        </mesh>
      }>
        <PathModel onLoad={index === 0 ? handleModelLoad : undefined} />
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
  pathLength = 4,     // Reduced from 6 to 4 for even more frequent segments
  renderDistance = 60
}) => {
  const [actualPathLength, setActualPathLength] = React.useState(pathLength);
  
  // Auto-calculate path length from model bounding box
  const handleBoundingBoxCalculated = (box: Box3) => {
    const modelLength = box.max.z - box.min.z;
    if (modelLength > 0 && modelLength !== actualPathLength) {
      setActualPathLength(modelLength);
      console.log(`📏 Auto-detected path length: ${modelLength.toFixed(2)} units`);
    }
  };

  // Calculate which chunks to render based on player position
  const visibleChunks = useMemo(() => {
    const playerChunkIndex = Math.floor(playerPosition.z / actualPathLength); // Positive Z for forward
    const chunks: { index: number; distance: number }[] = [];

    // Generate chunks to match upgrade system orientation (negative Z forward)
    for (let i = -chunksBehind; i <= chunksAhead; i++) {
      const chunkIndex = playerChunkIndex + i;
      const chunkZ = chunkIndex * actualPathLength; // Positive Z for positioning
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
          onBoundingBoxCalculated={index === Math.floor(playerPosition.z / actualPathLength) ? handleBoundingBoxCalculated : undefined}
        />
      ))}
      
      {/* Debug helper: Show path bounds */}
      {process.env.NODE_ENV === 'development' && (
        <group>
          {visibleChunks.slice(0, 3).map(({ index }) => (
            <mesh key={`debug-${index}`} position={[0, 0.2, index * actualPathLength]}>
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