import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, AnimationMixer, AnimationClip } from 'three';

interface AnimatedObject {
  id: string;
  mixer: AnimationMixer;
  position: Vector3;
  isVisible: boolean;
  priority: 'high' | 'medium' | 'low';
  lastUpdate: number;
}

interface AnimationBudgetSystemProps {
  maxActiveAnimations: number;
  viewDistance: number;
  cameraPosition: Vector3;
  children: React.ReactNode;
}

export class AnimationBudgetManager {
  private animatedObjects = new Map<string, AnimatedObject>();
  private maxActiveAnimations: number;
  private viewDistance: number;
  private updateFrequency = { high: 1, medium: 2, low: 4 }; // Frames between updates

  constructor(maxActive: number, viewDist: number) {
    this.maxActiveAnimations = maxActive;
    this.viewDistance = viewDist;
  }

  addAnimatedObject(
    id: string, 
    mixer: AnimationMixer, 
    position: Vector3, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) {
    this.animatedObjects.set(id, {
      id,
      mixer,
      position,
      isVisible: true,
      priority,
      lastUpdate: 0
    });
  }

  removeAnimatedObject(id: string) {
    this.animatedObjects.delete(id);
  }

  updateAnimations(cameraPosition: Vector3, deltaTime: number, frameCount: number) {
    // Calculate distances and visibility
    const visibleObjects: AnimatedObject[] = [];
    
    this.animatedObjects.forEach(obj => {
      const distance = cameraPosition.distanceTo(obj.position);
      obj.isVisible = distance <= this.viewDistance;
      
      if (obj.isVisible) {
        visibleObjects.push(obj);
      }
    });

    // Sort by priority and distance
    visibleObjects.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, prefer closer objects
      const distA = cameraPosition.distanceTo(a.position);
      const distB = cameraPosition.distanceTo(b.position);
      return distA - distB;
    });

    // Update animations within budget
    let activeCount = 0;
    
    for (const obj of visibleObjects) {
      if (activeCount >= this.maxActiveAnimations) break;
      
      // Check update frequency based on priority
      const freq = this.updateFrequency[obj.priority];
      const shouldUpdate = frameCount % freq === 0;
      
      if (shouldUpdate) {
        obj.mixer.update(deltaTime * freq); // Compensate for skipped frames
        obj.lastUpdate = frameCount;
        activeCount++;
      }
    }
  }

  getActiveAnimationCount(): number {
    let count = 0;
    this.animatedObjects.forEach(obj => {
      if (obj.isVisible) count++;
    });
    return count;
  }
}

export const AnimationBudgetSystem: React.FC<AnimationBudgetSystemProps> = ({
  maxActiveAnimations,
  viewDistance,
  cameraPosition,
  children
}) => {
  const budgetManager = useRef(new AnimationBudgetManager(maxActiveAnimations, viewDistance));
  const frameCount = useRef(0);

  useFrame((_, deltaTime) => {
    frameCount.current++;
    budgetManager.current.updateAnimations(cameraPosition, deltaTime, frameCount.current);
  });

  // Provide the budget manager to child components via context if needed
  return <>{children}</>;
};