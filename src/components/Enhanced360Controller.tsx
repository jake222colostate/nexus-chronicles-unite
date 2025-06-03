
import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

interface Enhanced360ControllerProps {
  position: [number, number, number];
  onPositionChange: (position: Vector3) => void;
}

interface MovementKeys {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

export const Enhanced360Controller: React.FC<Enhanced360ControllerProps> = ({
  position,
  onPositionChange
}) => {
  const { camera } = useThree();
  const keys = useRef<MovementKeys>({
    forward: false,
    backward: false,
    left: false,
    right: false
  });
  
  const yawAngle = useRef(0);
  const pitchAngle = useRef(0);
  const targetPosition = useRef(new Vector3(...position));
  const velocity = useRef(new Vector3());
  const lastNotifiedPosition = useRef(new Vector3(...position));
  const isMousePressed = useRef(false);

  // Initialize camera at proper character height
  useEffect(() => {
    targetPosition.current.set(0, 1.7, -10);
    camera.position.copy(targetPosition.current);
    lastNotifiedPosition.current.copy(targetPosition.current);
    console.log('Camera initialized at:', targetPosition.current);
  }, [camera]);

  // Keyboard event handlers with improved key detection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      console.log('Key down:', key, event.code);
      
      // Prevent default for movement keys
      if (['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        event.preventDefault();
      }
      
      switch (key) {
        case 'w':
        case 'arrowup':
          keys.current.forward = true;
          console.log('Forward movement activated');
          break;
        case 's':
        case 'arrowdown':
          keys.current.backward = true;
          console.log('Backward movement activated');
          break;
        case 'a':
        case 'arrowleft':
          keys.current.left = true;
          console.log('Left movement activated');
          break;
        case 'd':
        case 'arrowright':
          keys.current.right = true;
          console.log('Right movement activated');
          break;
      }
      
      console.log('Current keys state:', keys.current);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      console.log('Key up:', key);
      
      switch (key) {
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
      
      console.log('Keys state after release:', keys.current);
    };

    // Mouse controls with press and hold
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        isMousePressed.current = true;
        console.log('Mouse pressed for look controls');
        event.preventDefault();
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) {
        isMousePressed.current = false;
        console.log('Mouse released');
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isMousePressed.current) {
        const sensitivity = 0.002;
        yawAngle.current -= event.movementX * sensitivity;
        pitchAngle.current -= event.movementY * sensitivity;
        pitchAngle.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitchAngle.current));
        event.preventDefault();
      }
    };

    // Add event listeners to window for better key capture
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    console.log('Enhanced360Controller event listeners attached to window');

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('contextmenu', (e) => e.preventDefault());
    };
  }, []);

  useFrame((state, delta) => {
    const moveSpeed = 15;
    const acceleration = 0.2;
    const damping = 0.8;
    
    // Calculate movement direction
    const forward = new Vector3(-Math.sin(yawAngle.current), 0, -Math.cos(yawAngle.current));
    const right = new Vector3(Math.cos(yawAngle.current), 0, -Math.sin(yawAngle.current));
    
    // Apply movement
    const moveVector = new Vector3();
    let isMoving = false;
    
    // Check each movement direction
    if (keys.current.forward) {
      moveVector.add(forward);
      isMoving = true;
      console.log('Moving forward');
    }
    if (keys.current.backward) {
      moveVector.sub(forward);
      isMoving = true;
      console.log('Moving backward');
    }
    if (keys.current.left) {
      moveVector.sub(right);
      isMoving = true;
      console.log('Moving left');
    }
    if (keys.current.right) {
      moveVector.add(right);
      isMoving = true;
      console.log('Moving right');
    }
    
    // Apply velocity and movement
    if (moveVector.length() > 0) {
      moveVector.normalize().multiplyScalar(moveSpeed);
      velocity.current.lerp(moveVector, acceleration);
      console.log('Movement vector applied:', moveVector, 'Velocity:', velocity.current);
    } else {
      velocity.current.multiplyScalar(damping);
    }
    
    // Update position with mountain collision bounds
    const oldPosition = targetPosition.current.clone();
    targetPosition.current.add(velocity.current.clone().multiplyScalar(delta));
    
    // Strict mountain collision - keep player within the path corridor
    targetPosition.current.x = Math.max(-15, Math.min(15, targetPosition.current.x));
    targetPosition.current.y = 1.7; // Fixed character height
    
    // Update camera
    camera.position.copy(targetPosition.current);
    camera.rotation.set(pitchAngle.current, yawAngle.current, 0, 'YXZ');
    
    // Log movement details for debugging
    if (isMoving || velocity.current.length() > 0.01) {
      console.log('Frame update:', {
        isMoving,
        keys: keys.current,
        velocity: velocity.current.length(),
        position: targetPosition.current,
        deltaTime: delta
      });
    }
    
    // Only notify on significant position changes to prevent infinite updates
    const distanceMoved = targetPosition.current.distanceTo(lastNotifiedPosition.current);
    if (distanceMoved > 0.1) {
      lastNotifiedPosition.current.copy(targetPosition.current);
      onPositionChange(targetPosition.current.clone());
      console.log('Position change notified:', targetPosition.current);
    }
  });

  return null;
};
