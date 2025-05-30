
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
  const lookDirection = useRef(0); // For subtle left/right looking

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') && canMoveForward) {
        moveSpeed.current = 3;
      }
      // Subtle left/right look controls
      if (event.key === 'a' || event.key === 'A' || event.key === 'ArrowLeft') {
        lookDirection.current = -0.3;
      }
      if (event.key === 'd' || event.key === 'D' || event.key === 'ArrowRight') {
        lookDirection.current = 0.3;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') {
        moveSpeed.current = 0;
      }
      if (event.key === 'a' || event.key === 'A' || event.key === 'ArrowLeft' ||
          event.key === 'd' || event.key === 'D' || event.key === 'ArrowRight') {
        lookDirection.current = 0;
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
        const x = touch.clientX - rect.left;
        
        // Movement in upper portion
        if (y < rect.height * 0.6) {
          moveSpeed.current = 3;
        }
        
        // Look direction based on horizontal position
        if (x < rect.width * 0.3) {
          lookDirection.current = -0.3; // Look left
        } else if (x > rect.width * 0.7) {
          lookDirection.current = 0.3; // Look right
        }
      }
    };

    const handleTouchEnd = () => {
      moveSpeed.current = 0;
      lookDirection.current = 0;
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
    
    // Move forward when input is active (Z-axis only)
    if (moveSpeed.current > 0) {
      targetPosition.current.z -= moveSpeed.current * delta;
      // Limit how far forward we can go
      targetPosition.current.z = Math.max(-50, targetPosition.current.z);
    }
    
    // Lock X-position to center path (with minimal sway)
    targetPosition.current.x = 0;
    
    // Smooth camera movement
    camera.position.lerp(targetPosition.current, 0.08);
    
    // Add gentle head sway for walking immersion
    const swayAmount = moveSpeed.current > 0 ? 0.03 : 0.01;
    camera.position.x = targetPosition.current.x + Math.sin(swayTime.current * 1.8) * swayAmount;
    camera.position.y = targetPosition.current.y + Math.sin(swayTime.current * 2.2) * swayAmount * 0.5;
    
    // Camera look direction with subtle left/right attention-drawing
    const lookTarget = new Vector3(
      camera.position.x + lookDirection.current * 2, // Subtle side-looking
      camera.position.y, 
      camera.position.z - 5
    );
    
    // Add automatic attention-drawing rotation towards upgrades
    const autoLookOffset = Math.sin(swayTime.current * 0.8) * 0.1;
    lookTarget.x += autoLookOffset;
    
    camera.lookAt(lookTarget);
    
    // Notify parent of position changes
    onPositionChange(camera.position);
  });

  return null;
};
