import React from 'react';
import { Vector3 } from 'three';
import { PerformanceMonitor } from './PerformanceMonitor';
import { DynamicAssetStreaming } from './DynamicAssetStreaming';
import { AnimationBudgetSystem } from '../systems/AnimationBudgetSystem';
import { FrustumCullingSystem } from './FrustumCullingSystem';

interface UltimateFantasyOptimizerProps {
  playerPosition: Vector3;
  children: React.ReactNode;
}

export const UltimateFantasyOptimizer: React.FC<UltimateFantasyOptimizerProps> = ({
  playerPosition,
  children
}) => {
  // Ultra-aggressive performance budget for 60 FPS
  const performanceBudget = {
    maxDrawCalls: 150,       // Reduced from typical 300
    maxPolygons: 100000,     // Reduced from typical 200k
    targetFPS: 60,           // Strict 60 FPS target
    maxMemoryMB: 100         // Conservative memory limit
  };

  const handleBudgetExceeded = (stats: any, budget: any) => {
    console.warn('Performance budget exceeded:', {
      fps: `${stats.fps.toFixed(1)}/${budget.targetFPS}`,
      drawCalls: `${stats.drawCalls}/${budget.maxDrawCalls}`,
      polygons: `${stats.polygons}/${budget.maxPolygons}`,
      memory: `${stats.memoryUsageMB.toFixed(1)}/${budget.maxMemoryMB}MB`
    });
  };

  return (
    <>
      {/* Performance monitoring overlay */}
      <PerformanceMonitor
        budget={performanceBudget}
        onBudgetExceeded={handleBudgetExceeded}
        enableProfiling={true} // Set to false in production
      />

      {/* Dynamic asset streaming for efficient memory usage */}
      <DynamicAssetStreaming
        playerPosition={playerPosition}
        streamingDistance={200}
        chunkSize={50}
        onChunkLoad={(chunk) => {
          // console.log(`Loaded chunk: ${chunk}`);
        }}
        onChunkUnload={(chunk) => {
          // console.log(`Unloaded chunk: ${chunk}`);
        }}
      >
        {(loadedChunks, spatialSystem) => (
          /* Animation budget system for managing animation performance */
          <AnimationBudgetSystem
            maxActiveAnimations={20}   // Limit concurrent animations
            viewDistance={100}         // Reduce animation distance
            cameraPosition={playerPosition}
          >
            {/* Frustum culling for all child elements */}
            <FrustumCullingSystem
              enabled={true}
              cullDistance={150}  // Aggressive culling distance
            >
              {children}
            </FrustumCullingSystem>
          </AnimationBudgetSystem>
        )}
      </DynamicAssetStreaming>
    </>
  );
};