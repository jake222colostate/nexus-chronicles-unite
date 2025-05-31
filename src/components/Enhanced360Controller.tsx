
import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

interface Enhanced360ControllerProps {
  position: [number, number, number];
  onPositionChange: (position: Vector3) => void;
}

export const Enhanced360Controller: React.FC<Enhanced360ControllerProps> = ({
  position,
  onPositionChange
}) => {
  const { camera } = useThree();
  const targetPosition = useRef(new Vector3(...position));
  const velocity = useRef(new Vector3());
  const yawAngle = useRef(0);
  const pitchAngle = useRef(0);
  
  // Movement state
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  });
  
  // Mouse look state
  const isMouseDown = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for game controls only
      const gameKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
      if (gameKeys.includes(event.key.toLowerCase())) {
        event.preventDefault();
      }

      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          keys.current.forward = true;
          break;
        case 's':
        case 'arrowdown':
          keys.current.backward = true;
          break;
        case 'a':
        case 'arrowleft':
          keys.current.left = true;
          break;
        case 'd':
        case 'arrowright':
          keys.current.right = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          keys.current.forward = false;
          break;
        case 's':
        case 'arrowdown':
          keys.current.backward = false;
          break;
        case 'a':
        case 'arrowleft':
          keys.current.left = false;
          break;
        case 'd':
        case 'arrowright':
          keys.current.right = false;
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse look controls - only on Canvas
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      // Only handle mouse events on the canvas
      const target = event.target as HTMLElement;
      if (target.tagName === 'CANVAS' && event.button === 0) {
        isMouseDown.current = true;
        lastMouse.current = { x: event.clientX, y: event.clientY };
        event.preventDefault();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isMouseDown.current) {
        const deltaX = event.clientX - lastMouse.current.x;
        const deltaY = event.clientY - lastMouse.current.y;
        
        yawAngle.current -= deltaX * 0.002;
        pitchAngle.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitchAngle.current - deltaY * 0.002));
        
        lastMouse.current = { x: event.clientX, y: event.clientY };
        event.preventDefault();
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) {
        isMouseDown.current = false;
        event.preventDefault();
      }
    };

    const handleMouseLeave = () => {
      isMouseDown.current = false;
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Touch controls for mobile - only on Canvas
  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'CANVAS' && event.touches.length === 1) {
        const touch = event.touches[0];
        lastMouse.current = { x: touch.clientX, y: touch.clientY };
        isMouseDown.current = true;
        event.preventDefault();
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1 && isMouseDown.current) {
        const touch = event.touches[0];
        const deltaX = touch.clientX - lastMouse.current.x;
        const deltaY = touch.clientY - lastMouse.current.y;
        
        yawAngle.current -= deltaX * 0.003;
        pitchAngle.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitchAngle.current - deltaY * 0.003));
        
        lastMouse.current = { x: touch.clientX, y: touch.clientY };
        event.preventDefault();
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      isMouseDown.current = false;
      keys.current = { forward: false, backward: false, left: false, right: false };
      event.preventDefault();
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  useFrame((state, delta) => {
    const moveSpeed = 8;
    const acceleration = 0.12;
    const damping = 0.88;
    
    // Calculate movement direction based on camera orientation
    const forward = new Vector3(-Math.sin(yawAngle.current), 0, -Math.cos(yawAngle.current));
    const right = new Vector3(Math.cos(yawAngle.current), 0, -Math.sin(yawAngle.current));
    
    // Apply movement based on keys
    const moveVector = new Vector3();
    
    if (keys.current.forward) moveVector.add(forward);
    if (keys.current.backward) moveVector.sub(forward);
    if (keys.current.left) moveVector.sub(right);
    if (keys.current.right) moveVector.add(right);
    
    // Normalize and apply speed
    if (moveVector.length() > 0) {
      moveVector.normalize().multiplyScalar(moveSpeed);
      velocity.current.lerp(moveVector, acceleration);
    } else {
      velocity.current.multiplyScalar(damping);
    }
    
    // Update position
    targetPosition.current.add(velocity.current.clone().multiplyScalar(delta));
    
    // Update camera position and rotation
    camera.position.copy(targetPosition.current);
    camera.rotation.set(pitchAngle.current, yawAngle.current, 0, 'YXZ');
    
    // Notify parent of position changes
    onPositionChange(camera.position);
  });

  return null;
};
