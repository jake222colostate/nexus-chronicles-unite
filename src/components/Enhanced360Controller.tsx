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

  // Initialize camera at lower position
  useEffect(() => {
    targetPosition.current.set(0, 2, 12); // Lowered from y: 5 to y: 2
    camera.position.copy(targetPosition.current);
  }, [camera]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse look controls
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        isMouseDown.current = true;
        lastMouse.current = { x: event.clientX, y: event.clientY };
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isMouseDown.current) {
        const deltaX = event.clientX - lastMouse.current.x;
        const deltaY = event.clientY - lastMouse.current.y;
        
        yawAngle.current -= deltaX * 0.002;
        pitchAngle.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitchAngle.current - deltaY * 0.002));
        
        lastMouse.current = { x: event.clientX, y: event.clientY };
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

  // Touch controls for mobile
  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        lastMouse.current = { x: touch.clientX, y: touch.clientY };
        isMouseDown.current = true;
      } else if (event.touches.length === 2) {
        // Two finger touch for movement
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        
        if (touch1.clientY < rect.height * 0.5) {
          keys.current.forward = true;
        }
        if (touch1.clientX < rect.width * 0.5) {
          keys.current.left = true;
        } else {
          keys.current.right = true;
        }
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
      }
    };

    const handleTouchEnd = () => {
      isMouseDown.current = false;
      keys.current = { forward: false, backward: false, left: false, right: false };
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
      canvas.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, []);

  useFrame((state, delta) => {
    const moveSpeed = 12;
    const acceleration = 0.15;
    const damping = 0.85;
    
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
    
    // Keep camera at reasonable height above ground
    targetPosition.current.y = Math.max(1.5, Math.min(4, targetPosition.current.y));
    
    // Update camera position and rotation
    camera.position.copy(targetPosition.current);
    camera.rotation.set(pitchAngle.current, yawAngle.current, 0, 'YXZ');
    
    // Notify parent of position changes
    onPositionChange(camera.position);
  });

  return null;
};
