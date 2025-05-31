
import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OptimizedChunkSystem } from './OptimizedChunkSystem';
import { OptimizedMountainSystem } from './OptimizedMountainSystem';
import { OptimizedPathwaySystem } from './OptimizedPathwaySystem';
import { Enhanced360Controller } from './Enhanced360Controller';
import { OptimizedJourneyTracker } from './OptimizedJourneyTracker';

interface Optimized3DWorldManagerProps {
  realm: 'fantasy' | 'scifi';
  onPlayerPositionUpdate?: (position: { x: number; y: number; z: number }) => void;
  onJourneyUpdate: (distance: number) => void;
  children?: React.ReactNode;
}

export const Optimized3DWorldManager: React.FC<Optimized3DWorldManagerProps> = ({
  realm,
  onPlayerPositionUpdate,
  onJourneyUpdate,
  children
}) => {
  const [playerPosition, setPlayerPosition] = React.useState({ x: 0, y: 1.6, z: 0 });

  const handlePositionChange = React.useCallback((position: { x: number; y: number; z: number }) => {
    setPlayerPosition(position);
    onPlayerPositionUpdate?.(position);
  }, [onPlayerPositionUpdate]);

  const lighting = useMemo(() => (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[50, 50, 25]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={200}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <hemisphereLight args={['#87CEEB', '#98FB98', 0.3]} />
    </>
  ), []);

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ 
          position: [0, 1.6, 0], 
          fov: 75,
          near: 0.1,
          far: 500
        }}
        shadows
        performance={{ min: 0.8 }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          {lighting}
          
          <Enhanced360Controller
            position={[playerPosition.x, playerPosition.y, playerPosition.z]}
            onPositionChange={handlePositionChange}
          />

          <OptimizedChunkSystem
            playerPosition={playerPosition}
            chunkSize={50}
            renderDistance={3}
          >
            {(chunks) => (
              <>
                <OptimizedMountainSystem chunks={chunks} chunkSize={50} />
                <OptimizedPathwaySystem chunks={chunks} chunkSize={50} />
              </>
            )}
          </OptimizedChunkSystem>

          {children}
        </Suspense>
      </Canvas>

      <OptimizedJourneyTracker 
        playerPosition={playerPosition}
        onJourneyUpdate={onJourneyUpdate}
      />
    </div>
  );
};
