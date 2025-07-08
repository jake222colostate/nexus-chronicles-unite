import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

interface NexusFirstPersonControllerProps {
  speed?: number;
  sensitivity?: number;
}

export const NexusFirstPersonController: React.FC<NexusFirstPersonControllerProps> = ({
  speed = 5,
  sensitivity = 0.002
}) => {
  const { camera } = useThree();
  const velocity = useRef(new Vector3());
  const direction = useRef(new Vector3());
  const euler = useRef(new Vector3());
  
  // Movement keys state
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  });
  
  // Mouse look state
  const isLocked = useRef(false);
  const yaw = useRef(0);
  const pitch = useRef(0);

  useEffect(() => {
    // Initialize camera position
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 2, 0);
    
    // Keyboard controls
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
      }
    };

    // Mouse look controls
    const handleMouseMove = (event: MouseEvent) => {
      if (!isLocked.current) return;
      
      yaw.current -= event.movementX * sensitivity;
      pitch.current -= event.movementY * sensitivity;
      
      // Clamp pitch to prevent over-rotation
      pitch.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch.current));
    };

    // Touch controls for mobile
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        isLocked.current = true;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isLocked.current || event.touches.length !== 1) return;
      
      const touch = event.touches[0];
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const deltaX = (touch.clientX - rect.left - centerX) * 0.01;
      const deltaY = (touch.clientY - rect.top - centerY) * 0.01;
      
      yaw.current -= deltaX;
      pitch.current -= deltaY;
      
      pitch.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch.current));
    };

    const handleTouchEnd = () => {
      isLocked.current = false;
    };

    // Click to enable mouse look
    const handleCanvasClick = () => {
      isLocked.current = !isLocked.current;
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('click', handleCanvasClick);
      canvas.addEventListener('touchstart', handleTouchStart);
      canvas.addEventListener('touchmove', handleTouchMove);
      canvas.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (canvas) {
        canvas.removeEventListener('click', handleCanvasClick);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [sensitivity]);

  useFrame((state, delta) => {
    // Calculate movement direction based on camera orientation
    direction.current.set(0, 0, 0);
    
    if (keys.current.forward) direction.current.z -= 1;
    if (keys.current.backward) direction.current.z += 1;
    if (keys.current.left) direction.current.x -= 1;
    if (keys.current.right) direction.current.x += 1;
    
    // Normalize direction
    if (direction.current.length() > 0) {
      direction.current.normalize();
    }
    
    // Apply only yaw rotation to movement direction (no pitch affects movement)
    direction.current.applyAxisAngle(new Vector3(0, 1, 0), yaw.current);
    
    // Update velocity with movement
    velocity.current.lerp(direction.current.multiplyScalar(speed), 0.1);
    
    // Apply movement to camera
    camera.position.add(velocity.current.clone().multiplyScalar(delta));
    
    // Keep camera above ground
    camera.position.y = Math.max(1.5, camera.position.y);
    
    // Apply rotation to camera using lookAt for proper orientation
    const lookDirection = new Vector3(
      Math.sin(yaw.current) * Math.cos(pitch.current),
      Math.sin(pitch.current),
      Math.cos(yaw.current) * Math.cos(pitch.current)
    );
    
    const target = camera.position.clone().add(lookDirection);
    camera.lookAt(target);
    
    // Ensure camera up vector is always pointing up (prevents tilting)
    camera.up.set(0, 1, 0);
  });

  return null;
};
