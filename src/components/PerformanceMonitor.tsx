import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

interface PerformanceBudget {
  maxDrawCalls: number;
  maxPolygons: number;
  targetFPS: number;
  maxMemoryMB: number;
}

interface PerformanceStats {
  fps: number;
  drawCalls: number;
  polygons: number;
  memoryUsageMB: number;
  frameTime: number;
}

interface PerformanceMonitorProps {
  budget: PerformanceBudget;
  onBudgetExceeded?: (stats: PerformanceStats, budget: PerformanceBudget) => void;
  onPerformanceUpdate?: (stats: PerformanceStats) => void;
  enableProfiling?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  budget,
  onBudgetExceeded,
  onPerformanceUpdate,
  enableProfiling = false
}) => {
  const { gl } = useThree();
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);
  const [currentStats, setCurrentStats] = useState<PerformanceStats>({
    fps: 0,
    drawCalls: 0,
    polygons: 0,
    memoryUsageMB: 0,
    frameTime: 0
  });

  useFrame(() => {
    frameCount.current++;
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime.current;

    // Update stats every second
    if (deltaTime >= 1000) {
      const fps = (frameCount.current * 1000) / deltaTime;
      
      // Update FPS history for smoothing
      fpsHistory.current.push(fps);
      if (fpsHistory.current.length > 10) {
        fpsHistory.current.shift();
      }
      
      const avgFPS = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length;
      
      // Get WebGL stats
      const info = gl.info;
      const memory = (performance as any).memory;
      
      const stats: PerformanceStats = {
        fps: avgFPS,
        drawCalls: info.render.calls,
        polygons: info.render.triangles,
        memoryUsageMB: memory ? memory.usedJSHeapSize / (1024 * 1024) : 0,
        frameTime: 1000 / avgFPS
      };
      
      setCurrentStats(stats);
      onPerformanceUpdate?.(stats);
      
      // Check budget violations
      if (stats.fps < budget.targetFPS || 
          stats.drawCalls > budget.maxDrawCalls ||
          stats.polygons > budget.maxPolygons ||
          stats.memoryUsageMB > budget.maxMemoryMB) {
        onBudgetExceeded?.(stats, budget);
      }
      
      frameCount.current = 0;
      lastTime.current = currentTime;
      
      // Reset WebGL counters
      info.reset();
    }
  });

  // Performance profiling overlay - render outside Canvas
  if (enableProfiling) {
    // This should be rendered outside the Canvas, not inside
    console.log('Performance Stats:', {
      fps: currentStats.fps.toFixed(1),
      drawCalls: currentStats.drawCalls,
      polygons: currentStats.polygons,
      memory: currentStats.memoryUsageMB.toFixed(1) + 'MB',
      frameTime: currentStats.frameTime.toFixed(2) + 'ms'
    });
  }

  return null;
};