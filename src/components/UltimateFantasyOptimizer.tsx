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
  // Optimized performance budget for stable 60 FPS
  const performanceBudget = {
    maxDrawCalls: 200,       // Reasonable draw call limit
    maxPolygons: 300000,     // Increased for proper loading
    targetFPS: 45,           // More achievable target
    maxMemoryMB: 200         // Increased memory allowance
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
        enableProfiling={false} // Disabled to prevent HTML in Canvas error
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
            maxActiveAnimations={30}   // Increased animation limit
            viewDistance={120}         // Reasonable animation distance
            cameraPosition={playerPosition}
          >
            {/* Frustum culling for all child elements */}
            <FrustumCullingSystem
              enabled={true}
              cullDistance={180}  // Less aggressive culling
            >
              {children}
            </FrustumCullingSystem>
          </AnimationBudgetSystem>
        )}
      </DynamicAssetStreaming>
    </>
  );
};