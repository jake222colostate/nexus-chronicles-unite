
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
  const targetPosition = useRef(new Vector3());
  const velocity = useRef(new Vector3());
  const lastNotifiedPosition = useRef(new Vector3());
  const isMousePressed = useRef(false);
  const lastNotificationTime = useRef(0);

  // Initialize camera at guaranteed safe valley center position - ignore passed position
  useEffect(() => {
    // Force safe valley center position regardless of props
    const safePosition = new Vector3(0, 2, 20); // Start even further back for absolute safety
    targetPosition.current.copy(safePosition);
    camera.position.copy(safePosition);
    camera.lookAt(0, 1, 0); // Look at ground level ahead
    lastNotifiedPosition.current.copy(safePosition);
    console.log('Camera force-initialized at absolute safe valley center:', safePosition);
  }, [camera]);

  // Keyboard event handlers with improved key detection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      // Prevent default for movement keys
      if (['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        event.preventDefault();
      }
      
      switch (key) {
        case 'w':
        case 'arrowup':
          if (!keys.current.forward) {
            keys.current.forward = true;
            console.log('Forward movement activated');
          }
          break;
        case 's':
        case 'arrowdown':
          if (!keys.current.backward) {
            keys.current.backward = true;
            console.log('Backward movement activated');
          }
          break;
        case 'a':
        case 'arrowleft':
          if (!keys.current.left) {
            keys.current.left = true;
            console.log('Left movement activated');
          }
          break;
        case 'd':
        case 'arrowright':
          if (!keys.current.right) {
            keys.current.right = true;
            console.log('Right movement activated');
          }
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
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
    };

    // Mouse controls with press and hold
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        isMousePressed.current = true;
        event.preventDefault();
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) {
        isMousePressed.current = false;
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
    }
    if (keys.current.backward) {
      moveVector.sub(forward);
      isMoving = true;
    }
    if (keys.current.left) {
      moveVector.sub(right);
      isMoving = true;
    }
    if (keys.current.right) {
      moveVector.add(right);
      isMoving = true;
    }
    
    // Apply velocity and movement
    if (moveVector.length() > 0) {
      moveVector.normalize().multiplyScalar(moveSpeed);
      velocity.current.lerp(moveVector, acceleration);
    } else {
      velocity.current.multiplyScalar(damping);
    }
    
    // Update position with very wide valley bounds
    targetPosition.current.add(velocity.current.clone().multiplyScalar(delta));
    
    // Much wider movement bounds - mountains are now at ±120, so allow ±80 for safety
    targetPosition.current.x = Math.max(-80, Math.min(80, targetPosition.current.x));
    targetPosition.current.y = 2; // Fixed character height
    
    // Update camera
    camera.position.copy(targetPosition.current);
    camera.rotation.set(pitchAngle.current, yawAngle.current, 0, 'YXZ');
    
    // Only notify on significant position changes and throttle notifications heavily to prevent loops
    const now = Date.now();
    const distanceMoved = targetPosition.current.distanceTo(lastNotifiedPosition.current);
    const timeSinceLastNotification = now - lastNotificationTime.current;
    
    // Heavy throttling to prevent infinite updates - only update every 500ms and when moved significantly
    if (distanceMoved > 5.0 && timeSinceLastNotification > 500) {
      lastNotifiedPosition.current.copy(targetPosition.current);
      lastNotificationTime.current = now;
      onPositionChange(targetPosition.current.clone());
    }
  });

  return null;
};
