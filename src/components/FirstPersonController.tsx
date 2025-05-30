
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
  const moveDirection = useRef(0); // 1 for forward, -1 for backward, 0 for stopped
  const swayTime = useRef(0);
  
  // Camera rotation state
  const yawAngle = useRef(0); // Horizontal rotation (-Math.PI to Math.PI for 180 degrees each way)
  const isMouseDown = useRef(false);
  const lastMouseX = useRef(0);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Forward movement
      if ((event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') && canMoveForward) {
        moveSpeed.current = 3;
        moveDirection.current = 1;
      }
      // Backward movement
      if (event.key === 's' || event.key === 'S' || event.key === 'ArrowDown') {
        moveSpeed.current = 3;
        moveDirection.current = -1;
      }
      // Horizontal look controls with A/D keys
      if (event.key === 'a' || event.key === 'A' || event.key === 'ArrowLeft') {
        yawAngle.current = Math.max(-Math.PI, yawAngle.current - 0.05);
      }
      if (event.key === 'd' || event.key === 'D' || event.key === 'ArrowRight') {
        yawAngle.current = Math.min(Math.PI, yawAngle.current + 0.05);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp' ||
          event.key === 's' || event.key === 'S' || event.key === 'ArrowDown') {
        moveSpeed.current = 0;
        moveDirection.current = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [canMoveForward]);

  // Handle mouse look controls
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // Left mouse button
        isMouseDown.current = true;
        lastMouseX.current = event.clientX;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isMouseDown.current) {
        const deltaX = event.clientX - lastMouseX.current;
        lastMouseX.current = event.clientX;
        
        // Update yaw with mouse movement, clamped to 180 degrees each way
        yawAngle.current = Math.max(-Math.PI, Math.min(Math.PI, yawAngle.current + deltaX * 0.003));
      }
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('mouseleave', handleMouseUp);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseUp);
      }
    };
  }, []);

  // Handle touch input for mobile with improved look controls
  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const y = touch.clientY - rect.top;
        const x = touch.clientX - rect.left;
        
        // Movement in upper portion (forward)
        if (y < rect.height * 0.3 && canMoveForward) {
          moveSpeed.current = 3;
          moveDirection.current = 1;
        }
        // Movement in lower portion (backward)
        else if (y > rect.height * 0.7) {
          moveSpeed.current = 3;
          moveDirection.current = -1;
        }
        
        // Look direction based on horizontal position
        if (x < rect.width * 0.3) {
          yawAngle.current = Math.max(-Math.PI, yawAngle.current - 0.1);
        } else if (x > rect.width * 0.7) {
          yawAngle.current = Math.min(Math.PI, yawAngle.current + 0.1);
        }
      }
    };

    const handleTouchEnd = () => {
      moveSpeed.current = 0;
      moveDirection.current = 0;
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
    
    // Move based on direction and speed
    if (moveSpeed.current > 0) {
      if (moveDirection.current === 1 && canMoveForward) {
        // Forward movement
        targetPosition.current.z -= moveSpeed.current * delta;
        // Limit how far forward we can go
        targetPosition.current.z = Math.max(-50, targetPosition.current.z);
      } else if (moveDirection.current === -1) {
        // Backward movement
        targetPosition.current.z += moveSpeed.current * delta;
        // Limit how far backward we can go (back to starting position)
        targetPosition.current.z = Math.min(0, targetPosition.current.z);
      }
    }
    
    // Lock X-position to center path (with minimal sway)
    targetPosition.current.x = 0;
    
    // Smooth camera movement
    camera.position.lerp(targetPosition.current, 0.08);
    
    // Add gentle head sway for walking immersion
    const swayAmount = moveSpeed.current > 0 ? 0.03 : 0.01;
    camera.position.x = targetPosition.current.x + Math.sin(swayTime.current * 1.8) * swayAmount;
    camera.position.y = targetPosition.current.y + Math.sin(swayTime.current * 2.2) * swayAmount * 0.5;
    
    // Apply yaw rotation to camera look direction
    const lookDistance = 5;
    const lookTarget = new Vector3(
      camera.position.x + Math.sin(yawAngle.current) * lookDistance,
      camera.position.y,
      camera.position.z - Math.cos(yawAngle.current) * lookDistance
    );
    
    // Add automatic attention-drawing rotation towards upgrades (subtle)
    const autoLookOffset = Math.sin(swayTime.current * 0.8) * 0.05;
    lookTarget.x += autoLookOffset;
    
    camera.lookAt(lookTarget);
    
    // Notify parent of position changes
    onPositionChange(camera.position);
  });

  return null;
};
