
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';

interface VerticalCameraControllerProps {
  camera: any;
  minY?: number;
  maxY?: number;
  sensitivity?: number;
  onPositionChange?: (position: Vector3) => void;
}

export const VerticalCameraController: React.FC<VerticalCameraControllerProps> = ({
  camera,
  minY = -10,
  maxY = 20,
  sensitivity = 1,
  onPositionChange
}) => {
  const isDragging = useRef(false);
  const lastMouseY = useRef(0);
  const targetY = useRef(2);
  const lastNotifiedPosition = useRef(new Vector3());

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        isDragging.current = true;
        lastMouseY.current = event.clientY;
        event.preventDefault();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging.current && camera) {
        const deltaY = event.clientY - lastMouseY.current;
        lastMouseY.current = event.clientY;
        
        targetY.current = Math.max(minY, Math.min(maxY, targetY.current - deltaY * sensitivity * 0.01));
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        isDragging.current = true;
        lastMouseY.current = event.touches[0].clientY;
        event.preventDefault();
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (isDragging.current && event.touches.length === 1 && camera) {
        const deltaY = event.touches[0].clientY - lastMouseY.current;
        lastMouseY.current = event.touches[0].clientY;
        
        targetY.current = Math.max(minY, Math.min(maxY, targetY.current - deltaY * sensitivity * 0.01));
        event.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [camera, minY, maxY, sensitivity]);

  useFrame(() => {
    if (camera) {
      // Smooth camera Y movement
      camera.position.y = MathUtils.lerp(camera.position.y, targetY.current, 0.1);
      
      // Notify parent of position changes
      if (onPositionChange) {
        const currentPosition = camera.position.clone();
        const distanceMoved = currentPosition.distanceTo(lastNotifiedPosition.current);
        
        // Only notify if position changed significantly
        if (distanceMoved > 0.1) {
          lastNotifiedPosition.current.copy(currentPosition);
          onPositionChange(currentPosition);
        }
      }
    }
  });

  return null;
};
