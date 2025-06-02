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

  // Initialize camera
  useEffect(() => {
    targetPosition.current.set(...position);
    camera.position.copy(targetPosition.current);
    lastNotifiedPosition.current.copy(targetPosition.current);
  }, [camera, position]);

  // Keyboard event handlers
  useEffect(() => {
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

    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement === document.body) {
        const sensitivity = 0.002;
        yawAngle.current -= event.movementX * sensitivity;
        pitchAngle.current -= event.movementY * sensitivity;
        pitchAngle.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitchAngle.current));
      }
    };

    const handleClick = () => {
      document.body.requestPointerLock();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
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
    if (keys.current.forward) moveVector.add(forward);
    if (keys.current.backward) moveVector.sub(forward);
    if (keys.current.left) moveVector.sub(right);
    if (keys.current.right) moveVector.add(right);
    
    if (moveVector.length() > 0) {
      moveVector.normalize().multiplyScalar(moveSpeed);
      velocity.current.lerp(moveVector, acceleration);
    } else {
      velocity.current.multiplyScalar(damping);
    }
    
    // Update position with collision bounds
    targetPosition.current.add(velocity.current.clone().multiplyScalar(delta));
    
    // Boundary collision (keep player between mountains)
    targetPosition.current.x = Math.max(-20, Math.min(20, targetPosition.current.x));
    targetPosition.current.y = Math.max(1.5, Math.min(8, targetPosition.current.y));
    
    // Update camera
    camera.position.copy(targetPosition.current);
    camera.rotation.set(pitchAngle.current, yawAngle.current, 0, 'YXZ');
    
    // Only notify on significant position changes to prevent infinite updates
    const distanceMoved = targetPosition.current.distanceTo(lastNotifiedPosition.current);
    if (distanceMoved > 0.1) {
      lastNotifiedPosition.current.copy(targetPosition.current);
      onPositionChange(targetPosition.current.clone());
    }
  });

  return null;
};
