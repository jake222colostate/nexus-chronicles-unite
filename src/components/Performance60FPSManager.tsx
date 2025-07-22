import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PCFSoftShadowMap } from 'three';

interface Performance60FPSManagerProps {
  targetFPS?: number;
  adaptiveQuality?: boolean;
}

export const Performance60FPSManager: React.FC<Performance60FPSManagerProps> = ({ 
  targetFPS = 60,
  adaptiveQuality = true 
}) => {
  const { gl, scene, camera } = useThree();
  const frameTimeRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const adaptiveSettingsRef = useRef({
    pixelRatio: gl.getPixelRatio(),
    shadowMapEnabled: gl.shadowMap.enabled,
    antialias: true
  });

  useEffect(() => {
    // Optimize renderer settings for 60 FPS
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Limit pixel ratio
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = PCFSoftShadowMap;
    gl.shadowMap.autoUpdate = false; // Manual shadow updates for performance
    
    // Optimize scene settings
    scene.matrixAutoUpdate = false;
    
    console.log('Performance60FPSManager: Initialized with target FPS:', targetFPS);
  }, [gl, scene, targetFPS]);

  useFrame(() => {
    if (!adaptiveQuality) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTimeRef.current;
    lastFrameTimeRef.current = currentTime;

    // Track frame times over last 30 frames
    frameTimeRef.current.push(deltaTime);
    if (frameTimeRef.current.length > 30) {
      frameTimeRef.current.shift();
    }

    // Calculate average FPS over recent frames
    if (frameTimeRef.current.length >= 10) {
      const avgFrameTime = frameTimeRef.current.reduce((a, b) => a + b) / frameTimeRef.current.length;
      const currentFPS = 1000 / avgFrameTime;
      
      // Adaptive quality adjustments
      if (currentFPS < targetFPS - 5) {
        // Performance is low, reduce quality
        if (gl.getPixelRatio() > 0.8) {
          gl.setPixelRatio(Math.max(0.8, gl.getPixelRatio() - 0.1));
        }
        
        // Reduce shadow updates frequency
        if (Math.random() < 0.7) { // Only update shadows 70% of frames
          gl.shadowMap.needsUpdate = false;
        }
      } else if (currentFPS > targetFPS + 10) {
        // Performance is good, can increase quality slightly
        if (gl.getPixelRatio() < adaptiveSettingsRef.current.pixelRatio) {
          gl.setPixelRatio(Math.min(adaptiveSettingsRef.current.pixelRatio, gl.getPixelRatio() + 0.05));
        }
        
        gl.shadowMap.needsUpdate = true;
      }
    }
  });

  useEffect(() => {
    // Manual shadow update control
    const shadowUpdateInterval = setInterval(() => {
      if (gl.shadowMap.enabled) {
        gl.shadowMap.needsUpdate = true;
      }
    }, 100); // Update shadows 10 times per second instead of every frame

    return () => {
      clearInterval(shadowUpdateInterval);
    };
  }, [gl]);

  return null; // This component only manages performance, no visual elements
};