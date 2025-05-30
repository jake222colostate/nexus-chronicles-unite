import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

interface FirstPersonControllerProps {
  position: [number, number, number];
  onPositionChange: (position: Vector3) => void;
  canMoveForward: boolean;
}

export const FirstPersonController: React.FC<FirstPersonControllerProps> = ({
  position,
  onPositionChange,
  canMoveForward
}) => {
  const { camera } = useThree();
  const targetPosition = useRef(new Vector3(...position));
  const moveSpeed = useRef(0);
  const swayTime = useRef(0);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') && canMoveForward) {
        moveSpeed.current = 2;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') {
        moveSpeed.current = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [canMoveForward]);

  // Handle touch input for mobile
  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (canMoveForward && event.touches.length === 1) {
        const touch = event.touches[0];
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const y = touch.clientY - rect.top;
        
        // Only move forward if touching upper half of screen
        if (y < rect.height * 0.7) { // Leave bottom 30% for UI
          moveSpeed.current = 2;
        }
      }
    };

    const handleTouchEnd = () => {
      moveSpeed.current = 0;
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
      canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [canMoveForward]);

  useFrame((state, delta) => {
    swayTime.current += delta;
    
    // Move forward when input is active
    if (moveSpeed.current > 0) {
      targetPosition.current.z -= moveSpeed.current * delta;
      // Limit how far forward we can go (don't go past the last upgrade)
      targetPosition.current.z = Math.max(-50, targetPosition.current.z);
    }
    
    // Smooth camera movement
    camera.position.lerp(targetPosition.current, 0.1);
    
    // Add gentle head sway for immersion
    const swayAmount = 0.02;
    camera.position.x = targetPosition.current.x + Math.sin(swayTime.current * 1.5) * swayAmount;
    camera.position.y = targetPosition.current.y + Math.sin(swayTime.current * 2) * swayAmount * 0.5;
    
    // Keep camera looking forward
    camera.lookAt(camera.position.x, camera.position.y, camera.position.z - 5);
    
    // Notify parent of position changes
    onPositionChange(camera.position);
  });

  return null;
};
