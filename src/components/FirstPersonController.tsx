
import React, { useRef, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { VirtualJoystick } from './VirtualJoystick';
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
  const isMobile = useIsMobile();
  const targetPosition = useRef(new Vector3(...position));
  const moveSpeed = useRef(0);
  const moveDirection = useRef(0);
  const swayTime = useRef(0);
  
  // Camera rotation state
  const yawAngle = useRef(0);
  const pitchAngle = useRef(0);
  const isMouseDown = useRef(false);
  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);

  const handleJoystickMove = (dx: number, dy: number) => {
    if (Math.abs(dy) > 0.1) {
      moveSpeed.current = Math.min(7, Math.abs(dy) * 7);
      moveDirection.current = dy < 0 ? 1 : -1;
    } else {
      moveSpeed.current = 0;
      moveDirection.current = 0;
    }

    if (Math.abs(dx) > 0.05) {
      yawAngle.current += dx * 0.05;
    }
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Forward movement - no limits for infinite world
      if ((event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') && canMoveForward) {
        moveSpeed.current = 7; // Increased speed from 5 to 7
        moveDirection.current = 1;
      }
      // Backward movement - allow but with reasonable limit
      if (event.key === 's' || event.key === 'S' || event.key === 'ArrowDown') {
        moveSpeed.current = 7; // Increased speed from 5 to 7
        moveDirection.current = -1;
      }
      // A and D keys do nothing now
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

  // Mouse look controls
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        isMouseDown.current = true;
        lastMouseX.current = event.clientX;
        lastMouseY.current = event.clientY;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isMouseDown.current) {
        const deltaX = event.clientX - lastMouseX.current;
        const deltaY = event.clientY - lastMouseY.current;
        lastMouseX.current = event.clientX;
        lastMouseY.current = event.clientY;
        
        yawAngle.current += deltaX * 0.003; // Horizontal look
        pitchAngle.current = Math.max(-Math.PI/3, Math.min(Math.PI/3, pitchAngle.current - deltaY * 0.003)); // Vertical look with limits
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

  // Touch look controls for mobile
  useEffect(() => {
    if (!isMobile) return;
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        isMouseDown.current = true;
        lastMouseX.current = event.touches[0].clientX;
        lastMouseY.current = event.touches[0].clientY;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isMouseDown.current || event.touches.length !== 1) return;
      const deltaX = event.touches[0].clientX - lastMouseX.current;
      const deltaY = event.touches[0].clientY - lastMouseY.current;
      lastMouseX.current = event.touches[0].clientX;
      lastMouseY.current = event.touches[0].clientY;
      yawAngle.current += deltaX * 0.003;
      pitchAngle.current = Math.max(-Math.PI/3, Math.min(Math.PI/3, pitchAngle.current - deltaY * 0.003));
    };

    const handleTouchEnd = () => {
      isMouseDown.current = false;
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouchStart);
      canvas.addEventListener('touchmove', handleTouchMove);
      canvas.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isMobile]);

  useFrame((state, delta) => {
    swayTime.current += delta;
    
    // Movement with infinite forward capability
    if (moveSpeed.current > 0) {
      if (moveDirection.current === 1 && canMoveForward) {
        // Infinite forward movement
        targetPosition.current.z -= moveSpeed.current * delta;
      } else if (moveDirection.current === -1) {
        // Backward movement with reasonable limit (can go back to start)
        targetPosition.current.z += moveSpeed.current * delta;
        targetPosition.current.z = Math.min(0, targetPosition.current.z);
      }
    }
    
    // Lock X-position to center path
    targetPosition.current.x = 0;
    
    // Smooth camera movement
    camera.position.lerp(targetPosition.current, 0.08);
    
    // Add gentle head sway for walking immersion
    const swayAmount = moveSpeed.current > 0 ? 0.03 : 0.01;
    camera.position.x = targetPosition.current.x + Math.sin(swayTime.current * 1.8) * swayAmount;
    camera.position.y = targetPosition.current.y + Math.sin(swayTime.current * 2.2) * swayAmount * 0.5;
    
    // Apply yaw and pitch rotation
    const lookDistance = 5;
    const lookTarget = new Vector3(
      camera.position.x + Math.sin(yawAngle.current) * lookDistance * Math.cos(pitchAngle.current),
      camera.position.y + Math.sin(pitchAngle.current) * lookDistance,
      camera.position.z - Math.cos(yawAngle.current) * lookDistance * Math.cos(pitchAngle.current)
    );
    
    camera.lookAt(lookTarget);
    
    // Notify parent of position changes
    onPositionChange(camera.position);
  });

  return (
    <>
      {isMobile && <VirtualJoystick onMove={handleJoystickMove} />}
    </>
  );
};
