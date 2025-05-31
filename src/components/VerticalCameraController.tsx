
import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

interface VerticalCameraControllerProps {
  initialY?: number;
  minY?: number;
  maxY?: number;
  sensitivity?: number;
}

export const VerticalCameraController: React.FC<VerticalCameraControllerProps> = ({
  initialY = 2,
  minY = -2,
  maxY = 8,
  sensitivity = 0.01
}) => {
  const { camera } = useThree();
  const targetY = useRef(initialY);
  const isDragging = useRef(false);
  const lastY = useRef(0);

  // Touch controls for mobile (vertical swipe)
  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        isDragging.current = true;
        lastY.current = event.touches[0].clientY;
        event.preventDefault();
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (isDragging.current && event.touches.length === 1) {
        const deltaY = event.touches[0].clientY - lastY.current;
        
        // Invert the delta so swiping up moves camera up
        targetY.current -= deltaY * sensitivity;
        targetY.current = Math.max(minY, Math.min(maxY, targetY.current));
        
        lastY.current = event.touches[0].clientY;
        event.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    // Mouse controls for desktop (vertical drag)
    const handleMouseDown = (event: MouseEvent) => {
      isDragging.current = true;
      lastY.current = event.clientY;
      event.preventDefault();
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging.current) {
        const deltaY = event.clientY - lastY.current;
        
        // Invert the delta so dragging up moves camera up
        targetY.current -= deltaY * sensitivity;
        targetY.current = Math.max(minY, Math.min(maxY, targetY.current));
        
        lastY.current = event.clientY;
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    // Scroll wheel for vertical movement
    const handleWheel = (event: WheelEvent) => {
      const delta = event.deltaY * sensitivity * 2;
      targetY.current += delta;
      targetY.current = Math.max(minY, Math.min(maxY, targetY.current));
      event.preventDefault();
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      // Touch events
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd);
      
      // Mouse events
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('mouseleave', handleMouseUp);
      
      // Wheel event
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseUp);
        canvas.removeEventListener('wheel', handleWheel);
      }
    };
  }, [sensitivity, minY, maxY]);

  useFrame(() => {
    // Smoothly animate camera to target Y position
    camera.position.y += (targetY.current - camera.position.y) * 0.1;
  });

  return null;
};
