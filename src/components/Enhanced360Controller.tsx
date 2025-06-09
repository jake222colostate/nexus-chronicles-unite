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
  const frameCount = useRef(0);

  // Initialize camera at guaranteed safe valley center position
  useEffect(() => {
    const safePosition = new Vector3(0, 2, 20);
    targetPosition.current.copy(safePosition);
    camera.position.copy(safePosition);
    camera.lookAt(0, 1, 0);
    lastNotifiedPosition.current.copy(safePosition);
    console.log('Camera initialized at safe valley center:', safePosition);
  }, [camera]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
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
    frameCount.current++;
    
    const moveSpeed = 15;
    const acceleration = 0.2;
    const damping = 0.8;
    
    // Calculate movement direction
    const forward = new Vector3(-Math.sin(yawAngle.current), 0, -Math.cos(yawAngle.current));
    const right = new Vector3(Math.cos(yawAngle.current), 0, -Math.sin(yawAngle.current));
    
    // Apply movement
    const moveVector = new Vector3();
    let isMoving = false;
    
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
    
    // Update position with wide valley bounds
    targetPosition.current.add(velocity.current.clone().multiplyScalar(delta));
    
    // Keep within valley bounds (mountains are at ±120, so allow ±100 for extra safety)
    targetPosition.current.x = Math.max(-100, Math.min(100, targetPosition.current.x));
    targetPosition.current.y = 2; // Fixed character height
    
    // Update camera
    camera.position.copy(targetPosition.current);
    camera.rotation.set(pitchAngle.current, yawAngle.current, 0, 'YXZ');
    
    // Notify position changes less frequently but more responsive than before
    const distanceMoved = targetPosition.current.distanceTo(lastNotifiedPosition.current);
    
    // Notify every 30 frames (roughly every 0.5 seconds at 60fps) OR when moved significantly
    if ((frameCount.current % 30 === 0 && distanceMoved > 0.1) || distanceMoved > 10) {
      lastNotifiedPosition.current.copy(targetPosition.current);
      onPositionChange(targetPosition.current.clone());
      console.log('Camera position updated:', targetPosition.current);
    }
    
    if (isMoving && frameCount.current % 60 === 0) {
      console.log('Player moving at position:', targetPosition.current);
    }
  });

  return null;
};
